/**
 * Fetches all video IDs and metadata from UAP Gerb's YouTube channel.
 * Requires YOUTUBE_API_KEY env var (YouTube Data API v3).
 *
 * Usage: node scripts/gerb/fetch-channel.js
 *
 * Outputs / updates: data/channels/gerb/index.json
 */
const https = require('https');
const fs    = require('fs');
const cfg   = require('./config');

const API_KEY = process.env.YOUTUBE_API_KEY;
if (!API_KEY) {
  console.error('Error: YOUTUBE_API_KEY environment variable not set.');
  console.error('Get a free key at https://console.cloud.google.com/ (YouTube Data API v3)');
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

async function fetchAllVideos(channelId) {
  // Use the uploads playlist (UC -> UU) instead of search endpoint.
  // The search API caps at ~500 results and is incomplete; playlistItems
  // returns the full unfiltered upload history.
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

    if (res.error) {
      throw new Error(`YouTube API error: ${res.error.message}`);
    }

    for (const item of res.items ?? []) {
      const snippet = item.snippet;
      videos.push({
        video_id:      snippet.resourceId.videoId,
        title:         snippet.title,
        published_at:  snippet.publishedAt,
        description:   snippet.description?.slice(0, 300) ?? '',
        thumbnail_url: snippet.thumbnails?.medium?.url ?? '',
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
  process.stderr.write(`Fetching channel: ${cfg.channelName} (${cfg.channelId})\n`);

  // Load existing index
  let existing = [];
  if (fs.existsSync(cfg.indexFile)) {
    existing = JSON.parse(fs.readFileSync(cfg.indexFile, 'utf8'));
  }
  const existingIds = new Set(existing.map(v => v.video_id));
  process.stderr.write(`Existing index: ${existing.length} videos\n`);

  const fetched = await fetchAllVideos(cfg.channelId);

  let newCount = 0;
  for (const v of fetched) {
    if (!existingIds.has(v.video_id)) {
      existing.push(v);
      newCount++;
    }
  }

  // Sort by published date desc
  existing.sort((a, b) => b.published_at.localeCompare(a.published_at));

  fs.writeFileSync(cfg.indexFile, JSON.stringify(existing, null, 2));

  process.stderr.write(`\n=== Done ===\n`);
  process.stderr.write(`New videos added: ${newCount}\n`);
  process.stderr.write(`Total in index: ${existing.length}\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
