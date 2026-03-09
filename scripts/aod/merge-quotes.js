/**
 * Merges Age of Disclosure quotes into data/aod-quotes-platform.json
 * in the same format as ufotimeline quote entries, for use in the Data page.
 *
 * Speaker roles for attribution context.
 */
const fs   = require('fs');
const path = require('path');

const aodQuotes = require('../../data/aod-quotes.json');

const SPEAKER_ROLES = {
  'Luis Elizondo':      'Former Director, AATIP; U.S. Army Counterintelligence',
  'Jay Stratton':       'Former Director, UAP Task Force; U.S. Navy Intelligence',
  'Christopher Mellon': 'Former Deputy Assistant Secretary of Defense for Intelligence',
  'Garry Nolan':        'Professor of Pathology, Stanford University School of Medicine',
  'Hal Puthoff':        'Physicist; Former AATIP/AAWSAP Contractor; SRI International',
  'André Carson':       'U.S. Representative (D-IN); House Intelligence Committee',
  'Robert Jacobs':      'Former U.S. Air Force Lieutenant; Big Sur UFO Incident Witness',
  'Tim Burchett':       'U.S. Representative (R-TN); House Oversight Committee',
  'Nancy Mace':         'U.S. Representative (R-SC); House Oversight Committee',
  'Alex Dietrich':      'Former U.S. Navy Lt. Commander; Tic Tac Encounter Witness',
  'Marco Rubio':        'U.S. Senator (R-FL); Senate Intelligence Committee',
};

// Convert AoD quotes to platform format
// Use a base ID offset to avoid collision with ufotimeline entries (max ~4000)
let idCounter = 9000;

const platformQuotes = aodQuotes.map(q => {
  const role = SPEAKER_ROLES[q.speaker] || 'Documentary participant, The Age of Disclosure';
  return {
    id: idCounter++,
    date: '2024-01-01',  // Film release year (exact date not per-quote)
    year: 2024,
    title: q.speaker,
    excerpt: role,
    categories: ['quotes'],
    source_url: q.source_url,
    source: 'aod',
    quote_text: q.text,
    quote_attribution: `The Age of Disclosure (2024) — ${q.topic}`,
    topic: q.topic,
  };
});

const outPath = path.join(__dirname, '../../data/aod-quotes-platform.json');
fs.writeFileSync(outPath, JSON.stringify(platformQuotes, null, 2));
console.log(`Written ${platformQuotes.length} quotes to ${outPath}`);

// Print breakdown
const bySp = {};
platformQuotes.forEach(q => { bySp[q.title] = (bySp[q.title]||0)+1; });
Object.entries(bySp).sort((a,b)=>b[1]-a[1]).forEach(([s,c])=>console.log(' ',c, s));
