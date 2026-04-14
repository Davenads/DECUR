/**
 * fetch-ufosint-stats.mjs
 * Pre-generates static UFOSINT data files for DECUR's sightings page baseline.
 * Run before deployment to refresh: node scripts/fetch-ufosint-stats.mjs
 *
 * Outputs to data/ufosint/:
 *   stats.json          - total counts, source breakdown, date range
 *   yearly-counts.json  - sighting counts per year (1947-present)
 *   shape-counts.json   - counts per canonical shape
 *   top-countries.json  - top 20 countries by count
 *   hexbins-z3.json     - H3 hexbins at zoom 3 (global overview)
 *   hexbins-z4.json     - H3 hexbins at zoom 4 (regional)
 *   hexbins-z5.json     - H3 hexbins at zoom 5 (national)
 *   by-case/[id].json   - nearby sighting counts for each DECUR case
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'data', 'ufosint');
const UPSTREAM = 'https://ufosint.com';
const MCP_URL = 'https://ufosint-explorer.azurewebsites.net/mcp';
const DELAY_MS = 600; // throttle between per-case queries (~1 req/sec)

const delay = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJSON(path, label) {
  const url = `${UPSTREAM}${path}`;
  process.stdout.write(`  Fetching ${label}... `);
  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'DECUR/1.0 (decur.org - pre-generation script)' },
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    console.log('OK');
    return data;
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
    return null;
  }
}

/** Call an MCP tool via JSON-RPC. Returns parsed result object or null on failure. */
async function callMcpTool(toolName, args, label) {
  process.stdout.write(`  Fetching ${label} (MCP)... `);
  try {
    const res = await fetch(MCP_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'DECUR/1.0 (decur.org - pre-generation script)',
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'tools/call',
        params: { name: toolName, arguments: args },
      }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const envelope = await res.json();
    if (envelope.error) throw new Error(envelope.error.message ?? JSON.stringify(envelope.error));
    // MCP returns result.content[0].text as a JSON string
    const text = envelope.result?.content?.[0]?.text;
    if (!text) throw new Error('Empty MCP response');
    const data = JSON.parse(text);
    console.log('OK');
    return data;
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
    return null;
  }
}

function write(filename, data) {
  const path = join(OUT, filename);
  writeFileSync(path, JSON.stringify(data, null, 2));
  const kb = (JSON.stringify(data).length / 1024).toFixed(1);
  console.log(`  Written: data/ufosint/${filename} (${kb} KB)`);
}

function parseYear(dateStr) {
  if (!dateStr) return null;
  const m = dateStr.match(/(\d{4})/);
  return m ? parseInt(m[1], 10) : null;
}

// ── Main ──────────────────────────────────────────────────────────────────────

console.log('\n=== UFOSINT Static Data Pre-generation ===\n');

mkdirSync(join(OUT, 'by-case'), { recursive: true });

// 1. Stats
const stats = await fetchJSON('/api/stats', 'stats');
if (stats) write('stats.json', stats);

// 2. Timeline (yearly counts) - extract 1947+ and simplify
const timeline = await fetchJSON('/api/timeline', 'timeline');
if (timeline && timeline.data) {
  const yearly = {};
  for (const [year, sources] of Object.entries(timeline.data)) {
    const y = parseInt(year, 10);
    if (y >= 1947) {
      yearly[year] = Object.values(sources).reduce((a, b) => a + b, 0);
    }
  }
  write('yearly-counts.json', yearly);
}

// 3. Shape counts - uses MCP tool (no REST endpoint for count_by)
const shapeCounts = await callMcpTool('count_by', { field: 'shape', limit: 30 }, 'shape counts');
if (shapeCounts) write('shape-counts.json', shapeCounts);

// 4. Top countries - uses MCP tool
const countryCounts = await callMcpTool('count_by', { field: 'country', limit: 25 }, 'top countries');
if (countryCounts) write('top-countries.json', countryCounts);

// 5. Hexbins at zoom 3, 4, 5 (all small enough to commit)
const z3 = await fetchJSON('/api/hexbin?zoom=3', 'hexbins zoom-3');
if (z3) write('hexbins-z3.json', z3);

const z4 = await fetchJSON('/api/hexbin?zoom=4', 'hexbins zoom-4');
if (z4) write('hexbins-z4.json', z4);

const z5 = await fetchJSON('/api/hexbin?zoom=5', 'hexbins zoom-5');
if (z5) write('hexbins-z5.json', z5);

// 6. Per-case nearby sighting counts
// /api/map returns: { total_in_view, markers: [{id, date, shape, source, city, state, country, lat, lng}] }
console.log('\n  Per-case sighting counts (throttled at ~1 req/sec):');
const casesRaw = JSON.parse(readFileSync(join(ROOT, 'data', 'cases.json'), 'utf-8'));
const casesWithCoords = casesRaw.filter(
  (c) => c.coordinates && c.coordinates.lat && c.coordinates.lng
);

console.log(`  Processing ${casesWithCoords.length} of ${casesRaw.length} cases (have coordinates)`);

for (const c of casesWithCoords) {
  const { lat, lng } = c.coordinates;
  const delta = 1.5; // ~100-170 mile radius depending on latitude
  const year = parseYear(c.date);
  const dateSuffix =
    year ? `&date_from=${year - 2}&date_to=${year + 2}` : '';

  const url =
    `/api/map?lat_min=${(lat - delta).toFixed(2)}&lat_max=${(lat + delta).toFixed(2)}` +
    `&lng_min=${(lng - delta).toFixed(2)}&lng_max=${(lng + delta).toFixed(2)}${dateSuffix}&limit=5`;

  process.stdout.write(`    ${c.id}... `);
  try {
    const res = await fetch(`${UPSTREAM}${url}`, {
      headers: { 'User-Agent': 'DECUR/1.0 (decur.org - pre-generation script)' },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    // Response shape: { total_in_view: N, markers: [...], count: N, sample_strategy: '...' }
    const total = data.total_in_view ?? data.count ?? 0;
    const sample = (data.markers ?? []).slice(0, 5).map((s) => ({
      id: s.id,
      date: s.date,
      shape: s.shape,
      source: s.source,
      city: s.city,
      state: s.state,
      country: s.country,
    }));

    const result = {
      case_id: c.id,
      case_name: c.name,
      bbox: { lat, lng, delta },
      date_range: year ? { from: year - 2, to: year + 2 } : null,
      total_nearby: total,
      sample,
      fetched_at: new Date().toISOString(),
    };

    writeFileSync(join(OUT, 'by-case', `${c.id}.json`), JSON.stringify(result, null, 2));
    console.log(`${total} reports`);
  } catch (err) {
    console.log(`FAILED: ${err.message}`);
    // Write empty placeholder so the page doesn't break
    writeFileSync(
      join(OUT, 'by-case', `${c.id}.json`),
      JSON.stringify({ case_id: c.id, total_nearby: null, sample: [], error: err.message }, null, 2)
    );
  }

  await delay(DELAY_MS);
}

console.log('\n=== Done ===\n');
