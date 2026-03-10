import { FC, useState } from 'react';
import nellData from '../../data/insiders/nell.json';
import ProfileTabBar from './shared/ProfileTabBar';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import CredibilityBalance from './shared/CredibilityBalance';
import { statusConfig } from './shared/profileConstants';

const data = nellData as typeof nellData;

const TABS = [
  { id: 'overview',       label: 'Overview' },
  { id: 'testimony',      label: 'Testimony' },
  { id: 'claims',         label: 'Claims' },
  { id: 'sol-foundation', label: 'SOL Foundation' },
  { id: 'network',        label: 'Network' },
  { id: 'assessment',     label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

interface NellProfileProps {
  onBack: () => void;
}

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
                <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit whitespace-nowrap">{ev.date}</span>
                <span className="text-sm text-gray-700">{ev.event}</span>
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
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Congressional Hearing</p>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{testimony.hearing}</h3>
        <p className="text-xs text-gray-400">{testimony.date}</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Witnesses</p>
        <div className="flex flex-wrap gap-1.5">
          {testimony.witnesses.map((w, i) => (
            <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{w}</span>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">Key Statements</h4>
        <div className="space-y-3">
          {testimony.key_statements.map((stmt, i) => (
            <div key={i} className="border-l-4 border-primary/30 pl-4 py-1">
              <p className="text-sm text-gray-800 italic leading-relaxed">"{stmt}"</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Context</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{testimony.context}</p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Classification Constraints</p>
        <p className="text-sm text-amber-900">{testimony.classification_constraints}</p>
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

const SolFoundationTab: FC = () => {
  const { sol_foundation } = data;
  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Organization</p>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{sol_foundation.full_name}</h3>
        <p className="text-xs text-gray-400">Est. {sol_foundation.established} · {sol_foundation.affiliation}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Nell's Role</p>
          <p className="text-sm text-gray-800">{sol_foundation.nell_role}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Affiliation</p>
          <p className="text-sm text-gray-800">{sol_foundation.affiliation}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Co-Founders</p>
          <div className="flex flex-wrap gap-1.5">
            {sol_foundation.co_founders.map((f, i) => (
              <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{f}</span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Mission</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{sol_foundation.mission}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Inaugural Symposium</h4>
        <p className="text-sm text-gray-700 leading-relaxed">{sol_foundation.inaugural_symposium}</p>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">Significance</p>
        <p className="text-sm text-gray-700 leading-relaxed">{sol_foundation.significance}</p>
      </div>
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
          This section documents arguments for and against Nell's credibility based on publicly available evidence, official statements, and independent corroboration. DECUR does not adjudicate these claims.
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

const NellProfile: FC<NellProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':       return <OverviewTab />;
      case 'testimony':      return <TestimonyTab />;
      case 'claims':         return <ClaimsTab />;
      case 'sol-foundation': return <SolFoundationTab />;
      case 'network':        return <NetworkTab />;
      case 'assessment':     return <AssessmentTab />;
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

      <ProfileTabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />

      <div>{renderTab()}</div>
    </div>
  );
};

export default NellProfile;
