import { FC } from 'react';

export interface ArgumentItem {
  /** Optional category label shown above the claim text */
  category?: string;
  claim: string;
}

interface ArgumentsSectionProps {
  type: 'supporting' | 'against';
  items: ArgumentItem[];
  /** Override the default section heading */
  label?: string;
}

/**
 * Renders a labelled list of credibility arguments with consistent
 * green (supporting) or red (against) theming — including dark mode.
 *
 * Accepts items as `{ claim, category? }` objects.
 * To pass a plain string array, map first:
 *   items={strings.map(claim => ({ claim }))}
 */
const ArgumentsSection: FC<ArgumentsSectionProps> = ({ type, items, label }) => {
  const isSupporting = type === 'supporting';

  const headingClass = isSupporting
    ? 'text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide mb-3 flex items-center gap-2'
    : 'text-sm font-semibold text-red-600 dark:text-red-400 uppercase tracking-wide mb-3 flex items-center gap-2';

  const dotClass = isSupporting
    ? 'w-2 h-2 rounded-full bg-green-500 inline-block shrink-0'
    : 'w-2 h-2 rounded-full bg-red-500 inline-block shrink-0';

  const cardClass = isSupporting
    ? 'border border-green-100 dark:border-green-800/50 bg-green-50/50 dark:bg-green-900/10 rounded-lg p-4'
    : 'border border-red-100 dark:border-red-800/50 bg-red-50/50 dark:bg-red-900/10 rounded-lg p-4';

  const categoryClass = isSupporting
    ? 'text-xs font-medium text-green-700 dark:text-green-400 mb-1'
    : 'text-xs font-medium text-red-600 dark:text-red-400 mb-1';

  const defaultLabel = isSupporting ? 'Supporting Arguments' : 'Arguments Against';

  return (
    <div>
      <h4 className={headingClass}>
        <span className={dotClass} />
        {label ?? defaultLabel}
      </h4>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className={cardClass}>
            {item.category && (
              <p className={categoryClass}>{item.category}</p>
            )}
            <p className="text-sm text-gray-700 dark:text-gray-300">{item.claim}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArgumentsSection;
