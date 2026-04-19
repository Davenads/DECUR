import { FC, useState, useEffect, useCallback, useRef } from 'react';
import { GetStaticProps } from 'next';
import SeoHead from '../components/SeoHead';
import Link from 'next/link';
import { useRouter } from 'next/router';
import insidersIndex from '../data/key-figures/index.json';
import timelineData from '../data/timeline.json';
import glossaryData from '../data/glossary.json';
import resourcesData from '../data/resources.json';

// ---- Types ----------------------------------------------------------------

interface SearchItem {
  id: string;
  type: 'insider' | 'case' | 'document' | 'timeline' | 'glossary' | 'resource' | 'contractor' | 'program';
  title: string;
  subtitle?: string | null;
  description: string;
  href: string;
  badge?: string | null;
  aliases?: string[];
  meta?: {
    figureType?: string | null;
    tier?: string | null;
    docType?: string | null;
    programStatus?: string | null;
  } | null;
}

interface MetaFilters {
  figureType: string | null;
  tier: string | null;
  docType: string | null;
  programStatus: string | null;
}

const EMPTY_FILTERS: MetaFilters = { figureType: null, tier: null, docType: null, programStatus: null };

// ---- Helpers ---------------------------------------------------------------

const TYPE_STYLES: Record<SearchItem['type'], string> = {
  insider:    'bg-blue-100 text-blue-700',
  case:       'bg-red-100 text-red-700',
  document:   'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  timeline:   'bg-amber-100 text-amber-700',
  glossary:   'bg-indigo-100 text-indigo-700',
  resource:   'bg-emerald-100 text-emerald-700',
  contractor: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  program:    'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
};

const TYPE_LABELS: Record<SearchItem['type'], string> = {
  insider:    'Key Figures',
  case:       'Documented Cases',
  document:   'Declassified Documents',
  timeline:   'Timeline Events',
  glossary:   'Glossary',
  resource:   'Resources',
  contractor: 'Defense Contractors',
  program:    'Government Programs',
};

const TYPE_ORDER: SearchItem['type'][] = ['insider', 'case', 'document', 'program', 'contractor', 'timeline', 'glossary', 'resource'];

// ---- Filter config ---------------------------------------------------------

const FIGURE_TYPE_OPTIONS = [
  { value: 'insider',    label: 'Government Insider' },
  { value: 'pilot',      label: 'Pilot / Witness'    },
  { value: 'scientist',  label: 'Scientist'          },
  { value: 'official',   label: 'Official'           },
  { value: 'journalist', label: 'Journalist'         },
  { value: 'executive',  label: 'Executive'          },
];

const TIER_OPTIONS = [
  { value: 'tier-1', label: 'Tier 1 - Official Documentation' },
  { value: 'tier-2', label: 'Tier 2 - Declassified Records'   },
  { value: 'tier-3', label: 'Tier 3 - Credentialed Testimony' },
];

const DOC_TYPE_OPTIONS = [
  { value: 'government-report',      label: 'Govt Report'      },
  { value: 'intelligence-report',    label: 'Intel Report'     },
  { value: 'government-assessment',  label: 'Assessment'       },
  { value: 'legislation',            label: 'Legislation'      },
  { value: 'classified-memo',        label: 'Classified Memo'  },
  { value: 'government-memo',        label: 'Memo'             },
  { value: 'military-memorandum',    label: 'Military Memo'    },
  { value: 'whistleblower-complaint',label: 'Whistleblower'    },
  { value: 'academic-paper',         label: 'Academic Paper'   },
];

const PROGRAM_STATUS_OPTIONS = [
  { value: 'active',     label: 'Active'     },
  { value: 'classified', label: 'Classified' },
  { value: 'defunct',    label: 'Defunct'    },
  { value: 'unknown',    label: 'Unknown'    },
];

// ---- Types (page props) ----------------------------------------------------

interface SearchPageProps {
  counts: {
    figures: number;
    timeline: number;
    glossary: number;
    resources: number;
  };
}

// ---- Component -------------------------------------------------------------

const MAX_PER_TYPE = 10;
const DEBOUNCE_MS  = 300;

