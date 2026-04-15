import { useEffect, useRef, useState } from 'react';
import casePins from '../../data/ufosint/case-pins.json';

/* ── Constants ──────────────────────────────────────────────────────────── */

// Zoom level at which the map switches from heatmap to individual sighting pins
const PIN_MODE_ZOOM = 9;

/* ── Types ──────────────────────────────────────────────────────────── */

interface HexCell {
  lat: number;
  lng: number;
  cnt: number;
}

interface HexBinData {
  cells: HexCell[];
}

interface CasePin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  total: number;
}

/* ── Helpers ────────────────────────────────────────────────────────── */

function zoomTier(z: number): 3 | 4 | 5 {
  if (z < 5) return 3;
  if (z < 7) return 4;
  return 5;
}

/**
 * Compute heatmap radius + blur so adjacent hexbin cells always blend
 * into a continuous surface regardless of zoom level.
 *
 * leaflet.heat uses fixed pixel radii, but hexbin cell spacing in pixels
 * grows as 2^zoom. At z4+ a static radius=28 is far too small to bridge
 * the pixel gap between cell centers, producing a visible grid of dots.
 *
 * Formula: radius = cellDegrees × (256 × 2^zoom / 360) × 0.65
 *   → covers ~65% of the half-spacing, ensuring full overlap at all zooms.
 */
function calcHeatRadius(zoom: number, tier: 3 | 4 | 5): { radius: number; blur: number } {
  const cellDeg = tier === 3 ? 7.5 : tier === 4 ? 3.5 : 1.5;
  const pxPerDeg = (256 * Math.pow(2, zoom)) / 360;
  const radius = Math.max(Math.ceil(cellDeg * pxPerDeg * 0.65), 20);
  const blur   = Math.ceil(radius * 0.75);
  return { radius, blur };
}

async function fetchHexbins(zoom: 3 | 4 | 5): Promise<HexCell[]> {
  const res = await fetch(`/api/sightings/hexbin?zoom=${zoom}`);
  if (!res.ok) throw new Error('hexbin fetch failed');
  const data: HexBinData = await res.json();
  return data.cells ?? [];
}

/* ── Component ──────────────────────────────────────────────────────── */

