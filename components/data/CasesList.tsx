import { FC, useState } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { CaseEntry, EvidenceTier } from '../../types/data';
import CaseDetail, { tierConfig } from './CaseDetail';

// SSR-safe: react-simple-maps uses browser APIs
const CasesLocationMap = dynamic(() => import('./CasesLocationMap'), { ssr: false });

type ViewMode = 'list' | 'map';

/* ─── Cases list view ──────────────────────────────────────────── */

interface CasesListProps {
  cases: CaseEntry[];
}

const CasesList: FC<CasesListProps> = ({ cases }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('list');

  const selected = cases.find(c => c.id === selectedId) ?? null;

  if (selected) {
    return <CaseDetail c={selected} onBack={() => { setSelectedId(null); window.scrollTo({ top: 0, behavior: 'instant' }); }} />;
  }

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-100 mb-1">Documented Cases</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            The strongest credible UAP incidents in the public record, assessed by evidence quality and official documentation.
          </p>
        </div>
        {/* View toggle */}
        <div className="flex gap-1 bg-gray-100 dark:bg-gray-700 rounded-lg p-1 shrink-0">
          {(['list', 'map'] as ViewMode[]).map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`text-xs px-3 py-1 rounded-md font-medium transition-colors capitalize flex items-center gap-1.5 ${
                viewMode === mode ? 'bg-white dark:bg-gray-800 text-primary shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {mode === 'list' ? (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Map view */}
      {viewMode === 'map' && (
        <div className="mb-6">
          <CasesLocationMap cases={cases} onSelectCase={(id) => setSelectedId(id)} />
        </div>
      )}

      {/* Tier legend (list only) */}
      {viewMode === 'list' && (
        <div className="flex flex-wrap gap-3 mb-6 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
          {(Object.keys(tierConfig) as EvidenceTier[]).map(tier => (
            <span key={tier} className={`text-xs px-2 py-0.5 rounded-full font-medium ${tierConfig[tier].classes}`}>
              {tierConfig[tier].label}
            </span>
          ))}
        </div>
      )}

      <div className="grid gap-4">
        {cases.map(c => {
          const tier = tierConfig[c.evidence_tier];
          return (
            <div
              key={c.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-primary hover:shadow-md transition-all group"
            >
              {/* Name row + button */}
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{c.name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${tier.classes}`}>
                    {c.evidence_tier.replace('-', ' ').toUpperCase()}
                  </span>
                </div>
                <Link
                  href={`/cases/${c.id}`}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap shrink-0"
                >
                  View Case
                </Link>
              </div>

              {/* Metadata */}
              <p className="text-sm font-medium text-primary mb-0.5">{c.location}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-3">
                {c.date} · {c.country} · {c.witnesses.length} witness{c.witnesses.length !== 1 ? 'es' : ''} documented
              </p>

              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-3">{c.summary}</p>

              {/* Tags + insider links */}
              <div className="flex flex-wrap gap-1.5">
                {c.tags.map(tag => (
                  <span key={tag} className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400">{tag}</span>
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
