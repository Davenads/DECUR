import { useState, useMemo, FC } from 'react';
import { TimelineEntry } from '../../lib/useTimelineData';
import BrowserLayout from './shared/BrowserLayout';

const TYPE_LABELS: Record<string, string> = {
  'documentaries': 'Documentary',
  'books-documents': 'Book / Document',
};

const TYPE_COLORS: Record<string, string> = {
  'documentaries': 'bg-orange-100 text-orange-800',
  'books-documents': 'bg-teal-100 text-teal-800',
};

const TYPE_FILTER_OPTIONS = [
  { value: 'all',              label: 'All Types' },
  { value: 'documentaries',    label: 'Documentaries' },
  { value: 'books-documents',  label: 'Books & Documents' },
];

interface Props { entries: TimelineEntry[]; }

const MediaBrowser: FC<Props> = ({ entries }) => {
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return entries
      .filter(e =>
        (selectedType === 'all' || e.categories.includes(selectedType)) &&
        (!q || e.title.toLowerCase().includes(q) || e.excerpt.toLowerCase().includes(q))
      )
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [entries, search, selectedType]);

  const primaryType = (e: TimelineEntry) =>
    e.categories.find(c => ['documentaries', 'books-documents'].includes(c)) ?? e.categories[0];

  return (
    <BrowserLayout
      title="Media & Documents"
      description={`${entries.length} documentaries, books, and official documents related to UAP research and disclosure.`}
      searchValue={search}
      onSearchChange={setSearch}
      searchPlaceholder="Search media..."
      filters={[{ value: selectedType, onChange: setSelectedType, options: TYPE_FILTER_OPTIONS }]}
      resultCount={filtered.length}
    >
      <div className="space-y-3">
        {filtered.map((entry: TimelineEntry) => {
          const type = primaryType(entry);
          return (
            <a
              key={entry.id}
              href={entry.article_url || entry.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md hover:border-primary transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[type] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200'}`}>
                    {TYPE_LABELS[type] ?? type}
                  </span>
                  <span className="text-xs text-gray-400">{entry.year}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
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
            </a>
          );
        })}
      </div>
    </BrowserLayout>
  );
};

export default MediaBrowser;
