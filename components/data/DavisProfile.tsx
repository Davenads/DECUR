import { FC, useState } from 'react';
import davisData from '../../data/insiders/davis.json';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import CredibilityBalance from './shared/CredibilityBalance';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';

const data = davisData as typeof davisData;

const TABS = [
  { id: 'overview',   label: 'Overview' },
  { id: 'earthtech',  label: 'EarthTech' },
  { id: 'dirds',      label: 'AAWSAP / DIRDs' },
  { id: 'memo',       label: 'Wilson-Davis Memo' },
  { id: 'claims',     label: 'Claims' },
  { id: 'disclosures',label: 'Disclosures' },
  { id: 'network',    label: 'Network' },
  { id: 'assessment', label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

/* ─── Tab components ──────────────────────────────────────────── */

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

const EarthTechTab: FC = () => {
  const { earthtech } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Founded By</p>
          <p className="text-sm text-gray-800">{earthtech.founded_by}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Location</p>
          <p className="text-sm text-gray-800">{earthtech.location}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Also Known As</p>
          <p className="text-sm text-gray-800">{earthtech.also_known_as}</p>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">Mission</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{earthtech.mission}</p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">Davis Role</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{earthtech.davis_role}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">NIDS Connection</p>
        <p className="text-sm text-blue-900 leading-relaxed">{earthtech.nids_connection}</p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Key Research Areas</h3>
        <ul className="space-y-2">
          {earthtech.key_research_areas.map((area, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{area}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const DirdsTab: FC = () => {
  const { aawsap_dirds } = data;
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Contract</p>
          <p className="text-sm text-gray-800">{aawsap_dirds.contract}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Contractor</p>
          <p className="text-sm text-gray-800">{aawsap_dirds.contractor}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Period</p>
          <p className="text-sm text-gray-800">{aawsap_dirds.period}</p>
        </div>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-3">
        <span className="text-2xl font-bold text-primary">{aawsap_dirds.total_dirds}</span>
        <div>
          <p className="text-sm font-medium text-gray-800">Total DIRDs Produced</p>
          <p className="text-xs text-gray-500">Davis authored or co-authored {aawsap_dirds.davis_authored.length} of these documents</p>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-3">Davis-Authored Documents</h3>
        <div className="space-y-2">
          {aawsap_dirds.davis_authored.map((doc, i) => (
            <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit">{doc.year}</span>
                  <span className="text-sm font-medium text-gray-900 leading-snug">{doc.title}</span>
                </div>
                <span className="text-gray-400 shrink-0 mt-0.5">{openIdx === i ? '▲' : '▼'}</span>
              </button>
              {openIdx === i && (
                <div className="px-4 pb-4 space-y-2 border-t border-gray-100 pt-3">
                  <p className="text-xs text-gray-400 font-medium">{doc.author}</p>
                  <p className="text-sm text-gray-700 leading-relaxed">{doc.summary}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const MemoTab: FC = () => {
  const { wilson_davis_memo } = data;
  return (
    <div className="space-y-6">
      <div className="bg-amber-50 border border-amber-300 rounded-lg p-4">
        <p className="text-xs font-bold text-amber-700 uppercase tracking-wide mb-1">Disputed Document</p>
        <p className="text-sm text-amber-900 leading-relaxed">
          Admiral Wilson has publicly denied the meeting occurred as described. The memo has not been officially authenticated. Its contents are presented here as reported claims pending authoritative verification.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Date</p>
          <p className="text-sm text-gray-800">{wilson_davis_memo.date}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Location</p>
          <p className="text-sm text-gray-800">{wilson_davis_memo.location}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Publicly Leaked</p>
          <p className="text-sm text-gray-800">{wilson_davis_memo.leak_date} — {wilson_davis_memo.leak_source}</p>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">Context</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{wilson_davis_memo.context}</p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">Memo Origin</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{wilson_davis_memo.memo_origin}</p>
      </div>

      <div className="border border-gray-200 rounded-lg p-5 space-y-3">
        <h3 className="text-base font-semibold text-gray-900">Wilson's Account (as documented)</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{wilson_davis_memo.wilson_account}</p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">Program Description</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{wilson_davis_memo.program_description}</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Significance</p>
        <p className="text-sm text-blue-900 leading-relaxed">{wilson_davis_memo.significance}</p>
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
      <p className="text-sm text-gray-500">Key relationships in Davis's research and disclosure network.</p>
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

const DavisProfile: FC<InsiderProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab />;
      case 'earthtech':   return <EarthTechTab />;
      case 'dirds':       return <DirdsTab />;
      case 'memo':        return <MemoTab />;
      case 'claims':      return <ClaimsTab />;
      case 'disclosures': return <DisclosuresTab />;
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

export default DavisProfile;
