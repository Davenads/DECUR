import { FC, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ScatterChart, Scatter, Cell,
} from 'recharts';
import { TimelineEntry } from '../../lib/useTimelineData';

/* ─── Types ──────────────────────────────────────────────────── */

export interface WBEvent {
  year: number;
  event: string;
  category?: string;
  source: 'burisch' | 'lazar' | 'grusch' | 'elizondo' | 'fravor' | 'nell' | 'nolan' | 'puthoff' | 'mellon' | 'davis' | 'bigelow' | 'vallee' | 'pope';
}

interface Props {
  uapEntries: TimelineEntry[];
  insiderEvents: WBEvent[];
}

/* ─── Constants ──────────────────────────────────────────────── */

const YEAR_START = 1985;
const YEAR_END   = 2025;
const BURISCH_COLOR   = '#8b5cf6'; // purple — matches network graph entity color
const LAZAR_COLOR     = '#3b82f6'; // blue — matches network graph person color
const GRUSCH_COLOR    = '#ef4444'; // red
const ELIZONDO_COLOR  = '#10b981'; // emerald
const FRAVOR_COLOR    = '#f59e0b'; // amber
const NELL_COLOR      = '#14b8a6'; // teal
const NOLAN_COLOR     = '#ec4899'; // pink — distinct from all others
const PUTHOFF_COLOR   = '#6366f1'; // indigo — distinct from all others
const MELLON_COLOR    = '#d97706'; // amber-600 — distinct from all others
const DAVIS_COLOR     = '#f43f5e'; // rose-500 — distinct from all others
const BIGELOW_COLOR   = '#84cc16'; // lime-400 — distinct from all others
const VALLEE_COLOR    = '#06b6d4'; // cyan-500 — distinct from all others
const POPE_COLOR      = '#f97316'; // orange-500 — distinct from all others
const UAP_COLOR       = '#93c5e8'; // light blue — matches EventFrequencyChart

/* ─── Helpers ────────────────────────────────────────────────── */

function extractYear(dateStr: string): number | null {
  const m = dateStr.match(/\b(19\d{2}|20\d{2})\b/);
  return m ? parseInt(m[1]) : null;
}

/* ─── Custom tooltip for the UAP bar chart ───────────────────── */

interface BarTooltipPayload {
  year: number;
  uap: number;
  burischEvents: WBEvent[];
  lazarEvents: WBEvent[];
  gruschEvents: WBEvent[];
  elizondoEvents: WBEvent[];
  fravorEvents:   WBEvent[];
  nellEvents:     WBEvent[];
  nolanEvents:    WBEvent[];
  puthoffEvents:  WBEvent[];
  mellonEvents:   WBEvent[];
  davisEvents:    WBEvent[];
  bigelowEvents:  WBEvent[];
  valleeEvents:   WBEvent[];
  popeEvents:     WBEvent[];
}

interface RechartsTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: BarTooltipPayload }>;
  label?: string | number;
}

