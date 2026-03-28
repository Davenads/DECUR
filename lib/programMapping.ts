/**
 * Maps organization name substrings (lowercase) to their /programs/[id] slug.
 * Used to auto-link org names on profile pages to their program detail pages.
 * Keys are lowercase substrings; the match is a `.includes()` check.
 */
export const ORG_PROGRAM_MAP: Array<[string, string]> = [
  ['all-domain anomaly resolution office', 'aaro'],
  ['aaro', 'aaro'],
  ['advanced aerospace weapon system applications', 'aawsap'],
  ['aawsap', 'aawsap'],
  ['to the stars academy', 'ttsa'],
  ['ttsa', 'ttsa'],
  ['national institute for discovery science', 'nids'],
  ['nids', 'nids'],
  ['bigelow aerospace', 'bigelow-aerospace'],
  ['sol foundation', 'sol-foundation'],
  ['project blue book', 'project-blue-book'],
  ['project sign', 'project-sign'],
  ['project grudge', 'project-grudge'],
  ['kona blue', 'kona-blue'],
  ['immaculate constellation', 'immaculate-constellation'],
];

/**
 * Returns the /programs/[id] slug for a given organization name, or null if
 * the organization isn't mapped to a known program.
 */
export function getProgramId(org: string): string | null {
  const lower = org.toLowerCase();
  for (const [key, id] of ORG_PROGRAM_MAP) {
    if (lower.includes(key)) return id;
  }
  return null;
}
