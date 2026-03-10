import { useState, useMemo, FC, ChangeEvent } from 'react';
import { TimelineEntry } from '../../lib/useTimelineData';
import { formatTimestamp } from '../../utils/formatting';

interface Props { entries: TimelineEntry[]; }

const QuotesBrowser: FC<Props> = ({ entries }) => {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries
      .filter(e =>
        !q ||
        e.title.toLowerCase().includes(q) ||
        e.excerpt.toLowerCase().includes(q) ||
        (e.quote_text ?? '').toLowerCase().includes(q)
      )
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [entries, search]);

  return (
    <div>
      <h2 className="text-2xl font-bold font-heading mb-2">Quotes</h2>
      <p className="text-gray-500 text-sm mb-6">
        {entries.length} statements from government officials, military personnel, researchers, and witnesses.
      </p>

      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search by name, role, or quote text..."
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
          <div
            key={entry.id}
            className="bg-white border border-gray-200 rounded-lg p-5"
          >
            {/* Speaker header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">{entry.title}</p>
                {entry.excerpt && (
                  <p className="text-xs text-gray-400 mt-0.5">{entry.excerpt}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 pt-0.5">{entry.date}</span>
            </div>

            {/* Quote body */}
            {entry.quote_text ? (
              <blockquote className="border-l-2 border-primary/30 pl-4 my-2">
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  {entry.quote_text}
                </p>
                {entry.quote_attribution && (
                  <cite className="text-xs text-gray-400 not-italic mt-1 block">
                    {entry.quote_attribution}
                  </cite>
                )}
              </blockquote>
            ) : (
              <p className="text-sm text-gray-400 italic">Quote text unavailable.</p>
            )}

            {/* Source link */}
            <div className="mt-3 pt-3 border-t border-gray-100">
              {entry.source === 'aod' ? (
                <span className="text-xs text-gray-400">
                  {entry.timestamp
                    ? `${formatTimestamp(entry.timestamp)} — The Age of Disclosure (2024)`
                    : 'The Age of Disclosure (2024)'}
                </span>
              ) : (
                <a
                  href={entry.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  Source: ufotimeline.com ↗
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuotesBrowser;
