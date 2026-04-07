import { FC, useState } from 'react';
import nolanData from '../../data/key-figures/nolan.json';
import type { NolanData } from '../../types/data';
import ProfileShell from './shared/ProfileShell';
import { InsiderProfileProps } from '../../types/components';
import SharedAssessmentTab from './shared/tabs/SharedAssessmentTab';
import SharedDisclosuresTab from './shared/tabs/SharedDisclosuresTab';
import SharedNetworkTab from './shared/tabs/SharedNetworkTab';
import SharedCareerNetworkTab from './shared/tabs/SharedCareerNetworkTab';
import SharedOverviewTab from './shared/tabs/SharedOverviewTab';
import SharedClaimsTab from './shared/tabs/SharedClaimsTab';
import { ps } from './shared/profileStyles';

const data = nolanData as unknown as NolanData;

const TABS = [
  { id: 'overview',        label: 'Overview' },
  { id: 'research',        label: 'Research' },
  { id: 'sol',             label: 'Sol Foundation' },
  { id: 'claims',          label: 'Claims' },
  { id: 'disclosures',     label: 'Disclosures' },
  { id: 'career-network',  label: 'Career Network' },
  { id: 'network',         label: 'People' },
  { id: 'assessment',      label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

/* ─── Tab components ──────────────────────────────────────────── */

const ResearchTab: FC = () => {
  const { research } = data;
  const { cia_consultation: cia, publications, materials_analysis: mat } = research;
  return (
    <div className="space-y-8">

      {/* CIA Consultation */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">CIA Consultation — Brain Morphology Study</h3>
        </div>
        <div className={`${ps.borderCardLg} space-y-4`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
              <p className={`${ps.label} mb-0.5`}>Period</p>
              <p className={ps.value}>{cia.period}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
              <p className={`${ps.label} mb-0.5`}>Referring Agency</p>
              <p className={ps.value}>{cia.referring_agency}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
              <p className={`${ps.label} mb-0.5`}>Subject Count</p>
              <p className={ps.value}>{cia.subject_count}</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
              <p className={`${ps.label} mb-0.5`}>Method</p>
              <p className={ps.value}>{cia.method}</p>
            </div>
          </div>

          <div>
            <p className={`${ps.label} mb-1`}>Subject Profile</p>
            <p className={ps.body}>{cia.subject_profile}</p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4">
            <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Key Finding</p>
            <p className={ps.body}>{cia.key_finding}</p>
          </div>

          <div className={ps.accentBox}>
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Nolan Hypothesis</p>
            <p className={ps.body}>{cia.nolan_hypothesis}</p>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-lg p-4">
            <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Adverse Outcomes</p>
            <p className={ps.body}>{cia.adverse_outcomes}</p>
          </div>

          <p className={`${ps.muted} italic`}>{cia.classification_status}</p>
        </div>
      </div>

      {/* Publications */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <span className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Peer-Reviewed Publications</h3>
        </div>
        <div className="space-y-4">
          {publications.map((pub, i) => (
            <div key={i} className={ps.borderCardLg}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className={`${ps.h4Inline} mb-0.5`}>{pub.title}</p>
                  <p className={`${ps.muted} mb-1`}>{pub.journal} · {pub.year}</p>
                  <p className="text-xs text-gray-500 mb-3">Co-authors: {pub.co_authors.join(', ')}</p>
                  <p className={ps.body}>{pub.significance}</p>
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
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Materials Analysis</h3>
        </div>
        <div className={`${ps.borderCardLg} space-y-3`}>
          <p className={ps.body}>{mat.description}</p>
          <div className="bg-gray-50 dark:bg-gray-800 rounded p-3">
            <p className={`${ps.label} mb-1`}>Methods Used</p>
            <p className={ps.value}>{mat.methods_used}</p>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
            <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Public Statements</p>
            <p className={ps.body}>{mat.public_statements}</p>
          </div>
          <p className={`${ps.muted} italic`}>{mat.classification_note}</p>
        </div>
      </div>

    </div>
  );
};

const SolTab: FC = () => {
  const { sol_foundation: sol } = data;
  return (
    <div className="space-y-5">
      <div className={ps.accentBoxLg}>
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Organization</p>
        <h3 className={`${ps.h3} mb-0.5`}>{sol.full_name}</h3>
        <p className={ps.muted}>{sol.affiliation} · Est. {sol.established}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Nolan Role</p>
          <p className={ps.value}>{sol.nolan_role}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Co-Founders</p>
          <p className={ps.value}>{sol.co_founders.join(', ')}</p>
        </div>
      </div>

      <div>
        <p className={`${ps.label} mb-1`}>Mission</p>
        <p className={ps.body}>{sol.mission}</p>
      </div>

      <div className={ps.borderCard}>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Inaugural Symposium</p>
        <p className={ps.body}>{sol.inaugural_symposium}</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Significance</p>
        <p className={ps.body}>{sol.significance}</p>
      </div>
    </div>
  );
};

const DisclosuresTab: FC = () => (
  <SharedDisclosuresTab disclosures={data.disclosures} variant="card" />
);

const NetworkTab: FC = () => (
  <SharedNetworkTab people={data.associated_people} introText="Key figures in Nolan's professional and advocacy network." />
);

const AssessmentTab: FC = () => (
  <SharedAssessmentTab
    credibility={data.credibility}
    methodologyNote="Nolan occupies a unique position: his institutional standing (Stanford, peer-reviewed publications) is the strongest of any public UAP figure, while some of his specific claims outpace his disclosed evidence. The credibility assessments here distinguish between his published/verifiable work and his more expansive public assertions."
  />
);

/* ─── Main Component ──────────────────────────────────────────── */

const NolanProfile: FC<InsiderProfileProps> = ({ onBack, backLabel, networkNodeId }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      case 'overview':    return <SharedOverviewTab profile={data.profile as any} />;
      case 'research':    return <ResearchTab />;
      case 'sol':         return <SolTab />;
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

export default NolanProfile;
