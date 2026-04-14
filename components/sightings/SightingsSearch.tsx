import { useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import sampleData from '../../data/ufosint/sample-sightings.json';

/* ── Types ──────────────────────────────────────────────────────────── */

interface Sighting {
  id: number;
  date: string | null;
  shape: string | null;
  source: string;
  city: string | null;
  state: string | null;
  country: string | null;
  case_id: string;
  case_name: string;
}

/* ── Constants ──────────────────────────────────────────────────────── */

const SIGHTINGS = sampleData as Sighting[];

const ALL_SHAPES = ['All', ...Array.from(new Set(SIGHTINGS.map((s) => s.shape).filter(Boolean) as string[])).sort()];
const ALL_SOURCES = ['All', ...Array.from(new Set(SIGHTINGS.map((s) => s.source))).sort()];

const SOURCE_COLORS: Record<string, string> = {
  UFOCAT:    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
  MUFON:     'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400',
  NUFORC:    'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  'UFO-search': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400',
  UPDB:      'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400',
};

const BOOKMARK_KEY = 'decur:sighting-bookmarks';

/* ── Bookmark helpers ───────────────────────────────────────────────── */

function getBookmarks(): Set<number> {
  try {
    const raw = localStorage.getItem(BOOKMARK_KEY);
    return new Set(raw ? (JSON.parse(raw) as number[]) : []);
  } catch {
    return new Set();
  }
}

function saveBookmarks(set: Set<number>): void {
  try {
    localStorage.setItem(BOOKMARK_KEY, JSON.stringify(Array.from(set)));
  } catch { /* ignore */ }
}

/* ── Location formatter ─────────────────────────────────────────────── */

function formatLocation(s: Sighting): string {
  const parts = [s.city, s.state, s.country].filter(Boolean) as string[];
  return parts.slice(0, 2).join(', ') || 'Unknown location';
}

/* ── Result card ────────────────────────────────────────────────────── */

interface CardProps {
  sighting: Sighting;
  bookmarked: boolean;
  onToggleBookmark: (id: number) => void;
}

const SightingCard: React.FC<CardProps> = ({ sighting, bookmarked, onToggleBookmark }) => {
  const srcColor = SOURCE_COLORS[sighting.source] ?? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400';

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 flex items-start gap-3 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
      {/* Bookmark button */}
      <button
        onClick={() => onToggleBookmark(sighting.id)}
        title={bookmarked ? 'Remove bookmark' : 'Bookmark this sighting'}
        className={`mt-0.5 flex-shrink-0 transition-colors ${
          bookmarked ? 'text-amber-500' : 'text-gray-300 dark:text-gray-600 hover:text-amber-400'
        }`}
      >
        <svg className="w-4 h-4" fill={bookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
        </svg>
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          {/* Source badge */}
          <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${srcColor}`}>
            {sighting.source}
          </span>
          {/* Shape badge */}
          {sighting.shape && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              {sighting.shape}
            </span>
          )}
          {/* Date */}
          {sighting.date && (
            <span className="text-xs text-gray-400 dark:text-gray-500 tabular-nums">
              {sighting.date}
            </span>
          )}
        </div>

        <p className="text-sm text-gray-700 dark:text-gray-300 truncate">
          {formatLocation(sighting)}
        </p>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
          Near{' '}
          <Link
            href={`/cases/${sighting.case_id}`}
            className="text-primary hover:underline"
          >
            {sighting.case_name}
          </Link>
          {' '}· ID #{sighting.id}
        </p>
      </div>
    </div>
  );
};

/* ── Main component ─────────────────────────────────────────────────── */

const PAGE_SIZE = 20;

export default function SightingsSearch() {
  const [query, setQuery] = useState('');
  const [shapeFilter, setShapeFilter] = useState('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [showBookmarked, setShowBookmarked] = useState(false);
  const [page, setPage] = useState(1);
  const [bookmarks, setBookmarks] = useState<Set<number>>(() => {
    if (typeof window === 'undefined') return new Set();
    return getBookmarks();
  });

  const toggleBookmark = useCallback((id: number) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      saveBookmarks(next);
      return next;
    });
  }, []);

  const filtered = useMemo(() => {
    let results = SIGHTINGS;

    if (showBookmarked) {
      results = results.filter((s) => bookmarks.has(s.id));
    }
    if (shapeFilter !== 'All') {
      results = results.filter((s) => s.shape === shapeFilter);
    }
    if (sourceFilter !== 'All') {
      results = results.filter((s) => s.source === sourceFilter);
    }
    if (query.trim()) {
      const q = query.trim().toLowerCase();
      results = results.filter(
        (s) =>
          s.city?.toLowerCase().includes(q) ||
          s.state?.toLowerCase().includes(q) ||
          s.country?.toLowerCase().includes(q) ||
          s.case_name.toLowerCase().includes(q) ||
          s.shape?.toLowerCase().includes(q)
      );
    }

    return results;
  }, [query, shapeFilter, sourceFilter, showBookmarked, bookmarks]);

  const paginated = filtered.slice(0, page * PAGE_SIZE);
  const hasMore = paginated.length < filtered.length;

  // Reset page when filters change
  const handleFilter = useCallback((fn: () => void) => {
    fn();
    setPage(1);
  }, []);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Browse Sightings
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Sample records from UFOSINT nearest to DECUR documented cases
          </p>
        </div>
        <button
          onClick={() => handleFilter(() => setShowBookmarked((b) => !b))}
          className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
            showBookmarked
              ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
              : 'border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:border-amber-400 hover:text-amber-500'
          }`}
        >
          <svg className="w-3.5 h-3.5" fill={showBookmarked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
          </svg>
          Bookmarked{bookmarks.size > 0 ? ` (${bookmarks.size})` : ''}
        </button>
      </div>

      {/* Search input */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          placeholder="Search by city, state, country, case name, or shape..."
          value={query}
          onChange={(e) => handleFilter(() => setQuery(e.target.value))}
          className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-colors"
        />
        {query && (
          <button
            onClick={() => handleFilter(() => setQuery(''))}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {/* Shape */}
        <div className="flex flex-wrap gap-1">
          {ALL_SHAPES.map((shape) => (
            <button
              key={shape}
              onClick={() => handleFilter(() => setShapeFilter(shape))}
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
          {ALL_SOURCES.map((src) => (
            <button
              key={src}
              onClick={() => handleFilter(() => setSourceFilter(src))}
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
      <p className="text-xs text-gray-400 dark:text-gray-500">
        {filtered.length} record{filtered.length !== 1 ? 's' : ''}
        {filtered.length !== SIGHTINGS.length ? ` of ${SIGHTINGS.length}` : ''}
      </p>

      {/* Result cards */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
          No sightings match your filters.
        </div>
      ) : (
        <div className="space-y-2">
          {paginated.map((s) => (
            <SightingCard
              key={s.id}
              sighting={s}
              bookmarked={bookmarks.has(s.id)}
              onToggleBookmark={toggleBookmark}
            />
          ))}
        </div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="text-center pt-2">
          <button
            onClick={() => setPage((p) => p + 1)}
            className="text-sm text-primary hover:underline"
          >
            Show more ({filtered.length - paginated.length} remaining)
          </button>
        </div>
      )}

      {/* UFOSINT attribution */}
      <p className="text-xs text-gray-400 dark:text-gray-500 pt-2 border-t border-gray-100 dark:border-gray-800">
        Sample records only. Full database of 614,505 reports available at{' '}
        <a href="https://ufosint.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
          ufosint.com
        </a>.
      </p>
    </div>
  );
}
