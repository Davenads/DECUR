import { FC, useState } from 'react';
import elizondoData from '../../data/elizondo.json';

const data = elizondoData as typeof elizondoData;

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'aatip',      label: 'AATIP Program' },
  { id: 'observables',label: '5 Observables' },
  { id: 'claims',     label: 'Claims' },
  { id: 'disclosures',label: 'Disclosures' },
  { id: 'network',    label: 'Network' },
  { id: 'assessment', label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

interface ElizondoProfileProps {
  onBack: () => void;
}

/* Status badge config */
const statusConfig: Record<string, { label: string; classes: string }> = {
  'unverified':             { label: 'Unverified',             classes: 'bg-gray-100 text-gray-600' },
  'partially-verified':     { label: 'Partially Verified',     classes: 'bg-blue-100 text-blue-700' },
  'disputed':               { label: 'Disputed',               classes: 'bg-amber-100 text-amber-700' },
  'partially-contradicted': { label: 'Partially Contradicted', classes: 'bg-red-100 text-red-600'   },
  'verified':               { label: 'Verified',               classes: 'bg-green-100 text-green-700'},
};

/* Claims status bar config */
const statusBarConfig: Array<{ key: string; label: string; bar: string; dot: string }> = [
  { key: 'verified',               label: 'Verified',               bar: 'bg-green-500', dot: 'bg-green-500' },
  { key: 'partially-verified',     label: 'Partially Verified',     bar: 'bg-blue-400',  dot: 'bg-blue-400'  },
  { key: 'unverified',             label: 'Unverified',             bar: 'bg-gray-300',  dot: 'bg-gray-400'  },
  { key: 'disputed',               label: 'Disputed',               bar: 'bg-amber-400', dot: 'bg-amber-400' },
  { key: 'partially-contradicted', label: 'Partially Contradicted', bar: 'bg-red-400',   dot: 'bg-red-400'   },
];

interface ClaimsStatusBarProps { claims: Array<{ status: string }> }

const ClaimsStatusBar: FC<ClaimsStatusBarProps> = ({ claims }) => {
  const total = claims.length;
  const counts = statusBarConfig
    .map(s => ({ ...s, count: claims.filter(c => c.status === s.key).length }))
    .filter(s => s.count > 0);
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Claims Verification Overview</p>
        <span className="text-xs text-gray-400">{total} total claims</span>
      </div>
      <div className="flex h-3 rounded-full overflow-hidden gap-px">
        {counts.map(s => (
          <div key={s.key} className={`${s.bar} transition-all`}
            style={{ width: `${(s.count / total) * 100}%` }} title={`${s.label}: ${s.count}`} />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5">
        {counts.map(s => (
          <div key={s.key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
            <span className="text-xs text-gray-600">{s.label}</span>
            <span className="text-xs font-semibold text-gray-800">{s.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

/* Credibility balance */
interface CredibilityBalanceProps { supporting: number; contradicting: number }

const CredibilityBalance: FC<CredibilityBalanceProps> = ({ supporting, contradicting }) => {
  const total = supporting + contradicting;
  const supPct = total > 0 ? (supporting / total) * 100 : 50;
  const conPct = total > 0 ? (contradicting / total) * 100 : 50;
  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Credibility Balance</p>
        <span className="text-xs text-gray-400">{total} arguments documented</span>
      </div>
      <div className="flex h-4 rounded-full overflow-hidden gap-px">
        <div className="bg-green-500 flex items-center justify-center transition-all"
          style={{ width: `${supPct}%` }} title={`Supporting: ${supporting}`}>
          {supPct > 15 && <span className="text-xs text-white font-bold">{supporting}</span>}
        </div>
        <div className="bg-red-400 flex items-center justify-center transition-all"
          style={{ width: `${conPct}%` }} title={`Contradicting: ${contradicting}`}>
          {conPct > 15 && <span className="text-xs text-white font-bold">{contradicting}</span>}
        </div>
      </div>
      <div className="flex justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
          <span className="text-gray-600">Supporting</span>
          <span className="font-semibold text-gray-800">{supporting}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-gray-800">{contradicting}</span>
          <span className="text-gray-600">Against</span>
          <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
        </div>
      </div>
    </div>
  );
};

/* Tab components */

const OverviewTab: FC = () => {
  const { profile } = data;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Background</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{profile.summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Service Period</p>
          <p className="text-sm text-gray-800">{profile.service_period}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Clearance</p>
          <p className="text-sm text-gray-800">{profile.clearance}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Organizations</p>
          <p className="text-sm text-gray-800">{profile.organizations.join(' · ')}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Roles</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {profile.roles.map(r => (
              <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{r}</span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Career Background</h3>
        <ul className="space-y-1.5">
          {profile.early_career.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Events</h3>
        <div className="relative pl-6 border-l-2 border-gray-100 space-y-4">
          {profile.key_events.map((ev, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white" />
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit whitespace-nowrap">{ev.year}</span>
                <span className="text-sm text-gray-700">{ev.event}</span>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{aatip.full_name}</h3>
        <p className="text-xs text-gray-400">Est. {aatip.established} · Classification: {aatip.classification}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Official End Date</p>
          <p className="text-sm text-gray-800">{aatip.ended_official}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Elizondo Claims Ended</p>
          <p className="text-sm text-gray-800">{aatip.ended_claimed}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Funding</p>
          <p className="text-sm text-gray-800">{aatip.funding}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Primary Contractor</p>
          <p className="text-sm text-gray-800">{aatip.primary_contractor}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Program Focus</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{aatip.focus}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Key Findings</h4>
        <ul className="space-y-2">
          {aatip.key_findings.map((f, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Contested Claim</p>
        <p className="text-sm text-amber-900">{aatip.controversy}</p>
      </div>
    </div>
  );
};

const ObservablesTab: FC = () => {
  const { five_observables } = data;
  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Elizondo's analytical framework identifying five consistent flight characteristics observed across UAP encounters studied under AATIP. These observables are not an official DoD classification but have been adopted widely in UAP research and policy discussions.
        </p>
      </div>
      <div className="space-y-4">
        {five_observables.map((obs, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-5">
            <div className="flex items-start gap-3 mb-2">
              <span className="font-mono text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded shrink-0">{i + 1}</span>
              <h4 className="font-semibold text-gray-900 text-sm">{obs.name}</h4>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed pl-10">{obs.description}</p>
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
        const cfg = statusConfig[claim.status] ?? { label: claim.status, classes: 'bg-gray-100 text-gray-600' };
        return (
          <div key={claim.id} className="border border-gray-200 rounded-lg p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{claim.category}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.classes}`}>{cfg.label}</span>
            </div>
            <p className="text-sm text-gray-800 leading-relaxed">{claim.claim}</p>
            {claim.notes && (
              <p className="text-xs text-gray-500 border-t border-gray-100 pt-3">{claim.notes}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

const typeLabel: Record<string, string> = {
  'print':                'Print',
  'television':           'Television',
  'podcast':              'Podcast',
  'documentary':          'Documentary',
  'congressional-testimony': 'Congressional Testimony',
  'formal-complaint':     'Formal Complaint',
  'declassification':     'Declassification',
  'written':              'Book / Written',
};

const DisclosuresTab: FC = () => {
  const { disclosures } = data;
  return (
    <div className="space-y-4">
      {disclosures.map((d, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-5 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <span className="font-mono text-xs text-gray-400">{d.date}</span>
              <span className="mx-2 text-gray-200">·</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {typeLabel[d.type] ?? d.type}
              </span>
            </div>
          </div>
          <h4 className="font-semibold text-gray-900 text-sm">{d.title}</h4>
          <p className="text-xs text-gray-500">{d.outlet}</p>
          {d.notes && <p className="text-xs text-gray-600 leading-relaxed border-t border-gray-100 pt-2">{d.notes}</p>}
        </div>
      ))}
    </div>
  );
};

const NetworkTab: FC = () => {
  const { associated_people } = data;
  return (
    <div className="space-y-4">
      {associated_people.map(person => (
        <div key={person.id} className="border border-gray-200 rounded-lg p-5">
          <h4 className="font-semibold text-gray-900 mb-0.5">{person.name}</h4>
          <p className="text-xs text-primary mb-2">{person.role}</p>
          <p className="text-sm text-gray-700 leading-relaxed">{person.relationship}</p>
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

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Methodology Note</p>
        <p className="text-sm text-amber-900">
          This section documents arguments for and against Elizondo's credibility based on publicly available evidence, official statements, and independent corroboration. DECUR does not adjudicate these claims.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          Supporting Arguments
        </h4>
        <div className="space-y-3">
          {credibility.supporting.map((arg, i) => (
            <div key={i} className="border border-green-100 bg-green-50/50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{arg}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Arguments Against
        </h4>
        <div className="space-y-3">
          {credibility.contradicting.map((arg, i) => (
            <div key={i} className="border border-red-100 bg-red-50/50 rounded-lg p-4">
              <p className="text-sm text-gray-700">{arg}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* Main component */

const ElizondoProfile: FC<ElizondoProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab />;
      case 'aatip':       return <AatipTab />;
      case 'observables': return <ObservablesTab />;
      case 'claims':      return <ClaimsTab />;
      case 'disclosures': return <DisclosuresTab />;
      case 'network':     return <NetworkTab />;
      case 'assessment':  return <AssessmentTab />;
    }
  };

  return (
    <div>
      <div className="mb-5">
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-primary transition-colors mb-3 flex items-center gap-1"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Insiders
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold font-heading text-gray-900">{data.profile.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              {data.profile.roles[0]}, {data.profile.service_period}
            </p>
          </div>
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium shrink-0">
            Case File
          </span>
        </div>
      </div>

      <div className="flex gap-1 flex-wrap mb-6 border-b border-gray-200 pb-0">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div>{renderTab()}</div>
    </div>
  );
};

export default ElizondoProfile;
