/**
 * Interactive CLI review of extracted videos.
 * Moves approved files from extracted/ to approved/.
 * Prints a summary of what was extracted for human review.
 *
 * Usage: node scripts/gerb/review.js [--video VIDEO_ID]
 *
 * Options:
 *   --video ID    Review a specific video
 *   --all         Auto-approve all pending (use with care)
 *   --summary     Print summary stats without reviewing
 */
const fs   = require('fs');
const path = require('path');
const cfg  = require('./config');

function loadPending() {
  if (!fs.existsSync(cfg.extractedDir)) return [];
  return fs.readdirSync(cfg.extractedDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const id = f.replace('.json', '');
      const approvedPath = path.join(cfg.approvedDir, f);
      if (fs.existsSync(approvedPath)) return null; // already approved
      return {
        id,
        file: path.join(cfg.extractedDir, f),
        data: JSON.parse(fs.readFileSync(path.join(cfg.extractedDir, f), 'utf8')),
      };
    })
    .filter(Boolean);
}

function printSummary(video) {
  const d = video.data;
  const sep = '-'.repeat(70);
  console.log(`\n${sep}`);
  console.log(`VIDEO:   ${d.title}`);
  console.log(`DATE:    ${d.published_at?.slice(0, 10)}`);
  console.log(`URL:     https://www.youtube.com/watch?v=${d.video_id}`);
  console.log(sep);
  console.log(`SUMMARY: ${d.summary}`);
  console.log(sep);

  if (d.acronyms?.length) {
    console.log(`\nACRONYMS (${d.acronyms.length}):`);
    d.acronyms.forEach(a => {
      console.log(`  [${a.confidence.toUpperCase()}] ${a.term} = ${a.expansion}`);
      if (a.definition) console.log(`         ${a.definition.slice(0, 100)}`);
    });
  }

  if (d.programs_mentioned?.length) {
    console.log(`\nPROGRAMS MENTIONED: ${d.programs_mentioned.join(', ')}`);
  }

  if (d.people_mentioned?.length) {
    console.log(`PEOPLE MENTIONED:   ${d.people_mentioned.join(', ')}`);
  }

  if (d.events?.length) {
    console.log(`\nEVENTS:`);
    d.events.forEach(e => console.log(`  ${e.year}: ${e.description}`));
  }

  if (d.key_claims?.length) {
    console.log(`\nKEY CLAIMS:`);
    d.key_claims.forEach(c => console.log(`  [${c.confidence}] ${c.claim}`));
  }

  if (d.topics?.length) {
    console.log(`\nTOPICS: ${d.topics.join(', ')}`);
  }
}

function approve(video) {
  const dest = path.join(cfg.approvedDir, `${video.id}.json`);
  fs.copyFileSync(video.file, dest);
  console.log(`Approved: ${video.id}`);
}

async function promptApprove(id) {
  return new Promise(resolve => {
    process.stdout.write(`\nApprove this video? (y/n/s=skip): `);
    process.stdin.once('data', d => {
      const ans = d.toString().trim().toLowerCase();
      resolve(ans);
    });
  });
}

async function main() {
  const args   = process.argv.slice(2);
  const autoAll = args.includes('--all');
  const summaryOnly = args.includes('--summary');
  const specificId = args.includes('--video') ? args[args.indexOf('--video') + 1] : null;

  const pending = loadPending();

  if (summaryOnly) {
    const approvedCount = fs.existsSync(cfg.approvedDir)
      ? fs.readdirSync(cfg.approvedDir).filter(f => f.endsWith('.json')).length
      : 0;
    const extractedCount = fs.existsSync(cfg.extractedDir)
      ? fs.readdirSync(cfg.extractedDir).filter(f => f.endsWith('.json')).length
      : 0;
    console.log(`Extracted:    ${extractedCount}`);
    console.log(`Approved:     ${approvedCount}`);
    console.log(`Pending review: ${pending.length}`);
    return;
  }

  if (pending.length === 0) {
    console.log('No pending extractions to review.');
    return;
  }

  const toReview = specificId
    ? pending.filter(v => v.id === specificId)
    : pending;

  if (toReview.length === 0) {
    console.log(`No pending extraction found for video: ${specificId}`);
    return;
  }

  console.log(`\nPending review: ${toReview.length} videos`);

  if (autoAll) {
    for (const v of toReview) {
      printSummary(v);
      approve(v);
    }
    console.log(`\nAuto-approved ${toReview.length} videos.`);
    return;
  }

  process.stdin.setEncoding('utf8');
  let approved = 0;
  let skipped  = 0;

  for (const v of toReview) {
    printSummary(v);
    const ans = await promptApprove(v.id);
    if (ans === 'y') {
      approve(v);
      approved++;
    } else {
      console.log(`Skipped: ${v.id}`);
      skipped++;
    }
  }

  process.stdin.destroy();
  console.log(`\nApproved: ${approved} | Skipped: ${skipped}`);
  if (approved > 0) {
    console.log('\nRun `node scripts/gerb/compile-contributions.js` to generate contribution files.');
  }
}

main().catch(e => { console.error(e); process.exit(1); });
