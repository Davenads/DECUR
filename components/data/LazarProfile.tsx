import { FC, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { LazarData } from '../../types/data';
import lazarData from '../../data/key-figures/lazar.json';
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
  loading: () => <div className="h-[440px] bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />,
});

const data = lazarData as LazarData;

const TABS = [
  { id: 'overview',        label: 'Overview' },
  { id: 'career-network',  label: 'Career Network' },
  { id: 'facility',        label: 'S-4 Facility' },
  { id: 'craft',           label: 'Craft & Technology' },
  { id: 'propulsion',      label: 'Propulsion' },
  { id: 'claims',          label: 'Claims' },
  { id: 'disclosures',     label: 'Disclosures' },
  { id: 'network',         label: 'Network' },
  { id: 'assessment',      label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

/* ─── Sub-views ──────────────────────────────────────────────── */

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
          <p className={`${ps.label} mb-1`}>Clearance (claimed)</p>
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
        <h3 className={`${ps.h3} mb-3`}>Early Life &amp; Background</h3>
        <ul className="space-y-1.5">
          {profile.early_life.map((item, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className={ps.h3}>Key Events</h3>
          <Link
            href="/data?category=events&source=lazar"
            className="text-xs text-primary hover:underline flex items-center gap-1"
          >
            View S-4 timeline events
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="space-y-2">
          {profile.key_events.map((ev, i) => (
            <div key={i} className="flex gap-3 text-sm">
              <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded shrink-0 h-fit whitespace-nowrap">
                {ev.date}
              </span>
              <span className="text-gray-700 dark:text-gray-300">{ev.event}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const FacilityTab: FC = () => {
  const { facility } = data;
  return (
    <div className="space-y-6">
      <div>
        <h3 className={`${ps.h3} mb-1`}>{facility.name}</h3>
        <p className={`${ps.muted} mb-1`}>{facility.aliases.join(' · ')}</p>
        <p className={ps.bodyMuted}>{facility.location}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Access Method</p>
          <p className={ps.value}>{facility.access}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={`${ps.label} mb-1`}>Hangar Bays</p>
          <p className={ps.value}>{facility.hangar_count} bays, one craft per bay (claimed)</p>
        </div>
        <div className={`${ps.infoCard} sm:col-span-2`}>
          <p className={`${ps.label} mb-1`}>Construction</p>
          <p className={ps.value}>{facility.construction}</p>
        </div>
      </div>

      <div>
        <h4 className={`${ps.h4} mb-2`}>Security Protocols</h4>
        <ul className="space-y-1.5">
          {facility.security.map((s, i) => (
            <li key={i} className={ps.listItem}>
              <span className="text-red-400 mt-0.5 shrink-0">■</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className={ps.accentBox}>
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Lazar&apos;s Account</p>
        <p className={`${ps.body} leading-relaxed`}>{facility.lazar_account}</p>
      </div>
    </div>
  );
};

const CraftTab: FC = () => {
  const { crafts } = data;
  return (
    <div className="space-y-6">
      <div className={ps.infoCard}>
        <p className={`${ps.label} mb-1`}>Total Craft at S-4</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{crafts.total_count}</p>
        <p className="text-xs text-gray-500 mt-0.5">One per hangar bay, all described as disc-shaped</p>
      </div>

      <div>
        <p className={`${ps.label} mb-3`}>Primary Assignment</p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
          {crafts.primary_studied}
        </div>
      </div>

      <div className="space-y-4">
        {crafts.descriptions.map((craft, i) => (
          <div key={i} className={ps.borderCardLg}>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">{craft.designation}</h4>
            <p className={`${ps.body} mb-3`}>{craft.description}</p>
            {craft.diameter_estimate && (
              <div className="flex items-center gap-2">
                <span className={ps.label}>Diameter (claimed):</span>
                <span className="text-xs text-gray-700 dark:text-gray-300">{craft.diameter_estimate}</span>
              </div>
            )}
            {craft.notes && (
              <p className="text-xs text-gray-500 italic mt-2">{craft.notes}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const PropulsionTab: FC = () => {
  const { propulsion } = data;
  const [expandedMode, setExpandedMode] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h3 className={`${ps.h3} mb-2`}>Overview</h3>
        <p className={`${ps.body} leading-relaxed`}>{propulsion.overview}</p>
      </div>

      {/* Element 115 */}
      <div className={ps.borderCardLg}>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">Fuel Source</h4>
            <p className={`${ps.muted} mt-0.5`}>{propulsion.fuel.element}</p>
          </div>
          <span className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 rounded-full font-medium shrink-0">
            Element 115
          </span>
        </div>
        <p className={`${ps.body} mb-2`}>{propulsion.fuel.claim}</p>
        <p className={`${ps.bodyMuted} mb-2`}>{propulsion.fuel.context}</p>
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 rounded p-3 mt-2">
          <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Significance</p>
          <p className={ps.body}>{propulsion.fuel.significance}</p>
        </div>
      </div>

      {/* Reactor */}
      <div className={ps.borderCardLg}>
        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">Reactor</h4>
        <p className={`${ps.body} mb-2`}>{propulsion.reactor.description}</p>
        <p className={ps.bodyMuted}>{propulsion.reactor.output}</p>
      </div>

      {/* Gravity Amplifiers */}
      <div className={ps.borderCardLg}>
        <div className="flex items-center gap-3 mb-3">
          <h4 className="font-semibold text-gray-900 dark:text-gray-100">Gravity Amplifiers</h4>
          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
            ×{propulsion.gravity_amplifiers.count}
          </span>
        </div>
        <p className={`${ps.bodyMuted} mb-1`}>
          <span className="font-medium text-gray-700 dark:text-gray-300">Position:</span> {propulsion.gravity_amplifiers.position}
        </p>
        <p className={`${ps.body} mb-4`}>{propulsion.gravity_amplifiers.function}</p>

        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Operating Modes</h5>
        <div className="space-y-2">
          {propulsion.gravity_amplifiers.modes.map(mode => {
            const isOpen = expandedMode === mode.name;
            return (
              <div key={mode.name} className="border border-gray-100 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedMode(isOpen ? null : mode.name)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <span className="font-medium text-gray-800 dark:text-gray-200 text-sm">{mode.name}</span>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                    <p className={`${ps.body} pt-3 mb-2`}>{mode.description}</p>
                    {mode.notes && <p className="text-xs text-gray-500 italic">{mode.notes}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Space-Time */}
      <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800/30 rounded-lg p-4">
        <p className="text-xs font-medium text-purple-700 dark:text-purple-400 uppercase tracking-wide mb-1">Space-Time Distortion</p>
        <p className={ps.body}>{propulsion.space_time_distortion}</p>
      </div>

      <div className={ps.infoCard}>
        <p className={`${ps.label} mb-1`}>Hull Glow Explanation</p>
        <p className={ps.body}>{propulsion.glow_explanation}</p>
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
        Structured inventory of Lazar&apos;s claims with current verification status.
      </p>

      <ClaimsStatusBar claims={claims} />

      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter('all')}
          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
            filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize transition-colors ${
              filter === cat ? 'bg-primary text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
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
  <SharedDisclosuresTab disclosures={data.disclosures} introText="Chronological record of Lazar's public disclosures and media appearances." showSummaryStats />
);

const NetworkTab: FC = () => (
  <SharedNetworkTab people={data.associated_people} introText="Key individuals connected to Lazar's disclosure and the S-4 narrative." />
);

const AssessmentTab: FC = () => (
  <SharedAssessmentTab
    credibility={data.credibility}
    methodologyNote="This section presents documented arguments for and against Lazar's credibility. DECUR does not adjudicate these claims; they are presented for methodological transparency."
    sources={data.sources}
  />
);

/* ─── Main Profile Component ─────────────────────────────────── */

const LazarProfile: FC<InsiderProfileProps> = ({ onBack, backLabel }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab />;
      case 'career-network': {
        const keyEvents = (data.profile.key_events ?? []).map((e: any) => ({ year: String(e.date ?? e.year ?? ''), event: e.event }));
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
      case 'facility':    return <FacilityTab />;
      case 'craft':       return <CraftTab />;
      case 'propulsion':  return <PropulsionTab />;
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
      backLabel={backLabel}
    >
      {renderTab()}
    </ProfileShell>
  );
};

export default LazarProfile;
