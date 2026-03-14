/**
 * Interactive CLI review of extracted interview videos.
 * Moves approved files from extracted/ to approved/.
 *
 * Shows speaker attribution alongside claims so you can spot
 * misattributions before the data is compiled.
 *
 * Usage: node scripts/interviews/review.js --channel <slug> [--video VIDEO_ID] [--all] [--summary]
 */
const fs   = require('fs');
const path = require('path');
const cfg  = require('./config');

function loadPending() {
  if (!fs.existsSync(cfg.extractedDir)) return [];
  return fs.readdirSync(cfg.extractedDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const approvedPath = path.join(cfg.approvedDir, f);
      if (fs.existsSync(approvedPath)) return null;
      return {
        id:   f.replace('.json', ''),
        file: path.join(cfg.extractedDir, f),
        data: JSON.parse(fs.readFileSync(path.join(cfg.extractedDir, f), 'utf8')),
      };
    })
    .filter(Boolean);
}

function printSummary(video) {
  const d   = video.data;
  const sep = '-'.repeat(70);
  console.log(`\n${sep}`);
  console.log(`VIDEO:   ${d.title}`);
  console.log(`DATE:    ${d.published_at?.slice(0, 10)}`);
  console.log(`URL:     https://www.youtube.com/watch?v=${d.video_id}`);
  console.log(sep);
  console.log(`SUMMARY: ${d.summary}`);

  if (d.speakers) {
    console.log(`\nSPEAKERS:`);
    console.log(`  Host:  ${d.speakers.host}`);
    console.log(`  Guest: ${d.speakers.guest}`);
  }

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
    console.log(`\nKEY CLAIMS (with attribution):`);
    d.key_claims.forEach(c => {
      const attr = c.attributed_to ?? 'unknown';
      const attrConf = c.attribution_confidence ?? '?';
      console.log(`  [${c.confidence}] [${attr} / ${attrConf}] ${c.claim}`);
    });
  }

  if (d.topics?.length) {
    console.log(`\nTOPICS: ${d.topics.join(', ')}`);
  }
}

function approve(video) {
  if (!fs.existsSync(cfg.approvedDir)) fs.mkdirSync(cfg.approvedDir, { recursive: true });
  const dest = path.join(cfg.approvedDir, `${video.id}.json`);
  fs.copyFileSync(video.file, dest);
  console.log(`Approved: ${video.id}`);
}

async function promptApprove(video) {
  return new Promise(resolve => {
    process.stdout.write('\nApprove? [y/n/q]: ');
    process.stdin.once('data', d => {
      const ans = d.toString().trim().toLowerCase();
      resolve(ans);
    });
  });
}

async function main() {
  const args       = process.argv.slice(2);
  const autoAll    = args.includes('--all');
  const summaryOnly = args.includes('--summary');
  const videoArg   = args.indexOf('--video');
  const targetId   = videoArg !== -1 ? args[videoArg + 1] : null;

  let pending = loadPending();

  if (targetId) {
    pending = pending.filter(v => v.id === targetId);
    if (!pending.length) {
      console.log(`No pending extraction found for video ${targetId}`);
      process.exit(0);
    }
  }

  if (summaryOnly) {
    console.log(`\nChannel: ${cfg.channelName}`);
    console.log(`Pending review: ${pending.length} videos`);
    pending.forEach(v => {
      const g = v.data.speakers?.guest ?? 'unknown guest';
      console.log(`  ${v.id}  ${v.data.title.slice(0, 55).padEnd(55)} [guest: ${g}]`);
    });
    process.exit(0);
  }

  if (!pending.length) {
    console.log('No pending extractions to review.');
    process.exit(0);
  }

  if (autoAll) {
    pending.forEach(v => { printSummary(v); approve(v); });
    console.log(`\nAuto-approved ${pending.length} videos.`);
    process.exit(0);
  }

  process.stdin.setEncoding('utf8');

  for (const video of pending) {
    printSummary(video);
    const ans = await promptApprove(video);
    if (ans === 'q') break;
    if (ans === 'y') approve(video);
    else console.log('Skipped.');
  }

  process.stdin.pause();
}

main().catch(e => { console.error(e); process.exit(1); });
