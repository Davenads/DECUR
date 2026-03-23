import { FC, useState } from 'react';
import dynamic from 'next/dynamic';
import puthoffData from '../../data/key-figures/puthoff.json';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';
import SharedAssessmentTab from './shared/tabs/SharedAssessmentTab';
import SharedDisclosuresTab from './shared/tabs/SharedDisclosuresTab';
import SharedNetworkTab from './shared/tabs/SharedNetworkTab';

const FigureCareerFlow = dynamic(() => import('./shared/FigureCareerFlow'), {
  ssr: false,
  loading: () => <div className="h-[440px] rounded-lg bg-gray-900 animate-pulse" />,
});

const data = puthoffData as typeof puthoffData;

const TABS = [
  { id: 'overview',        label: 'Overview' },
  { id: 'stargate',        label: 'STARGATE' },
  { id: 'dirds',           label: 'AAWSAP / DIRDs' },
  { id: 'physics',         label: 'Physics' },
  { id: 'claims',          label: 'Claims' },
  { id: 'disclosures',     label: 'Disclosures' },
  { id: 'career-network',  label: 'Career Network' },
  { id: 'network',         label: 'Network' },
  { id: 'assessment',      label: 'Assessment' },
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

const DisclosuresTab: FC = () => (
  <SharedDisclosuresTab disclosures={data.disclosures} introText="Chronological record of Puthoff's public disclosures and research publications." />
);

const NetworkTab: FC = () => (
  <SharedNetworkTab people={data.associated_people} introText="Key figures in Puthoff's professional and research network." />
);

const AssessmentTab: FC = () => (
  <SharedAssessmentTab
    credibility={data.credibility}
    methodologyNote="This section evaluates Puthoff's credibility across two separate tracks: his verifiable remote viewing/psychotronics research and his UAP/NHI claims. DECUR does not adjudicate these claims."
  />
);

/* ─── Main Component ──────────────────────────────────────────── */

const PuthoffProfile: FC<InsiderProfileProps> = ({ onBack, backLabel }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab />;
      case 'stargate':    return <StargateTab />;
      case 'dirds':       return <DirdsTab />;
      case 'physics':     return <PhysicsTab />;
      case 'claims':      return <ClaimsTab />;
      case 'disclosures': return <DisclosuresTab />;
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
      backLabel={backLabel}
    >
      {renderTab()}
    </ProfileShell>
  );
};

export default PuthoffProfile;
