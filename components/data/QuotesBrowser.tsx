import { useState, useMemo, FC, ChangeEvent } from 'react';
import { TimelineEntry } from '../../lib/useTimelineData';

interface Props { entries: TimelineEntry[]; }

const QuotesBrowser: FC<Props> = ({ entries }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries
      .filter(e => !q || e.title.toLowerCase().includes(q) || e.excerpt.toLowerCase().includes(q))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, search]);

  return (
    <div>
      <h2 className="text-2xl font-bold font-heading mb-2">Quotes</h2>
      <p className="text-gray-500 text-sm mb-6">
        {entries.length} notable statements from government officials, military personnel, researchers, and witnesses.
      </p>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search quotes..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="w-full px-4 py-2 pl-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      <p className="text-xs text-gray-400 mb-4">{filtered.length} results</p>

      <div className="space-y-4">
        {filtered.map((entry: TimelineEntry) => (
          <a
            key={entry.id}
            href={entry.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-primary transition-all group"
          >
            <div className="flex gap-3">
              <div className="text-3xl text-primary opacity-30 font-serif leading-none select-none">&ldquo;</div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
                  {entry.title}
                </h3>
                {entry.excerpt && (
                  <p className="mt-2 text-sm text-gray-600 italic"
                    dangerouslySetInnerHTML={{ __html: entry.excerpt }}
                  />
                )}
                <p className="mt-2 text-xs text-gray-400">{entry.date}</p>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default QuotesBrowser;
