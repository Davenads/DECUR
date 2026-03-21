import { FC, useState } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ScatterChart, Scatter, Cell,
} from 'recharts';
import { TimelineEntry } from '../../lib/timelineData';

/* ─── Types ──────────────────────────────────────────────────── */

export interface WBEvent {
  year: number;
  event: string;
  category?: string;
  source: string;
}

export interface CaseEvent {
  year: number;
  name: string;
  id: string;
  evidence_tier: 'tier-1' | 'tier-2';
  location: string;
  classification_status: string;
}

interface Props {
  uapEntries: TimelineEntry[];
  insiderEvents: WBEvent[];
  caseEvents?: CaseEvent[];
  focusEra?: { start: number; end: number; label: string } | null;
  onClearFocus?: () => void;
}

/* ─── Source config ───────────────────────────────────────────
   Add a new entry here when a new profile is added to the registry.
   Color and label are the only things that need to be defined per-person.
   Everything else (swimlane position, tooltip, legend) is derived automatically.
─────────────────────────────────────────────────────────────── */

interface SourceConfig {
  label: string;
  color: string;
}

// Keys must match the registry IDs in data/key-figures/registry.ts exactly.
const SOURCE_CONFIG: Record<string, SourceConfig> = {
  'dan-burisch':   { label: 'Dan Burisch',    color: '#8b5cf6' },
  'bob-lazar':     { label: 'Bob Lazar',       color: '#3b82f6' },
  'david-grusch':  { label: 'David Grusch',   color: '#ef4444' },
  'luis-elizondo': { label: 'Luis Elizondo',  color: '#10b981' },
  'david-fravor':  { label: 'David Fravor',   color: '#f59e0b' },
  'karl-nell':     { label: 'Karl Nell',       color: '#14b8a6' },
  'garry-nolan':   { label: 'Garry Nolan',    color: '#ec4899' },
  'hal-puthoff':   { label: 'Hal Puthoff',    color: '#6366f1' },
  'chris-mellon':  { label: 'Chris Mellon',   color: '#d97706' },
  'eric-davis':    { label: 'Eric Davis',      color: '#f43f5e' },
  'robert-bigelow':{ label: 'Robert Bigelow', color: '#84cc16' },
  'jacques-vallee':{ label: 'Jacques Vallee', color: '#06b6d4' },
  'nick-pope':     { label: 'Nick Pope',       color: '#f97316' },
  'jake-barber':   { label: 'Jake Barber',    color: '#a3e635' },
  'tim-gallaudet': { label: 'Tim Gallaudet',  color: '#1d4ed8' },
  'harry-reid':    { label: 'Harry Reid',      color: '#64748b' },
  'j-allen-hynek': { label: 'J. Allen Hynek', color: '#b45309' },
  'george-knapp':  { label: 'George Knapp',   color: '#0d9488' },
  'leslie-kean':   { label: 'Leslie Kean',    color: '#a855f7' },
  'ryan-graves':   { label: 'Ryan Graves',    color: '#22d3ee' },
  'ross-coulthart':{ label: 'Ross Coulthart', color: '#fb923c' },
  'james-lacatski':{ label: 'James Lacatski', color: '#4ade80' },
  'richard-dolan': { label: 'Richard Dolan',  color: '#e879f9' },
  'daniel-sheehan':{ label: 'Daniel Sheehan', color: '#fbbf24' },
  'chuck-schumer': { label: 'Chuck Schumer',  color: '#38bdf8' },
  'jesse-michels': { label: 'Jesse Michels',  color: '#f472b6' },
  'alex-dietrich': { label: 'Alex Dietrich',  color: '#c084fc' },
  'kevin-day':     { label: 'Kevin Day',       color: '#67e8f9' },
  'john-mack':       { label: 'John Mack',        color: '#86efac' },
  'harald-malmgren': { label: 'Harald Malmgren',  color: '#9f1239' },
  'stanton-friedman': { label: 'Stanton Friedman',  color: '#0ea5e9' },
  'avi-loeb':         { label: 'Avi Loeb',           color: '#a78bfa' },
  'donald-keyhoe':    { label: 'Donald Keyhoe',      color: '#fb7185' },
  'philip-corso':     { label: 'Philip Corso',       color: '#84cc16' },
  'steven-greer':     { label: 'Steven Greer',       color: '#22c55e' },
  'jay-stratton':     { label: 'Jay Stratton',       color: '#0891b2' },
  'robert-hastings':  { label: 'Robert Hastings',    color: '#b45309' },
  'sean-kirkpatrick': { label: 'Sean Kirkpatrick',   color: '#dc2626' },
  'dylan-borland':    { label: 'Dylan Borland',      color: '#34d399' },
  'matthew-brown':    { label: 'Matthew Brown',      color: '#f59e0b' },
  'kit-green':        { label: 'Kit Green',           color: '#7c3aed' },
  'colm-kelleher':    { label: 'Colm Kelleher',       color: '#0284c7' },
  'annie-jacobsen':   { label: 'Annie Jacobsen',      color: '#92400e' },
  'jim-semivan':      { label: 'Jim Semivan',          color: '#b45309' },
  'kirsten-gillibrand': { label: 'Sen. Gillibrand',    color: '#0f766e' },
  'tim-burchett':       { label: 'Rep. Burchett',      color: '#c2410c' },
  'john-burroughs':     { label: 'John Burroughs',     color: '#4d7c0f' },
  'edward-ruppelt':     { label: 'Capt. Ruppelt',      color: '#6b21a8' },
  'james-mcdonald':     { label: 'Dr. McDonald',        color: '#0369a1' },
  'diana-pasulka':      { label: 'Prof. Pasulka',        color: '#be185d' },
  'townsend-brown':     { label: 'T.T. Brown',           color: '#a16207' },
  'thomas-wilson':      { label: 'Adm. Thomas Wilson',   color: '#1d4ed8' },
  'charles-halt':       { label: 'Lt. Col. Charles Halt', color: '#16a34a' },
  'marco-rubio':        { label: 'Sen. Marco Rubio',       color: '#dc2626' },
  'mike-gallagher':     { label: 'Rep. Mike Gallagher',    color: '#b91c1c' },
  'peter-sturrock':     { label: 'Dr. Peter Sturrock',     color: '#0891b2' },
  'nathan-twining':     { label: 'Gen. Nathan Twining',    color: '#7c3aed' },
  'jesse-marcel':       { label: 'Maj. Jesse Marcel Sr.',  color: '#92400e' },
  'james-fox':          { label: 'James Fox',               color: '#0369a1' },
  'fife-symington':     { label: 'Gov. Fife Symington',     color: '#d97706' },
  'michael-herrera':    { label: 'Michael Herrera',         color: '#065f46' },
  'barry-goldwater':    { label: 'Sen. Barry Goldwater',    color: '#b45309' },
  'robert-salas':       { label: 'Capt. Robert Salas',      color: '#0c4a6e' },
  'edgar-mitchell':     { label: 'Dr. Edgar Mitchell',      color: '#0e7490' },
  'tom-delonge':        { label: 'Tom DeLonge',             color: '#a21caf' },
  'john-alexander':     { label: 'Col. John Alexander',     color: '#4d7c0f' },
  'john-callahan':      { label: 'John Callahan',           color: '#15803d' },
};

