import { FC, useState } from 'react';
import popeData from '../../data/key-figures/pope.json';
import type { PopeData } from '../../types/data';
import ProfileShell from './shared/ProfileShell';
import { InsiderProfileProps } from '../../types/components';
import SharedAssessmentTab from './shared/tabs/SharedAssessmentTab';
import SharedDisclosuresTab from './shared/tabs/SharedDisclosuresTab';
import SharedNetworkTab from './shared/tabs/SharedNetworkTab';
import SharedCareerNetworkTab from './shared/tabs/SharedCareerNetworkTab';
import SharedClaimsTab from './shared/tabs/SharedClaimsTab';
import { ps } from './shared/profileStyles';

const data = popeData as unknown as PopeData;

const TABS = [
  { id: 'overview',        label: 'Overview' },
  { id: 'career-network',  label: 'Career Network' },
  { id: 'mod-role',        label: 'MoD Role' },
  { id: 'investigations',  label: 'Investigations' },
  { id: 'claims',          label: 'Claims' },
  { id: 'disclosures',     label: 'Disclosures' },
  { id: 'network',         label: 'People' },
  { id: 'assessment',      label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

/* ─── Tab components ──────────────────────────────────────────── */

const OverviewTab: FC = () => {
  const { profile } = data;
  return (
    <div className="space-y-6">
      {/* Government investigator context banner */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
        <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Government Investigator</p>
        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">
          Pope ran the UK Ministry of Defence&apos;s official UAP investigation desk — a documented government role with Top Secret access — making him the closest British equivalent to Luis Elizondo. He entered the role as a skeptic and left as a cautious believer in genuine unknowns.
        </p>
      </div>

      <div>
        <h3 className={`${ps.h3} mb-2`}>Background</h3>
        <p className={`${ps.body} leading-relaxed`}>{profile.summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Service Period</p>
          <p className={ps.value}>{profile.service_period}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Clearance</p>
          <p className={ps.value}>{profile.clearance}</p>
        </div>
        <div className={`${ps.infoCard} sm:col-span-2`}>
          <p className={`${ps.label} mb-1`}>Organizations</p>
          <p className={ps.value}>{profile.organizations.join(' · ')}</p>
        </div>
      </div>

      <div>
        <h3 className={`${ps.h3} mb-3`}>Career Background</h3>
        <ul className="space-y-1.5">
          {profile.career_background.map((item, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className={`${ps.h3} mb-3`}>Key Events</h3>
        <div className={`${ps.timelineLine} space-y-4`}>
          {profile.key_events.map((ev, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white dark:border-gray-800" />
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit whitespace-nowrap">{ev.date}</span>
                <span className={ps.body}>{ev.event}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ModRoleTab: FC = () => {
  const { mod_role } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Title</p>
          <p className={ps.value}>{mod_role.title}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Period</p>
          <p className={ps.value}>{mod_role.period}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Reporting To</p>
          <p className={ps.value}>{mod_role.reporting_to}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Annual Caseload</p>
          <p className={ps.value}>{mod_role.annual_caseload}</p>
        </div>
        <div className={`${ps.infoCard} sm:col-span-2`}>
          <p className={`${ps.label} mb-1`}>Access Level</p>
          <p className={ps.value}>{mod_role.access_level}</p>
        </div>
      </div>

      <div className={`${ps.borderCard} space-y-2`}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Methodology</h3>
        <p className={`${ps.body} leading-relaxed`}>{mod_role.methodology}</p>
      </div>

      <div className={`${ps.borderCard} space-y-2`}>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Case Breakdown</h3>
        <p className={`${ps.body} leading-relaxed`}>{mod_role.case_breakdown}</p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Outputs</h3>
        <ul className="space-y-2">
          {mod_role.key_outputs.map((o, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Historical Significance</p>
        <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">{mod_role.significance}</p>
      </div>
    </div>
  );
};

const InvestigationsTab: FC = () => {
  const { investigations } = data;
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="space-y-6">
      <p className={`${ps.body} leading-relaxed`}>{investigations.overview}</p>

      <div className="space-y-3">
        {investigations.major_cases.map((c, i) => (
          <div key={i} className={ps.borderCardNoP}>
            <button
              className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit">{c.date}</span>
                <div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">{c.name}</span>
                  <p className={`${ps.muted} mt-0.5`}>{c.location}</p>
                </div>
              </div>
              <span className="text-gray-400 shrink-0 mt-0.5">{openIdx === i ? '▲' : '▼'}</span>
            </button>
            {openIdx === i && (
              <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-3">
                <p className={`${ps.body} leading-relaxed`}>{c.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className={ps.infoCardSm}>
                    <p className={`${ps.label} mb-1`}>Witnesses</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{c.witnesses}</p>
                  </div>
                  <div className={ps.infoCardSm}>
                    <p className={`${ps.label} mb-1`}>Evidence</p>
                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{c.evidence}</p>
                  </div>
                </div>
                <div className="border border-blue-100 dark:border-blue-800/30 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide mb-1">Pope&apos;s Assessment</p>
                  <p className="text-xs text-blue-900 dark:text-blue-100 leading-relaxed italic">&quot;{c.pope_assessment}&quot;</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-400">Status:</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium">{c.status}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const DisclosuresTab: FC = () => (
  <SharedDisclosuresTab disclosures={data.disclosures} variant="card" introText="Chronological record of Pope's public disclosures and advocacy work." />
);

const NetworkTab: FC = () => (
  <SharedNetworkTab people={data.associated_people} introText="Key relationships spanning Pope's career across government investigation, witness testimony, and the disclosure community." />
);

const AssessmentTab: FC = () => (
  <SharedAssessmentTab credibility={data.credibility} variant="compact" />
);

/* ─── Main component ──────────────────────────────────────────── */

const PopeProfile: FC<InsiderProfileProps> = ({ onBack, backLabel, networkNodeId }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':       return <OverviewTab />;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'career-network': return <SharedCareerNetworkTab profile={data.profile} career_connections={(data as any).career_connections} />;
      case 'mod-role':       return <ModRoleTab />;
      case 'investigations': return <InvestigationsTab />;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'claims':         return <SharedClaimsTab claims={data.claims as any} variant="basis" />;
      case 'disclosures':    return <DisclosuresTab />;
      case 'network':        return <NetworkTab />;
      case 'assessment':     return <AssessmentTab />;
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

export default PopeProfile;
