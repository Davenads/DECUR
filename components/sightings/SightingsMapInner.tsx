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

        /* Create map */
        map = L.map(containerRef.current, {
          center: [38, -40],
          zoom: 3,
          minZoom: 2,
          maxZoom: 10,
          zoomSnap: 0.5,
        });
        mapRef.current = map;

        /* CartoDB Voyager — distinct land/ocean contrast, public CDN, no API key */
        L.tileLayer(
          'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}.png',
          {
            attribution:
              '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
            subdomains: 'abcd',
            maxZoom: 19,
          }
        ).addTo(map);

        /* Load initial hexbins and add heat layer */
        const cells = await fetchHexbins(3);
        if (destroyed) return;

        const maxCnt = Math.max(...cells.map((c) => c.cnt), 1);
        // Sqrt transform: only truly high-density clusters glow hot; low-count cells fade out
        const heatPoints = cells.map(
          (c) => [c.lat, c.lng, Math.sqrt(c.cnt / maxCnt)] as [number, number, number]
        );

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const heat = (L as any).heatLayer(heatPoints, {
          radius: 18,
          blur: 14,
          maxZoom: 5,
          max: 1.0,
          gradient: {
            0.0: 'rgba(0,0,0,0)',          // transparent — basemap shows through at zero
            0.15: 'rgba(253,224,71,0.65)', // yellow — first visible on light bg
            0.4: 'rgba(249,115,22,0.82)',  // orange
            0.7: 'rgba(220,38,38,0.92)',   // red
            1.0: '#7f1d1d',               // dark maroon for hottest clusters
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
            const newPoints = newCells.map(
              (c) => [c.lat, c.lng, Math.sqrt(c.cnt / newMax)] as [number, number, number]
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
    <div className="sightings-map relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      {/* Map container - bg matches CartoDB Voyager ocean color */}
      <div ref={containerRef} style={{ height: 480, width: '100%', background: '#d4e8f0' }} />

      {/* Loading overlay */}
      {loading && !error && (
        <div className="absolute inset-0 bg-gray-900/80 flex flex-col items-center justify-center gap-3 z-[1000]">
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
        <div className="absolute inset-0 bg-gray-900/90 flex items-center justify-center z-[1000]">
          <p className="text-sm text-gray-400">Map unavailable - check network connection</p>
        </div>
      )}

      {/* Legend */}
      {!loading && !error && (
        <div className="absolute bottom-3 left-3 z-[1000] bg-gray-900/85 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2 space-y-1.5">
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
        <div className="absolute top-3 right-3 z-[1000] bg-gray-900/75 backdrop-blur-sm border border-gray-700 rounded-md px-2 py-1">
          <span className="text-xs text-gray-400 font-mono">
            resolution: z{activeTier}
          </span>
        </div>
      )}
    </div>
  );
}
