import { FC, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import ProfileShell from '../shared/ProfileShell';
import PersonCard from '../shared/PersonCard';
import ClaimsStatusBar from '../shared/ClaimsStatusBar';
import CredibilityBalance from '../shared/CredibilityBalance';
import { statusConfig } from '../shared/profileConstants';
import { insiderRegistry } from '../../../data/key-figures/registry';
import casesData from '../../../data/cases.json';
import insidersIndex from '../../../data/key-figures/index.json';
import { disclosureLabel } from '../shared/disclosureTypes';

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
  networkNodeId?: string;
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

// Feature tabs are identified by the pattern `feature:<key>` to support multiple features per profile.
type TabId = 'overview' | 'timeline' | 'career-flow' | 'people' | 'disclosures' | 'sources' | 'assessment' | string;

// --- Credibility ---

interface Credibility {
  supporting: string[];
  contradicting: string[];
}

// --- Helpers ---

// Standard top-level keys present in every profile JSON — not feature sections.
const KNOWN_SCHEMA_KEYS = new Set([
  'profile', 'associated_people', 'disclosures', 'sources', 'credibility', 'career_connections',
]);

// Maps feature key → human-readable tab label.
// Add new patterns here as new profile schemas are introduced.
const FEATURE_MAP: Record<string, string> = {
  // Previously registered
  aawsap:                 'AAWSAP',
  blue_book:              'Project Blue Book',
  major_investigations:   'Investigations',
  major_work:             'Major Work',
  claims:                 'Claims',
  interviews:             'Interviews',
  immaculate_constellation: 'IMCON Report',
  // Encounter / observable patterns
  five_observables:       '5 Observables',
  encounter:              'Encounter',
  // Legislative / government response patterns
  legislation:            'Legislation',
  legislative_impact:     'Legislative Impact',
  government_response:    'Government Response',
  // Research / investigation patterns
  classification_system:  'Classification System',
  peer_investigation:     'Investigation',
  methodology:            'Methodology',
  theory:                 'Theory',
  forbidden_science:      'Forbidden Science',
  // Organizational patterns
  sol_foundation:         'Sol Foundation',
  nids_role:              'NIDS',
  mod_role:               'MOD Role',
  // Testimony patterns
  testimony:              'Testimony',
};

// Returns ALL matching feature sections in featureMap order — supports multi-feature profiles.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function detectFeatures(data: Record<string, any>): Array<{ key: string; label: string }> {
  // Warn about unregistered keys so they don't silently disappear.
  if (process.env.NODE_ENV !== 'production') {
    for (const key of Object.keys(data)) {
      if (!KNOWN_SCHEMA_KEYS.has(key) && !FEATURE_MAP[key]) {
        console.warn(
          `[GenericInsiderProfile] Unregistered data key "${key}" in profile "${data.profile?.id ?? 'unknown'}". ` +
          `Add it to FEATURE_MAP in GenericInsiderProfile.tsx or KNOWN_SCHEMA_KEYS if it is a standard field.`
        );
      }
    }
  }

  return Object.entries(FEATURE_MAP)
    .filter(([key]) => data[key])
    .map(([key, label]) => ({ key, label }));
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

// Dedicated renderer for five_observables — numbered card list.
interface Observable {
  name: string;
  description: string;
}

const FiveObservablesTab: FC<{ observables: Observable[] }> = ({ observables }) => (
  <div className="space-y-4">
    <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
      Five observable signatures identified by AATIP analysts as defining UAP characteristics
      that exceed known human aerospace capabilities.
    </p>
    <div className="space-y-3">
      {observables.map((obs, i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex gap-3 items-start">
            <span className="text-primary font-bold text-sm shrink-0 w-5 pt-0.5">{i + 1}.</span>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">{obs.name}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{obs.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// Dedicated renderer for legislation — overview + timeline + assessment.
interface LegislationAction {
  year: string;
  action: string;
}

interface LegislationData {
  overview?: string;
  key_actions?: LegislationAction[];
  assessment?: string;
}

const LegislationTab: FC<{ legislation: LegislationData }> = ({ legislation }) => (
  <div className="space-y-6">
    {legislation.overview && (
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{legislation.overview}</p>
    )}
    {legislation.key_actions && legislation.key_actions.length > 0 && (
      <div>
        <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-3">Key Actions</h4>
        <div className="relative">
          <div className="absolute left-3 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700" />
          <div className="space-y-5">
            {legislation.key_actions.map((item, i) => (
              <div key={i} className="flex gap-4 pl-8 relative">
                <div className="absolute left-1.5 top-1.5 w-3 h-3 rounded-full bg-primary border-2 border-white dark:border-gray-900 shadow" />
                <div>
                  <span className="text-xs font-semibold text-primary">{item.year}</span>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mt-0.5 leading-relaxed">{item.action}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )}
    {legislation.assessment && (
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Assessment</p>
        <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">{legislation.assessment}</p>
      </div>
    )}
  </div>
);

// Dedicated renderer for the `claims` feature section.
// Matches the ClaimsTab style used in all bespoke profile components.
interface Claim {
  id: string;
  category: string;
  claim: string;
  status: string;
  notes?: string;
}

const GenericClaimsTab: FC<{ claims: Claim[] }> = ({ claims }) => (
  <div className="space-y-5">
    <ClaimsStatusBar claims={claims} />
    {claims.map(claim => {
      const cfg = statusConfig[claim.status] ?? { label: claim.status, classes: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' };
      return (
        <div key={claim.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{claim.category}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.classes}`}>{cfg.label}</span>
          </div>
          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{claim.claim}</p>
          {claim.notes && (
            <p className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">{claim.notes}</p>
          )}
        </div>
      );
    })}
  </div>
);

// --- Assessment tab ---

interface GenericAssessmentTabProps {
  credibility: Credibility;
  sources: Source[];
}

const GenericAssessmentTab: FC<GenericAssessmentTabProps> = ({ credibility, sources }) => (
  <div className="space-y-6">
    <CredibilityBalance
      supporting={credibility.supporting.length}
      contradicting={credibility.contradicting.length}
    />

    <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
      <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Methodology Note</p>
      <p className="text-sm text-amber-900 dark:text-amber-100">
        This section presents documented arguments for and against this figure&apos;s credibility based on verifiable
        institutional responses, journalistic findings, and official positions. DECUR does not adjudicate these
        claims; they are presented for methodological transparency.
      </p>
    </div>

    <div>
      <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
        Supporting Arguments
      </h4>
      <div className="space-y-2">
        {credibility.supporting.map((item, i) => (
          <div key={i} className="flex gap-2 border border-green-100 dark:border-green-800/30 bg-green-50/50 dark:bg-green-900/20 rounded-lg p-3">
            <span className="text-green-500 mt-0.5 shrink-0">&#10003;</span>
            <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
          </div>
        ))}
      </div>
    </div>

    <div>
      <h4 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
        Arguments Against
      </h4>
      <div className="space-y-2">
        {credibility.contradicting.map((item, i) => (
          <div key={i} className="flex gap-2 border border-red-100 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/20 rounded-lg p-3">
            <span className="text-red-400 mt-0.5 shrink-0">&#10007;</span>
            <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
          </div>
        ))}
      </div>
    </div>

    {sources.length > 0 && (
      <div>
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Sources</h4>
        <div className="space-y-2">
          {sources.map((src, i) => (
            <div key={i} className="flex items-start justify-between gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{src.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">
                  {src.type?.replace(/-/g, ' ')}{src.notes ? ` · ${src.notes}` : ''}
                </p>
              </div>
              {src.url && (
                <a href={src.url} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline whitespace-nowrap shrink-0">
                  View &#8599;
                </a>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// --- Main component ---

const GenericInsiderProfile: FC<GenericInsiderProfileProps> = ({ id, onBack, backLabel, networkNodeId }) => {
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
  const credibility: Credibility | null = data.credibility
    ? { supporting: data.credibility.supporting ?? [], contradicting: data.credibility.contradicting ?? [] }
    : null;
  const features = detectFeatures(data);

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
    ...features.map(f => ({ id: `feature:${f.key}`, label: f.label })),
    ...(associatedPeople.length > 0 ? [{ id: 'people' as TabId, label: 'People' }] : []),
    ...(disclosures.length > 0 ? [{ id: 'disclosures' as TabId, label: 'Disclosures' }] : []),
    ...(sources.length > 0 ? [{ id: 'sources' as TabId, label: 'Sources' }] : []),
    ...(credibility ? [{ id: 'assessment' as TabId, label: 'Assessment' }] : []),
  ];

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    // Feature tabs use the pattern `feature:<key>` to support multiple per profile.
    if (activeTab.startsWith('feature:')) {
      const featureKey = activeTab.slice('feature:'.length);
      const featureData = data[featureKey];
      if (!featureData) return null;
      if (featureKey === 'claims' && Array.isArray(featureData)) {
        return <GenericClaimsTab claims={featureData} />;
      }
      if (featureKey === 'five_observables' && Array.isArray(featureData)) {
        return <FiveObservablesTab observables={featureData} />;
      }
      if (featureKey === 'legislation' && typeof featureData === 'object' && !Array.isArray(featureData)) {
        return <LegislationTab legislation={featureData as LegislationData} />;
      }
      return <FeatureTab data={featureData} />;
    }

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
      case 'people':
        return <PeopleTab people={associatedPeople} />;
      case 'disclosures':
        return <DisclosuresTab disclosures={disclosures} />;
      case 'sources':
        return <SourcesTab sources={sources} />;
      case 'assessment':
        if (!credibility) return null;
        return <GenericAssessmentTab credibility={credibility} sources={sources} />;
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
      networkNodeId={networkNodeId}
    >
      <div className="mt-4">
        {renderTab()}
      </div>
    </ProfileShell>
  );
};

export default GenericInsiderProfile;
