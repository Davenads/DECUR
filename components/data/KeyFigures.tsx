import { useState, useMemo, FC, ChangeEvent } from 'react';
import { TimelineEntry } from '../../lib/useTimelineData';

interface Props { entries: TimelineEntry[]; }

const KeyFigures: FC<Props> = ({ entries }) => {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries
      .filter(e => !q || e.title.toLowerCase().includes(q) || e.excerpt.toLowerCase().includes(q))
      .sort((a, b) => a.title.localeCompare(b.title));
  }, [entries, search]);

  return (
    <div>
      <h2 className="text-2xl font-bold font-heading mb-2">Key Figures</h2>
      <p className="text-gray-500 text-sm mb-6">
        {entries.length} individuals central to UAP research, disclosure, and investigation.
      </p>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search figures..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="w-full px-4 py-2 pl-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <p className="text-xs text-gray-400 mb-4">{filtered.length} results</p>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map((entry: TimelineEntry) => {
          const isOpen = expanded === entry.id;
          return (
            <div key={entry.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className="w-full text-left p-4 hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(isOpen ? null : entry.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-xs text-gray-400">{entry.year}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900">{entry.title}</h3>
                    {!isOpen && entry.excerpt && (
                      <p className="mt-1 text-xs text-gray-500 line-clamp-1"
                        dangerouslySetInnerHTML={{ __html: entry.excerpt }}
                      />
                    )}
                  </div>
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 text-gray-400 flex-shrink-0 mt-1 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 border-t border-gray-100">
                  <p className="mt-3 text-sm text-gray-700"
                    dangerouslySetInnerHTML={{ __html: entry.excerpt }}
                  />
                  <a
                    href={entry.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    View source
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

export default KeyFigures;
