import { FC, useState, useEffect, useCallback } from 'react';
import { GetStaticProps } from 'next';
import SeoHead from '../components/SeoHead';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Fuse, { FuseResult } from 'fuse.js';
import insidersData from '../data/insiders/index.json';
import glossaryData from '../data/glossary.json';
import resourcesData from '../data/resources.json';

// ---- Types ----------------------------------------------------------------

interface SearchItem {
  id: string;
  type: 'insider' | 'timeline' | 'glossary' | 'resource';
  title: string;
  subtitle?: string | null;
  description: string;
  href: string;
  badge?: string;
}

interface SearchPageProps {
  corpus: SearchItem[];
}

// ---- getStaticProps --------------------------------------------------------

export const getStaticProps: GetStaticProps<SearchPageProps> = async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const timeline: Array<{
      id: number;
      title: string;
      year: number;
      excerpt: string;
      categories: string[];
    }> = require('../data/ufotimeline.json');

    const corpus: SearchItem[] = [];

    // Insiders
    for (const ins of insidersData as Array<{
      id: string; name: string; role?: string; affiliation?: string;
      summary?: string; tags?: string[];
    }>) {
      corpus.push({
        id: `insider-${ins.id}`,
        type: 'insider',
        title: ins.name,
        subtitle: ins.role ?? ins.affiliation ?? null,
        description: ins.summary ?? ins.tags?.join(', ') ?? '',
        href: `/figures/${ins.id}`,
        badge: 'Key Figure',
      });
    }

    // Timeline (title + excerpt only -- no full data)
    for (const entry of timeline) {
      corpus.push({
        id: `timeline-${entry.id}`,
        type: 'timeline',
        title: entry.title,
        subtitle: String(entry.year),
        description: entry.excerpt ?? '',
        href: `/timeline?year=${entry.year}`,
        badge: (entry.categories?.[0] ?? 'event').replace(/-/g, ' '),
      });
    }

    // Glossary
    for (const term of glossaryData as Array<{
      term: string; definition: string; source: string;
    }>) {
      corpus.push({
        id: `glossary-${term.term}`,
        type: 'glossary',
        title: term.term,
        description: term.definition,
        href: `/resources?tab=glossary`,
        badge: 'Glossary',
      });
    }

    // Resources (sources + testimony)
    const resources = resourcesData as unknown as {
      sources: Array<{ id: string; title: string; author?: string; year?: string | number; description: string; type: string }>;
      testimony: Array<{ id: string; title: string; author?: string; year?: string | number; description: string; type: string }>;
    };
    for (const r of [...(resources.sources ?? []), ...(resources.testimony ?? [])]) {
      corpus.push({
        id: `resource-${r.id}`,
        type: 'resource',
        title: r.title,
        subtitle: r.author ? `${r.author}${r.year ? ` (${r.year})` : ''}` : null,
        description: r.description ?? '',
        href: `/resources`,
        badge: r.type ?? 'Resource',
      });
    }

    return { props: { corpus }, revalidate: 3600 };
  } catch (error) {
    console.error('[getStaticProps] search.tsx:', error);
    return { notFound: true };
  }
};

// ---- Helpers ---------------------------------------------------------------

const TYPE_STYLES: Record<SearchItem['type'], string> = {
  insider:  'bg-blue-100 text-blue-700',
  timeline: 'bg-amber-100 text-amber-700',
  glossary: 'bg-indigo-100 text-indigo-700',
  resource: 'bg-emerald-100 text-emerald-700',
};

const TYPE_LABELS: Record<SearchItem['type'], string> = {
  insider:  'Key Figures',
  timeline: 'Timeline Events',
  glossary: 'Glossary',
  resource: 'Resources',
};

// ---- Component -------------------------------------------------------------

const SearchPage: FC<SearchPageProps> = ({ corpus }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FuseResult<SearchItem>[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const fuse = useCallback(
    () =>
      new Fuse(corpus, {
        keys: [
          { name: 'title',       weight: 0.5 },
          { name: 'subtitle',    weight: 0.2 },
          { name: 'description', weight: 0.2 },
          { name: 'badge',       weight: 0.1 },
        ],
        threshold: 0.35,
        includeScore: true,
        minMatchCharLength: 2,
      }),
    [corpus]
  );

  // Sync query from URL on load / back-nav
  useEffect(() => {
    const q = (router.query.q as string) ?? '';
    if (q) {
      setQuery(q);
      runSearch(q);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.q]);

  const runSearch = (q: string) => {
    if (!q.trim()) { setResults([]); setHasSearched(false); return; }
    setHasSearched(true);
    setResults(fuse().search(q));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`, undefined, { shallow: true });
    runSearch(query);
  };

  // Group results by type
  const grouped = results.reduce<Record<string, FuseResult<SearchItem>[]>>(
    (acc, r) => {
      const t = r.item.type;
      (acc[t] = acc[t] ?? []).push(r);
      return acc;
    },
    {}
  );
  const typeOrder: SearchItem['type'][] = ['insider', 'timeline', 'glossary', 'resource'];

  return (
    <>
      <SeoHead
        title={query ? `"${query}" - Search` : 'Search'}
        description="Search DECUR's archive of UAP research, key figure profiles, historical events, glossary terms, and primary source materials."
        path="/search"
      />
      <div className="min-h-screen bg-gray-50 -mt-8 -mx-4 px-4 pt-10 pb-10">
        <div className="max-w-3xl mx-auto">

          {/* Search input */}
          <form onSubmit={handleSubmit} className="relative mb-8">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search insiders, events, terms, resources..."
              className="w-full pl-11 pr-4 py-3 text-base bg-white border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </form>

          {/* Results */}
          {hasSearched && (
            <div>
              {results.length === 0 ? (
                <p className="text-center text-gray-500 py-16 text-sm">
                  No results for <span className="font-medium">&ldquo;{query}&rdquo;</span>
                </p>
              ) : (
                <>
                  <p className="text-sm text-gray-400 mb-6">
                    {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
                    <span className="font-medium text-gray-700">&ldquo;{query}&rdquo;</span>
                  </p>
                  <div className="space-y-10">
                    {typeOrder.filter(t => grouped[t]).map(type => (
                      <section key={type}>
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                          {TYPE_LABELS[type]} ({grouped[type].length})
                        </h2>
                        <div className="space-y-2">
                          {grouped[type].map(({ item }) => (
                            <Link
                              key={item.id}
                              href={item.href}
                              className="block bg-white rounded-lg border border-gray-200 px-4 py-3 hover:border-primary hover:shadow-sm transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                    <span className="text-sm font-semibold text-gray-900 truncate">
                                      {item.title}
                                    </span>
                                    {item.badge && (
                                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TYPE_STYLES[item.type]}`}>
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  {item.subtitle && (
                                    <p className="text-xs text-gray-400 mb-1">{item.subtitle}</p>
                                  )}
                                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>
                                <svg className="h-4 w-4 text-gray-300 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </section>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {!hasSearched && (
            <div className="text-center py-16 text-gray-400 text-sm">
              <p className="mb-1 font-medium text-gray-500">Search across all DECUR data</p>
              <p>Insiders &middot; {corpus.filter(c => c.type === 'timeline').length} timeline events &middot; {corpus.filter(c => c.type === 'glossary').length} glossary terms &middot; Resources</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default SearchPage;
