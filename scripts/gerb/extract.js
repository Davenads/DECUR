/**
 * Uses Claude API to extract structured data from Gerb transcripts.
 * Processes videos that have transcripts but haven't been extracted yet.
 *
 * Requires ANTHROPIC_API_KEY env var.
 *
 * Usage: node scripts/gerb/extract.js [--limit N]
 *
 * Outputs: data/channels/gerb/extracted/[video-id].json
 */
const fs      = require('fs');
const path    = require('path');
const cfg     = require('./config');

const API_KEY = process.env.ANTHROPIC_API_KEY;
if (!API_KEY) {
  console.error('Error: ANTHROPIC_API_KEY environment variable not set.');
  process.exit(1);
}

const Anthropic = require('@anthropic-ai/sdk');
const client    = new Anthropic({ apiKey: API_KEY });

const limitArg = process.argv.indexOf('--limit');
const LIMIT    = limitArg !== -1 ? parseInt(process.argv[limitArg + 1]) : Infinity;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Collapse transcript segments into a single readable text block.
 * Trims to ~12,000 tokens worth of text to stay within context limits.
 */
function collapseTranscript(segments) {
  const full = segments.map(s => s.text).join(' ').replace(/\s+/g, ' ').trim();
  // Rough character limit: ~4 chars per token, 12k tokens = 48k chars
  return full.length > 48000 ? full.slice(0, 48000) + '...[truncated]' : full;
}

const EXTRACTION_PROMPT = `You are extracting structured research data from a UAP/UFO video transcript by the researcher "UAP Gerb". His content focuses heavily on government programs, classified acronyms, insider testimony, and document analysis.

Extract the following as valid JSON (no markdown, just the JSON object):

{
  "summary": "2-3 sentence summary of what this video covers",
  "acronyms": [
    {
      "term": "ACRONYM",
      "expansion": "What it stands for",
      "definition": "What the program/term does or means",
      "confidence": "high | medium | low"
    }
  ],
  "programs_mentioned": ["program name 1", "program name 2"],
  "people_mentioned": ["Full Name 1", "Full Name 2"],
  "organizations_mentioned": ["org name 1", "org name 2"],
  "events": [
    {
      "year": 2017,
      "description": "what happened",
      "confidence": "high | medium | low"
    }
  ],
  "key_claims": [
    {
      "claim": "what was claimed",
      "confidence": "high | medium | low"
    }
  ],
  "topics": ["topic tag 1", "topic tag 2"]
}

Rules:
- acronyms: ONLY include if the video explicitly defines or explains what they stand for. confidence "high" = clearly stated, "medium" = implied from context, "low" = inferred.
- programs_mentioned: include any classified, government, DoD, or UAP-related program names even if not defined.
- people_mentioned: full names only, no nicknames unless the full name is unknown.
- events: only if a specific year is mentioned alongside a notable event.
- key_claims: significant factual claims Gerb makes or references, not opinions.
- topics: 3-8 short tags describing the video's main subjects (e.g., "AATIP", "Congressional testimony", "UAP legislation").
- If a field has no entries, use an empty array [].
- Return ONLY valid JSON. No prose, no markdown code blocks.`;

async function extractFromTranscript(videoId, title, segments) {
  const transcriptText = collapseTranscript(segments);

  const message = await client.messages.create({
    model: cfg.extractionModel,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `${EXTRACTION_PROMPT}\n\nVIDEO TITLE: ${title}\n\nTRANSCRIPT:\n${transcriptText}`,
      },
    ],
  });

  const raw = message.content[0]?.text ?? '';

  // Clean any accidental markdown fencing
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```\s*$/, '').trim();

  return JSON.parse(cleaned);
}

async function main() {
  if (!fs.existsSync(cfg.indexFile)) {
    console.error('Index not found. Run fetch-channel.js first.');
    process.exit(1);
  }

  const index = JSON.parse(fs.readFileSync(cfg.indexFile, 'utf8'));

  const pending = index.filter(v =>
    v.transcript_fetched &&
    !v.transcript_unavailable &&
    !v.extraction_complete
  );

  process.stderr.write(`Pending extractions: ${pending.length}\n`);

  let processed = 0;
  let succeeded = 0;
  let errored   = 0;

  for (const video of pending) {
    if (processed >= LIMIT) break;

    const transcriptFile = path.join(cfg.transcriptsDir, `${video.video_id}.json`);
    if (!fs.existsSync(transcriptFile)) {
      process.stderr.write(`  SKIP ${video.video_id}: transcript file missing\n`);
      processed++;
      continue;
    }

    const transcriptRecord = JSON.parse(fs.readFileSync(transcriptFile, 'utf8'));
    process.stderr.write(`  [${processed + 1}] ${video.title.slice(0, 70)}\n`);

    try {
      const extracted = await extractFromTranscript(
        video.video_id,
        video.title,
        transcriptRecord.transcript
      );

      const record = {
        video_id:     video.video_id,
        title:        video.title,
        published_at: video.published_at,
        channel:      cfg.channelName,
        youtube_url:  `https://www.youtube.com/watch?v=${video.video_id}`,
        thumbnail_url: video.thumbnail_url,
        extracted_at: new Date().toISOString(),
        ...extracted,
      };

      const outFile = path.join(cfg.extractedDir, `${video.video_id}.json`);
      fs.writeFileSync(outFile, JSON.stringify(record, null, 2));

      video.extraction_complete = true;
      succeeded++;

      process.stderr.write(`    OK: ${extracted.acronyms?.length ?? 0} acronyms, ${extracted.programs_mentioned?.length ?? 0} programs\n`);
    } catch (err) {
      errored++;
      process.stderr.write(`    ERROR: ${err.message}\n`);
    }

    processed++;
    await sleep(cfg.extractionDelay);
  }

  // Save updated index
  fs.writeFileSync(cfg.indexFile, JSON.stringify(index, null, 2));

  process.stderr.write(`\n=== Done ===\n`);
  process.stderr.write(`Processed: ${processed}\n`);
  process.stderr.write(`Succeeded: ${succeeded}\n`);
  process.stderr.write(`Errors: ${errored}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
