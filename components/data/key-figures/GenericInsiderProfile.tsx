import { FC, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ProfileShell from '../shared/ProfileShell';
import PersonCard from '../shared/PersonCard';
import { insiderRegistry } from '../../../data/key-figures/registry';
import casesData from '../../../data/cases.json';
import insidersIndex from '../../../data/key-figures/index.json';

const FigureCareerFlow = dynamic(
  () => import('../shared/FigureCareerFlow'),
  { ssr: false, loading: () => <div className="h-[240px] rounded-lg bg-gray-900 animate-pulse" /> }
);

// Maps organization name substrings (lowercase) to their /programs/[id] slug
const ORG_PROGRAM_MAP: Array<[string, string]> = [
  ['all-domain anomaly resolution office', 'aaro'],
  ['aaro', 'aaro'],
  ['advanced aerospace weapon system applications', 'aawsap'],
  ['aawsap', 'aawsap'],
  ['to the stars academy', 'ttsa'],
  ['ttsa', 'ttsa'],
  ['national institute for discovery science', 'nids'],
  ['nids', 'nids'],
  ['bigelow aerospace', 'bigelow-aerospace'],
  ['sol foundation', 'sol-foundation'],
  ['project blue book', 'project-blue-book'],
  ['project sign', 'project-sign'],
  ['project grudge', 'project-grudge'],
  ['kona blue', 'kona-blue'],
  ['immaculate constellation', 'immaculate-constellation'],
];

function getProgramId(org: string): string | null {
  const lower = org.toLowerCase();
  for (const [key, id] of ORG_PROGRAM_MAP) {
    if (lower.includes(key)) return id;
  }
  return null;
}

interface GenericInsiderProfileProps {
  id: string;
  onBack: () => void;
  backLabel?: string;
}

// --- Types covering the common JSON schema ---

interface KeyEvent {
  year: string;
  event: string;
}

interface AssociatedPerson {
  id: string;
  name: string;
  role: string;
  relationship: string;
}

interface Disclosure {
  date: string;
  type: string;
  title: string;
  outlet: string;
  interviewer?: string;
  notes: string;
}

interface Source {
  title: string;
  url: string;
  type: string;
  notes: string;
}

interface ProfileData {
  id: string;
  name: string;
  aliases: string[];
  born?: string;
  died?: string;
  roles: string[];
  service_period?: string;
  organizations?: string[];
  clearance?: string;
  summary: string;
  education?: string[];
  early_career?: string[];
  key_events?: KeyEvent[];
}

// --- Tab identifiers ---

type TabId = 'overview' | 'timeline' | 'career-flow' | 'feature' | 'people' | 'disclosures' | 'sources';

// --- Helpers ---

const DISCLOSURE_TYPE_LABELS: Record<string, string> = {
  'article': 'Article',
  'written': 'Book / Written',
  'television': 'Television',
  'podcast': 'Podcast',
  'congressional-testimony': 'Congressional Testimony',
  'speech': 'Speech',
  'film': 'Film',
  'interview': 'Interview',
  'formal-complaint': 'Formal Complaint',
  'declassification': 'Declassification',
};

function disclosureLabel(type: string): string {
  return DISCLOSURE_TYPE_LABELS[type] ?? type;
}

// Detect the "feature" section key and return a human-readable tab label.
// Add new patterns here as new profile schemas are introduced.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function detectFeature(data: Record<string, any>): { key: string; label: string } | null {
  const featureMap: Record<string, string> = {
    aawsap: 'AAWSAP',
    blue_book: 'Project Blue Book',
    major_investigations: 'Investigations',
    major_work: 'Major Work',
    claims: 'Claims',
    interviews: 'Interviews',
  };
  for (const [key, label] of Object.entries(featureMap)) {
    if (data[key]) return { key, label };
  }
  return null;
}

// --- Section renderers ---

