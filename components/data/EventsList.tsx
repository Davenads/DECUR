import { useState, useMemo, FC, ChangeEvent } from 'react';
import { TimelineEntry } from '../../lib/useTimelineData';

const CATEGORY_COLORS: Record<string, string> = {
  'famous-cases': 'bg-red-100 text-red-800',
  'sightings': 'bg-green-100 text-green-800',
};
const CATEGORY_LABELS: Record<string, string> = {
  'famous-cases': 'Famous Case',
  'sightings': 'Sighting',
};

const ERA_OPTIONS = [
  { value: 'all',         label: 'All Eras' },
  { value: 'ancient',     label: 'Pre-1900' },
  { value: 'early',       label: '1900–1944' },
  { value: 'cold-war',    label: '1945–1969' },
  { value: 'modern',      label: '1970–1999' },
  { value: 'contemporary',label: '2000–2019' },
  { value: 'recent',      label: '2020–Present' },
];

function matchEra(year: number, era: string): boolean {
  switch (era) {
    case 'ancient':      return year < 1900;
    case 'early':        return year >= 1900 && year <= 1944;
    case 'cold-war':     return year >= 1945 && year <= 1969;
    case 'modern':       return year >= 1970 && year <= 1999;
    case 'contemporary': return year >= 2000 && year <= 2019;
    case 'recent':       return year >= 2020;
    default:             return true;
  }
}

interface Props {
  entries: TimelineEntry[];
  sourceFilter?: string;
}

const EventsList: FC<Props> = ({ entries, sourceFilter }) => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [era, setEra] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries
      .filter(e =>
        (selectedCategory === 'all' || e.categories.includes(selectedCategory)) &&
        (!sourceFilter || e.source === sourceFilter) &&
        matchEra(e.year, era) &&
        (!q || e.title.toLowerCase().includes(q) || e.excerpt.toLowerCase().includes(q))
      )
      .sort((a, b) =>
        sortOrder === 'asc'
          ? a.date.localeCompare(b.date)
          : b.date.localeCompare(a.date)
      );
  }, [entries, search, selectedCategory, era, sortOrder, sourceFilter]);

  const primaryCat = (e: TimelineEntry) =>
    e.categories.find(c => ['famous-cases', 'sightings'].includes(c)) ?? e.categories[0];

  return (
    <div>
      <h2 className="text-2xl font-bold font-heading mb-2">Historical Events</h2>
      <p className="text-gray-500 text-sm mb-6">
        {entries.length} documented cases and sightings.
      </p>

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search events..."
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-full px-4 py-2 pl-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <select
          value={selectedCategory}
          onChange={e => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          <option value="all">All Types</option>
          <option value="famous-cases">Famous Cases</option>
          <option value="sightings">Sightings</option>
        </select>

        <select
          value={era}
          onChange={e => setEra(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          {ERA_OPTIONS.map(o => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      {/* Results row */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400">{filtered.length} results</p>
        <button
          onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800 transition-colors"
          title={sortOrder === 'asc' ? 'Currently: oldest first' : 'Currently: newest first'}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={sortOrder === 'asc' ? 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12' : 'M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4'} />
          </svg>
          {sortOrder === 'asc' ? 'Oldest first' : 'Newest first'}
        </button>
      </div>

      <div className="space-y-3">
        {filtered.map(entry => {
          const cat = primaryCat(entry);
          const isOpen = expanded === entry.id;
          return (
            <div key={entry.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : entry.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CATEGORY_COLORS[cat] ?? 'bg-gray-100 text-gray-700'}`}>
                        {CATEGORY_LABELS[cat] ?? cat}
                      </span>
                      <span className="text-xs text-gray-400">{entry.date}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">{entry.title}</h3>
                    {!isOpen && entry.excerpt && (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-1">{entry.excerpt}</p>
                    )}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 flex-shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <p className="mt-3 text-sm text-gray-700">{entry.excerpt}</p>
                  <a
                    href={entry.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    Read full article
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EventsList;
