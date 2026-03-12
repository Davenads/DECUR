import { FC, useState } from 'react';
import nolanData from '../../data/insiders/nolan.json';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import CredibilityBalance from './shared/CredibilityBalance';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';

const data = nolanData as typeof nolanData;

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'research',    label: 'Research' },
  { id: 'sol',         label: 'Sol Foundation' },
  { id: 'claims',      label: 'Claims' },
  { id: 'disclosures', label: 'Disclosures' },
  { id: 'network',     label: 'Network' },
  { id: 'assessment',  label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

/* ─── Tab components ──────────────────────────────────────────── */

const OverviewTab: FC = () => {
  const { profile } = data;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Background</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{profile.summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Service Period</p>
          <p className="text-sm text-gray-800">{profile.service_period}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Clearance</p>
          <p className="text-sm text-gray-800">{profile.clearance}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Organizations</p>
          <p className="text-sm text-gray-800">{profile.organizations.join(' · ')}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Roles</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {profile.roles.map(r => (
              <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{r}</span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Education</h3>
        <ul className="space-y-1.5">
          {profile.education.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Early Career</h3>
        <ul className="space-y-1.5">
          {profile.early_career.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Events</h3>
        <div className="space-y-2">
          {profile.key_events.map((ev, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit">{ev.date}</span>
              <span className="text-gray-700">{ev.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ResearchTab: FC = () => {
  const { research } = data;
  const { cia_consultation: cia, publications, materials_analysis: mat } = research;
  return (
    <div className="space-y-8">

      {/* CIA Consultation */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-base font-semibold text-gray-900">CIA Consultation — Brain Morphology Study</h3>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Period</p>
              <p className="text-sm text-gray-800">{cia.period}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Referring Agency</p>
              <p className="text-sm text-gray-800">{cia.referring_agency}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Subject Count</p>
              <p className="text-sm text-gray-800">{cia.subject_count}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-0.5">Method</p>
              <p className="text-sm text-gray-800">{cia.method}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Subject Profile</p>
            <p className="text-sm text-gray-700">{cia.subject_profile}</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
            <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">Key Finding</p>
            <p className="text-sm text-gray-700">{cia.key_finding}</p>
          </div>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Nolan Hypothesis</p>
            <p className="text-sm text-gray-700">{cia.nolan_hypothesis}</p>
          </div>

          <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
            <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Adverse Outcomes</p>
            <p className="text-sm text-gray-700">{cia.adverse_outcomes}</p>
          </div>

          <p className="text-xs text-gray-400 italic">{cia.classification_status}</p>
        </div>
      </div>

      {/* Publications */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-base font-semibold text-gray-900">Peer-Reviewed Publications</h3>
        </div>
        <div className="space-y-4">
          {publications.map((pub, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-0.5">{pub.title}</p>
                  <p className="text-xs text-gray-400 mb-1">{pub.journal} · {pub.year}</p>
                  <p className="text-xs text-gray-500 mb-3">Co-authors: {pub.co_authors.join(', ')}</p>
                  <p className="text-sm text-gray-700">{pub.significance}</p>
                </div>
                <a
                  href={pub.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline whitespace-nowrap shrink-0"
                >
                  Source ↗
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Materials Analysis */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-base font-semibold text-gray-900">Materials Analysis</h3>
        </div>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-3">
          <p className="text-sm text-gray-700">{mat.description}</p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Methods Used</p>
            <p className="text-sm text-gray-800">{mat.methods_used}</p>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Public Statements</p>
            <p className="text-sm text-gray-700">{mat.public_statements}</p>
          </div>
          <p className="text-xs text-gray-400 italic">{mat.classification_note}</p>
        </div>
      </div>

    </div>
  );
};

const SolTab: FC = () => {
  const { sol_foundation: sol } = data;
  return (
    <div className="space-y-5">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Organization</p>
        <h3 className="text-lg font-semibold text-gray-900 mb-0.5">{sol.full_name}</h3>
        <p className="text-xs text-gray-400">{sol.affiliation} · Est. {sol.established}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Nolan Role</p>
          <p className="text-sm text-gray-800">{sol.nolan_role}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Co-Founders</p>
          <p className="text-sm text-gray-800">{sol.co_founders.join(', ')}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Mission</p>
        <p className="text-sm text-gray-700">{sol.mission}</p>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Inaugural Symposium</p>
        <p className="text-sm text-gray-700">{sol.inaugural_symposium}</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">Significance</p>
        <p className="text-sm text-gray-700">{sol.significance}</p>
      </div>
    </div>
  );
};

const ClaimsTab: FC = () => {
  const { claims } = data;
  return (
    <div className="space-y-4">
      <ClaimsStatusBar claims={claims} />
      {claims.map(c => {
        const cfg = statusConfig[c.status] ?? { label: c.status, classes: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' };
        return (
          <div key={c.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{c.category}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.classes}`}>
                {cfg.label}
              </span>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">{c.claim}</p>
            {c.notes && <p className="text-xs text-gray-500 border-t border-gray-100 pt-3">{c.notes}</p>}
          </div>
        );
      })}
    </div>
  );
};

const DisclosuresTab: FC = () => {
  const { disclosures } = data;

  const typeLabels: Record<string, string> = {
    'interview': 'Interview',
    'academic-paper': 'Academic Paper',
    'conference': 'Conference',
    'podcast': 'Podcast',
    'symposium': 'Symposium',
    'congressional-briefing': 'Congressional Briefing',
    'preprint': 'Preprint',
  };

  const typeBadges: Record<string, string> = {
    'interview': 'bg-blue-100 text-blue-700',
    'academic-paper': 'bg-green-100 text-green-700',
    'conference': 'bg-purple-100 text-purple-700',
    'podcast': 'bg-orange-100 text-orange-700',
    'symposium': 'bg-teal-100 text-teal-700',
    'congressional-briefing': 'bg-red-100 text-red-700',
    'preprint': 'bg-indigo-100 text-indigo-700',
  };

  return (
    <div className="space-y-3">
      {disclosures.map((d, i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="font-mono text-xs text-gray-400 whitespace-nowrap mt-0.5 pt-px">{d.date}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-medium text-gray-900 text-sm">{d.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 whitespace-nowrap ${typeBadges[d.type] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                  {typeLabels[d.type] ?? d.type}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-1">{d.outlet}</p>
              {d.notes && <p className="text-xs text-gray-500 italic">{d.notes}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const NetworkTab: FC = () => {
  const { associated_people } = data;
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Key figures in Nolan's professional and advocacy network.</p>
      {associated_people.map(person => (
        <div key={person.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="font-semibold text-gray-900 text-sm">{person.name}</p>
          <p className="text-xs text-primary mb-2">{person.role}</p>
          <p className="text-sm text-gray-600">{person.relationship}</p>
        </div>
      ))}
    </div>
  );
};

const AssessmentTab: FC = () => {
  const { credibility } = data;
  return (
    <div className="space-y-6">
      <CredibilityBalance
        supporting={credibility.supporting.length}
        contradicting={credibility.contradicting.length}
      />

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Methodology Note</p>
        <p className="text-sm text-amber-900">
          Nolan occupies a unique position: his institutional standing (Stanford, peer-reviewed publications) is the strongest of any public UAP figure, while some of his specific claims outpace his disclosed evidence. The credibility assessments here distinguish between his published/verifiable work and his more expansive public assertions.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          Supporting Arguments
        </h4>
        <div className="space-y-2">
          {credibility.supporting.map((arg, i) => (
            <div key={i} className="border border-green-100 bg-green-50/50 rounded-lg p-3">
              <p className="text-sm text-gray-700">{arg}</p>
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
          {credibility.contradicting.map((arg, i) => (
            <div key={i} className="border border-red-100 bg-red-50/50 rounded-lg p-3">
              <p className="text-sm text-gray-700">{arg}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────────── */

const NolanProfile: FC<InsiderProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab />;
      case 'research':    return <ResearchTab />;
      case 'sol':         return <SolTab />;
      case 'claims':      return <ClaimsTab />;
      case 'disclosures': return <DisclosuresTab />;
      case 'network':     return <NetworkTab />;
      case 'assessment':  return <AssessmentTab />;
    }
  };

  return (
    <ProfileShell
      name={data.profile.name}
      role={data.profile.roles[0]}
      period={data.profile.service_period}
      tabs={TABS}
      activeTab={activeTab}
      onTabChange={(id) => setActiveTab(id as TabId)}
      onBack={onBack}
    >
      {renderTab()}
    </ProfileShell>
  );
};

export default NolanProfile;
