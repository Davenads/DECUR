import type { NextPage, GetStaticProps, GetStaticPaths } from 'next';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import SeoHead from '../../../components/SeoHead';
import orgsData from '../../../data/research/organizations.json';
import papersData from '../../../data/research/papers.json';
import eventsData from '../../../data/research/events.json';
import figuresIndex from '../../../data/key-figures/index.json';

/* ── Types ──────────────────────────────────────────────────────── */

interface Organization {
  id: string;
  decur_url?: string;
  name: string;
  abbreviation: string | null;
  type: string;
  status: string;
  founded: string;
  location: string;
  website: string;
  description: string;
  focus_areas: string[];
  key_member_ids: string[];
  notable_paper_ids: string[];
}

interface Paper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  source_type: string;
  open_access: boolean;
  summary: string;
  organization_ids: string[];
  tags: string[];
}

interface ResearchEvent {
  id: string;
  name: string;
  type: string;
  status: string;
  date_start: string;
  date_end: string;
  location: string;
  url: string;
  organizer_id: string | null;
  recording_url: string | null;
}

interface FigureEntry {
  id: string;
  name: string;
  role: string;
}

interface OrgDetailProps {
  org: Organization;
  notablePapers: Paper[];
  orgEvents: ResearchEvent[];
  keyMembers: FigureEntry[];
  relatedPapers: Paper[];
}

/* ── Constants ──────────────────────────────────────────────────── */

const ORG_TYPE_LABELS: Record<string, string> = {
  'research-institute': 'Research Institute',
  'government-body':    'Government Body',
  'advocacy':           'Advocacy',
  'archive':            'Archive',
};

const ORG_STATUS_COLORS: Record<string, string> = {
  'active':           'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  'reduced-activity': 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  'inactive':         'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
};

const SOURCE_TYPE_COLORS: Record<string, string> = {
  'peer-reviewed':          'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  'government-report':      'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  'institute-report':       'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'conference-proceedings': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  'book':                   'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
};

const SOURCE_TYPE_LABELS: Record<string, string> = {
  'peer-reviewed':          'Peer-Reviewed',
  'government-report':      'Government Report',
  'institute-report':       'Institute Report',
  'conference-proceedings': 'Conference Proceedings',
  'book':                   'Book',
};

const EVENT_STATUS_COLORS: Record<string, string> = {
  'upcoming': 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
  'past':     'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
  'ongoing':  'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
};

function deriveEventStatus(event: ResearchEvent): string {
  if (event.status === 'cancelled' || event.status === 'postponed') return event.status;
  const now   = new Date();
  const start = new Date(event.date_start + 'T00:00:00');
  const end   = new Date(event.date_end   + 'T23:59:59');
  if (end < now)   return 'past';
  if (start > now) return 'upcoming';
  return 'ongoing';
}

/* ── Page ───────────────────────────────────────────────────────── */

