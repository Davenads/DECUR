import { useMemo, useState } from 'react';
import {
  ComposedChart,
  Bar,
  Cell,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import { useTheme } from 'next-themes';
import yearlyCounts from '../../data/ufosint/yearly-counts.json';
import timelineData from '../../data/timeline.json';

/* ── Types ──────────────────────────────────────────────────────────── */

interface TimelineEntry {
  year: number;
  [key: string]: unknown;
}

interface ChartDatum {
  year: number;
  sightings: number;
  events: number;
}

/* ── Data prep ──────────────────────────────────────────────────────── */

const COUNTS = yearlyCounts as Record<string, number>;
const TIMELINE = timelineData as TimelineEntry[];

// Only show years where UFOSINT has data (1947-2025, exclude 2026 partial)
const START_YEAR = 1947;
const END_YEAR = 2025;

function buildChartData(): ChartDatum[] {
  // Count DECUR timeline events per year
  const eventsByYear: Record<number, number> = {};
  for (const entry of TIMELINE) {
    if (entry.year >= START_YEAR && entry.year <= END_YEAR) {
      eventsByYear[entry.year] = (eventsByYear[entry.year] ?? 0) + 1;
    }
  }

  const data: ChartDatum[] = [];
  for (let y = START_YEAR; y <= END_YEAR; y++) {
    data.push({
      year: y,
      sightings: COUNTS[String(y)] ?? 0,
      events: eventsByYear[y] ?? 0,
    });
  }
  return data;
}

/* ── Custom tooltip ─────────────────────────────────────────────────── */

interface TooltipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}

const CustomTooltip: React.FC<TooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const sightings = payload.find((p) => p.name === 'sightings');
  const events = payload.find((p) => p.name === 'events');
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="font-bold text-gray-200 mb-1.5">{label}</p>
      {sightings && (
        <p style={{ color: sightings.color }}>
          {sightings.value.toLocaleString()} community reports
        </p>
      )}
      {events && events.value > 0 && (
        <p style={{ color: events.color }}>
          {events.value} DECUR event{events.value !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
};

/* ── Decade tick formatter ──────────────────────────────────────────── */

function decadeTick(year: number): string {
  return year % 10 === 0 ? String(year) : '';
}

/* ── Component ──────────────────────────────────────────────────────── */

type Range = 'all' | 'modern';

interface Props {
  selectedYear?: number | null;
  onYearSelect?: (year: number) => void;
}

export default function SightingsTemporalChart({ selectedYear, onYearSelect }: Props) {
  const { resolvedTheme } = useTheme();
  const dark = resolvedTheme !== 'light';
  const [range, setRange] = useState<Range>('all');

  const allData = useMemo(() => buildChartData(), []);
  const data = useMemo(
    () => (range === 'modern' ? allData.filter((d) => d.year >= 1990) : allData),
    [allData, range]
  );

  const gridColor = dark ? '#374151' : '#e5e7eb';
  const axisColor = dark ? '#6b7280' : '#9ca3af';
  const labelColor = dark ? '#d1d5db' : '#374151';

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Temporal Distribution
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            UFOSINT community reports per year (bars) vs. DECUR documented events (line)
            {onYearSelect && (
              <span className="ml-1 text-cyan-500 dark:text-cyan-400">
                — click a bar to filter search
              </span>
            )}
          </p>
        </div>
        <div className="flex items-center gap-1">
          {(['all', 'modern'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`text-xs px-2.5 py-1 rounded-md border transition-colors ${
                range === r
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-primary hover:text-primary'
              }`}
            >
              {r === 'all' ? '1947-2025' : '1990-2025'}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
        <ResponsiveContainer width="100%" height={320}>
          <ComposedChart
            data={data}
            margin={{ top: 8, right: 40, bottom: 8, left: 8 }}
            style={onYearSelect ? { cursor: 'pointer' } : undefined}
            // Chart-level click fires on both mouse and touch — more reliable than Bar.onClick on mobile
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onClick={onYearSelect ? (chartData: any) => {
              // activeLabel is the x-axis value (year) of the tapped/clicked position
              const year = chartData?.activeLabel ?? chartData?.activePayload?.[0]?.payload?.year;
              if (year != null) onYearSelect(Number(year));
            } : undefined}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis
              dataKey="year"
              tickFormatter={decadeTick}
              tick={{ fontSize: 11, fill: axisColor }}
              interval={0}
              tickLine={false}
              axisLine={{ stroke: gridColor }}
            />
            {/* Left Y: sightings */}
            <YAxis
              yAxisId="sightings"
              orientation="left"
              tickFormatter={(v: number) =>
                v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)
              }
              tick={{ fontSize: 10, fill: axisColor }}
              axisLine={false}
              tickLine={false}
              width={32}
            />
            {/* Right Y: DECUR events */}
            <YAxis
              yAxisId="events"
              orientation="right"
              tick={{ fontSize: 10, fill: '#f59e0b' }}
              axisLine={false}
              tickLine={false}
              width={28}
              allowDecimals={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => (
                <span style={{ color: labelColor, fontSize: 11 }}>
                  {value === 'sightings' ? 'UFOSINT reports' : 'DECUR events'}
                </span>
              )}
            />
            <Bar
              yAxisId="sightings"
              dataKey="sightings"
              name="sightings"
              radius={[1, 1, 0, 0]}
              maxBarSize={12}
            >
              {data.map((entry) => (
                <Cell
                  key={entry.year}
                  fill="#22d3ee"
                  opacity={selectedYear && selectedYear !== entry.year ? 0.3 : 0.7}
                />
              ))}
            </Bar>
            <Line
              yAxisId="events"
              dataKey="events"
              name="events"
              stroke="#f59e0b"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#f59e0b' }}
            />
            {/* Program reference lines — only meaningful in the full 1947-2025 view */}
            {range === 'all' && (
              <>
                <ReferenceLine
                  x={1952}
                  yAxisId="sightings"
                  stroke="#a855f7"
                  strokeDasharray="4 3"
                  strokeOpacity={0.7}
                  label={{ value: 'Blue Book', position: 'insideTopRight', fontSize: 9, fill: '#c084fc', dy: 2 }}
                />
                <ReferenceLine
                  x={1969}
                  yAxisId="sightings"
                  stroke="#a855f7"
                  strokeDasharray="4 3"
                  strokeOpacity={0.7}
                  label={{ value: 'Blue Book ends', position: 'insideTopRight', fontSize: 9, fill: '#c084fc', dy: 2 }}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Attribution note */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Community reports from UFOSINT (NUFORC, MUFON, UFOCAT, Vallee UPDB, UFO-search).
        DECUR events from the{' '}
        <a href="/timeline" className="text-primary hover:underline">
          historical timeline
        </a>{' '}
        (1,800+ entries). Correlation does not imply causation.
      </p>
    </div>
  );
}
