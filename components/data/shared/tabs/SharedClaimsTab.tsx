import { FC } from 'react';
import { ps } from '../profileStyles';
import ClaimsStatusBar from '../ClaimsStatusBar';
import { statusConfig } from '../profileConstants';

interface Claim {
  id?: string;
  category?: string;
  claim: string;
  status: string;
  basis?: string;
  notes?: string;
}

interface SharedClaimsTabProps {
  claims: Claim[];
  variant?: 'category' | 'basis';
}

const SharedClaimsTab: FC<SharedClaimsTabProps> = ({ claims, variant = 'category' }) => {
  return (
    <div className="space-y-5">
      <ClaimsStatusBar claims={claims} />
      {claims.map((claim, i) => {
        const cfg = statusConfig[claim.status] ?? { label: claim.status, classes: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' };
        return (
          <div key={claim.id ?? i} className={`${ps.borderCardLg} space-y-2`}>
            <div className="flex items-start justify-between gap-3">
              {variant === 'category' ? (
                <p className={ps.label}>{claim.category}</p>
              ) : (
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-snug">{claim.claim}</p>
              )}
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${cfg.classes}`}>{cfg.label}</span>
            </div>
            {variant === 'category' && (
              <p className={`${ps.value} leading-relaxed`}>{claim.claim}</p>
            )}
            {variant === 'basis' && claim.basis && (
              <p className="text-xs text-gray-500 leading-relaxed">{claim.basis}</p>
            )}
            {claim.notes && (
              <p className={`${ps.meta} border-t border-gray-100 dark:border-gray-700 pt-2 italic`}>{claim.notes}</p>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default SharedClaimsTab;
