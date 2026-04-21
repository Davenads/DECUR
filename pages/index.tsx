import Link from 'next/link';
import type { FC } from 'react';
import SeoHead from '../components/SeoHead';
import { CustomNextPage, HomePageProps } from '../types/pages';
import insidersData from '../data/key-figures/index.json';
import glossaryData from '../data/glossary.json';
import resourcesData from '../data/resources.json';
import timelineData from '../data/timeline.json';
import changelogData from '../data/changelog.json';

const CATEGORIES = [
  {
    label: 'Key Figures',
    href: '/data?category=key-figures',
    description:
      'Firsthand accounts from military personnel, intelligence officers, government officials, journalists, and scientists who have disclosed involvement in UAP research.',
    detail: `Dan Burisch · David Grusch · Luis Elizondo · Ryan Graves · ${(insidersData as unknown[]).length} profiles`,
    badge: null,
  },
  {
    label: 'Documented Cases',
    href: '/data?category=cases',
    description:
      'The strongest credible UAP incidents in the public record, assessed by evidence quality, witness credentials, and official documentation.',
    detail: 'USS Nimitz · Rendlesham Forest · USS Roosevelt · 9 cases assessed',
    badge: null,
  },
  {
    label: 'Government Programs',
    href: '/data?category=programs',
    description:
      'Official and private programs involved in UAP investigation, research, and disclosure - from Cold War-era Air Force projects to modern congressional oversight initiatives.',
    detail: 'Project Blue Book · AATIP · AAWSAP · AARO · 23 programs catalogued',
    badge: null,
  },
  {
    label: 'Declassified Documents',
    href: '/data?category=documents',
    description:
      'Primary source government records including intelligence assessments, program reports, and declassified memos directly relevant to UAP research.',
    detail: 'Wilson-Davis Memo · UAPTF Assessment · AARO Historical Record',
    badge: null,
  },
  {
    label: 'Historical Timeline',
    href: '/timeline',
    description:
      'An interactive chronology of UAP events spanning eight decades, cross-referenced with key figure disclosures, program histories, and congressional actions.',
    detail: 'Nimitz incident · AATIP / AAWSAP · Grusch testimony · 2023 hearings',
    badge: null,
  },
  {
    label: 'UAP Sightings Database',
    href: '/sightings',
    description:
      '618,000+ community-submitted sighting reports from five major databases - NUFORC, MUFON, UFOCAT, the Vallee UPDB, and the Geldreich archive - mapped geographically and cross-referenced with DECUR\'s documented cases.',
    detail: 'Not editorially reviewed · NUFORC · MUFON · UFOCAT · Vallee UPDB · Geldreich',
    badge: 'Community data',
  },
];

const resData = resourcesData as { sources?: unknown[]; testimony?: unknown[] };
const ARCHIVE_STATS = [
  { count: (insidersData as unknown[]).length,                                     label: 'key figures' },
  { count: (timelineData as unknown[]).length,                                      label: 'timeline events' },
  { count: (glossaryData as unknown[]).length,                                      label: 'glossary terms' },
  { count: (resData.sources?.length ?? 0) + (resData.testimony?.length ?? 0),      label: 'source materials' },
];

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'DECUR',
  url: 'https://decur.app',
  description: 'A structured archive of insider testimony, primary documents, and research on UAP, NHI, and classified programs.',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://decur.app/search?q={search_term_string}',
    },
    'query-input': 'required name=search_term_string',
  },
};

