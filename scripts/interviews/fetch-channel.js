/**
 * Fetches all video IDs and metadata for a configured interview channel.
 * Resolves channelHandle -> channelId automatically if channelId is null.
 *
 * Requires YOUTUBE_API_KEY env var (YouTube Data API v3).
 *
 * Usage: node scripts/interviews/fetch-channel.js --channel <slug>
 *
 * Outputs / updates: data/channels/interviews/<slug>/index.json
 */
const https = require('https');
const fs    = require('fs');
const path  = require('path');
const cfg   = require('./config');

const API_KEY = process.env.YOUTUBE_API_KEY;
if (!API_KEY) {
  console.error('Error: YOUTUBE_API_KEY environment variable not set.');
  process.exit(1);
}

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error: ${e.message}\nURL: ${url}`)); }
      });
    }).on('error', reject);
  });
}

/**
 * Resolve a channel handle to a channelId via the YouTube Channels API.
 * Prints the resolved ID so you can hard-code it in the channel config.
 */
async function resolveChannelId(handle) {
  process.stderr.write(`Resolving channel handle @${handle}...\n`);
  const url = [
    'https://www.googleapis.com/youtube/v3/channels',
    `?forHandle=${encodeURIComponent(handle)}`,
    '&part=id,snippet',
    `&key=${API_KEY}`,
  ].join('');

  const res = await get(url);
  if (res.error) throw new Error(`YouTube API error: ${res.error.message}`);
  const channel = res.items?.[0];
  if (!channel) throw new Error(`No channel found for handle @${handle}`);

  process.stderr.write(`Resolved: ${channel.snippet.title} -> ${channel.id}\n`);
  process.stderr.write(`Tip: set channelId: '${channel.id}' in channels/${cfg.channelSlug}.js to skip this step.\n`);
  return channel.id;
}

async function fetchAllVideos(channelId) {
  const uploadsPlaylistId = 'UU' + channelId.slice(2);
  const videos = [];
  let pageToken = '';
  let page = 0;

  do {
    const url = [
      'https://www.googleapis.com/youtube/v3/playlistItems',
      `?playlistId=${uploadsPlaylistId}`,
      '&part=snippet',
      '&maxResults=50',
      pageToken ? `&pageToken=${pageToken}` : '',
      `&key=${API_KEY}`,
    ].join('');

    const res = await get(url);
    if (res.error) throw new Error(`YouTube API error: ${res.error.message}`);

    for (const item of res.items ?? []) {
      const snippet = item.snippet;
      videos.push({
        video_id:            snippet.resourceId.videoId,
        title:               snippet.title,
        published_at:        snippet.publishedAt,
        description:         snippet.description?.slice(0, 300) ?? '',
        thumbnail_url:       snippet.thumbnails?.medium?.url ?? '',
        transcript_fetched:  false,
        extraction_complete: false,
      });
    }

    pageToken = res.nextPageToken ?? '';
    page++;
    process.stderr.write(`  Page ${page}: ${res.items?.length ?? 0} videos (total: ${videos.length})\n`);

  } while (pageToken);

  return videos;
}

async function main() {
  // Resolve channelId from handle if not hard-coded in config
  let channelId = cfg.channelId;
  if (!channelId) {
    if (!cfg.channelHandle) {
      console.error('Error: neither channelId nor channelHandle is set in channel config.');
      process.exit(1);
    }
    channelId = await resolveChannelId(cfg.channelHandle);
  }

  process.stderr.write(`\nFetching channel: ${cfg.channelName} (${channelId})\n`);

  // Ensure data directory exists
  const dir = path.dirname(cfg.indexFile);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  let existing = [];
  if (fs.existsSync(cfg.indexFile)) {
    existing = JSON.parse(fs.readFileSync(cfg.indexFile, 'utf8'));
  }
  const existingIds = new Set(existing.map(v => v.video_id));
  process.stderr.write(`Existing index: ${existing.length} videos\n`);

  const fetched = await fetchAllVideos(channelId);

  let newCount = 0;
  for (const v of fetched) {
    if (!existingIds.has(v.video_id)) {
      existing.push(v);
      newCount++;
    }
  }

  existing.sort((a, b) => b.published_at.localeCompare(a.published_at));
  fs.writeFileSync(cfg.indexFile, JSON.stringify(existing, null, 2));

  process.stderr.write(`\n=== Done ===\n`);
  process.stderr.write(`New videos added: ${newCount}\n`);
  process.stderr.write(`Total in index: ${existing.length}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
