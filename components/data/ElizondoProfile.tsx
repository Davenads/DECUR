import { FC, useState } from 'react';
import dynamic from 'next/dynamic';
import elizondoData from '../../data/key-figures/elizondo.json';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import MethodologyNote from './shared/MethodologyNote';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';
import SharedAssessmentTab from './shared/tabs/SharedAssessmentTab';
import SharedDisclosuresTab from './shared/tabs/SharedDisclosuresTab';
import SharedNetworkTab from './shared/tabs/SharedNetworkTab';

const FigureCareerFlow = dynamic(() => import('./shared/FigureCareerFlow'), {
  ssr: false,
  loading: () => <div className="h-[440px] rounded-lg bg-gray-900 animate-pulse" />,
});

const data = elizondoData as typeof elizondoData;

const TABS = [
  { id: 'overview',       label: 'Overview' },
  { id: 'aatip',          label: 'AATIP Program' },
  { id: 'observables',    label: '5 Observables' },
  { id: 'claims',         label: 'Claims' },
  { id: 'disclosures',    label: 'Disclosures' },
  { id: 'career-network', label: 'Career Network' },
  { id: 'network',        label: 'Network' },
  { id: 'assessment',     label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

/* Tab components */

const OverviewTab: FC = () => {
  const { profile } = data;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Background</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{profile.summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Service Period</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{profile.service_period}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Clearance</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{profile.clearance}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Organizations</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{profile.organizations.join(' · ')}</p>
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Career Background</h3>
        <ul className="space-y-1.5">
          {profile.early_career.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Events</h3>
        <div className="relative pl-6 border-l-2 border-gray-100 dark:border-gray-700 space-y-4">
          {profile.key_events.map((ev, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white dark:border-gray-900" />
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit whitespace-nowrap">{ev.year}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{ev.event}</span>
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{aatip.full_name}</h3>
        <p className="text-xs text-gray-400">Est. {aatip.established} · Classification: {aatip.classification}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Official End Date</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{aatip.ended_official}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Elizondo Claims Ended</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{aatip.ended_claimed}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Funding</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{aatip.funding}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Primary Contractor</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{aatip.primary_contractor}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Program Focus</h4>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{aatip.focus}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Key Findings</h4>
        <ul className="space-y-2">
          {aatip.key_findings.map((f, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <MethodologyNote title="Contested Claim">{aatip.controversy}</MethodologyNote>
    </div>
  );
};

const ObservablesTab: FC = () => {
  const { five_observables } = data;
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Elizondo&apos;s analytical framework identifying five consistent flight characteristics observed across UAP encounters studied under AATIP. These observables are not an official DoD classification but have been adopted widely in UAP research and policy discussions.
        </p>
      </div>
      <div className="space-y-4">
        {five_observables.map((obs, i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
            <div className="flex items-start gap-3 mb-2">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded shrink-0">{i + 1}</span>
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{obs.name}</h4>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed pl-10">{obs.description}</p>
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
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{claim.claim}</p>
            {claim.notes && (
              <p className="text-xs text-gray-500 dark:text-gray-400 border-t border-gray-100 dark:border-gray-700 pt-3">{claim.notes}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const DisclosuresTab: FC = () => (
  <SharedDisclosuresTab disclosures={data.disclosures} />
);

const NetworkTab: FC = () => (
  <SharedNetworkTab people={data.associated_people} />
);

const AssessmentTab: FC = () => (
  <SharedAssessmentTab
    credibility={data.credibility}
    methodologyNote="This section documents arguments for and against Elizondo's credibility based on publicly available evidence, official statements, and independent corroboration. DECUR does not adjudicate these claims."
  />
);

/* Main component */

const ElizondoProfile: FC<InsiderProfileProps> = ({ onBack, backLabel }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab />;
      case 'aatip':       return <AatipTab />;
      case 'observables': return <ObservablesTab />;
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

export default ElizondoProfile;
