import { FC, useState } from 'react';
import Link from 'next/link';
import { CaseEntry, EvidenceTier } from '../../types/data';
import CaseDetail, { tierConfig } from './CaseDetail';

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
                <Link
                  href={`/cases/${c.id}`}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap shrink-0"
                >
                  View Case
                </Link>
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
