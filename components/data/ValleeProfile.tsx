import { FC, useState } from 'react';
import dynamic from 'next/dynamic';
import valleeData from '../../data/key-figures/vallee.json';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import CredibilityBalance from './shared/CredibilityBalance';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';
import PersonCard from './shared/PersonCard';

const FigureCareerFlow = dynamic(() => import('./shared/FigureCareerFlow'), {
  ssr: false,
  loading: () => <div className="h-[440px] rounded-lg bg-gray-900 animate-pulse" />,
});

const data = valleeData as typeof valleeData;

const TABS = [
  { id: 'overview',          label: 'Overview' },
  { id: 'forbidden-science', label: 'Forbidden Science' },
  { id: 'theory',            label: 'Theory' },
  { id: 'nids',              label: 'NIDS' },
  { id: 'claims',            label: 'Claims' },
  { id: 'disclosures',       label: 'Disclosures' },
  { id: 'career-network',    label: 'Career Network' },
  { id: 'network',           label: 'Network' },
  { id: 'assessment',        label: 'Assessment' },
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
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Research Period</p>
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
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Education</p>
          <div className="flex flex-wrap gap-1.5 mt-1">
            {profile.education.map(e => (
              <span key={e} className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">{e}</span>
            ))}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">Career Background</h3>
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
        <div className="relative pl-6 border-l-2 border-gray-100 dark:border-gray-700 space-y-4">
          {profile.key_events.map((ev, i) => (
            <div key={i} className="relative">
              <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white dark:border-gray-800" />
              <div className="flex items-start gap-3">
                <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit whitespace-nowrap">{ev.date}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">{ev.event}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const ForbiddenScienceTab: FC = () => {
  const { forbidden_science } = data;
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{forbidden_science.historical_significance}</p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3">The Four Volumes</h3>
        <div className="space-y-2">
          {forbidden_science.volumes.map((vol, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <button
                className="w-full flex items-start justify-between gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
              >
                <div className="flex items-start gap-3">
                  <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit">{vol.published}</span>
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Vol. {vol.volume}: {vol.subtitle}</span>
                    <p className="text-xs text-gray-400 mt-0.5">Covers {vol.period_covered}</p>
                  </div>
                </div>
                <span className="text-gray-400 shrink-0 mt-0.5">{openIdx === i ? '▲' : '▼'}</span>
              </button>
              {openIdx === i && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700 pt-3">
                  <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{vol.summary}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Figures Documented</h3>
        <ul className="space-y-2">
          {forbidden_science.key_figures_documented.map((f, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const TheoryTab: FC = () => {
  const { theory } = data;
  return (
    <div className="space-y-6">
      <div className="border border-amber-200 dark:border-amber-800/30 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4">
        <p className="text-xs font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">ETH Critique</p>
        <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">{theory.eth_critique}</p>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Control System Hypothesis</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{theory.control_system_hypothesis}</p>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Interdimensional Hypothesis</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{theory.interdimensional_hypothesis}</p>
      </div>

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Magonia Framework</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{theory.magonia_framework}</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Materials Research Position</p>
        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">{theory.materials_research_position}</p>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Publications</h3>
        <div className="space-y-2">
          {theory.key_publications.map((pub, i) => (
            <div key={i} className="flex items-start gap-3 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
              <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0">{pub.year}</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{pub.title}</p>
                <p className="text-xs text-gray-500 mt-0.5">{pub.significance}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const NidsTab: FC = () => {
  const { nids_role } = data;
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Title</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{nids_role.title}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Period</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{nids_role.period}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Organization</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{nids_role.organization}</p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Founder</p>
          <p className="text-sm text-gray-800 dark:text-gray-200">{nids_role.founder}</p>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Contributions</h3>
        <ul className="space-y-2">
          {nids_role.contributions.map((c, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{c}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Bridge Significance</p>
        <p className="text-sm text-amber-900 dark:text-amber-100 leading-relaxed">{nids_role.significance}</p>
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
          const cfg = statusConfig[c.status] ?? { label: c.status, classes: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' };
          return (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">{c.claim}</p>
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
        <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{d.date}</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-medium">{d.type}</span>
            <span className="text-xs text-gray-400">{d.outlet}</span>
          </div>
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{d.description}</p>
        </div>
      ))}
    </div>
  );
};

const NetworkTab: FC = () => {
  const { associated_people } = data;
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Key relationships spanning six decades of UAP research.</p>
      {associated_people.map(person => (
        <PersonCard key={person.id} person={person} />
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
          <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-2">Supporting</h3>
          <ul className="space-y-2">
            {credibility.supporting.map((s, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-700 dark:text-gray-300">
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
              <li key={i} className="flex gap-2 text-xs text-gray-700 dark:text-gray-300">
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

const ValleeProfile: FC<InsiderProfileProps> = ({ onBack, backLabel }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':          return <OverviewTab />;
      case 'forbidden-science': return <ForbiddenScienceTab />;
      case 'theory':            return <TheoryTab />;
      case 'nids':              return <NidsTab />;
      case 'claims':            return <ClaimsTab />;
      case 'disclosures':       return <DisclosuresTab />;
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
      case 'network':           return <NetworkTab />;
      case 'assessment':        return <AssessmentTab />;
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

export default ValleeProfile;
