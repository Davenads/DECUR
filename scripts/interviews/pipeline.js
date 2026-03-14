/**
 * Interviews pipeline orchestrator.
 * Runs: fetch-channel -> fetch-transcripts -> extract
 *
 * Each step is idempotent -- already-processed items are skipped.
 *
 * Usage:
 *   node scripts/interviews/pipeline.js --channel jesse-michels
 *   node scripts/interviews/pipeline.js --channel jesse-michels --skip-fetch
 *   node scripts/interviews/pipeline.js --channel jesse-michels --limit 5
 *
 * Required env vars:
 *   YOUTUBE_API_KEY    - for channel video listing
 *   ANTHROPIC_API_KEY  - for extraction
 */
const { execSync } = require('child_process');
const path         = require('path');

const args       = process.argv.slice(2);
const channelIdx = args.indexOf('--channel');
const channelSlug = channelIdx !== -1 ? args[channelIdx + 1] : null;

if (!channelSlug) {
  console.error('Error: --channel <slug> is required.');
  process.exit(1);
}

const skipFetch = args.includes('--skip-fetch');
const limitArg  = args.indexOf('--limit');
const limit     = limitArg !== -1 ? args[limitArg + 1] : null;

function run(script, extraArgs = '') {
  const scriptPath = path.join(__dirname, script);
  const cmd = `node "${scriptPath}" --channel ${channelSlug} ${extraArgs}`.trim();
  console.log(`\n>>> ${cmd}`);
  execSync(cmd, { stdio: 'inherit', env: process.env });
}

function logSection(msg) {
  const line = '='.repeat(60);
  console.log(`\n${line}\n  ${msg}\n${line}`);
}

async function main() {
  const start = Date.now();
  console.log(`[${new Date().toISOString()}] Interviews pipeline starting (channel: ${channelSlug})...`);

  if (!skipFetch) {
    if (!process.env.YOUTUBE_API_KEY) {
      console.warn('WARNING: YOUTUBE_API_KEY not set. Skipping channel fetch.');
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
  console.log(`  1. Review:  node scripts/interviews/review.js --channel ${channelSlug}`);
  console.log(`  2. Compile: node scripts/interviews/compile-contributions.js --channel ${channelSlug}`);
}

main().catch(e => { console.error(e); process.exit(1); });
