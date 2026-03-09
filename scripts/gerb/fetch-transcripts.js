/**
 * Fetches YouTube transcripts for all videos in the Gerb index
 * that haven't been transcribed yet.
 *
 * Uses yt-dlp with ios player client to bypass SSAP restrictions.
 * yt-dlp must be installed: https://github.com/yt-dlp/yt-dlp
 *
 * Usage: node scripts/gerb/fetch-transcripts.js [--limit N]
 *
 * Outputs: data/channels/gerb/transcripts/[video-id].json
 */
const fs            = require('fs');
const path          = require('path');
const os            = require('os');
const { execSync }  = require('child_process');
const cfg           = require('./config');

const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg !== -1 ? parseInt(process.argv[limitArg + 1]) : Infinity;

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Parse srv1 XML into [{text, offset, duration}] segments.
 * Handles HTML entities and strips timing artifacts.
 */
function parseSrv1(xml) {
  const segments = [];
  const re = /<text start="([\d.]+)" dur="([\d.]+)">([\s\S]*?)<\/text>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const rawText = m[3]
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#\d+;/g, '')
      .replace(/<[^>]+>/g, '')   // strip any inline tags (e.g. <font>)
      .replace(/\s+/g, ' ')
      .trim();
    if (rawText) {
      segments.push({
        text:     rawText,
        offset:   Math.round(parseFloat(m[1]) * 1000),
        duration: Math.round(parseFloat(m[2]) * 1000),
      });
    }
  }
  return segments;
}

function fetchTranscriptYtDlp(videoId) {
  const tmpBase = path.join(os.tmpdir(), `gerb_${videoId}`);
  const outFile = `${tmpBase}.en.srv1`;

  // Clean up any previous run
  if (fs.existsSync(outFile)) fs.unlinkSync(outFile);

  try {
    execSync(
      `yt-dlp --extractor-args "youtube:player_client=ios" ` +
      `--write-auto-sub --sub-format srv1 --skip-download ` +
      `--sub-langs en -o "${tmpBase}" ` +
      `"https://www.youtube.com/watch?v=${videoId}"`,
      { stdio: 'pipe' }
    );
  } catch {
    return null;
  }

  if (!fs.existsSync(outFile)) return null;

  const xml = fs.readFileSync(outFile, 'utf8');
  fs.unlinkSync(outFile); // cleanup

  const segments = parseSrv1(xml);
  return segments.length > 0 ? segments : null;
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
      video.transcript_fetched = true;
      processed++;
      continue;
    }

    const segments = fetchTranscriptYtDlp(video.video_id);

    if (segments) {
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
      video.transcript_fetched = true;
      video.transcript_unavailable = true;
      failed++;
      process.stderr.write(`    SKIP: no transcript available\n`);
    }

    processed++;
    await sleep(cfg.transcriptDelay);
  }

  fs.writeFileSync(cfg.indexFile, JSON.stringify(index, null, 2));

  process.stderr.write(`\n=== Done ===\n`);
  process.stderr.write(`Processed: ${processed}\n`);
  process.stderr.write(`Succeeded: ${succeeded}\n`);
  process.stderr.write(`No transcript: ${failed}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
