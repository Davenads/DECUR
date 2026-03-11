/**
 * Scrapes new articles from openminds.tv via the WordPress REST API.
 * Only fetches posts published after `afterDate`.
 *
 * Category mapping: openminds WP category → DECUR category
 */

const https = require('https');

// Openminds WP category ID → DECUR category label
// IDs verified against https://openminds.tv/wp-json/wp/v2/categories
const CATEGORY_MAP = {
  375:  'news',           // UFO News
  5:    'news',           // Daily UFO News
  353:  'sightings',      // UFO Sighting Reports
  1852: 'news',           // Government/Military
  3408: 'famous-cases',   // Top UAP Cases and Analysis
  3392: 'spotlight',      // AATIP/TTSA
  3:    'news',           // Articles (general)
  1853: 'news',           // Extraterrestrial Life
};

// Only include posts that belong to at least one of these category IDs
const ALLOWED_CATEGORY_IDS = new Set(Object.keys(CATEGORY_MAP).map(Number));

function fetchJson(url) {
  return new Promise((res, rej) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DECUR-sync/1.0)' }, timeout: 15000 }, r => {
      if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location) {
        r.resume();
        return fetchJson(r.headers.location).then(res).catch(rej);
      }
      let d = ''; r.on('data', c => d += c); r.on('end', () => {
        try { res(JSON.parse(d)); } catch (e) { rej(new Error('JSON parse error: ' + d.substring(0, 200))); }
      });
    }).on('error', rej).on('timeout', () => rej(new Error('Timeout: ' + url)));
  });
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

/**
 * Strips HTML tags from WordPress excerpt.
 */
function stripHtml(html) {
  return html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#8211;/g, '-')    // en dash
    .replace(/&#8212;/g, '-')    // em dash
    .replace(/&#8216;/g, "'")    // left single quote
    .replace(/&#8217;/g, "'")    // right single quote
    .replace(/&#8220;/g, '"')    // left double quote
    .replace(/&#8221;/g, '"')    // right double quote
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))  // remaining numeric entities
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Resolves category IDs to DECUR categories.
 * Returns the most specific DECUR category for the post.
 */
function mapCategories(categoryIds) {
  const mapped = [];
  for (const id of categoryIds) {
    const cat = CATEGORY_MAP[id];
    if (cat && !mapped.includes(cat)) mapped.push(cat);
  }
  return mapped.length > 0 ? mapped : ['news'];
}

/**
 * Fetches new openminds posts published after afterDate (ISO string).
 * Returns array of TimelineEntry-compatible objects.
 */
async function scrapeOpenminds(afterDate, options = {}) {
  const { verbose = false } = options;
  const results = [];
  let page = 1;
  const PER_PAGE = 100;

  if (verbose) console.log(`[openminds] Fetching posts after ${afterDate}...`);

  while (true) {
    const url = `https://openminds.tv/wp-json/wp/v2/posts?per_page=${PER_PAGE}&page=${page}&orderby=date&order=asc&after=${encodeURIComponent(afterDate)}&_fields=id,date,slug,link,title,excerpt,categories`;

    let posts;
    try {
      posts = await fetchJson(url);
    } catch (e) {
      if (verbose) console.error(`[openminds] Page ${page} error: ${e.message}`);
      break;
    }

    if (!Array.isArray(posts) || posts.length === 0) break;

    for (const post of posts) {
      // Check if post belongs to an allowed category
      const postCatIds = post.categories || [];
      const hasAllowedCat = postCatIds.some(id => ALLOWED_CATEGORY_IDS.has(id));
      if (!hasAllowedCat) continue;

      const dateObj = new Date(post.date);
      const dateStr = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD

      results.push({
        // id will be assigned by run-sync.js
        date: dateStr,
        year: dateObj.getFullYear(),
        title: stripHtml(post.title?.rendered || ''),
        excerpt: stripHtml(post.excerpt?.rendered || ''),
        categories: mapCategories(postCatIds),
        source_url: post.link,
        source: 'openminds',
        article_url: null,
        article_type: null,
        _wp_id: post.id,  // temp field for dedup reference, removed before save
      });
    }

    if (verbose) console.log(`[openminds] Page ${page}: ${posts.length} posts fetched, ${results.length} kept so far`);

    if (posts.length < PER_PAGE) break;
    page++;
    await sleep(300);
  }

  if (verbose) console.log(`[openminds] Total new candidates: ${results.length}`);
  return results;
}

module.exports = { scrapeOpenminds };
