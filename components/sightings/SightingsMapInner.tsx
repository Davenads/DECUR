import { useEffect, useRef, useState } from 'react';
import casePins from '../../data/ufosint/case-pins.json';

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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const heat = (L as any).heatLayer(heatPoints, {
          radius: 18,
          blur: 14,
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

        /* DECUR case pins */
        const caseIcon = L.divIcon({
          className: '',
          html: `<div style="
            width:10px;height:10px;border-radius:50%;
            background:#f59e0b;border:2px solid #fff;
            box-shadow:0 0 6px rgba(245,158,11,0.8);
          "></div>`,
          iconSize: [10, 10],
          iconAnchor: [5, 5],
          popupAnchor: [0, -8],
        });

        (casePins as CasePin[]).forEach((pin) => {
          const marker = L.marker([pin.lat, pin.lng], { icon: caseIcon });
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

        /* Zoom listener - swap hexbin tier */
        map.on('zoomend', async () => {
          const z = map.getZoom();
          const tier = zoomTier(z);
          if (tier === tierRef.current) return;
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
          } catch {
            /* keep existing layer on fetch failure */
          }
        });
      } catch (err) {
        console.error('SightingsMap init error:', err);
        if (!destroyed) setError(true);
      }
    })();

    return () => {
      destroyed = true;
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
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 40,
                height: 8,
                borderRadius: 4,
                background: 'linear-gradient(to right, #1a6b8a, #f59e0b, #ef4444, #fff)',
              }}
            />
            <span className="text-xs text-gray-400">Sighting density</span>
          </div>
          <div className="flex items-center gap-2">
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#f59e0b',
                border: '2px solid #fff',
                boxShadow: '0 0 4px rgba(245,158,11,0.8)',
                flexShrink: 0,
              }}
            />
            <span className="text-xs text-gray-400">DECUR documented case</span>
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
