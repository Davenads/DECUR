import { FC } from 'react';
import Link from 'next/link';
import type {
  ContractorEntry,
  ContractorUAPClaim,
} from '../../types/data';
import { ps } from './shared/profileStyles';
import {
  CREDIBILITY_CONFIG,
  STATUS_BADGE,
  CLAIM_STATUS_CONFIG,
} from './shared/contractorConstants';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function CredibilityBadge({ credibility }: { credibility: ContractorUAPClaim['credibility'] }) {
  const cfg = CREDIBILITY_CONFIG[credibility] ?? CREDIBILITY_CONFIG['alleged'];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

function ClaimStatusBadge({ status }: { status: ContractorUAPClaim['status'] }) {
  const cfg = CLAIM_STATUS_CONFIG[status] ?? CLAIM_STATUS_CONFIG['alleged'];
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.className}`}>
      {cfg.label}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Claim balance indicator
// ---------------------------------------------------------------------------

function ClaimBalance({ claims }: { claims: ContractorUAPClaim[] }) {
  if (claims.length === 0) return null;
  const documented = claims.filter(c => c.status === 'documented').length;
  const alleged    = claims.filter(c => c.status === 'alleged').length;
  const disputed   = claims.filter(c => c.status === 'disputed').length;

  const bars: { count: number; label: string; className: string }[] = [
    { count: documented, label: 'Documented', className: 'bg-green-500 dark:bg-green-400' },
    { count: alleged,    label: 'Alleged',    className: 'bg-amber-500 dark:bg-amber-400' },
    { count: disputed,   label: 'Disputed',   className: 'bg-red-500 dark:bg-red-400' },
  ].filter(b => b.count > 0);

  return (
    <div className={`${ps.infoCard} space-y-2`}>
      <p className={`${ps.label} mb-1`}>Claim Evidence Balance</p>
      <div className="flex rounded overflow-hidden h-2">
        {bars.map((b, i) => (
          <div
            key={i}
            className={b.className}
            style={{ width: `${(b.count / claims.length) * 100}%` }}
          />
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {bars.map((b, i) => (
          <span key={i} className={`${ps.meta} flex items-center gap-1`}>
            <span className={`inline-block w-2 h-2 rounded-full ${b.className}`} />
            {b.count} {b.label}
          </span>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface ContractorDetailProps {
  contractor: ContractorEntry;
  onBack: () => void;
  backLabel: string;
  networkNodeId?: string;
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

const ContractorDetail: FC<ContractorDetailProps> = ({
  contractor,
  onBack,
  backLabel,
  networkNodeId,
}) => {
  return (
    <div className="max-w-4xl mx-auto">

      {/* Back + explore buttons */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
        >
          <span aria-hidden>&#8592;</span> {backLabel}
        </button>
        {networkNodeId && (
          <Link
            href={`/explore?highlight=${networkNodeId}`}
            className="text-xs px-3 py-1.5 rounded-full border border-primary text-primary hover:bg-primary/10 transition-colors"
          >
            View in Network Graph
          </Link>
        )}
      </div>

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <h1 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-100">
            {contractor.name}
          </h1>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[contractor.status]}`}>
            {contractor.status.charAt(0).toUpperCase() + contractor.status.slice(1)}
          </span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium">
            Contractor
          </span>
        </div>
        {contractor.sublabel && (
          <p className={`${ps.bodyMuted} mb-1`}>{contractor.sublabel}</p>
        )}
        <p className={`${ps.meta} mb-3`}>
          Est. {contractor.founded} &middot; {contractor.headquarters}
        </p>
        <p className={ps.body}>{contractor.summary}</p>
      </div>

      <hr className={ps.divider} />

      {/* Overview */}
      <section className="py-6 space-y-4">
        <h2 className={ps.h3}>Overview</h2>
        <p className={ps.body}>{contractor.description}</p>
      </section>

      {/* Claim balance indicator */}
      {contractor.uap_claims.length > 0 && (
        <div className="pb-2">
          <ClaimBalance claims={contractor.uap_claims} />
        </div>
      )}

      <hr className={ps.divider} />

      {/* UAP-Relevant Timeline */}
      {contractor.key_events && contractor.key_events.length > 0 && (
        <section className="py-6 space-y-4">
          <h2 className={ps.h3}>UAP-Relevant Timeline</h2>
          <div className={ps.timelineLine}>
            {contractor.key_events.map((evt, i) => (
              <div key={i} className="relative pl-7 pb-5 last:pb-0">
                <span className={`${ps.timelineDot} top-1`} />
                <p className={`${ps.label} mb-0.5`}>{evt.year}</p>
                <p className={ps.body}>{evt.event}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {contractor.key_events && contractor.key_events.length > 0 && <hr className={ps.divider} />}

      {/* UAP-Relevant Claims */}
      {contractor.uap_claims.length > 0 && (
        <section className="py-6 space-y-4">
          <h2 className={ps.h3}>UAP-Relevant Claims</h2>
          <div className="space-y-3">
            {contractor.uap_claims.map((claim, i) => (
              <div key={i} className={ps.borderCard}>
                <div className="flex items-start gap-2 mb-2 flex-wrap">
                  <CredibilityBadge credibility={claim.credibility} />
                  <ClaimStatusBadge status={claim.status} />
                </div>
                <p className={ps.body}>{claim.claim}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {contractor.uap_claims.length > 0 && <hr className={ps.divider} />}

      {/* Documented Contracts */}
      {contractor.known_contracts.length > 0 && (
        <section className="py-6 space-y-4">
          <h2 className={ps.h3}>Documented Contracts</h2>
          <div className="space-y-2">
            {contractor.known_contracts.map((c, i) => {
              const cfg = CREDIBILITY_CONFIG[c.evidence_status] ?? CREDIBILITY_CONFIG['alleged'];
              return (
                <div key={i} className={`${ps.infoCard} flex items-start gap-2`}>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.className}`}>
                    {cfg.label}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={ps.body}>{c.description}</p>
                    {c.program_id && (
                      <Link
                        href={`/programs/${c.program_id}`}
                        className="text-xs text-primary hover:underline mt-1 inline-block"
                      >
                        View program &rarr;
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {contractor.known_contracts.length > 0 && <hr className={ps.divider} />}

      {/* Connected Key Figures */}
      {contractor.connected_figures.length > 0 && (
        <section className="py-6 space-y-4">
          <h2 className={ps.h3}>Connected Key Figures</h2>
          <div className="space-y-2">
            {contractor.connected_figures.map(fig => (
              <div key={fig.id} className={ps.listItem}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link
                      href={`/figures/${fig.id}?backHref=${encodeURIComponent(`/contractors/${contractor.id}`)}&backLabel=${encodeURIComponent(contractor.name)}`}
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
        </section>
      )}

      {contractor.connected_figures.length > 0 && <hr className={ps.divider} />}

      {/* Connected Programs */}
      {contractor.connected_programs && contractor.connected_programs.length > 0 && (
        <section className="py-6 space-y-4">
          <h2 className={ps.h3}>Connected Programs</h2>
          <div className="space-y-2">
            {contractor.connected_programs.map((prog, i) => (
              <div key={i} className={ps.listItem}>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {prog.program_id ? (
                      <Link
                        href={`/programs/${prog.program_id}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {prog.program_name}
                      </Link>
                    ) : (
                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {prog.program_name}
                      </span>
                    )}
                  </div>
                  <p className={`${ps.bodyMuted} mt-0.5`}>{prog.relationship}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {contractor.connected_programs && contractor.connected_programs.length > 0 && <hr className={ps.divider} />}

      {/* Related Documents */}
      {contractor.related_documents && contractor.related_documents.length > 0 && (
        <section className="py-6 space-y-4">
          <h2 className={ps.h3}>Related Documents</h2>
          <div className="space-y-2">
            {contractor.related_documents.map((doc, i) => (
              <div key={i} className={ps.listItem}>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/documents/${doc.doc_id}`}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {doc.doc_name}
                  </Link>
                  <p className={`${ps.bodyMuted} mt-0.5`}>{doc.relationship}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {contractor.related_documents && contractor.related_documents.length > 0 && <hr className={ps.divider} />}

      {/* Sources */}
      {contractor.sources.length > 0 && (
        <section className="py-6 space-y-4">
          <h2 className={ps.h3}>Sources</h2>
          <div className="space-y-2">
            {contractor.sources.map((src, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-start gap-0.5 sm:gap-3">
                <span className={`${ps.label} sm:shrink-0 sm:min-w-[80px] sm:mt-0.5`}>{src.type}</span>
                <div className="flex-1 min-w-0">
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
                  {src.notes && (
                    <p className={`${ps.muted} mt-0.5`}>{src.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};

export default ContractorDetail;
