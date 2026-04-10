import { FC, useState, useEffect, useCallback } from 'react';
import { GetStaticProps } from 'next';
import SeoHead from '../components/SeoHead';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Fuse, { FuseResult } from 'fuse.js';
import insidersData from '../data/key-figures/index.json';
import glossaryData from '../data/glossary.json';
import resourcesData from '../data/resources.json';
import casesData from '../data/cases.json';
import documentsData from '../data/documents.json';
import contractorsData from '../data/contractors.json';
import programsData from '../data/programs.json';

// ---- Types ----------------------------------------------------------------

interface SearchItem {
  id: string;
  type: 'insider' | 'case' | 'document' | 'timeline' | 'glossary' | 'resource' | 'contractor' | 'program';
  title: string;
  subtitle?: string | null;
  description: string;
  /** Aggregated full-text content for deeper search (disclosures, key events, claims, findings). Lower weight in Fuse. */
  fullText?: string;
  href: string;
  badge?: string;
  aliases?: string[];
}

const MAX_FULL_TEXT = 1500; // chars per item — keeps serialized page prop manageable
const MAX_PER_TYPE  = 10;   // max results shown per type before "refine" nudge

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
    }> = require('../data/timeline.json');

    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { insiderRegistry } = require('../data/key-figures/registry') as {
      insiderRegistry: Record<string, Record<string, unknown>>;
    };

    const corpus: SearchItem[] = [];

    // Insiders — index.json metadata + deep profile content (disclosures, key_events, claims)
    for (const ins of insidersData as Array<{
      id: string; name: string; role?: string; affiliation?: string;
      summary?: string; tags?: string[]; aliases?: string[];
    }>) {
      const profile = insiderRegistry[ins.id] as Record<string, unknown> | undefined;

      const disclosureText = (profile?.disclosures as Array<{ title?: string; notes?: string }> ?? [])
        .map(d => [d.title, d.notes].filter(Boolean).join(' '))
        .join(' ');

      const keyEventText = (
        (profile?.profile as { key_events?: Array<{ event: string }> } | undefined)?.key_events ?? []
      ).map(e => e.event).join(' ');

      const claimsText = Array.isArray(profile?.claims)
        ? (profile.claims as Array<{ claim: string }>).map(c => c.claim).join(' ')
        : '';

      const fullText = [disclosureText, keyEventText, claimsText]
        .filter(Boolean).join(' ').slice(0, MAX_FULL_TEXT);

      corpus.push({
        id: `insider-${ins.id}`,
        type: 'insider',
        title: ins.name,
        subtitle: ins.role ?? ins.affiliation ?? null,
        description: ins.summary ?? ins.tags?.join(', ') ?? '',
        fullText: fullText || undefined,
        href: `/figures/${ins.id}`,
        badge: 'Key Figure',
        aliases: ins.aliases ?? [],
      });
    }

    // Documented Cases — summary + key facts + witness testimony
    for (const c of casesData as Array<{
      id: string; name: string; date: string; location: string;
      summary: string; tags: string[];
      overview?: { key_facts?: string[] };
      witnesses?: Array<{ testimony: string }>;
    }>) {
      const keyFacts = (c.overview?.key_facts ?? []).join(' ');
      const witnessText = (c.witnesses ?? []).map(w => w.testimony).join(' ');
      const fullText = [keyFacts, witnessText].filter(Boolean).join(' ').slice(0, MAX_FULL_TEXT);

      corpus.push({
        id: `case-${c.id}`,
        type: 'case',
        title: c.name,
        subtitle: `${c.date} · ${c.location}`,
        description: c.summary,
        fullText: fullText || undefined,
        href: `/cases/${c.id}`,
        badge: 'Documented Case',
      });
    }

    // Declassified Documents — summary + key findings + significance
    for (const doc of documentsData as Array<{
      id: string; name: string; date: string; issuing_authority: string;
      document_type: string; summary: string; significance: string;
      key_findings?: string[];
    }>) {
      const findingsText = (doc.key_findings ?? []).join(' ');
      const fullText = [findingsText, doc.significance].filter(Boolean).join(' ').slice(0, MAX_FULL_TEXT);

      corpus.push({
        id: `document-${doc.id}`,
        type: 'document',
        title: doc.name,
        subtitle: `${doc.issuing_authority} · ${doc.date}`,
        description: doc.summary ?? doc.significance ?? '',
        fullText: fullText || undefined,
        href: `/documents/${doc.id}`,
        badge: doc.document_type ?? 'Document',
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

    // Defense Contractors
    for (const c of contractorsData as Array<{
      id: string; name: string; sublabel: string; headquarters: string;
      founded: string; summary: string; tags: string[];
    }>) {
      corpus.push({
        id: `contractor-${c.id}`,
        type: 'contractor',
        title: c.name,
        subtitle: `Est. ${c.founded} · ${c.headquarters}`,
        description: c.summary ?? c.tags?.join(', ') ?? '',
        href: `/contractors/${c.id}`,
        badge: 'Contractor',
      });
    }

    // Government Programs
    for (const p of programsData as Array<{
      id: string; name: string; type: string; status: string;
      active_period: string; parent_org: string; summary: string;
    }>) {
      corpus.push({
        id: `program-${p.id}`,
        type: 'program',
        title: p.name,
        subtitle: `${p.active_period} · ${p.parent_org}`,
        description: p.summary,
        href: `/programs/${p.id}`,
        badge: p.type.charAt(0).toUpperCase() + p.type.slice(1),
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
  insider:    'bg-blue-100 text-blue-700',
  case:       'bg-red-100 text-red-700',
  document:   'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300',
  timeline:   'bg-amber-100 text-amber-700',
  glossary:   'bg-indigo-100 text-indigo-700',
  resource:   'bg-emerald-100 text-emerald-700',
  contractor: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  program:    'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
};

const TYPE_LABELS: Record<SearchItem['type'], string> = {
  insider:    'Key Figures',
  case:       'Documented Cases',
  document:   'Declassified Documents',
  timeline:   'Timeline Events',
  glossary:   'Glossary',
  resource:   'Resources',
  contractor: 'Defense Contractors',
  program:    'Government Programs',
};

// ---- Component -------------------------------------------------------------

const SearchPage: FC<SearchPageProps> = ({ corpus }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FuseResult<SearchItem>[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [typeFilter, setTypeFilter] = useState<SearchItem['type'] | null>(null);

  const fuse = useCallback(
    () =>
      new Fuse(corpus, {
        keys: [
          { name: 'title',       weight: 0.5 },
          { name: 'aliases',     weight: 0.4 },
          { name: 'subtitle',    weight: 0.2 },
          { name: 'description', weight: 0.2 },
          { name: 'badge',       weight: 0.1 },
          { name: 'fullText',    weight: 0.05 },
        ],
        threshold: 0.35,
        ignoreLocation: true,   // match anywhere in the string, not just near start
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
    if (!q.trim()) { setResults([]); setHasSearched(false); setTypeFilter(null); return; }
    setHasSearched(true);
    setTypeFilter(null);
    setResults(fuse().search(q));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`, undefined, { shallow: true });
    runSearch(query);
  };

  // Group all results by type (unfiltered — used for filter pill counts)
  const grouped = results.reduce<Record<string, FuseResult<SearchItem>[]>>(
    (acc, r) => {
      const t = r.item.type;
      (acc[t] = acc[t] ?? []).push(r);
      return acc;
    },
    {}
  );
  const typeOrder: SearchItem['type'][] = ['insider', 'case', 'document', 'program', 'contractor', 'timeline', 'glossary', 'resource'];

  // Apply type filter for rendering
  const displayResults = typeFilter ? results.filter(r => r.item.type === typeFilter) : results;
  const displayGrouped = displayResults.reduce<Record<string, FuseResult<SearchItem>[]>>(
    (acc, r) => {
      const t = r.item.type;
      (acc[t] = acc[t] ?? []).push(r);
      return acc;
    },
    {}
  );

  return (
    <>
      <SeoHead
        title={query ? `"${query}" - Search` : 'Search'}
        description="Search DECUR's archive of UAP research, key figure profiles, historical events, glossary terms, and primary source materials."
        path="/search"
        noindex
      />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 -mt-8 -mx-4 px-4 pt-10 pb-10">
        <div className="max-w-3xl mx-auto">

          {/* Search input */}
          <form onSubmit={handleSubmit} className="relative mb-8">
            <input
              autoFocus
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Search insiders, events, terms, resources..."
              className="w-full pl-11 pr-4 py-3 text-base bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-500"
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
                <p className="text-center text-gray-500 dark:text-gray-400 py-16 text-sm">
                  No results for <span className="font-medium">&ldquo;{query}&rdquo;</span>
                </p>
              ) : (
                <>
                  <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                    <p className="text-sm text-gray-400 dark:text-gray-500">
                      {results.length} result{results.length !== 1 ? 's' : ''} for{' '}
                      <span className="font-medium text-gray-700 dark:text-gray-300">&ldquo;{query}&rdquo;</span>
                    </p>
                  </div>

                  {/* Type filter pills */}
                  <div className="flex gap-2 flex-wrap mb-6">
                    <button
                      onClick={() => setTypeFilter(null)}
                      className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                        typeFilter === null
                          ? 'bg-primary text-white border-transparent'
                          : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      All ({results.length})
                    </button>
                    {typeOrder.filter(t => grouped[t]).map(type => (
                      <button
                        key={type}
                        onClick={() => setTypeFilter(type)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                          typeFilter === type
                            ? 'bg-primary text-white border-transparent'
                            : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300'
                        }`}
                      >
                        {TYPE_LABELS[type]} ({grouped[type].length})
                      </button>
                    ))}
                  </div>

                  <div className="space-y-10">
                    {typeOrder.filter(t => displayGrouped[t]).map(type => (
                      <section key={type}>
                        <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                          {TYPE_LABELS[type]} ({displayGrouped[type].length})
                        </h2>
                        <div className="space-y-2">
                          {displayGrouped[type].slice(0, MAX_PER_TYPE).map(({ item }) => (
                            <Link
                              key={item.id}
                              href={item.href}
                              className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 hover:border-primary hover:shadow-sm transition-all"
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                    <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                                      {item.title}
                                    </span>
                                    {item.badge && (
                                      <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TYPE_STYLES[item.type]}`}>
                                        {item.badge}
                                      </span>
                                    )}
                                  </div>
                                  {item.subtitle && (
                                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{item.subtitle}</p>
                                  )}
                                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>
                                <svg className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </div>
                            </Link>
                          ))}
                        </div>
                        {displayGrouped[type].length > MAX_PER_TYPE && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 pl-1">
                            Showing {MAX_PER_TYPE} of {displayGrouped[type].length} - refine your search or use the type filter above for more specific results.
                          </p>
                        )}
                      </section>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {!hasSearched && (
            <div className="text-center py-16 text-gray-400 dark:text-gray-500 text-sm">
              <p className="mb-1 font-medium text-gray-500 dark:text-gray-400">Search across all DECUR data</p>
              <p>Insiders &middot; {corpus.filter(c => c.type === 'timeline').length} timeline events &middot; {corpus.filter(c => c.type === 'glossary').length} glossary terms &middot; Resources</p>
            </div>
          )}

        </div>
      </div>
    </>
  );
};

export default SearchPage;
