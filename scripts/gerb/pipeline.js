/**
 * Full Gerb pipeline orchestrator.
 * Runs: fetch-channel -> fetch-transcripts -> extract
 *
 * Designed for PM2 cron scheduling (daily/weekly runs).
 * Each step is idempotent -- already-processed items are skipped.
 *
 * Usage:
 *   node scripts/gerb/pipeline.js               # full run
 *   node scripts/gerb/pipeline.js --skip-fetch  # skip channel listing (transcripts + extraction only)
 *   node scripts/gerb/pipeline.js --limit 10    # limit transcripts and extractions to 10 each
 *
 * Required env vars:
 *   YOUTUBE_API_KEY    - for channel video listing
 *   ANTHROPIC_API_KEY  - for extraction
 *
 * Optional:
 *   GERB_SKIP_CHANNEL_FETCH=1  - skip re-fetching channel (env-based skip)
 */
const { execSync } = require('child_process');
const path         = require('path');

const args         = process.argv.slice(2);
const skipFetch    = args.includes('--skip-fetch') || process.env.GERB_SKIP_CHANNEL_FETCH === '1';
const limitArg     = args.indexOf('--limit');
const limit        = limitArg !== -1 ? args[limitArg + 1] : null;

function run(script, extraArgs = '') {
  const scriptPath = path.join(__dirname, script);
  const cmd = `node "${scriptPath}" ${extraArgs}`.trim();
  console.log(`\n>>> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: process.env });
}

function logSection(msg) {
  const line = '='.repeat(60);
  console.log(`\n${line}\n  ${msg}\n${line}`);
}

async function main() {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] Gerb pipeline starting...`);

  if (!skipFetch) {
    if (!process.env.YOUTUBE_API_KEY) {
      console.warn('WARNING: YOUTUBE_API_KEY not set. Skipping channel fetch.');
      console.warn('Run with YOUTUBE_API_KEY to update the video index.');
    } else {
      logSection('Step 1/3: Fetch channel video list');
      run('fetch-channel.js');
    }
  } else {
    console.log('Skipping channel fetch (--skip-fetch)');
  }

  logSection('Step 2/3: Fetch transcripts');
  run('fetch-transcripts.js', limit ? `--limit ${limit}` : '');

  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('WARNING: ANTHROPIC_API_KEY not set. Skipping extraction.');
  } else {
    logSection('Step 3/3: Extract structured data');
    run('extract.js', limit ? `--limit ${limit}` : '');
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\n[${new Date().toISOString()}] Pipeline complete in ${elapsed}s`);
  console.log(`\nNext steps:`);
  console.log(`  1. Review extractions: node scripts/gerb/review.js`);
  console.log(`  2. Compile contributions: node scripts/gerb/compile-contributions.js`);
}

main().catch(e => { console.error(e); process.exit(1); });
