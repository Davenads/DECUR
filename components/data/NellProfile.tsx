import { FC, useState } from 'react';
import nellData from '../../data/key-figures/nell.json';
import type { NellData } from '../../types/data';
import ProfileShell from './shared/ProfileShell';
import { InsiderProfileProps } from '../../types/components';
import SharedAssessmentTab from './shared/tabs/SharedAssessmentTab';
import SharedNetworkTab from './shared/tabs/SharedNetworkTab';
import SharedCareerNetworkTab from './shared/tabs/SharedCareerNetworkTab';
import SharedOverviewTab from './shared/tabs/SharedOverviewTab';
import SharedClaimsTab from './shared/tabs/SharedClaimsTab';
import { ps } from './shared/profileStyles';

const data = nellData as unknown as NellData;

const TABS = [
  { id: 'overview',        label: 'Overview' },
  { id: 'testimony',       label: 'Testimony' },
  { id: 'claims',          label: 'Claims' },
  { id: 'sol-foundation',  label: 'SOL Foundation' },
  { id: 'career-network',  label: 'Career Network' },
  { id: 'network',         label: 'People' },
  { id: 'assessment',      label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

/* Tab components */

const TestimonyTab: FC = () => {
  const { testimony } = data;
  return (
    <div className="space-y-6">
      <div className={ps.accentBoxLg}>
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Congressional Hearing</p>
        <h3 className={`${ps.h3} mb-1`}>{testimony.hearing}</h3>
        <p className={ps.muted}>{testimony.date}</p>
      </div>

      <div className={ps.infoCard}>
        <p className={`${ps.label} mb-2`}>Witnesses</p>
        <div className="flex flex-wrap gap-1.5">
          {testimony.witnesses.map((w, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{w}</span>
          ))}
        </div>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-3`}>Key Statements</h4>
        <div className="space-y-3">
          {testimony.key_statements.map((stmt, i) => (
            <div key={i} className="border-l-4 border-primary/30 pl-4 py-1">
              <p className={`${ps.value} italic leading-relaxed`}>"{stmt}"</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-2`}>Context</h4>
        <p className={`${ps.body} leading-relaxed`}>{testimony.context}</p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Classification Constraints</p>
        <p className="text-sm text-amber-900 dark:text-amber-100">{testimony.classification_constraints}</p>
      </div>
    </div>
  );
};

const SolFoundationTab: FC = () => {
  const { sol_foundation } = data;
  return (
    <div className="space-y-6">
      <div className={ps.accentBoxLg}>
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Organization</p>
        <h3 className={`${ps.h3} mb-1`}>{sol_foundation.full_name}</h3>
        <p className={ps.muted}>Est. {sol_foundation.established} · {sol_foundation.affiliation}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Nell's Role</p>
          <p className={ps.value}>{sol_foundation.nell_role}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Affiliation</p>
          <p className={ps.value}>{sol_foundation.affiliation}</p>
        </div>
        <div className={`${ps.infoCard} sm:col-span-2`}>
          <p className={`${ps.label} mb-2`}>Co-Founders</p>
          <div className="flex flex-wrap gap-1.5">
            {sol_foundation.co_founders.map((f, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{f}</span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-2`}>Mission</h4>
        <p className={`${ps.body} leading-relaxed`}>{sol_foundation.mission}</p>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-2`}>Inaugural Symposium</h4>
        <p className={`${ps.body} leading-relaxed`}>{sol_foundation.inaugural_symposium}</p>
      </div>

      <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Significance</p>
        <p className={`${ps.body} leading-relaxed`}>{sol_foundation.significance}</p>
      </div>
    </div>
  );
};

const NetworkTab: FC = () => (
  <SharedNetworkTab people={data.associated_people} />
);

const AssessmentTab: FC = () => (
  <SharedAssessmentTab
    credibility={data.credibility}
    methodologyNote="This section presents documented arguments for and against Nell's credibility. DECUR does not adjudicate these claims; they are presented for methodological transparency."
  />
);

/* Main component */

const NellProfile: FC<InsiderProfileProps> = ({ onBack, backLabel, networkNodeId }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'overview':       return <SharedOverviewTab profile={data.profile as any} />;
      case 'testimony':      return <TestimonyTab />;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'claims':         return <SharedClaimsTab claims={data.claims as any} />;
      case 'sol-foundation': return <SolFoundationTab />;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'career-network': return <SharedCareerNetworkTab profile={data.profile} career_connections={(data as any).career_connections} />;
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

export default NellProfile;
