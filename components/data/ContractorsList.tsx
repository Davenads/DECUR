import Link from 'next/link';
import { FC } from 'react';
import type { ContractorEntry } from '../../types/data';
import { ps } from './shared/profileStyles';
import { CREDIBILITY_CONFIG, STATUS_BADGE } from './shared/contractorConstants';

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

interface ContractorsListProps {
  contractors: ContractorEntry[];
}

const ContractorsList: FC<ContractorsListProps> = ({ contractors }) => {
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
          const documentedCount = c.uap_claims.filter(cl => cl.status === 'documented').length;
          const allegedCount    = c.uap_claims.filter(cl => cl.status === 'alleged').length;
          const disputedCount   = c.uap_claims.filter(cl => cl.status === 'disputed').length;

          return (
            <Link
              key={c.id}
              href={`/contractors/${c.id}`}
              className="block border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
            >
              {/* Header row */}
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                      {c.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[c.status]}`}>
                      {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-medium">
                      Contractor
                    </span>
                  </div>
                  <p className={`${ps.meta} mb-2`}>
                    Est. {c.founded} &middot; {c.headquarters}
                    {c.sublabel ? ` \u00b7 ${c.sublabel}` : ''}
                  </p>
                  <p className={`${ps.body} line-clamp-2`}>{c.summary}</p>
                </div>
                <span className="text-primary text-sm shrink-0 mt-1 group-hover:translate-x-0.5 transition-transform">
                  View &rarr;
                </span>
              </div>

              {/* Claim summary pills */}
              {c.uap_claims.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700/50">
                  {documentedCount > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CREDIBILITY_CONFIG['documented'].className}`}>
                      {documentedCount} Documented
                    </span>
                  )}
                  {allegedCount > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CREDIBILITY_CONFIG['alleged'].className}`}>
                      {allegedCount} Alleged
                    </span>
                  )}
                  {disputedCount > 0 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${CREDIBILITY_CONFIG['disputed'].className}`}>
                      {disputedCount} Disputed
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default ContractorsList;
