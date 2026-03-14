/**
 * Compiles all approved interview extractions into platform-ready contribution files.
 * Produces glossary, network candidates, and programs — same shape as Gerb output.
 * Also produces a speaker_claims.json with attributed claims per guest.
 *
 * Usage: node scripts/interviews/compile-contributions.js --channel <slug>
 *
 * Outputs:
 *   data/channels/interviews/<slug>/contributions/glossary.json
 *   data/channels/interviews/<slug>/contributions/network.json
 *   data/channels/interviews/<slug>/contributions/programs.json
 *   data/channels/interviews/<slug>/contributions/speaker_claims.json
 */
const fs   = require('fs');
const path = require('path');
const cfg  = require('./config');

function loadJsonFiles(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.json'))
    .map(f => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')));
}

async function main() {
  const approved = loadJsonFiles(cfg.approvedDir);

  if (approved.length === 0) {
    process.stderr.write('No approved extractions found. Run review.js first.\n');
    process.exit(0);
  }

  if (!fs.existsSync(cfg.contributionsDir)) fs.mkdirSync(cfg.contributionsDir, { recursive: true });

  process.stderr.write(`Compiling ${approved.length} approved extractions for ${cfg.channelName}...\n`);

  // --- Glossary ---
  const confidenceOrder = { high: 3, medium: 2, low: 1 };
  const acronymMap      = new Map();

  for (const video of approved) {
    for (const a of (video.acronyms ?? [])) {
      const key           = a.term.toUpperCase();
      const existing      = acronymMap.get(key);
      const incomingScore = confidenceOrder[a.confidence] ?? 0;
      const existingScore = confidenceOrder[existing?.confidence] ?? 0;

      if (!existing || incomingScore > existingScore) {
        acronymMap.set(key, {
          term:       a.term.toUpperCase(),
          expansion:  a.expansion,
          definition: a.definition,
          confidence: a.confidence,
          source:     cfg.channelSlug,
          sources:    [{ video_id: video.video_id, title: video.title, youtube_url: video.youtube_url }],
        });
      } else {
        existing.sources.push({ video_id: video.video_id, title: video.title, youtube_url: video.youtube_url });
      }
    }
  }

  const glossary = Array.from(acronymMap.values())
    .sort((a, b) => a.term.localeCompare(b.term));

  fs.writeFileSync(
    path.join(cfg.contributionsDir, 'glossary.json'),
    JSON.stringify(glossary, null, 2)
  );
  process.stderr.write(`Glossary: ${glossary.length} terms\n`);

  // --- Network node candidates ---
  const personCount = new Map();

  for (const video of approved) {
    for (const name of (video.people_mentioned ?? [])) {
      personCount.set(name, (personCount.get(name) ?? 0) + 1);
    }
  }

  const network = Array.from(personCount.entries())
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .map(([name, count]) => ({ name, mention_count: count, source: cfg.channelSlug }));

  fs.writeFileSync(
    path.join(cfg.contributionsDir, 'network.json'),
    JSON.stringify(network, null, 2)
  );
  process.stderr.write(`Network candidates: ${network.length} nodes (mentioned 2+ times)\n`);

  // --- Programs ---
  const programSet = new Set();
  for (const video of approved) {
    for (const p of (video.programs_mentioned ?? [])) programSet.add(p);
  }

  const programs = Array.from(programSet).sort();
  fs.writeFileSync(
    path.join(cfg.contributionsDir, 'programs.json'),
    JSON.stringify(programs, null, 2)
  );
  process.stderr.write(`Programs: ${programs.length} unique\n`);

  // --- Speaker claims (interviews-specific) ---
  // Groups key_claims by guest name across all approved videos.
  const claimsByGuest = {};

  for (const video of approved) {
    const guest = video.speakers?.guest ?? 'unknown';
    if (!claimsByGuest[guest]) claimsByGuest[guest] = [];

    for (const c of (video.key_claims ?? [])) {
      if (c.attributed_to === video.speakers?.host) continue; // skip host filler
      claimsByGuest[guest].push({
        claim:                  c.claim,
        confidence:             c.confidence,
        attribution_confidence: c.attribution_confidence,
        video_id:               video.video_id,
        title:                  video.title,
        youtube_url:            video.youtube_url,
        date:                   video.published_at?.slice(0, 10),
      });
    }
  }

  fs.writeFileSync(
    path.join(cfg.contributionsDir, 'speaker_claims.json'),
    JSON.stringify(claimsByGuest, null, 2)
  );
  const totalClaims = Object.values(claimsByGuest).reduce((s, arr) => s + arr.length, 0);
  process.stderr.write(`Speaker claims: ${totalClaims} claims across ${Object.keys(claimsByGuest).length} guests\n`);

  process.stderr.write(`\n=== Done ===\n`);
  process.stderr.write(`Output: ${cfg.contributionsDir}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
