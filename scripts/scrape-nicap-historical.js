#!/usr/bin/env node
/**
 * Scrapes NICAP chronology pages (1947-1989) for significant pre-1990 UAP events.
 *
 * Inclusion criteria:
 *   D (required): Blue Book Unknown (BBU), Blue Book case (BB), or official investigation keywords
 *   A or C (at least one): military/radar involvement OR physical evidence
 *
 * Output: scripts/output/nicap-candidates.json (staging file for manual review)
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────────────────

const YEARS = [];
for (let y = 1947; y <= 1989; y++) YEARS.push(y);

// 1952 uses a different filename
const YEAR_OVERRIDES = {
  1952: 'https://www.nicap.org/chronos/1952FIXED.htm',
};

const OUTPUT_DIR = path.join(__dirname, 'output');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'nicap-candidates.json');

// Criterion D: historical significance / official investigation
const CRITERION_D = [
  /\bBBU\b/,
  /\bBB\b(?!\w)/,
  /\bBlue Book\b/i,
  /\bAir Force\b/i,
  /\bUSAF\b/,
  /\bNavy\b/i,
  /\bFBI\b/,
  /\bCIA\b/,
  /\bNATO\b/i,
  /\bCondon\b/i,
  /\bgovernment\b/i,
  /\bofficial\b/i,
  /\bmilitary\b/i,
  /\bscrambled\b/i,
  /\bintercept\b/i,
  /\bCongress\b/i,
  /\binvestigat/i,
  /\bMAJIC\b/i,
  /\bMJ-12\b/i,
];

// Criterion A: military/official involvement
const CRITERION_A = [
  /\bradar\b/i,
  /\bscrambled\b/i,
  /\bintercept\b/i,
  /\bAir Force\b/i,
  /\bUSAF\b/,
  /\bNavy\b/i,
  /\bMarine\b/i,
  /\bArmy\b/i,
  /\bNATO\b/i,
  /\bnuclear\b/i,
  /\bmissile\b/i,
  /\bNORAD\b/i,
  /\bpilot\b/i,
  /\baircrew\b/i,
  /\bAFB\b/,
  /\bAir Base\b/i,
  /\bwarship\b/i,
  /\bfighter\b/i,
];

// Criterion C: physical evidence
const CRITERION_C = [
  /\bground trace\b/i,
  /\bburn\b/i,
  /\bradiation\b/i,
  /\bradioactiv\b/i,
  /\bphysiolog\b/i,
  /\binjur\b/i,
  /\belectromagnet\b/i,
  /\bengine.{0,20}(fail|stop|cut)/i,
  /\bcar.{0,10}stop/i,
  /\bphoto\b/i,
  /\bphotograph\b/i,
  /\bfilm\b/i,
  /\bphysical.{0,20}evidence\b/i,
  /\bimprint\b/i,
  /\bindentation\b/i,
  /\bsample\b/i,
  /\bheat.{0,15}(mark|damage|scorch)/i,
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'DECUR-Research-Bot/1.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.abort(); reject(new Error('Timeout')); });
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&[a-z]+;/g, ' ');
}

function stripTags(str) {
  return decodeHtmlEntities(str.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim());
}

const MONTH_MAP = {
  jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
  jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
};

function parseEntryDate(header, fallbackYear) {
  // header examples: "June 2, 1947; Rehoboth Beach, DE (BBU)"
  //                  "Jan. 20, 1952; Fairchild AFB, Wash. (BBU)"
  //                  "Summer 1947; Location"
  const dateMatch = header.match(
    /^(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s*(\d{1,2})?,?\s*(\d{4})/i
  );
  if (dateMatch) {
    const mKey = dateMatch[1].toLowerCase().slice(0, 3).replace('.', '');
    const m = MONTH_MAP[mKey] || '01';
    const d = dateMatch[2] ? dateMatch[2].padStart(2, '0') : '01';
    const y = parseInt(dateMatch[3]);
    return { dateStr: `${y}-${m}-${d}`, year: y };
  }
  // Year only
  const yearMatch = header.match(/\b(\d{4})\b/);
  const y = yearMatch ? parseInt(yearMatch[1]) : fallbackYear;
  return { dateStr: `${y}-01-01`, year: y };
}

function parseLocation(header) {
  // After the date portion and semicolon, extract location
  // "June 2, 1947; Rehoboth Beach (near Lewes), Delaware (BBU)" -> "Rehoboth Beach, Delaware"
  const afterSemicolon = header.replace(
    /^(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s*\d{0,2},?\s*\d{4};?\s*/i,
    ''
  );
  // Remove (BBU), (BB), parenthetical qualifiers
  return afterSemicolon
    .replace(/\s*\(BBU\)\s*/g, '')
    .replace(/\s*\(BB\)\s*/g, '')
    .replace(/\s*\([^)]{0,30}\)\s*/g, '')
    .trim()
    .replace(/[,;]\s*$/, '')
    .trim();
}

