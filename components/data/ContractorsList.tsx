import Link from 'next/link';
import { FC, useState } from 'react';
import {
  ContractorEntry,
  ContractorEvidenceStatus,
  ContractorUAPClaim,
} from '../../types/data';
import { ps } from './shared/profileStyles';

// ---------------------------------------------------------------------------
// Evidence status display config
// ---------------------------------------------------------------------------

const CREDIBILITY_CONFIG: Record<
  ContractorEvidenceStatus,
  { label: string; className: string }
> = {
  'documented':          { label: 'Documented',           className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  'primary-document':    { label: 'Primary Document',     className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  'testified-under-oath':{ label: 'Testified Under Oath', className: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
  'public-statements':   { label: 'Public Statements',    className: 'bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300' },
  'unverified-testimony':{ label: 'Unverified Testimony', className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  'alleged':             { label: 'Alleged',              className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  'disputed':            { label: 'Disputed',             className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
};

const STATUS_BADGE: Record<ContractorEntry['status'], string> = {
  'active':  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  'defunct': 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
};

// ---------------------------------------------------------------------------
// Claim credibility badge
// ---------------------------------------------------------------------------

function CredibilityBadge({ credibility }: { credibility: ContractorEvidenceStatus }) {
  const cfg = CREDIBILITY_CONFIG[credibility] ?? CREDIBILITY_CONFIG['alleged'];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Expanded card content
// ---------------------------------------------------------------------------

interface ExpandedContentProps {
  contractor: ContractorEntry;
}

const ExpandedContent: FC<ExpandedContentProps> = ({ contractor }) => (
  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-5">

    {/* Description */}
    <div>
      <p className={`${ps.label} mb-1`}>Overview</p>
      <p className={ps.body}>{contractor.description}</p>
    </div>

    {/* Known Contracts */}
    {contractor.known_contracts.length > 0 && (
      <div>
        <p className={`${ps.label} mb-2`}>Documented Contracts</p>
        <div className="space-y-2">
          {contractor.known_contracts.map((c, i) => {
            const cfg = CREDIBILITY_CONFIG[c.evidence_status] ?? CREDIBILITY_CONFIG['alleged'];
            return (
              <div key={i} className={`${ps.infoCard} flex items-start gap-2`}>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.className}`}>
                  {cfg.label}
                </span>
                <p className={`${ps.body} flex-1`}>{c.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    )}

    {/* UAP Claims */}
    {contractor.uap_claims.length > 0 && (
      <div>
        <p className={`${ps.label} mb-2`}>UAP-Relevant Claims</p>
        <div className="space-y-3">
          {contractor.uap_claims.map((claim: ContractorUAPClaim, i) => (
            <div key={i} className={ps.borderCard}>
              <div className="flex items-start gap-2 mb-2 flex-wrap">
                <CredibilityBadge credibility={claim.credibility} />
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                  claim.status === 'documented' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                  claim.status === 'disputed'   ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                }`}>
                  {claim.status.charAt(0).toUpperCase() + claim.status.slice(1)}
                </span>
              </div>
              <p className={ps.body}>{claim.claim}</p>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Connected Figures */}
    {contractor.connected_figures.length > 0 && (
      <div>
        <p className={`${ps.label} mb-2`}>Connected Figures</p>
        <div className="space-y-2">
          {contractor.connected_figures.map(fig => (
            <div key={fig.id} className={ps.listItem}>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    href={`/figures/${fig.id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {fig.name}
                  </Link>
                  <span className={ps.muted}>{fig.role}</span>
                </div>
                <p className={`${ps.bodyMuted} mt-0.5`}>{fig.relationship}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Sources */}
    {contractor.sources.length > 0 && (
      <div>
        <p className={`${ps.label} mb-2`}>Sources</p>
        <div className="space-y-1">
          {contractor.sources.map((src, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className={`${ps.muted} shrink-0 mt-0.5`}>{src.type}</span>
              {src.url ? (
                <a
                  href={src.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-primary hover:underline"
                >
                  {src.title}
                </a>
              ) : (
                <span className={ps.meta}>{src.title}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ContractorsListProps {
  contractors: ContractorEntry[];
}

const ContractorsList: FC<ContractorsListProps> = ({ contractors }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggle = (id: string) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-100 mb-1">
          Private Defense Contractors
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Defense contractors named in congressional testimony or with documented involvement in UAP-related government programs. Claims are labeled by evidence status.
        </p>
      </div>

      <div className="space-y-3">
        {contractors.map(c => {
          const isExpanded = expandedId === c.id;
          return (
            <div
              key={c.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 transition-colors"
            >
              {/* Header row */}
              <button
                onClick={() => toggle(c.id)}
                className="w-full text-left"
                aria-expanded={isExpanded}
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                        {c.name}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[c.status]}`}>
                        {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium">
                        Contractor
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">
                      Est. {c.founded} - {c.headquarters}
                      {c.sublabel ? ` - ${c.sublabel}` : ''}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 text-left">
                      {c.summary}
                    </p>
                  </div>
                  <span className="text-primary text-sm shrink-0 mt-1">
                    {isExpanded ? 'Collapse \u2212' : 'Expand +'}
                  </span>
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && <ExpandedContent contractor={c} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ContractorsList;
