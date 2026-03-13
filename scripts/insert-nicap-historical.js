#!/usr/bin/env node
/**
 * Reads nicap-candidates.json, applies final filters, deduplicates against
 * existing ufotimeline.json, and inserts approved entries.
 *
 * Selection strategy:
 *   - Require BBU status (Blue Book Unknown = highest government provenance)
 *   - Require dedicated NICAP detail page (article_url ending in _dir.htm or .htm)
 *   - Cap 1950s at MAX_PER_DECADE to avoid oversaturation (it has 334 BBU+detail alone)
 *   - All other decades: no cap
 *   - Skip entries already represented in ufotimeline.json (title similarity check)
 */

const fs = require('fs');
const path = require('path');

const CANDIDATES_FILE = path.join(__dirname, 'output', 'nicap-candidates.json');
const TIMELINE_FILE = path.join(__dirname, '..', 'data', 'ufotimeline.json');

// Max entries per decade to keep balance
const DECADE_CAPS = {
  1940: 60,
  1950: 100,
  1960: 80,
  1970: 30,
  1980: 20,
};

function normalize(str) {
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function main() {
  const candidateData = JSON.parse(fs.readFileSync(CANDIDATES_FILE, 'utf8'));
  const timeline = JSON.parse(fs.readFileSync(TIMELINE_FILE, 'utf8'));

  // Build set of existing titles (normalized) for dedup
  const existingTitles = new Set(timeline.map(e => normalize(e.title || '')));
  const existingYearLoc = new Set(
    timeline
      .filter(e => e.year && e.title)
      .map(e => `${e.year}:${normalize(e.title).slice(0, 20)}`)
  );

  // Step 1: BBU + has a real detail page
  const pool = candidateData.candidates.filter(e => {
    if (!e._criteria.BBU) return false;
    if (!e.article_url) return false;
    // Must be a real detail page or external doc, not just the chronology page
    const url = e.article_url.toLowerCase();
    if (url.includes('fullrep.htm') || url.includes('chronos')) return false;
    return true;
  });

  console.log(`Pool after BBU + detail page filter: ${pool.length}`);

  // Step 2: Deduplicate against existing timeline
  const deduped = pool.filter(e => {
    const normTitle = normalize(e.title);
    const yearKey = `${e.year}:${normTitle.slice(0, 20)}`;
    if (existingTitles.has(normTitle)) return false;
    if (existingYearLoc.has(yearKey)) return false;
    return true;
  });

  console.log(`After dedup against existing timeline: ${deduped.length}`);

  // Step 3: Apply decade caps, keeping chronological order within each decade
  const byDecade = {};
  deduped.forEach(e => {
    const d = Math.floor(e.year / 10) * 10;
    if (!byDecade[d]) byDecade[d] = [];
    byDecade[d].push(e);
  });

  const selected = [];
  for (const [decade, entries] of Object.entries(byDecade)) {
    const cap = DECADE_CAPS[parseInt(decade)] || 40;
    const take = entries.slice(0, cap);
    console.log(`  ${decade}s: ${entries.length} available, taking ${take.length}`);
    selected.push(...take);
  }

  selected.sort((a, b) => a.date.localeCompare(b.date));
  console.log(`\nSelected: ${selected.length} entries to insert`);

  // Step 4: Assign IDs above current max
  const maxId = Math.max(...timeline.map(e => e.id || 0));
  let nextId = maxId + 1;

  const newEntries = selected.map(e => {
    // Strip internal staging fields
    const { _staging_id, _criteria, ...clean } = e;
    return {
      id: nextId++,
      date: clean.date,
      year: clean.year,
      title: clean.title,
      excerpt: clean.excerpt,
      categories: clean.categories,
      source_url: clean.source_url,
      source: clean.source,
      article_url: clean.article_url,
      article_type: clean.article_type,
    };
  });

  // Step 5: Append to timeline and write
  const updated = [...timeline, ...newEntries];
  fs.writeFileSync(TIMELINE_FILE, JSON.stringify(updated, null, 2));

  const breakdown = {};
  newEntries.forEach(e => {
    const d = `${Math.floor(e.year / 10) * 10}s`;
    breakdown[d] = (breakdown[d] || 0) + 1;
  });

  console.log(`\n✓ Inserted ${newEntries.length} entries into ufotimeline.json`);
  console.log('  Decade breakdown:', breakdown);
  console.log(`  Timeline total: ${updated.length} (was ${timeline.length})`);
}

main();
