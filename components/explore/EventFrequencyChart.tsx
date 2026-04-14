import { FC, useState } from 'react';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import {
  ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
} from 'recharts';
import { TimelineEntry } from '../../lib/timelineData';
import yearlyCounts from '../../data/ufosint/yearly-counts.json';

interface Props {
  entries: TimelineEntry[];
  onSelectEra?: (start: number, end: number) => void;
  onClearEra?: () => void;
  activeEraStart?: number | null;
}

type GroupBy = 'decade' | 'era';

const ERA_LABELS: Array<{ label: string; min: number; max: number }> = [
  { label: 'Pre-1900',   min: 0,    max: 1899 },
  { label: '1900–1944', min: 1900, max: 1944 },
  { label: '1945–1969', min: 1945, max: 1969 },
  { label: '1970–1999', min: 1970, max: 1999 },
  { label: '2000–2019', min: 2000, max: 2019 },
  { label: '2020–Now',  min: 2020, max: 9999 },
];

interface ChartDatum {
  label: string;
  count: number;
  yearStart: number;
  yearEnd: number;
  notable?: boolean;
  ufosintCount?: number; // summed UFOSINT sightings for this period
}

/** Sum UFOSINT yearly counts across a year range [from, to] inclusive */
function sumUfosint(from: number, to: number): number {
  const data = yearlyCounts as Record<string, number>;
  let total = 0;
  for (let y = from; y <= to; y++) {
    total += data[String(y)] ?? 0;
  }
  return total;
}

function groupByDecade(entries: TimelineEntry[]): ChartDatum[] {
  const counts: Record<number, number> = {};
  for (const e of entries) {
    const decade = Math.floor(e.year / 10) * 10;
    counts[decade] = (counts[decade] ?? 0) + 1;
  }
  const NOTABLE = new Set([1940, 1950, 1960, 1970, 1980, 2010, 2020]);
  return Object.entries(counts)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([decade, count]) => {
      const start = Number(decade);
      const end = start + 9;
      return {
        label: `${decade}s`,
        count,
        yearStart: start,
        yearEnd: end,
        notable: NOTABLE.has(start),
        ufosintCount: sumUfosint(start, end),
      };
    });
}

function groupByEra(entries: TimelineEntry[]): ChartDatum[] {
  const currentYear = new Date().getFullYear();
  return ERA_LABELS.map(era => {
    const from = era.min === 0 ? 1561 : era.min;
    const to = era.max === 9999 ? currentYear : era.max;
    return {
      label: era.label,
      count: entries.filter(e => e.year >= era.min && e.year <= era.max).length,
      yearStart: from,
      yearEnd: to,
      notable: false,
      ufosintCount: sumUfosint(Math.max(from, 1947), to), // UFOSINT data starts 1947
    };
  });
}

interface CustomTooltipProps {
  active?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  payload?: Array<{ value: number; dataKey: string; color: string; name: string }>;
  label?: string;
  showUfosint: boolean;
}

const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload, label, showUfosint }) => {
  if (!active || !payload?.length) return null;
  const decurEntry = payload.find(p => p.dataKey === 'count');
  const ufosintEntry = payload.find(p => p.dataKey === 'ufosintCount');
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg px-3 py-2 space-y-1">
      <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{label}</p>
      {decurEntry && (
        <p className="text-sm font-bold text-primary">{decurEntry.value.toLocaleString()} DECUR events</p>
      )}
      {showUfosint && ufosintEntry && ufosintEntry.value > 0 && (
        <p className="text-sm font-bold text-amber-500">{ufosintEntry.value.toLocaleString()} UFOSINT sightings</p>
      )}
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Click to view on Timeline</p>
    </div>
  );
};

