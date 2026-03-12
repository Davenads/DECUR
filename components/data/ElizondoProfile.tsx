import { FC, useState } from 'react';
import elizondoData from '../../data/insiders/elizondo.json';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import CredibilityBalance from './shared/CredibilityBalance';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';

const data = elizondoData as typeof elizondoData;

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'aatip',      label: 'AATIP Program' },
  { id: 'observables',label: '5 Observables' },
  { id: 'claims',     label: 'Claims' },
  { id: 'disclosures',label: 'Disclosures' },
  { id: 'network',    label: 'Network' },
  { id: 'assessment', label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

/* Tab components */

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
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Career Background</h3>
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
        <div className="relative pl-6 border-l-2 border-gray-100 space-y-4">
          {profile.key_events.map((ev, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white" />
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit whitespace-nowrap">{ev.year}</span>
                <span className="text-sm text-gray-700">{ev.event}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AatipTab: FC = () => {
  const { aatip } = data;
  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Program</p>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{aatip.full_name}</h3>
        <p className="text-xs text-gray-400">Est. {aatip.established} · Classification: {aatip.classification}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Official End Date</p>
          <p className="text-sm text-gray-800">{aatip.ended_official}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Elizondo Claims Ended</p>
          <p className="text-sm text-gray-800">{aatip.ended_claimed}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Funding</p>
          <p className="text-sm text-gray-800">{aatip.funding}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Primary Contractor</p>
          <p className="text-sm text-gray-800">{aatip.primary_contractor}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Program Focus</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{aatip.focus}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Key Findings</h4>
        <ul className="space-y-2">
          {aatip.key_findings.map((f, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Contested Claim</p>
        <p className="text-sm text-amber-900">{aatip.controversy}</p>
      </div>
    </div>
  );
};

const ObservablesTab: FC = () => {
  const { five_observables } = data;
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Elizondo's analytical framework identifying five consistent flight characteristics observed across UAP encounters studied under AATIP. These observables are not an official DoD classification but have been adopted widely in UAP research and policy discussions.
        </p>
      </div>
      <div className="space-y-4">
        {five_observables.map((obs, i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
            <div className="flex items-start gap-3 mb-2">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded shrink-0">{i + 1}</span>
              <h4 className="font-semibold text-gray-900 text-sm">{obs.name}</h4>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed pl-10">{obs.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const ClaimsTab: FC = () => {
  const { claims } = data;
  return (
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
            <p className="text-sm text-gray-800 leading-relaxed">{claim.claim}</p>
            {claim.notes && (
              <p className="text-xs text-gray-500 border-t border-gray-100 pt-3">{claim.notes}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const typeLabel: Record<string, string> = {
  'print':                'Print',
  'television':           'Television',
  'podcast':              'Podcast',
  'documentary':          'Documentary',
  'congressional-testimony': 'Congressional Testimony',
  'formal-complaint':     'Formal Complaint',
  'declassification':     'Declassification',
  'written':              'Book / Written',
};

const DisclosuresTab: FC = () => {
  const { disclosures } = data;
  return (
    <div className="space-y-4">
      {disclosures.map((d, i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-mono text-xs text-gray-400">{d.date}</span>
              <span className="mx-2 text-gray-200">·</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {typeLabel[d.type] ?? d.type}
              </span>
            </div>
          </div>
          <h4 className="font-semibold text-gray-900 text-sm">{d.title}</h4>
          <p className="text-xs text-gray-500">{d.outlet}</p>
          {d.notes && <p className="text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-2">{d.notes}</p>}
        </div>
      ))}
    </div>
  );
};

const NetworkTab: FC = () => {
  const { associated_people } = data;
  return (
    <div className="space-y-4">
      {associated_people.map(person => (
        <div key={person.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
          <h4 className="font-semibold text-gray-900 mb-0.5">{person.name}</h4>
          <p className="text-xs text-primary mb-2">{person.role}</p>
          <p className="text-sm text-gray-700 leading-relaxed">{person.relationship}</p>
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
          This section documents arguments for and against Elizondo's credibility based on publicly available evidence, official statements, and independent corroboration. DECUR does not adjudicate these claims.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          Supporting Arguments
        </h4>
        <div className="space-y-3">
          {credibility.supporting.map((arg, i) => (
            <div key={i} className="border border-green-100 bg-green-50/50 rounded-lg p-4">
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
        <div className="space-y-3">
          {credibility.contradicting.map((arg, i) => (
            <div key={i} className="border border-red-100 bg-red-50/50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{arg}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* Main component */

const ElizondoProfile: FC<InsiderProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab />;
      case 'aatip':       return <AatipTab />;
      case 'observables': return <ObservablesTab />;
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

export default ElizondoProfile;