const BarTooltip: FC<RechartsTooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
      <p className="text-xs font-bold text-gray-700 mb-1">{d.year}</p>
      {d.uap > 0 && (
        <p className="text-xs text-gray-500 mb-1">{d.uap} UAP events documented</p>
      )}
      {d.burischEvents.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs font-medium" style={{ color: BURISCH_COLOR }}>Burisch:</p>
          {d.burischEvents.map((e, i) => (
            <p key={i} className="text-xs text-gray-600 pl-2 leading-tight">· {e.event}</p>
          ))}
        </div>
      )}
      {d.lazarEvents.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs font-medium" style={{ color: LAZAR_COLOR }}>Lazar:</p>
          {d.lazarEvents.map((e, i) => (
            <p key={i} className="text-xs text-gray-600 pl-2 leading-tight">· {e.event}</p>
          ))}
        </div>
      )}
      {d.gruschEvents.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs font-medium" style={{ color: GRUSCH_COLOR }}>Grusch:</p>
          {d.gruschEvents.map((e, i) => (
            <p key={i} className="text-xs text-gray-600 pl-2 leading-tight">· {e.event}</p>
          ))}
        </div>
      )}
      {d.elizondoEvents.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs font-medium" style={{ color: ELIZONDO_COLOR }}>Elizondo:</p>
          {d.elizondoEvents.map((e, i) => (
            <p key={i} className="text-xs text-gray-600 pl-2 leading-tight">· {e.event}</p>
          ))}
        </div>
      )}
      {d.fravorEvents.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs font-medium" style={{ color: FRAVOR_COLOR }}>Fravor:</p>
          {d.fravorEvents.map((e, i) => (
            <p key={i} className="text-xs text-gray-600 pl-2 leading-tight">· {e.event}</p>
          ))}
        </div>
      )}
      {d.nellEvents.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs font-medium" style={{ color: NELL_COLOR }}>Nell:</p>
          {d.nellEvents.map((e, i) => (
            <p key={i} className="text-xs text-gray-600 pl-2 leading-tight">· {e.event}</p>
          ))}
        </div>
      )}
      {d.nolanEvents.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs font-medium" style={{ color: NOLAN_COLOR }}>Nolan:</p>
          {d.nolanEvents.map((e, i) => (
            <p key={i} className="text-xs text-gray-600 pl-2 leading-tight">· {e.event}</p>
          ))}
        </div>
      )}
      {d.puthoffEvents.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs font-medium" style={{ color: PUTHOFF_COLOR }}>Puthoff:</p>
          {d.puthoffEvents.map((e, i) => (
            <p key={i} className="text-xs text-gray-600 pl-2 leading-tight">· {e.event}</p>
          ))}
        </div>
      )}
      {d.mellonEvents.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs font-medium" style={{ color: MELLON_COLOR }}>Mellon:</p>
          {d.mellonEvents.map((e, i) => (
            <p key={i} className="text-xs text-gray-600 pl-2 leading-tight">· {e.event}</p>
          ))}
        </div>
      )}
      {d.davisEvents.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs font-medium" style={{ color: DAVIS_COLOR }}>Davis:</p>
          {d.davisEvents.map((e, i) => (
            <p key={i} className="text-xs text-gray-600 pl-2 leading-tight">· {e.event}</p>
          ))}
        </div>
      )}
      {d.bigelowEvents.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs font-medium" style={{ color: BIGELOW_COLOR }}>Bigelow:</p>
          {d.bigelowEvents.map((e, i) => (
            <p key={i} className="text-xs text-gray-600 pl-2 leading-tight">· {e.event}</p>
          ))}
        </div>
      )}
      {d.valleeEvents.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs font-medium" style={{ color: VALLEE_COLOR }}>Vallée:</p>
          {d.valleeEvents.map((e, i) => (
            <p key={i} className="text-xs text-gray-600 pl-2 leading-tight">· {e.event}</p>
          ))}
        </div>
      )}
      {d.popeEvents.length > 0 && (
        <div className="mt-1.5 space-y-0.5">
          <p className="text-xs font-medium" style={{ color: POPE_COLOR }}>Pope:</p>
          {d.popeEvents.map((e, i) => (
            <p key={i} className="text-xs text-gray-600 pl-2 leading-tight">· {e.event}</p>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Custom dot for the swimlane scatter ────────────────────── */

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: WBEvent;
}

const SwimlaneDot: FC<DotProps> = ({ cx = 0, cy = 0, payload }) => {
  if (!payload) return null;
  const color = payload.source === 'burisch' ? BURISCH_COLOR : payload.source === 'grusch' ? GRUSCH_COLOR : payload.source === 'elizondo' ? ELIZONDO_COLOR : payload.source === 'fravor' ? FRAVOR_COLOR : payload.source === 'nell' ? NELL_COLOR : payload.source === 'nolan' ? NOLAN_COLOR : payload.source === 'puthoff' ? PUTHOFF_COLOR : payload.source === 'mellon' ? MELLON_COLOR : payload.source === 'davis' ? DAVIS_COLOR : payload.source === 'bigelow' ? BIGELOW_COLOR : payload.source === 'vallee' ? VALLEE_COLOR : payload.source === 'pope' ? POPE_COLOR : LAZAR_COLOR;
  return (
    <g>
      <line x1={cx} y1={cy - 8} x2={cx} y2={cy + 8} stroke={color} strokeWidth={1.5} opacity={0.4} />
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={1.5} />
    </g>
  );
};

/* ─── Swimlane tooltip ───────────────────────────────────────── */

interface SwimlaneTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: WBEvent & { x: number; y: number } }>;
}

const SwimlaneTooltip: FC<SwimlaneTooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const color = d.source === 'burisch' ? BURISCH_COLOR : d.source === 'grusch' ? GRUSCH_COLOR : d.source === 'elizondo' ? ELIZONDO_COLOR : d.source === 'fravor' ? FRAVOR_COLOR : d.source === 'nell' ? NELL_COLOR : d.source === 'nolan' ? NOLAN_COLOR : d.source === 'puthoff' ? PUTHOFF_COLOR : d.source === 'mellon' ? MELLON_COLOR : d.source === 'davis' ? DAVIS_COLOR : d.source === 'bigelow' ? BIGELOW_COLOR : d.source === 'vallee' ? VALLEE_COLOR : d.source === 'pope' ? POPE_COLOR : LAZAR_COLOR;
  const sourceName = d.source === 'burisch' ? 'Dan Burisch' : d.source === 'grusch' ? 'David Grusch' : d.source === 'elizondo' ? 'Luis Elizondo' : d.source === 'fravor' ? 'David Fravor' : d.source === 'nell' ? 'Karl Nell' : d.source === 'nolan' ? 'Garry Nolan' : d.source === 'puthoff' ? 'Hal Puthoff' : d.source === 'mellon' ? 'Chris Mellon' : d.source === 'davis' ? 'Eric Davis' : d.source === 'bigelow' ? 'Robert Bigelow' : d.source === 'vallee' ? 'Jacques Vallée' : d.source === 'pope' ? 'Nick Pope' : 'Bob Lazar';
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <p className="text-xs font-bold capitalize" style={{ color }}>
          {sourceName} · {d.x}
        </p>
      </div>
      <p className="text-xs text-gray-600 leading-tight">{d.event}</p>
      {d.category && (
        <p className="text-xs text-gray-400 mt-0.5 capitalize">{d.category.replace(/-/g, ' ')}</p>
      )}
    </div>
  );
};

