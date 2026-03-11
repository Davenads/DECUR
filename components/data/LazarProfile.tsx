import { FC, useState } from 'react';
import Link from 'next/link';
import { LazarData } from '../../types/data';
import lazarData from '../../data/insiders/lazar.json';
import ProfileShell from './shared/ProfileShell';
import ClaimsStatusBar from './shared/ClaimsStatusBar';
import CredibilityBalance from './shared/CredibilityBalance';
import { statusConfig } from './shared/profileConstants';
import { InsiderProfileProps } from '../../types/components';

const data = lazarData as LazarData;

const TABS = [
  { id: 'overview',    label: 'Overview' },
  { id: 'facility',   label: 'S-4 Facility' },
  { id: 'craft',      label: 'Craft & Technology' },
  { id: 'propulsion', label: 'Propulsion' },
  { id: 'claims',     label: 'Claims' },
  { id: 'disclosures',label: 'Disclosures' },
  { id: 'network',    label: 'Network' },
  { id: 'assessment', label: 'Assessment' },
] as const;

type TabId = typeof TABS[number]['id'];

/* ─── Sub-views ──────────────────────────────────────────────── */

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
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Clearance (claimed)</p>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Early Life &amp; Background</h3>
        <ul className="space-y-1.5">
          {profile.early_life.map((item, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-gray-900">Key Events</h3>
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
              <span className="text-gray-700">{ev.event}</span>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-1">{facility.name}</h3>
        <p className="text-xs text-gray-400 mb-1">{facility.aliases.join(' · ')}</p>
        <p className="text-sm text-gray-600">{facility.location}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Access Method</p>
          <p className="text-sm text-gray-800">{facility.access}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Hangar Bays</p>
          <p className="text-sm text-gray-800">{facility.hangar_count} bays, one craft per bay (claimed)</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Construction</p>
          <p className="text-sm text-gray-800">{facility.construction}</p>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Security Protocols</h4>
        <ul className="space-y-1.5">
          {facility.security.map((s, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700">
              <span className="text-red-400 mt-0.5 shrink-0">■</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
        <p className="text-xs font-medium text-primary uppercase tracking-wide mb-2">Lazar&apos;s Account</p>
        <p className="text-sm text-gray-700 leading-relaxed">{facility.lazar_account}</p>
      </div>
    </div>
  );
};

const CraftTab: FC = () => {
  const { crafts } = data;
  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Total Craft at S-4</p>
        <p className="text-2xl font-bold text-gray-900">{crafts.total_count}</p>
        <p className="text-xs text-gray-500 mt-0.5">One per hangar bay, all described as disc-shaped</p>
      </div>

      <div>
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Primary Assignment</p>
        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 text-primary rounded-full text-sm font-medium">
          {crafts.primary_studied}
        </div>
      </div>

      <div className="space-y-4">
        {crafts.descriptions.map((craft, i) => (
          <div key={i} className="border border-gray-200 rounded-lg p-5">
            <h4 className="font-semibold text-gray-900 mb-2">{craft.designation}</h4>
            <p className="text-sm text-gray-700 mb-3">{craft.description}</p>
            {craft.diameter_estimate && (
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Diameter (claimed):</span>
                <span className="text-xs text-gray-700">{craft.diameter_estimate}</span>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
        <p className="text-sm text-gray-700 leading-relaxed">{propulsion.overview}</p>
      </div>

      {/* Element 115 */}
      <div className="border border-gray-200 rounded-lg p-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div>
            <h4 className="font-semibold text-gray-900">Fuel Source</h4>
            <p className="text-xs text-gray-400 mt-0.5">{propulsion.fuel.element}</p>
          </div>
          <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full font-medium shrink-0">
            Element 115
          </span>
        </div>
        <p className="text-sm text-gray-700 mb-2">{propulsion.fuel.claim}</p>
        <p className="text-sm text-gray-600 mb-2">{propulsion.fuel.context}</p>
        <div className="bg-blue-50 border border-blue-100 rounded p-3 mt-2">
          <p className="text-xs font-medium text-blue-700 uppercase tracking-wide mb-1">Significance</p>
          <p className="text-sm text-gray-700">{propulsion.fuel.significance}</p>
        </div>
      </div>

      {/* Reactor */}
      <div className="border border-gray-200 rounded-lg p-5">
        <h4 className="font-semibold text-gray-900 mb-2">Reactor</h4>
        <p className="text-sm text-gray-700 mb-2">{propulsion.reactor.description}</p>
        <p className="text-sm text-gray-600">{propulsion.reactor.output}</p>
      </div>

      {/* Gravity Amplifiers */}
      <div className="border border-gray-200 rounded-lg p-5">
        <div className="flex items-center gap-3 mb-3">
          <h4 className="font-semibold text-gray-900">Gravity Amplifiers</h4>
          <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
            ×{propulsion.gravity_amplifiers.count}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-1">
          <span className="font-medium text-gray-700">Position:</span> {propulsion.gravity_amplifiers.position}
        </p>
        <p className="text-sm text-gray-700 mb-4">{propulsion.gravity_amplifiers.function}</p>

        <h5 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Operating Modes</h5>
        <div className="space-y-2">
          {propulsion.gravity_amplifiers.modes.map(mode => {
            const isOpen = expandedMode === mode.name;
            return (
              <div key={mode.name} className="border border-gray-100 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedMode(isOpen ? null : mode.name)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
                >
                  <span className="font-medium text-gray-800 text-sm">{mode.name}</span>
                  <svg
                    className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <p className="text-sm text-gray-700 pt-3 mb-2">{mode.description}</p>
                    {mode.notes && <p className="text-xs text-gray-500 italic">{mode.notes}</p>}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Space-Time */}
      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
        <p className="text-xs font-medium text-purple-700 uppercase tracking-wide mb-1">Space-Time Distortion</p>
        <p className="text-sm text-gray-700">{propulsion.space_time_distortion}</p>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Hull Glow Explanation</p>
        <p className="text-sm text-gray-700">{propulsion.glow_explanation}</p>
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
            filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize transition-colors ${
              filter === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
            <div key={claim.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <p className="text-xs font-medium text-gray-400 uppercase tracking-wide capitalize">
                  {claim.category.replace(/-/g, ' ')}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.classes}`}>
                  {cfg.label}
                </span>
              </div>
              <p className="text-sm text-gray-800 mb-2">{claim.claim}</p>
              {claim.notes && (
                <p className="text-xs text-gray-500 italic border-t border-gray-100 pt-2">{claim.notes}</p>
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
    television:  'bg-blue-100 text-blue-700',
    radio:       'bg-green-100 text-green-700',
    podcast:     'bg-purple-100 text-purple-700',
    documentary: 'bg-amber-100 text-amber-700',
  };
  const typeDot: Record<string, string> = {
    television:  'bg-blue-400',
    radio:       'bg-green-400',
    podcast:     'bg-purple-400',
    documentary: 'bg-amber-400',
  };

  // Summary stats
  const years = disclosures.map(d => parseInt(d.date.slice(0, 4))).filter(y => !isNaN(y));
  const firstYear = Math.min(...years);
  const lastYear  = Math.max(...years);
  const typeCounts = disclosures.reduce<Record<string, number>>((acc, d) => {
    acc[d.type] = (acc[d.type] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Chronological record of Lazar&apos;s public disclosures and media appearances.
      </p>

      {/* Summary panel */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Disclosure Activity</p>
          <span className="text-xs text-gray-400">{disclosures.length} appearances · {firstYear}–{lastYear}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          {Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
            <div key={type} className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${typeDot[type] ?? 'bg-gray-400'}`} />
              <span className="text-xs text-gray-600 capitalize">{type}</span>
              <span className="text-xs font-semibold text-gray-800">{count}</span>
            </div>
          ))}
        </div>
        {/* Activity bar — one tick per disclosure, colored by type, ordered chronologically */}
        <div className="flex gap-0.5 h-3 items-end">
          {disclosures.map((d, i) => (
            <div
              key={i}
              className={`flex-1 rounded-sm ${typeDot[d.type] ?? 'bg-gray-300'}`}
              style={{ minWidth: '6px', height: '100%' }}
              title={`${d.date} · ${d.type} · ${d.title}`}
            />
          ))}
        </div>
      </div>

      <div className="relative pl-6 border-l-2 border-gray-100 space-y-4">
        {disclosures.map((d, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white" />
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-start justify-between gap-3 mb-1">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm">{d.title}</h4>
                  <p className="text-xs text-gray-500 mt-0.5">{d.outlet}</p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className="font-mono text-xs text-gray-400">{d.date}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeColors[d.type] ?? 'bg-gray-100 text-gray-600'}`}>
                    {d.type}
                  </span>
                </div>
              </div>
              {d.interviewer && (
                <p className="text-xs text-gray-500 mb-1">Interviewer: {d.interviewer}</p>
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

const NetworkTab: FC = () => {
  const { associated_people } = data;
  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        Key individuals connected to Lazar&apos;s disclosure and the S-4 narrative.
      </p>
      {associated_people.map(person => (
        <div key={person.id} className="border border-gray-200 rounded-lg p-5">
          <h4 className="font-semibold text-gray-900 mb-0.5">{person.name}</h4>
          <p className="text-xs text-primary font-medium mb-2">{person.role}</p>
          <p className="text-sm text-gray-700">{person.relationship}</p>
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
          This section presents documented arguments for and against Lazar&apos;s credibility. DECUR does not adjudicate these claims; they are presented for methodological transparency.
        </p>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-green-700 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          Supporting Evidence
        </h4>
        <div className="space-y-2">
          {credibility.supporting.map((item, i) => (
            <div key={i} className="flex gap-2 border border-green-100 bg-green-50/50 rounded-lg p-3">
              <span className="text-green-500 mt-0.5 shrink-0">✓</span>
              <p className="text-sm text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-3 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Contradicting Evidence
        </h4>
        <div className="space-y-2">
          {credibility.contradicting.map((item, i) => (
            <div key={i} className="flex gap-2 border border-red-100 bg-red-50/50 rounded-lg p-3">
              <span className="text-red-400 mt-0.5 shrink-0">✗</span>
              <p className="text-sm text-gray-700">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Sources</h4>
        <div className="space-y-2">
          {data.sources.map((src, i) => (
            <div key={i} className="flex items-start justify-between gap-4 bg-gray-50 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium text-gray-800">{src.title}</p>
                <p className="text-xs text-gray-400 mt-0.5">{src.type} · {src.notes}</p>
              </div>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline whitespace-nowrap shrink-0"
              >
                Source ↗
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Main Profile Component ─────────────────────────────────── */

const LazarProfile: FC<InsiderProfileProps> = ({ onBack }) => {
  const [activeTab, setActiveTab] = useState<TabId>('overview');

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab />;
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
    >
      {renderTab()}
    </ProfileShell>
  );
};

export default LazarProfile;
