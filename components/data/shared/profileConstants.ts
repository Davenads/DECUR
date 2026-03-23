/* Shared constants used across all insider profile components */

export const statusConfig: Record<string, { label: string; classes: string }> = {
  'unverified':            { label: 'Unverified',             classes: 'bg-gray-100 text-gray-600' },
  'partially-verified':    { label: 'Partially Verified',     classes: 'bg-blue-100 text-blue-700' },
  'disputed':              { label: 'Disputed',               classes: 'bg-amber-100 text-amber-700' },
  'contested':             { label: 'Contested',              classes: 'bg-orange-100 text-orange-700' },
  'partially-contradicted':{ label: 'Partially Contradicted', classes: 'bg-red-100 text-red-600' },
  'verified':              { label: 'Verified',               classes: 'bg-green-100 text-green-700' },
};

export const statusBarConfig: Array<{ key: string; label: string; bar: string; dot: string }> = [
  { key: 'verified',              label: 'Verified',              bar: 'bg-green-500',  dot: 'bg-green-500'  },
  { key: 'partially-verified',    label: 'Partially Verified',    bar: 'bg-blue-400',   dot: 'bg-blue-400'   },
  { key: 'unverified',            label: 'Unverified',            bar: 'bg-gray-300',   dot: 'bg-gray-400'   },
  { key: 'disputed',              label: 'Disputed',              bar: 'bg-amber-400',  dot: 'bg-amber-400'  },
  { key: 'contested',             label: 'Contested',             bar: 'bg-orange-400', dot: 'bg-orange-400' },
  { key: 'partially-contradicted',label: 'Partially Contradicted',bar: 'bg-red-400',    dot: 'bg-red-400'    },
];