const OverviewTab: FC<{ profile: ProfileData; relatedCases: Array<{ id: string; name: string; date: string; location: string; evidence_tier: string }> }> = ({ profile, relatedCases }) => (
  <div className="space-y-6">
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
      {profile.born && (
        <div className="flex gap-3">
          <span className="text-xs font-medium text-gray-400 w-24 shrink-0 pt-0.5">Born</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{profile.born}</span>
        </div>
      )}
      {profile.died && (
        <div className="flex gap-3">
          <span className="text-xs font-medium text-gray-400 w-24 shrink-0 pt-0.5">Died</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{profile.died}</span>
        </div>
      )}
      {profile.aliases.length > 0 && (
        <div className="flex gap-3">
          <span className="text-xs font-medium text-gray-400 w-24 shrink-0 pt-0.5">Aliases</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{profile.aliases.join(', ')}</span>
        </div>
      )}
      {profile.service_period && (
        <div className="flex gap-3">
          <span className="text-xs font-medium text-gray-400 w-24 shrink-0 pt-0.5">Service</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{profile.service_period}</span>
        </div>
      )}
      {profile.clearance && (
        <div className="flex gap-3">
          <span className="text-xs font-medium text-gray-400 w-24 shrink-0 pt-0.5">Clearance</span>
          <span className="text-sm text-gray-700 dark:text-gray-300">{profile.clearance}</span>
        </div>
      )}
    </div>

    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Summary</h3>
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{profile.summary}</p>
    </div>

    {profile.roles && profile.roles.length > 0 && (
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Roles</h3>
        <ul className="space-y-1">
          {profile.roles.map((role, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
              <span className="text-primary mt-1 shrink-0">-</span>
              {role}
            </li>
          ))}
        </ul>
      </div>
    )}

    {profile.organizations && profile.organizations.length > 0 && (
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Organizations</h3>
        <div className="flex flex-wrap gap-2">
          {profile.organizations.map((org, i) => {
            const programId = getProgramId(org);
            return programId ? (
              <Link
                key={i}
                href={`/programs/${programId}`}
                className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                {org}
              </Link>
            ) : (
              <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {org}
              </span>
            );
          })}
        </div>
      </div>
    )}

    {profile.education && profile.education.length > 0 && (
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Education</h3>
        <ul className="space-y-1">
          {profile.education.map((ed, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
              <span className="text-primary mt-1 shrink-0">-</span>
              {ed}
            </li>
          ))}
        </ul>
      </div>
    )}

    {profile.early_career && profile.early_career.length > 0 && (
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Early Career</h3>
        <ul className="space-y-2">
          {profile.early_career.map((item, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
              <span className="text-primary mt-1 shrink-0">-</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    )}

    {relatedCases.length > 0 && (
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-2">Related Documented Cases</h3>
        <div className="space-y-2">
          {relatedCases.map(c => (
            <Link
              key={c.id}
              href={`/cases/${c.id}`}
              className="flex items-center justify-between gap-3 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 hover:border-primary hover:shadow-sm transition-all group"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 group-hover:text-primary transition-colors truncate">{c.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{c.date} · {c.location}</p>
              </div>
              <svg className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </div>
    )}
  </div>
);

const TimelineTab: FC<{ events: KeyEvent[] }> = ({ events }) => (
  <div className="relative">
    <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
    <div className="space-y-5">
      {events.map((ev, i) => (
        <div key={i} className="flex gap-4 pl-8 relative">
          <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-white dark:border-gray-900 shadow" />
          <div>
            <span className="text-xs font-semibold text-primary">{ev.year}</span>
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">{ev.event}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const PeopleTab: FC<{ people: AssociatedPerson[] }> = ({ people }) => (
  <div className="space-y-4">
    {people.map((person) => (
      <PersonCard key={person.id} person={person} />
    ))}
  </div>
);

const DisclosuresTab: FC<{ disclosures: Disclosure[] }> = ({ disclosures }) => (
  <div className="space-y-4">
    {disclosures.map((d, i) => (
      <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{d.title}</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shrink-0">
            {disclosureLabel(d.type)}
          </span>
        </div>
        <p className="text-xs text-gray-400 mb-2">
          {d.date} · {d.outlet}
          {d.interviewer && d.interviewer !== 'N/A' ? ` · ${d.interviewer}` : ''}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{d.notes}</p>
      </div>
    ))}
  </div>
);

const SourcesTab: FC<{ sources: Source[] }> = ({ sources }) => (
  <div className="space-y-3">
    {sources.map((s, i) => (
      <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <div className="flex items-start justify-between gap-2 mb-1">
          <a
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-sm text-primary hover:underline"
          >
            {s.title}
          </a>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 shrink-0">
            {s.type}
          </span>
        </div>
        {s.notes && <p className="text-sm text-gray-600 dark:text-gray-400">{s.notes}</p>}
      </div>
    ))}
  </div>
);

// Generic renderer for a feature section - renders top-level fields as labeled cards.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const FeatureTab: FC<{ data: Record<string, any> }> = ({ data }) => {
  const renderValue = (value: unknown, depth = 0): React.ReactNode => {
    if (value === null || value === undefined) return null;
    if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
      return <span className="text-sm text-gray-700 dark:text-gray-300">{String(value)}</span>;
    }
    if (Array.isArray(value)) {
      return (
        <ul className="space-y-1 mt-1">
          {value.map((item, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
              {typeof item === 'string' ? (
                <>
                  <span className="text-primary mt-1 shrink-0">-</span>
                  {item}
                </>
              ) : (
                <div className="w-full">{renderValue(item, depth + 1)}</div>
              )}
            </li>
          ))}
        </ul>
      );
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>).filter(
        ([, v]) => v !== null && v !== undefined && v !== ''
      );
      if (depth === 0) {
        return (
          <div className="space-y-4">
            {entries.map(([k, v]) => (
              <div key={k}>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {k.replace(/_/g, ' ')}
                </span>
                <div className="mt-1">{renderValue(v, depth + 1)}</div>
              </div>
            ))}
          </div>
        );
      }
      return (
        <div className="border border-gray-100 dark:border-gray-700 rounded p-3 space-y-2 mt-1">
          {entries.map(([k, v]) => (
            <div key={k}>
              <span className="text-xs font-medium text-gray-400">{k.replace(/_/g, ' ')}: </span>
              {renderValue(v, depth + 1)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return <div>{renderValue(data)}</div>;
};

// --- Main component ---

const GenericInsiderProfile: FC<GenericInsiderProfileProps> = ({ id, onBack, backLabel }) => {
  const data = insiderRegistry[id];

  if (!data) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Profile data not found for id: {id}</p>
        <button onClick={onBack} className="mt-4 text-sm text-primary hover:underline">
          Back to Key Figures
        </button>
      </div>
    );
  }

  const profile: ProfileData = data.profile;
  const associatedPeople: AssociatedPerson[] = data.associated_people ?? [];
  const disclosures: Disclosure[] = data.disclosures ?? [];
  const sources: Source[] = data.sources ?? [];
  // Normalize key_events: tolerate both `year` and legacy `date` field names.
  // If a `date` value like "1994-09-16" is present, extract the year portion.
  const keyEvents: KeyEvent[] = (profile.key_events ?? []).map(ev => {
    const raw = ev as { year?: string; date?: string; event: string };
    const yearStr = raw.year ?? (raw.date ? String(raw.date).split('-')[0] : '');
    return { year: yearStr, event: raw.event };
  });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const careerConnections: any[] = data.career_connections ?? [];
  const feature = detectFeature(data);

  const relatedCases = (casesData as Array<{
    id: string; name: string; date: string; location: string;
    evidence_tier: string; insider_connections: string[];
  }>).filter(c => c.insider_connections.includes(id));

  const includeInExplore = (insidersIndex as Array<{ id: string; includeInExplore?: boolean }>)
    .find(e => e.id === id)?.includeInExplore ?? false;

  const TABS: Array<{ id: TabId; label: string }> = [
    { id: 'overview', label: 'Overview' },
    ...(keyEvents.length > 0 ? [{ id: 'timeline' as TabId, label: 'Timeline' }] : []),
    ...(keyEvents.length > 0 ? [{ id: 'career-flow' as TabId, label: 'Career Network' }] : []),
    ...(feature ? [{ id: 'feature' as TabId, label: feature.label }] : []),
    ...(associatedPeople.length > 0 ? [{ id: 'people' as TabId, label: 'People' }] : []),
    ...(disclosures.length > 0 ? [{ id: 'disclosures' as TabId, label: 'Disclosures' }] : []),
    ...(sources.length > 0 ? [{ id: 'sources' as TabId, label: 'Sources' }] : []),
  ];

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab profile={profile} relatedCases={relatedCases} />;
      case 'timeline':
        return <TimelineTab events={keyEvents} />;
      case 'career-flow':
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Career timeline with key connections. Dashed edges show cross-figure and program relationships. Scroll or pinch to zoom.
            </p>
            <FigureCareerFlow keyEvents={keyEvents} careerConnections={careerConnections} />
          </div>
        );
      case 'feature':
        return feature ? <FeatureTab data={data[feature.key]} /> : null;
      case 'people':
        return <PeopleTab people={associatedPeople} />;
      case 'disclosures':
        return <DisclosuresTab disclosures={disclosures} />;
      case 'sources':
        return <SourcesTab sources={sources} />;
    }
  };

  return (
    <ProfileShell
      name={profile.name}
      role={profile.roles[0] ?? ''}
      period={profile.service_period ?? (profile.born ? profile.born : '')}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as TabId)}
      onBack={onBack}
      backLabel={backLabel}
    >
      <div className="mt-4">
        {renderTab()}
      </div>
      {includeInExplore && (
        <div className="mt-8 border-t border-gray-100 dark:border-gray-700 pt-5">
          <Link
            href="/explore"
            className="flex items-center justify-between gap-3 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 hover:border-primary hover:shadow-sm transition-all group"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-0.5">Explore Visualizations</p>
              <p className="text-sm text-gray-700 group-hover:text-primary transition-colors">
                View {profile.name}&apos;s events on the interactive timeline overlay
              </p>
            </div>
            <svg className="h-4 w-4 text-gray-300 group-hover:text-primary transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </ProfileShell>
  );
};

export default GenericInsiderProfile;
