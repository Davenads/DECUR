/**
 * Fetches transcripts for specific YouTube video IDs.
 * Usage: node scripts/interviews/fetch-specific-videos.cjs --out <dir> <videoId1> <videoId2> ...
 */
const fs           = require('fs');
const path         = require('path');
const os           = require('os');
const { execSync } = require('child_process');

const outArgIdx = process.argv.indexOf('--out');
if (outArgIdx === -1) { console.error('--out <dir> required'); process.exit(1); }
const outDir    = process.argv[outArgIdx + 1];
const videoIds  = process.argv.slice(outArgIdx + 2);

if (!videoIds.length) { console.error('No video IDs provided'); process.exit(1); }

fs.mkdirSync(outDir, { recursive: true });

function parseSrv1(xml) {
  const segments = [];
  const re = /<text start="([\d.]+)" dur="([\d.]+)">([\s\S]*?)<\/text>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const rawText = m[3]
      .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#\d+;/g, '')
      .replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
    if (rawText) segments.push({ text: rawText, offset: Math.round(parseFloat(m[1]) * 1000), duration: Math.round(parseFloat(m[2]) * 1000) });
  }
  return segments;
}

for (const videoId of videoIds) {
  const outFile = path.join(outDir, `${videoId}.json`);
  if (fs.existsSync(outFile)) { console.log(`SKIP (exists): ${videoId}`); continue; }

  const tmpBase = path.join(os.tmpdir(), `corbell_${videoId}`);
  const srvFile = `${tmpBase}.en.srv1`;
  if (fs.existsSync(srvFile)) fs.unlinkSync(srvFile);

  console.log(`Fetching: ${videoId}`);
  try {
    execSync(
      `yt-dlp --extractor-args "youtube:player_client=ios" ` +
      `--write-auto-sub --sub-format srv1 --skip-download ` +
      `--sub-langs en -o "${tmpBase}" ` +
      `"https://www.youtube.com/watch?v=${videoId}"`,
      { stdio: 'pipe' }
    );
  } catch(e) {
    console.log(`  ERROR fetching ${videoId}:`, e.message?.slice(0, 100));
    continue;
  }

  if (!fs.existsSync(srvFile)) { console.log(`  No transcript available for ${videoId}`); continue; }

  const xml      = fs.readFileSync(srvFile, 'utf8');
  fs.unlinkSync(srvFile);
  const segments = parseSrv1(xml);

  if (!segments.length) { console.log(`  Empty transcript for ${videoId}`); continue; }

  // Also get video title via yt-dlp
  let title = videoId;
  try {
    title = execSync(
      `yt-dlp --get-title "https://www.youtube.com/watch?v=${videoId}"`,
      { stdio: 'pipe' }
    ).toString().trim();
  } catch {}

  const record = { video_id: videoId, title, channel: 'WEAPONIZED (Corbell & Knapp)', channel_url: 'https://www.youtube.com/@WEAPONIZED', transcript: segments, fetched_at: new Date().toISOString() };
  fs.writeFileSync(outFile, JSON.stringify(record, null, 2));
  console.log(`  OK: ${segments.length} segments — "${title}"`);
}
