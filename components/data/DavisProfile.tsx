import { FC, useState } from 'react';
import davisData from '../../data/key-figures/davis.json';
import type { DavisData } from '../../types/data';
import ProfileShell from './shared/ProfileShell';
import { InsiderProfileProps } from '../../types/components';
import SharedAssessmentTab from './shared/tabs/SharedAssessmentTab';
import SharedDisclosuresTab from './shared/tabs/SharedDisclosuresTab';
import SharedNetworkTab from './shared/tabs/SharedNetworkTab';
import SharedCareerNetworkTab from './shared/tabs/SharedCareerNetworkTab';
import SharedOverviewTab from './shared/tabs/SharedOverviewTab';
import SharedClaimsTab from './shared/tabs/SharedClaimsTab';
import { ps } from './shared/profileStyles';

const data = davisData as unknown as DavisData;

const TABS = [
  { id: 'overview',        label: 'Overview' },
  { id: 'earthtech',       label: 'EarthTech' },
  { id: 'dirds',           label: 'AAWSAP / DIRDs' },
  { id: 'memo',            label: 'Wilson-Davis Memo' },
  { id: 'claims',          label: 'Claims' },
  { id: 'disclosures',     label: 'Disclosures' },
  { id: 'career-network',  label: 'Career Network' },
  { id: 'network',         label: 'People' },
  { id: 'assessment',      label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

/* ─── Tab components ──────────────────────────────────────────── */

const EarthTechTab: FC = () => {
  const { earthtech } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Founded By</p>
          <p className={ps.value}>{earthtech.founded_by}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Location</p>
          <p className={ps.value}>{earthtech.location}</p>
        </div>
        <div className={`${ps.infoCard} sm:col-span-2`}>
          <p className={`${ps.label} mb-1`}>Also Known As</p>
          <p className={ps.value}>{earthtech.also_known_as}</p>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Mission</h3>
        <p className={`${ps.body} leading-relaxed`}>{earthtech.mission}</p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Davis Role</h3>
        <p className={`${ps.body} leading-relaxed`}>{earthtech.davis_role}</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">NIDS Connection</p>
        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">{earthtech.nids_connection}</p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Research Areas</h3>
        <ul className="space-y-2">
          {earthtech.key_research_areas.map((area, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{area}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const DirdsTab: FC = () => {
  const { aawsap_dirds } = data;
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Contract</p>
          <p className={ps.value}>{aawsap_dirds.contract}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Contractor</p>
          <p className={ps.value}>{aawsap_dirds.contractor}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Period</p>
          <p className={ps.value}>{aawsap_dirds.period}</p>
        </div>
      </div>

      <div className={`${ps.accentBox} flex items-center gap-3`}>
        <span className="text-2xl font-bold text-primary">{aawsap_dirds.total_dirds}</span>
        <div>
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200">Total DIRDs Produced</p>
          <p className="text-xs text-gray-500">Davis authored or co-authored {aawsap_dirds.davis_authored.length} of these documents</p>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Davis-Authored Documents</h3>
        <div className="space-y-2">
          {aawsap_dirds.davis_authored.map((doc, i) => (
            <div key={i} className={ps.borderCardNoP}>
              <button
                className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit">{doc.year}</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">{doc.title}</span>
                </div>
                <span className="text-gray-400 shrink-0 mt-0.5">{openIdx === i ? '▲' : '▼'}</span>
              </button>
              {openIdx === i && (
                <div className="px-4 pb-4 space-y-2 border-t border-gray-100 dark:border-gray-700 pt-3">
                  <p className={`${ps.muted} font-medium`}>{doc.author}</p>
                  <p className={`${ps.body} leading-relaxed`}>{doc.summary}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MemoTab: FC = () => {
  const { wilson_davis_memo } = data;
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-300 dark:border-amber-800/30 rounded-lg p-4">
        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Disputed Document</p>
        <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">
          Admiral Wilson has publicly denied the meeting occurred as described. The memo has not been officially authenticated. Its contents are presented here as reported claims pending authoritative verification.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Date</p>
          <p className={ps.value}>{wilson_davis_memo.date}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Location</p>
          <p className={ps.value}>{wilson_davis_memo.location}</p>
        </div>
        <div className={`${ps.infoCard} sm:col-span-2`}>
          <p className={`${ps.label} mb-1`}>Publicly Leaked</p>
          <p className={ps.value}>{wilson_davis_memo.leak_date} — {wilson_davis_memo.leak_source}</p>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Context</h3>
        <p className={`${ps.body} leading-relaxed`}>{wilson_davis_memo.context}</p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Memo Origin</h3>
        <p className={`${ps.body} leading-relaxed`}>{wilson_davis_memo.memo_origin}</p>
      </div>

      <div className={`${ps.borderCardLg} space-y-3`}>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Wilson's Account (as documented)</h3>
        <p className={`${ps.body} leading-relaxed`}>{wilson_davis_memo.wilson_account}</p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Program Description</h3>
        <p className={`${ps.body} leading-relaxed`}>{wilson_davis_memo.program_description}</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Significance</p>
        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">{wilson_davis_memo.significance}</p>
      </div>
    </div>
  );
};

const DisclosuresTab: FC = () => (
  <SharedDisclosuresTab disclosures={data.disclosures} variant="card" introText="Chronological record of Davis's public disclosures and research contributions." />
);

const NetworkTab: FC = () => (
  <SharedNetworkTab people={data.associated_people} introText="Key relationships in Davis's research and disclosure network." />
);

const AssessmentTab: FC = () => (
  <SharedAssessmentTab credibility={data.credibility} />
);

/* ─── Main component ──────────────────────────────────────────── */

const DavisProfile: FC<InsiderProfileProps> = ({ onBack, backLabel, networkNodeId }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'overview':    return <SharedOverviewTab profile={data.profile as any} />;
      case 'earthtech':   return <EarthTechTab />;
      case 'dirds':       return <DirdsTab />;
      case 'memo':        return <MemoTab />;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'claims':      return <SharedClaimsTab claims={data.claims as any} variant="basis" />;
      case 'disclosures': return <DisclosuresTab />;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'career-network': return <SharedCareerNetworkTab profile={data.profile} career_connections={(data as any).career_connections} />;
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
      contentId={data.profile.id}
      contentName={data.profile.name}
      onBack={onBack}
      backLabel={backLabel}
      networkNodeId={networkNodeId}
    >
      {renderTab()}
    </ProfileShell>
  );
};

export default DavisProfile;
