import { FC, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from 'recharts';
import { TimelineEntry } from '../../lib/useTimelineData';

interface Props {
  entries: TimelineEntry[];
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
  notable?: boolean; // highlight bars for particularly significant periods
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
    .map(([decade, count]) => ({
      label: `${decade}s`,
      count,
      notable: NOTABLE.has(Number(decade)),
    }));
}

function groupByEra(entries: TimelineEntry[]): ChartDatum[] {
  return ERA_LABELS.map(era => ({
    label: era.label,
    count: entries.filter(e => e.year >= era.min && e.year <= era.max).length,
    notable: false,
  }));
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const CustomTooltip: FC<CustomTooltipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-lg px-3 py-2">
      <p className="text-xs font-semibold text-gray-700">{label}</p>
      <p className="text-sm font-bold text-primary">{payload[0].value} events</p>
    </div>
  );
};

const EventFrequencyChart: FC<Props> = ({ entries }) => {
  const [groupBy, setGroupBy] = useState<GroupBy>('decade');
  const data = groupBy === 'decade' ? groupByDecade(entries) : groupByEra(entries);
  const maxCount = Math.max(...data.map(d => d.count));

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Event Frequency</h3>
          <p className="text-sm text-gray-500 mt-0.5">
            Distribution of {entries.length.toLocaleString()} documented events across time
          </p>
        </div>
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 shrink-0">
          {(['decade', 'era'] as GroupBy[]).map(g => (
            <button
              key={g}
              onClick={() => setGroupBy(g)}
              className={`text-xs px-3 py-1 rounded-md font-medium transition-colors capitalize ${
                groupBy === g
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 4, left: -16, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
              interval={groupBy === 'decade' ? 2 : 0}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#9ca3af' }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,119,204,0.06)' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {data.map((d, i) => (
                <Cell
                  key={i}
                  fill={d.count === maxCount ? '#0077cc' : d.notable ? '#3b9fe0' : '#93c5e8'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend note */}
      <div className="flex gap-4 text-xs text-gray-400 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#0077cc] inline-block" />
          Peak period
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm bg-[#93c5e8] inline-block" />
          Other periods
        </span>
      </div>
    </div>
  );
};

export default EventFrequencyChart;
