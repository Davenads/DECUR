/**
 * Fetches YouTube transcripts for all videos in the Gerb index
 * that haven't been transcribed yet.
 *
 * No API key required — uses YouTube's public caption API.
 *
 * Usage: node scripts/gerb/fetch-transcripts.js [--limit N]
 *
 * Outputs: data/channels/gerb/transcripts/[video-id].json
 */
const fs    = require('fs');
const path  = require('path');
const cfg   = require('./config');

// Arg: optional --limit N to process only N videos per run
const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg !== -1 ? parseInt(process.argv[limitArg + 1]) : Infinity;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function fetchTranscript(videoId) {
  // Use youtube-transcript package (handles YouTube's caption API internally)
  const { YoutubeTranscript } = require('youtube-transcript');
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
    return segments.map(s => ({
      text:   s.text,
      offset: Math.round(s.offset ?? s.start ?? 0),
      duration: Math.round(s.duration ?? 0),
    }));
  } catch (err) {
    // Auto-generated captions may be in a different lang or disabled
    try {
      const segments = await YoutubeTranscript.fetchTranscript(videoId);
      return segments.map(s => ({
        text:   s.text,
        offset: Math.round(s.offset ?? s.start ?? 0),
        duration: Math.round(s.duration ?? 0),
      }));
    } catch {
      return null; // transcript unavailable
    }
  }
}

async function main() {
  if (!fs.existsSync(cfg.indexFile)) {
    console.error('Index not found. Run fetch-channel.js first.');
    process.exit(1);
  }

  const index = JSON.parse(fs.readFileSync(cfg.indexFile, 'utf8'));
  const pending = index.filter(v => !v.transcript_fetched);

  process.stderr.write(`Pending transcripts: ${pending.length} / ${index.length} total\n`);

  let processed = 0;
  let succeeded = 0;
  let failed    = 0;

  for (const video of pending) {
    if (processed >= LIMIT) break;

    process.stderr.write(`  [${processed + 1}] ${video.title.slice(0, 70)}...\n`);

    const outFile = path.join(cfg.transcriptsDir, `${video.video_id}.json`);

    if (fs.existsSync(outFile)) {
      // Already on disk but index not updated
      video.transcript_fetched = true;
      processed++;
      continue;
    }

    const segments = await fetchTranscript(video.video_id);

    if (segments && segments.length > 0) {
      const record = {
        video_id:     video.video_id,
        title:        video.title,
        published_at: video.published_at,
        channel:      cfg.channelName,
        channel_url:  cfg.channelUrl,
        transcript:   segments,
        fetched_at:   new Date().toISOString(),
      };
      fs.writeFileSync(outFile, JSON.stringify(record, null, 2));
      video.transcript_fetched = true;
      succeeded++;
      process.stderr.write(`    OK: ${segments.length} segments\n`);
    } else {
      video.transcript_fetched = true; // mark to avoid re-attempting
      video.transcript_unavailable = true;
      failed++;
      process.stderr.write(`    SKIP: no transcript available\n`);
    }

    processed++;
    await sleep(cfg.transcriptDelay);
  }

  // Update index with transcript_fetched flags
  fs.writeFileSync(cfg.indexFile, JSON.stringify(index, null, 2));

  process.stderr.write(`\n=== Done ===\n`);
  process.stderr.write(`Processed: ${processed}\n`);
  process.stderr.write(`Succeeded: ${succeeded}\n`);
  process.stderr.write(`No transcript: ${failed}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
