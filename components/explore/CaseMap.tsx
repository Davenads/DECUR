'use client';

import { FC, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';

/* ─── Types ────────────────────────────────────────────────────── */

export interface MapCase {
  id: string;
  name: string;
  date: string;
  location: string;
  country: string;
  evidence_tier: 'tier-1' | 'tier-2';
  classification_status: string;
  summary: string;
  coordinates: { lat: number; lng: number };
}

export interface MapEvent {
  id: number;
  title: string;
  year: number;
  date: string;
  excerpt: string;
  lat: number;
  lng: number;
  article_url: string | null;
  source_url: string;
}

type ActiveMarker = { type: 'case'; data: MapCase } | { type: 'event'; data: MapEvent } | null;
type FilterMode = 'all' | 'cases' | 'events' | 'tier-1';

/* ─── Config ────────────────────────────────────────────────────── */

const TIER_CONFIG = {
  'tier-1': { color: '#10b981', label: 'Tier 1 - High Confidence', radius: 9 },
  'tier-2': { color: '#f59e0b', label: 'Tier 2 - Moderate', radius: 7 },
};

const EVENT_COLOR  = '#818cf8'; // indigo
const EVENT_RADIUS = 5;
const GEO_URL = '/world-110m.json';

const FILTER_LABELS: Record<FilterMode, string> = {
  all:     'All Incidents',
  cases:   'Detailed Cases',
  events:  'Historical Events',
  'tier-1': 'Tier 1 Only',
};

/* ─── Inner map canvas (all RSM in one tree for SSR safety) ──────── */

interface CanvasProps {
  filteredCases: MapCase[];
  filteredEvents: MapEvent[];
  activeMarker: ActiveMarker;
  onHoverCase: (c: MapCase | null) => void;
  onHoverEvent: (e: MapEvent | null) => void;
  isDark: boolean;
  zoom: number;
  center: [number, number];
  onMoveEnd: (pos: { coordinates: [number, number]; zoom: number }) => void;
}

const MapCanvas: FC<CanvasProps> = ({
  filteredCases, filteredEvents, activeMarker,
  onHoverCase, onHoverEvent, isDark, zoom, center, onMoveEnd,
}) => {
  const mapBg     = isDark ? '#111827' : '#e8f4fd';
  const geoBg     = isDark ? '#1f2937' : '#d1e8f5';
  const geoBorder = isDark ? '#374151' : '#b8d4e8';
  const geoHover  = isDark ? '#374151' : '#c5dff0';

  return (
    <div
      className="rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700"
      style={{ backgroundColor: mapBg, height: 440 }}
    >
      <ComposableMap
        projection="geoNaturalEarth1"
        style={{ width: '100%', height: '100%' }}
      >
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        <ZoomableGroup
          zoom={zoom}
          center={center}
          {...{ onMoveEnd } as any}
          maxZoom={12}
          minZoom={1}
        >
          <Geographies geography={GEO_URL}>
            {({ geographies }) =>
              geographies.map((geo) => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill={geoBg}
                  stroke={geoBorder}
                  strokeWidth={0.5}
                  style={{
                    default: { fill: geoBg, outline: 'none' },
                    hover:   { fill: geoHover, outline: 'none' },
                    pressed: { fill: geoHover, outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {/* Historical events - rendered first (behind cases) */}
          {filteredEvents.map(ev => {
            const isHovered = activeMarker?.type === 'event' && activeMarker.data.id === ev.id;
            const r = (isHovered ? EVENT_RADIUS + 1 : EVENT_RADIUS) / zoom;
            return (
              <Marker
                key={`ev-${ev.id}`}
                coordinates={[ev.lng, ev.lat]}
                onMouseEnter={() => onHoverEvent(ev)}
                onMouseLeave={() => onHoverEvent(null)}
              >
                <circle
                  r={r}
                  fill={EVENT_COLOR}
                  fillOpacity={isHovered ? 1 : 0.65}
                  stroke="#ffffff"
                  strokeWidth={(isHovered ? 1.5 : 0.8) / zoom}
                  style={{ cursor: 'pointer' }}
                />
              </Marker>
            );
          })}

          {/* Detailed cases - rendered on top */}
          {filteredCases.map(c => {
            const tier = TIER_CONFIG[c.evidence_tier];
            const isHovered = activeMarker?.type === 'case' && activeMarker.data.id === c.id;
            const r = (isHovered ? tier.radius + 2 : tier.radius) / zoom;
            return (
              <Marker
                key={`case-${c.id}`}
                coordinates={[c.coordinates.lng, c.coordinates.lat]}
                onMouseEnter={() => onHoverCase(c)}
                onMouseLeave={() => onHoverCase(null)}
              >
                <circle
                  r={r}
                  fill={tier.color}
                  fillOpacity={isHovered ? 1 : 0.85}
                  stroke="#ffffff"
                  strokeWidth={(isHovered ? 2 : 1.5) / zoom}
                  style={{ cursor: 'pointer' }}
                />
                {isHovered && (
                  <circle
                    r={r + 4 / zoom}
                    fill="none"
                    stroke={tier.color}
                    strokeWidth={1.5 / zoom}
                    strokeDasharray={`${3 / zoom} ${2 / zoom}`}
                    opacity={0.6}
                  />
                )}
              </Marker>
            );
          })}
        </ZoomableGroup>
      </ComposableMap>
    </div>
  );
};

// Single SSR-safe wrapper
const MapCanvasNoSSR = dynamic(() => Promise.resolve(MapCanvas), { ssr: false });

/* ─── Main exported component ───────────────────────────────────── */

interface Props {
  cases: MapCase[];
  events: MapEvent[];
}

const CaseMap: FC<Props> = ({ cases, events }) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activeMarker, setActiveMarker] = useState<ActiveMarker>(null);
  const [activeFilter, setActiveFilter] = useState<FilterMode>('all');
  const [zoom, setZoom] = useState(1);
  const [center, setCenter] = useState<[number, number]>([0, 20]);

  useEffect(() => { setMounted(true); }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  const filteredCases = (activeFilter === 'all' || activeFilter === 'cases')
    ? cases
    : activeFilter === 'tier-1'
      ? cases.filter(c => c.evidence_tier === 'tier-1')
      : [];

  const filteredEvents = (activeFilter === 'all' || activeFilter === 'events')
    ? events
    : [];

  const totalShown = filteredCases.length + filteredEvents.length;

  const handleMoveEnd = ({ coordinates, zoom: z }: { coordinates: [number, number]; zoom: number }) => {
    setCenter(coordinates);
    setZoom(z);
  };

  const handleZoomIn  = () => setZoom(z => Math.min(z * 1.6, 12));
  const handleZoomOut = () => setZoom(z => Math.max(z / 1.6, 1));
  const handleReset   = () => { setZoom(1); setCenter([0, 20]); };

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Incident Map</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {cases.length} documented cases + {events.length} geocoded historical events.
            Scroll or use controls to zoom.
          </p>
        </div>
        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(FILTER_LABELS) as FilterMode[]).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                activeFilter === f
                  ? 'text-white border-transparent bg-gray-500'
                  : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
              style={
                activeFilter === f && f === 'tier-1'
                  ? { backgroundColor: TIER_CONFIG['tier-1'].color }
                  : activeFilter === f && f === 'events'
                    ? { backgroundColor: EVENT_COLOR }
                    : {}
              }
            >
              {FILTER_LABELS[f]}
            </button>
          ))}
        </div>
      </div>

      {/* Map canvas with zoom controls overlay */}
      <div className="relative">
        <MapCanvasNoSSR
          filteredCases={filteredCases}
          filteredEvents={filteredEvents}
          activeMarker={activeMarker}
          onHoverCase={c => setActiveMarker(c ? { type: 'case', data: c } : null)}
          onHoverEvent={e => setActiveMarker(e ? { type: 'event', data: e } : null)}
          isDark={isDark}
          zoom={zoom}
          center={center}
          onMoveEnd={handleMoveEnd}
        />

        {/* Zoom controls */}
        <div className="absolute bottom-3 right-3 flex flex-col gap-1">
          {[
            { label: '+', onClick: handleZoomIn, title: 'Zoom in' },
            { label: '-', onClick: handleZoomOut, title: 'Zoom out' },
            { label: '⟳', onClick: handleReset, title: 'Reset view' },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={btn.onClick}
              title={btn.title}
              className="w-7 h-7 flex items-center justify-center text-sm font-bold rounded border bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-sm transition-colors"
            >
              {btn.label}
            </button>
          ))}
        </div>
      </div>

      {/* Hover info panel */}
      <div className="min-h-[72px] rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
        {activeMarker?.type === 'case' ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: TIER_CONFIG[activeMarker.data.evidence_tier].color }}
              />
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{activeMarker.data.name}</p>
              <span className="text-xs text-gray-400 dark:text-gray-500">{activeMarker.data.date}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${TIER_CONFIG[activeMarker.data.evidence_tier].color}20`,
                  color: TIER_CONFIG[activeMarker.data.evidence_tier].color,
                }}
              >
                {TIER_CONFIG[activeMarker.data.evidence_tier].label}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{activeMarker.data.location}</p>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
              {activeMarker.data.summary}
            </p>
          </div>
        ) : activeMarker?.type === 'event' ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: EVENT_COLOR }} />
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{activeMarker.data.title}</p>
              <span className="text-xs text-gray-400 dark:text-gray-500">{activeMarker.data.year}</span>
              <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{ backgroundColor: `${EVENT_COLOR}20`, color: EVENT_COLOR }}>
                Historical Event
              </span>
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">
              {activeMarker.data.excerpt}
            </p>
            {(activeMarker.data.article_url || activeMarker.data.source_url) && (
              <a
                href={activeMarker.data.article_url || activeMarker.data.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium inline-flex items-center gap-1 mt-1"
                style={{ color: EVENT_COLOR }}
              >
                View Source
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Hover or tap a marker to see incident details
          </p>
        )}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-400 dark:text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-800">
        {Object.entries(TIER_CONFIG).map(([tier, cfg]) => (
          <span key={tier} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: cfg.color }} />
            {cfg.label}
          </span>
        ))}
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: EVENT_COLOR }} />
          Historical Event (NICAP)
        </span>
        <span className="ml-auto text-gray-300 dark:text-gray-600">
          {totalShown} incident{totalShown !== 1 ? 's' : ''} shown
        </span>
      </div>
    </div>
  );
};

export default CaseMap;
