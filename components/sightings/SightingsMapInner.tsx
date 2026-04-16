import { useEffect, useRef, useState } from 'react';
import casePins from '../../data/ufosint/case-pins.json';

/* ── Constants ──────────────────────────────────────────────────────────── */

// Viewport pin cap — returned by /api/sightings/viewport
const VIEWPORT_LIMIT = 500;

/* ── Types ──────────────────────────────────────────────────────────── */

interface CasePin {
  id: string;
  name: string;
  lat: number;
  lng: number;
  total: number;
}

/* ── Component ──────────────────────────────────────────────────────── */

export default function SightingsMapInner() {
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
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

        if (destroyed || !containerRef.current) return;

        /* Fix broken default icon paths (Next.js asset pipeline) */
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
          iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
          shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
        });

        /* Create map */
        map = L.map(containerRef.current, {
          center: [38, -40],
          zoom: 3,
          minZoom: 2,
          maxZoom: 10,
          zoomSnap: 0.5,
          maxBounds: [[-85, -179.9], [85, 179.9]],
          maxBoundsViscosity: 1.0,
          renderer: L.canvas({ padding: 0.5 }),
        });
        mapRef.current = map;

        /* Geography pane — sits below overlayPane (z=400) */
        const geoPane = map.createPane('geoPane');
        geoPane.style.zIndex = '350';

        /* Case pane — above markerPane (z=600) so DECUR pins are always visible */
        const casePane = map.createPane('casePane');
        casePane.style.zIndex = '650';
        casePane.style.pointerEvents = 'auto';

        /* ── Viewport sighting pins ──────────────────────────────────── */

        // Canvas renderer: all markers share one <canvas> — zero DOM nodes per marker.
        const pinRenderer = L.canvas({ padding: 0.5 });

        const renderViewport = async () => {
          if (destroyed) return;

          const bounds = map.getBounds();
          const n = bounds.getNorth();
          const s = bounds.getSouth();
          const e = bounds.getEast();
          const w = bounds.getWest();
          // Round to 3 decimal places (~110m resolution) — avoids re-fetching for
          // tiny sub-pixel pans that produce no meaningful change in visible sightings.
          const viewKey = `${n.toFixed(3)},${s.toFixed(3)},${e.toFixed(3)},${w.toFixed(3)}`;
          if (viewKey === lastViewportKeyRef.current) return;
          lastViewportKeyRef.current = viewKey;

          viewportAbortRef.current?.abort();
          viewportAbortRef.current = new AbortController();

          setPinLoading(true);
          try {
            const res = await fetch(
              `/api/sightings/viewport?n=${n}&s=${s}&e=${e}&w=${w}&limit=${VIEWPORT_LIMIT}`,
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

            viewportMarkersRef.current.forEach(m => m.remove());
            viewportMarkersRef.current = [];

            for (const sg of sightings) {
              const shapeLabel = sg.standardized_shape || sg.shape || 'Unknown shape';
              const location = [sg.city, sg.state, sg.country].filter(Boolean).join(', ') || 'Unknown location';
              const dateStr = sg.date ? sg.date.substring(0, 10) : 'Unknown date';
              const marker = L.circleMarker([sg.lat, sg.lng], {
                renderer: pinRenderer,
                radius: 4,
                fillColor: '#22d3ee',
                color: 'rgba(255,255,255,0.4)',
                weight: 1,
                fillOpacity: 0.9,
                opacity: 0.7,
              });
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

        map.on('zoomend', renderViewport);
        map.on('moveend', renderViewport);

        // Kick off the viewport fetch IMMEDIATELY in parallel with the TopoJSON
        // fetch below. The pins will appear as soon as the API responds, regardless
        // of how long the geography fetch takes. At z=3 the API query is cached by
        // the CDN so subsequent page loads return almost immediately.
        renderViewport();

        /* ── Geography ───────────────────────────────────────────────── */
        //
        // We use topo.objects.land (the single merged landmass polygon) rather than
        // topo.objects.countries (241 individual country polygons).
        //
        // WHY: when rendering 241 separate SVG <path> elements, each path has
        // independent anti-aliasing at its edges. Two adjacent paths sharing an arc
        // (e.g. US and Canada both reference the 49th-parallel arc) are rasterised
        // independently, and the browser can leave a 1-2px gap between them that
        // reveals the darker ocean background as a horizontal line.
        //
        // The merged land polygon has ONLY outer coastline edges — no internal country
        // boundaries exist in the SVG path. Zero inner-boundary seam artifacts are
        // possible by construction.
        //
        // shape-rendering: crispEdges (applied post-render to the SVG element)
        // disables browser anti-aliasing on the SVG paths. This snaps every edge to
        // the nearest pixel grid line, ensuring no sub-pixel bleed at any boundary.
        // Combined with the single-polygon approach, this eliminates all artifact classes.
        const svgRenderer = L.svg({ pane: 'geoPane' });
        const topoModule = await import('topojson-client');
        const topoRes = await fetch('/world-110m.json');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const topo = await topoRes.json() as any;

        if (destroyed) return;

        // Use the merged land object — single polygon, no internal country boundaries
        const landObj = topo.objects.land ?? topo.objects.countries;
        const land = topoModule.feature(topo, landObj);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (L.geoJSON as any)(land, {
          pane: 'geoPane',
          renderer: svgRenderer,
          // smoothFactor: 0 prevents Leaflet from simplifying path vertices.
          // Simplification of a perfectly-horizontal arc (like a bbox boundary at
          // a round latitude) can reduce it to 2 points, creating a single straight
          // SVG segment that anti-aliases differently than the un-simplified version.
          smoothFactor: 0,
          style: {
            fillColor: '#1e293b',
            fillOpacity: 1,
            color: 'none',
            weight: 0,
          },
        }).addTo(map);

        // Apply crispEdges to the SVG element so path edges snap to exact pixel
        // boundaries. This eliminates any residual anti-aliasing bleed at the coastline.
        const svgEl = geoPane.querySelector('svg') as SVGElement | null;
        if (svgEl) svgEl.style.shapeRendering = 'crispEdges';

        setLoading(false);

        /* DECUR case pins — amber glow markers in casePane (z=650) */
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
    };
  }, []);

  return (
    <div className="sightings-map relative isolate rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Map container — ocean color, land drawn via TopoJSON land polygon */}
      <div ref={containerRef} style={{ height: 480, width: '100%', background: '#0f172a' }} />

      {/* Gradient fades — blend map edges into the page background */}
      {!loading && !error && (
        <>
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none z-[401]"
            style={{ height: 60, background: 'linear-gradient(to bottom, #0f172a 0%, transparent 100%)' }}
          />
          <div
            className="absolute bottom-0 left-0 right-0 pointer-events-none z-[401]"
            style={{ height: 60, background: 'linear-gradient(to top, #0f172a 0%, transparent 100%)' }}
          />
        </>
      )}

      {/* Loading overlay */}
      {loading && !error && (
        <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center gap-3 z-[420]">
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
          <p className="text-sm text-gray-300">Loading sighting map...</p>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center z-[420]">
          <p className="text-sm text-gray-400">Map unavailable - check network connection</p>
        </div>
      )}

      {/* Legend */}
      {!loading && !error && (
        <div className="absolute bottom-3 left-3 z-[410] bg-gray-900/85 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2 space-y-1.5">
          <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Legend</p>
          {/* Cyan sighting pins */}
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
          {/* Amber DECUR case pins */}
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
    </div>
  );
}
