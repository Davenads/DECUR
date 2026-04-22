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

import { useCallback, useEffect, useRef, useState } from 'react';
import Map, { Source, Layer, Popup, NavigationControl } from 'react-map-gl/maplibre';
import type { MapRef, MapLayerMouseEvent, LayerProps } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import casePinsRaw from '../../data/ufosint/case-pins.json';
import facilityPinsRaw from '../../data/ufosint/facility-pins.json';
import nuclearPinsRaw from '../../data/ufosint/nuclear-pins.json';
import timelineRaw from '../../data/timeline.json';

/* ── Constants ──────────────────────────────────────────────────────────── */

// At world-zoom (z=3) the entire globe fits in ~480px height. Dots at this
// zoom are ~4px circles that heavily overlap — 2,000 is visually indistinguishable
// from 10,000 and loads ~5x faster. The full 10k cap is still enforced server-side
// for zoomed-in views where individual pins are meaningful.
const VIEWPORT_LIMIT = 3000;

// Delay after onMoveEnd before fetching — collapses rapid sequential gestures
// (scroll-zoom, pinch, keyboard nav) into a single request.
const MOVE_END_DEBOUNCE_MS = 150;

/* ── Viewport cache ─────────────────────────────────────────────────────── */

// Module-level LRU cache so repeat pans return instantly without hitting the
// API. Key uses 1-decimal-place bbox coords (≈11km resolution), which gives
// good hit rates for small pans while still separating meaningfully different views.
const CACHE_MAX = 25;
// globalThis.Map avoids shadowing by the react-map-gl 'Map' component import.
const _viewportCache = new globalThis.Map<string, SightingRecord[]>();

function vcKey(n: number, s: number, e: number, w: number): string {
  return `${n.toFixed(1)},${s.toFixed(1)},${e.toFixed(1)},${w.toFixed(1)}`;
}
function vcGet(key: string): SightingRecord[] | null {
  const val = _viewportCache.get(key);
  if (!val) return null;
  // Refresh to end for LRU eviction ordering
  _viewportCache.delete(key);
  _viewportCache.set(key, val);
  return val;
}
function vcSet(key: string, data: SightingRecord[]): void {
  if (_viewportCache.size >= CACHE_MAX) {
    _viewportCache.delete(_viewportCache.keys().next().value!);
  }
  _viewportCache.set(key, data);
}

// Inline MapLibre style pointing directly at CartoDB's 4-server tile CDN.
// Using CartoDB directly (not proxied) avoids the Vercel serverless bottleneck:
// at z=3 the map requests ~64 tiles simultaneously; routing each through a
// cold-starting serverless function causes the partial-block load pattern.
// The CSP already allows connect-src *.cartocdn.com for MapLibre's WebWorker.
const MAP_STYLE = {
  version: 8 as const,
  sources: {
    'carto-tiles': {
      type: 'raster' as const,
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
        'https://b.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
        'https://c.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
        'https://d.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}.png',
      ],
      tileSize: 256,
      attribution: '&copy; <a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions" target="_blank">CARTO</a>',
    },
  },
  layers: [
    // Fallback ocean color while tiles load
    { id: 'background', type: 'background' as const, paint: { 'background-color': '#0f172a' } },
    // CartoDB dark_nolabels — direct CDN, round-robined across a/b/c/d servers
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

const facilityPinsLayer: LayerProps = {
  id: 'facility-pins',
  type: 'circle',
  paint: {
    'circle-radius': 9,
    'circle-color': '#a855f7',
    'circle-stroke-width': 2.5,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': 1,
    'circle-stroke-opacity': 1,
  },
};

const timelineEventsLayer: LayerProps = {
  id: 'timeline-events',
  type: 'circle',
  paint: {
    'circle-radius': 6,
    'circle-color': '#f43f5e',
    'circle-stroke-width': 1.5,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': 0.9,
    'circle-stroke-opacity': 0.9,
  },
};

const nuclearPinsLayer: LayerProps = {
  id: 'nuclear-pins',
  type: 'circle',
  paint: {
    'circle-radius': 8,
    'circle-color': '#84cc16',
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff',
    'circle-opacity': 1,
    'circle-stroke-opacity': 1,
  },
};

/* ── Static data ────────────────────────────────────────────────────────── */

interface CasePin { id: string; name: string; lat: number; lng: number; total: number }
interface FacilityPin {
  id: string; name: string; description: string;
  programs: string[]; active_period: string; lat: number; lng: number;
}
interface NuclearPin {
  id: string; name: string; description: string;
  figures: string[]; lat: number; lng: number;
}

const casePinsGeoJSON = {
  type: 'FeatureCollection' as const,
  features: (casePinsRaw as CasePin[]).map(p => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] as [number, number] },
    properties: { id: p.id, name: p.name, total: p.total },
  })),
};

