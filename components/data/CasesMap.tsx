import { FC, useState } from 'react';
import Link from 'next/link';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  ZoomableGroup,
} from 'react-simple-maps';
import { CaseEntry, EvidenceTier } from '../../types/data';
import { tierConfig } from './CaseDetail';

const GEO_URL = '/world-110m.json';

const TIER_COLORS: Record<EvidenceTier, string> = {
  'tier-1': '#16a34a', // green-600
  'tier-2': '#2563eb', // blue-600
  'tier-3': '#6b7280', // gray-500
};

const TIER_RING: Record<EvidenceTier, string> = {
  'tier-1': '#bbf7d0',
  'tier-2': '#bfdbfe',
  'tier-3': '#e5e7eb',
};

interface TooltipState {
  id: string;
  name: string;
  date: string;
  location: string;
  tier: EvidenceTier;
  x: number;
  y: number;
}

interface CasesMapProps {
  cases: CaseEntry[];
  onSelectCase: (id: string) => void;
}

const CasesMap: FC<CasesMapProps> = ({ cases, onSelectCase }) => {
  const [tooltip, setTooltip] = useState<TooltipState | null>(null);

  const mappable = cases.filter(c => c.coordinates);

  return (
    <div className="relative w-full rounded-xl border border-gray-200 bg-[#f0f4f8] overflow-hidden">
      {/* Tier legend */}
      <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-2 space-y-1 shadow-sm">
        {(Object.keys(TIER_COLORS) as EvidenceTier[]).filter(t => t !== 'tier-3').map(tier => (
          <div key={tier} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded-full shrink-0 border-2"
              style={{ backgroundColor: TIER_COLORS[tier], borderColor: TIER_RING[tier] }}
            />
            <span className="text-xs text-gray-600">{tierConfig[tier].label.split('—')[0].trim()}</span>
          </div>
        ))}
      </div>

      {/* Case count */}
      <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg px-3 py-1.5 shadow-sm">
        <span className="text-xs text-gray-500">{mappable.length} incidents plotted</span>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="absolute z-20 bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-[220px] pointer-events-none"
          style={{ left: tooltip.x + 12, top: tooltip.y - 8 }}
        >
          <p className="text-xs font-bold text-gray-800 leading-tight mb-0.5">{tooltip.name}</p>
          <p className="text-xs text-gray-400 mb-1.5">{tooltip.date} · {tooltip.location}</p>
          <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${tierConfig[tooltip.tier].classes}`}>
            {tierConfig[tooltip.tier].label.split('—')[0].trim()}
          </span>
          <p className="text-xs text-primary mt-2">Click to open case file</p>
        </div>
      )}

      <ComposableMap
        projection="geoMercator"
        projectionConfig={{ scale: 140, center: [10, 30] }}
        style={{ width: '100%', height: 'auto' }}
      >
        <ZoomableGroup>
          <Geographies geography={GEO_URL}>
            {({ geographies }: { geographies: Array<{ rsmKey: string }> }) =>
              geographies.map(geo => (
                <Geography
                  key={geo.rsmKey}
                  geography={geo}
                  fill="#dbe4ee"
                  stroke="#c8d3de"
                  strokeWidth={0.4}
                  style={{
                    default: { outline: 'none' },
                    hover:   { outline: 'none', fill: '#c8d3de' },
                    pressed: { outline: 'none' },
                  }}
                />
              ))
            }
          </Geographies>

          {mappable.map(c => (
            <Marker
              key={c.id}
              coordinates={[c.coordinates!.lng, c.coordinates!.lat]}
              onMouseEnter={(e) => {
                const rect = (e.target as SVGElement).closest('svg')?.getBoundingClientRect();
                const svgEl = (e.target as SVGElement).closest('svg');
                const containerEl = svgEl?.closest('.relative') as HTMLElement | null;
                const containerRect = containerEl?.getBoundingClientRect();
                const markerRect = (e.target as SVGElement).getBoundingClientRect();
                if (containerRect) {
                  setTooltip({
                    id: c.id,
                    name: c.name,
                    date: c.date,
                    location: c.location.split(',')[0],
                    tier: c.evidence_tier,
                    x: markerRect.left - containerRect.left,
                    y: markerRect.top - containerRect.top,
                  });
                }
                void rect;
              }}
              onMouseLeave={() => setTooltip(null)}
              onClick={() => onSelectCase(c.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Outer ring */}
              <circle
                r={7}
                fill={TIER_RING[c.evidence_tier]}
                opacity={0.7}
              />
              {/* Inner dot */}
              <circle
                r={4}
                fill={TIER_COLORS[c.evidence_tier]}
                stroke="#fff"
                strokeWidth={1}
              />
            </Marker>
          ))}
        </ZoomableGroup>
      </ComposableMap>

      {/* Mobile tap hint */}
      <p className="text-center text-xs text-gray-400 pb-2">Tap a marker to open the case file</p>
    </div>
  );
};

export default CasesMap;
