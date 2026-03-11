/**
 * Main sync orchestrator.
 *
 * Usage:
 *   node scripts/sync/run-sync.js [--dry-run] [--verbose] [--after=YYYY-MM-DD]
 *
 * Outputs:
 *   - Updates data/ufotimeline.json in place (unless --dry-run)
 *   - Writes scripts/sync/last-sync-report.json for PR body generation
 *   - Exits with code 0 if changes, 1 if no changes (for CI detection)
 */

const fs = require('fs');
const path = require('path');
const { scrapeOpenminds } = require('./scrape-openminds');
const { deduplicate } = require('./deduplicator');

const DATA_PATH = path.join(__dirname, '../../data/ufotimeline.json');
const REPORT_PATH = path.join(__dirname, 'last-sync-report.json');

const args = process.argv.slice(2);
const DRY_RUN = args.includes('--dry-run');
const VERBOSE = args.includes('--verbose');
const afterArg = args.find(a => a.startsWith('--after='));

async function main() {
  console.log('=== DECUR Data Sync ===');
  if (DRY_RUN) console.log('[DRY RUN - no files will be written]');

  // Load existing data
  const existing = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  console.log(`Loaded ${existing.length} existing entries.`);

  // Determine cutoff date
  let afterDate;
  if (afterArg) {
    afterDate = afterArg.split('=')[1] + 'T00:00:00';
  } else {
    // Find the latest openminds entry date
    const openmindsEntries = existing.filter(e => e.source === 'openminds' && e.date);
    const latestDate = openmindsEntries
      .map(e => e.date)
      .sort()
      .pop();
    afterDate = latestDate ? latestDate + 'T00:00:00' : '2020-01-01T00:00:00';
  }
  console.log(`Fetching openminds posts after: ${afterDate}`);

  // --- Scrape ---
  let scraped = [];
  try {
    scraped = await scrapeOpenminds(afterDate, { verbose: VERBOSE });
    console.log(`Scraped ${scraped.length} candidate entries from openminds.`);
  } catch (e) {
    console.error('Scrape failed:', e.message);
    process.exit(2);
  }

  if (scraped.length === 0) {
    console.log('No new candidates found. Exiting.');
    writeReport({ added: 0, skipped: { phase1: 0, phase2: 0 }, sources: {} });
    process.exit(1); // signal "no changes"
  }

  // --- Deduplicate ---
  const { kept, duplicates } = deduplicate(existing, scraped, { verbose: VERBOSE });
  console.log(`After dedup: ${kept.length} new entries (skipped: phase1=${duplicates.phase1}, phase2=${duplicates.phase2})`);

  if (kept.length === 0) {
    console.log('All candidates were duplicates. Exiting.');
    writeReport({ added: 0, skipped: duplicates, sources: {} });
    process.exit(1); // signal "no changes"
  }

  // --- Assign IDs ---
  let maxId = Math.max(...existing.map(e => e.id || 0));
  for (const entry of kept) {
    entry.id = ++maxId;
    delete entry._wp_id; // remove temp field
  }

  // --- Count by source ---
  const sourceCount = {};
  for (const e of kept) {
    sourceCount[e.source] = (sourceCount[e.source] || 0) + 1;
  }

  // --- Merge and sort ---
  const merged = [...existing, ...kept].sort((a, b) => (a.date || '').localeCompare(b.date || ''));

  if (!DRY_RUN) {
    fs.writeFileSync(DATA_PATH, JSON.stringify(merged, null, 2) + '\n', 'utf8');
    console.log(`Wrote ${merged.length} entries to ufotimeline.json`);
  } else {
    console.log(`[DRY RUN] Would write ${merged.length} entries.`);
    if (VERBOSE) kept.slice(0, 5).forEach(e => console.log(' +', e.date, e.title?.substring(0, 60)));
  }

  // --- Write report ---
  const report = {
    timestamp: new Date().toISOString(),
    added: kept.length,
    skipped: duplicates,
    sources: sourceCount,
    sampleTitles: kept.slice(0, 8).map(e => `${e.date}: ${e.title}`),
  };
  writeReport(report);
  console.log('\nReport written to', REPORT_PATH);
  console.log(`\nDone. Added ${kept.length} new entries.`);

  process.exit(0); // signal "changes found"
}

function writeReport(report) {
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8');
}

main().catch(e => {
  console.error('Fatal error:', e);
  process.exit(2);
});
