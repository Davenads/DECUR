/**
 * Scrapes article_url for media entries (documentaries, books-documents)
 * that currently have no article_url in ufotimeline.json.
 *
 * Run with: node scripts/scrape-media-article-urls.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/timeline.json');
const MEDIA_CATS = ['documentaries', 'books-documents'];
const DELAY_MS = 600;

// Domains to ignore (boilerplate footer/nav links)
const IGNORE_DOMAINS = ['wordpress.org', 'x.com', 'twitter.com', 'ufotimeline.com', 'facebook.com'];

function fetchHtml(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DECUR-scraper/1.0)' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchHtml(res.headers.location).then(resolve).catch(reject);
      }
      let body = '';
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(new Error('timeout')); });
  });
}

function extractArticleUrl(html) {
  const anchors = [...html.matchAll(/<a[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi)];
  for (const m of anchors) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    if (!href.startsWith('http')) continue;
    if (IGNORE_DOMAINS.some(d => href.includes(d))) continue;
    if (!text || text.length < 2 || text.length > 80) continue;
    return { url: href, text };
  }
  return null;
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

  const targets = data.filter(e =>
    e.categories &&
    e.categories.some(c => MEDIA_CATS.includes(c)) &&
    !e.article_url &&
    e.source_url &&
    e.source_url.includes('ufotimeline')
  );

  console.log(`Found ${targets.length} entries to process\n`);

  let updated = 0;
  let failed = 0;

  for (const entry of targets) {
    process.stdout.write(`[${entry.id}] ${entry.title.substring(0, 50).padEnd(50)} `);
    try {
      const { status, body } = await fetchHtml(entry.source_url);
      if (status !== 200) {
        console.log(`SKIP (HTTP ${status})`);
        failed++;
      } else {
        const result = extractArticleUrl(body);
        if (result) {
          const isVideo = result.url.includes('youtube.com') || result.url.includes('youtu.be') || result.url.includes('vimeo.com');
          const idx = data.findIndex(e => e.id === entry.id);
          data[idx].article_url = result.url;
          data[idx].article_type = isVideo ? 'video' : 'article';
          console.log(`OK [${result.text}] -> ${result.url.substring(0, 55)}`);
          updated++;
        } else {
          console.log('NO URL FOUND');
          failed++;
        }
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      failed++;
    }
    await sleep(DELAY_MS);
  }

  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  console.log(`\nDone. Updated: ${updated}, Failed/skipped: ${failed}`);
  console.log('ufotimeline.json saved.');
}

main().catch(err => { console.error(err); process.exit(1); });
