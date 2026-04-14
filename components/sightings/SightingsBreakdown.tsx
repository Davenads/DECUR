import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { useTheme } from 'next-themes';
import shapeCounts from '../../data/ufosint/shape-counts.json';
import topCountries from '../../data/ufosint/top-countries.json';
import statsData from '../../data/ufosint/stats.json';

/* ── Types ──────────────────────────────────────────────────────────── */

interface Row {
  value: string;
  count: number;
}

interface SourceEntry {
  name: string;
  count: number;
  collection: string;
}

/* ── Data ───────────────────────────────────────────────────────────── */

const COUNTRY_NAMES: Record<string, string> = {
  US: 'United States',
  CA: 'Canada',
  GB: 'United Kingdom',
  AU: 'Australia',
  FR: 'France',
  BR: 'Brazil',
  DE: 'Germany',
  IT: 'Italy',
  ES: 'Spain',
  AR: 'Argentina',
  SE: 'Sweden',
  MX: 'Mexico',
  IN: 'India',
  NZ: 'New Zealand',
};

// Normalize shape labels
function normalizeShape(value: string): string {
  const map: Record<string, string> = {
    Domedisc: 'Dome/Disc',
    Disc: 'Disc',
    Disk: 'Disc', // merge duplicates
  };
  return map[value] ?? value;
}

// Top 10 shapes — merge Disc/Disk, drop Unknown/Other
const TOP_SHAPES: Array<{ label: string; count: number }> = (() => {
  const merged: Record<string, number> = {};
  for (const row of (shapeCounts as { rows: Row[] }).rows) {
    const label = normalizeShape(row.value);
    merged[label] = (merged[label] ?? 0) + row.count;
  }
  return Object.entries(merged)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([label, count]) => ({ label, count }));
})();

// Source donut data
const SOURCE_DATA: SourceEntry[] = (statsData as { by_source: SourceEntry[] }).by_source;

// Top 8 countries
const TOP_COUNTRIES = (topCountries as { rows: Row[] }).rows
  .slice(0, 8)
  .map((r) => ({ label: COUNTRY_NAMES[r.value] ?? r.value, count: r.count }));

/* ── Colors ─────────────────────────────────────────────────────────── */

const SOURCE_COLORS = ['#f59e0b', '#6366f1', '#10b981', '#ef4444', '#8b5cf6'];

const SHAPE_GRADIENT = (i: number, total: number) => {
  // amber at index 0 → lighter amber at end
  const ratio = i / (total - 1);
  const r = Math.round(245 - ratio * 60);
  const g = Math.round(158 - ratio * 40);
  const b = Math.round(11 + ratio * 30);
  return `rgb(${r},${g},${b})`;
};

/* ── Custom tooltips ────────────────────────────────────────────────── */

interface BarTipProps {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}

const BarTooltip: React.FC<BarTipProps> = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-gray-200 mb-1">{label}</p>
      <p className="text-amber-400">{payload[0].value.toLocaleString()} reports</p>
    </div>
  );
};

interface PieTipProps {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}

const PieTooltip: React.FC<PieTipProps> = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const total = SOURCE_DATA.reduce((s, d) => s + d.count, 0);
  const pct = ((payload[0].value / total) * 100).toFixed(1);
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-gray-200 mb-1">{payload[0].name}</p>
      <p className="text-gray-300">{payload[0].value.toLocaleString()} ({pct}%)</p>
    </div>
  );
};

/* ── Sub-components ─────────────────────────────────────────────────── */

const ShapeChart: React.FC<{ axisColor: string }> = ({ axisColor }) => (
  <div className="space-y-2">
    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
      Top Reported Shapes
    </h3>
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={TOP_SHAPES}
        layout="vertical"
        margin={{ top: 0, right: 40, bottom: 0, left: 8 }}
      >
        <XAxis
          type="number"
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 10, fill: axisColor }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={72}
          tick={{ fontSize: 11, fill: axisColor }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<BarTooltip />} />
        <Bar dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={14}>
          {TOP_SHAPES.map((_, i) => (
            <Cell key={i} fill={SHAPE_GRADIENT(i, TOP_SHAPES.length)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
);

const SourceDonut: React.FC = () => {
  const total = SOURCE_DATA.reduce((s, d) => s + d.count, 0);
  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
        Reports by Source
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={SOURCE_DATA}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={80}
            paddingAngle={2}
          >
            {SOURCE_DATA.map((_, i) => (
              <Cell key={i} fill={SOURCE_COLORS[i % SOURCE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="space-y-1">
        {SOURCE_DATA.map((src, i) => {
          const pct = ((src.count / total) * 100).toFixed(1);
          return (
            <div key={src.name} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ background: SOURCE_COLORS[i % SOURCE_COLORS.length] }}
                />
                <span className="text-gray-600 dark:text-gray-400">{src.name}</span>
              </div>
              <span className="text-gray-500 dark:text-gray-500 tabular-nums">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CountryChart: React.FC<{ axisColor: string }> = ({ axisColor }) => (
  <div className="space-y-2">
    <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
      Top Countries
    </h3>
    <ResponsiveContainer width="100%" height={220}>
      <BarChart
        data={TOP_COUNTRIES}
        layout="vertical"
        margin={{ top: 0, right: 40, bottom: 0, left: 8 }}
      >
        <XAxis
          type="number"
          tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}k`}
          tick={{ fontSize: 10, fill: axisColor }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          width={90}
          tick={{ fontSize: 10, fill: axisColor }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          content={({ active, payload, label }) =>
            active && payload?.length ? (
              <div className="bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 shadow-xl text-xs">
                <p className="font-semibold text-gray-200 mb-1">{label}</p>
                <p className="text-indigo-400">{(payload[0].value as number).toLocaleString()} reports</p>
              </div>
            ) : null
          }
        />
        <Bar dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={14} fill="#6366f1" opacity={0.8} />
      </BarChart>
    </ResponsiveContainer>
  </div>
);

/* ── Page component ─────────────────────────────────────────────────── */

export default function SightingsBreakdown() {
  const { resolvedTheme } = useTheme();
  const axisColor = resolvedTheme === 'light' ? '#9ca3af' : '#6b7280';

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
        Database Breakdown
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left: shape + country stacked */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-6">
          <ShapeChart axisColor={axisColor} />
          <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
            <CountryChart axisColor={axisColor} />
          </div>
        </div>
        {/* Right: source donut */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-4">
          <SourceDonut />
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
            US bias: NUFORC and MUFON are predominantly English-language, US-based reporting
            networks. 65% of geocoded records are in North America.
          </p>
        </div>
      </div>
    </div>
  );
}
