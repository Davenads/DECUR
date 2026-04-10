import { FC, useState } from 'react';
import gruschData from '../../data/key-figures/grusch.json';
import ProfileShell from './shared/ProfileShell';
import { ps } from './shared/profileStyles';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';
import SharedAssessmentTab from './shared/tabs/SharedAssessmentTab';
import SharedDisclosuresTab from './shared/tabs/SharedDisclosuresTab';
import SharedNetworkTab from './shared/tabs/SharedNetworkTab';
import SharedCareerNetworkTab from './shared/tabs/SharedCareerNetworkTab';
import TimelineList from './shared/TimelineList';

const data = gruschData as typeof gruschData;

const TABS = [
  { id: 'overview',        label: 'Overview' },
  { id: 'claims',          label: 'Claims' },
  { id: 'disclosures',     label: 'Disclosures' },
  { id: 'legislative',     label: 'Legislative Impact' },
  { id: 'career-network',  label: 'Career Network' },
  { id: 'network',         label: 'People' },
  { id: 'assessment',      label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

/* ─── Tabs ───────────────────────────────────────────────────── */

const OverviewTab: FC = () => {
  const { profile } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className={`${ps.infoCard} space-y-1`}>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Service Period</p>
          <p className={`font-semibold ${ps.value}`}>{profile.service_period}</p>
        </div>
        <div className={`${ps.infoCard} space-y-1`}>
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Clearance</p>
          <p className={`font-semibold ${ps.value}`}>{profile.clearance}</p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">{profile.summary}</p>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-3`}>Education</h4>
        <ul className="space-y-1.5">
          {profile.education.map((e, i) => (
            <li key={i} className={`${ps.body} flex gap-2`}>
              <span className="text-gray-300 mt-0.5 shrink-0">›</span>{e}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-3`}>Organizations</h4>
        <div className="flex flex-wrap gap-1.5">
          {profile.organizations.map((o, i) => (
            <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2.5 py-1 rounded-full">{o}</span>
          ))}
        </div>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-3`}>Career Timeline</h4>
        <TimelineList events={profile.key_events.map(e => ({ year: e.year, event: e.event }))} />
      </div>
    </div>
  );
};

const ClaimsTab: FC = () => {
  const { claims } = data;
  const [filter, setFilter] = useState<string>('all');
  const categories = Array.from(new Set(claims.map(c => c.category)));
  const filtered = filter === 'all' ? claims : claims.filter(c => c.category === filter);

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Structured inventory of Grusch&apos;s public claims with current verification status based on available evidence.
      </p>

      <ClaimsStatusBar claims={claims} />

      <div className="flex flex-wrap gap-1.5">
        <button onClick={() => setFilter('all')}
          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
          All
        </button>
        {categories.map(cat => (
          <button key={cat} onClick={() => setFilter(cat)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize transition-colors ${filter === cat ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}>
            {cat.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(claim => {
          const cfg = statusConfig[claim.status] ?? statusConfig['unverified'];
          return (
            <div key={claim.id} className={ps.borderCard}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className={`${ps.label} capitalize`}>
                  {claim.category.replace(/-/g, ' ')}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.classes}`}>
                  {cfg.label}
                </span>
              </div>
              <p className={`${ps.value} mb-2`}>{claim.claim}</p>
              {claim.notes && (
                <p className="text-xs text-gray-500 italic border-t border-gray-100 dark:border-gray-700 pt-2">{claim.notes}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DisclosuresTab: FC = () => (
  <SharedDisclosuresTab disclosures={data.disclosures} introText="Chronological record of Grusch's public disclosures and formal complaint filings." />
);

const LegislativeTab: FC = () => {
  const { legislative_impact, government_response } = data;
  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Note</p>
        <p className="text-sm text-blue-900 dark:text-blue-100">
          Grusch&apos;s testimony is the only UAP insider case to directly generate federal legislation and executive agency action. This section documents the concrete institutional response.
        </p>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-3`}>UAP Disclosure Act</h4>
        <div className={`${ps.borderCard} space-y-3`}>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">Schumer-Rounds UAP Disclosure Act</p>
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">Partially enacted</span>
          </div>
          <p className="text-xs text-gray-500">Introduced {legislative_impact.uap_disclosure_act.introduced} · Sponsored by {legislative_impact.uap_disclosure_act.sponsors.join(', ')}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 italic">{legislative_impact.uap_disclosure_act.framework}</p>
          <ul className="space-y-1">
            {legislative_impact.uap_disclosure_act.key_provisions.map((p, i) => (
              <li key={i} className="text-xs text-gray-700 dark:text-gray-300 flex gap-2">
                <span className="text-gray-300 shrink-0">·</span>{p}
              </li>
            ))}
          </ul>
          <p className="text-xs text-amber-700 dark:text-amber-400 italic border-t border-gray-100 dark:border-gray-700 pt-2">{legislative_impact.uap_disclosure_act.status}</p>
        </div>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-3`}>2024 NDAA Provisions</h4>
        <div className={ps.borderCard}>
          <p className="text-xs text-gray-400 mb-1">Enacted {legislative_impact.ndaa_2024.enacted}</p>
          <p className={ps.body}>{legislative_impact.ndaa_2024.provisions}</p>
        </div>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-3`}>Government Response</h4>
        <div className="space-y-3">
          <div className={ps.borderCard}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">AARO Historical Record Report</p>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium shrink-0">Contradicts</span>
            </div>
            <p className="text-xs text-gray-400 mb-1">Released {government_response.aaro_historical_report.released}</p>
            <p className={`${ps.body} mb-2`}>{government_response.aaro_historical_report.conclusion}</p>
            <p className="text-xs text-gray-500 italic border-t border-gray-100 dark:border-gray-700 pt-2">
              KONA BLUE: {government_response.aaro_historical_report.kona_blue_finding}
            </p>
          </div>
          <div className={ps.borderCard}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">ICIG Assessment</p>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium shrink-0">Supports</span>
            </div>
            <p className="text-xs text-gray-400 mb-1">{government_response.icig_assessment.assessor}</p>
            <p className={ps.body}>{government_response.icig_assessment.finding}</p>
            <p className="text-xs text-gray-500 italic border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">{government_response.icig_assessment.action}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const NetworkTab: FC = () => (
  <SharedNetworkTab people={data.associated_people} introText="Key individuals connected to Grusch's disclosure and the broader UAP transparency movement." />
);

const AssessmentTab: FC = () => (
  <SharedAssessmentTab
    credibility={data.credibility}
    methodologyNote="This section presents documented arguments for and against Grusch's credibility based on verifiable institutional responses, journalistic findings, and official government positions. DECUR does not adjudicate these claims; they are presented for methodological transparency."
    sources={data.sources}
  />
);

/* ─── Main Component ─────────────────────────────────────────── */

const GruschProfile: FC<InsiderProfileProps> = ({ onBack, backLabel, networkNodeId }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab />;
      case 'claims':      return <ClaimsTab />;
      case 'disclosures': return <DisclosuresTab />;
      case 'legislative': return <LegislativeTab />;
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

export default GruschProfile;