function makeTitle(location, year) {
  // Clean up location artifacts
  const loc = location
    .replace(/\s+/g, ' ')
    .replace(/^\W+/, '')
    .trim();

  if (!loc || loc.length < 3) return `${year} UFO Incident`;

  // Truncate very long locations
  const shortLoc = loc.length > 50 ? loc.slice(0, 50).replace(/,?\s*\w+$/, '') : loc;
  return `${year} ${shortLoc} UFO Incident`;
}

function truncateExcerpt(text, maxLen = 280) {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= maxLen) return clean;
  const cutoff = clean.lastIndexOf('. ', maxLen);
  if (cutoff > 80) return clean.slice(0, cutoff + 1);
  return clean.slice(0, maxLen) + '...';
}

function getCategory(isBBU, meetsA, meetsC) {
  if (isBBU) return 'famous-cases';
  if (meetsA && meetsC) return 'famous-cases';
  return 'sightings';
}

function resolveHref(href, year) {
  if (!href) return null;
  if (href.startsWith('http')) return href;
  const cleaned = href.replace(/^\.\.\/+/, '').replace(/^\//, '');
  return `https://www.nicap.org/${cleaned}`;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

function parsePage(html, year) {
  const results = [];

  // Strategy: find all anchor tags that look like case entry headers
  // Pattern: <a href="...">Month DD?, YYYY; Location (BBU?)</a>
  const ENTRY_REGEX = /<a\s+href="([^"]+)"[^>]*>((?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s*\d{0,2},?\s*\d{4}[^<]{0,120})<\/a>/gi;

  let match;
  const entries = [];

  while ((match = ENTRY_REGEX.exec(html)) !== null) {
    entries.push({
      href: match[1],
      headerHtml: match[2],
      headerText: stripTags(match[2]),
      pos: match.index + match[0].length,
    });
  }

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    const nextPos = entries[i + 1] ? entries[i + 1].pos - entries[i + 1].href.length - 20 : entry.pos + 600;

    // Extract description text between this entry and the next
    const descHtml = html.slice(entry.pos, Math.min(entry.pos + 800, nextPos));
    const descText = stripTags(descHtml);

    const fullText = entry.headerText + ' ' + descText;

    const isBBU = /\bBBU\b/.test(entry.headerText);
    const isBB = /\b\(BB\)/.test(entry.headerText) && !isBBU;

    // Criterion D
    const meetsD = CRITERION_D.some(r => r.test(fullText));
    if (!meetsD) continue;

    // Criterion A or C
    const meetsA = CRITERION_A.some(r => r.test(fullText));
    const meetsC = CRITERION_C.some(r => r.test(fullText));
    if (!meetsA && !meetsC) continue;

    // Skip "hoax" entries
    if (/\bhoax\b/i.test(fullText)) continue;
    // Skip entries that are clearly navigation/index
    if (descText.length < 20 && !entry.href.includes('_dir')) continue;

    const { dateStr, year: entryYear } = parseEntryDate(entry.headerText, year);
    const location = parseLocation(entry.headerText);
    const title = makeTitle(location, entryYear);
    const excerpt = truncateExcerpt(descText || entry.headerText);
    const articleUrl = resolveHref(entry.href, year);
    const nicapChronUrl = `https://www.nicap.org/chronos/${year}fullrep.htm`;

    results.push({
      date: dateStr,
      year: entryYear,
      title,
      excerpt,
      categories: [getCategory(isBBU, meetsA, meetsC)],
      source: 'nicap',
      source_url: nicapChronUrl,
      article_url: articleUrl !== nicapChronUrl ? articleUrl : null,
      article_type: 'article',
      _criteria: { D: meetsD, A: meetsA, C: meetsC, BBU: isBBU, BB: isBB },
    });
  }

  return results;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  const allCandidates = [];
  const errors = [];

  console.log(`Scraping NICAP chronology pages for ${YEARS[0]}-${YEARS[YEARS.length - 1]}...`);

  for (const year of YEARS) {
    const url = YEAR_OVERRIDES[year] || `https://www.nicap.org/chronos/${year}fullrep.htm`;
    process.stdout.write(`  ${year}... `);

    try {
      const html = await fetchPage(url);
      const entries = parsePage(html, year);
      console.log(`${entries.length} candidates`);
      allCandidates.push(...entries);
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      errors.push({ year, url, error: err.message });
    }

    await sleep(400);
  }

  // Deduplicate by date+location in title
  const seen = new Set();
  const deduped = allCandidates.filter(e => {
    const key = `${e.date}:${e.title}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  deduped.sort((a, b) => a.date.localeCompare(b.date));

  let nextId = 3400;
  const withIds = deduped.map(e => ({ _staging_id: nextId++, ...e }));

  const breakdown = {};
  withIds.forEach(e => {
    const decade = `${Math.floor(e.year / 10) * 10}s`;
    breakdown[decade] = (breakdown[decade] || 0) + 1;
  });

  const output = { generated: new Date().toISOString(), total: withIds.length, breakdown, errors, candidates: withIds };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log(`\n✓ ${withIds.length} candidates -> ${OUTPUT_FILE}`);
  console.log('Decade breakdown:', breakdown);
  if (errors.length) console.log(`${errors.length} errors:`, errors.map(e => `${e.year}`));
}

main().catch(err => { console.error(err); process.exit(1); });
