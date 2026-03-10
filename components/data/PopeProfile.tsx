import { FC, useState } from 'react';
import popeData from '../../data/pope.json';
import ProfileTabBar from './shared/ProfileTabBar';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import CredibilityBalance from './shared/CredibilityBalance';
import { statusConfig } from './shared/profileConstants';

const data = popeData as typeof popeData;

const TABS = [
  { id: 'overview',       label: 'Overview' },
  { id: 'mod-role',       label: 'MoD Role' },
  { id: 'investigations', label: 'Investigations' },
  { id: 'claims',         label: 'Claims' },
  { id: 'disclosures',    label: 'Disclosures' },
  { id: 'network',        label: 'Network' },
  { id: 'assessment',     label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

interface PopeProfileProps {
  onBack: () => void;
}

/* ─── Tab components ──────────────────────────────────────────── */

const OverviewTab: FC = () => {
  const { profile } = data;
  return (
    <div className="space-y-6">
      {/* Government investigator context banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs font-bold text-blue-700 uppercase tracking-wide mb-1">Government Investigator</p>
        <p className="text-sm text-blue-900 leading-relaxed">
          Pope ran the UK Ministry of Defence&apos;s official UAP investigation desk — a documented government role with Top Secret access — making him the closest British equivalent to Luis Elizondo. He entered the role as a skeptic and left as a cautious believer in genuine unknowns.
        </p>
      </div>

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
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Career Background</h3>
        <ul className="space-y-1.5">
          {profile.career_background.map((item, i) => (
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

const ModRoleTab: FC = () => {
  const { mod_role } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Title</p>
          <p className="text-sm text-gray-800">{mod_role.title}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Period</p>
          <p className="text-sm text-gray-800">{mod_role.period}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Reporting To</p>
          <p className="text-sm text-gray-800">{mod_role.reporting_to}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Annual Caseload</p>
          <p className="text-sm text-gray-800">{mod_role.annual_caseload}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Access Level</p>
          <p className="text-sm text-gray-800">{mod_role.access_level}</p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Methodology</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{mod_role.methodology}</p>
      </div>

      <div className="border border-gray-200 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-900">Case Breakdown</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{mod_role.case_breakdown}</p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Key Outputs</h3>
        <ul className="space-y-2">
          {mod_role.key_outputs.map((o, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{o}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Historical Significance</p>
        <p className="text-sm text-amber-900 leading-relaxed">{mod_role.significance}</p>
      </div>
    </div>
  );
};

const InvestigationsTab: FC = () => {
  const { investigations } = data;
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-700 leading-relaxed">{investigations.overview}</p>

      <div className="space-y-3">
        {investigations.major_cases.map((c, i) => (
          <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
              onClick={() => setOpenIdx(openIdx === i ? null : i)}
            >
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit">{c.date}</span>
                <div>
                  <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                  <p className="text-xs text-gray-400 mt-0.5">{c.location}</p>
                </div>
              </div>
              <span className="text-gray-400 shrink-0 mt-0.5">{openIdx === i ? '▲' : '▼'}</span>
            </button>
            {openIdx === i && (
              <div className="px-4 pb-4 border-t border-gray-100 pt-3 space-y-3">
                <p className="text-sm text-gray-700 leading-relaxed">{c.description}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Witnesses</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{c.witnesses}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Evidence</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{c.evidence}</p>
                  </div>
                </div>
                <div className="border border-blue-100 bg-blue-50 rounded-lg p-3">
                  <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Pope&apos;s Assessment</p>
                  <p className="text-xs text-blue-900 leading-relaxed italic">&quot;{c.pope_assessment}&quot;</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-gray-400">Status:</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">{c.status}</span>
                </div>
              </div>
            )}
          </div>
        ))}
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
          const cfg = statusConfig[c.status] ?? { label: c.status, classes: 'bg-gray-100 text-gray-600' };
          return (
            <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-900 leading-snug">{c.claim}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.classes}`}>{cfg.label}</span>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">{c.basis}</p>
              {c.notes && (
                <p className="text-xs text-gray-400 italic">{c.notes}</p>
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
  return (
    <div className="space-y-4">
      {disclosures.map((d, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{d.date}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium">{d.type}</span>
            <span className="text-xs text-gray-400">{d.outlet}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{d.description}</p>
        </div>
      ))}
    </div>
  );
};

const NetworkTab: FC = () => {
  const { associated_people } = data;
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Key relationships spanning Pope&apos;s career across government investigation, witness testimony, and the disclosure community.</p>
      {associated_people.map((p, i) => (
        <div key={i} className="flex gap-3 border border-gray-200 rounded-lg p-4">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-primary">{p.name.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{p.name}</p>
            <p className="text-xs text-gray-500 leading-snug">{p.relation}</p>
          </div>
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-semibold text-green-700 mb-2">Supporting</h3>
          <ul className="space-y-2">
            {credibility.supporting.map((s, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-700">
                <span className="text-green-500 mt-0.5 shrink-0">+</span>
                <span>{s}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-red-600 mb-2">Contradicting</h3>
          <ul className="space-y-2">
            {credibility.contradicting.map((c, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-700">
                <span className="text-red-400 mt-0.5 shrink-0">-</span>
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/* ─── Main component ──────────────────────────────────────────── */

const PopeProfile: FC<PopeProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':       return <OverviewTab />;
      case 'mod-role':       return <ModRoleTab />;
      case 'investigations': return <InvestigationsTab />;
      case 'claims':         return <ClaimsTab />;
      case 'disclosures':    return <DisclosuresTab />;
      case 'network':        return <NetworkTab />;
      case 'assessment':     return <AssessmentTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <button
          onClick={onBack}
          className="text-sm text-gray-400 hover:text-gray-600 transition-colors mt-1 shrink-0"
        >
          ← Back
        </button>
        <div>
          <h2 className="text-2xl font-bold font-heading text-gray-900">{data.profile.name}</h2>
          <p className="text-sm text-primary font-medium mt-0.5">{data.profile.roles[0]}</p>
          <p className="text-xs text-gray-400 mt-0.5">{data.profile.service_period}</p>
        </div>
      </div>

      {/* Tabs */}
      <ProfileTabBar
        tabs={TABS as unknown as Array<{ id: string; label: string }>}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as TabId)}
      />

      {/* Tab content */}
      <div>{renderTab()}</div>
    </div>
  );
};

export default PopeProfile;
