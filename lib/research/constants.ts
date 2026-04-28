/**
 * Shared constants and utility functions for the /research section.
 * Single source of truth — imported by index, papers/[id], and organizations/[id].
 * Adding a new source type, org type, or event status requires a change here only.
 */

/* ── Interfaces ─────────────────────────────────────────────────── */

export interface ResearchEvent {
  id: string;
  name: string;
  type: string;
  status: string;
  date_start: string;
  date_end: string;
  location: string;
  format?: string;
  url: string;
  organizer_name?: string;
  organizer_id?: string | null;
  description: string;
  recording_url: string | null;
}

export interface Opportunity {
  id: string;
  type: string;
  title: string;
  organization: string;
  deadline: string | null;
  amount: string | null;
  url: string;
  description: string;
  eligibility: string | null;
  status: string;
}

/* ── Source type maps ───────────────────────────────────────────── */

export const SOURCE_TYPE_LABELS: Record<string, string> = {
  'peer-reviewed':          'Peer-Reviewed',
  'government-report':      'Government Report',
  'institute-report':       'Institute Report',
  'conference-proceedings': 'Conference Proceedings',
  'book':                   'Book',
  'preprint':               'Preprint',
};

export const SOURCE_TYPE_COLORS: Record<string, string> = {
  'peer-reviewed':          'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  'government-report':      'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  'institute-report':       'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'conference-proceedings': 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  'book':                   'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  'preprint':               'bg-orange-100 dark:bg-orange-900/40 text-orange-700 dark:text-orange-300',
};

/* ── Organization maps ──────────────────────────────────────────── */

export const ORG_TYPE_LABELS: Record<string, string> = {
  'research-institute': 'Research Institute',
  'government-body':    'Government Body',
  'advocacy':           'Advocacy',
  'archive':            'Archive',
  'citizen-science':    'Citizen Science',
  'media':              'Media & Archive',
  'funding':            'Funding Body',
};

export const ORG_STATUS_COLORS: Record<string, string> = {
  'active':           'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  'reduced-activity': 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  'inactive':         'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
};

/* ── Event maps ─────────────────────────────────────────────────── */

export const EVENT_TYPE_LABELS: Record<string, string> = {
  'symposium':             'Symposium',
  'conference':            'Conference',
  'congressional-hearing': 'Congressional Hearing',
  'webinar':               'Webinar',
  'workshop':              'Workshop',
};

export const EVENT_STATUS_COLORS: Record<string, string> = {
  'upcoming': 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
  'past':     'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
  'ongoing':  'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
};

/* ── Opportunity maps ───────────────────────────────────────────── */

export const OPP_TYPE_COLORS: Record<string, string> = {
  'call-for-papers':         'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300',
  'grant':                   'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300',
  'fellowship':              'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300',
  'job-posting':             'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300',
  'participant-recruitment': 'bg-cyan-100 dark:bg-cyan-900/40 text-cyan-700 dark:text-cyan-300',
  'collaboration-request':   'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
};

export const OPP_TYPE_LABELS: Record<string, string> = {
  'call-for-papers':         'Call for Papers',
  'grant':                   'Grant',
  'fellowship':              'Fellowship',
  'job-posting':             'Job Posting',
  'participant-recruitment': 'Participant Recruitment',
  'collaboration-request':   'Collaboration Request',
};

/* ── Utility functions ──────────────────────────────────────────── */

/**
 * Derive the display status of an event from its dates rather than the JSON
 * `status` field. The JSON field acts as a manual override only for edge cases
 * like "cancelled" or "postponed" that cannot be inferred from dates alone.
 */
export function deriveEventStatus(event: ResearchEvent): string {
  if (event.status === 'cancelled' || event.status === 'postponed') return event.status;
  const now   = new Date();
  const start = new Date(event.date_start + 'T00:00:00');
  const end   = new Date(event.date_end   + 'T23:59:59');
  if (end < now)   return 'past';
  if (start > now) return 'upcoming';
  return 'ongoing';
}

/**
 * Derive the effective status of an opportunity from its deadline date.
 * If a deadline exists and has passed, treat the opportunity as expired
 * regardless of the JSON `status` field.
 */
export function deriveOpportunityStatus(opp: Opportunity): string {
  if (opp.status === 'expired') return 'expired';
  if (opp.deadline) {
    const deadline = new Date(opp.deadline + 'T23:59:59');
    if (deadline < new Date()) return 'expired';
  }
  return opp.status;
}

/** Capitalize the first letter of a string. */
export function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Convert a kebab-case tag to display form. */
export function formatTag(tag: string): string {
  return tag.replace(/-/g, ' ');
}
