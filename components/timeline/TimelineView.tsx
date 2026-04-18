import { useState, useEffect, useCallback, useRef, FC, ChangeEvent } from 'react';
import { useRouter } from 'next/router';

export interface TimelineEntry {
  id: number;
  date: string;
  year: number;
  title: string;
  excerpt: string;
  categories: string[];
  source_url: string;
  article_url?: string | null;
}

// ── Constants ────────────────────────────────────────────────────────────────

const GLOBAL_MIN = 1561;
const GLOBAL_MAX = new Date().getFullYear();
const DEFAULT_YEAR_MIN = 1947;
const PAGE_SIZE = 50;

const CATEGORY_LABELS: Record<string, string> = {
  'famous-cases':   'Famous Cases',
  'spotlight':      'Spotlight',
  'sightings':      'Sightings',
  'news':           'News',
  'quotes':         'Quotes',
  'documentaries':  'Documentaries',
  'books-documents':'Books & Docs',
};

const ALL_CATEGORIES = Object.keys(CATEGORY_LABELS);

const CATEGORY_COLORS: Record<string, string> = {
  'famous-cases':    'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800',
  'spotlight':       'bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-200 dark:border-purple-800',
  'sightings':       'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 border-green-200 dark:border-green-800',
  'news':            'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 border-blue-200 dark:border-blue-800',
  'quotes':          'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800',
  'documentaries':   'bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300 border-orange-200 dark:border-orange-800',
  'books-documents': 'bg-teal-100 dark:bg-teal-900/30 text-teal-800 dark:text-teal-300 border-teal-200 dark:border-teal-800',
};

const CATEGORY_DOT_COLORS: Record<string, string> = {
  'famous-cases':    'bg-red-500',
  'spotlight':       'bg-purple-500',
  'sightings':       'bg-green-500',
  'news':            'bg-blue-500',
  'quotes':          'bg-yellow-500',
  'documentaries':   'bg-orange-500',
  'books-documents': 'bg-teal-500',
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-');
  if (parts.length < 3) return dateStr;
  const [year, month, day] = parts;
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const m = parseInt(month, 10);
  return `${months[m - 1] || month} ${parseInt(day, 10)}, ${year}`;
}

function groupByYear(entries: TimelineEntry[]): Array<[number, TimelineEntry[]]> {
  const map = new Map<number, TimelineEntry[]>();
  for (const entry of entries) {
    const list = map.get(entry.year) ?? [];
    list.push(entry);
    map.set(entry.year, list);
  }
  // Sorted descending (matches API order: most recent first)
  return Array.from(map.entries()).sort((a, b) => b[0] - a[0]);
}

// ── Component ────────────────────────────────────────────────────────────────

