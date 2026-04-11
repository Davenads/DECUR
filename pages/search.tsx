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
  /** Structured metadata for faceted filtering — not used by Fuse, applied client-side post-search. */
  meta?: {
    figureType?: string;   // insider type field: insider/journalist/pilot/scientist/official/executive
    tier?: string;         // evidence_tier: tier-1/tier-2/tier-3
    docType?: string;      // document_type from documents.json
    programStatus?: string; // status: active/classified/defunct/unknown
  };
}

interface MetaFilters {
  figureType: string | null;
  tier: string | null;
  docType: string | null;
  programStatus: string | null;
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
      summary?: string; tags?: string[]; aliases?: string[]; type?: string;
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
        meta: { figureType: ins.type ?? undefined },
      });
    }

    // Documented Cases — summary + key facts + witness testimony
    for (const c of casesData as Array<{
      id: string; name: string; date: string; location: string;
      summary: string; tags: string[]; evidence_tier?: string; category?: string;
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
        meta: { tier: c.evidence_tier ?? undefined },
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
        meta: { docType: doc.document_type ?? undefined },
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
        meta: { programStatus: p.status ?? undefined },
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

// ---- Filter config ---------------------------------------------------------

const FIGURE_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'insider',    label: 'Government Insider' },
  { value: 'pilot',      label: 'Pilot / Witness'    },
  { value: 'scientist',  label: 'Scientist'          },
  { value: 'official',   label: 'Official'           },
  { value: 'journalist', label: 'Journalist'         },
  { value: 'executive',  label: 'Executive'          },
];

const TIER_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'tier-1', label: 'Tier 1 - Official Documentation' },
  { value: 'tier-2', label: 'Tier 2 - Declassified Records'   },
  { value: 'tier-3', label: 'Tier 3 - Credentialed Testimony' },
];

const DOC_TYPE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'government-report',      label: 'Govt Report'      },
  { value: 'intelligence-report',    label: 'Intel Report'     },
  { value: 'government-assessment',  label: 'Assessment'       },
  { value: 'legislation',            label: 'Legislation'      },
  { value: 'classified-memo',        label: 'Classified Memo'  },
  { value: 'government-memo',        label: 'Memo'             },
  { value: 'military-memorandum',    label: 'Military Memo'    },
  { value: 'whistleblower-complaint',label: 'Whistleblower'    },
  { value: 'academic-paper',         label: 'Academic Paper'   },
];

const PROGRAM_STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'active',     label: 'Active'     },
  { value: 'classified', label: 'Classified' },
  { value: 'defunct',    label: 'Defunct'    },
  { value: 'unknown',    label: 'Unknown'    },
];

const EMPTY_FILTERS: MetaFilters = { figureType: null, tier: null, docType: null, programStatus: null };

// ---- Component -------------------------------------------------------------