const OrgDetail: NextPage<OrgDetailProps> = ({ org, notablePapers, orgEvents, keyMembers, relatedPapers }) => {
  const router = useRouter();
  const [backState, setBackState] = useState<{ label: string; href: string | null }>({
    label: 'Organizations',
    href: '/research?tab=organizations',
  });

  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get('ref');
    if (ref === 'search') {
      setBackState({ label: 'Search Results', href: null });
    }
  }, []);

  const handleBack = () => {
    if (backState.href) {
      router.push(backState.href);
    } else {
      router.back();
    }
  };

  const typeLabel = ORG_TYPE_LABELS[org.type] ?? org.type;
  const statusColor = ORG_STATUS_COLORS[org.status] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400';
  const statusLabel = org.status === 'reduced-activity' ? 'Reduced Activity' : org.status.charAt(0).toUpperCase() + org.status.slice(1);

  const upcomingEvents = orgEvents.filter(e => deriveEventStatus(e) === 'upcoming');
  const pastEvents = orgEvents.filter(e => deriveEventStatus(e) === 'past').sort((a, b) => b.date_start.localeCompare(a.date_start));

  return (
    <>
      <SeoHead
        title={org.abbreviation ? `${org.abbreviation} - ${org.name}` : org.name}
        description={org.description.slice(0, 160)}
        path={`/research/organizations/${org.id}`}
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
            <Link href="/research?tab=organizations" className="hover:text-primary transition-colors">Organizations</Link>
            <span>/</span>
            <span className="text-gray-600 dark:text-gray-300 truncate max-w-xs">{org.abbreviation ?? org.name}</span>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-wrap items-center gap-3 mb-3">
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>{statusLabel}</span>
              <span className="text-xs text-gray-400 dark:text-gray-500">{typeLabel}</span>
            </div>
            <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-100 mb-1">
              {org.abbreviation ? `${org.abbreviation} - ${org.name}` : org.name}
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {org.location} &middot; Est. {org.founded}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">

              {/* Description */}
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5">
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">About</h2>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{org.description}</p>
              </div>

              {/* Notable Papers */}
              {notablePapers.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-4">Notable Publications</h2>
                  <div className="space-y-3">
                    {notablePapers.map(paper => (
                      <Link
                        key={paper.id}
                        href={`/research/papers/${paper.id}`}
                        className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-start gap-2 mb-2">
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0 ${SOURCE_TYPE_COLORS[paper.source_type] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                            {SOURCE_TYPE_LABELS[paper.source_type] ?? paper.source_type}
                          </span>
                          {paper.open_access && (
                            <span className="text-xs font-medium px-1.5 py-0.5 rounded-full shrink-0 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">OA</span>
                          )}
                          <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{paper.year}</span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 leading-snug">{paper.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{paper.authors[0]}{paper.authors.length > 1 ? ' et al.' : ''}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Related Papers (cross-reference from org_ids in papers) */}
              {relatedPapers.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-4">Papers Referencing This Organization</h2>
                  <div className="space-y-3">
                    {relatedPapers.map(paper => (
                      <Link
                        key={paper.id}
                        href={`/research/papers/${paper.id}`}
                        className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1 leading-snug">{paper.title}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{paper.authors[0]}{paper.authors.length > 1 ? ' et al.' : ''} &middot; {paper.year}</p>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Events */}
              {orgEvents.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-4">Events</h2>
                  <div className="space-y-3">
                    {[...upcomingEvents, ...pastEvents].map(event => (
                      <a
                        key={event.id}
                        href={event.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${EVENT_STATUS_COLORS[deriveEventStatus(event)] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                            {deriveEventStatus(event).charAt(0).toUpperCase() + deriveEventStatus(event).slice(1)}
                          </span>
                          <span className="text-xs text-gray-400 dark:text-gray-500">
                            {new Date(event.date_start + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{event.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{event.location}</p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Website */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">Website</h3>
                <a
                  href={org.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  Visit Website
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>

              {/* Details */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 space-y-3">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">Details</h3>
                {[
                  { label: 'Type',     value: typeLabel },
                  { label: 'Status',   value: statusLabel },
                  { label: 'Founded',  value: org.founded },
                  { label: 'Location', value: org.location },
                ].map(row => (
                  <div key={row.label}>
                    <p className="text-xs text-gray-400 dark:text-gray-500">{row.label}</p>
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{row.value}</p>
                  </div>
                ))}
              </div>

              {/* Focus Areas */}
              {org.focus_areas.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">Focus Areas</h3>
                  <div className="flex flex-wrap gap-1.5">
                    {org.focus_areas.map(area => (
                      <span key={area} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                        {area}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Key Members */}
              {keyMembers.length > 0 && (
                <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-3">Key Members</h3>
                  <div className="space-y-2">
                    {keyMembers.map(fig => (
                      <Link
                        key={fig.id}
                        href={`/figures/${fig.id}`}
                        className="flex items-start gap-2 text-xs hover:text-primary transition-colors group"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-primary mt-1 shrink-0" />
                        <div>
                          <span className="font-medium text-gray-800 dark:text-gray-200 group-hover:text-primary block">{fig.name}</span>
                          <span className="text-gray-400 dark:text-gray-500">{fig.role}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Footer nav */}
          <div className="mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
            <Link href="/research?tab=organizations" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary transition-colors flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Organizations
            </Link>
          </div>

        </div>
      </div>
    </>
  );
};

/* ── Static generation ──────────────────────────────────────────── */

export const getStaticPaths: GetStaticPaths = async () => {
  const orgs = orgsData as Organization[];
  return {
    paths: orgs.filter(o => !o.decur_url).map(o => ({ params: { id: o.id } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<OrgDetailProps> = async ({ params }) => {
  const orgs = orgsData as Organization[];
  const papers = papersData as Paper[];
  const events = eventsData as ResearchEvent[];
  const figures = figuresIndex as FigureEntry[];

  const org = orgs.find(o => o.id === params?.id);
  if (!org) return { notFound: true };

  const notablePapers = papers.filter(p => org.notable_paper_ids.includes(p.id));
  const relatedPapers = papers.filter(p => p.organization_ids.includes(org.id) && !org.notable_paper_ids.includes(p.id));
  const orgEvents = events.filter(e => e.organizer_id === org.id);
  const keyMembers = figures.filter(f => org.key_member_ids.includes(f.id));

  return {
    props: { org, notablePapers, relatedPapers, orgEvents, keyMembers },
    revalidate: 3600,
  };
};

export default OrgDetail;
