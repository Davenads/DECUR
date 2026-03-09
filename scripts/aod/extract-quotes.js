/**
 * Extracts attributed quotes from the Age of Disclosure TTML2 subtitle file.
 *
 * Strategy:
 * 1. Parse all segments with timestamps
 * 2. Detect speaker changes via [Name] bracket tags
 * 3. Build continuous speech blocks per speaker
 * 4. Send to Claude for quote extraction
 *
 * Usage: node --env-file=.env scripts/aod/extract-quotes.js
 * Output: data/aod-quotes.json
 */
const fs   = require('fs');
const path = require('path');
const Anthropic = require('@anthropic-ai/sdk');

const TTML_PATH = 'C:/Projects/ClaudeClaw/workspace/uploads/1773087527092_f904e75a-7ce7-4ecb-a004-019065831130.ttml2';
const OUT_PATH  = path.join(__dirname, '../../data/aod-quotes.json');

// Known speaker name mappings from bracket tags
const SPEAKER_MAP = {
  'lue':                'Luis Elizondo',
  'jay':                'Jay Stratton',
  'mellon':             'Christopher Mellon',
  'garry nolan':        'Garry Nolan',
  'nolan':              'Garry Nolan',
  'puthoff':            'Hal Puthoff',
  'alex dietrich':      'Alex Dietrich',
  'dietrich':           'Alex Dietrich',
  'andré carson':       'André Carson',
  'andre carson':       'André Carson',
  'rubio':              'Marco Rubio',
  'burchett':           'Tim Burchett',
  'andy ogles':         'Andy Ogles',
  'nancy mace':         'Nancy Mace',
  'jacobs':             'Robert Jacobs',
  'nuccetelli':         'Nuccetelli',
  'reporter':           null,  // skip generic reporters
  'man':                null,
  'man 1':              null,
  'man 2':              null,
  'woman speaking':     null,
  'all':                null,
  'inhales deeply':     null,
};

function parseTtml(xmlPath) {
  const xml = fs.readFileSync(xmlPath, 'utf8');
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
  return segments;
}

function buildSpeakerBlocks(segments) {
  const blocks = [];
  let currentSpeaker = 'Unknown';
  let currentLines = [];
  let blockStart = null;

  for (const seg of segments) {
    // Check if this segment starts a speaker attribution
    const bracketMatch = seg.text.match(/^\[([^\]]+)\]\s*(.*)/);
    if (bracketMatch) {
      // Save previous block
      if (currentLines.length > 0) {
        blocks.push({
          speaker: currentSpeaker,
          begin: blockStart,
          text: currentLines.join(' ').trim(),
        });
      }
      // Start new speaker block
      const rawTag = bracketMatch[1].toLowerCase().trim();
      const speakerKey = Object.keys(SPEAKER_MAP).find(k => rawTag.startsWith(k));
      currentSpeaker = speakerKey !== undefined ? SPEAKER_MAP[speakerKey] : bracketMatch[1];
      currentLines = bracketMatch[2] ? [bracketMatch[2]] : [];
      blockStart = seg.begin;
    } else {
      // Continue current speaker block
      if (!blockStart) blockStart = seg.begin;
      currentLines.push(seg.text);
    }
  }

  // Flush last block
  if (currentLines.length > 0) {
    blocks.push({ speaker: currentSpeaker, begin: blockStart, text: currentLines.join(' ').trim() });
  }

  // Filter out anonymous/null speakers and very short blocks
  return blocks.filter(b => b.speaker && b.text.length > 30);
}

async function extractQuotesFromBlock(client, speaker, text, timestamp) {
  const prompt = `You are extracting notable, quotable statements from a documentary transcript.

Speaker: ${speaker}
Timestamp: ${timestamp}

Speech block:
"""
${text}
"""

Extract 0-3 notable quotes from this block. A good quote must:
- Be a complete, self-contained statement (not dependent on prior context)
- Be substantive -- a specific claim, assertion, or insight (not just an intro/transition)
- Be attributable to this speaker specifically
- Be relevant to UAP, non-human intelligence, government programs, disclosure, or national security

For each quote, return JSON in this exact format:
{
  "quotes": [
    {
      "text": "exact quote text",
      "topic": "one of: NHI|Crash Retrieval|Cover-up|Technology|Congressional|Personal Account|Disclosure",
      "significance": "one sentence explaining why this quote matters"
    }
  ]
}

If there are no quotable statements, return {"quotes": []}. Return ONLY valid JSON.`;

  try {
    const response = await client.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });
    const raw = response.content[0].text.trim();
    const parsed = JSON.parse(raw);
    return parsed.quotes || [];
  } catch (e) {
    process.stderr.write(`  Error on ${speaker} @ ${timestamp}: ${e.message}\n`);
    return [];
  }
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) { console.error('ANTHROPIC_API_KEY not set'); process.exit(1); }

  const client = new Anthropic({ apiKey });

  process.stderr.write('Parsing TTML...\n');
  const segments = parseTtml(TTML_PATH);
  process.stderr.write(`  ${segments.length} segments parsed\n`);

  const blocks = buildSpeakerBlocks(segments);
  process.stderr.write(`  ${blocks.length} speaker blocks extracted\n\n`);

  // Stats
  const bySpeaker = {};
  for (const b of blocks) {
    bySpeaker[b.speaker] = (bySpeaker[b.speaker] || 0) + 1;
  }
  process.stderr.write('Blocks per speaker:\n');
  Object.entries(bySpeaker).sort((a, b) => b[1] - a[1]).forEach(([s, c]) => {
    process.stderr.write(`  ${s}: ${c}\n`);
  });
  process.stderr.write('\n');

  // Extract quotes from each block
  const allQuotes = [];
  let i = 0;
  for (const block of blocks) {
    i++;
    process.stderr.write(`[${i}/${blocks.length}] ${block.speaker} @ ${block.begin}...\n`);
    const quotes = await extractQuotesFromBlock(client, block.speaker, block.text, block.begin);
    for (const q of quotes) {
      allQuotes.push({
        speaker: block.speaker,
        timestamp: block.begin,
        text: q.text,
        topic: q.topic,
        significance: q.significance,
        source: 'The Age of Disclosure (2024)',
        source_url: 'https://www.amazon.com/Age-Disclosure/dp/B0DFSDX9RH',
      });
    }
    if (quotes.length > 0) {
      process.stderr.write(`    -> ${quotes.length} quotes\n`);
    }
  }

  process.stderr.write(`\n=== Done ===\n`);
  process.stderr.write(`Total quotes extracted: ${allQuotes.length}\n`);
  process.stderr.write(`By speaker:\n`);
  const qBySpeaker = {};
  for (const q of allQuotes) qBySpeaker[q.speaker] = (qBySpeaker[q.speaker] || 0) + 1;
  Object.entries(qBySpeaker).sort((a, b) => b[1] - a[1]).forEach(([s, c]) => {
    process.stderr.write(`  ${s}: ${c}\n`);
  });

  fs.writeFileSync(OUT_PATH, JSON.stringify(allQuotes, null, 2));
  process.stderr.write(`\nSaved to: ${OUT_PATH}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
