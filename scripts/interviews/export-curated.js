/**
 * One-off script: export curated Jesse Michels interviews for profile JSON.
 * Targets landmark interviews with guests already covered in the platform.
 *
 * Usage: node scripts/interviews/export-curated.js --channel jesse-michels
 */
const fs   = require('fs');
const path = require('path');
const cfg  = require('./config');

const targets = [
  'David Grusch Breaks Silence',
  'Multiple Alien Groups',
  'Eric Weinstein Demands UFO Secrets',
  'Eric Davis:',
  'A US President Was Briefed',
  'Eric Weinstein Debates CIA UFO Expert',
  'UFO Secrets Are Held By A Global Cabal',
  'These Are Parts Of an Alien UFO',
  'Man Involved In Every American Conspiracy',
  'I Located A UFO Base In Arizona',
  'Most Important UFO Investigator On The Planet',
  'Graham Hancock: Aliens, Atlantis',
  'Gary McKinnon',
  'They Have Craft',
  'How I Know David Grusch Is Not Lying',
  'Oppenheimer',
  'Army Captures Live Alien',
  'Man Sitting On More UFO Evidence',
];

const files = fs.readdirSync(cfg.extractedDir);
const matches = [];

for (const file of files) {
  const d = JSON.parse(fs.readFileSync(path.join(cfg.extractedDir, file), 'utf8'));
  if (!targets.some(t => d.title.includes(t))) continue;

  const highClaims = (d.key_claims || [])
    .filter(c => c.confidence === 'high' && c.attributed_to !== 'Jesse Michels')
    .slice(0, 3)
    .map(c => c.claim);

  matches.push({
    title:       d.title,
    guest:       d.speakers && d.speakers.guest ? d.speakers.guest : 'unknown',
    date:        d.published_at ? d.published_at.slice(0, 10) : '',
    youtube_url: d.youtube_url,
    summary:     d.summary,
    key_claims:  highClaims,
  });
}

matches.sort((a, b) => b.date.localeCompare(a.date));
console.log(JSON.stringify(matches, null, 2));
