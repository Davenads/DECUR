/**
 * Three-phase deduplication against existing timeline data.
 *
 * Phase 1: Exact source_url match (O(1) Set lookup)
 * Phase 2: Date proximity + title similarity (cross-source event dedup)
 * Phase 3: Passed implicitly (openminds has no stable ID watermark in our data)
 */

/**
 * Simple Jaro-Winkler similarity for title matching.
 * Returns 0-1 (1 = identical).
 */
function jaroSimilarity(s1, s2) {
  if (s1 === s2) return 1;
  const len1 = s1.length, len2 = s2.length;
  if (len1 === 0 || len2 === 0) return 0;
  const matchDist = Math.floor(Math.max(len1, len2) / 2) - 1;
  const s1Matches = new Array(len1).fill(false);
  const s2Matches = new Array(len2).fill(false);
  let matches = 0;
  for (let i = 0; i < len1; i++) {
    const lo = Math.max(0, i - matchDist);
    const hi = Math.min(i + matchDist + 1, len2);
    for (let j = lo; j < hi; j++) {
      if (s2Matches[j] || s1[i] !== s2[j]) continue;
      s1Matches[i] = s2Matches[j] = true;
      matches++;
      break;
    }
  }
  if (matches === 0) return 0;
  let t = 0, k = 0;
  for (let i = 0; i < len1; i++) {
    if (!s1Matches[i]) continue;
    while (!s2Matches[k]) k++;
    if (s1[i] !== s2[k]) t++;
    k++;
  }
  return (matches / len1 + matches / len2 + (matches - t / 2) / matches) / 3;
}

function normalizeTitle(title) {
  return title.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, ' ').trim();
}

/**
 * Deduplicates `candidates` against `existing` entries.
 *
 * @param {Array} existing - Current ufotimeline.json entries
 * @param {Array} candidates - New scraped entries to check
 * @param {Object} options
 * @returns {{ kept: Array, duplicates: { phase1: number, phase2: number } }}
 */
function deduplicate(existing, candidates, options = {}) {
  const { titleSimilarityThreshold = 0.82, dateDeltaDays = 7, verbose = false } = options;

  // Phase 1: Build URL set
  const existingUrls = new Set(existing.map(e => e.source_url).filter(Boolean));

  // Phase 2: Build date-keyed index for proximity search
  // Key: YYYY-MM, value: array of { dateMs, normalizedTitle }
  const dateIndex = {};
  for (const e of existing) {
    if (!e.date || !e.title) continue;
    const monthKey = e.date.substring(0, 7);
    if (!dateIndex[monthKey]) dateIndex[monthKey] = [];
    dateIndex[monthKey].push({
      dateMs: new Date(e.date).getTime(),
      normalizedTitle: normalizeTitle(e.title),
    });
  }

  const kept = [];
  let phase1Dupes = 0;
  let phase2Dupes = 0;

  for (const candidate of candidates) {
    // Phase 1: exact URL match
    if (existingUrls.has(candidate.source_url)) {
      phase1Dupes++;
      continue;
    }

    // Phase 2: date proximity + title similarity
    const candDateMs = new Date(candidate.date).getTime();
    const deltaMs = dateDeltaDays * 24 * 60 * 60 * 1000;
    const candTitle = normalizeTitle(candidate.title);
    const lo = new Date(candDateMs - deltaMs).toISOString().substring(0, 7);
    const hi = new Date(candDateMs + deltaMs).toISOString().substring(0, 7);

    // Check months in range
    let isDupe = false;
    const monthsToCheck = new Set([lo, hi, candidate.date.substring(0, 7)]);
    for (const month of monthsToCheck) {
      const bucket = dateIndex[month] || [];
      for (const e of bucket) {
        if (Math.abs(e.dateMs - candDateMs) <= deltaMs) {
          const sim = jaroSimilarity(candTitle, e.normalizedTitle);
          if (sim >= titleSimilarityThreshold) {
            isDupe = true;
            if (verbose) console.log(`  [phase2 dupe] "${candidate.title}" ~ "${e.normalizedTitle}" (sim=${sim.toFixed(3)})`);
            break;
          }
        }
      }
      if (isDupe) break;
    }

    if (isDupe) {
      phase2Dupes++;
      continue;
    }

    kept.push(candidate);
  }

  return {
    kept,
    duplicates: { phase1: phase1Dupes, phase2: phase2Dupes },
  };
}

module.exports = { deduplicate };
