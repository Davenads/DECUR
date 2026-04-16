/**
 * SightingsMapInner — MapLibre GL JS implementation via react-map-gl.
 *
 * Replaces the Leaflet + TopoJSON SVG approach that produced persistent
 * horizontal line artifacts across 12 fix attempts. The root cause was
 * Leaflet's SVG renderer: adjacent country polygon paths anti-alias their
 * shared edges independently, leaving 1-2px gaps that render as lines.
 *
 * MapLibre renders geography from CartoDB vector tiles on the GPU.
 * No SVG paths are authored; the artifact class is structurally impossible.
 */

import { useCallback, useRef, useState } from 'react';
import Map, { Source, Layer, Popup, NavigationControl } from 'react-map-gl/maplibre';
import type { MapRef, MapLayerMouseEvent, LayerProps } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import casePinsRaw from '../../data/ufosint/case-pins.json';

/* ── Constants ──────────────────────────────────────────────────────────── */

const VIEWPORT_LIMIT = 10000;

// Inline MapLibre style — avoids fetching an external style JSON URL (which was
// blocked by CSP connect-src). Raster tiles are loaded by MapLibre as images;
// img-src https://*.cartocdn.com must be allowed in the CSP.
const MAP_STYLE = {
  version: 8 as const,
  sources: {
    'carto-tiles': {
      type: 'raster' as const,
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_matter_nolabels/{z}/{x}/{y}@2x.png',
        'https://b.basemaps.cartocdn.com/dark_matter_nolabels/{z}/{x}/{y}@2x.png',
        'https://c.basemaps.cartocdn.com/dark_matter_nolabels/{z}/{x}/{y}@2x.png',
        'https://d.basemaps.cartocdn.com/dark_matter_nolabels/{z}/{x}/{y}@2x.png',
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
    },
  },
  layers: [
    // Ocean base color matching the site's dark slate background
    { id: 'background', type: 'background' as const, paint: { 'background-color': '#0f172a' } },
    // CartoDB dark-matter-nolabels: dark tiles with visible land/ocean contrast
    { id: 'carto-tiles', type: 'raster' as const, source: 'carto-tiles' },
  ],
};

/* ── Layer paint definitions ────────────────────────────────────────────── */

const sightingsLayer: LayerProps = {
  id: 'sightings',
  type: 'circle',
  paint: {
    'circle-radius': 4,
    'circle-color': '#22d3ee',
    'circle-opacity': 0.9,
    'circle-stroke-width': 1,
    'circle-stroke-color': 'rgba(255,255,255,0.4)',
    'circle-stroke-opacity': 0.7,
  },
};

const casePinsLayer: LayerProps = {
  id: 'case-pins',
  type: 'circle',
  paint: {
    'circle-radius': 7,
    'circle-color': '#f59e0b',
    'circle-stroke-width': 2.5,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': 1,
    'circle-stroke-opacity': 1,
  },
};

/* ── Static data ────────────────────────────────────────────────────────── */

interface CasePin { id: string; name: string; lat: number; lng: number; total: number }

const casePinsGeoJSON = {
  type: 'FeatureCollection' as const,
  features: (casePinsRaw as CasePin[]).map(p => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] as [number, number] },
    properties: { id: p.id, name: p.name, total: p.total },
  })),
};

/* ── Types ──────────────────────────────────────────────────────────── */

interface SightingRecord {
  id: number; date: string | null; shape: string | null;
  standardized_shape: string | null; source: string;
  city: string | null; state: string | null; country: string | null;
  lat: number; lng: number; quality_score: number | null;
  hynek: string | null; duration: string | null; witnesses: number | null;
}

interface SightingsGeoJSON {
  type: 'FeatureCollection';
  features: Array<{
    type: 'Feature';
    geometry: { type: 'Point'; coordinates: [number, number] };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    properties: Record<string, any>;
  }>;
}

interface PopupState {
  lng: number;
  lat: number;
  layerId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  properties: Record<string, any>;
}

/* ── Component ──────────────────────────────────────────────────────── */

