import Link from 'next/link';
import type { FC } from 'react';
import Head from 'next/head';
import { CustomNextPage, HomePageProps } from '../types/pages';
import insidersData from '../data/insiders/index.json';
import glossaryData from '../data/glossary.json';
import resourcesData from '../data/resources.json';

const CATEGORIES = [
  {
    label: 'Key Figures',
    href: '/data?category=key-figures',
    description:
      'Firsthand accounts from military personnel, intelligence officers, government officials, journalists, and scientists who have disclosed involvement in UAP research.',
    detail: 'Dan Burisch · Bob Lazar · David Grusch · George Knapp',
  },
  {
    label: 'Non-Human Intelligence',
    href: '/data?category=cases',
    description:
      'Documented biological, behavioral, and physiological data on reported non-human entities, drawn from testimony and alleged research records.',
    detail: 'P-45 · P-52 · J-Rod neuropathology · Orion classification',
  },
  {
    label: 'Technologies & Programs',
    href: '/data?category=documents',
    description:
      'Accounts of recovered, observed, or reverse-engineered exotic technologies, and the classified programs associated with their study.',
    detail: 'AATIP · AAWSAP · Looking Glass · S-4 facility',
  },
  {
    label: 'Timeline & Concepts',
    href: '/explore',
    description:
      'A structured chronology of UAP events spanning eight decades, from early government documentation through modern congressional disclosure, alongside key theoretical frameworks and program histories.',
    detail: 'Nimitz incident · AATIP / AAWSAP · Grusch testimony · Majestic-12',
  },
];

const resData = resourcesData as { sources?: unknown[]; testimony?: unknown[] };
const ARCHIVE_STATS = [
  { count: (insidersData as unknown[]).length,                                     label: 'key figures' },
  { count: '1,575',                                                                 label: 'timeline events' },
  { count: (glossaryData as unknown[]).length,                                      label: 'glossary terms' },
  { count: (resData.sources?.length ?? 0) + (resData.testimony?.length ?? 0),      label: 'source materials' },
];

const Home: CustomNextPage<HomePageProps> = () => {
  return (
    <>
      <Head>
        <title>DECUR: UAP & NHI Research Archive</title>
        <meta
          name="description"
          content="A structured archive of insider testimony, primary documents, and research on UAP, NHI, and classified programs."
        />
      </Head>

      <div className="space-y-16">
        {/* Hero */}
        <section className="border-b border-gray-200 pb-16 pt-12">
          <div className="max-w-5xl mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-12 items-start">

              {/* Left: headline */}
              <div className="md:col-span-3">
                <h1 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 leading-tight mb-6">
                  A reference archive for UAP and NHI research
                </h1>
                <p className="text-lg text-gray-500 leading-relaxed mb-8">
                  Structured documentation of insider testimony, primary source material, and
                  research records spanning eight decades, catalogued for analysis, not advocacy.
                </p>
                <Link
                  href="/data"
                  className="inline-block px-5 py-2.5 border border-gray-700 text-gray-800 text-sm font-medium rounded-lg hover:bg-gray-800 hover:text-white transition-colors"
                >
                  Explore the Archive →
                </Link>
              </div>

              {/* Right: stat block */}
              <div className="hidden md:block md:col-span-2 pt-10">
                <div className="border border-gray-200 rounded-lg bg-white overflow-hidden">
                  <div className="px-5 py-4 border-b border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
                      Archive Contents
                    </p>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {ARCHIVE_STATS.map(({ count, label }) => (
                      <div key={label} className="flex items-baseline gap-3 px-5 py-3">
                        <span className="text-xl font-bold text-gray-900 tabular-nums min-w-[3.5rem] shrink-0 text-right">
                          {count}
                        </span>
                        <span className="text-xs text-gray-500">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* Scope note */}
        <section className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-lg border border-gray-200 px-6 py-5 flex gap-5 items-start">
            <div className="w-[3px] shrink-0 bg-gray-300 self-stretch rounded-full" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">
                Scope &amp; Methodology
              </p>
              <p className="text-sm text-gray-600 leading-relaxed">
                Source material draws from congressional testimony, document leaks, on-record
                interviews, and firsthand accounts. DECUR does not adjudicate the truth of any
                claim; entries are documented with their source, context, and known corroborating
                or contradicting evidence.
              </p>
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="max-w-3xl mx-auto px-4">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
            Research Areas
          </h2>
          <div className="divide-y divide-gray-100">
            {CATEGORIES.map(cat => (
              <Link
                key={cat.label}
                href={cat.href}
                className="group flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-8 py-5 hover:bg-gray-50 -mx-3 px-3 rounded-lg transition-colors"
              >
                <div className="sm:w-44 shrink-0">
                  <span className="font-semibold text-gray-900 group-hover:text-primary transition-colors text-sm">
                    {cat.label}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-600 leading-relaxed mb-1">{cat.description}</p>
                  <p className="text-xs text-gray-400">{cat.detail}</p>
                </div>
                <div className="hidden sm:flex items-center text-gray-300 group-hover:text-primary transition-colors shrink-0 pt-0.5">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Resources footer strip */}
        <section className="border-t border-gray-200 pt-10 pb-4 max-w-3xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-gray-700">Source Materials & Glossary</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Primary documents, curated source links, and a 293-term terminology reference
              </p>
            </div>
            <Link
              href="/resources"
              className="text-sm font-medium text-primary hover:underline whitespace-nowrap"
            >
              Browse Resources →
            </Link>
          </div>
        </section>
      </div>
    </>
  );
};

export default Home;