const UAP_COLOR = '#93c5e8';

function getSourceColor(source: string): string {
  return SOURCE_CONFIG[source]?.color ?? '#6b7280';
}

function getSourceLabel(source: string): string {
  return SOURCE_CONFIG[source]?.label ?? source;
}

const TIER_COLOR: Record<string, string> = {
  'tier-1': '#10b981',
  'tier-2': '#f59e0b',
};

function getTierColor(tier: string): string {
  return TIER_COLOR[tier] ?? '#6b7280';
}

/* ─── Helpers ────────────────────────────────────────────────── */

function extractYear(dateStr: string): number | null {
  const m = dateStr.match(/\b(19\d{2}|20\d{2})\b/);
  return m ? parseInt(m[1]) : null;
}

/* ─── Bar chart tooltip ───────────────────────────────────────── */

interface BarTooltipPayload {
  year: number;
  uap: number;
  eventsBySource: Record<string, WBEvent[]>;
}

interface RechartsTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: BarTooltipPayload }>;
}

const BarTooltip: FC<RechartsTooltipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const sourcesWithEvents = Object.entries(d.eventsBySource).filter(([, evts]) => evts.length > 0);
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs">
      <p className="text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">{d.year}</p>
      {d.uap > 0 && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{d.uap} UAP events documented</p>
      )}
      {sourcesWithEvents.map(([source, evts]) => (
        <div key={source} className="mt-1.5 space-y-0.5">
          <p className="text-xs font-medium" style={{ color: getSourceColor(source) }}>
            {getSourceLabel(source)}:
          </p>
          {evts.map((e, i) => (
            <p key={i} className="text-xs text-gray-600 dark:text-gray-400 pl-2 leading-tight">· {e.event}</p>
          ))}
        </div>
      ))}
    </div>
  );
};

