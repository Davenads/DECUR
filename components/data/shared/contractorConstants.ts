import type { ContractorEvidenceStatus } from '../../../types/data';

export const CREDIBILITY_CONFIG: Record<
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

export const STATUS_BADGE: Record<'active' | 'defunct', string> = {
  'active':  'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  'defunct': 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
};

export const CLAIM_STATUS_CONFIG: Record<
  'documented' | 'alleged' | 'disputed',
  { label: string; className: string }
> = {
  'documented': { label: 'Documented', className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  'alleged':    { label: 'Alleged',    className: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
  'disputed':   { label: 'Disputed',   className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
};
