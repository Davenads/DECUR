import { FC, useState } from 'react';
import { CaseEntry, EvidenceTier } from '../../types/data';
import ProfileTabBar from './shared/ProfileTabBar';
import CredibilityBalance from './shared/CredibilityBalance';

/* ─── Helpers ──────────────────────────────────────────────────── */

const tierConfig: Record<EvidenceTier, { label: string; classes: string }> = {
  'tier-1': { label: 'Tier 1 — Official Documentation', classes: 'bg-green-100 text-green-700' },
  'tier-2': { label: 'Tier 2 — Declassified Records',   classes: 'bg-blue-100 text-blue-700'  },
  'tier-3': { label: 'Tier 3 — Credentialed Testimony', classes: 'bg-gray-100 text-gray-600'  },
};

const witnessTypeLabel: Record<string, string> = {
  'military':              'Military',
  'government-investigator': 'Government Investigator',
  'government':            'Government Official',
  'law-enforcement':       'Law Enforcement',
  'commercial-aviation':   'Commercial Aviation',
  'civilian':              'Civilian',
};

/* ─── Case Detail Tabs ─────────────────────────────────────────── */

const DETAIL_TABS = [
  { id: 'overview',         label: 'Overview' },
  { id: 'evidence',         label: 'Evidence' },
  { id: 'witnesses',        label: 'Witnesses' },
  { id: 'official-response', label: 'Official Response' },
  { id: 'insider-links',    label: 'Insider Links' },
  { id: 'assessment',       label: 'Assessment' },
] as const;

type DetailTabId = typeof DETAIL_TABS[number]['id'];

/* ─── Tab sub-components ───────────────────────────────────────── */

