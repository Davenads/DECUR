import { useState, useEffect, useCallback, useRef } from 'react';

/* ── Types ──────────────────────────────────────────────────────────── */

interface Sighting {
  id: number;
  date: string | null;
  shape: string | null;
  source: string;
  city: string | null;
  state: string | null;
  country: string | null;
  description: string | null;
  duration: string | null;
  witnesses: number | null;
  quality_score: number | null;
}

interface SearchResponse {
  total: number;
  results: Sighting[];
}

/* ── Constants ──────────────────────────────────────────────────────── */

const KNOWN_SHAPES = [
  'All', 'Light', 'Disc', 'Triangle', 'Circle', 'Fireball', 'Sphere',
  'Cigar', 'Orb', 'Oval', 'Formation', 'Cylinder', 'Diamond', 'Chevron',
];

const KNOWN_SOURCES = ['All', 'NUFORC', 'MUFON', 'UFOCAT', 'UPDB', 'UFO-search'];

const SOURCE_COLORS: Record<string, string> = {
  UFOCAT:       'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  MUFON:        'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
  NUFORC:       'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  'UFO-search': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  UPDB:         'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
};

const PAGE_SIZE = 25;

/* ── Location formatter ─────────────────────────────────────────────── */

function formatLocation(s: Sighting): string {
  const parts = [s.city, s.state, s.country].filter(Boolean) as string[];
  return parts.slice(0, 2).join(', ') || 'Unknown location';
}

/* ── Result card ────────────────────────────────────────────────────── */

interface CardProps { sighting: Sighting }

const SightingCard: React.FC<CardProps> = ({ sighting }) => {
  const srcColor = SOURCE_COLORS[sighting.source] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${srcColor}`}>
          {sighting.source}
        </span>
        {sighting.shape && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
            {sighting.shape}
          </span>
        )}
        {sighting.date && (
          <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
            {sighting.date}
          </span>
        )}
        {sighting.witnesses != null && sighting.witnesses > 1 && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {sighting.witnesses} witnesses
          </span>
        )}
        {sighting.duration && (
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {sighting.duration}
          </span>
        )}
      </div>

      <p className="text-sm text-gray-700 dark:text-gray-300">
        {formatLocation(sighting)}
      </p>

      {sighting.description && sighting.description.length > 10 && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-2">
          {sighting.description}
        </p>
      )}

      <p className="text-xs text-gray-300 dark:text-gray-700 mt-1">ID #{sighting.id}</p>
    </div>
  );
};

/* ── Main component ─────────────────────────────────────────────────── */

interface SightingsSearchProps {
  externalYear?: number | null;
  onClearYear?: () => void;
}

export default function SightingsSearch({ externalYear, onClearYear }: SightingsSearchProps = {}) {
  const [query, setQuery]           = useState('');
  const [shapeFilter, setShapeFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [results, setResults]       = useState<Sighting[]>([]);
  const [total, setTotal]           = useState<number | null>(null);
  const [loading, setLoading]       = useState(false);
  const [offset, setOffset]         = useState(0);
  const [hasMore, setHasMore]       = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* ── Fetch ──────────────────────────────────────────────────────── */

  const fetchResults = useCallback(async (
    q: string,
    shape: string,
    source: string,
    off: number,
    append: boolean,
    year?: number | null,
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(off) });
      if (q.trim())         params.set('q', q.trim());
      if (shape !== 'All')  params.set('shape', shape);
      if (source !== 'All') params.set('source', source);
      if (year)             { params.set('date_from', `${year}-01-01`); params.set('date_to', `${year}-12-31`); }

      const res = await fetch(`/api/sightings/search?${params.toString()}`);
      if (!res.ok) throw new Error('Search failed');
      const data: SearchResponse = await res.json();

      setResults(prev => append ? [...prev, ...data.results] : data.results);
      setTotal(data.total);
      setHasMore(off + data.results.length < data.total);
      setOffset(off + data.results.length);
    } catch {
      // Leave existing results in place on error
    } finally {
      setLoading(false);
    }
  }, []);

  /* ── Debounced search on filter change ──────────────────────────── */

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setOffset(0);
      fetchResults(query, shapeFilter, sourceFilter, 0, false, externalYear);
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, shapeFilter, sourceFilter, externalYear]);

  /* ── Load more ──────────────────────────────────────────────────── */

  const loadMore = () => {
    fetchResults(query, shapeFilter, sourceFilter, offset, true, externalYear);
  };

  /* ── Reset filter helper ─────────────────────────────────────────── */

  function applyFilter(fn: () => void) {
    fn();
    setOffset(0);
    setResults([]);
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Browse Sightings
        </h2>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          Live search across 520,000+ reports in the DECUR sightings database
        </p>
      </div>

      {/* Search input */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by city, state, country, shape, or description..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        {query && (
          <button
            onClick={() => applyFilter(() => setQuery(''))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Active year filter badge */}
      {externalYear && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Active filter:</span>
          <span className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full border border-cyan-400 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400 font-medium">
            Year: {externalYear}
            <button
              onClick={() => onClearYear?.()}
              className="ml-0.5 text-cyan-400 hover:text-cyan-600 dark:hover:text-cyan-300"
              title="Clear year filter"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </span>
        </div>
      )}

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {/* Shape */}
        <div className="flex flex-wrap gap-1">
          {KNOWN_SHAPES.map((shape) => (
            <button
              key={shape}
              onClick={() => applyFilter(() => setShapeFilter(shape))}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                shapeFilter === shape
                  ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 font-medium'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-amber-400'
              }`}
            >
              {shape}
            </button>
          ))}
        </div>
        {/* Divider */}
        <div className="w-px bg-gray-200 dark:bg-gray-700 self-stretch" />
        {/* Source */}
        <div className="flex flex-wrap gap-1">
          {KNOWN_SOURCES.map((src) => (
            <button
              key={src}
              onClick={() => applyFilter(() => setSourceFilter(src))}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                sourceFilter === src
                  ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium'
                  : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-indigo-400'
              }`}
            >
              {src}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      {total !== null && (
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {loading ? 'Searching...' : `${total.toLocaleString()} record${total !== 1 ? 's' : ''}${total > PAGE_SIZE ? ` (showing ${results.length})` : ''}`}
        </p>
      )}

      {/* Loading skeleton */}
      {loading && results.length === 0 && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && total === 0 && (
        <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
          No sightings match your filters.
        </div>
      )}

      {/* Result cards */}
      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((s, i) => (
            <SightingCard key={`${s.id}-${i}`} sighting={s} />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && (
        <div className="text-center pt-2">
          <button
            onClick={loadMore}
            className="text-sm text-primary hover:underline"
          >
            Load more ({(total ?? 0) - results.length > PAGE_SIZE ? `${PAGE_SIZE} of ` : ''}{((total ?? 0) - results.length).toLocaleString()} remaining)
          </button>
        </div>
      )}

      {/* Loading more indicator */}
      {loading && results.length > 0 && (
        <div className="text-center pt-2 text-sm text-gray-400 dark:text-gray-500">
          Loading...
        </div>
      )}

      {/* Attribution */}
      <p className="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
        Reports sourced from NUFORC, MUFON, UFOCAT, UPDB, and UFO-search via{' '}
        <a href="https://ufosint.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          ufosint.com
        </a>.
        Not editorially reviewed by DECUR.
      </p>
    </div>
  );
}
