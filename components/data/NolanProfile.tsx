import { FC, useState } from 'react';
import dynamic from 'next/dynamic';
import nolanData from '../../data/key-figures/nolan.json';
import type { NolanData } from '../../types/data';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';
import SharedAssessmentTab from './shared/tabs/SharedAssessmentTab';
import SharedDisclosuresTab from './shared/tabs/SharedDisclosuresTab';
import SharedNetworkTab from './shared/tabs/SharedNetworkTab';
import { ps } from './shared/profileStyles';

const FigureCareerFlow = dynamic(() => import('./shared/FigureCareerFlow'), {
  ssr: false,
  loading: () => <div className="h-[440px] rounded-lg bg-gray-900 animate-pulse" />,
});

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
        <h3 className={`${ps.h3} mb-3`}>Education</h3>
        <ul className="space-y-1.5">
          {(profile.education ?? []).map((item, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className={`${ps.h3} mb-3`}>Early Career</h3>
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

const ClaimsTab: FC = () => {
  const { claims } = data;
  return (
    <div className="space-y-4">
      <ClaimsStatusBar claims={claims} />
      {claims.map(c => {
        const cfg = statusConfig[c.status] ?? { label: c.status, classes: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' };
        return (
          <div key={c.id} className={`${ps.borderCardLg} space-y-3`}>
            <div className="flex items-start justify-between gap-3">
              <p className={ps.label}>{c.category}</p>
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.classes}`}>
                {cfg.label}
              </span>
            </div>
            <p className={`${ps.value} leading-relaxed`}>{c.claim}</p>
            {c.notes && <p className="text-xs text-gray-500 border-t border-gray-100 dark:border-gray-700 pt-3">{c.notes}</p>}
          </div>
        );
      })}
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
      case 'overview':    return <OverviewTab />;
      case 'research':    return <ResearchTab />;
      case 'sol':         return <SolTab />;
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
