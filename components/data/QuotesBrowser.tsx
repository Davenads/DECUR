import { useState, useMemo, FC } from 'react';
import { TimelineEntry } from '../../lib/useTimelineData';
import { formatTimestamp } from '../../utils/formatting';
import BrowserLayout from './shared/BrowserLayout';

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
    <BrowserLayout
      title="Quotes"
      description={`${entries.length} statements from government officials, military personnel, researchers, and witnesses.`}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search by name, role, or quote text..."
      resultCount={filtered.length}
    >
      <div className="space-y-4">
        {filtered.map((entry: TimelineEntry) => (
          <div
            key={entry.id}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5"
          >
            {/* Speaker header */}
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{entry.title}</p>
                {entry.excerpt && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{entry.excerpt}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap shrink-0 pt-0.5">{entry.date}</span>
            </div>

            {/* Quote body */}
            {entry.quote_text ? (
              <blockquote className="border-l-2 border-primary/30 pl-4 my-2">
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed italic">
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
            <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
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
    </BrowserLayout>
  );
};

export default QuotesBrowser;
