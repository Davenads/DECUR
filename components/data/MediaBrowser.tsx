import { useState, useMemo, FC, ChangeEvent } from 'react';
import { TimelineEntry } from '../../lib/useTimelineData';

const TYPE_LABELS: Record<string, string> = {
  'documentaries': 'Documentary',
  'books-documents': 'Book / Document',
};

const TYPE_COLORS: Record<string, string> = {
  'documentaries': 'bg-orange-100 text-orange-800',
  'books-documents': 'bg-teal-100 text-teal-800',
};

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
    <div>
      <h2 className="text-2xl font-bold font-heading mb-2">Media & Documents</h2>
      <p className="text-gray-500 text-sm mb-6">
        {entries.length} documentaries, books, and official documents related to UAP research and disclosure.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search media..."
            value={search}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            className="w-full px-4 py-2 pl-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          value={selectedType}
          onChange={e => setSelectedType(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary bg-white"
        >
          <option value="all">All Types</option>
          <option value="documentaries">Documentaries</option>
          <option value="books-documents">Books & Documents</option>
        </select>
      </div>

      <p className="text-xs text-gray-400 mb-4">{filtered.length} results</p>

      <div className="space-y-3">
        {filtered.map((entry: TimelineEntry) => {
          const type = primaryType(entry);
          return (
            <a
              key={entry.id}
              href={entry.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:shadow-md hover:border-primary transition-all group"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[type] ?? 'bg-gray-100 text-gray-700'}`}>
                    {TYPE_LABELS[type] ?? type}
                  </span>
                  <span className="text-xs text-gray-400">{entry.year}</span>
                </div>
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors">
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
    </div>
  );
};

export default MediaBrowser;
