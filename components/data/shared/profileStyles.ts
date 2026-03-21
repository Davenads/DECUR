/**
 * Shared Tailwind class constants for key figure profile components.
 *
 * Update a value here to change it everywhere. All strings include
 * dark-mode variants so new components get them for free.
 *
 * Usage:  import { ps } from '../shared/profileStyles';
 *         <div className={ps.infoCard}>
 */

export const ps = {
  // --- Containers ---

  /** Gray-tinted info card (service period, clearance, etc.) */
  infoCard:         'bg-gray-50 dark:bg-gray-800 rounded-lg p-4',
  infoCardSm:       'bg-gray-50 dark:bg-gray-800 rounded-lg p-3',

  /** Outlined card, no background tint */
  borderCard:       'border border-gray-200 dark:border-gray-700 rounded-lg p-4',
  borderCardLg:     'border border-gray-200 dark:border-gray-700 rounded-lg p-5',
  borderCardNoP:    'border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden',

  /** Primary-tinted accent box (program headers, connection callouts) */
  accentBox:        'bg-primary/5 border border-primary/20 rounded-lg p-4',
  accentBoxLg:      'bg-primary/5 border border-primary/20 rounded-lg p-5',

  // --- Headings ---

  h3:               'text-lg font-semibold text-gray-900 dark:text-gray-100',
  h4:               'text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide',
  h4Inline:         'font-semibold text-gray-900 dark:text-gray-100 text-sm',

  // --- Body text ---

  body:             'text-sm text-gray-700 dark:text-gray-300',
  bodyMuted:        'text-sm text-gray-600 dark:text-gray-400',
  value:            'text-sm text-gray-800 dark:text-gray-200',

  // --- Small / meta text ---

  meta:             'text-xs text-gray-500 dark:text-gray-400',
  muted:            'text-xs text-gray-400',
  label:            'text-xs font-medium text-gray-400 uppercase tracking-wide',

  // --- List items ---

  listItem:         'flex gap-2 text-sm text-gray-700 dark:text-gray-300',

  // --- Structural / dividers ---

  divider:          'border-t border-gray-100 dark:border-gray-700',
  timelineLine:     'relative pl-6 border-l-2 border-gray-100 dark:border-gray-700',
  timelineDot:      'absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white dark:border-gray-900',

  // --- Buttons (inactive filter pills) ---

  filterPill:       'text-xs px-2.5 py-1 rounded-full font-medium transition-colors duration-200 ease-in-out bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
  filterPillActive: 'text-xs px-2.5 py-1 rounded-full font-medium transition-colors duration-200 ease-in-out bg-primary text-white',
} as const;
