import { useState, useMemo, useEffect } from 'react';
import type { NextPage, GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SeoHead from '../../components/SeoHead';
import papersData from '../../data/research/papers.json';
import orgsData from '../../data/research/organizations.json';
import eventsData from '../../data/research/events.json';
import opportunitiesData from '../../data/research/opportunities.json';

/* ── Types ──────────────────────────────────────────────────────── */

interface Paper {
  id: string;
  title: string;
  authors: string[];
  author_ids: string[];
  year: number;
  journal: string | null;
  doi: string | null;
  url: string;
  open_access: boolean;
  source_type: string;
  tags: string[];
  case_ids: string[];
  organization_ids: string[];
  summary: string;
}

interface Organization {
  id: string;
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

interface ResearchEvent {
  id: string;
  name: string;
  type: string;
  status: string;
  date_start: string;
  date_end: string;
  location: string;
  format: string;
  url: string;
  organizer_name: string;
  description: string;
  recording_url: string | null;
}

interface Opportunity {
  id: string;
  type: string;
  title: string;
  organization: string;
  deadline: string | null;
  amount: string | null;
  url: string;
  description: string;
  eligibility: string | null;
  status: string;
}

interface ResearchProps {
  papers: Paper[];
  organizations: Organization[];
  events: ResearchEvent[];
  opportunities: Opportunity[];
}

type TabType = 'papers' | 'organizations' | 'events' | 'opportunities';

/* ── Constants ──────────────────────────────────────────────────── */

const SOURCE_TYPE_LABELS: Record<string, string> = {
  'peer-reviewed':          'Peer-Reviewed',
  'government-report':      'Government Report',
  'institute-report':       'Institute Report',
  'conference-proceedings': 'Conference Proceedings',
  'book':                   'Book',
};

const SOURCE_TYPE_COLORS: Record<string, string> = {
  'peer-reviewed':          'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  'government-report':      'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  'institute-report':       'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'conference-proceedings': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  'book':                   'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
};

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

const EVENT_TYPE_LABELS: Record<string, string> = {
  'symposium':             'Symposium',
  'conference':            'Conference',
  'congressional-hearing': 'Congressional Hearing',
  'webinar':               'Webinar',
  'workshop':              'Workshop',
};

const EVENT_STATUS_COLORS: Record<string, string> = {
  'upcoming': 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
  'past':     'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
  'ongoing':  'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
};

const OPP_TYPE_COLORS: Record<string, string> = {
  'call-for-papers':         'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  'grant':                   'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  'fellowship':              'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'job-posting':             'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  'participant-recruitment': 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
  'collaboration-request':   'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
};

const OPP_TYPE_LABELS: Record<string, string> = {
  'call-for-papers':         'Call for Papers',
  'grant':                   'Grant',
  'fellowship':              'Fellowship',
  'job-posting':             'Job Posting',
  'participant-recruitment': 'Participant Recruitment',
  'collaboration-request':   'Collaboration Request',
};

/* ── Event status derivation ────────────────────────────────────── */

/**
 * Derive the display status of an event from its dates rather than the JSON
 * `status` field. The JSON field acts as a manual override only for edge cases
 * like "cancelled" or "postponed" that cannot be inferred from dates alone.
 * This prevents events from being stuck as "upcoming" after their date passes.
 */
function deriveEventStatus(event: ResearchEvent): string {
  if (event.status === 'cancelled' || event.status === 'postponed') return event.status;
  const now = new Date();
  const start = new Date(event.date_start + 'T00:00:00');
  const end   = new Date(event.date_end   + 'T23:59:59');
  if (end < now)   return 'past';
  if (start > now) return 'upcoming';
  return 'ongoing';
}

/* ── ICS generator ──────────────────────────────────────────────── */

function downloadICS(event: ResearchEvent): void {
  const fmt = (d: string) => d.replace(/-/g, '');
  const ics = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DECUR//Research Hub//EN',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${fmt(event.date_start)}`,
    `DTEND;VALUE=DATE:${fmt(event.date_end)}`,
    `SUMMARY:${event.name}`,
    `LOCATION:${event.location}`,
    `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
    `URL:${event.url}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${event.id}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Sub-components ─────────────────────────────────────────────── */

function PaperCard({ paper }: { paper: Paper }) {
  const typeLabel = SOURCE_TYPE_LABELS[paper.source_type] ?? paper.source_type;
  const typeColor = SOURCE_TYPE_COLORS[paper.source_type] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-800/50">
      <div className="flex flex-wrap items-start gap-2 mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor}`}>{typeLabel}</span>
        {paper.open_access && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300">
            Open Access
          </span>
        )}
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-auto">{paper.year}</span>
      </div>

      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 leading-snug">{paper.title}</h3>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {paper.authors.join(', ')}
        {paper.journal && <> &middot; <em>{paper.journal}</em></>}
      </p>

      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-3">{paper.summary}</p>

      <div className="flex flex-wrap items-center gap-2 justify-between">
        <div className="flex flex-wrap gap-1">
          {paper.tags.slice(0, 3).map(tag => (
            <span key={tag} className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              {tag.replace(/-/g, ' ')}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/research/papers/${paper.id}`} className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
            Details
          </Link>
          <a
            href={paper.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            {paper.doi ? 'View paper' : 'View source'}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}

function OrgCard({ org }: { org: Organization }) {
  const statusColor = ORG_STATUS_COLORS[org.status] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400';
  const typeLabel = ORG_TYPE_LABELS[org.type] ?? org.type;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-800/50">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 leading-snug">
            {org.abbreviation ? `${org.abbreviation} - ${org.name}` : org.name}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{org.location} &middot; Est. {org.founded}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${statusColor}`}>
          {org.status === 'reduced-activity' ? 'Reduced Activity' : org.status.charAt(0).toUpperCase() + org.status.slice(1)}
        </span>
      </div>

      <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{typeLabel}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-4">{org.description}</p>

      {org.focus_areas.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-4">
          {org.focus_areas.slice(0, 4).map(area => (
            <span key={area} className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">
              {area}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Link href={`/research/organizations/${org.id}`} className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          Details
        </Link>
        <a
          href={org.website}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
        >
          Visit website
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: ResearchEvent }) {
  const derivedStatus = deriveEventStatus(event);
  const statusColor = EVENT_STATUS_COLORS[derivedStatus] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400';
  const typeLabel = EVENT_TYPE_LABELS[event.type] ?? event.type;
  const dateDisplay = event.date_start === event.date_end
    ? new Date(event.date_start + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : `${new Date(event.date_start + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(event.date_end + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:border-gray-300 dark:hover:border-gray-600 transition-colors bg-white dark:bg-gray-800/50">
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor}`}>
          {derivedStatus.charAt(0).toUpperCase() + derivedStatus.slice(1)}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500">{typeLabel}</span>
        {event.format === 'virtual' && <span className="text-xs text-gray-400 dark:text-gray-500">Online</span>}
        {event.format === 'hybrid' && <span className="text-xs text-gray-400 dark:text-gray-500">Hybrid</span>}
      </div>

      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 leading-snug">{event.name}</h3>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{dateDisplay}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{event.location}</p>
      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-4 line-clamp-3">{event.description}</p>

      <div className="flex flex-wrap items-center gap-4">
        <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
          Event page
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
          </svg>
        </a>
        {event.recording_url && (
          <a href={event.recording_url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center gap-1">
            Recording
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </a>
        )}
        {derivedStatus === 'upcoming' && (
          <button
            onClick={() => downloadICS(event)}
            className="text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors flex items-center gap-1"
          >
            Add to calendar
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}

function OpportunityCard({ opp }: { opp: Opportunity }) {
  const typeLabel = OPP_TYPE_LABELS[opp.type] ?? opp.type;
  const typeColor = OPP_TYPE_COLORS[opp.type] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300';
  const isExpired = opp.status === 'expired';
  const deadlineDate = opp.deadline ? new Date(opp.deadline + 'T12:00:00') : null;
  const daysRemaining = deadlineDate ? Math.ceil((deadlineDate.getTime() - Date.now()) / 86400000) : null;

  return (
    <div className={`border rounded-xl p-5 transition-colors ${isExpired ? 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20 opacity-60' : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800/50'}`}>
      <div className="flex flex-wrap items-start gap-2 mb-3">
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeColor}`}>{typeLabel}</span>
        {isExpired && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400">Expired</span>
        )}
        {!isExpired && daysRemaining !== null && daysRemaining <= 30 && daysRemaining > 0 && (
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300">
            {daysRemaining}d remaining
          </span>
        )}
      </div>

      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1 leading-snug">{opp.title}</h3>

      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
        {opp.organization}
        {opp.amount && <> &middot; <span className="font-medium text-gray-700 dark:text-gray-300">{opp.amount}</span></>}
        {opp.deadline && (
          <> &middot; Deadline: {new Date(opp.deadline + 'T12:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</>
        )}
      </p>

      <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{opp.description}</p>

      {opp.eligibility && (
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-4 italic">Eligibility: {opp.eligibility}</p>
      )}

      <a href={opp.url} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary hover:text-primary/80 transition-colors flex items-center gap-1">
        Learn more
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      </a>
    </div>
  );
}

/* ── Page ───────────────────────────────────────────────────────── */

const Research: NextPage<ResearchProps> = ({ papers, organizations, events, opportunities }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('papers');
  const [paperQuery, setPaperQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [activeSourceType, setActiveSourceType] = useState<string | null>(null);

  useEffect(() => {
    const { tab } = router.query;
    if (tab === 'papers' || tab === 'organizations' || tab === 'events' || tab === 'opportunities') {
      setActiveTab(tab);
    }
  }, [router.query]);

  const upcomingEvents = events.filter(e => deriveEventStatus(e) === 'upcoming');
  const pastEvents = events.filter(e => deriveEventStatus(e) === 'past').sort((a, b) => b.date_start.localeCompare(a.date_start));
  const activeOpportunities = opportunities.filter(o => o.status === 'active');
  const expiredOpportunities = opportunities.filter(o => o.status === 'expired');

  const filteredPapers = useMemo(() => {
    let result = papers;
    if (activeSourceType) result = result.filter(p => p.source_type === activeSourceType);
    if (activeTag) result = result.filter(p => p.tags.includes(activeTag));
    if (paperQuery.trim()) {
      const q = paperQuery.toLowerCase();
      result = result.filter(p =>
        p.title.toLowerCase().includes(q) ||
        p.authors.some(a => a.toLowerCase().includes(q)) ||
        p.summary.toLowerCase().includes(q) ||
        (p.journal ?? '').toLowerCase().includes(q)
      );
    }
    return result.sort((a, b) => b.year - a.year);
  }, [papers, paperQuery, activeTag, activeSourceType]);

  const tabs: { id: TabType; label: string; count: number }[] = [
    { id: 'papers',        label: 'Papers & Reports', count: papers.length },
    { id: 'organizations', label: 'Organizations',     count: organizations.length },
    { id: 'events',        label: 'Events',            count: events.length },
    { id: 'opportunities', label: 'Opportunities',     count: activeOpportunities.length },
  ];

  return (
    <>
      <SeoHead
        title="Research Hub"
        description="Academic papers, research organizations, events, and opportunities in the UAP field - from peer-reviewed journals to government reports."
        path="/research"
      />
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">

          <div className="mb-8">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-gray-100">Research Hub</h1>
              <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">Beta</span>
            </div>
            <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
              Academic papers, research organizations, events, and funding opportunities in the UAP field. A centralized index of the academic infrastructure surrounding these phenomena.
            </p>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Papers & Reports',    value: papers.length,                                                       sub: `${papers.filter(p => p.source_type === 'peer-reviewed').length} peer-reviewed` },
              { label: 'Organizations',       value: organizations.length,                                                sub: `${organizations.filter(o => o.status === 'active').length} currently active` },
              { label: 'Events',              value: events.length,                                                       sub: `${upcomingEvents.length} upcoming` },
              { label: 'Open Opportunities',  value: activeOpportunities.length,                                          sub: 'grants, CFPs, fellowships' },
            ].map(stat => (
              <div key={stat.label} className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-center">
                <div className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-100">{stat.value}</div>
                <div className="text-xs font-medium text-gray-600 dark:text-gray-400">{stat.label}</div>
                <div className="text-xs text-gray-400 dark:text-gray-500">{stat.sub}</div>
              </div>
            ))}
          </div>

          {/* Tab nav */}
          <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors flex items-center gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'text-primary border-primary'
                    : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                {tab.label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-normal ${activeTab === tab.id ? 'bg-primary/10 text-primary' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Papers */}
          {activeTab === 'papers' && (
            <div>
              <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <input
                    type="text"
                    value={paperQuery}
                    onChange={e => setPaperQuery(e.target.value)}
                    placeholder="Search by title, author, or keyword..."
                    className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50"
                  />
                </div>
                <select
                  value={activeSourceType ?? ''}
                  onChange={e => setActiveSourceType(e.target.value || null)}
                  className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="">All types</option>
                  {Object.entries(SOURCE_TYPE_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                <button onClick={() => setActiveTag(null)} className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${!activeTag ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
                  All topics
                </button>
                {['radar-analysis', 'propulsion-physics', 'materials-analysis', 'government-disclosure', 'historical-survey', 'methodology', 'astrobiology', 'witness-testimony', 'consciousness-contact'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                    className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${activeTag === tag ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
                  >
                    {tag.replace(/-/g, ' ')}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {filteredPapers.length} {filteredPapers.length === 1 ? 'result' : 'results'}
                  {(paperQuery || activeTag || activeSourceType) && ' matching filters'}
                </p>
                {(paperQuery || activeTag || activeSourceType) && (
                  <button onClick={() => { setPaperQuery(''); setActiveTag(null); setActiveSourceType(null); }} className="text-xs text-primary hover:text-primary/80 transition-colors">
                    Clear filters
                  </button>
                )}
              </div>

              {filteredPapers.length === 0 ? (
                <div className="text-center py-16 text-gray-400 dark:text-gray-500">
                  <p className="text-sm">No papers match your search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredPapers.map(paper => <PaperCard key={paper.id} paper={paper} />)}
                </div>
              )}
            </div>
          )}

          {/* Organizations */}
          {activeTab === 'organizations' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {organizations.map(org => <OrgCard key={org.id} org={org} />)}
            </div>
          )}

          {/* Events */}
          {activeTab === 'events' && (
            <div className="space-y-8">
              {upcomingEvents.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-4">Upcoming</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {upcomingEvents.map(event => <EventCard key={event.id} event={event} />)}
                  </div>
                </div>
              )}
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-4">Past Events</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {pastEvents.map(event => <EventCard key={event.id} event={event} />)}
                </div>
              </div>
            </div>
          )}

          {/* Opportunities */}
          {activeTab === 'opportunities' && (
            <div className="space-y-8">
              {activeOpportunities.length > 0 ? (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-4">Open Now</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeOpportunities.map(opp => <OpportunityCard key={opp.id} opp={opp} />)}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <p className="text-sm">No open opportunities at this time. Check back soon.</p>
                </div>
              )}
              {expiredOpportunities.length > 0 && (
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-4">Recently Closed</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {expiredOpportunities.map(opp => <OpportunityCard key={opp.id} opp={opp} />)}
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="mt-12 border-t border-gray-100 dark:border-gray-800 pt-6">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center max-w-xl mx-auto">
              This index is editorially curated. Papers require a verifiable DOI, conference proceedings, or official government publication. To suggest additions, use the{' '}
              <Link href="/about" className="text-primary hover:text-primary/80 transition-colors">contact form</Link>.
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<ResearchProps> = async () => {
  return {
    props: {
      papers:        papersData as Paper[],
      organizations: orgsData as Organization[],
      events:        eventsData as ResearchEvent[],
      opportunities: opportunitiesData as Opportunity[],
    },
    revalidate: 3600,
  };
};

export default Research;
