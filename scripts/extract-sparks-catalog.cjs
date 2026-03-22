#!/usr/bin/env node
/**
 * Sparks Blue Book Unknowns Catalog Extractor
 * Downloads the Brad Sparks Comprehensive Catalog (~2,200 cases) from CUFOS
 * and extracts structured fields to enrich data/blue-book-index.json.
 *
 * Usage:
 *   node scripts/extract-sparks-catalog.cjs
 *
 * Output:
 *   data/blue-book-index-enriched.json  (review before replacing original)
 *   scripts/output/sparks-extraction-report.txt
 */

'use strict';

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');
const { execSync } = require('child_process');

// ── Configuration ─────────────────────────────────────────────────────────────

const PDF_URL = 'https://cufos.org/PDFs/pdfs/BB_Unknowns.pdf';
const PDF_LOCAL = path.join(__dirname, 'output', 'sparks-catalog.pdf');
const TXT_LOCAL = path.join(__dirname, 'output', 'sparks-catalog.txt');
const INDEX_FILE = path.join(__dirname, '..', 'data', 'blue-book-index.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'data', 'blue-book-index-enriched.json');
const REPORT_FILE = path.join(__dirname, 'output', 'sparks-extraction-report.txt');

// ── Download PDF ──────────────────────────────────────────────────────────────

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(dest)) {
      const size = fs.statSync(dest).size;
      console.log(`Using cached PDF: ${dest} (${(size / 1024 / 1024).toFixed(1)} MB)`);
      return resolve();
    }
    console.log(`Downloading ${url}...`);
    const file = fs.createWriteStream(dest);

    function doRequest(reqUrl) {
      const protocol = reqUrl.startsWith('https') ? https : http;
      protocol.get(reqUrl, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          console.log(`Redirecting to ${res.headers.location}`);
          file.close();
          doRequest(res.headers.location);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode} for ${reqUrl}`));
          return;
        }
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          const size = fs.statSync(dest).size;
          console.log(`Downloaded: ${(size / 1024 / 1024).toFixed(1)} MB`);
          resolve();
        });
      }).on('error', reject);
    }

    doRequest(url);
  });
}

// ── Regex patterns ────────────────────────────────────────────────────────────

// Coordinate in Sparks format: (37.55\xb0 N, 77.44\xb0 W) or (37.55 N, 77.44 W)
// The degree symbol is Latin-1 0xB0, which in latin1-read text appears as \xb0
const COORD_RE = /\(\s*(-?\d+\.?\d*)\s*[\xb0\u00b0]?\s*([NS])[,\s]+(-?\d+\.?\d*)\s*[\xb0\u00b0]?\s*([EW])\s*\)/i;

// Duration: "3 mins", "45 secs", "1.5 hrs", "15+ secs", "20-30 secs"
const DURATION_RE = /(\d+\.?\d*)\+?\s*(hour|hr|min|minute|sec|second)s?/i;

// Date: "June 29, 1947" or "Jan. 4, 1949" or "April 1947" (no day)
const DATE_FULL_RE = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{1,2}),?\s+(\d{4})\b/i;
const DATE_PARTIAL_RE = /\b(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\.?\s+(\d{4})\b/i;

const MONTH_MAP = {
  jan: 1, january: 1, feb: 2, february: 2, mar: 3, march: 3,
  apr: 4, april: 4, may: 5, jun: 6, june: 6, jul: 7, july: 7,
  aug: 8, august: 8, sep: 9, sept: 9, september: 9,
  oct: 10, october: 10, nov: 11, november: 11, dec: 12, december: 12,
};

// Entry line: starts at column 0 with "123.  " (1-4 digits, period, spaces)
// Optionally followed by a BB case number before the date
const ENTRY_START_RE = /^(\d{1,4})\.\s+/;

const INSTRUMENT_KEYWORDS = ['radar', 'theodolite', 'camera', 'film', 'photo', 'telescope',
  'binocular', 'scientist', 'engineer', 'spectrograph', 'magnetometer'];

// ── Parsers ───────────────────────────────────────────────────────────────────

function parseCoords(text) {
  const m = text.match(COORD_RE);
  if (!m) return { lat: null, lon: null };
  let lat = parseFloat(m[1]);
  let lon = parseFloat(m[3]);
  if (m[2].toUpperCase() === 'S') lat = -lat;
  if (m[4].toUpperCase() === 'W') lon = -lon;
  return { lat: Math.round(lat * 10000) / 10000, lon: Math.round(lon * 10000) / 10000 };
}

function parseDuration(text) {
  if (!text) return null;
  const m = text.match(DURATION_RE);
  if (!m) return null;
  const val = m[1];
  const unit = m[2].toLowerCase();
  if (unit.startsWith('h')) return `${val} hr`;
  if (unit.startsWith('m')) return `${val} min`;
  if (unit.startsWith('s')) return `${val} sec`;
  return null;
}

function parseDate(text) {
  let m = text.match(DATE_FULL_RE);
  if (m) {
    const monthStr = m[1].replace('.', '').toLowerCase();
    const month = MONTH_MAP[monthStr] || MONTH_MAP[monthStr.slice(0, 3)] || null;
    return { year: parseInt(m[3]), month, day: parseInt(m[2]) };
  }
  m = text.match(DATE_PARTIAL_RE);
  if (m) {
    const monthStr = m[1].replace('.', '').toLowerCase();
    const month = MONTH_MAP[monthStr] || MONTH_MAP[monthStr.slice(0, 3)] || null;
    return { year: parseInt(m[2]), month, day: null };
  }
  return { year: null, month: null, day: null };
}

function hasInstruments(text) {
  const t = text.toLowerCase();
  return INSTRUMENT_KEYWORDS.some(kw => t.includes(kw));
}

function parseWitnesses(text) {
  if (!text) return null;
  const t = text.trim();
  const m = t.match(/^(\d{1,3})\+?$/);
  if (m) {
    const n = parseInt(m[1]);
    return (n > 0 && n < 1000) ? n : null;
  }
  return null;
}

// ── Column extraction from entry first-line ───────────────────────────────────

/**
 * The Sparks catalog uses fixed-width columns on the right side of each entry line.
 * Based on examination of the actual text layout:
 *   col ~55-70: Duration
 *   col ~70-78: # Witnesses
 *   col ~78-92: Angular Size
 *   col ~92+:   Instruments/Scientists
 *
 * We extract these by looking at the character positions of the rightmost content.
 */
function extractRightColumns(line) {
  // The narrative content + date fills roughly columns 0-54
  // Right-side structured data starts around column 55+
  if (line.length < 56) return { duration: null, witnesses: null, angular: null, instruments: false };

  const rightPart = line.slice(55);

  // Look for duration pattern anywhere in right part
  const duration = parseDuration(rightPart);

  // Look for small integer (witnesses) - isolated number
  const witMatch = rightPart.match(/\b(\d{1,3})\b/);
  const witnesses = witMatch ? parseWitnesses(witMatch[1]) : null;

  // Instruments: any keyword in the rightmost ~40 chars
  const instruments = hasInstruments(rightPart);

  // Angular size: pattern like "1/15" or "1/4" or "0.5" or "2?"
  const angMatch = rightPart.match(/\b(\d+\/\d+|\d+\.?\d*)\s*\??\s*(full moon)?/i);
  const angular = angMatch && angMatch[1] !== witnesses?.toString() ? angMatch[1] : null;

  return { duration, witnesses, angular, instruments };
}

// ── PDF extraction ────────────────────────────────────────────────────────────

function extractPdfText() {
  if (fs.existsSync(TXT_LOCAL)) {
    console.log(`Using cached text extraction: ${TXT_LOCAL}`);
    // Read as latin1 because pdftotext outputs latin-1 encoded characters (degree symbol = 0xB0)
    return fs.readFileSync(TXT_LOCAL, 'latin1');
  }

  console.log('Running pdftotext...');
  // -layout preserves column spacing; -nopgbrk avoids page break chars
  execSync(`pdftotext -layout -nopgbrk "${PDF_LOCAL}" "${TXT_LOCAL}"`, { stdio: 'pipe' });
  return fs.readFileSync(TXT_LOCAL, 'latin1');
}

// ── Entry parser ──────────────────────────────────────────────────────────────

function parseEntries(rawText) {
  const entries = [];
  const lines = rawText.split('\n');

  let current = null;
  let allLines = [];

  for (const line of lines) {
    const m = line.match(ENTRY_START_RE);

    if (m) {
      // Save previous entry
      if (current !== null) {
        finalizeEntry(current, allLines, entries);
      }

      // Start new entry
      const rest = line.slice(m[0].length);
      // Check if immediately after the period+spaces there's a BB case number
      // BB case numbers appear as a standalone number before the month name
      // e.g. "8.   12 June 24, 1947" where 12 is the BB case no.
      const bbAtStartMatch = rest.match(/^(\d{1,5})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i);
      let bbCaseNo = null;
      let narrative = rest;

      if (bbAtStartMatch) {
        bbCaseNo = bbAtStartMatch[1];
        narrative = rest.slice(bbAtStartMatch[1].length).trim();
      }

      current = {
        catalog_no: parseInt(m[1]),
        bb_case_no: bbCaseNo,
        first_line: line,      // preserve for column extraction
        narrative_lines: [narrative],
      };
      allLines = [line];

    } else if (current !== null && line.trim()) {
      // Continuation line
      current.narrative_lines.push(line.trim());
      allLines.push(line);
    }
  }

  // Save last entry
  if (current !== null) {
    finalizeEntry(current, allLines, entries);
  }

  return entries;
}

function finalizeEntry(entry, allLines, entries) {
  const fullNarrative = entry.narrative_lines.join(' ').replace(/\s+/g, ' ');

  // Extract coordinates from the full narrative
  const coords = parseCoords(fullNarrative);

  // Extract date from the narrative
  const dateInfo = parseDate(fullNarrative);

  // Extract structured column data from the first line
  const cols = extractRightColumns(entry.first_line);

  // Override duration from full narrative if not found in columns
  const duration = cols.duration || parseDuration(fullNarrative);

  // Instruments from columns or full narrative
  const instruments = cols.instruments || hasInstruments(fullNarrative);

  entries.push({
    catalog_no: entry.catalog_no,
    bb_case_no: entry.bb_case_no,
    year: dateInfo.year,
    month: dateInfo.month,
    day: dateInfo.day,
    lat: coords.lat,
    lon: coords.lon,
    duration,
    num_witnesses: cols.witnesses,
    angular_size: cols.angular,
    instruments,
    location_snippet: fullNarrative.slice(0, 200).replace(/\s+/g, ' '),
  });
}

// ── Cross-reference ────────────────────────────────────────────────────────────

function normalizeLocation(loc) {
  return (loc || '').toLowerCase()
    .replace(/\b(afb|afba|ab|nas|apt|air force base|army air field|air station)\b/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function wordOverlap(a, b) {
  const aWords = new Set(a.split(' ').filter(w => w.length > 3));
  const bWords = new Set(b.split(' ').filter(w => w.length > 3));
  let count = 0;
  for (const w of aWords) { if (bWords.has(w)) count++; }
  return count;
}

function matchSparksToIndex(sparksEntries, indexCases) {
  const enrichment = {};

  // Build lookup by BB case no.
  const sparksByBB = {};
  for (const e of sparksEntries) {
    if (e.bb_case_no) {
      if (!sparksByBB[e.bb_case_no]) sparksByBB[e.bb_case_no] = [];
      sparksByBB[e.bb_case_no].push(e);
    }
  }

  // Build lookup by year
  const sparksByYear = {};
  for (const e of sparksEntries) {
    if (e.year) {
      if (!sparksByYear[e.year]) sparksByYear[e.year] = [];
      sparksByYear[e.year].push(e);
    }
  }

  let byBB = 0, byLocation = 0, unmatched = 0;

  for (const c of indexCases) {
    const caseNo = c.case_no;  // NICAP case number
    const caseYear = c.year;
    const caseLoc = normalizeLocation(c.location);

    // Strategy 1: BB case number match
    // Note: NICAP case numbers may correspond to Sparks BB case numbers (from the NARA filing)
    if (caseNo && sparksByBB[caseNo]) {
      const candidates = sparksByBB[caseNo];
      // If year also matches, it's a strong match
      const yearMatch = caseYear ? candidates.find(e => e.year === caseYear) : null;
      const e = yearMatch || candidates[0];
      const enrich = buildEnrichment(e);
      if (Object.keys(enrich).length > 0) {
        enrichment[c.id] = enrich;
        byBB++;
        continue;
      }
    }

    // Strategy 2: year + location word overlap
    if (caseYear) {
      const candidates = sparksByYear[caseYear] || [];
      let bestMatch = null;
      let bestScore = 0;

      for (const candidate of candidates) {
        const sparksLoc = normalizeLocation(candidate.location_snippet);
        const score = wordOverlap(caseLoc, sparksLoc);
        if (score > bestScore && score >= 2) {
          bestScore = score;
          bestMatch = candidate;
        }
      }

      if (bestMatch) {
        const enrich = buildEnrichment(bestMatch);
        if (Object.keys(enrich).length > 0) {
          enrichment[c.id] = enrich;
          byLocation++;
          continue;
        }
      }
    }

    unmatched++;
  }

  console.log(`  Matched by BB case no.: ${byBB}`);
  console.log(`  Matched by year+location: ${byLocation}`);
  console.log(`  Unmatched: ${unmatched}`);

  return enrichment;
}

function buildEnrichment(e) {
  const result = {};
  if (e.lat !== null && e.lon !== null) {
    result.lat = e.lat;
    result.lon = e.lon;
  }
  if (e.duration) result.duration = e.duration;
  // num_witnesses excluded: fixed-width column extraction picks up time codes and
  // other numbers unreliably; would require full NLP parsing of the narrative to be accurate
  if (e.instruments) result.instruments_documented = true;
  return result;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const outputDir = path.join(__dirname, 'output');
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

  console.log(`Loading ${INDEX_FILE}...`);
  const indexData = JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
  const indexCases = indexData.cases;
  console.log(`Index has ${indexCases.length} cases`);

  // Download PDF
  await downloadFile(PDF_URL, PDF_LOCAL);

  // Extract text
  const rawText = extractPdfText();
  console.log(`Text length: ${rawText.length.toLocaleString()} chars`);

  // Parse entries
  console.log('Parsing entries...');
  const sparksEntries = parseEntries(rawText);
  console.log(`Parsed ${sparksEntries.length} entries`);

  // Stats
  const withCoords = sparksEntries.filter(e => e.lat !== null).length;
  const withDuration = sparksEntries.filter(e => e.duration).length;
  const withWitnesses = sparksEntries.filter(e => e.num_witnesses !== null).length;
  const withInstruments = sparksEntries.filter(e => e.instruments).length;

  console.log(`\nSparks entry stats:`);
  console.log(`  With coordinates: ${withCoords}`);
  console.log(`  With duration:    ${withDuration}`);
  console.log(`  With witnesses:   ${withWitnesses}`);
  console.log(`  With instruments: ${withInstruments}`);

  // Show first 5 entries for QA
  console.log('\nFirst 5 parsed entries:');
  sparksEntries.slice(0, 5).forEach(e => {
    console.log(`  #${e.catalog_no} | BB:${e.bb_case_no || '-'} | ${e.year}/${e.month}/${e.day} | lat:${e.lat} lon:${e.lon} | dur:${e.duration || '-'} | wit:${e.num_witnesses || '-'}`);
  });

  // Cross-reference
  console.log('\nCross-referencing with index...');
  const enrichment = matchSparksToIndex(sparksEntries, indexCases);

  // Apply enrichment
  let enrichedCount = 0;
  let coordsAdded = 0;

  for (const c of indexCases) {
    const extra = enrichment[c.id];
    if (extra) {
      Object.assign(c, extra);
      enrichedCount++;
      if (extra.lat !== undefined) coordsAdded++;
    }
  }

  // Update metadata
  indexData.metadata.enrichment_source = 'Brad Sparks Comprehensive Catalog of Blue Book Unknowns (CUFOS, 2020)';
  indexData.metadata.enrichment_url = 'https://cufos.org/PDFs/pdfs/BB_Unknowns.pdf';
  indexData.metadata.enriched_cases = enrichedCount;
  indexData.metadata.cases_with_coordinates = coordsAdded;

  // Write enriched output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(indexData, null, 2));

  console.log(`\nDone.`);
  console.log(`  Enriched: ${enrichedCount} / ${indexCases.length} cases`);
  console.log(`  Coordinates added: ${coordsAdded}`);
  console.log(`  Output: ${OUTPUT_FILE}`);

  // Write report
  const sampleEnriched = indexCases.filter(c => c.lat !== undefined).slice(0, 15)
    .map(c => `  ${c.id} | lat:${c.lat} lon:${c.lon} | dur:${c.duration || '-'} | wit:${c.num_witnesses || '-'}`);

  const reportLines = [
    'Sparks Extraction Report',
    '========================',
    `Sparks entries extracted: ${sparksEntries.length}`,
    `  With coordinates: ${withCoords}`,
    `  With duration:    ${withDuration}`,
    `  With witnesses:   ${withWitnesses}`,
    `  With instruments: ${withInstruments}`,
    '',
    `Index cases:      ${indexCases.length}`,
    `Enriched:         ${enrichedCount}`,
    `Coords added:     ${coordsAdded}`,
    '',
    'Sample enriched cases (first 15 with coords):',
    ...sampleEnriched,
    '',
    'Unmatched index cases:',
    ...indexCases
      .filter(c => !enrichment[c.id])
      .map(c => `  ${c.case_no} | ${c.date || ''} | ${c.location || ''}`),
  ];

  fs.writeFileSync(REPORT_FILE, reportLines.join('\n'));
  console.log(`  Report: ${REPORT_FILE}`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