export default function SightingsMapInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const heatRef = useRef<any>(null);
  const tierRef = useRef<3 | 4 | 5>(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [activeTier, setActiveTier] = useState<3 | 4 | 5>(3);
  const [pinMode, setPinMode] = useState(false);
  const [pinCount, setPinCount] = useState<number | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const viewportMarkersRef = useRef<any[]>([]);
  const viewportAbortRef = useRef<AbortController | null>(null);
  const lastViewportKeyRef = useRef<string>('');

  useEffect(() => {
    if (!containerRef.current) return;
    let destroyed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let map: any;

    (async () => {
      try {
        /* Dynamic imports — Leaflet requires window/document */
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');

        /* leaflet.heat patches L onto window first */
        (window as typeof window & { L: typeof L }).L = L;
        await import('leaflet.heat');

        if (destroyed || !containerRef.current) return;

        /* Fix broken default icon paths (Next.js asset pipeline) */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        /* Create map — maxBounds prevents antimeridian seam artifact */
        map = L.map(containerRef.current, {
          center: [38, -40],
          zoom: 3,
          minZoom: 2,
          maxZoom: 10,
          zoomSnap: 0.5,
          maxBounds: [[-85, -179.9], [85, 179.9]],
          maxBoundsViscosity: 1.0,
        });
        mapRef.current = map;

        /* Geography pane below overlayPane (400) so heatmap renders on top */
        const geoPane = map.createPane('geoPane');
        geoPane.style.zIndex = '350';

        /* Case pane above heatmap (overlayPane=400) and above markerPane (600)
           so DECUR pins are always visible regardless of zoom or layer state */
        const casePane = map.createPane('casePane');
        casePane.style.zIndex = '650';
        casePane.style.pointerEvents = 'auto';

        /* Local geography — no external CDN, same world-110m.json as Explore map */
        const topoModule = await import('topojson-client');
        const topoRes = await fetch('/world-110m.json');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const topo = await topoRes.json() as any;

        // Layer 1: filled country polygons, NO stroke (stroke=none eliminates polar boundary streak)
        const countries = topoModule.feature(topo, topo.objects.countries);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        L.geoJSON(countries as any, {
          pane: 'geoPane',
          style: {
            fillColor: '#1e293b',
            fillOpacity: 1,
            color: 'none',  // no outer boundary line — prevents antimeridian/polar streak
            weight: 0,
          },
        }).addTo(map);

        // Layer 2: interior country borders only (mesh filters exterior world edge out)
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const borders = topoModule.mesh(topo, topo.objects.countries, (a: any, b: any) => a !== b);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        L.geoJSON(borders as any, {
          pane: 'geoPane',
          style: {
            fill: false,
            color: '#475569',
            weight: 0.6,
            opacity: 0.8,
          },
        }).addTo(map);

        /* Load initial hexbins and add heat layer */
        const cells = await fetchHexbins(3);
        if (destroyed) return;

        const maxCnt = Math.max(...cells.map((c) => c.cnt), 1);
        // Log transform: spreads intensity evenly so low-density cells are visible too.
        // Sqrt compressed 90% of cells below the visible threshold; log makes all 671 cells show.
        const logMax = Math.log(maxCnt + 1);
        const heatPoints = cells.map(
          (c) => [c.lat, c.lng, Math.log(c.cnt + 1) / logMax] as [number, number, number]
        );

        // Initial radius computed for z=3, tier=3 — updated dynamically on every zoom
        const { radius: initRadius, blur: initBlur } = calcHeatRadius(3, 3);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const heat = (L as any).heatLayer(heatPoints, {
          radius: initRadius,
          blur: initBlur,
          maxZoom: 5,
          max: 1.0,
          gradient: {
            0.0:  'rgba(0,0,0,0)',            // transparent below noise floor
            0.05: 'rgba(253,224,71,0.25)',    // faint yellow — any activity present
            0.2:  'rgba(253,224,71,0.85)',    // solid yellow
            0.45: 'rgba(249,115,22,0.9)',     // orange
            0.75: 'rgba(220,38,38,0.95)',     // red
            1.0:  '#ffffff',                  // white hotspot (highest density)
          },
          minOpacity: 0.0,
        });
        heat.addTo(map);
        heatRef.current = heat;
        setLoading(false);

        /* DECUR case pins — larger and rendered in casePane (z=650) so they are
           always visible above the heatmap at any zoom level */
        const caseIcon = L.divIcon({
          className: '',
          html: `<div style="
            width:14px;height:14px;border-radius:50%;
            background:#f59e0b;border:2.5px solid #fff;
            box-shadow:0 0 0 2px rgba(245,158,11,0.5),0 0 10px rgba(245,158,11,0.9);
          "></div>`,
          iconSize: [14, 14],
          iconAnchor: [7, 7],
          popupAnchor: [0, -10],
        });

        (casePins as CasePin[]).forEach((pin) => {
          const marker = L.marker([pin.lat, pin.lng], { icon: caseIcon, pane: 'casePane' });
          const nearbyText =
            pin.total >= 1000
              ? `~${(pin.total / 1000).toFixed(1)}k`
              : pin.total.toLocaleString();
          marker.bindPopup(
            `<div style="font-family:system-ui;min-width:180px;">
              <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:#111;">${pin.name}</div>
              <div style="font-size:12px;color:#666;">DECUR documented case</div>
              <div style="margin-top:8px;padding-top:8px;border-top:1px solid #e5e7eb;font-size:12px;">
                <span style="color:#92400e;font-weight:600;">${nearbyText}</span>
                <span style="color:#999;"> community reports nearby</span>
              </div>
              <a href="/cases/${pin.id}" style="display:inline-block;margin-top:6px;font-size:11px;color:#6366f1;text-decoration:none;">
                View case &rarr;
              </a>
            </div>`,
            { maxWidth: 220 }
          );
          marker.addTo(map);
        });

        /* ── Viewport sighting pins — always shown at every zoom level ── */

        // Build the sighting icon once; reused across all viewport fetches
        const sightingIcon = L.divIcon({
          className: '',
          html: `<div style="
            width:7px;height:7px;border-radius:50%;
            background:#22d3ee;border:1px solid rgba(255,255,255,0.5);
            box-shadow:0 0 4px rgba(34,211,238,0.5);
          "></div>`,
          iconSize: [7, 7],
          iconAnchor: [3.5, 3.5],
          popupAnchor: [0, -6],
        });

        const renderViewport = async () => {
          if (destroyed) return;
          const z = map.getZoom();

          // ── Heatmap visibility: shown at low zoom, hidden when zoomed in ──
          if (z >= PIN_MODE_ZOOM) {
            if (heatRef.current && map.hasLayer(heatRef.current)) {
              map.removeLayer(heatRef.current);
            }
            setPinMode(true);
          } else {
            if (heatRef.current && !map.hasLayer(heatRef.current)) {
              heatRef.current.addTo(map);
            }
            setPinMode(false);

            const tier = zoomTier(z);

            // Always recompute radius/blur — cell spacing in pixels doubles each
            // zoom step, so a fixed radius produces visible dot-grid artifacts at
            // z4+. setOptions triggers an internal redraw in leaflet.heat.
            const { radius, blur } = calcHeatRadius(z, tier);
            heatRef.current?.setOptions({ radius, blur });

            // Swap hexbin data when crossing a tier boundary
            if (tier !== tierRef.current) {
              tierRef.current = tier;
              setActiveTier(tier);
              try {
                const newCells = await fetchHexbins(tier);
                if (destroyed) return;
                const newMax = Math.max(...newCells.map((c) => c.cnt), 1);
                const newLogMax = Math.log(newMax + 1);
                const newPoints = newCells.map(
                  (c) => [c.lat, c.lng, Math.log(c.cnt + 1) / newLogMax] as [number, number, number]
                );
                heatRef.current?.setLatLngs(newPoints);
              } catch { /* keep existing layer on fetch failure */ }
            }
          }

          // ── Viewport pins: always fetch regardless of zoom ────────────
          // At world zoom the bbox covers ~the whole globe → returns top 300
          // quality sightings globally. As you zoom in it fetches local area.
          const bounds = map.getBounds();
          const n = bounds.getNorth();
          const s = bounds.getSouth();
          const e = bounds.getEast();
          const w = bounds.getWest();
          const viewKey = `${n.toFixed(3)},${s.toFixed(3)},${e.toFixed(3)},${w.toFixed(3)}`;
          if (viewKey === lastViewportKeyRef.current) return; // viewport unchanged
          lastViewportKeyRef.current = viewKey;

          viewportAbortRef.current?.abort();
          viewportAbortRef.current = new AbortController();

          setPinLoading(true);
          try {
            const res = await fetch(
              `/api/sightings/viewport?n=${n}&s=${s}&e=${e}&w=${w}&limit=300`,
              { signal: viewportAbortRef.current.signal }
            );
            if (!res.ok) throw new Error(`viewport ${res.status}`);
            const { sightings } = await res.json() as { sightings: Array<{
              id: number; date: string | null; shape: string | null;
              standardized_shape: string | null; source: string;
              city: string | null; state: string | null; country: string | null;
              lat: number; lng: number; quality_score: number | null;
              hynek: string | null; duration: string | null; witnesses: number | null;
            }> };

            if (destroyed) return;

            // Replace old viewport markers with fresh set
            viewportMarkersRef.current.forEach(m => m.remove());
            viewportMarkersRef.current = [];

            for (const sg of sightings) {
              const shapeLabel = sg.standardized_shape || sg.shape || 'Unknown shape';
              const location = [sg.city, sg.state, sg.country].filter(Boolean).join(', ') || 'Unknown location';
              const dateStr = sg.date ? sg.date.substring(0, 10) : 'Unknown date';
              const marker = L.marker([sg.lat, sg.lng], { icon: sightingIcon });
              marker.bindPopup(
                `<div style="font-family:system-ui;min-width:160px;max-width:200px;">
                  <div style="font-weight:700;font-size:13px;margin-bottom:2px;color:#111;">${shapeLabel}</div>
                  <div style="font-size:11px;color:#555;">${location}</div>
                  <div style="font-size:11px;color:#888;margin-top:2px;">${dateStr}</div>
                  ${sg.hynek ? `<div style="font-size:11px;margin-top:4px;color:#7c3aed;font-weight:600;">Hynek: ${sg.hynek}</div>` : ''}
                  ${sg.duration ? `<div style="font-size:11px;color:#888;">Duration: ${sg.duration}</div>` : ''}
                  ${sg.witnesses != null ? `<div style="font-size:11px;color:#888;">Witnesses: ${sg.witnesses}</div>` : ''}
                  <div style="margin-top:6px;padding-top:6px;border-top:1px solid #e5e7eb;font-size:10px;color:#aaa;">
                    ${sg.source}${sg.quality_score != null ? ` · Q${sg.quality_score}` : ''}
                  </div>
                </div>`,
                { maxWidth: 210 }
              );
              marker.addTo(map);
              viewportMarkersRef.current.push(marker);
            }

            setPinCount(sightings.length);
          } catch (err) {
            if ((err as Error).name !== 'AbortError') {
              console.error('Viewport fetch error:', err);
            }
          } finally {
            if (!destroyed) setPinLoading(false);
          }
        };

        /* Zoom + pan listeners */
        map.on('zoomend', renderViewport);
        map.on('moveend', renderViewport);

        /* Initial load — show pins immediately without waiting for user interaction */
        renderViewport();
      } catch (err) {
        console.error('SightingsMap init error:', err);
        if (!destroyed) setError(true);
      }
    })();

    return () => {
      destroyed = true;
      viewportAbortRef.current?.abort();
      viewportMarkersRef.current.forEach(m => m.remove());
      viewportMarkersRef.current = [];
      map?.remove();
      mapRef.current = null;
      heatRef.current = null;
    };
  }, []);

  return (
    <div className="sightings-map relative isolate rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Map container - ocean color, land drawn via local GeoJSON */}
      <div ref={containerRef} style={{ height: 480, width: '100%', background: '#0f172a' }} />

      {/* Loading overlay */}
      {loading && !error && (
        <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center gap-3 z-[400]">
          <svg
            className="w-6 h-6 animate-spin text-amber-400"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <p className="text-sm text-gray-300">Loading 614k sighting records...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center z-[400]">
          <p className="text-sm text-gray-400">Map unavailable - check network connection</p>
        </div>
      )}

      {/* Legend */}
      {!loading && !error && (
        <div className="absolute bottom-3 left-3 z-[400] bg-gray-900/85 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2 space-y-1.5">
          <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Legend</p>
          {/* Heatmap gradient — visible at low zoom when heatmap is active */}
          {!pinMode && (
            <div className="flex items-center gap-2">
              <div
                style={{
                  width: 40,
                  height: 8,
                  borderRadius: 4,
                  background: 'linear-gradient(to right, rgba(253,224,71,0.3), #fde047, #f97316, #dc2626, #fff)',
                }}
              />
              <span className="text-xs text-gray-400">Sighting density</span>
            </div>
          )}
          {/* Cyan sighting pins — always visible at every zoom level */}
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 9,
                height: 9,
                borderRadius: '50%',
                background: '#22d3ee',
                border: '1px solid rgba(255,255,255,0.5)',
                boxShadow: '0 0 4px rgba(34,211,238,0.5)',
                flexShrink: 0,
              }}
            />
            <span className="text-xs text-gray-400">
              {pinLoading
                ? 'Loading reports...'
                : pinCount != null
                  ? `${pinCount} sightings in view`
                  : 'Community sightings'}
            </span>
          </div>
          {/* Amber DECUR case pins — always visible at every zoom level */}
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: '#f59e0b',
                border: '2.5px solid #fff',
                boxShadow: '0 0 0 2px rgba(245,158,11,0.5),0 0 8px rgba(245,158,11,0.9)',
                flexShrink: 0,
              }}
            />
            <span className="text-xs text-gray-300 font-medium">DECUR documented case</span>
          </div>
        </div>
      )}

      {/* Zoom tier badge */}
      {!loading && !error && (
        <div className="absolute top-3 right-3 z-[400] bg-gray-900/75 backdrop-blur-sm border border-gray-700 rounded-md px-2 py-1">
          <span className="text-xs text-gray-400 font-mono">
            resolution: z{activeTier}
          </span>
        </div>
      )}
    </div>
  );
}
