/**
 * cleanup-bad-coords.mjs
 *
 * One-time cleanup: scans all ufosint_sightings records and nulls out lat/lng
 * values that fail coordinate plausibility checks:
 *
 *   1. Out-of-range  — lat outside ±90 or lng outside ±180 (corrupt source data)
 *   2. Null Island   — (0, 0) is a geocoding default, never a real UAP location
 *   3. Country mismatch — coordinates fall outside the stated country's bounding box
 *
 * The record itself is kept; only lat and lng are set to null so the record
 * remains searchable but is not rendered on the map.
 *
 * Idempotent: paginate by ID cursor so offset never shifts as records are updated.
 * Safe to re-run — already-nulled records have lat=null and are skipped by the
 * geocoded filter.
 *
 * Usage:
 *   node --env-file=.env.local scripts/cleanup-bad-coords.mjs
 *
 * Required env vars:
 *   IMPORT_SUPABASE_URL   — Supabase project URL
 *   IMPORT_SERVICE_KEY    — Service role key (never anon key)
 */

import { createClient } from '@supabase/supabase-js';
import { isCoordPlausible, isStateCoordPlausible } from './coord-validation.mjs';

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL  = process.env.IMPORT_SUPABASE_URL;
const SERVICE_KEY   = process.env.IMPORT_SERVICE_KEY;
const FETCH_BATCH   = 2000;  // records fetched per page
const UPDATE_CHUNK  = 100;   // max IDs per UPDATE (PostgREST URL length safety)
const LOG_EVERY     = 5;     // log progress every N batches

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing IMPORT_SUPABASE_URL or IMPORT_SERVICE_KEY.');
  console.error('Add them to .env.local and run:');
  console.error('  node --env-file=.env.local scripts/cleanup-bad-coords.mjs');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Get total row count for progress display
  const { count, error: countErr } = await supabase
    .from('ufosint_sightings')
    .select('*', { count: 'exact', head: true });

  if (countErr) {
    console.error('Could not get table count:', countErr);
    process.exit(1);
  }

  console.log(`ufosint_sightings total rows: ${count?.toLocaleString() ?? '?'}`);
  console.log(`Fetch batch: ${FETCH_BATCH} | Update chunk: ${UPDATE_CHUNK}`);
  console.log('Paginating by ID cursor — safe to interrupt and re-run.\n');

  let lastId       = 0;
  let totalScanned = 0;
  let totalGeo     = 0;   // records with non-null lat/lng seen
  let totalNulled  = 0;   // records whose coords were set to null
  let batches      = 0;
  const startTime  = Date.now();

  // Track breakdown of why coords were nulled
  let nulledOutOfRange      = 0;
  let nulledNullIsland      = 0;
  let nulledCountryMismatch = 0;
  let nulledStateMismatch   = 0;

  while (true) {
    // Fetch next batch by ID cursor — no offset shifting
    const { data, error } = await supabase
      .from('ufosint_sightings')
      .select('id, lat, lng, country, state')
      .gt('id', lastId)
      .order('id', { ascending: true })
      .limit(FETCH_BATCH);

    if (error) {
      console.error('Fetch error:', error);
      break;
    }
    if (!data || data.length === 0) break;

    lastId = data[data.length - 1].id;
    totalScanned += data.length;

    // Only validate records that currently have coordinates
    const geocoded = data.filter(r => r.lat !== null && r.lng !== null);
    totalGeo += geocoded.length;

    // Categorize bad records
    const outOfRange    = [];
    const nullIsland    = [];
    const countryBad    = [];
    const stateBad      = [];

    for (const r of geocoded) {
      const lat = r.lat;
      const lng = r.lng;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        outOfRange.push(r.id);
      } else if (lat === 0 && lng === 0) {
        nullIsland.push(r.id);
      } else if (!isCoordPlausible(lat, lng, r.country)) {
        countryBad.push(r.id);
      } else {
        // State-level check — only for US records with a state value
        const countryNorm = r.country ? r.country.toLowerCase().trim().replace(/[^a-z]/g, '') : '';
        if (countryNorm === 'us' && r.state && !isStateCoordPlausible(lat, lng, r.state)) {
          stateBad.push(r.id);
        }
      }
    }

    const allBadIds = [...outOfRange, ...nullIsland, ...countryBad, ...stateBad];
    nulledOutOfRange      += outOfRange.length;
    nulledNullIsland      += nullIsland.length;
    nulledCountryMismatch += countryBad.length;
    nulledStateMismatch   += stateBad.length;

    // UPDATE in chunks to stay within PostgREST URL limits
    for (let i = 0; i < allBadIds.length; i += UPDATE_CHUNK) {
      const chunk = allBadIds.slice(i, i + UPDATE_CHUNK);
      const { error: updateErr } = await supabase
        .from('ufosint_sightings')
        .update({ lat: null, lng: null })
        .in('id', chunk);

      if (updateErr) {
        console.error(
          `  Update error (ids ${chunk[0]}..${chunk[chunk.length - 1]}):`,
          updateErr.message
        );
      } else {
        totalNulled += chunk.length;
      }
    }

    batches++;

    if (batches % LOG_EVERY === 0) {
      const pct     = count ? ((totalScanned / count) * 100).toFixed(1) : '?';
      const elapsed = (Date.now() - startTime) / 1000;
      const rate    = (totalScanned / Math.max(1, elapsed)).toFixed(0);
      const etaSec  = count ? Math.round((count - totalScanned) / Math.max(1, rate)) : '?';
      console.log(
        `[${pct}%] scanned=${totalScanned.toLocaleString()} geo=${totalGeo.toLocaleString()} ` +
        `nulled=${totalNulled.toLocaleString()} | ${rate} rec/s | eta=${etaSec}s | lastId=${lastId}`
      );
    }

    if (data.length < FETCH_BATCH) break; // last page
  }

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);

  console.log('\n═══════════════════════════════════════════');
  console.log(`Done in ${elapsed} min`);
  console.log(`Total scanned:          ${totalScanned.toLocaleString()}`);
  console.log(`Total geocoded checked: ${totalGeo.toLocaleString()}`);
  console.log(`Coords nulled:          ${totalNulled.toLocaleString()}`);
  if (totalGeo > 0) {
    const pct = ((totalNulled / totalGeo) * 100).toFixed(2);
    console.log(`Error rate:             ${pct}% of geocoded records`);
  }
  console.log('');
  console.log(`  Out-of-range:         ${nulledOutOfRange.toLocaleString()}`);
  console.log(`  Null Island (0,0):    ${nulledNullIsland.toLocaleString()}`);
  console.log(`  Country mismatch:     ${nulledCountryMismatch.toLocaleString()}`);
  console.log(`  State mismatch (US):  ${nulledStateMismatch.toLocaleString()}`);
  console.log('═══════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
