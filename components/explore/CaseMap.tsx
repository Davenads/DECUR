'use client';

import { FC, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
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

/* ─── Tier config ───────────────────────────────────────────────── */

const TIER_CONFIG = {
  'tier-1': { color: '#10b981', label: 'Tier 1 - High Confidence', radius: 10 },
  'tier-2': { color: '#f59e0b', label: 'Tier 2 - Moderate Confidence', radius: 8 },
};

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';

/* ─── Inner map canvas (all RSM components in one tree) ─────────── */

interface CanvasProps {
  filteredCases: MapCase[];
  hoveredCase: MapCase | null;
  onHover: (c: MapCase | null) => void;
  isDark: boolean;
}

const MapCanvas: FC<CanvasProps> = ({ filteredCases, hoveredCase, onHover, isDark }) => {
  const mapBg     = isDark ? '#111827' : '#e8f4fd';
  const geoBg     = isDark ? '#1f2937' : '#d1e8f5';
  const geoBorder = isDark ? '#374151' : '#b8d4e8';
  const geoHover  = isDark ? '#374151' : '#c5dff0';

  return (
    <div
      className="rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700"
      style={{ backgroundColor: mapBg, height: 420 }}
    >
      <ComposableMap
        projection="geoNaturalEarth1"
        style={{ width: '100%', height: '100%' }}
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

        {filteredCases.map(c => {
          const tier = TIER_CONFIG[c.evidence_tier];
          const isHovered = hoveredCase?.id === c.id;
          return (
            <Marker
              key={c.id}
              coordinates={[c.coordinates.lng, c.coordinates.lat]}
              onMouseEnter={() => onHover(c)}
              onMouseLeave={() => onHover(null)}
            >
              <circle
                r={isHovered ? tier.radius + 3 : tier.radius}
                fill={tier.color}
                fillOpacity={isHovered ? 1 : 0.8}
                stroke="#ffffff"
                strokeWidth={isHovered ? 2 : 1.5}
                style={{ cursor: 'pointer' }}
              />
              {isHovered && (
                <circle
                  r={tier.radius + 7}
                  fill="none"
                  stroke={tier.color}
                  strokeWidth={1.5}
                  strokeDasharray="3 2"
                  opacity={0.6}
                />
              )}
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
};

// Single SSR-safe wrapper — keeps all RSM components in one module context
const MapCanvasNoSSR = dynamic(() => Promise.resolve(MapCanvas), { ssr: false });

/* ─── Main exported component ───────────────────────────────────── */

interface Props {
  cases: MapCase[];
}

const CaseMap: FC<Props> = ({ cases }) => {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [hoveredCase, setHoveredCase] = useState<MapCase | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'tier-1' | 'tier-2'>('all');

  useEffect(() => { setMounted(true); }, []);

  const isDark = mounted && resolvedTheme === 'dark';

  const filteredCases = activeFilter === 'all'
    ? cases
    : cases.filter(c => c.evidence_tier === activeFilter);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Case Locations</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            Geographic distribution of {cases.length} documented UAP incidents, colored by evidence tier.
          </p>
        </div>
        {/* Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {(['all', 'tier-1', 'tier-2'] as const).map(f => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${
                activeFilter === f
                  ? 'text-white border-transparent'
                  : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}
              style={
                activeFilter === f && f !== 'all'
                  ? { backgroundColor: TIER_CONFIG[f].color }
                  : activeFilter === f
                    ? { backgroundColor: '#6b7280' }
                    : {}
              }
            >
              {f === 'all' ? 'All Cases' : TIER_CONFIG[f].label}
            </button>
          ))}
        </div>
      </div>

      {/* Map canvas — SSR-safe, all RSM in single module context */}
      <MapCanvasNoSSR
        filteredCases={filteredCases}
        hoveredCase={hoveredCase}
        onHover={setHoveredCase}
        isDark={isDark}
      />

      {/* Hover info panel */}
      <div className="min-h-[72px] rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-4">
        {hoveredCase ? (
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: TIER_CONFIG[hoveredCase.evidence_tier].color }}
              />
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{hoveredCase.name}</p>
              <span className="text-xs text-gray-400 dark:text-gray-500">{hoveredCase.date}</span>
              <span
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: `${TIER_CONFIG[hoveredCase.evidence_tier].color}20`,
                  color: TIER_CONFIG[hoveredCase.evidence_tier].color,
                }}
              >
                {TIER_CONFIG[hoveredCase.evidence_tier].label}
              </span>
              <span className="text-xs text-gray-400 dark:text-gray-500 capitalize">
                {hoveredCase.classification_status.replace(/-/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">{hoveredCase.location}</p>
            <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2">{hoveredCase.summary}</p>
          </div>
        ) : (
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Hover a marker to see case details
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
        <span className="ml-auto text-gray-300 dark:text-gray-600">
          {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''} shown
        </span>
      </div>
    </div>
  );
};

export default CaseMap;