export default function SightingsMapInner() {
  const mapRef = useRef<MapRef>(null);
  const abortRef = useRef<AbortController | null>(null);
  const lastViewKeyRef = useRef('');

  const [sightingsGeoJSON, setSightingsGeoJSON] = useState<SightingsGeoJSON>({
    type: 'FeatureCollection',
    features: [],
  });
  const [pinCount, setPinCount] = useState<number | null>(null);
  const [pinLoading, setPinLoading] = useState(false);
  const [popup, setPopup] = useState<PopupState | null>(null);

  /* ── Viewport fetch ─────────────────────────────────────────────── */

  const fetchViewport = useCallback(async () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const b = map.getBounds();
    if (!b) return;

    const n = b.getNorth();
    const s = b.getSouth();
    const e = b.getEast();
    const w = b.getWest();
    const viewKey = `${n.toFixed(3)},${s.toFixed(3)},${e.toFixed(3)},${w.toFixed(3)}`;
    if (viewKey === lastViewKeyRef.current) return;
    lastViewKeyRef.current = viewKey;

    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setPinLoading(true);

    try {
      const res = await fetch(
        `/api/sightings/viewport?n=${n}&s=${s}&e=${e}&w=${w}&limit=${VIEWPORT_LIMIT}`,
        { signal: abortRef.current.signal }
      );
      if (!res.ok) throw new Error(`viewport ${res.status}`);
      const { sightings } = await res.json() as { sightings: SightingRecord[] };

      setSightingsGeoJSON({
        type: 'FeatureCollection',
        features: sightings.map(sg => ({
          type: 'Feature',
          geometry: { type: 'Point', coordinates: [sg.lng, sg.lat] },
          properties: {
            id: sg.id,
            date: sg.date,
            shape: sg.standardized_shape ?? sg.shape ?? 'Unknown shape',
            source: sg.source,
            city: sg.city,
            state: sg.state,
            country: sg.country,
            quality_score: sg.quality_score,
            hynek: sg.hynek,
            duration: sg.duration,
            witnesses: sg.witnesses,
          },
        })),
      });
      setPinCount(sightings.length);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Viewport fetch error:', err);
      }
    } finally {
      setPinLoading(false);
    }
  }, []);

  /* ── Map event handlers ─────────────────────────────────────────── */

  const onLoad = useCallback(() => {
    console.log('[SightingsMap] MapLibre loaded');
    fetchViewport();
  }, [fetchViewport]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onError = useCallback((e: any) => {
    console.error('[SightingsMap] MapLibre error:', e?.error ?? e);
  }, []);

  const onMoveEnd = useCallback(() => {
    fetchViewport();
  }, [fetchViewport]);

  const onMapClick = useCallback((e: MapLayerMouseEvent) => {
    const features = e.features;
    if (!features?.length) {
      setPopup(null);
      return;
    }
    const f = features[0];
    setPopup({
      lng: e.lngLat.lng,
      lat: e.lngLat.lat,
      layerId: f.layer.id,
      properties: f.properties ?? {},
    });
  }, []);

  /* ── Render ─────────────────────────────────────────────────────── */

  return (
    <div
      className="sightings-map relative rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700"
      style={{ height: 480 }}
    >
      <Map
        ref={mapRef}
        mapStyle={MAP_STYLE}
        initialViewState={{ longitude: -40, latitude: 38, zoom: 3 }}
        minZoom={2}
        maxZoom={10}
        maxBounds={[[-179.9, -85], [179.9, 85]]}
        style={{ width: '100%', height: '100%' }}
        interactiveLayerIds={['sightings', 'case-pins']}
        onClick={onMapClick}
        onLoad={onLoad}
        onMoveEnd={onMoveEnd}
        onError={onError}
      >
        <NavigationControl position="top-left" />

        {/* Community sighting pins — cyan, 10k cap ordered by quality_score */}
        <Source id="sightings" type="geojson" data={sightingsGeoJSON}>
          <Layer {...sightingsLayer} />
        </Source>

        {/* DECUR documented case pins — amber, static */}
        <Source id="case-pins" type="geojson" data={casePinsGeoJSON}>
          <Layer {...casePinsLayer} />
        </Source>

        {/* Click popup */}
        {popup && (
          <Popup
            longitude={popup.lng}
            latitude={popup.lat}
            anchor="bottom"
            onClose={() => setPopup(null)}
            maxWidth="220px"
          >
            {popup.layerId === 'sightings' ? (
              <div style={{ fontFamily: 'system-ui', minWidth: 160, maxWidth: 200 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, color: '#111' }}>
                  {popup.properties.shape}
                </div>
                <div style={{ fontSize: 11, color: '#555' }}>
                  {[popup.properties.city, popup.properties.state, popup.properties.country]
                    .filter(Boolean).join(', ') || 'Unknown location'}
                </div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                  {popup.properties.date ? popup.properties.date.substring(0, 10) : 'Unknown date'}
                </div>
                {popup.properties.hynek && (
                  <div style={{ fontSize: 11, marginTop: 4, color: '#7c3aed', fontWeight: 600 }}>
                    Hynek: {popup.properties.hynek}
                  </div>
                )}
                {popup.properties.duration && (
                  <div style={{ fontSize: 11, color: '#888' }}>Duration: {popup.properties.duration}</div>
                )}
                {popup.properties.witnesses != null && (
                  <div style={{ fontSize: 11, color: '#888' }}>Witnesses: {popup.properties.witnesses}</div>
                )}
                <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #e5e7eb', fontSize: 10, color: '#aaa' }}>
                  {popup.properties.source}
                  {popup.properties.quality_score != null ? ` · Q${popup.properties.quality_score}` : ''}
                </div>
              </div>
            ) : (
              <div style={{ fontFamily: 'system-ui', minWidth: 180 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4, color: '#111' }}>
                  {popup.properties.name}
                </div>
                <div style={{ fontSize: 12, color: '#666' }}>DECUR documented case</div>
                <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid #e5e7eb', fontSize: 12 }}>
                  <span style={{ color: '#92400e', fontWeight: 600 }}>
                    {popup.properties.total >= 1000
                      ? `~${(popup.properties.total / 1000).toFixed(1)}k`
                      : popup.properties.total}
                  </span>
                  <span style={{ color: '#999' }}> community reports nearby</span>
                </div>
                <a
                  href={`/cases/${popup.properties.id}`}
                  style={{ display: 'inline-block', marginTop: 6, fontSize: 11, color: '#6366f1', textDecoration: 'none' }}
                >
                  View case &rarr;
                </a>
              </div>
            )}
          </Popup>
        )}
      </Map>

      {/* Gradient fades — blend map edges into the page background */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{ height: 60, background: 'linear-gradient(to bottom, #0f172a 0%, transparent 100%)', zIndex: 10 }}
      />
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: 60, background: 'linear-gradient(to top, #0f172a 0%, transparent 100%)', zIndex: 10 }}
      />

      {/* Legend */}
      <div
        className="absolute bottom-3 left-3 bg-gray-900/85 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2 space-y-1.5"
        style={{ zIndex: 10 }}
      >
        <p className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Legend</p>
        <div className="flex items-center gap-2">
          <div style={{
            width: 9, height: 9, borderRadius: '50%',
            background: '#22d3ee', border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 0 4px rgba(34,211,238,0.5)', flexShrink: 0,
          }} />
          <span className="text-xs text-gray-400">
            {pinLoading
              ? 'Loading reports...'
              : pinCount != null
                ? `${pinCount.toLocaleString()} sightings in view`
                : 'Community sightings'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <div style={{
            width: 14, height: 14, borderRadius: '50%',
            background: '#f59e0b', border: '2.5px solid #fff',
            boxShadow: '0 0 0 2px rgba(245,158,11,0.5),0 0 8px rgba(245,158,11,0.9)', flexShrink: 0,
          }} />
          <span className="text-xs text-gray-300 font-medium">DECUR documented case</span>
        </div>
      </div>
    </div>
  );
}
