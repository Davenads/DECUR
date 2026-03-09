const fs = require('fs');

const xml = fs.readFileSync(
  'C:/Projects/ClaudeClaw/workspace/uploads/1773087527092_f904e75a-7ce7-4ecb-a004-019065831130.ttml2',
  'utf8'
);

const pRe = /<p begin="([^"]+)" end="([^"]+)"[^>]*>([\s\S]*?)<\/p>/g;
const segments = [];
let m;
while ((m = pRe.exec(xml)) !== null) {
  const text = m[3]
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (text) segments.push({ begin: m[1], text });
}

const SKIP = ['man','man 1','man 2','reporter','woman speaking','all','inhales deeply'];

let currentSpeaker = 'Unknown', blocks = [], lines = [];
for (const seg of segments) {
  const bm = seg.text.match(/^\[([^\]]+)\]\s*(.*)/);
  if (bm) {
    if (lines.length > 0) blocks.push({ speaker: currentSpeaker, text: lines.join(' ').trim() });
    currentSpeaker = bm[1];
    lines = bm[2] ? [bm[2]] : [];
  } else {
    lines.push(seg.text);
  }
}
if (lines.length > 0) blocks.push({ speaker: currentSpeaker, text: lines.join(' ').trim() });

const named = blocks.filter(b =>
  b.text.length > 30 &&
  !SKIP.includes(b.speaker.toLowerCase().trim())
);

const bySp = {};
named.forEach(b => { bySp[b.speaker] = (bySp[b.speaker] || 0) + 1; });
Object.entries(bySp).sort((a, b) => b[1] - a[1]).forEach(([s, c]) => console.log(c, s));
console.log('\nTotal named blocks:', named.length);