const facilityPinsGeoJSON = {
  type: 'FeatureCollection' as const,
  features: (facilityPinsRaw as FacilityPin[]).map(p => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] as [number, number] },
    properties: {
      id: p.id, name: p.name, description: p.description,
      active_period: p.active_period,
    },
  })),
};

const nuclearPinsGeoJSON = {
  type: 'FeatureCollection' as const,
  features: (nuclearPinsRaw as NuclearPin[]).map(p => ({
    type: 'Feature' as const,
    geometry: { type: 'Point' as const, coordinates: [p.lng, p.lat] as [number, number] },
    properties: { id: p.id, name: p.name, description: p.description },
  })),
};

interface TimelineEntry {
  id: number; year: number; title: string; excerpt?: string;
  categories: string[]; source?: string; lat?: number; lng?: number;
}

// Filter to geolocated events with meaningful categories (excludes 'x' and uncategorised)
const SKIP_CATEGORIES = new Set(['x']);
const timelineEventsGeoJSON = {
  type: 'FeatureCollection' as const,
  features: (timelineRaw as TimelineEntry[])
    .filter(e =>
      e.lat != null && e.lng != null &&
      e.categories?.some(c => !SKIP_CATEGORIES.has(c))
    )
    .map(e => ({
      type: 'Feature' as const,
      geometry: { type: 'Point' as const, coordinates: [e.lng!, e.lat!] as [number, number] },
      properties: {
        id: e.id,
        title: e.title,
        year: e.year,
        excerpt: e.excerpt ?? null,
        source: e.source ?? null,
      },
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
  const moveEndTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Holds a promise for the global-view prefetch started on mount.
  // Consumed once by onLoad; if the map initializes before the fetch
  // resolves, onLoad awaits it; if it resolves first, onLoad uses it instantly.
  const prefetchRef = useRef<Promise<{ sightings: SightingRecord[] } | null> | null>(null);

  const [sightingsGeoJSON, setSightingsGeoJSON] = useState<SightingsGeoJSON>({
    type: 'FeatureCollection',
    features: [],
  });
  const [pinCount, setPinCount] = useState<number | null>(null);
  const [pinLoading, setPinLoading] = useState(true); // true from the start — data is already in-flight
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [showFacilities, setShowFacilities] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showNuclear, setShowNuclear] = useState(false);

  /* ── Prefetch global view on mount ──────────────────────────────── */
  // Start the data request immediately when the component mounts so it
  // runs in parallel with MapLibre's WebGL + tile initialization (~1-2s).
  // By the time onLoad fires, the sightings data is often already available.
  useEffect(() => {
    const controller = new AbortController();
    prefetchRef.current = fetch(
      `/api/sightings/viewport?n=85&s=-85&e=180&w=-180&limit=${VIEWPORT_LIMIT}`,
      { signal: controller.signal }
    )
      .then(r => (r.ok ? r.json() : Promise.reject(r.status)))
      .catch(() => null); // swallow — onLoad's fetchViewport fallback handles retry
    return () => controller.abort();
  }, []);

  /* ── Shared data applier ─────────────────────────────────────────── */

  const applyViewportData = useCallback((sightings: SightingRecord[]) => {
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
    setPinLoading(false);
  }, []);

  /* ── Viewport fetch ─────────────────────────────────────────────── */

  const fetchViewport = useCallback(async () => {
    const map = mapRef.current?.getMap();
    if (!map) return;

    const b = map.getBounds();
    if (!b) return;

    const n = b.getNorth();
    const s = b.getSouth();
    // Clamp to [-180, 180] — MapLibre can return values outside this range
    // when the map is scrolled past the antimeridian (e.g. getEast() > 180).
    // The Supabase BETWEEN query doesn't handle wrapped coordinates.
    const e = Math.min(b.getEast(), 180);
    const w = Math.max(b.getWest(), -180);

    // 1dp key (≈11km resolution) — matches the module-level viewport cache granularity.
    const viewKey = vcKey(n, s, e, w);
    if (viewKey === lastViewKeyRef.current) return;
    lastViewKeyRef.current = viewKey;

    // Cache hit — instant render, no API call, no loading spinner.
    const cached = vcGet(viewKey);
    if (cached) {
      applyViewportData(cached);
      return;
    }

    // Cache miss — fetch from API.
    abortRef.current?.abort();
    abortRef.current = new AbortController();
    setPinLoading(true);

    try {
      // Round to 1dp — matches vcKey() resolution and the server-side memCache key,
      // so client cache and server cache both hit for the same logical viewport.
      const res = await fetch(
        `/api/sightings/viewport?n=${n.toFixed(1)}&s=${s.toFixed(1)}&e=${e.toFixed(1)}&w=${w.toFixed(1)}&limit=${VIEWPORT_LIMIT}`,
        { signal: abortRef.current.signal }
      );
      if (!res.ok) throw new Error(`viewport ${res.status}`);
      const { sightings } = await res.json() as { sightings: SightingRecord[] };
      vcSet(viewKey, sightings);
      applyViewportData(sightings);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        // A newer fetch superseded this one. Reset the key so the next
        // onMoveEnd will trigger a fresh fetch for the settled position.
        lastViewKeyRef.current = '';
      } else {
        console.error('Viewport fetch error:', err);
      }
      setPinLoading(false);
    }
  }, [applyViewportData]);

  /* ── Map event handlers ─────────────────────────────────────────── */

  const onLoad = useCallback(async () => {
    // Consume the prefetch started on mount. If it already resolved, the
    // data is applied with zero additional latency. If still in-flight,
    // we await it here rather than firing a second identical request.
    const prefetch = prefetchRef.current;
    prefetchRef.current = null;

    if (prefetch) {
      const data = await prefetch;
      if (data?.sightings?.length) {
        const globalKey = vcKey(85, -85, 180, -180);
        vcSet(globalKey, data.sightings);
        lastViewKeyRef.current = globalKey;
        applyViewportData(data.sightings);
        return;
      }
    }
    // Prefetch failed or returned nothing — fall back to a regular fetch.
    fetchViewport();
  }, [fetchViewport, applyViewportData]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onError = useCallback((e: any) => {
    console.error('[SightingsMap] MapLibre error:', e?.error ?? e);
  }, []);

  // Clear stale data immediately on pan/zoom so old sightings don't linger
  // as a partial strip in the new viewport while the fresh fetch is in-flight.
  // Also cancel any pending debounced fetch so we don't fire for an intermediate position.
  const onMoveStart = useCallback(() => {
    if (moveEndTimerRef.current) {
      clearTimeout(moveEndTimerRef.current);
      moveEndTimerRef.current = null;
    }
    setSightingsGeoJSON({ type: 'FeatureCollection', features: [] });
    lastViewKeyRef.current = '';
  }, []);

  // Debounced — collapses rapid sequential gestures (scroll-zoom, pinch, arrow keys)
  // into a single fetch for the settled position.
  const onMoveEnd = useCallback(() => {
    if (moveEndTimerRef.current) clearTimeout(moveEndTimerRef.current);
    moveEndTimerRef.current = setTimeout(() => {
      moveEndTimerRef.current = null;
      fetchViewport();
    }, MOVE_END_DEBOUNCE_MS);
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
        interactiveLayerIds={[
          'sightings', 'case-pins',
          ...(showFacilities ? ['facility-pins'] : []),
          ...(showTimeline ? ['timeline-events'] : []),
          ...(showNuclear ? ['nuclear-pins'] : []),
        ]}
        onClick={onMapClick}
        onLoad={onLoad}
        onMoveStart={onMoveStart}
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

        {/* Government investigation facility pins — purple, opt-in toggle */}
        {showFacilities && (
          <Source id="facility-pins" type="geojson" data={facilityPinsGeoJSON}>
            <Layer {...facilityPinsLayer} />
          </Source>
        )}

        {/* Geolocated DECUR timeline events — rose, opt-in toggle */}
        {showTimeline && (
          <Source id="timeline-events" type="geojson" data={timelineEventsGeoJSON}>
            <Layer {...timelineEventsLayer} />
          </Source>
        )}

        {/* Nuclear facility UAP incident sites — lime, opt-in toggle */}
        {showNuclear && (
          <Source id="nuclear-pins" type="geojson" data={nuclearPinsGeoJSON}>
            <Layer {...nuclearPinsLayer} />
          </Source>
        )}

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
            ) : popup.layerId === 'timeline-events' ? (
              <div style={{ fontFamily: 'system-ui', minWidth: 190, maxWidth: 240 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, color: '#111' }}>
                  {popup.properties.title}
                </div>
                <div style={{ fontSize: 10, color: '#f43f5e', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Historical Event &middot; {popup.properties.year}
                </div>
                {popup.properties.excerpt && (
                  <div style={{ fontSize: 11, color: '#444', lineHeight: 1.5, marginBottom: 4 }}>
                    {popup.properties.excerpt.length > 140
                      ? popup.properties.excerpt.substring(0, 140) + '…'
                      : popup.properties.excerpt}
                  </div>
                )}
                {popup.properties.source && (
                  <div style={{ fontSize: 10, color: '#999', paddingTop: 4, borderTop: '1px solid #e5e7eb' }}>
                    {popup.properties.source}
                  </div>
                )}
              </div>
            ) : popup.layerId === 'nuclear-pins' ? (
              <div style={{ fontFamily: 'system-ui', minWidth: 200, maxWidth: 240 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, color: '#111' }}>
                  {popup.properties.name}
                </div>
                <div style={{ fontSize: 10, color: '#84cc16', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Nuclear Incident
                </div>
                <div style={{ fontSize: 11, color: '#444', lineHeight: 1.5 }}>
                  {popup.properties.description}
                </div>
              </div>
            ) : popup.layerId === 'facility-pins' ? (
              <div style={{ fontFamily: 'system-ui', minWidth: 200, maxWidth: 240 }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2, color: '#111' }}>
                  {popup.properties.name}
                </div>
                <div style={{ fontSize: 10, color: '#a855f7', fontWeight: 600, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Investigation Facility
                </div>
                <div style={{ fontSize: 11, color: '#444', lineHeight: 1.5 }}>
                  {popup.properties.description}
                </div>
                <div style={{ marginTop: 6, paddingTop: 6, borderTop: '1px solid #e5e7eb', fontSize: 10, color: '#888' }}>
                  Active: {popup.properties.active_period}
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

      {/* Sightings loading indicator — visible pill at top-center while pins are in-flight */}
      {pinLoading && (
        <div
          className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-gray-900/90 backdrop-blur-sm border border-cyan-800/60 rounded-full px-3 py-1.5 pointer-events-none"
          style={{ zIndex: 20 }}
        >
          {/* Pulsing cyan dot */}
          <span className="relative flex h-2 w-2 flex-shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400" />
          </span>
          <span className="text-xs text-cyan-300 font-medium tracking-wide whitespace-nowrap">
            Loading sightings...
          </span>
        </div>
      )}

      {/* Layers panel — consolidated legend + toggle controls */}
      <div
        className="absolute bottom-3 left-3 bg-gray-900/85 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2"
        style={{ zIndex: 10, minWidth: 196 }}
      >
        {/* Header */}
        <p className="text-xs font-semibold text-gray-300 uppercase tracking-widest mb-2">Layers</p>

        {/* Always-on: Community sightings */}
        <div className="flex items-center gap-2 py-0.5">
          <div style={{
            width: 9, height: 9, borderRadius: '50%', flexShrink: 0,
            background: '#22d3ee', border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 0 4px rgba(34,211,238,0.5)',
          }} />
          <span className="text-xs text-gray-400 flex-1">
            {pinLoading
              ? 'Loading...'
              : pinCount != null
                ? `${pinCount.toLocaleString()} sightings in view`
                : 'Community sightings'}
          </span>
        </div>

        {/* Always-on: Documented cases */}
        <div className="flex items-center gap-2 py-0.5">
          <div style={{
            width: 11, height: 11, borderRadius: '50%', flexShrink: 0,
            background: '#f59e0b', border: '2px solid #fff',
            boxShadow: '0 0 0 1.5px rgba(245,158,11,0.5),0 0 6px rgba(245,158,11,0.8)',
          }} />
          <span className="text-xs text-gray-300 flex-1">Documented cases</span>
        </div>

        {/* Divider before toggleable layers */}
        <div className="border-t border-gray-700/60 my-1.5" />

        {/* Toggleable: Investigation Sites */}
        <button
          onClick={() => setShowFacilities(s => !s)}
          className="flex items-center gap-2 py-0.5 w-full text-left group"
          title={showFacilities ? 'Hide investigation facility locations' : 'Show government investigation facility locations'}
        >
          <div style={{
            width: 11, height: 11, borderRadius: '50%', flexShrink: 0,
            background: showFacilities ? '#a855f7' : '#4b5563',
            border: '2px solid #fff',
            boxShadow: showFacilities
              ? '0 0 0 1.5px rgba(168,85,247,0.5),0 0 6px rgba(168,85,247,0.8)'
              : 'none',
            transition: 'all 0.15s ease',
          }} />
          <span className={`text-xs flex-1 transition-colors ${showFacilities ? 'text-purple-300' : 'text-gray-500 group-hover:text-gray-400'}`}>
            Investigation sites
          </span>
          {/* Toggle pill */}
          <div style={{
            width: 28, height: 16, borderRadius: 8, flexShrink: 0,
            background: showFacilities ? '#a855f7' : '#374151',
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative', transition: 'background 0.15s ease',
          }}>
            <div style={{
              position: 'absolute', top: 2, width: 10, height: 10, borderRadius: '50%',
              background: '#fff',
              left: showFacilities ? 16 : 2,
              transition: 'left 0.15s ease',
            }} />
          </div>
        </button>

        {/* Toggleable: Historical Events */}
        <button
          onClick={() => setShowTimeline(s => !s)}
          className="flex items-center gap-2 py-0.5 w-full text-left group"
          title={showTimeline ? 'Hide historical timeline events' : 'Show geolocated DECUR historical events'}
        >
          <div style={{
            width: 11, height: 11, borderRadius: '50%', flexShrink: 0,
            background: showTimeline ? '#f43f5e' : '#4b5563',
            border: '2px solid #fff',
            boxShadow: showTimeline
              ? '0 0 0 1.5px rgba(244,63,94,0.5),0 0 6px rgba(244,63,94,0.8)'
              : 'none',
            transition: 'all 0.15s ease',
          }} />
          <span className={`text-xs flex-1 transition-colors ${showTimeline ? 'text-rose-300' : 'text-gray-500 group-hover:text-gray-400'}`}>
            Historical events
          </span>
          {/* Toggle pill */}
          <div style={{
            width: 28, height: 16, borderRadius: 8, flexShrink: 0,
            background: showTimeline ? '#f43f5e' : '#374151',
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative', transition: 'background 0.15s ease',
          }}>
            <div style={{
              position: 'absolute', top: 2, width: 10, height: 10, borderRadius: '50%',
              background: '#fff',
              left: showTimeline ? 16 : 2,
              transition: 'left 0.15s ease',
            }} />
          </div>
        </button>

        {/* Toggleable: Nuclear Incidents */}
        <button
          onClick={() => setShowNuclear(s => !s)}
          className="flex items-center gap-2 py-0.5 w-full text-left group"
          title={showNuclear ? 'Hide nuclear facility UAP incidents' : 'Show nuclear facility UAP incident sites'}
        >
          <div style={{
            width: 11, height: 11, borderRadius: '50%', flexShrink: 0,
            background: showNuclear ? '#84cc16' : '#4b5563',
            border: '2px solid #fff',
            boxShadow: showNuclear
              ? '0 0 0 1.5px rgba(132,204,22,0.5),0 0 6px rgba(132,204,22,0.8)'
              : 'none',
            transition: 'all 0.15s ease',
          }} />
          <span className={`text-xs flex-1 transition-colors ${showNuclear ? 'text-lime-300' : 'text-gray-500 group-hover:text-gray-400'}`}>
            Nuclear incidents
          </span>
          {/* Toggle pill */}
          <div style={{
            width: 28, height: 16, borderRadius: 8, flexShrink: 0,
            background: showNuclear ? '#84cc16' : '#374151',
            border: '1px solid rgba(255,255,255,0.1)',
            position: 'relative', transition: 'background 0.15s ease',
          }}>
            <div style={{
              position: 'absolute', top: 2, width: 10, height: 10, borderRadius: '50%',
              background: '#fff',
              left: showNuclear ? 16 : 2,
              transition: 'left 0.15s ease',
            }} />
          </div>
        </button>
      </div>
    </div>
  );
}
