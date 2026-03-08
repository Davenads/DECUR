/**
 * Scrapes curated categories from openminds.tv WP REST API.
 * Deduplicates against existing ufotimeline.json entries using
 * normalized title + year matching before merging.
 *
 * Usage: node scripts/scrape-openminds.js
 */
const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '../data/ufotimeline.json');

// Category ID -> our DECUR category mapping
const TARGET_CATEGORIES = [
  { id: 3408, slug: 'top-cases',           decurCategory: 'famous-cases' },
  { id: 1852, slug: 'government-military', decurCategory: 'news' },
  { id: 353,  slug: 'ufo-sighting-reports',decurCategory: 'sightings' },
  { id: 3392, slug: 'aatip-and-ttsa',      decurCategory: 'spotlight' },
];

function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(new Error(`JSON parse error for ${url}: ${e.message}`)); }
      });
    }).on('error', reject);
  });
}

function decodeEntities(str) {
  return (str || '')
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Normalize title for dedup comparison */
function normalizeTitle(title) {
  const stopWords = new Set(['the','a','an','of','in','on','at','to','for','and','or','is','are','was','were','by','with','from','about','ufo','uap','uaps','ufos']);
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w))
    .join(' ');
}

/** Word overlap score between two normalized title strings */
function overlapScore(a, b) {
  const wa = new Set(a.split(' ').filter(Boolean));
  const wb = new Set(b.split(' ').filter(Boolean));
  if (wa.size === 0 || wb.size === 0) return 0;
  let shared = 0;
  wa.forEach(w => { if (wb.has(w)) shared++; });
  return shared / Math.min(wa.size, wb.size);
}

async function fetchCategory(catId, catSlug, totalExpected) {
  const perPage = 100;
  let page = 1;
  const all = [];
  while (true) {
    const url = `https://openminds.tv/wp-json/wp/v2/posts?categories=${catId}&per_page=${perPage}&page=${page}&_fields=id,date,title,excerpt,content,link`;
    const posts = await get(url);
    if (!Array.isArray(posts) || posts.length === 0) break;
    all.push(...posts);
    process.stderr.write(`  [${catSlug}] page ${page}: ${posts.length} posts (${all.length}/${totalExpected})\n`);
    if (posts.length < perPage) break;
    page++;
  }
  return all;
}

async function main() {
  // Load existing data
  const existing = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));

  // Tag existing entries with source if not already tagged
  let taggedCount = 0;
  existing.forEach(e => {
    if (!e.source) { e.source = 'ufotimeline'; taggedCount++; }
  });
  if (taggedCount > 0) {
    process.stderr.write(`Tagged ${taggedCount} existing entries with source: ufotimeline\n`);
  }

  // Build dedup index from existing entries: year -> [normalizedTitle]
  const dedupIndex = new Map();
  existing.forEach(e => {
    const year = e.year;
    if (!dedupIndex.has(year)) dedupIndex.set(year, []);
    dedupIndex.get(year).push(normalizeTitle(e.title));
  });

  const isDuplicate = (year, title) => {
    const norm = normalizeTitle(title);
    const candidates = dedupIndex.get(year) || [];
    return candidates.some(c => overlapScore(norm, c) >= 0.6);
  };

  // Scrape all target categories
  let newEntries = [];
  let skippedDups = 0;
  let maxId = Math.max(...existing.map(e => e.id));

  for (const cat of TARGET_CATEGORIES) {
    process.stderr.write(`\nFetching category: ${cat.slug} (${cat.id})...\n`);
    const posts = await fetchCategory(cat.id, cat.slug, null);

    for (const p of posts) {
      const date = p.date.split('T')[0];
      const year = parseInt(date.slice(0, 4));
      const title = decodeEntities(p.title?.rendered);
      const excerpt = decodeEntities(p.excerpt?.rendered);

      if (isDuplicate(year, title)) {
        skippedDups++;
        continue;
      }

      const entry = {
        id: ++maxId,
        date,
        year,
        title,
        excerpt,
        content: p.content?.rendered || '',
        categories: [cat.decurCategory],
        source_url: p.link,
        source: 'openminds',
      };

      newEntries.push(entry);

      // Add to dedup index so we don't add same event twice across categories
      if (!dedupIndex.has(year)) dedupIndex.set(year, []);
      dedupIndex.get(year).push(normalizeTitle(title));
    }

    process.stderr.write(`  Added: ${newEntries.filter(e => e.source === 'openminds').length} so far, skipped: ${skippedDups} dups\n`);
  }

  // Merge and sort
  const merged = [...existing, ...newEntries].sort((a, b) => a.date.localeCompare(b.date));

  fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2));

  process.stderr.write(`\n=== Done ===\n`);
  process.stderr.write(`Existing entries: ${existing.length}\n`);
  process.stderr.write(`New entries added: ${newEntries.length}\n`);
  process.stderr.write(`Duplicates skipped: ${skippedDups}\n`);
  process.stderr.write(`Total entries: ${merged.length}\n`);
  process.stderr.write(`File size: ${(fs.statSync(DATA_FILE).size / 1024).toFixed(0)}KB\n`);
}

main().catch(e => { console.error(e); process.exit(1); });