const TimelineView: FC = () => {
  const router = useRouter();

  // Filter state
  const [activeCategories, setActiveCategories] = useState<Set<string>>(new Set(ALL_CATEGORIES));
  const [search, setSearch]     = useState('');
  const [yearMin, setYearMin]   = useState<number>(DEFAULT_YEAR_MIN);
  const [yearMax, setYearMax]   = useState<number>(GLOBAL_MAX);

  // Results state
  const [entries, setEntries]   = useState<TimelineEntry[]>([]);
  const [total, setTotal]       = useState<number>(0);
  const [page, setPage]         = useState<number>(1);
  const [pages, setPages]       = useState<number>(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError]       = useState<string | null>(null);

  // Debounce refs
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const yearDebounce   = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Initialize from URL ?year= param
  useEffect(() => {
    const y = parseInt(router.query.year as string, 10);
    if (!isNaN(y) && y >= GLOBAL_MIN) {
      setYearMin(y);
      setYearMax(y);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.year]);

  // ── API fetch ──────────────────────────────────────────────────────────────

  const fetchPage = useCallback(async (opts: {
    pg: number;
    yMin: number;
    yMax: number;
    cats: Set<string>;
    q: string;
    append?: boolean;
  }) => {
    const { pg, yMin, yMax, cats, q, append = false } = opts;

    if (append) setIsLoadingMore(true);
    else { setIsLoading(true); setError(null); }

    try {
      const params = new URLSearchParams({
        yearMin: String(yMin),
        yearMax: String(yMax),
        page:    String(pg),
        limit:   String(PAGE_SIZE),
      });

      // Only pass categories if not all are selected (server defaults to all)
      const activeCats = Array.from(cats);
      if (activeCats.length < ALL_CATEGORIES.length) {
        params.set('categories', activeCats.join(','));
      }

      if (q.trim().length >= 2) {
        params.set('q', q.trim());
      }

      const res = await fetch(`/api/timeline/events?${params}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);

      const json = await res.json() as {
        entries: TimelineEntry[];
        total: number;
        page: number;
        pages: number;
      };

      setTotal(json.total);
      setPage(json.page);
      setPages(json.pages);
      setEntries(prev => append ? [...prev, ...json.entries] : json.entries);
    } catch (err) {
      console.error('[TimelineView]', err);
      setError('Timeline data temporarily unavailable.');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  // Initial load and filter changes — reset to page 1
  const triggerFetch = useCallback((yMin: number, yMax: number, cats: Set<string>, q: string) => {
    setEntries([]);
    setPage(1);
    fetchPage({ pg: 1, yMin, yMax, cats, q, append: false });
  }, [fetchPage]);

  // Re-fetch when year range changes (debounced — users type into number inputs)
  const onYearChange = useCallback((newMin: number, newMax: number) => {
    if (yearDebounce.current) clearTimeout(yearDebounce.current);
    yearDebounce.current = setTimeout(() => {
      triggerFetch(newMin, newMax, activeCategories, search);
    }, 600);
  }, [triggerFetch, activeCategories, search]);

  // Re-fetch when text search changes (debounced)
  const onSearchChange = useCallback((q: string) => {
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    searchDebounce.current = setTimeout(() => {
      triggerFetch(yearMin, yearMax, activeCategories, q);
    }, 400);
  }, [triggerFetch, yearMin, yearMax, activeCategories]);

  // Initial load once mounted
  useEffect(() => {
    triggerFetch(yearMin, yearMax, activeCategories, search);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Filter handlers ────────────────────────────────────────────────────────

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setSearch(q);
    onSearchChange(q);
  };

  const handleYearMinChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (isNaN(v)) return;
    const clamped = Math.max(GLOBAL_MIN, Math.min(v, yearMax));
    setYearMin(clamped);
    onYearChange(clamped, yearMax);
  };

  const handleYearMaxChange = (e: ChangeEvent<HTMLInputElement>) => {
    const v = parseInt(e.target.value, 10);
    if (isNaN(v)) return;
    const clamped = Math.min(GLOBAL_MAX, Math.max(v, yearMin));
    setYearMax(clamped);
    onYearChange(yearMin, clamped);
  };

  const handleReset = () => {
    if (yearDebounce.current)  clearTimeout(yearDebounce.current);
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    const newMin = DEFAULT_YEAR_MIN;
    const newMax = GLOBAL_MAX;
    setYearMin(newMin);
    setYearMax(newMax);
    setSearch('');
    setActiveCategories(new Set(ALL_CATEGORIES));
    triggerFetch(newMin, newMax, new Set(ALL_CATEGORIES), '');
  };

  const handleDisclosureEra = () => {
    if (yearDebounce.current) clearTimeout(yearDebounce.current);
    const newMin = 2017;
    setYearMin(newMin);
    setYearMax(GLOBAL_MAX);
    triggerFetch(newMin, GLOBAL_MAX, activeCategories, search);
  };

  const toggleCategory = (cat: string) => {
    setActiveCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) {
        if (next.size === 1) return prev; // keep at least one
        next.delete(cat);
      } else {
        next.add(cat);
      }
      triggerFetch(yearMin, yearMax, next, search);
      return next;
    });
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    fetchPage({ pg: nextPage, yMin: yearMin, yMax: yearMax, cats: activeCategories, q: search, append: true });
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const grouped = groupByYear(entries);

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
            onChange={handleSearchChange}
            className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2">
            {isLoading && entries.length === 0 ? (
              <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </div>
        </div>

        {/* Year range */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-sm text-gray-600 dark:text-gray-400 font-medium">Year:</span>
          <input
            type="number"
            value={yearMin}
            min={GLOBAL_MIN}
            max={yearMax}
            onFocus={e => e.target.select()}
            onChange={handleYearMinChange}
            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <span className="text-gray-400 dark:text-gray-500">to</span>
          <input
            type="number"
            value={yearMax}
            min={yearMin}
            max={GLOBAL_MAX}
            onFocus={e => e.target.select()}
            onChange={handleYearMaxChange}
            className="w-24 px-2 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button onClick={handleReset} className="text-xs text-primary hover:underline">
            Reset
          </button>
          <button onClick={handleDisclosureEra} className="text-xs text-gray-500 dark:text-gray-400 hover:text-primary hover:underline">
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
                  : 'bg-white dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 opacity-50'
              }`}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Count */}
        {!isLoading && !error && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {entries.length < total
              ? `Showing ${entries.length} of ${total.toLocaleString()} events`
              : `${total.toLocaleString()} event${total !== 1 ? 's' : ''}`}
          </p>
        )}
      </div>

      {/* Error state */}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400 mb-6">
          {error}
        </div>
      )}

      {/* Loading skeleton (initial load) */}
      {isLoading && entries.length === 0 && !error && (
        <div className="space-y-4 animate-pulse">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg" />
          ))}
        </div>
      )}

      {/* No results */}
      {!isLoading && !error && entries.length === 0 && (
        <p className="text-gray-400 dark:text-gray-500 text-center py-16">
          No events match your filters.
        </p>
      )}

      {/* Timeline */}
      {entries.length > 0 && (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700" />

          <div className="space-y-8 pl-12">
            {grouped.map(([year, yearEntries]) => (
              <div key={year}>
                {/* Year marker */}
                <div className="relative -ml-12 flex items-center mb-4">
                  <div className="absolute -left-0 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold shadow-sm">
                    <span className="sr-only">{year}</span>
                  </div>
                  <span className="ml-10 text-lg font-heading font-bold text-gray-800 dark:text-gray-200">{year}</span>
                  <span className="ml-2 text-sm text-gray-400 dark:text-gray-500">
                    {yearEntries.length} event{yearEntries.length !== 1 ? 's' : ''}
                  </span>
                </div>

                {/* Events for this year */}
                <div className="space-y-3">
                  {yearEntries.map(entry => {
                    const cat = primaryCategory(entry);
                    const dotColor  = CATEGORY_DOT_COLORS[cat] ?? 'bg-gray-400';
                    const chipColor = CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-800 border-gray-200';
                    return (
                      <div key={entry.id} className="relative -ml-12 pl-12">
                        {/* Dot */}
                        <div className={`absolute left-[13px] top-4 w-3 h-3 rounded-full ${dotColor} ring-2 ring-white dark:ring-gray-900 shadow`} />
                        <a
                          href={entry.article_url ?? entry.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md hover:border-primary transition-all group"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${chipColor}`}>
                                  {CATEGORY_LABELS[cat]}
                                </span>
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                  {formatDate(entry.date)}
                                </span>
                              </div>
                              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors leading-snug">
                                {entry.title}
                              </h3>
                              {entry.excerpt && (
                                <p
                                  className="mt-1 text-xs text-gray-500 dark:text-gray-400 line-clamp-2"
                                  dangerouslySetInnerHTML={{ __html: entry.excerpt }}
                                />
                              )}
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-primary flex-shrink-0 mt-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

          {/* Load more */}
          {page < pages && (
            <div className="mt-10 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:border-primary hover:text-primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoadingMore ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Loading...
                  </span>
                ) : (
                  `Load more (${total - entries.length} remaining)`
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TimelineView;
