/**
 * Parse Age of Disclosure TTML2 subtitle file,
 * extract speaker blocks and notable quotes.
 */
const fs   = require('fs');
const path = require('path');

const TTML_PATH = process.argv[2] || 'C:/Projects/ClaudeClaw/workspace/uploads/1773087527092_f904e75a-7ce7-4ecb-a004-019065831130.ttml2';

const xml = fs.readFileSync(TTML_PATH, 'utf8');

// Extract all <p> segments with timestamps and text
const pRe = /<p begin="([^"]+)" end="([^"]+)"[^>]*>([\s\S]*?)<\/p>/g;
const segments = [];
let m;
while ((m = pRe.exec(xml)) !== null) {
  const text = m[3]
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text) segments.push({ begin: m[1], end: m[2], text });
}

console.log('Total segments:', segments.length);
console.log('Duration:', segments[segments.length - 1]?.end, '\n');

// Find speaker self-introductions ("My name is X Y")
const nameRe = /my name is ([A-Z][a-z]+ [A-Z][a-z]+)/gi;
console.log('=== Speaker introductions ===');
segments.forEach((s, i) => {
  const nm = s.text.match(/[Mm]y name is ([A-Z][a-zA-Z]+ [A-Z][a-zA-Z.]+)/);
  if (nm) {
    console.log(`[${i}] ${s.begin} | "${nm[0]}" | ...${s.text.slice(0, 100)}`);
  }
});

// Also look for "I'm X Y" or "[Name]" patterns
console.log('\n=== Bracket tags ===');
segments.forEach((s, i) => {
  if (s.text.match(/^\[/)) {
    console.log(`[${i}] ${s.begin} | ${s.text.slice(0, 80)}`);
  }
});
