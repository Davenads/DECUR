/**
 * Canonical disclosure type configuration.
 * Single source of truth for all disclosure type labels, badge colors, and dot colors.
 * Import from here instead of defining local maps in individual components.
 */

export const DISCLOSURE_TYPE_LABELS: Record<string, string> = {
  'article':                 'Article',
  'written':                 'Book / Written',
  'print':                   'Print',
  'television':              'Television',
  'film':                    'Film',
  'documentary':             'Documentary',
  'podcast':                 'Podcast',
  'radio':                   'Radio',
  'interview':               'Interview',
  'speech':                  'Speech',
  'congressional-testimony': 'Congressional Testimony',
  'congressional-briefing':  'Congressional Briefing',
  'formal-complaint':        'Formal Complaint',
  'declassification':        'Declassification',
  'academic-paper':          'Academic Paper',
  'conference':              'Conference',
  'symposium':               'Symposium',
  'preprint':                'Preprint',
};

/** Tailwind badge classes for disclosure type pills */
export const DISCLOSURE_TYPE_COLORS: Record<string, string> = {
  'article':                 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  'written':                 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  'print':                   'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  'television':              'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  'film':                    'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
  'documentary':             'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  'podcast':                 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  'radio':                   'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  'interview':               'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300',
  'speech':                  'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300',
  'congressional-testimony': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  'congressional-briefing':  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
  'formal-complaint':        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  'declassification':        'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  'academic-paper':          'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300',
  'conference':              'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  'symposium':               'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300',
  'preprint':                'bg-slate-100 dark:bg-slate-900/30 text-slate-700 dark:text-slate-300',
};

/** Tailwind dot classes for timeline indicator dots */
export const DISCLOSURE_TYPE_DOT: Record<string, string> = {
  'article':                 'bg-blue-400',
  'written':                 'bg-blue-400',
  'print':                   'bg-blue-400',
  'television':              'bg-purple-400',
  'film':                    'bg-purple-400',
  'documentary':             'bg-amber-400',
  'podcast':                 'bg-green-400',
  'radio':                   'bg-green-400',
  'interview':               'bg-teal-400',
  'speech':                  'bg-indigo-400',
  'congressional-testimony': 'bg-amber-400',
  'congressional-briefing':  'bg-amber-400',
  'formal-complaint':        'bg-red-400',
  'declassification':        'bg-red-400',
  'academic-paper':          'bg-cyan-400',
  'conference':              'bg-violet-400',
  'symposium':               'bg-violet-400',
  'preprint':                'bg-slate-400',
};

/** Returns the human-readable label for a disclosure type, falling back to the raw type string. */
export function disclosureLabel(type: string): string {
  return DISCLOSURE_TYPE_LABELS[type] ?? type;
}
