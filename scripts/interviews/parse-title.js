/**
 * Utility: extract guest name from a video title.
 *
 * Strategies (tried in order, defined per channel config):
 *
 *   colon-suffix  "David Grusch Breaks Silence: Inside Secret..."
 *                  -> takes the text BEFORE the first colon as guest name
 *                  (works when guest name leads the title)
 *
 *   pipe-suffix   "The Truth About Aliens | Joe Rogan"
 *                  -> takes the text AFTER the last pipe as guest name
 *
 *   with-keyword  "Interview with Bob Lazar on UAPs"
 *                  -> extracts the noun phrase after "with"
 *
 * Returns null if no strategy matches — Claude will infer from context.
 */

/**
 * @param {string} title
 * @param {string[]} strategies  ordered list of strategy names to try
 * @param {string[]} hostAliases names to exclude (so we don't return the host as the guest)
 * @returns {string|null}
 */
function parseGuestFromTitle(title, strategies = [], hostAliases = []) {
  const hostSet = new Set(hostAliases.map(n => n.toLowerCase()));

  for (const strategy of strategies) {
    let candidate = null;

    if (strategy === 'colon-suffix') {
      const colonIdx = title.indexOf(':');
      if (colonIdx > 0) {
        candidate = title.slice(0, colonIdx).trim();
      }
    }

    if (strategy === 'pipe-suffix') {
      const pipeIdx = title.lastIndexOf('|');
      if (pipeIdx > 0) {
        candidate = title.slice(pipeIdx + 1).trim();
      }
    }

    if (strategy === 'with-keyword') {
      const m = title.match(/\bwith\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,3})/);
      if (m) {
        candidate = m[1].trim();
      }
    }

    if (candidate && candidate.length > 2 && candidate.length < 60) {
      // Reject if it matches a host alias
      if (!hostSet.has(candidate.toLowerCase())) {
        return candidate;
      }
    }
  }

  return null;
}

module.exports = { parseGuestFromTitle };
