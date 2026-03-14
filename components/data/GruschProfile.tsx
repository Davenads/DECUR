import { FC, useState } from 'react';
import gruschData from '../../data/key-figures/grusch.json';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import CredibilityBalance from './shared/CredibilityBalance';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';

const data = gruschData as typeof gruschData;

const TABS = [
  { id: 'overview',     label: 'Overview' },
  { id: 'claims',       label: 'Claims' },
  { id: 'disclosures',  label: 'Disclosures' },
  { id: 'legislative',  label: 'Legislative Impact' },
  { id: 'network',      label: 'Network' },
  { id: 'assessment',   label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

/* ─── Tabs ───────────────────────────────────────────────────── */

const OverviewTab: FC = () => {
  const { profile } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-1">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Service Period</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{profile.service_period}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-1">
          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium">Clearance</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">{profile.clearance}</p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">{profile.summary}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Education</h4>
        <ul className="space-y-1.5">
          {profile.education.map((e, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex gap-2">
              <span className="text-gray-300 mt-0.5 shrink-0">›</span>{e}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Organizations</h4>
        <div className="flex flex-wrap gap-1.5">
          {profile.organizations.map((o, i) => (
            <span key={i} className="text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 px-2.5 py-1 rounded-full">{o}</span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Career Timeline</h4>
        <div className="relative pl-5 border-l-2 border-gray-100 dark:border-gray-700 space-y-4">
          {profile.key_events.map((e, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[1.4rem] top-1 w-2.5 h-2.5 rounded-full bg-primary border-2 border-white dark:border-gray-800" />
              <p className="text-xs font-mono text-gray-400 mb-0.5">{e.date}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{e.event}</p>
            </div>
          ))}
        </div>
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
            <div key={claim.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide capitalize">
                  {claim.category.replace(/-/g, ' ')}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.classes}`}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-sm text-gray-800 dark:text-gray-200 mb-2">{claim.claim}</p>
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

const DisclosuresTab: FC = () => {
  const { disclosures } = data;
  const typeColors: Record<string, string> = {
    'formal-complaint':      'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    'print':                 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    'television':            'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    'congressional-testimony':'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Chronological record of Grusch&apos;s public disclosures and formal complaint filings.
      </p>
      <div className="relative pl-6 border-l-2 border-gray-100 dark:border-gray-700 space-y-4">
        {disclosures.map((d, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white dark:border-gray-800" />
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{d.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{d.outlet}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="font-mono text-xs text-gray-400">{d.date}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${typeColors[d.type] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                    {d.type.replace(/-/g, ' ')}
                  </span>
                </div>
              </div>
              {d.interviewer && (
                <p className="text-xs text-gray-500 mb-1">Interviewer / Recipient: {d.interviewer}</p>
              )}
              {d.notes && (
                <p className="text-xs text-gray-500 italic mt-2">{d.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">UAP Disclosure Act</h4>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
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
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">2024 NDAA Provisions</h4>
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-xs text-gray-400 mb-1">Enacted {legislative_impact.ndaa_2024.enacted}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{legislative_impact.ndaa_2024.provisions}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Government Response</h4>
        <div className="space-y-3">
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">AARO Historical Record Report</p>
              <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium shrink-0">Contradicts</span>
            </div>
            <p className="text-xs text-gray-400 mb-1">Released {government_response.aaro_historical_report.released}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{government_response.aaro_historical_report.conclusion}</p>
            <p className="text-xs text-gray-500 italic border-t border-gray-100 dark:border-gray-700 pt-2">
              KONA BLUE: {government_response.aaro_historical_report.kona_blue_finding}
            </p>
          </div>
          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <div className="flex items-start justify-between gap-3 mb-2">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">ICIG Assessment</p>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium shrink-0">Supports</span>
            </div>
            <p className="text-xs text-gray-400 mb-1">{government_response.icig_assessment.assessor}</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{government_response.icig_assessment.finding}</p>
            <p className="text-xs text-gray-500 italic border-t border-gray-100 dark:border-gray-700 pt-2 mt-2">{government_response.icig_assessment.action}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const NetworkTab: FC = () => {
  const { associated_people } = data;
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Key individuals connected to Grusch&apos;s disclosure and the broader UAP transparency movement.
      </p>
      {associated_people.map(person => (
        <div key={person.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-0.5">{person.name}</h4>
          <p className="text-xs text-primary font-medium mb-2">{person.role}</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{person.relationship}</p>
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

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Methodology Note</p>
        <p className="text-sm text-amber-900 dark:text-amber-100">
          This section presents documented arguments for and against Grusch&apos;s credibility based on
          verifiable institutional responses, journalistic findings, and official government positions.
          DECUR does not adjudicate these claims; they are presented for methodological transparency.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          Supporting Arguments
        </h4>
        <div className="space-y-2">
          {credibility.supporting.map((item, i) => (
            <div key={i} className="flex gap-2 border border-green-100 dark:border-green-800/30 bg-green-50/50 dark:bg-green-900/20 rounded-lg p-3">
              <span className="text-green-500 mt-0.5 shrink-0">✓</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Arguments Against
        </h4>
        <div className="space-y-2">
          {credibility.contradicting.map((item, i) => (
            <div key={i} className="flex gap-2 border border-red-100 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/20 rounded-lg p-3">
              <span className="text-red-400 mt-0.5 shrink-0">✗</span>
              <p className="text-sm text-gray-700 dark:text-gray-300">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Sources</h4>
        <div className="space-y-2">
          {data.sources.map((src, i) => (
            <div key={i} className="flex items-start justify-between gap-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{src.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 capitalize">{src.type.replace(/-/g, ' ')} · {src.notes}</p>
              </div>
              <a href={src.url} target="_blank" rel="noopener noreferrer"
                className="text-xs text-primary hover:underline whitespace-nowrap shrink-0">
                View ↗
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */

const GruschProfile: FC<InsiderProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab />;
      case 'claims':      return <ClaimsTab />;
      case 'disclosures': return <DisclosuresTab />;
      case 'legislative': return <LegislativeTab />;
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

export default GruschProfile;
