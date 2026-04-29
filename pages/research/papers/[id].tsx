import type { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SeoHead from '../../../components/SeoHead';
import papersData from '../../../data/research/papers.json';
import orgsData from '../../../data/research/organizations.json';
import figuresIndex from '../../../data/key-figures/index.json';
import { SOURCE_TYPE_LABELS, SOURCE_TYPE_COLORS } from '../../../lib/research/constants';

/* ── Types ──────────────────────────────────────────────────────── */

interface Paper {
  id: string;
  decur_url?: string;
  title: string;
  authors: string[];
  author_ids: string[];
  year: number;
  journal: string | null;
  volume: string | null;
  issue: string | null;
  doi: string | null;
  url: string;
  open_access: boolean;
  source_type: string;
  tags: string[];
  case_ids: string[];
  organization_ids: string[];
  summary: string;
  abstract: string;
}

interface Organization {
  id: string;
  decur_url?: string;
  name: string;
  abbreviation: string | null;
}

interface FigureEntry {
  id: string;
  name: string;
  role: string;
}

interface PaperDetailProps {
  paper: Paper;
  relatedPapers: Paper[];
  relatedOrgs: Organization[];
  linkedFigures: FigureEntry[];
}

/* ── Page ───────────────────────────────────────────────────────── */

const PaperDetail: NextPage<PaperDetailProps> = ({ paper, relatedPapers, relatedOrgs, linkedFigures }) => {
  const router = useRouter();
  const [backState, setBackState] = useState<{ label: string; href: string | null }>({
    label: 'Papers',
    href: '/research?tab=papers',
  });

  useEffect(() => {
    if (!router.isReady) return;
    const { ref, orgId, paperId } = router.query as Record<string, string | undefined>;
    if (ref === 'search') {
      setBackState({ label: 'Search Results', href: null });
    } else if (ref === 'org' && orgId) {
      const org = (orgsData as Array<{ id: string; name: string; abbreviation: string | null }>)
        .find(o => o.id === orgId);
      if (org) {
        setBackState({
          label: org.abbreviation ?? org.name,
          href: `/research/organizations/${orgId}`,
        });
      }
    } else if (ref === 'paper' && paperId) {
      const sourcePaper = (papersData as Array<{ id: string; title: string }>)
        .find(p => p.id === paperId);
      if (sourcePaper) {
        setBackState({
          label: sourcePaper.title,
          href: `/research/papers/${paperId}`,
        });
      }
    } else {
      setBackState({ label: 'Papers', href: '/research?tab=papers' });
    }
  }, [router.isReady, router.query]);

  const handleBack = () => {
    if (backState.href) {
      router.push(backState.href);
    } else {
      router.back();
    }
  };

  const typeLabel = SOURCE_TYPE_LABELS[paper.source_type] ?? paper.source_type;
  const typeColor = SOURCE_TYPE_COLORS[paper.source_type] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';

  const citation = [
    paper.authors.join(', '),
    paper.year ? `(${paper.year})` : null,
    paper.journal ? paper.journal : null,
    paper.volume ? `Vol. ${paper.volume}` : null,
    paper.issue ? `No. ${paper.issue}` : null,
    paper.doi ? `DOI: ${paper.doi}` : null,
  ].filter(Boolean).join('. ');

  return (
    <>
      <SeoHead
        title={paper.title}
        description={paper.summary}
        path={`/research/papers/${paper.id}`}
      />
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">

          {/* Back button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors mb-4 group"
          >
            <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to {backState.label}
          </button>

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 mb-6">
            <Link href="/research" className="hover:text-primary transition-colors">Research Hub</Link>
            <span>/</span>
            <Link href="/research?tab=papers" className="hover:text-primary transition-colors">Papers</Link>
            <span>/</span>
            <span className="text-gray-600 dark:text-gray-300 truncate max-w-xs">{paper.title}</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor}`}>{typeLabel}</span>
              {paper.open_access && (
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
                  Open Access
                </span>
              )}
              <span className="text-xs text-gray-400 dark:text-gray-500">{paper.year}</span>
            </div>

            <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-100 mb-3 leading-snug">
              {paper.title}
            </h1>

            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {linkedFigures.length > 0
                ? paper.authors.map((author, i) => {
                    const fig = linkedFigures.find(f => paper.author_ids.some(aid => aid === f.id && paper.authors[i]?.includes(f.name.split(' ').pop() ?? '')));
                    return fig
                      ? <Link key={i} href={`/figures/${fig.id}?ref=paper&paperId=${paper.id}`} className="text-primary hover:text-primary/80 transition-colors">{author}</Link>
                      : <span key={i}>{author}</span>;
                  }).reduce((prev: React.ReactNode, curr, i) => i === 0 ? [curr] : [...(prev as React.ReactNode[]), ', ', curr], [] as React.ReactNode[])
                : paper.authors.join(', ')
              }
            </p>

            {paper.journal && (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                {paper.journal}
                {paper.volume && `, Vol. ${paper.volume}`}
                {paper.issue && `, No. ${paper.issue}`}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-6">

              {/* Summary */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">Summary</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{paper.summary}</p>
              </div>

              {/* Abstract */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">Abstract</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed italic">{paper.abstract}</p>
              </div>

              {/* Citation */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">Citation</h2>
                <p className="text-xs font-mono text-gray-600 dark:text-gray-400 leading-relaxed break-words">{citation}</p>
                {paper.doi && (
                  <a
                    href={`https://doi.org/${paper.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:text-primary/80 transition-colors mt-2 inline-block"
                  >
                    https://doi.org/{paper.doi}
                  </a>
                )}
              </div>

              {/* Related Papers */}
              {relatedPapers.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-4">Related Papers</h2>
                  <div className="space-y-3">
                    {relatedPapers.map(rp => (
                      <Link
                        key={rp.id}
                        href={`/research/papers/${rp.id}?ref=paper&paperId=${paper.id}`}
                        className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{rp.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{rp.authors[0]}{rp.authors.length > 1 ? ' et al.' : ''} &middot; {rp.year}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Access */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">Access</h3>
                <a
                  href={paper.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  {paper.doi ? 'View Full Paper' : 'View Source'}
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                {paper.open_access && (
                  <p className="text-xs text-center text-gray-400 dark:text-gray-500 mt-2">Freely available - no paywall</p>
                )}
              </div>

              {/* Topics */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">Topics</h3>
                <div className="flex flex-wrap gap-1.5">
                  {paper.tags.map(tag => (
                    <Link
                      key={tag}
                      href={`/research?tab=papers&tag=${encodeURIComponent(tag)}`}
                      className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {tag.replace(/-/g, ' ')}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Key Figures */}
              {linkedFigures.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">DECUR Profiles</h3>
                  <div className="space-y-2">
                    {linkedFigures.map(fig => (
                      <Link
                        key={fig.id}
                        href={`/figures/${fig.id}?ref=paper&paperId=${paper.id}`}
                        className="flex items-center gap-2 text-xs hover:text-primary transition-colors group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                        <div>
                          <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary">{fig.name}</span>
                          <span className="text-gray-400 dark:text-gray-500 ml-1">- {fig.role}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Organizations */}
              {relatedOrgs.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">Organizations</h3>
                  <div className="space-y-2">
                    {relatedOrgs.map(org => (
                      <Link
                        key={org.id}
                        href={org.decur_url ?? `/research/organizations/${org.id}`}
                        className="flex items-center gap-2 text-xs hover:text-primary transition-colors group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-300 dark:bg-gray-600 shrink-0" />
                        <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary">
                          {org.abbreviation ?? org.name}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Footer nav */}
          <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
            <button
              onClick={handleBack}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to {backState.label}
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

/* ── Static generation ──────────────────────────────────────────── */

export const getStaticPaths: GetStaticPaths = async () => {
  const papers = papersData as Paper[];
  return {
    paths: papers.filter(p => !p.decur_url).map(p => ({ params: { id: p.id } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<PaperDetailProps> = async ({ params }) => {
  const papers = papersData as Paper[];
  const orgs = orgsData as Organization[];
  const figures = figuresIndex as FigureEntry[];

  const paper = papers.find(p => p.id === params?.id);
  if (!paper) return { notFound: true };

  const relatedPapers = papers
    .filter(p => p.id !== paper.id && p.tags.some(t => paper.tags.includes(t)))
    .sort((a, b) => b.year - a.year)
    .slice(0, 4);

  const relatedOrgs = orgs.filter(o => paper.organization_ids.includes(o.id));

  const linkedFigures = figures.filter(f => paper.author_ids.includes(f.id));

  return {
    props: { paper, relatedPapers, relatedOrgs, linkedFigures },
    revalidate: 3600,
  };
};

export default PaperDetail;
