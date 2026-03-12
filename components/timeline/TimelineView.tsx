import { useState, useMemo, useEffect, FC, ChangeEvent } from 'react';

export interface TimelineEntry {
  id: number;
  date: string;
  year: number;
  title: string;
  excerpt: string;
  categories: string[];
  source_url: string;
  article_url?: string;
}

interface TimelineViewProps {
  entries: TimelineEntry[];
}

const CATEGORY_LABELS: Record<string, string> = {
  'famous-cases': 'Famous Cases',
  'spotlight': 'Spotlight',
  'sightings': 'Sightings',
  'news': 'News',
  'quotes': 'Quotes',
  'documentaries': 'Documentaries',
  'books-documents': 'Books & Docs',
  'x': 'X',
};

const CATEGORY_COLORS: Record<string, string> = {
  'famous-cases': 'bg-red-100 text-red-800 border-red-200',
  'spotlight': 'bg-purple-100 text-purple-800 border-purple-200',
  'sightings': 'bg-green-100 text-green-800 border-green-200',
  'news': 'bg-blue-100 text-blue-800 border-blue-200',
  'quotes': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'documentaries': 'bg-orange-100 text-orange-800 border-orange-200',
  'books-documents': 'bg-teal-100 text-teal-800 border-teal-200',
  'x': 'bg-gray-100 text-gray-800 border-gray-200',
};

const CATEGORY_DOT_COLORS: Record<string, string> = {
  'famous-cases': 'bg-red-500',
  'spotlight': 'bg-purple-500',
  'sightings': 'bg-green-500',
  'news': 'bg-blue-500',
  'quotes': 'bg-yellow-500',
  'documentaries': 'bg-orange-500',
  'books-documents': 'bg-teal-500',
  'x': 'bg-gray-500',
};

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS);

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const [year, month, day] = parts;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m = parseInt(month, 10);
  return `${months[m - 1] || month} ${parseInt(day, 10)}, ${year}`;
}

const TimelineView: FC<TimelineViewProps> = ({ entries }) => {
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set(ALL_CATEGORIES));
  const [search, setSearch] = useState('');
  const [yearMin, setYearMin] = useState<number>(1947);
  const [yearMax, setYearMax] = useState<number>(2026);
  useEffect(() => {
    setYearMax(new Date().getFullYear());
  }, []);

  const globalMin = useMemo(() => Math.min(...entries.map(e => e.year)), [entries]);
  const globalMax = useMemo(() => Math.max(...entries.map(e => e.year)), [entries]);

  const toggleCategory = (cat: string) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(cat);
      } else {
        next.add(cat);
      }
      return next;
    });
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries.filter(e =>
      e.year >= yearMin &&
      e.year <= yearMax &&
      e.categories.some(c => activeCategories.has(c)) &&
      (!q || e.title.toLowerCase().includes(q) || e.excerpt.toLowerCase().includes(q))
    );
  }, [entries, activeCategories, search, yearMin, yearMax]);

  // Group by year
  const grouped = useMemo(() => {
    const map = new Map<number, TimelineEntry[]>();
    for (const entry of filtered) {
      const list = map.get(entry.year) ?? [];
      list.push(entry);
      map.set(entry.year, list);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [filtered]);

  const primaryCategory = (entry: TimelineEntry) =>
    entry.categories.find(c => c !== 'x') ?? entry.categories[0] ?? 'news';

  return (
    <div>
      {/* Filters */}
      <div className="mb-6 space-y-4">
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Year range */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-600 font-medium">Year:</span>
          <input
            type="number"
            value={yearMin}
            min={globalMin}
            max={yearMax}
            onChange={e => setYearMin(Math.max(globalMin, parseInt(e.target.value) || globalMin))}
            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-gray-400">to</span>
          <input
            type="number"
            value={yearMax}
            min={yearMin}
            max={globalMax}
            onChange={e => setYearMax(Math.min(globalMax, parseInt(e.target.value) || globalMax))}
            className="w-24 px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={() => { setYearMin(1947); setYearMax(globalMax); }}
            className="text-xs text-primary hover:underline"
          >
            Reset
          </button>
          <button
            onClick={() => { setYearMin(2017); setYearMax(globalMax); }}
            className="text-xs text-gray-500 hover:text-primary hover:underline"
          >
            Disclosure era (2017+)
          </button>
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-2">
          {ALL_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => toggleCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-full border transition-opacity ${
                activeCategories.has(cat)
                  ? CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-800 border-gray-200'
                  : 'bg-white text-gray-400 border-gray-200 opacity-50'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500">{filtered.length} events</p>
      </div>

      {/* Timeline */}
      {grouped.length === 0 ? (
        <p className="text-gray-400 text-center py-16">No events match your filters.</p>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />

          <div className="space-y-8 pl-12">
            {grouped.map(([year, yearEntries]) => (
              <div key={year}>
                {/* Year marker */}
                <div className="relative -ml-12 flex items-center mb-4">
                  <div className="absolute -left-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    <span className="sr-only">{year}</span>
                  </div>
                  <span className="ml-10 text-lg font-heading font-bold text-gray-800">{year}</span>
                  <span className="ml-2 text-sm text-gray-400">{yearEntries.length} event{yearEntries.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Events for this year */}
                <div className="space-y-3">
                  {yearEntries.map(entry => {
                    const cat = primaryCategory(entry);
                    const dotColor = CATEGORY_DOT_COLORS[cat] ?? 'bg-gray-400';
                    const chipColor = CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-800 border-gray-200';
                    return (
                      <div key={entry.id} className="relative -ml-12 pl-12">
                        {/* Dot */}
                        <div className={`absolute left-[13px] top-4 w-3 h-3 rounded-full ${dotColor} ring-2 ring-white shadow`} />

                        <a
                          href={entry.article_url ?? entry.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-primary transition-all group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${chipColor}`}>
                                  {CATEGORY_LABELS[cat]}
                                </span>
                                <span className="text-xs text-gray-400">{formatDate(entry.date)}</span>
                              </div>
                              <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors leading-snug">
                                {entry.title}
                              </h3>
                              {entry.excerpt && (
                                <p className="mt-1 text-xs text-gray-500 line-clamp-2"
                                  dangerouslySetInnerHTML={{ __html: entry.excerpt }}
                                />
                              )}
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 group-hover:text-primary flex-shrink-0 mt-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </div>
                        </a>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineView;
