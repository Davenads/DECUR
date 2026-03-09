import { useState, FC, ChangeEvent, useMemo } from 'react';
import resourcesData from '../../data/resources.json';

interface Resource {
  id: string;
  title: string;
  type?: string;
  author?: string;
  source?: string;
  participants?: string;
  year?: string;
  date?: string;
  description: string;
  url: string;
  insider: string | null;
  tags: string[];
}

interface ResourceListProps {
  category: 'sources' | 'testimony';
}

const ResourceList: FC<ResourceListProps> = ({ category }) => {
  const resources: Resource[] = (resourcesData as Record<string, Resource[]>)[category] ?? [];

  const types = useMemo(() => {
    const seen = new Set<string>();
    for (const r of resources) {
      const t = r.type ?? r.source;
      if (t) seen.add(t);
    }
    return Array.from(seen);
  }, [resources]);

  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return resources.filter(r => {
      const matchesType = !activeType || r.type === activeType || r.source === activeType;
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.description.toLowerCase().includes(q) ||
        (r.author ?? '').toLowerCase().includes(q) ||
        (r.participants ?? '').toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [resources, search, activeType]);

  return (
    <div>
      <h2 className="text-2xl font-bold font-heading text-gray-900 mb-1">
        {category === 'sources' ? 'Primary Sources' : 'Testimony & Interviews'}
      </h2>
      <p className="text-sm text-gray-500 mb-6">
        {category === 'sources'
          ? 'Government reports, journalism, and books documenting the UAP disclosure landscape.'
          : 'Congressional testimony, official hearings, and primary interviews with key figures.'}
      </p>

      {/* Search */}
      <div className="relative mb-4">
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="w-full px-4 py-2 pl-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Type filter chips */}
      {types.length > 1 && (
        <div className="flex flex-wrap gap-1.5 mb-6">
          <button
            onClick={() => setActiveType(null)}
            className={`text-xs px-3 py-1 rounded-full font-medium transition-colors border ${
              !activeType
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
            }`}
          >
            All
          </button>
          {types.map(t => (
            <button
              key={t}
              onClick={() => setActiveType(activeType === t ? null : t)}
              className={`text-xs px-3 py-1 rounded-full font-medium transition-colors border ${
                activeType === t
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      {filtered.length === 0 ? (
        <p className="text-gray-500 text-center py-8 text-sm">No results matching your search.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map(r => (
            <div key={r.id} className="border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    {(r.type ?? r.source) && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium shrink-0">
                        {r.type ?? r.source}
                      </span>
                    )}
                    <span className="text-xs text-gray-400">{r.year ?? r.date}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 leading-snug mb-1">{r.title}</h3>
                  {r.author && (
                    <p className="text-xs text-gray-500 mb-2">{r.author}</p>
                  )}
                  {r.participants && (
                    <p className="text-xs text-gray-500 mb-2">{r.participants}</p>
                  )}
                  <p className="text-sm text-gray-600 leading-relaxed">{r.description}</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {r.tags.map(tag => (
                      <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">{tag}</span>
                    ))}
                  </div>
                </div>
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline whitespace-nowrap shrink-0 flex items-center gap-1"
                >
                  View ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResourceList;
