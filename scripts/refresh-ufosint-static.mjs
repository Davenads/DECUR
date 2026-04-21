/**
 * scripts/refresh-ufosint-static.mjs
 *
 * Regenerates the static JSON files used by the sightings chart components:
 *   data/ufosint/stats.json
 *   data/ufosint/shape-counts.json
 *   data/ufosint/top-countries.json
 *   data/ufosint/yearly-counts.json
 *
 * Run after the ufosint_sightings table has been updated or enriched:
 *   node --env-file=.env.local scripts/refresh-ufosint-static.mjs
 *
 * Required env vars (already in .env.local for sightings work):
 *   UFOSINT_SUPABASE_URL
 *   UFOSINT_SERVICE_KEY
 *
 * The SightingsBreakdown and SightingsTemporalChart components import these
 * files at build time as static JSON - they are never re-fetched at runtime.
 * Re-run this script + redeploy to update the charts.
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'data', 'ufosint');

/* ── Supabase client ───────────────────────────────────────────────────── */

const url = process.env.UFOSINT_SUPABASE_URL;
const key = process.env.UFOSINT_SERVICE_KEY;

if (!url || !key) {
  console.error('ERROR: UFOSINT_SUPABASE_URL and UFOSINT_SERVICE_KEY must be set in .env.local');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

/* ── Helpers ───────────────────────────────────────────────────────────── */

function write(filename, data) {
  const path = join(dataDir, filename);
  writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
  console.log(`  ✓ wrote ${filename}`);
}

function readExisting(filename) {
  try {
    return JSON.parse(readFileSync(join(dataDir, filename), 'utf8'));
  } catch {
    return null;
  }
}

/* ── 1. stats.json ─────────────────────────────────────────────────────── */

async function refreshStats() {
  console.log('\n[1/4] Refreshing stats.json...');

  const [
    { count: total_sightings },
    { count: mapped_sightings },
    { count: high_quality },
    { data: dateMinRow },
    { data: dateMaxRow },
    { data: sources, error: srcErr },
  ] = await Promise.all([
    sb.from('ufosint_sightings').select('*', { count: 'exact', head: true }),
    sb.from('ufosint_sightings').select('*', { count: 'exact', head: true }).not('lat', 'is', null).not('lng', 'is', null),
    sb.from('ufosint_sightings').select('*', { count: 'exact', head: true }).gte('quality_score', 60),
    sb.from('ufosint_sightings').select('date').not('date', 'is', null).order('date', { ascending: true }).limit(1).single(),
    sb.from('ufosint_sightings').select('date').not('date', 'is', null).order('date', { ascending: false }).limit(1).single(),
    sb.from('ufosint_source_counts').select('name, collection, count'),
  ]);

  if (srcErr) throw srcErr;

  // Derive by_collection by summing source counts per collection
  const collectionMap = {};
  for (const s of (sources ?? [])) {
    collectionMap[s.collection] = (collectionMap[s.collection] ?? 0) + Number(s.count);
  }
  const by_collection = Object.entries(collectionMap)
    .map(([name, count]) => ({ count, name }))
    .sort((a, b) => b.count - a.count);

  // Preserve non-queryable enrichment fields from existing file if present
  const existing = readExisting('stats.json') ?? {};

  const stats = {
    by_collection,
    by_source: (sources ?? []).map(s => ({
      collection: s.collection ?? '',
      count: Number(s.count),
      name: s.name,
    })).sort((a, b) => b.count - a.count),
    date_range: {
      max: dateMaxRow?.date ?? existing.date_range?.max ?? '2028-01-01',
      min: dateMinRow?.date ?? existing.date_range?.min ?? '1800-01-01',
    },
    duplicate_candidates: existing.duplicate_candidates ?? 0,
    geocoded_geonames: existing.geocoded_geonames ?? 0,
    geocoded_locations: existing.geocoded_locations ?? 0,
    geocoded_original: existing.geocoded_original ?? 0,
    high_quality: high_quality ?? 0,
    mapped_sightings: mapped_sightings ?? 0,
    total_sightings: total_sightings ?? 0,
    with_movement: existing.with_movement ?? 0,
  };

  console.log(`    total: ${stats.total_sightings.toLocaleString()}`);
  console.log(`    mapped: ${stats.mapped_sightings.toLocaleString()}`);
  console.log(`    high-quality (≥60): ${stats.high_quality.toLocaleString()}`);
  console.log(`    date range: ${stats.date_range.min} — ${stats.date_range.max}`);
  write('stats.json', stats);
}

/* ── 2. shape-counts.json ──────────────────────────────────────────────── */

async function refreshShapeCounts() {
  console.log('\n[2/4] Refreshing shape-counts.json...');
  const { data, error } = await sb
    .from('ufosint_shape_counts')
    .select('value, count')
    .limit(50);
  if (error) throw error;

  const rows = (data ?? []).map(r => ({ value: r.value, count: Number(r.count) }));
  console.log(`    ${rows.length} shape entries`);
  write('shape-counts.json', { field: 'shape', rows });
}

/* ── 3. top-countries.json ─────────────────────────────────────────────── */

async function refreshCountryCounts() {
  console.log('\n[3/4] Refreshing top-countries.json...');
  const { data, error } = await sb
    .from('ufosint_country_counts')
    .select('value, count')
    .limit(50);
  if (error) throw error;

  const rows = (data ?? []).map(r => ({ value: r.value, count: Number(r.count) }));
  console.log(`    ${rows.length} country entries`);
  write('top-countries.json', { field: 'country', rows });
}

/* ── 4. yearly-counts.json ─────────────────────────────────────────────── */

async function refreshYearlyCounts() {
  console.log('\n[4/4] Refreshing yearly-counts.json (one query per year 1947-2025)...');
  const yearlyCounts = {};
  const START_YEAR = 1947;
  const END_YEAR = 2025;
  const total = END_YEAR - START_YEAR + 1;

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    const { count, error } = await sb
      .from('ufosint_sightings')
      .select('*', { count: 'exact', head: true })
      .gte('date', `${year}-01-01`)
      .lt('date', `${year + 1}-01-01`);
    if (error) throw error;
    yearlyCounts[String(year)] = count ?? 0;

    const done = year - START_YEAR + 1;
    if (done % 10 === 0 || year === END_YEAR) {
      process.stdout.write(`    ${done}/${total} years complete\r`);
    }
  }
  process.stdout.write('\n');

  const totalReports = Object.values(yearlyCounts).reduce((a, b) => a + b, 0);
  console.log(`    ${totalReports.toLocaleString()} total reports across ${total} years`);
  write('yearly-counts.json', yearlyCounts);
}

/* ── Main ──────────────────────────────────────────────────────────────── */

console.log('=== UFOSINT static JSON refresh ===');
console.log(`Target: ${url}`);

try {
  await refreshStats();
  await refreshShapeCounts();
  await refreshCountryCounts();
  await refreshYearlyCounts();
  console.log('\n=== All done. Commit data/ufosint/*.json and redeploy to update charts. ===\n');
} catch (err) {
  console.error('\nERROR:', err.message ?? err);
  process.exit(1);
}
