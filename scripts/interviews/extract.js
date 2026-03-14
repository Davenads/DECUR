/**
 * Extracts structured data from interview transcripts using Claude.
 * Key difference from the Gerb pipeline: speaker attribution.
 *
 * The video title is parsed for a guest name, then passed to Claude
 * so key_claims can be attributed to host vs. guest without manual mapping.
 * When attribution is uncertain, Claude flags it rather than guessing.
 *
 * Requires ANTHROPIC_API_KEY env var.
 *
 * Usage: node scripts/interviews/extract.js --channel <slug> [--limit N]
 *
 * Outputs: data/channels/interviews/<slug>/extracted/[video-id].json
 */
const fs      = require('fs');
const path    = require('path');
const cfg     = require('./config');
const { parseGuestFromTitle } = require('./parse-title');

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

function collapseTranscript(segments) {
  const full = segments.map(s => s.text).join(' ').replace(/\s+/g, ' ').trim();
  // ~4 chars per token, 12k tokens = 48k chars
  return full.length > 48000 ? full.slice(0, 48000) + '...[truncated]' : full;
}

function buildExtractionPrompt(hostName, guestName) {
  const speakerContext = guestName
    ? `This is an interview between host "${hostName}" and guest "${guestName}". ` +
      `Use these names for attribution. If you cannot determine who said something, use "unknown".`
    : `This is an interview hosted by "${hostName}". The guest name could not be parsed from the title — ` +
      `infer it from context (e.g. the host introducing them, self-identification) if possible, ` +
      `or use "unknown guest".`;

  return `You are extracting structured research data from a UAP/UFO interview transcript. ${speakerContext}

Extract the following as valid JSON (no markdown, just the JSON object):

{
  "summary": "2-3 sentence summary of what this interview covers",
  "speakers": {
    "host": "${hostName}",
    "guest": ${guestName ? `"${guestName}"` : '"unknown — infer from context if possible"'}
  },
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
      "attributed_to": "host name | guest name | unknown",
      "attribution_confidence": "high | medium | low",
      "confidence": "high | medium | low"
    }
  ],
  "topics": ["topic tag 1", "topic tag 2"]
}

Rules:
- speakers.guest: fill in with the resolved name if you can determine it from context; otherwise "unknown".
- acronyms: ONLY include if explicitly defined or explained. confidence "high" = clearly stated, "medium" = implied, "low" = inferred.
- programs_mentioned: include any classified, government, DoD, or UAP-related program names.
- people_mentioned: full names only.
- events: only if a specific year is mentioned alongside a notable event.
- key_claims: significant factual claims, not opinions. attributed_to should use the speaker's real name if known, or "unknown". attribution_confidence reflects how certain you are about who said it.
- topics: 3-8 short tags.
- If a field has no entries, use an empty array [].
- Return ONLY valid JSON. No prose, no markdown code blocks.`;
}

async function extractFromTranscript(videoId, title, segments) {
  const transcriptText = collapseTranscript(segments);

  const guestName = parseGuestFromTitle(
    title,
    cfg.titleParseStrategies ?? [],
    cfg.hostAliases ?? []
  );

  const prompt = buildExtractionPrompt(cfg.hostName, guestName);

  const message = await client.messages.create({
    model: cfg.extractionModel,
    max_tokens: 4096,
    messages: [
      {
        role: 'user',
        content: `${prompt}\n\nVIDEO TITLE: ${title}\n\nTRANSCRIPT:\n${transcriptText}`,
      },
    ],
  });

  const raw     = message.content[0]?.text ?? '';
  const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```\s*$/, '').trim();
  return JSON.parse(cleaned);
}

async function main() {
  if (!fs.existsSync(cfg.indexFile)) {
    console.error('Index not found. Run fetch-channel.js first.');
    process.exit(1);
  }

  if (!fs.existsSync(cfg.extractedDir)) fs.mkdirSync(cfg.extractedDir, { recursive: true });

  const index   = JSON.parse(fs.readFileSync(cfg.indexFile, 'utf8'));
  const pending = index.filter(v =>
    v.transcript_fetched &&
    !v.transcript_unavailable &&
    !v.extraction_complete
  );

  process.stderr.write(`Channel: ${cfg.channelName}\n`);
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

      // Log resolved speakers
      if (extracted.speakers) {
        process.stderr.write(`    Speakers: host="${extracted.speakers.host}" guest="${extracted.speakers.guest}"\n`);
      }

      const record = {
        video_id:        video.video_id,
        title:           video.title,
        published_at:    video.published_at,
        channel:         cfg.channelName,
        channel_slug:    cfg.channelSlug,
        youtube_url:     `https://www.youtube.com/watch?v=${video.video_id}`,
        thumbnail_url:   video.thumbnail_url,
        extracted_at:    new Date().toISOString(),
        ...extracted,
      };

      const outFile = path.join(cfg.extractedDir, `${video.video_id}.json`);
      fs.writeFileSync(outFile, JSON.stringify(record, null, 2));

      video.extraction_complete = true;
      succeeded++;
      process.stderr.write(`    OK\n`);
    } catch (err) {
      process.stderr.write(`    ERROR: ${err.message}\n`);
      errored++;
    }

    processed++;
    fs.writeFileSync(cfg.indexFile, JSON.stringify(index, null, 2));
    await sleep(cfg.extractionDelay);
  }

  fs.writeFileSync(cfg.indexFile, JSON.stringify(index, null, 2));

  process.stderr.write(`\n=== Done ===\n`);
  process.stderr.write(`Processed: ${processed}\n`);
  process.stderr.write(`Succeeded: ${succeeded}\n`);
  process.stderr.write(`Errors:    ${errored}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
