/**
 * Compiles all approved extractions into platform-ready contribution files.
 * Merges acronyms into glossary contributions, deduplicating by term.
 *
 * Usage: node scripts/gerb/compile-contributions.js
 *
 * Outputs:
 *   data/channels/gerb/contributions/glossary.json   <- new glossary terms
 *   data/channels/gerb/contributions/network.json    <- new network nodes/links
 *   data/channels/gerb/contributions/programs.json   <- program reference list
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
    process.stderr.write('No approved extractions found in approved/\n');
    process.stderr.write('Run review.js to approve extractions first.\n');
    process.exit(0);
  }

  process.stderr.write(`Compiling ${approved.length} approved extractions...\n`);

  // --- Glossary contributions ---
  // Deduplicate by term (case-insensitive). Keep highest confidence.
  const confidenceOrder = { high: 3, medium: 2, low: 1 };
  const acronymMap = new Map();

  for (const video of approved) {
    for (const a of (video.acronyms ?? [])) {
      const key = a.term.toUpperCase();
      const existing = acronymMap.get(key);
      const incomingScore = confidenceOrder[a.confidence] ?? 0;
      const existingScore = confidenceOrder[existing?.confidence] ?? 0;

      if (!existing || incomingScore > existingScore) {
        acronymMap.set(key, {
          term:       a.term.toUpperCase(),
          expansion:  a.expansion,
          definition: a.definition,
          confidence: a.confidence,
          sources: [{
            video_id:    video.video_id,
            title:       video.title,
            youtube_url: video.youtube_url,
          }],
        });
      } else if (existing) {
        // Add source reference even if not replacing
        existing.sources.push({
          video_id:    video.video_id,
          title:       video.title,
          youtube_url: video.youtube_url,
        });
      }
    }
  }

  const glossaryContributions = Array.from(acronymMap.values())
    .sort((a, b) => a.term.localeCompare(b.term));

  // --- Programs reference list ---
  const programSet = new Map();
  for (const video of approved) {
    for (const p of (video.programs_mentioned ?? [])) {
      const key = p.toLowerCase().replace(/\s+/g, '-');
      if (!programSet.has(key)) {
        programSet.set(key, { name: p, mentioned_in: [] });
      }
      programSet.get(key).mentioned_in.push({
        video_id: video.video_id,
        title:    video.title,
      });
    }
  }
  const programsList = Array.from(programSet.values())
    .sort((a, b) => b.mentioned_in.length - a.mentioned_in.length);

  // --- Network contributions (candidate nodes) ---
  // Programs with 2+ video references become candidate network nodes
  const networkCandidates = programsList
    .filter(p => p.mentioned_in.length >= 2)
    .map(p => ({
      id:   p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: p.name,
      type: 'project', // default; can be manually adjusted
      group: 'shared',
      val:   Math.min(p.mentioned_in.length, 4),
      source: 'gerb-research',
      mentioned_in: p.mentioned_in.length,
    }));

  // Save outputs
  const glossaryFile  = path.join(cfg.contributionsDir, 'glossary.json');
  const networksFile  = path.join(cfg.contributionsDir, 'network.json');
  const programsFile  = path.join(cfg.contributionsDir, 'programs.json');

  fs.writeFileSync(glossaryFile, JSON.stringify(glossaryContributions, null, 2));
  fs.writeFileSync(networksFile, JSON.stringify(networkCandidates, null, 2));
  fs.writeFileSync(programsFile, JSON.stringify(programsList, null, 2));

  process.stderr.write(`\n=== Contributions compiled ===\n`);
  process.stderr.write(`Glossary terms:     ${glossaryContributions.length}\n`);
  process.stderr.write(`Network candidates: ${networkCandidates.length}\n`);
  process.stderr.write(`Programs tracked:   ${programsList.length}\n`);
  process.stderr.write(`\nFiles written to: data/channels/gerb/contributions/\n`);
  process.stderr.write(`Review glossary.json and network.json before merging into the platform.\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