const SearchPage: FC<SearchPageProps> = ({ counts }) => {
  const router = useRouter();
  const [query, setQuery]         = useState('');
  const [results, setResults]     = useState<SearchItem[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [typeFilter, setTypeFilter]   = useState<SearchItem['type'] | null>(null);
  const [filters, setFilters]     = useState<MetaFilters>(EMPTY_FILTERS);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setFilter = (key: keyof MetaFilters, value: string | null) =>
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? null : value }));

  const hasActiveFilters = Object.values(filters).some(Boolean);

  // ── API fetch ──────────────────────────────────────────────────────────────

  const fetchResults = useCallback(async (q: string, overrideFilters?: MetaFilters, overrideType?: SearchItem['type'] | null) => {
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({ q: q.trim(), limit: '300' });
      const activeFilters = overrideFilters ?? filters;
      const activeType = overrideType !== undefined ? overrideType : typeFilter;

      if (activeType)                    params.set('type', activeType);
      if (activeFilters.figureType)      params.set('figureType', activeFilters.figureType);
      if (activeFilters.tier)            params.set('tier', activeFilters.tier);
      if (activeFilters.docType)         params.set('docType', activeFilters.docType);
      if (activeFilters.programStatus)   params.set('programStatus', activeFilters.programStatus);

      const res = await fetch(`/api/search?${params}`);
      if (!res.ok) throw new Error(`Search API error: ${res.status}`);
      const json = await res.json() as { results: SearchItem[] };
      setResults(json.results ?? []);
    } catch (err) {
      console.error('[search]', err);
      setError('Search is temporarily unavailable. Please try again.');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, typeFilter]);

  // ── Debounced search on query input ────────────────────────────────────────

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      setIsLoading(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      fetchResults(query);
    }, DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  // Re-fetch when filters or typeFilter change (if a query is active)
  useEffect(() => {
    if (hasSearched && query.trim()) {
      fetchResults(query);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, typeFilter]);

  // Sync query from URL on load / back-nav
  useEffect(() => {
    const q = (router.query.q as string) ?? '';
    if (q && q !== query) {
      setQuery(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.q]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    router.push(`/search?q=${encodeURIComponent(query)}`, undefined, { shallow: true });
    setTypeFilter(null);
    setFilters(EMPTY_FILTERS);
    fetchResults(query, EMPTY_FILTERS, null);
  };

  // ── Group results by type ──────────────────────────────────────────────────

  const grouped = results.reduce<Record<string, SearchItem[]>>((acc, item) => {
    (acc[item.type] = acc[item.type] ?? []).push(item);
    return acc;
  }, {});

  // ── Render helpers ─────────────────────────────────────────────────────────

  const ResultCard = ({ item }: { item: SearchItem }) => (
    <Link
      href={item.href}
      className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 hover:border-primary hover:shadow-sm transition-all"
    >
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-0.5">
            <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{item.title}</span>
            {item.badge && (
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TYPE_STYLES[item.type]}`}>{item.badge}</span>
            )}
          </div>
          {item.subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{item.subtitle}</p>}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{item.description}</p>
        </div>
        <svg className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </Link>
  );

  const FilterPills = ({ options, activeValue, filterKey }: {
    options: Array<{ value: string; label: string }>;
    activeValue: string | null;
    filterKey: keyof MetaFilters;
  }) => (
    <div className="flex gap-2 flex-wrap">
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => setFilter(filterKey, opt.value)}
          className={`text-xs px-3 py-1 rounded-full font-medium border transition-colors ${
            activeValue === opt.value
              ? 'bg-primary text-white border-transparent'
              : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300'
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );

  const DimensionFilters = () => {
    if (typeFilter === 'insider') return (
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Figure type</p>
        <FilterPills options={FIGURE_TYPE_OPTIONS} activeValue={filters.figureType} filterKey="figureType" />
      </div>
    );
    if (typeFilter === 'case') return (
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Evidence tier</p>
        <FilterPills options={TIER_OPTIONS} activeValue={filters.tier} filterKey="tier" />
      </div>
    );
    if (typeFilter === 'document') return (
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Document type</p>
        <FilterPills options={DOC_TYPE_OPTIONS} activeValue={filters.docType} filterKey="docType" />
      </div>
    );
    if (typeFilter === 'program') return (
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Program status</p>
        <FilterPills options={PROGRAM_STATUS_OPTIONS} activeValue={filters.programStatus} filterKey="programStatus" />
      </div>
    );
    return null;
  };

  const GroupedResults = ({ groupedItems }: { groupedItems: Record<string, SearchItem[]> }) => (
    <div className="space-y-10">
      {TYPE_ORDER.filter(t => groupedItems[t]).map(type => (
        <section key={type}>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
            {TYPE_LABELS[type]} ({groupedItems[type].length})
          </h2>
          <div className="space-y-2">
            {groupedItems[type].slice(0, MAX_PER_TYPE).map(item => (
              <ResultCard key={item.id} item={item} />
            ))}
          </div>
          {groupedItems[type].length > MAX_PER_TYPE && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 pl-1">
              Showing {MAX_PER_TYPE} of {groupedItems[type].length} - refine your search or filter above for more specific results.
            </p>
          )}
        </section>
      ))}
    </div>
  );

  // Type counts from all unfiltered results (always fetch limit=300, group client-side by type)
  const typeCounts = results.reduce<Record<string, number>>((acc, item) => {
    acc[item.type] = (acc[item.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <>
      <SeoHead
        title={query ? `"${query}" - Search` : 'Search'}
        description="Search DECUR's archive of UAP research, key figure profiles, historical events, glossary terms, and primary source materials."
        path="/search"
        noindex
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 -mt-8 -mx-4 px-4 pt-10 pb-10">
        <div className="max-w-3xl mx-auto">

          {/* Search input */}
          <form onSubmit={handleSubmit} className="relative mb-8">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search insiders, events, terms, resources..."
              className="w-full pl-11 pr-4 py-3 text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            {isLoading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <svg className="animate-spin h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
          </form>

          {/* Error state */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400">
              {error}
            </div>
          )}

          {/* Search results */}
          {hasSearched && !isLoading && (
            <div>
              {results.length === 0 && !error ? (
                <p className="text-center text-gray-500 dark:text-gray-400 py-16 text-sm">
                  No results for <span className="font-medium">&ldquo;{query}&rdquo;</span>
                </p>
              ) : results.length > 0 ? (
                <>
                  <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
                      <span className="font-medium text-gray-700 dark:text-gray-300">&ldquo;{query}&rdquo;</span>
                    </p>
                    {(hasActiveFilters || typeFilter) && (
                      <button
                        onClick={() => { setTypeFilter(null); setFilters(EMPTY_FILTERS); }}
                        className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>

                  {/* Type filter pills */}
                  <div className="flex gap-2 flex-wrap mb-3">
                    <button
                      onClick={() => { setTypeFilter(null); setFilters(EMPTY_FILTERS); }}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                        typeFilter === null
                          ? 'bg-primary text-white border-transparent'
                          : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      All ({results.length})
                    </button>
                    {TYPE_ORDER.filter(t => typeCounts[t]).map(type => (
                      <button
                        key={type}
                        onClick={() => { setTypeFilter(type); setFilters(EMPTY_FILTERS); }}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                          typeFilter === type
                            ? 'bg-primary text-white border-transparent'
                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {TYPE_LABELS[type]} ({typeCounts[type]})
                      </button>
                    ))}
                  </div>

                  <DimensionFilters />

                  <GroupedResults groupedItems={grouped} />
                </>
              ) : null}
            </div>
          )}

          {/* Empty / landing state */}
          {!hasSearched && !isLoading && (
            <div>
              <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
                <p className="mb-1 font-medium text-gray-500 dark:text-gray-400">Search across all DECUR data</p>
                <p>{counts.figures} key figures &middot; {counts.timeline.toLocaleString()} timeline events &middot; {counts.glossary} glossary terms &middot; {counts.resources} resources</p>
              </div>
              {/* Browse shortcuts */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">Or browse without searching</p>
                <div className="flex gap-2 flex-wrap">
                  {(['insider', 'case', 'document', 'program'] as SearchItem['type'][]).map(type => (
                    <Link
                      key={type}
                      href={type === 'insider' ? '/data?category=key-figures' : type === 'case' ? '/data?category=cases' : type === 'document' ? '/data?category=documents' : '/data?category=programs'}
                      className="text-xs px-3 py-1.5 rounded-full font-medium border bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary transition-colors"
                    >
                      {TYPE_LABELS[type]}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<SearchPageProps> = () => {
  const res = resourcesData as { sources?: unknown[]; testimony?: unknown[] };
  return {
    props: {
      counts: {
        figures:   (insidersIndex as unknown[]).length,
        timeline:  (timelineData as unknown[]).length,
        glossary:  (glossaryData as unknown[]).length,
        resources: (res.sources?.length ?? 0) + (res.testimony?.length ?? 0),
      },
    },
  };
};

export default SearchPage;
