import { FC, useState } from 'react';
import Link from 'next/link';
import { CaseEntry, EvidenceTier, HypothesisAssessment, CaseSourceType } from '../../types/data';
import ProfileTabBar from './shared/ProfileTabBar';
import CredibilityBalance from './shared/CredibilityBalance';
import BookmarkButton from '../bookmarks/BookmarkButton';
import insidersIndex from '../../data/key-figures/index.json';

/* ─── Helpers ──────────────────────────────────────────────────── */

export const tierConfig: Record<EvidenceTier, { label: string; classes: string }> = {
  'tier-1': { label: 'Tier 1 — Official Documentation', classes: 'bg-green-100 text-green-700' },
  'tier-2': { label: 'Tier 2 — Declassified Records',   classes: 'bg-blue-100 text-blue-700'  },
  'tier-3': { label: 'Tier 3 — Credentialed Testimony', classes: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'  },
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

const BASE_TABS = [
  { id: 'overview',          label: 'Overview' },
  { id: 'evidence',          label: 'Evidence' },
  { id: 'witnesses',         label: 'Witnesses' },
  { id: 'official-response', label: 'Official Response' },
  { id: 'insider-links',     label: 'Insider Links' },
  { id: 'assessment',        label: 'Assessment' },
] as const;

const ENRICHMENT_TABS = [
  { id: 'timeline',          label: 'Timeline' },
  { id: 'hypotheses',        label: 'Hypotheses' },
  { id: 'sources',           label: 'Sources' },
] as const;

type BaseTabId       = typeof BASE_TABS[number]['id'];
type EnrichmentTabId = typeof ENRICHMENT_TABS[number]['id'];
type DetailTabId     = BaseTabId | EnrichmentTabId;

/* ─── Tab sub-components ───────────────────────────────────────── */

const OverviewTab: FC<{ c: CaseEntry }> = ({ c }) => {
  const year = c.date?.split('-')[0];
  return (
    <div className="space-y-6">
      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{c.summary}</p>
      <div>
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">Key Facts</h3>
        <ul className="space-y-2">
          {c.overview.key_facts.map((fact, i) => (
            <li key={i} className="flex gap-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="text-primary mt-0.5 shrink-0">›</span>
              <span>{fact}</span>
            </li>
          ))}
        </ul>
      </div>
      {year && (
        <div className="border-t border-gray-100 dark:border-gray-800 pt-4">
          <Link
            href={`/timeline?year=${year}`}
            className="flex items-center justify-between gap-3 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 hover:border-primary hover:shadow-sm transition-all group"
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Historical Timeline</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
                View {year} events in the timeline
              </p>
            </div>
            <svg className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      )}
    </div>
  );
};

const EvidenceTab: FC<{ c: CaseEntry }> = ({ c }) => (
  <div className="space-y-6">
    {c.evidence.video_audio.length > 0 && (
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-400 shrink-0" />
          Video / Audio
        </h3>
        <ul className="space-y-1.5 pl-4">
          {c.evidence.video_audio.map((e, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{e}</li>
          ))}
        </ul>
      </div>
    )}
    {c.evidence.documentation.length > 0 && (
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0" />
          Documentation
        </h3>
        <ul className="space-y-1.5 pl-4">
          {c.evidence.documentation.map((e, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{e}</li>
          ))}
        </ul>
      </div>
    )}
    {c.evidence.physical.length > 0 && (
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
          Physical Evidence
        </h3>
        <ul className="space-y-1.5 pl-4">
          {c.evidence.physical.map((e, i) => (
            <li key={i} className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{e}</li>
          ))}
        </ul>
      </div>
    )}
  </div>
);

const WitnessesTab: FC<{ c: CaseEntry }> = ({ c }) => (
  <div className="space-y-4">
    {c.witnesses.map((w, i) => (
      <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{w.name}</p>
            <p className="text-xs text-primary leading-snug mt-0.5">{w.role}</p>
          </div>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium shrink-0">
            {witnessTypeLabel[w.type] ?? w.type}
          </span>
        </div>
        <blockquote className="border-l-2 border-primary/30 pl-3">
          <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed italic">&quot;{w.testimony}&quot;</p>
        </blockquote>
      </div>
    ))}
  </div>
);

const OfficialResponseTab: FC<{ c: CaseEntry }> = ({ c }) => {
  if (!c.official_response) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
        No official government response has been recorded for this case.
      </p>
    );
  }
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Agencies Involved</h3>
        <div className="flex flex-wrap gap-2">
          {c.official_response.agencies.map((a, i) => (
            <span key={i} className="text-xs px-2 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">{a}</span>
          ))}
        </div>
      </div>
      <div className="space-y-4">
        {c.official_response.statements.map((s, i) => (
          <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{s.source}</span>
              <span className="font-mono text-xs text-primary bg-primary/10 px-2 py-0.5 rounded">{s.date}</span>
            </div>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{s.statement}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const insiderMap = Object.fromEntries(
  (insidersIndex as Array<{ id: string; name: string; role: string }>).map(ins => [ins.id, ins])
);


const InsiderLinksTab: FC<{ c: CaseEntry }> = ({ c }) => {
  if (c.insider_connections.length === 0) {
    return (
      <div className="py-10 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
          <svg className="w-6 h-6 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">No linked insider profiles</p>
        <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
          No DECUR key figures have been directly connected to this case yet. Connections are added as profiles are verified and cross-referenced.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500 dark:text-gray-400">Connections to DECUR insider profiles with firsthand involvement or investigative roles.</p>
      {c.insider_connections.map((conn) => {
        const insider = insiderMap[conn.id];
        const displayName = insider?.name ?? conn.id;
        const displayRole = insider?.role ?? 'DECUR Key Figure';
        return (
          <Link
            key={conn.id}
            href={`/figures/${conn.id}`}
            className="flex gap-3 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary hover:shadow-sm transition-all group"
          >
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-primary">{displayName.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">{displayName}</p>
              <p className="text-xs text-primary leading-snug truncate">{displayRole}</p>
              {conn.note && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 leading-snug">{conn.note}</p>}
            </div>
            <svg className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors shrink-0 self-center" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        );
      })}
    </div>
  );
};

const AssessmentTab: FC<{ c: CaseEntry }> = ({ c }) => {
  if (!c.credibility) {
    return (
      <p className="text-sm text-gray-500 dark:text-gray-400 italic">
        No credibility assessment has been recorded for this case.
      </p>
    );
  }
  return (
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
              <li key={i} className="flex gap-2 text-xs text-gray-700 dark:text-gray-300">
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
              <li key={i} className="flex gap-2 text-xs text-gray-700 dark:text-gray-300">
                <span className="text-red-400 mt-0.5 shrink-0">-</span>
                <span>{con}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

/* ─── Enrichment tab helpers ───────────────────────────────────── */

const hypothesisColors: Record<HypothesisAssessment, string> = {
  verified:  'bg-green-100 text-green-700',
  probable:  'bg-blue-100 text-blue-700',
  possible:  'bg-yellow-100 text-yellow-700',
  disputed:  'bg-orange-100 text-orange-700',
  debunked:  'bg-red-100 text-red-700',
};

const sourceTypeColors: Record<CaseSourceType, string> = {
  official:   'bg-green-100 text-green-700',
  foia:       'bg-teal-100 text-teal-700',
  media:      'bg-blue-100 text-blue-700',
  testimony:  'bg-purple-100 text-purple-700',
  academic:   'bg-amber-100 text-amber-700',
  book:       'bg-gray-100 text-gray-600',
};

const TimelineTab: FC<{ c: CaseEntry }> = ({ c }) => {
  if (!c.timeline?.length) return null;
  return (
    <div className="relative pl-4 space-y-0">
      {/* Vertical line */}
      <div className="absolute left-0 top-2 bottom-2 w-px bg-gray-200 dark:bg-gray-700" />
      {c.timeline.map((ev, i) => (
        <div key={i} className="relative pl-6 pb-5 last:pb-0">
          {/* Dot */}
          <div className="absolute left-[-4px] top-1.5 w-2 h-2 rounded-full bg-primary shrink-0" />
          {(ev.timestamp || ev.local) && (
            <p className="font-mono text-xs text-primary mb-0.5">{ev.local ?? ev.timestamp}</p>
          )}
          <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{ev.event}</p>
        </div>
      ))}
    </div>
  );
};

const HypothesesTab: FC<{ c: CaseEntry }> = ({ c }) => {
  if (!c.competing_hypotheses?.length && !c.claims_taxonomy) return null;
  return (
    <div className="space-y-6">
      {c.competing_hypotheses && c.competing_hypotheses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Competing Explanations</h3>
          {c.competing_hypotheses.map((h, i) => (
            <div key={i} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2 flex-wrap">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex-1">{h.name}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize shrink-0 ${hypothesisColors[h.assessment]}`}>
                  {h.assessment}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{h.summary}</p>
              {(h.evidence_for?.length || h.evidence_against?.length) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  {h.evidence_for?.length ? (
                    <div>
                      <p className="text-xs font-semibold text-green-700 mb-1">Evidence For</p>
                      <ul className="space-y-1">
                        {h.evidence_for.map((e, j) => (
                          <li key={j} className="flex gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <span className="text-green-500 shrink-0">+</span>{e}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {h.evidence_against?.length ? (
                    <div>
                      <p className="text-xs font-semibold text-red-600 mb-1">Evidence Against</p>
                      <ul className="space-y-1">
                        {h.evidence_against.map((e, j) => (
                          <li key={j} className="flex gap-1.5 text-xs text-gray-600 dark:text-gray-400">
                            <span className="text-red-400 shrink-0">-</span>{e}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      {c.claims_taxonomy && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Claims Taxonomy</h3>
          {(['verified','probable','disputed','speculative'] as const).map(tier => {
            const items = c.claims_taxonomy?.[tier];
            if (!items?.length) return null;
            const colors: Record<string, string> = {
              verified:   'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800',
              probable:   'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
              disputed:   'bg-orange-50 border-orange-200 dark:bg-orange-900/20 dark:border-orange-800',
              speculative:'bg-gray-50 border-gray-200 dark:bg-gray-800 dark:border-gray-700',
            };
            const labels: Record<string, string> = {
              verified: 'Verified', probable: 'Probable', disputed: 'Disputed', speculative: 'Speculative',
            };
            return (
              <div key={tier} className={`border rounded-lg p-3 ${colors[tier]}`}>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">{labels[tier]}</p>
                <ul className="space-y-1">
                  {items.map((item, j) => (
                    <li key={j} className="flex gap-2 text-xs text-gray-700 dark:text-gray-300">
                      <span className="text-gray-400 shrink-0 mt-0.5">›</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const SourcesTab: FC<{ c: CaseEntry }> = ({ c }) => {
  if (!c.sources?.length) return null;
  return (
    <div className="space-y-3">
      {c.sensor_context?.systems && c.sensor_context.systems.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Sensor Systems</h3>
          <div className="space-y-2">
            {c.sensor_context.systems.map((sys, i) => (
              <div key={i} className="flex gap-3 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
                <div className="flex-1 min-w-0">
                  <span className="font-mono text-xs text-primary font-semibold">{sys.name}</span>
                  <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">({sys.operator})</span>
                  {sys.notes && <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 leading-snug">{sys.notes}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Primary Sources</h3>
      {c.sources.map((src, i) => (
        <div key={i} className="flex gap-3 border border-gray-200 dark:border-gray-700 rounded-lg p-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-start gap-2 flex-wrap">
              {src.url ? (
                <a href={src.url} target="_blank" rel="noopener noreferrer"
                   className="text-sm font-medium text-primary hover:underline leading-snug">{src.title}</a>
              ) : (
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">{src.title}</p>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 capitalize ${sourceTypeColors[src.type]}`}>
                {src.type}
              </span>
            </div>
            {src.date && <p className="font-mono text-xs text-gray-400 dark:text-gray-500 mt-0.5">{src.date}</p>}
            {src.notes && <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-snug">{src.notes}</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

/* ─── Case Detail view ─────────────────────────────────────────── */

export interface CaseDetailProps {
  c: CaseEntry;
  onBack: () => void;
  backLabel?: string;
  networkNodeId?: string;
}

const CaseDetail: FC<CaseDetailProps> = ({ c, onBack, backLabel = 'Cases', networkNodeId }) => {
  const [activeTab, setActiveTab] = useState<DetailTabId>('overview');
  const tier = tierConfig[c.evidence_tier];

  // Build tab list dynamically - add enrichment tabs only when data exists
  const tabs = [
    ...BASE_TABS,
    ...(c.timeline?.length                                       ? [{ id: 'timeline'   as const, label: 'Timeline'    }] : []),
    ...((c.competing_hypotheses?.length || c.claims_taxonomy)    ? [{ id: 'hypotheses' as const, label: 'Hypotheses'  }] : []),
    ...(c.sources?.length                                        ? [{ id: 'sources'    as const, label: 'Sources'     }] : []),
  ];

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':          return <OverviewTab c={c} />;
      case 'evidence':          return <EvidenceTab c={c} />;
      case 'witnesses':         return <WitnessesTab c={c} />;
      case 'official-response': return <OfficialResponseTab c={c} />;
      case 'insider-links':     return <InsiderLinksTab c={c} />;
      case 'assessment':        return <AssessmentTab c={c} />;
      case 'timeline':          return <TimelineTab c={c} />;
      case 'hypotheses':        return <HypothesesTab c={c} />;
      case 'sources':           return <SourcesTab c={c} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="text-sm text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ← {backLabel}
          </button>
          {networkNodeId && backLabel !== 'Relationship Network' && (
            <Link
              href={`/explore?node=${networkNodeId}#relationship-network`}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary transition-colors"
            >
              View in Network →
            </Link>
          )}
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-100">{c.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tier.classes}`}>{tier.label}</span>
              <span className="font-mono tabular-nums text-xs text-gray-400 dark:text-gray-500">{c.date}</span>
              <span className="text-gray-300 dark:text-gray-600 text-xs">·</span>
              <span className="font-mono tabular-nums text-xs text-gray-400 dark:text-gray-500">{c.location}</span>
            </div>
          </div>
          <BookmarkButton contentType="case" contentId={c.id} contentName={c.name} />
        </div>
      </div>

      {/* Explore callout */}
      <Link
        href="/explore?tab=map#secondary-tabs"
        className="flex items-center justify-between gap-3 border border-gray-200 dark:border-gray-700 rounded-lg px-4 py-3 hover:border-primary hover:shadow-sm transition-all group"
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">Explore Visualizations</p>
          <p className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-primary transition-colors">
            View this incident on the interactive incident map and timeline
          </p>
        </div>
        <svg className="h-4 w-4 text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </Link>

      {/* Tabs */}
      <ProfileTabBar
        tabs={tabs as Array<{ id: string; label: string }>}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as DetailTabId)}
      />

      {/* Tab content */}
      <div>{renderTab()}</div>
    </div>
  );
};

export default CaseDetail;