/* ─── Swimlane dot ───────────────────────────────────────────── */

interface DotProps {
  cx?: number;
  cy?: number;
  payload?: WBEvent;
}

const SwimlaneDot: FC<DotProps> = ({ cx = 0, cy = 0, payload }) => {
  if (!payload) return null;
  const color = getSourceColor(payload.source);
  return (
    <g style={{ cursor: 'pointer' }}>
      <line x1={cx} y1={cy - 8} x2={cx} y2={cy + 8} stroke={color} strokeWidth={1.5} opacity={0.4} />
      <circle cx={cx} cy={cy} r={5} fill={color} stroke="#fff" strokeWidth={1.5} />
    </g>
  );
};

/* ─── Case dot (diamond shape) ───────────────────────────────── */

interface CaseDotProps {
  cx?: number;
  cy?: number;
  payload?: CaseEvent & { x: number; y: number };
}

const CaseDot: FC<CaseDotProps> = ({ cx = 0, cy = 0, payload }) => {
  if (!payload) return null;
  const color = getTierColor(payload.evidence_tier);
  const size = 5;
  return (
    <g style={{ cursor: 'pointer' }}>
      <polygon
        points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`}
        fill={color}
        stroke="#fff"
        strokeWidth={1.5}
      />
    </g>
  );
};

/* ─── Case tooltip ───────────────────────────────────────────── */

/* ─── Unified tooltip (handles both insider events and cases) ─── */

interface UnifiedTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: (WBEvent | CaseEvent) & { x: number; y: number } }>;
  showCases: boolean;
}

const UnifiedSwimlaneTooltip: FC<UnifiedTooltipProps> = ({ active, payload, showCases }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;

  // Distinguish case events (have evidence_tier) from insider events (have source)
  if (showCases && 'evidence_tier' in d) {
    const color = getTierColor(d.evidence_tier);
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs">
        <div className="flex items-center gap-1.5 mb-1">
          <svg width="10" height="10" className="shrink-0"><polygon points="5,0 10,5 5,10 0,5" fill={color} /></svg>
          <p className="text-xs font-bold" style={{ color }}>{d.name} · {d.x}</p>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{d.location}</p>
        <p className="text-xs mt-0.5">
          <span className="font-medium" style={{ color }}>{d.evidence_tier.replace('-', ' ').toUpperCase()}</span>
          <span className="text-gray-400 dark:text-gray-500"> · {d.classification_status.replace(/-/g, ' ')}</span>
        </p>
      </div>
    );
  }

  const e = d as WBEvent & { x: number };
  const color = getSourceColor(e.source);
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-3 max-w-xs">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
        <p className="text-xs font-bold" style={{ color }}>
          {getSourceLabel(e.source)} · {e.x}
        </p>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-tight">{e.event}</p>
      {e.category && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 capitalize">{e.category.replace(/-/g, ' ')}</p>
      )}
    </div>
  );
};


/* ─── Main component ─────────────────────────────────────────── */

const YEAR_START = 1985;
const YEAR_END   = 2025;

const TimelineOverlay: FC<Props> = ({ uapEntries, insiderEvents, caseEvents = [], focusEra, onClearFocus }) => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [showAllYears, setShowAllYears] = useState(false);
  const [enabledSources, setEnabledSources] = useState<Set<string> | null>(null);
  const [showCases, setShowCases] = useState(true);

  // focusEra overrides the year range when set
  const yearStart = focusEra ? focusEra.start : (showAllYears ? 1947 : YEAR_START);
  const yearEnd   = focusEra ? focusEra.end : YEAR_END;

  // Derive sorted list of sources present in the data, preserving SOURCE_CONFIG order
  const configOrder = Object.keys(SOURCE_CONFIG);
  const activeSources = Array.from(new Set(insiderEvents.map(e => e.source))).sort(
    (a, b) => {
      const ai = configOrder.indexOf(a);
      const bi = configOrder.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    }
  );

  // null means "all enabled" (default); derive the effective set
  const effectiveEnabled = enabledSources ?? new Set(activeSources);

  function toggleSource(src: string) {
    const next = new Set(effectiveEnabled);
    if (next.has(src)) {
      if (next.size > 1) next.delete(src); // keep at least one
    } else {
      next.add(src);
    }
    // If all are selected again, reset to null (cleaner state)
    setEnabledSources(next.size === activeSources.length ? null : next);
  }

  function selectAll() { setEnabledSources(null); }
  function clearAll()  { setEnabledSources(new Set([activeSources[0]])); }

  const visibleSources = activeSources.filter(s => effectiveEnabled.has(s));

  // Swimlane y-index map (only visible sources)
  const yIndex: Record<string, number> = {};
  visibleSources.forEach((src, i) => { yIndex[src] = i; });
  const swimlaneCount = visibleSources.length;

  // UAP counts by year
  const uapByYear: Record<number, number> = {};
  for (const e of uapEntries) {
    if (e.year >= yearStart && e.year <= yearEnd) {
      uapByYear[e.year] = (uapByYear[e.year] ?? 0) + 1;
    }
  }

  // Group insider events by year (only visible sources)
  const wbByYear: Record<number, WBEvent[]> = {};
  for (const e of insiderEvents) {
    if (e.year >= yearStart && e.year <= yearEnd && effectiveEnabled.has(e.source)) {
      (wbByYear[e.year] = wbByYear[e.year] ?? []).push(e);
    }
  }

  // Bar chart data
  const barData = Array.from({ length: yearEnd - yearStart + 1 }, (_, i) => {
    const year = yearStart + i;
    const yearWB = wbByYear[year] ?? [];
    const eventsBySource: Record<string, WBEvent[]> = {};
    for (const src of visibleSources) {
      eventsBySource[src] = yearWB.filter(e => e.source === src);
    }
    return { year, uap: uapByYear[year] ?? 0, eventsBySource };
  });

  // Scatter data per source (only visible)
  const scatterBySrc: Record<string, Array<WBEvent & { x: number; y: number }>> = {};
  for (const src of visibleSources) {
    scatterBySrc[src] = insiderEvents
      .filter(e => e.source === src && e.year >= yearStart && e.year <= yearEnd)
      .map(e => ({ ...e, x: e.year, y: yIndex[src] }));
  }

  // Cases: placed in their own swimlane at y = swimlaneCount (below insider rows)
  const visibleCases = showCases
    ? caseEvents.filter(c => c.year >= yearStart && c.year <= yearEnd)
    : [];
  const caseSwimlaneY = swimlaneCount; // one row below all insider rows
  const caseScatterData = visibleCases.map(c => ({ ...c, x: c.year, y: caseSwimlaneY }));

  const xDomain: [number, number] = [yearStart, yearEnd];
  const xTicks = Array.from(
    { length: Math.floor((yearEnd - yearStart) / 5) + 1 },
    (_, i) => yearStart + i * 5
  );

  const totalRows = swimlaneCount + (showCases && caseEvents.length > 0 ? 1 : 0);
  const swimlaneHeight = Math.max(260, totalRows * 28);
  const yDomainMax = Math.max(totalRows - 1, 1);

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Timeline Overlay</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {focusEra ? (
              <span className="inline-flex items-center gap-2 flex-wrap">
                <span>Filtered to</span>
                <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary text-xs font-semibold px-2.5 py-1 rounded-full">
                  {focusEra.label}
                  <button
                    onClick={onClearFocus}
                    aria-label="Clear era filter"
                    className="ml-0.5 hover:text-primary-dark transition-colors"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              </span>
            ) : 'Insider key events mapped against the global UAP event record'}
          </p>
        </div>
        {!focusEra && (
          <button
            onClick={() => setShowAllYears(v => !v)}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors border ${
              showAllYears
                ? 'bg-primary text-white border-primary'
                : 'bg-white dark:bg-gray-700 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
            }`}
          >
            {showAllYears ? 'Modern era (1985+)' : 'Show from 1947'}
          </button>
        )}
      </div>

      {/* Source filter */}
      <div className="border border-gray-100 dark:border-gray-800 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Filter Sources</span>
          <div className="flex gap-2">
            <button
              onClick={selectAll}
              className="text-xs text-primary hover:underline disabled:opacity-40"
              disabled={enabledSources === null}
            >
              All
            </button>
            <span className="text-xs text-gray-300 dark:text-gray-600">|</span>
            <button
              onClick={clearAll}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:underline"
            >
              Clear
            </button>
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {caseEvents.length > 0 && (
            <button
              onClick={() => setShowCases(v => !v)}
              className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                showCases ? 'opacity-100' : 'opacity-35'
              }`}
              style={showCases ? {
                borderColor: TIER_COLOR['tier-1'],
                backgroundColor: `${TIER_COLOR['tier-1']}18`,
                color: TIER_COLOR['tier-1'],
              } : {
                borderColor: isDark ? '#374151' : '#e5e7eb',
                backgroundColor: 'transparent',
                color: '#9ca3af',
              }}
            >
              Cases
            </button>
          )}
          {activeSources.map(src => {
            const enabled = effectiveEnabled.has(src);
            const color = getSourceColor(src);
            return (
              <button
                key={src}
                onClick={() => toggleSource(src)}
                className={`text-xs px-2.5 py-1 rounded-full border font-medium transition-all ${
                  enabled ? 'opacity-100' : 'opacity-35'
                }`}
                style={enabled ? {
                  borderColor: color,
                  backgroundColor: `${color}18`,
                  color,
                } : {
                  borderColor: isDark ? '#374151' : '#e5e7eb',
                  backgroundColor: 'transparent',
                  color: '#9ca3af',
                }}
              >
                {getSourceLabel(src).split(' ').pop()}
              </button>
            );
          })}
        </div>
      </div>

      {/* UAP frequency bar chart */}
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wide font-medium">UAP Events / Year</p>
        <div style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} vertical={false} />
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
                width={72}
              />
              <Tooltip content={<BarTooltip />} cursor={{ fill: 'rgba(0,119,204,0.06)' }} wrapperStyle={{ zIndex: 50 }} />
              <Bar dataKey="uap" radius={[2, 2, 0, 0]} maxBarSize={16}>
                {barData.map((d, i) => {
                  const hasWB = Object.values(d.eventsBySource).some(evts => evts.length > 0);
                  return <Cell key={i} fill={hasWB ? '#0077cc' : UAP_COLOR} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Swimlane scatter panel */}
      <div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-1 uppercase tracking-wide font-medium">Insider Events</p>
        <div style={{ height: swimlaneHeight }} className="flex items-stretch">
          {/* Row labels */}
          <div className="flex flex-col justify-around shrink-0 pr-2" style={{ width: 72 }}>
            {showCases && caseEvents.length > 0 && (
              <span className="text-xs font-medium text-right leading-none" style={{ color: TIER_COLOR['tier-1'] }}>
                Cases
              </span>
            )}
            {[...visibleSources].reverse().map(src => (
              <span
                key={src}
                className="text-xs font-medium text-right leading-none"
                style={{ color: getSourceColor(src) }}
              >
                {SOURCE_CONFIG[src]?.label.split(' ').pop() ?? src}
              </span>
            ))}
          </div>
          {/* Chart */}
          <div style={{ flex: 1, height: swimlaneHeight }}>
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={{ top: 8, right: 4, left: 0, bottom: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} horizontal={false} />
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
                  domain={[-0.5, yDomainMax + 0.5]}
                  hide
                />
                <Tooltip content={<UnifiedSwimlaneTooltip showCases={showCases} />} cursor={false} />
                {visibleSources.map(src => (
                  <Scatter
                    key={src}
                    data={scatterBySrc[src]}
                    shape={<SwimlaneDot />}
                    name={getSourceLabel(src)}
                    onClick={(data) => {
                      const source = (data as unknown as WBEvent).source;
                      if (source) router.push(`/figures/${source}`);
                    }}
                  />
                ))}
                {showCases && caseScatterData.length > 0 && (
                  <Scatter
                    data={caseScatterData}
                    shape={<CaseDot />}
                    name="Cases"
                    onClick={(data) => {
                      const id = (data as unknown as CaseEvent).id;
                      if (id) router.push(`/cases/${id}`);
                    }}
                  />
                )}
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-400 dark:text-gray-500 pt-1 border-t border-gray-100 dark:border-gray-800">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#0077cc] inline-block" />
          UAP events in an insider-active year
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#93c5e8] inline-block" />
          Other UAP events
        </span>
        {showCases && caseEvents.length > 0 && (
          <>
            <span className="flex items-center gap-1.5">
              <svg width="10" height="10" className="shrink-0"><polygon points="5,0 10,5 5,10 0,5" fill={TIER_COLOR['tier-1']} /></svg>
              Tier 1 case
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="10" height="10" className="shrink-0"><polygon points="5,0 10,5 5,10 0,5" fill={TIER_COLOR['tier-2']} /></svg>
              Tier 2 case
            </span>
          </>
        )}
        {visibleSources.map(src => (
          <span key={src} className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full inline-block"
              style={{ backgroundColor: getSourceColor(src) }}
            />
            {getSourceLabel(src)}
          </span>
        ))}
      </div>
    </div>
  );
};

export { extractYear };
export default TimelineOverlay;
