import { FC, useState } from 'react';
import dynamic from 'next/dynamic';
import nellData from '../../data/key-figures/nell.json';
import type { NellData } from '../../types/data';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';
import SharedAssessmentTab from './shared/tabs/SharedAssessmentTab';
import SharedNetworkTab from './shared/tabs/SharedNetworkTab';
import { ps } from './shared/profileStyles';
import BookmarkButton from '../bookmarks/BookmarkButton';

const FigureCareerFlow = dynamic(() => import('./shared/FigureCareerFlow'), {
  ssr: false,
  loading: () => <div className="h-[440px] rounded-lg bg-gray-900 animate-pulse" />,
});

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

const ClaimsTab: FC = () => {
  const { claims } = data;
  return (
    <div className="space-y-5">
      <ClaimsStatusBar claims={claims} />
      {claims.map(claim => {
        const cfg = statusConfig[claim.status] ?? { label: claim.status, classes: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' };
        return (
          <div key={claim.id} className={`${ps.borderCardLg} space-y-3`}>
            <div className="flex items-start justify-between gap-3">
              <p className={ps.label}>{claim.category}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.classes}`}>{cfg.label}</span>
            </div>
            <p className={`${ps.value} leading-relaxed`}>{claim.claim}</p>
            {claim.notes && (
              <p className="text-xs text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3">{claim.notes}</p>
            )}
          </div>
        );
      })}
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
      case 'overview':       return <OverviewTab />;
      case 'testimony':      return <TestimonyTab />;
      case 'claims':         return <ClaimsTab />;
      case 'sol-foundation': return <SolFoundationTab />;
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
      actions={<BookmarkButton contentType="figure" contentId={data.profile.id} contentName={data.profile.name} />}
      onBack={onBack}
      backLabel={backLabel}
      networkNodeId={networkNodeId}
    >
      {renderTab()}
    </ProfileShell>
  );
};

export default NellProfile;
