import { FC, useState } from 'react';
import mellonData from '../../data/insiders/mellon.json';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import CredibilityBalance from './shared/CredibilityBalance';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';

const data = mellonData as typeof mellonData;

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'senate',      label: 'Senate Intel' },
  { id: 'ttsa',        label: 'TTSA' },
  { id: 'legislation', label: 'Legislation' },
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
                <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit whitespace-nowrap">{ev.date}</span>
                <span className="text-sm text-gray-700">{ev.event}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SenateTab: FC = () => {
  const { senate_intel } = data;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{senate_intel.committee}</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {senate_intel.roles.map((r, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{r}</span>
          ))}
        </div>
        <p className="text-sm text-gray-700 leading-relaxed">{senate_intel.significance}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Oversight Areas</h3>
        <ul className="space-y-1.5">
          {senate_intel.oversight_areas.map((area, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{area}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Post-Government</p>
        <p className="text-sm text-blue-900 leading-relaxed">{senate_intel.post_government}</p>
      </div>
    </div>
  );
};

const TTSATab: FC = () => {
  const { ttsa_role } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Title</p>
          <p className="text-sm text-gray-800">{ttsa_role.title}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Joined</p>
          <p className="text-sm text-gray-800">{ttsa_role.joined}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Co-Founders</p>
          <p className="text-sm text-gray-800">{ttsa_role.co_founders.join(', ')}</p>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Primary Contributions</h3>
        <ul className="space-y-2">
          {ttsa_role.primary_contributions.map((c, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-3">
        <h3 className="text-base font-semibold text-gray-900">2017 Video Release</h3>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Videos</p>
          <div className="flex flex-wrap gap-1.5">
            {ttsa_role.video_release.videos.map((v, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{v}</span>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Method</p>
          <p className="text-sm text-gray-700 leading-relaxed">{ttsa_role.video_release.method}</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-0.5">Outcome</p>
          <p className="text-sm text-green-900">{ttsa_role.video_release.outcome}</p>
        </div>
      </div>
    </div>
  );
};

const LegislationTab: FC = () => {
  const { legislation } = data;
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-700 leading-relaxed">{legislation.overview}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Legislative Actions</h3>
        <div className="relative pl-6 border-l-2 border-gray-100 space-y-4">
          {legislation.key_actions.map((item, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white" />
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit">{item.year}</span>
                <span className="text-sm text-gray-700">{item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Assessment</p>
        <p className="text-sm text-amber-900 leading-relaxed">{legislation.assessment}</p>
      </div>
    </div>
  );
};

const ClaimsTab: FC = () => {
  const { claims } = data;
  return (
    <div className="space-y-6">
      <ClaimsStatusBar claims={claims} />
      <div className="space-y-4">
        {claims.map((c, i) => {
          const cfg = statusConfig[c.status] ?? { label: c.status, classes: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' };
          return (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-900 leading-snug">{c.claim}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.classes}`}>{cfg.label}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{c.basis}</p>
              {c.notes && (
                <p className="text-xs text-gray-400 italic">{c.notes}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DisclosuresTab: FC = () => {
  const { disclosures } = data;
  return (
    <div className="space-y-4">
      {disclosures.map((d, i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{d.date}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">{d.type}</span>
            <span className="text-xs text-gray-400">{d.outlet}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{d.description}</p>
        </div>
      ))}
    </div>
  );
};

const NetworkTab: FC = () => {
  const { associated_people } = data;
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Key relationships in Mellon's disclosure network.</p>
      {associated_people.map((p, i) => (
        <div key={i} className="flex gap-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary">{p.name.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{p.name}</p>
            <p className="text-xs text-gray-500 leading-snug">{p.relation}</p>
          </div>
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
    </div>
  );
};

/* ─── Main component ──────────────────────────────────────────── */

const MellonProfile: FC<InsiderProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab />;
      case 'senate':      return <SenateTab />;
      case 'ttsa':        return <TTSATab />;
      case 'legislation': return <LegislationTab />;
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

export default MellonProfile;
