import { FC, useState } from 'react';
import elizondoData from '../../data/key-figures/elizondo.json';
import type { ElizondoData } from '../../types/data';
import ProfileShell from './shared/ProfileShell';
import { ps } from './shared/profileStyles';
import MethodologyNote from './shared/MethodologyNote';
import { InsiderProfileProps } from '../../types/components';
import SharedAssessmentTab from './shared/tabs/SharedAssessmentTab';
import SharedDisclosuresTab from './shared/tabs/SharedDisclosuresTab';
import SharedNetworkTab from './shared/tabs/SharedNetworkTab';
import SharedCareerNetworkTab from './shared/tabs/SharedCareerNetworkTab';
import SharedOverviewTab from './shared/tabs/SharedOverviewTab';
import SharedClaimsTab from './shared/tabs/SharedClaimsTab';

const data = elizondoData as unknown as ElizondoData;

const TABS = [
  { id: 'overview',       label: 'Overview' },
  { id: 'aatip',          label: 'AATIP Program' },
  { id: 'observables',    label: '5 Observables' },
  { id: 'claims',         label: 'Claims' },
  { id: 'disclosures',    label: 'Disclosures' },
  { id: 'career-network', label: 'Career Network' },
  { id: 'network',        label: 'People' },
  { id: 'assessment',     label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

/* Tab components */

const AatipTab: FC = () => {
  const { aatip } = data;
  return (
    <div className="space-y-6">
      <div className={ps.accentBoxLg}>
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Program</p>
        <h3 className={`${ps.h3} mb-1`}>{aatip.full_name}</h3>
        <p className={ps.muted}>Est. {aatip.established} · Classification: {aatip.classification}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Official End Date</p>
          <p className={ps.value}>{aatip.ended_official}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Elizondo Claims Ended</p>
          <p className={ps.value}>{aatip.ended_claimed}</p>
        </div>
        <div className={`${ps.infoCard} sm:col-span-2`}>
          <p className={`${ps.label} mb-1`}>Funding</p>
          <p className={ps.value}>{aatip.funding}</p>
        </div>
        <div className={`${ps.infoCard} sm:col-span-2`}>
          <p className={`${ps.label} mb-1`}>Primary Contractor</p>
          <p className={ps.value}>{aatip.primary_contractor}</p>
        </div>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-3`}>Program Focus</h4>
        <p className={`${ps.body} leading-relaxed`}>{aatip.focus}</p>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-3`}>Key Findings</h4>
        <ul className="space-y-2">
          {aatip.key_findings.map((f, i) => (
            <li key={i} className={ps.listItem}>
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
        <p className={`${ps.bodyMuted} leading-relaxed`}>
          Elizondo&apos;s analytical framework identifying five consistent flight characteristics observed across UAP encounters studied under AATIP. These observables are not an official DoD classification but have been adopted widely in UAP research and policy discussions.
        </p>
      </div>
      <div className="space-y-4">
        {five_observables.map((obs, i) => (
          <div key={i} className={ps.borderCardLg}>
            <div className="flex items-start gap-3 mb-2">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded shrink-0">{i + 1}</span>
              <h4 className={ps.h4Inline}>{obs.name}</h4>
            </div>
            <p className={`${ps.body} leading-relaxed pl-10`}>{obs.description}</p>
          </div>
        ))}
      </div>
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

const ElizondoProfile: FC<InsiderProfileProps> = ({ onBack, backLabel, networkNodeId }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'overview':    return <SharedOverviewTab profile={data.profile as any} />;
      case 'aatip':       return <AatipTab />;
      case 'observables': return <ObservablesTab />;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'claims':      return <SharedClaimsTab claims={data.claims as any} />;
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

export default ElizondoProfile;