const Home: CustomNextPage<HomePageProps> = () => {
  return (
    <>
      <SeoHead
        title="DECUR: UAP & NHI Research Archive"
        description="A structured archive of insider testimony, primary documents, and research on UAP, NHI, and classified programs."
        path="/"
        jsonLd={websiteSchema}
      />

      <div className="space-y-16">
        {/* Hero */}
        <section className="border-b border-gray-200 dark:border-gray-700 pb-16 pt-12">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start">

              {/* Left: headline */}
              <div className="md:col-span-3">
                <h1 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 dark:text-gray-100 leading-tight mb-6">
                  A reference archive for UAP and NHI research
                </h1>
                <p className="text-lg text-gray-500 leading-relaxed mb-8">
                  Structured documentation of insider testimony, primary source material, and
                  research records spanning eight decades. Qualitative data catalogued for analysis, not advocacy.
                </p>
                <Link
                  href="/data"
                  className="inline-block px-5 py-2.5 bg-primary text-white text-sm font-medium rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Browse the Archive →
                </Link>
                <Link
                  href="/explore"
                  className="block mt-3 text-sm text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-light transition-colors"
                >
                  or explore the network →
                </Link>

                {/* Mobile stat grid — hidden on md+ where the sidebar widget takes over */}
                <div className="mt-8 grid grid-cols-2 gap-3 md:hidden">
                  {ARCHIVE_STATS.map(({ count, label }) => (
                    <div key={label} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 bg-white dark:bg-gray-800">
                      <p className="font-mono text-xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{count}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right: stat block */}
              <div className="hidden md:block md:col-span-2 pt-10">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
                    <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Archive Contents
                    </p>
                  </div>
                  <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {ARCHIVE_STATS.map(({ count, label }) => (
                      <div key={label} className="flex items-baseline gap-3 px-5 py-3">
                        <span className="font-mono text-xl font-bold text-gray-900 dark:text-gray-100 tabular-nums min-w-[3.5rem] shrink-0 text-right">
                          {count}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-5xl mx-auto px-4">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
            Research Areas
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-8 py-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-3 px-3 rounded-lg transition-colors"
              >
                <div className="sm:w-44 shrink-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-primary-light transition-colors text-sm">
                      {cat.label}
                    </span>
                    {cat.badge && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border border-gray-200 dark:border-gray-700 font-normal leading-none">
                        {cat.badge}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-1">{cat.description}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">{cat.detail}</p>
                </div>
                <div className="hidden sm:flex items-center text-gray-300 dark:text-gray-600 group-hover:text-primary dark:group-hover:text-primary-light transition-colors shrink-0 pt-0.5">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Scope note */}
        <section className="max-w-5xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 px-6 py-5 flex gap-5 items-start">
            <div className="w-[3px] shrink-0 bg-gray-300 dark:bg-gray-600 self-stretch rounded-full" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-2">
                Scope &amp; Methodology
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                Source material draws from congressional testimony, document leaks, on-record
                interviews, and firsthand accounts. DECUR does not adjudicate the truth of any
                claim; entries are documented with their source, context, and known corroborating
                or contradicting evidence.
              </p>
            </div>
          </div>
        </section>

        {/* Recently Added widget */}
        <section className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
              Recently Added
            </h2>
            <Link
              href="/whats-new"
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary-light transition-colors"
            >
              View all updates →
            </Link>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
            {(changelogData as Array<{ date: string; category: string; id: string; name: string; action: string; note: string }>)
              .slice(0, 6)
              .map((entry, i) => {
                const CATEGORY_HREF: Record<string, (id: string) => string> = {
                  figure:   (id) => `/figures/${id}`,
                  case:     (id) => `/cases/${id}`,
                  document: (id) => `/documents/${id}`,
                  program:  (id) => `/programs/${id}`,
                  timeline: () => '/timeline',
                  quote:    () => '/data?category=quotes',
                };
                const CATEGORY_LABELS: Record<string, string> = {
                  figure: 'Figure', case: 'Case', document: 'Document',
                  program: 'Program', timeline: 'Timeline', quote: 'Quote',
                };
                const href = CATEGORY_HREF[entry.category]?.(entry.id) ?? '/whats-new';
                return (
                  <Link
                    key={i}
                    href={href}
                    className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                  >
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 w-16 font-mono">
                      {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 w-16 shrink-0">
                      {CATEGORY_LABELS[entry.category] ?? entry.category}
                    </span>
                    <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary dark:group-hover:text-primary-light transition-colors flex-1 truncate">
                      {entry.name}
                    </span>
                    <svg className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 group-hover:text-primary dark:group-hover:text-primary-light transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                );
              })}
          </div>
        </section>

        {/* Resources section */}
        <section className="max-w-5xl mx-auto px-4 pb-4">
          <h2 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-6">
            Resources
          </h2>
          <div className="divide-y divide-gray-100 dark:divide-gray-800">
            <Link
              href="/resources"
              className="group flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-8 py-5 hover:bg-gray-50 dark:hover:bg-gray-800/50 -mx-3 px-3 rounded-lg transition-colors"
            >
              <div className="sm:w-44 shrink-0">
                <span className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-primary-light transition-colors text-sm">
                  Source Materials &amp; Glossary
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-1">
                  Curated primary documents, on-record interview transcripts, and a reference glossary covering key programs, figures, and terminology.
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {(glossaryData as unknown[]).length} glossary terms · {(resData.sources?.length ?? 0) + (resData.testimony?.length ?? 0)} source materials
                </p>
              </div>
              <div className="hidden sm:flex items-center text-gray-300 dark:text-gray-600 group-hover:text-primary dark:group-hover:text-primary-light transition-colors shrink-0 pt-0.5">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