const EventFrequencyChart: FC<Props> = ({ entries, onSelectEra, onClearEra, activeEraStart }) => {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [groupBy, setGroupBy] = useState<GroupBy>('decade');
  const [showUfosint, setShowUfosint] = useState(false);

  const data = groupBy === 'decade' ? groupByDecade(entries) : groupByEra(entries);
  const maxCount = Math.max(...data.map(d => d.count));

  function handleBarClick(datum: ChartDatum) {
    if (onSelectEra) {
      if (activeEraStart === datum.yearStart && onClearEra) {
        onClearEra();
      } else {
        onSelectEra(datum.yearStart, datum.yearEnd);
      }
    } else {
      router.push(`/timeline?year=${datum.yearStart}`);
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg">Event Frequency</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {activeEraStart != null
              ? 'Tap the highlighted bar again to deselect'
              : 'Tap a bar to filter the timeline overlay below'}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* UFOSINT overlay toggle */}
          <button
            onClick={() => setShowUfosint(v => !v)}
            title="Overlay 614k UFOSINT sightings (1947-present)"
            className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium border transition-colors ${
              showUfosint
                ? 'bg-amber-50 dark:bg-amber-900/30 border-amber-400 text-amber-600 dark:text-amber-400'
                : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-amber-300 hover:text-amber-500'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${showUfosint ? 'bg-amber-400' : 'bg-gray-300 dark:bg-gray-500'}`} />
            UFOSINT Sightings
          </button>

          {/* Decade / Era grouping */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
            {(['decade', 'era'] as GroupBy[]).map(g => (
              <button
                key={g}
                onClick={() => setGroupBy(g)}
                className={`text-xs px-3 py-1 rounded-md font-medium transition-colors capitalize ${
                  groupBy === g
                    ? 'bg-white dark:bg-gray-600 text-primary shadow-sm'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 4, right: showUfosint ? 40 : 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#f0f0f0'} vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval={groupBy === 'decade' ? 2 : 0}
            />
            {/* Primary Y axis - DECUR event counts */}
            <YAxis
              yAxisId="decur"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            {/* Secondary Y axis - UFOSINT sighting volume (only shown when overlay active) */}
            {showUfosint && (
              <YAxis
                yAxisId="ufosint"
                orientation="right"
                tick={{ fontSize: 10, fill: '#f59e0b' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => v >= 1000 ? `${Math.round(v / 1000)}k` : String(v)}
              />
            )}
            <Tooltip
              content={<CustomTooltip showUfosint={showUfosint} />}
              cursor={{ fill: 'rgba(46,92,138,0.06)' }}
            />
            <Bar
              yAxisId="decur"
              dataKey="count"
              radius={[4, 4, 0, 0]}
              maxBarSize={48}
              cursor="pointer"
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              onClick={(datum: any) => handleBarClick(datum as ChartDatum)}
            >
              {data.map((d, i) => {
                const isActive = activeEraStart === d.yearStart;
                const baseColor = d.count === maxCount ? '#2e5c8a' : d.notable ? '#4a7eaa' : '#a8bfd4';
                return (
                  <Cell
                    key={i}
                    fill={isActive ? '#1e3f62' : baseColor}
                    stroke={isActive ? '#1e3f62' : 'none'}
                    strokeWidth={isActive ? 2 : 0}
                    opacity={activeEraStart != null && !isActive ? 0.4 : 1}
                  />
                );
              })}
            </Bar>

            {/* UFOSINT overlay line - only rendered when toggle is active */}
            {showUfosint && (
              <Line
                yAxisId="ufosint"
                type="monotone"
                dataKey="ufosintCount"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="5 3"
                dot={{ r: 3, fill: '#f59e0b', strokeWidth: 0 }}
                activeDot={{ r: 5, fill: '#f59e0b', strokeWidth: 0 }}
                name="UFOSINT Sightings"
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="flex gap-4 text-xs text-gray-400 dark:text-gray-500 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#2e5c8a] inline-block" />
          Peak period
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#a8bfd4] inline-block" />
          Other periods
        </span>
        {showUfosint && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-5 border-t-2 border-dashed border-amber-400" />
            UFOSINT sightings (614k database, right axis)
          </span>
        )}
      </div>
    </div>
  );
};

export default EventFrequencyChart;
