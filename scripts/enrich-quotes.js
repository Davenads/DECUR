/**
 * enrich-quotes.js
 * Fetches the actual quote text from each ufotimeline "quotes" entry
 * and writes quote_text + quote_attribution back into ufotimeline.json.
 *
 * Run: node scripts/enrich-quotes.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/ufotimeline.json');
const DELAY_MS = 400; // be polite to ufotimeline.com

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function decodeHtmlEntities(str) {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#8216;/g, "'")
    .replace(/&#8217;/g, "'")
    .replace(/&#8211;/g, '-')   // en-dash -> hyphen
    .replace(/&#8212;/g, '-')   // em-dash -> hyphen
    .replace(/\u2013/g, '-')    // en-dash
    .replace(/\u2014/g, '-')    // em-dash
    .replace(/&mdash;/g, '-')
    .replace(/&ndash;/g, '-')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/&[a-z]+;/g, '')
    .trim();
}

function fetchPage(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { 'User-Agent': 'DECUR-Archive/1.0' } }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        const redirect = res.headers['location'];
        if (redirect) return resolve(fetchPage(redirect));
      }
      if (res.statusCode !== 200) {
        res.resume();
        return resolve({ status: res.statusCode, body: null });
      }
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body }));
    });
    req.on('error', () => resolve({ status: 0, body: null }));
    req.setTimeout(8000, () => { req.destroy(); resolve({ status: 0, body: null }); });
  });
}

function extractQuote(html) {
  if (!html) return { text: null, attribution: null };

  // Match wp-block-quote specifically
  const bqMatch = html.match(/<blockquote[^>]*wp-block-quote[^>]*>([\s\S]*?)<\/blockquote>/i)
    || html.match(/<blockquote[^>]*>([\s\S]*?)<\/blockquote>/i);

  if (!bqMatch) return { text: null, attribution: null };

  const inner = bqMatch[1];

  // Extract <p> text (the quote body)
  const pMatch = inner.match(/<p[^>]*>([\s\S]*?)<\/p>/i);
  const text = pMatch
    ? decodeHtmlEntities(pMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    : null;

  // Extract <cite> text (attribution/source)
  const citeMatch = inner.match(/<cite[^>]*>([\s\S]*?)<\/cite>/i);
  const attribution = citeMatch
    ? decodeHtmlEntities(citeMatch[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim())
    : null;

  return { text, attribution };
}

async function main() {
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
  const quotes = data.filter(e => e.categories && e.categories.includes('quotes'));

  console.log(`Found ${quotes.length} quote entries to enrich.\n`);

  let success = 0;
  let failed = 0;
  let already = 0;

  for (let i = 0; i < quotes.length; i++) {
    const entry = quotes[i];

    // Skip if already enriched
    if (entry.quote_text) {
      already++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${quotes.length}] ${entry.title} ... `);

    const { status, body } = await fetchPage(entry.source_url);

    if (!body) {
      console.log(`SKIP (HTTP ${status})`);
      entry.quote_text = null;
      entry.quote_attribution = null;
      failed++;
    } else {
      const { text, attribution } = extractQuote(body);
      entry.quote_text = text;
      entry.quote_attribution = attribution;

      if (text) {
        console.log(`OK -- "${text.substring(0, 60)}..."`);
        success++;
      } else {
        console.log(`NO BLOCKQUOTE FOUND`);
        failed++;
      }
    }

    // Write progress after each entry so we don't lose work on interruption
    fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));

    await sleep(DELAY_MS);
  }

  console.log(`\nDone. Success: ${success} | Failed/missing: ${failed} | Already done: ${already}`);
}

main().catch(console.error);