/* ─── Main component ─────────────────────────────────────────── */

const TimelineOverlay: FC<Props> = ({ uapEntries, insiderEvents }) => {
  const [showAllYears, setShowAllYears] = useState(false);

  const yearStart = showAllYears ? 1947 : YEAR_START;
  const yearEnd   = YEAR_END;

  // Build per-year UAP counts
  const uapByYear: Record<number, number> = {};
  for (const e of uapEntries) {
    if (e.year >= yearStart && e.year <= yearEnd) {
      uapByYear[e.year] = (uapByYear[e.year] ?? 0) + 1;
    }
  }

  // Build bar chart data with embedded insider events for tooltip
  const wbByYear: Record<number, WBEvent[]> = {};
  for (const e of insiderEvents) {
    if (e.year >= yearStart && e.year <= yearEnd) {
      (wbByYear[e.year] = wbByYear[e.year] ?? []).push(e);
    }
  }

  const barData = Array.from(
    { length: yearEnd - yearStart + 1 },
    (_, i) => {
      const year = yearStart + i;
      const yearWB = wbByYear[year] ?? [];
      return {
        year,
        uap: uapByYear[year] ?? 0,
        burischEvents:  yearWB.filter(e => e.source === 'burisch'),
        lazarEvents:    yearWB.filter(e => e.source === 'lazar'),
        gruschEvents:   yearWB.filter(e => e.source === 'grusch'),
        elizondoEvents: yearWB.filter(e => e.source === 'elizondo'),
        fravorEvents:   yearWB.filter(e => e.source === 'fravor'),
        nellEvents:     yearWB.filter(e => e.source === 'nell'),
        nolanEvents:    yearWB.filter(e => e.source === 'nolan'),
        puthoffEvents:  yearWB.filter(e => e.source === 'puthoff'),
        mellonEvents:   yearWB.filter(e => e.source === 'mellon'),
        davisEvents:    yearWB.filter(e => e.source === 'davis'),
        bigelowEvents:  yearWB.filter(e => e.source === 'bigelow'),
        valleeEvents:   yearWB.filter(e => e.source === 'vallee'),
        popeEvents:     yearWB.filter(e => e.source === 'pope'),
      };
    }
  );

  // Scatter data for swimlanes
  const burischDots: Array<WBEvent & { x: number; y: number }> =
    insiderEvents
      .filter(e => e.source === 'burisch' && e.year >= yearStart && e.year <= yearEnd)
      .map(e => ({ ...e, x: e.year, y: 1 }));

  const lazarDots: Array<WBEvent & { x: number; y: number }> =
    insiderEvents
      .filter(e => e.source === 'lazar' && e.year >= yearStart && e.year <= yearEnd)
      .map(e => ({ ...e, x: e.year, y: 0 }));

  const gruschDots: Array<WBEvent & { x: number; y: number }> =
    insiderEvents
      .filter(e => e.source === 'grusch' && e.year >= yearStart && e.year <= yearEnd)
      .map(e => ({ ...e, x: e.year, y: 2 }));

  const elizondoDots: Array<WBEvent & { x: number; y: number }> =
    insiderEvents
      .filter(e => e.source === 'elizondo' && e.year >= yearStart && e.year <= yearEnd)
      .map(e => ({ ...e, x: e.year, y: 3 }));

  const fravorDots: Array<WBEvent & { x: number; y: number }> =
    insiderEvents
      .filter(e => e.source === 'fravor' && e.year >= yearStart && e.year <= yearEnd)
      .map(e => ({ ...e, x: e.year, y: 4 }));

  const nellDots: Array<WBEvent & { x: number; y: number }> =
    insiderEvents
      .filter(e => e.source === 'nell' && e.year >= yearStart && e.year <= yearEnd)
      .map(e => ({ ...e, x: e.year, y: 5 }));

  const nolanDots: Array<WBEvent & { x: number; y: number }> =
    insiderEvents
      .filter(e => e.source === 'nolan' && e.year >= yearStart && e.year <= yearEnd)
      .map(e => ({ ...e, x: e.year, y: 6 }));

  const puthoffDots: Array<WBEvent & { x: number; y: number }> =
    insiderEvents
      .filter(e => e.source === 'puthoff' && e.year >= yearStart && e.year <= yearEnd)
      .map(e => ({ ...e, x: e.year, y: 7 }));

  const mellonDots: Array<WBEvent & { x: number; y: number }> =
    insiderEvents
      .filter(e => e.source === 'mellon' && e.year >= yearStart && e.year <= yearEnd)
      .map(e => ({ ...e, x: e.year, y: 8 }));

  const davisDots: Array<WBEvent & { x: number; y: number }> =
    insiderEvents
      .filter(e => e.source === 'davis' && e.year >= yearStart && e.year <= yearEnd)
      .map(e => ({ ...e, x: e.year, y: 9 }));

  const bigelowDots: Array<WBEvent & { x: number; y: number }> =
    insiderEvents
      .filter(e => e.source === 'bigelow' && e.year >= yearStart && e.year <= yearEnd)
      .map(e => ({ ...e, x: e.year, y: 10 }));

  const valleeDots: Array<WBEvent & { x: number; y: number }> =
    insiderEvents
      .filter(e => e.source === 'vallee' && e.year >= yearStart && e.year <= yearEnd)
      .map(e => ({ ...e, x: e.year, y: 11 }));

  const popeDots: Array<WBEvent & { x: number; y: number }> =
    insiderEvents
      .filter(e => e.source === 'pope' && e.year >= yearStart && e.year <= yearEnd)
      .map(e => ({ ...e, x: e.year, y: 12 }));

  const xDomain: [number, number] = [yearStart, yearEnd];
  const xTicks = Array.from(
    { length: Math.floor((yearEnd - yearStart) / 5) + 1 },
    (_, i) => yearStart + i * 5
  );

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Timeline Overlay</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Insider key events mapped against the global UAP event record
          </p>
        </div>
        <button
          onClick={() => setShowAllYears(v => !v)}
          className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
            showAllYears
              ? 'bg-primary text-white border-primary'
              : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
          }`}
        >
          {showAllYears ? 'Modern era (1985+)' : 'Show from 1947'}
        </button>
      </div>

      {/* UAP frequency bar chart */}
      <div>
        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">UAP Events / Year</p>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis
                dataKey="year"
                type="number"
                domain={xDomain}
                ticks={xTicks}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
                width={28}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(0,119,204,0.06)' }} />
              <Bar dataKey="uap" radius={[2, 2, 0, 0]} maxBarSize={16}>
                {barData.map((d, i) => {
                  const hasWB = d.burischEvents.length > 0 || d.lazarEvents.length > 0 || d.gruschEvents.length > 0 || d.elizondoEvents.length > 0 || d.fravorEvents.length > 0 || d.nellEvents.length > 0 || d.nolanEvents.length > 0 || d.puthoffEvents.length > 0 || d.mellonEvents.length > 0 || d.davisEvents.length > 0 || d.bigelowEvents.length > 0 || d.valleeEvents.length > 0 || d.popeEvents.length > 0;
                  return (
                    <Cell
                      key={i}
                      fill={hasWB ? '#0077cc' : UAP_COLOR}
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Swimlane scatter panel */}
      <div>
        <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide font-medium">Insider Events</p>
        <div style={{ height: 365 }} className="flex items-stretch">
          {/* Row labels column — fixed width, never overlaps the chart */}
          <div className="flex flex-col justify-around shrink-0 pr-2" style={{ width: 56 }}>
            <span className="text-xs font-medium text-right leading-none" style={{ color: POPE_COLOR }}>Pope</span>
            <span className="text-xs font-medium text-right leading-none" style={{ color: VALLEE_COLOR }}>Vallée</span>
            <span className="text-xs font-medium text-right leading-none" style={{ color: BIGELOW_COLOR }}>Bigelow</span>
            <span className="text-xs font-medium text-right leading-none" style={{ color: DAVIS_COLOR }}>Davis</span>
            <span className="text-xs font-medium text-right leading-none" style={{ color: MELLON_COLOR }}>Mellon</span>
            <span className="text-xs font-medium text-right leading-none" style={{ color: PUTHOFF_COLOR }}>Puthoff</span>
            <span className="text-xs font-medium text-right leading-none" style={{ color: NOLAN_COLOR }}>Nolan</span>
            <span className="text-xs font-medium text-right leading-none" style={{ color: NELL_COLOR }}>Nell</span>
            <span className="text-xs font-medium text-right leading-none" style={{ color: FRAVOR_COLOR }}>Fravor</span>
            <span className="text-xs font-medium text-right leading-none" style={{ color: ELIZONDO_COLOR }}>Elizondo</span>
            <span className="text-xs font-medium text-right leading-none" style={{ color: GRUSCH_COLOR }}>Grusch</span>
            <span className="text-xs font-medium text-right leading-none" style={{ color: BURISCH_COLOR }}>Burisch</span>
            <span className="text-xs font-medium text-right leading-none" style={{ color: LAZAR_COLOR }}>Lazar</span>
          </div>
          {/* Chart — takes remaining width */}
          <div style={{ flex: 1, height: 365 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 8, right: 4, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis
                dataKey="x"
                type="number"
                domain={xDomain}
                ticks={xTicks}
                tick={{ fontSize: 10, fill: '#9ca3af' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                dataKey="y"
                type="number"
                domain={[-0.5, 12.5]}
                hide
              />
              <Tooltip content={<SwimlaneTooltip />} cursor={false} />
              <Scatter data={lazarDots}    shape={<SwimlaneDot />} name="Bob Lazar" />
              <Scatter data={burischDots}  shape={<SwimlaneDot />} name="Dan Burisch" />
              <Scatter data={gruschDots}   shape={<SwimlaneDot />} name="David Grusch" />
              <Scatter data={elizondoDots} shape={<SwimlaneDot />} name="Luis Elizondo" />
              <Scatter data={fravorDots}   shape={<SwimlaneDot />} name="David Fravor" />
              <Scatter data={nellDots}     shape={<SwimlaneDot />} name="Karl Nell" />
              <Scatter data={nolanDots}    shape={<SwimlaneDot />} name="Garry Nolan" />
              <Scatter data={puthoffDots}  shape={<SwimlaneDot />} name="Hal Puthoff" />
              <Scatter data={mellonDots}   shape={<SwimlaneDot />} name="Chris Mellon" />
              <Scatter data={davisDots}    shape={<SwimlaneDot />} name="Eric Davis" />
              <Scatter data={bigelowDots}  shape={<SwimlaneDot />} name="Robert Bigelow" />
              <Scatter data={valleeDots}   shape={<SwimlaneDot />} name="Jacques Vallée" />
              <Scatter data={popeDots}     shape={<SwimlaneDot />} name="Nick Pope" />
            </ScatterChart>
          </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Legend note */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-400 pt-1 border-t border-gray-100">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#0077cc] inline-block" />
          UAP events in an insider-active year
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#93c5e8] inline-block" />
          Other UAP events
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: BURISCH_COLOR }} />
          Burisch key event
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: LAZAR_COLOR }} />
          Lazar key event
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: GRUSCH_COLOR }} />
          Grusch key event
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: ELIZONDO_COLOR }} />
          Elizondo key event
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: NOLAN_COLOR }} />
          Nolan key event
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: PUTHOFF_COLOR }} />
          Puthoff key event
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: MELLON_COLOR }} />
          Mellon key event
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: DAVIS_COLOR }} />
          Davis key event
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: BIGELOW_COLOR }} />
          Bigelow key event
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: VALLEE_COLOR }} />
          Vallée key event
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: POPE_COLOR }} />
          Pope key event
        </span>
      </div>
    </div>
  );
};

export { extractYear };
export default TimelineOverlay;