const OverviewTab: FC<{ c: CaseEntry }> = ({ c }) => (
  <div className="space-y-6">
    <p className="text-sm text-gray-700 leading-relaxed">{c.summary}</p>
    <div>
      <h3 className="text-base font-semibold text-gray-900 mb-3">Key Facts</h3>
      <ul className="space-y-2">
        {c.overview.key_facts.map((fact, i) => (
          <li key={i} className="flex gap-2 text-sm text-gray-700">
            <span className="text-primary mt-0.5 shrink-0">›</span>
            <span>{fact}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
);

const EvidenceTab: FC<{ c: CaseEntry }> = ({ c }) => (
  <div className="space-y-6">
    {c.evidence.video_audio.length > 0 && (
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
          Video / Audio
        </h3>
        <ul className="space-y-1.5 pl-4">
          {c.evidence.video_audio.map((e, i) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed">{e}</li>
          ))}
        </ul>
      </div>
    )}
    {c.evidence.documentation.length > 0 && (
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
          Documentation
        </h3>
        <ul className="space-y-1.5 pl-4">
          {c.evidence.documentation.map((e, i) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed">{e}</li>
          ))}
        </ul>
      </div>
    )}
    {c.evidence.physical.length > 0 && (
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          Physical Evidence
        </h3>
        <ul className="space-y-1.5 pl-4">
          {c.evidence.physical.map((e, i) => (
            <li key={i} className="text-sm text-gray-700 leading-relaxed">{e}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const WitnessesTab: FC<{ c: CaseEntry }> = ({ c }) => (
  <div className="space-y-4">
    {c.witnesses.map((w, i) => (
      <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-2">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-gray-900">{w.name}</p>
            <p className="text-xs text-primary leading-snug mt-0.5">{w.role}</p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium shrink-0">
            {witnessTypeLabel[w.type] ?? w.type}
          </span>
        </div>
        <blockquote className="border-l-2 border-primary/30 pl-3">
          <p className="text-xs text-gray-600 leading-relaxed italic">&quot;{w.testimony}&quot;</p>
        </blockquote>
      </div>
    ))}
  </div>
);

const OfficialResponseTab: FC<{ c: CaseEntry }> = ({ c }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-sm font-semibold text-gray-900 mb-2">Agencies Involved</h3>
      <div className="flex flex-wrap gap-2">
        {c.official_response.agencies.map((a, i) => (
          <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">{a}</span>
        ))}
      </div>
    </div>
    <div className="space-y-4">
      {c.official_response.statements.map((s, i) => (
        <div key={i} className="border border-gray-200 rounded-lg p-4 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-gray-700">{s.source}</span>
            <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{s.date}</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{s.statement}</p>
        </div>
      ))}
    </div>
  </div>
);

const InsiderLinksTab: FC<{ c: CaseEntry }> = ({ c }) => {
  if (c.insider_connections.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-gray-400">No direct connections to DECUR insider profiles.</p>
        <p className="text-xs text-gray-300 mt-1">This incident predates or is independent of the primary disclosure ecosystem.</p>
      </div>
    );
  }

  const labels: Record<string, { name: string; role: string; note: string }> = {
    'david-fravor':   { name: 'CDR David Fravor',    role: 'Primary witness — direct visual observation and congressional testimony', note: 'Fravor\'s firsthand account is the primary record of the Nimitz encounter.' },
    'nick-pope':      { name: 'Nick Pope',           role: 'MoD investigator — reinvestigated Rendlesham from classified records',    note: 'Pope\'s 1993 reinvestigation concluded the official dismissal was inadequate.' },
    'luis-elizondo':  { name: 'Luis Elizondo',       role: 'AATIP director — investigated Roosevelt incidents on behalf of DoD',     note: 'Elizondo assessed the sustained nature of the encounters as having national security implications.' },
    'chris-mellon':   { name: 'Chris Mellon',        role: 'DASD Intelligence — facilitated video release through TTSA and NYT',    note: 'Mellon obtained and coordinated public release of the DoD-authenticated videos.' },
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">Connections to DECUR insider profiles with firsthand involvement or investigative roles.</p>
      {c.insider_connections.map((id, i) => {
        const person = labels[id] ?? { name: id, role: 'DECUR insider', note: '' };
        return (
          <div key={i} className="flex gap-3 border border-gray-200 rounded-lg p-4">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">{person.name.charAt(0)}</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{person.name}</p>
              <p className="text-xs text-primary leading-snug">{person.role}</p>
              {person.note && <p className="text-xs text-gray-400 mt-1 leading-snug">{person.note}</p>}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const AssessmentTab: FC<{ c: CaseEntry }> = ({ c }) => (
  <div className="space-y-6">
    <CredibilityBalance
      supporting={c.credibility.supporting.length}
      contradicting={c.credibility.contradicting.length}
    />
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <h3 className="text-sm font-semibold text-green-700 mb-2">Supporting</h3>
        <ul className="space-y-2">
          {c.credibility.supporting.map((s, i) => (
            <li key={i} className="flex gap-2 text-xs text-gray-700">
              <span className="text-green-500 mt-0.5 shrink-0">+</span>
              <span>{s}</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="text-sm font-semibold text-red-600 mb-2">Contradicting / Caveats</h3>
        <ul className="space-y-2">
          {c.credibility.contradicting.map((con, i) => (
            <li key={i} className="flex gap-2 text-xs text-gray-700">
              <span className="text-red-400 mt-0.5 shrink-0">-</span>
              <span>{con}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  </div>
);

/* ─── Case Detail view ─────────────────────────────────────────── */

interface CaseDetailProps {
  c: CaseEntry;
  onBack: () => void;
}

const CaseDetail: FC<CaseDetailProps> = ({ c, onBack }) => {
  const [activeTab, setActiveTab] = useState<DetailTabId>('overview');
  const tier = tierConfig[c.evidence_tier];

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':          return <OverviewTab c={c} />;
      case 'evidence':          return <EvidenceTab c={c} />;
      case 'witnesses':         return <WitnessesTab c={c} />;
      case 'official-response': return <OfficialResponseTab c={c} />;
      case 'insider-links':     return <InsiderLinksTab c={c} />;
      case 'assessment':        return <AssessmentTab c={c} />;
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
          <h2 className="text-2xl font-bold font-heading text-gray-900">{c.name}</h2>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tier.classes}`}>{tier.label}</span>
            <span className="text-xs text-gray-400">{c.date}</span>
            <span className="text-gray-300 text-xs">·</span>
            <span className="text-xs text-gray-400">{c.location}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <ProfileTabBar
        tabs={DETAIL_TABS as unknown as Array<{ id: string; label: string }>}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as DetailTabId)}
      />

      {/* Tab content */}
      <div>{renderTab()}</div>
    </div>
  );
};

/* ─── Cases list view ──────────────────────────────────────────── */

interface CasesListProps {
  cases: CaseEntry[];
}

const CasesList: FC<CasesListProps> = ({ cases }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selected = cases.find(c => c.id === selectedId) ?? null;

  if (selected) {
    return <CaseDetail c={selected} onBack={() => { setSelectedId(null); window.scrollTo({ top: 0, behavior: 'instant' }); }} />;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading text-gray-900 mb-1">Documented Cases</h2>
        <p className="text-sm text-gray-500">
          The strongest credible UAP incidents in the public record, assessed by evidence quality and official documentation.
        </p>
      </div>

      {/* Tier legend */}
      <div className="flex flex-wrap gap-3 mb-6 p-3 bg-gray-50 rounded-lg">
        {(Object.keys(tierConfig) as EvidenceTier[]).map(tier => (
          <span key={tier} className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierConfig[tier].classes}`}>
            {tierConfig[tier].label}
          </span>
        ))}
      </div>

      <div className="grid gap-4">
        {cases.map(c => {
          const tier = tierConfig[c.evidence_tier];
          return (
            <div
              key={c.id}
              className="border border-gray-200 rounded-lg p-5 hover:border-primary hover:shadow-md transition-all group"
            >
              {/* Name row + button */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900">{c.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tier.classes}`}>
                    {c.evidence_tier.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <button
                  onClick={() => { setSelectedId(c.id); window.scrollTo({ top: 0, behavior: 'instant' }); }}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap shrink-0"
                >
                  View Case
                </button>
              </div>

              {/* Metadata */}
              <p className="text-sm font-medium text-primary mb-0.5">{c.location}</p>
              <p className="text-xs text-gray-400 mb-3">
                {c.date} · {c.country} · {c.witnesses.length} witness{c.witnesses.length !== 1 ? 'es' : ''} documented
              </p>

              <p className="text-sm text-gray-600 leading-relaxed mb-3">{c.summary}</p>

              {/* Tags + insider links */}
              <div className="flex flex-wrap gap-1.5">
                {c.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">{tag}</span>
                ))}
                {c.insider_connections.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {c.insider_connections.length} insider connection{c.insider_connections.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CasesList;
