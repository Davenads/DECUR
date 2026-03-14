import { FC, useState } from 'react';
import puthoffData from '../../data/key-figures/puthoff.json';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import CredibilityBalance from './shared/CredibilityBalance';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';

const data = puthoffData as typeof puthoffData;

const TABS = [
  { id: 'overview',   label: 'Overview' },
  { id: 'stargate',   label: 'STARGATE' },
  { id: 'dirds',      label: 'AAWSAP / DIRDs' },
  { id: 'physics',    label: 'Physics' },
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
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Background</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{profile.summary}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Service Period</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{profile.service_period}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Clearance</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{profile.clearance}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Organizations</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{profile.organizations.join(' · ')}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Roles</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {profile.roles.map(r => (
              <span key={r} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{r}</span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Education</h3>
        <ul className="space-y-1.5">
          {profile.education.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Early Career</h3>
        <ul className="space-y-1.5">
          {profile.early_career.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Events</h3>
        <div className="space-y-2">
          {profile.key_events.map((ev, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit">{ev.date}</span>
              <span className="text-gray-700 dark:text-gray-300">{ev.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StargateTab: FC = () => {
  const { stargate } = data;
  return (
    <div className="space-y-6">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Program</p>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-0.5">{stargate.official_name}</h3>
        <p className="text-xs text-gray-400">{stargate.period} · {stargate.funding_agencies.join(', ')}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Puthoff Role</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{stargate.puthoff_role}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Budget (est.)</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{stargate.budget}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Location</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{stargate.location}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Predecessor Programs</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{stargate.predecessor_programs.join(' · ')}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Principal Viewers</h4>
        <ul className="space-y-2">
          {stargate.principal_viewers.map((v, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{v}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Key Findings</h4>
        <div className="space-y-2">
          {stargate.key_findings.map((f, i) => (
            <div key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Declassification</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">{stargate.declassification}</p>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">AIR Review (1995)</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">{stargate.air_review}</p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Controversy</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">{stargate.controversy}</p>
      </div>
    </div>
  );
};

const DirdsTab: FC = () => {
  const { aawsap_dirds: dirds } = data;
  const [expanded, setExpanded] = useState<number | null>(null);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Program</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{dirds.program}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Period</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{dirds.period}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Contracting Agency</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{dirds.contracting_agency}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Puthoff Authored</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{dirds.puthoff_authored} of {dirds.total_dirds} total</p>
        </div>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Significance</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">{dirds.significance}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Key Documents</h4>
        <div className="space-y-2">
          {dirds.documents.map((doc, i) => {
            const isOpen = expanded === i;
            return (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-sm pr-4">{doc.title}</span>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3 space-y-2">
                    <p className="text-xs text-gray-500"><span className="font-medium">Author:</span> {doc.author}</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">{doc.significance}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const PhysicsTab: FC = () => {
  const { physics_research: phys } = data;
  const [expanded, setExpanded] = useState<number | null>(0);
  return (
    <div className="space-y-5">
      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Primary Focus</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">{phys.primary_focus}</p>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">EarthTech Mission</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">{phys.earthtech_mission}</p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-3">Key Theories</h4>
        <div className="space-y-2">
          {phys.key_theories.map((theory, i) => {
            const isOpen = expanded === i;
            return (
              <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpanded(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-medium text-gray-900 dark:text-gray-100 text-sm">{theory.name}</span>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">{theory.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <p className="text-xs text-gray-400 italic">{phys.publications_note}</p>
    </div>
  );
};

const ClaimsTab: FC = () => {
  const { claims } = data;
  return (
    <div className="space-y-5">
      <ClaimsStatusBar claims={claims} />
      {claims.map(c => {
        const cfg = statusConfig[c.status] ?? { label: c.status, classes: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' };
        return (
          <div key={c.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide">{c.category}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.classes}`}>{cfg.label}</span>
            </div>
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{c.claim}</p>
            {c.notes && <p className="text-xs text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3">{c.notes}</p>}
          </div>
        );
      })}
    </div>
  );
};

const DisclosuresTab: FC = () => {
  const { disclosures } = data;

  const typeBadges: Record<string, string> = {
    'academic-paper':    'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
    'declassification':  'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
    'government-document': 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-400',
    'press-release':     'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
    'conference':        'bg-purple-100 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400',
    'documentary':       'bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-400',
  };

  const typeLabels: Record<string, string> = {
    'academic-paper':    'Academic Paper',
    'declassification':  'Declassification',
    'government-document': 'Gov. Document',
    'press-release':     'Press Release',
    'conference':        'Conference',
    'documentary':       'Documentary',
  };

  return (
    <div className="space-y-3">
      {disclosures.map((d, i) => (
        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <span className="font-mono text-xs text-gray-400 whitespace-nowrap mt-0.5 pt-px">{d.date}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">{d.title}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 whitespace-nowrap ${typeBadges[d.type] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'}`}>
                  {typeLabels[d.type] ?? d.type}
                </span>
              </div>
              <p className="text-xs text-gray-500 mb-1">{d.outlet}</p>
              {d.notes && <p className="text-xs text-gray-500 italic">{d.notes}</p>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

const NetworkTab: FC = () => {
  const { associated_people } = data;
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Key figures in Puthoff's professional and research network.</p>
      {associated_people.map(person => (
        <div key={person.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm">{person.name}</p>
          <p className="text-xs text-primary mb-2">{person.role}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">{person.relationship}</p>
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
          Puthoff's credibility is best understood in two separate tracks: his documented government work (STARGATE, AAWSAP DIRDs) which is verifiable and substantial, and his claims about retrieved craft and insider knowledge which go beyond public documentation. The two should not be conflated.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          Supporting Arguments
        </h4>
        <div className="space-y-2">
          {credibility.supporting.map((arg, i) => (
            <div key={i} className="border border-green-100 dark:border-green-800/30 bg-green-50/50 dark:bg-green-900/20 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">{arg}</p>
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
          {credibility.contradicting.map((arg, i) => (
            <div key={i} className="border border-red-100 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/20 rounded-lg p-3">
              <p className="text-sm text-gray-700 dark:text-gray-300">{arg}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Component ──────────────────────────────────────────── */

const PuthoffProfile: FC<InsiderProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab />;
      case 'stargate':    return <StargateTab />;
      case 'dirds':       return <DirdsTab />;
      case 'physics':     return <PhysicsTab />;
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

export default PuthoffProfile;
