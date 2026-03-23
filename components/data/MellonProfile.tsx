import { FC, useState } from 'react';
import dynamic from 'next/dynamic';
import mellonData from '../../data/key-figures/mellon.json';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';
import SharedAssessmentTab from './shared/tabs/SharedAssessmentTab';
import SharedDisclosuresTab from './shared/tabs/SharedDisclosuresTab';
import SharedNetworkTab from './shared/tabs/SharedNetworkTab';
import { ps } from './shared/profileStyles';

const FigureCareerFlow = dynamic(() => import('./shared/FigureCareerFlow'), {
  ssr: false,
  loading: () => <div className="h-[440px] rounded-lg bg-gray-900 animate-pulse" />,
});

const data = mellonData as typeof mellonData;

const TABS = [
  { id: 'overview',        label: 'Overview' },
  { id: 'senate',          label: 'Senate Intel' },
  { id: 'ttsa',            label: 'TTSA' },
  { id: 'legislation',     label: 'Legislation' },
  { id: 'claims',          label: 'Claims' },
  { id: 'disclosures',     label: 'Disclosures' },
  { id: 'career-network',  label: 'Career Network' },
  { id: 'network',         label: 'Network' },
  { id: 'assessment',      label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

/* ─── Tab components ──────────────────────────────────────────── */

const OverviewTab: FC = () => {
  const { profile } = data;
  return (
    <div className="space-y-6">
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
        <div className={`${ps.infoCard} sm:col-span-2`}>
          <p className={`${ps.label} mb-1`}>Roles</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {profile.roles.map(r => (
              <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{r}</span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className={`${ps.h3} mb-3`}>Career Background</h3>
        <ul className="space-y-1.5">
          {profile.early_career.map((item, i) => (
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

const SenateTab: FC = () => {
  const { senate_intel } = data;
  return (
    <div className="space-y-6">
      <div>
        <h3 className={`${ps.h3} mb-1`}>{senate_intel.committee}</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {senate_intel.roles.map((r, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{r}</span>
          ))}
        </div>
        <p className={`${ps.body} leading-relaxed`}>{senate_intel.significance}</p>
      </div>

      <div>
        <h3 className={`${ps.h3} mb-3`}>Oversight Areas</h3>
        <ul className="space-y-1.5">
          {senate_intel.oversight_areas.map((area, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{area}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Post-Government</p>
        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">{senate_intel.post_government}</p>
      </div>
    </div>
  );
};

const TTSATab: FC = () => {
  const { ttsa_role } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Title</p>
          <p className={ps.value}>{ttsa_role.title}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Joined</p>
          <p className={ps.value}>{ttsa_role.joined}</p>
        </div>
        <div className={`${ps.infoCard} sm:col-span-2`}>
          <p className={`${ps.label} mb-1`}>Co-Founders</p>
          <p className={ps.value}>{ttsa_role.co_founders.join(', ')}</p>
        </div>
      </div>

      <div>
        <h3 className={`${ps.h3} mb-3`}>Primary Contributions</h3>
        <ul className="space-y-2">
          {ttsa_role.primary_contributions.map((c, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`${ps.borderCardLg} space-y-3`}>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">2017 Video Release</h3>
        <div>
          <p className={`${ps.label} mb-1`}>Videos</p>
          <div className="flex flex-wrap gap-1.5">
            {ttsa_role.video_release.videos.map((v, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-medium">{v}</span>
            ))}
          </div>
        </div>
        <div>
          <p className={`${ps.label} mb-1`}>Method</p>
          <p className={`${ps.body} leading-relaxed`}>{ttsa_role.video_release.method}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/30 rounded-lg p-3">
          <p className="text-xs font-medium text-green-700 dark:text-green-400 uppercase tracking-wide mb-0.5">Outcome</p>
          <p className="text-sm text-green-900 dark:text-green-100">{ttsa_role.video_release.outcome}</p>
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
        <p className={`${ps.body} leading-relaxed`}>{legislation.overview}</p>
      </div>

      <div>
        <h3 className={`${ps.h3} mb-3`}>Key Legislative Actions</h3>
        <div className={`${ps.timelineLine} space-y-4`}>
          {legislation.key_actions.map((item, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white dark:border-gray-800" />
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit">{item.year}</span>
                <span className={ps.body}>{item.action}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Assessment</p>
        <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">{legislation.assessment}</p>
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
            <div key={i} className={`${ps.borderCard} space-y-2`}>
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">{c.claim}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.classes}`}>{cfg.label}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{c.basis}</p>
              {c.notes && (
                <p className={`${ps.muted} italic`}>{c.notes}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DisclosuresTab: FC = () => (
  <SharedDisclosuresTab disclosures={data.disclosures} variant="card" introText="Chronological record of Mellon's public disclosures and advocacy actions." />
);

const NetworkTab: FC = () => (
  <SharedNetworkTab people={data.associated_people} introText="Key relationships in Mellon's disclosure network." />
);

const AssessmentTab: FC = () => (
  <SharedAssessmentTab
    credibility={data.credibility}
    methodologyNote="This section presents documented arguments for and against Mellon's credibility. DECUR does not adjudicate these claims; they are presented for methodological transparency."
  />
);

/* ─── Main component ──────────────────────────────────────────── */

const MellonProfile: FC<InsiderProfileProps> = ({ onBack, backLabel }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab />;
      case 'senate':      return <SenateTab />;
      case 'ttsa':        return <TTSATab />;
      case 'legislation': return <LegislationTab />;
      case 'claims':      return <ClaimsTab />;
      case 'disclosures': return <DisclosuresTab />;
      case 'career-network': {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const keyEvents = (data.profile.key_events ?? []).map((e: any) => ({ year: String(e.date ?? e.year ?? ''), event: e.event }));
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const careerConnections = (data as any).career_connections ?? [];
        return (
          <div className="space-y-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Career timeline with key connections. Dashed edges show cross-figure and program relationships. Scroll or pinch to zoom.
            </p>
            <FigureCareerFlow keyEvents={keyEvents} careerConnections={careerConnections} />
          </div>
        );
      }
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
      backLabel={backLabel}
    >
      {renderTab()}
    </ProfileShell>
  );
};

export default MellonProfile;