const SearchPage: FC<SearchPageProps> = ({ corpus }) => {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<FuseResult<SearchItem>[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [typeFilter, setTypeFilter] = useState<SearchItem['type'] | null>(null);
  const [filters, setFilters] = useState<MetaFilters>(EMPTY_FILTERS);

  const setFilter = (key: keyof MetaFilters, value: string | null) =>
    setFilters(prev => ({ ...prev, [key]: prev[key] === value ? null : value }));

  const hasActiveFilters = Object.values(filters).some(Boolean);

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
    if (!q.trim()) { setResults([]); setHasSearched(false); setTypeFilter(null); setFilters(EMPTY_FILTERS); return; }
    setHasSearched(true);
    setTypeFilter(null);
    setFilters(EMPTY_FILTERS);
    setResults(fuse().search(q));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/search?q=${encodeURIComponent(query)}`, undefined, { shallow: true });
    runSearch(query);
  };

  const typeOrder: SearchItem['type'][] = ['insider', 'case', 'document', 'program', 'contractor', 'timeline', 'glossary', 'resource'];

  // Apply meta filter predicate to any item
  const matchesMeta = (item: SearchItem) => {
    if (filters.figureType     && item.meta?.figureType     !== filters.figureType)     return false;
    if (filters.tier           && item.meta?.tier           !== filters.tier)           return false;
    if (filters.docType        && item.meta?.docType        !== filters.docType)        return false;
    if (filters.programStatus  && item.meta?.programStatus  !== filters.programStatus)  return false;
    return true;
  };

  // Browse mode: filters active with no search query — show all matching corpus items
  const browseItems: SearchItem[] = (!hasSearched && (hasActiveFilters || typeFilter))
    ? corpus.filter(item => {
        if (typeFilter && item.type !== typeFilter) return false;
        return matchesMeta(item);
      })
    : [];
  const isBrowsing = browseItems.length > 0 || (!hasSearched && (hasActiveFilters || typeFilter));

  // Group all Fuse results by type (unfiltered — used for type pill counts)
  const grouped = results.reduce<Record<string, FuseResult<SearchItem>[]>>(
    (acc, r) => {
      const t = r.item.type;
      (acc[t] = acc[t] ?? []).push(r);
      return acc;
    },
    {}
  );

  // Apply type + meta filters to search results for display
  const displayResults = results.filter(r => {
    if (typeFilter && r.item.type !== typeFilter) return false;
    return matchesMeta(r.item);
  });
  const displayGrouped = displayResults.reduce<Record<string, FuseResult<SearchItem>[]>>(
    (acc, r) => {
      const t = r.item.type;
      (acc[t] = acc[t] ?? []).push(r);
      return acc;
    },
    {}
  );

  // Browse results grouped by type
  const browseGrouped = browseItems.reduce<Record<string, SearchItem[]>>(
    (acc, item) => {
      (acc[item.type] = acc[item.type] ?? []).push(item);
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

          {/* ── Result card helper ── */}
          {/* eslint-disable-next-line @typescript-eslint/no-shadow */}
          {(() => {
            const ResultCard = ({ item }: { item: SearchItem }) => (
              <Link
                href={item.href}
                className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-3 hover:border-primary hover:shadow-sm transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <span className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{item.title}</span>
                      {item.badge && (
                        <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${TYPE_STYLES[item.type]}`}>{item.badge}</span>
                      )}
                    </div>
                    {item.subtitle && <p className="text-xs text-gray-400 dark:text-gray-500 mb-1">{item.subtitle}</p>}
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">{item.description}</p>
                  </div>
                  <svg className="h-4 w-4 text-gray-300 dark:text-gray-600 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );

            // ── Filter pill helper ──
            const FilterPills = ({ options, activeValue, filterKey }: {
              options: Array<{ value: string; label: string }>;
              activeValue: string | null;
              filterKey: keyof MetaFilters;
            }) => (
              <div className="flex gap-2 flex-wrap">
                {options.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setFilter(filterKey, opt.value)}
                    className={`text-xs px-3 py-1 rounded-full font-medium border transition-colors ${
                      activeValue === opt.value
                        ? 'bg-primary text-white border-transparent'
                        : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            );

            // ── Contextual dimension filter panel (below type pills) ──
            const DimensionFilters = () => {
              if (typeFilter === 'insider') return (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Figure type</p>
                  <FilterPills options={FIGURE_TYPE_OPTIONS} activeValue={filters.figureType} filterKey="figureType" />
                </div>
              );
              if (typeFilter === 'case') return (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Evidence tier</p>
                  <FilterPills options={TIER_OPTIONS} activeValue={filters.tier} filterKey="tier" />
                </div>
              );
              if (typeFilter === 'document') return (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Document type</p>
                  <FilterPills options={DOC_TYPE_OPTIONS} activeValue={filters.docType} filterKey="docType" />
                </div>
              );
              if (typeFilter === 'program') return (
                <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-2">Program status</p>
                  <FilterPills options={PROGRAM_STATUS_OPTIONS} activeValue={filters.programStatus} filterKey="programStatus" />
                </div>
              );
              return null;
            };

            // ── Grouped results renderer (shared between search + browse) ──
            const GroupedResults = ({ groupedItems }: { groupedItems: Record<string, SearchItem[]> }) => (
              <div className="space-y-10">
                {typeOrder.filter(t => groupedItems[t]).map(type => (
                  <section key={type}>
                    <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-3">
                      {TYPE_LABELS[type]} ({groupedItems[type].length})
                    </h2>
                    <div className="space-y-2">
                      {groupedItems[type].slice(0, MAX_PER_TYPE).map(item => <ResultCard key={item.id} item={item} />)}
                    </div>
                    {groupedItems[type].length > MAX_PER_TYPE && (
                      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 pl-1">
                        Showing {MAX_PER_TYPE} of {groupedItems[type].length} - refine your search or filter above for more specific results.
                      </p>
                    )}
                  </section>
                ))}
              </div>
            );

            return (
              <>
                {/* ── Search results ── */}
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
                            {displayResults.length} result{displayResults.length !== 1 ? 's' : ''}
                            {displayResults.length !== results.length && ` (filtered from ${results.length})`}
                            {' '}for{' '}
                            <span className="font-medium text-gray-700 dark:text-gray-300">&ldquo;{query}&rdquo;</span>
                          </p>
                          {hasActiveFilters && (
                            <button onClick={() => setFilters(EMPTY_FILTERS)} className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
                              Clear filters
                            </button>
                          )}
                        </div>

                        {/* Type filter pills */}
                        <div className="flex gap-2 flex-wrap mb-3">
                          <button
                            onClick={() => { setTypeFilter(null); setFilters(EMPTY_FILTERS); }}
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
                              onClick={() => { setTypeFilter(type); setFilters(EMPTY_FILTERS); }}
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

                        {/* Dimension filters (contextual) */}
                        <DimensionFilters />

                        <GroupedResults groupedItems={Object.fromEntries(
                          Object.entries(displayGrouped).map(([t, rs]) => [t, rs.map(r => r.item)])
                        )} />
                      </>
                    )}
                  </div>
                )}

                {/* ── Browse mode (no query, filter/type active) ── */}
                {isBrowsing && !hasSearched && (
                  <div>
                    <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        Browsing{typeFilter ? ` ${TYPE_LABELS[typeFilter]}` : ' all'}{' '}
                        {browseItems.length > 0 && `- ${browseItems.length} item${browseItems.length !== 1 ? 's' : ''}`}
                      </p>
                      <button
                        onClick={() => { setTypeFilter(null); setFilters(EMPTY_FILTERS); }}
                        className="text-xs text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                      >
                        Clear all
                      </button>
                    </div>

                    {/* Type pills (browse mode) */}
                    <div className="flex gap-2 flex-wrap mb-3">
                      {(['insider', 'case', 'document', 'program'] as SearchItem['type'][]).map(type => (
                        <button
                          key={type}
                          onClick={() => { setTypeFilter(typeFilter === type ? null : type); setFilters(EMPTY_FILTERS); }}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${
                            typeFilter === type
                              ? 'bg-primary text-white border-transparent'
                              : 'bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-gray-300'
                          }`}
                        >
                          {TYPE_LABELS[type]}
                        </button>
                      ))}
                    </div>

                    {/* Dimension filters */}
                    <DimensionFilters />

                    {browseItems.length === 0 ? (
                      <p className="text-center text-gray-400 dark:text-gray-500 py-12 text-sm">
                        No items match the selected filters.
                      </p>
                    ) : (
                      <GroupedResults groupedItems={browseGrouped} />
                    )}
                  </div>
                )}

                {/* ── Empty state ── */}
                {!hasSearched && !isBrowsing && (
                  <div>
                    <div className="text-center py-10 text-gray-400 dark:text-gray-500 text-sm">
                      <p className="mb-1 font-medium text-gray-500 dark:text-gray-400">Search across all DECUR data</p>
                      <p>Insiders &middot; {corpus.filter(c => c.type === 'timeline').length} timeline events &middot; {corpus.filter(c => c.type === 'glossary').length} glossary terms &middot; Resources</p>
                    </div>
                    {/* Browse shortcuts */}
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">Or browse without searching</p>
                      <div className="flex gap-2 flex-wrap">
                        {(['insider', 'case', 'document', 'program'] as SearchItem['type'][]).map(type => (
                          <button
                            key={type}
                            onClick={() => setTypeFilter(type)}
                            className="text-xs px-3 py-1.5 rounded-full font-medium border bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 border-gray-200 dark:border-gray-600 hover:border-primary hover:text-primary transition-colors"
                          >
                            {TYPE_LABELS[type]}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </>
            );
          })()}

        </div>
      </div>
    </>
  );
};

export default SearchPage;
