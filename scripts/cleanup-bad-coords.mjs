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

// ── Country bounding boxes ────────────────────────────────────────────────────
//
// Mirror of COUNTRY_BOUNDS in scripts/import-from-sqlite.mjs.
// Format: [minLat, maxLat, minLng, maxLng]
//
// Coverage strategy: include every country that appears with enough frequency
// in the corpus to be worth validating. Unknown/unlisted country codes pass
// through unchecked (safe default — don't reject what we can't verify).

const COUNTRY_BOUNDS = {
  // North America
  'us': [18.9,  72.0, -180.0,  -66.0],   // CONUS + Alaska + Hawaii
  'ca': [41.7,  83.1, -141.0,  -52.6],   // Canada
  'mx': [14.5,  32.7, -117.1,  -86.7],   // Mexico
  'pr': [17.9,  18.5,  -67.3,  -65.6],   // Puerto Rico
  // Europe
  'gb': [49.9,  60.9,   -8.2,    1.8],   // Great Britain
  'uk': [49.9,  60.9,   -8.2,    1.8],   // UK alias
  'de': [47.3,  55.1,    5.9,   15.1],   // Germany
  'fr': [41.3,  51.1,   -5.2,    9.6],   // France
  'es': [27.6,  43.8,  -18.2,    4.3],   // Spain (incl. Canary Islands)
  'it': [35.5,  47.1,    6.6,   18.5],   // Italy
  'nl': [50.8,  53.6,    3.4,    7.2],   // Netherlands
  'se': [55.3,  69.1,   11.1,   24.2],   // Sweden
  'no': [57.9,  71.2,    4.5,   31.2],   // Norway
  'fi': [59.8,  70.1,   20.6,   31.6],   // Finland
  'pl': [49.0,  54.9,   14.1,   24.2],   // Poland
  'ru': [41.2,  77.7,   19.6,  180.0],   // Russia (antimeridian — lat-only check)
  'ie': [51.4,  55.4,  -10.5,   -6.0],   // Ireland
  'ch': [45.8,  47.8,    5.9,   10.5],   // Switzerland
  'be': [49.5,  51.5,    2.5,    6.4],   // Belgium
  'at': [46.4,  49.0,    9.5,   17.2],   // Austria
  'pt': [32.6,  42.2,  -31.3,   -6.2],   // Portugal (incl. Azores)
  'gr': [34.8,  41.8,   19.4,   29.6],   // Greece
  'cz': [48.6,  51.1,   12.1,   18.9],   // Czech Republic
  'sk': [47.7,  49.6,   16.8,   22.6],   // Slovakia
  'hu': [45.7,  48.6,   16.1,   22.9],   // Hungary
  'ro': [43.6,  48.3,   20.3,   29.7],   // Romania
  'ua': [44.4,  52.4,   22.1,   40.2],   // Ukraine
  'by': [51.3,  56.2,   23.2,   32.8],   // Belarus
  'dk': [54.6,  57.8,    8.1,   15.2],   // Denmark
  'hr': [42.4,  46.6,   13.5,   19.5],   // Croatia
  'rs': [42.2,  46.2,   18.8,   23.0],   // Serbia
  'bg': [41.2,  44.2,   22.4,   28.6],   // Bulgaria
  'lv': [55.7,  58.1,   20.9,   28.2],   // Latvia
  'lt': [53.9,  56.5,   21.0,   26.8],   // Lithuania
  'ee': [57.5,  59.7,   21.8,   28.2],   // Estonia
  // Oceania
  'au': [-43.7, -10.7,  113.0,  153.8],  // Australia
  'nz': [-47.3, -34.4,  166.4,  178.6],  // New Zealand
  // Asia-Pacific
  'jp': [24.0,  45.7,  122.9,  153.6],   // Japan
  'cn': [18.2,  53.6,   73.4,  134.8],   // China
  'in': [ 8.1,  37.1,   68.2,   97.4],   // India
  'kr': [33.1,  38.6,  125.1,  129.6],   // South Korea
  'ph': [ 4.6,  21.1,  116.9,  126.6],   // Philippines
  'tw': [21.9,  25.3,  120.0,  122.0],   // Taiwan
  'th': [ 5.6,  20.5,   97.3,  105.7],   // Thailand
  'sg': [ 1.2,   1.5,  103.6,  104.1],   // Singapore
  'my': [ 0.9,   7.4,   99.6,  119.3],   // Malaysia
  'id': [-8.8,   5.9,   95.0,  141.0],   // Indonesia
  'vn': [ 8.5,  23.4,  102.1,  109.5],   // Vietnam
  // Latin America
  'br': [-33.8,  5.3,  -73.9,  -34.8],   // Brazil
  'ar': [-55.1, -21.8, -73.6,  -53.6],   // Argentina
  'cl': [-55.9, -17.5, -75.7,  -66.4],   // Chile
  'co': [ -4.2,  13.4, -79.0,  -66.9],   // Colombia
  've': [  0.7,  12.2, -73.4,  -59.8],   // Venezuela
  'pe': [-18.4,  -0.1, -81.4,  -68.7],   // Peru
  'bo': [-22.9,  -9.7, -69.7,  -57.5],   // Bolivia
  'ec': [ -5.0,   1.5, -81.0,  -75.2],   // Ecuador
  'py': [-27.6, -19.3, -62.6,  -54.3],   // Paraguay
  'uy': [-34.9, -30.1, -58.5,  -53.1],   // Uruguay
  'cu': [19.8,  23.2,  -85.0,  -74.2],   // Cuba
  // Africa
  'za': [-34.8, -22.1,  16.5,   32.9],   // South Africa
  'eg': [22.0,  31.7,  24.7,   37.1],    // Egypt
  'ng': [ 4.3,  13.9,   2.7,   14.7],    // Nigeria
  'ke': [-4.7,   5.0,  33.9,   42.0],    // Kenya
  'gh': [ 4.7,  11.2,  -3.3,    1.2],    // Ghana
  'et': [ 3.4,  15.0,  33.0,   48.0],    // Ethiopia
  'ma': [27.7,  35.9,  -13.2,   -1.0],   // Morocco
  'tz': [-11.7,  -1.0,  29.3,   40.4],   // Tanzania
  // Middle East
  'il': [29.5,  33.3,  34.3,   35.9],    // Israel
  'tr': [35.8,  42.1,  25.7,   44.8],    // Turkey
  'sa': [16.4,  32.2,  34.6,   55.7],    // Saudi Arabia
  'ae': [22.6,  26.1,  51.6,   56.4],    // UAE
  'ir': [25.1,  39.8,  44.0,   63.3],    // Iran
  'iq': [29.1,  37.4,  38.8,   48.8],    // Iraq
  'jo': [29.2,  33.4,  34.9,   39.3],    // Jordan
  'lb': [33.1,  34.7,  35.1,   36.6],    // Lebanon
  // Central Asia
  'kz': [41.0,  55.4,  51.0,   87.4],    // Kazakhstan
  'uz': [37.2,  45.6,  56.0,   73.1],    // Uzbekistan
  // Other
  'za': [-34.8, -22.1,  16.5,  32.9],    // South Africa (duplicate key ok)
};

// ── Validation ────────────────────────────────────────────────────────────────

function isCoordPlausible(lat, lng, country) {
  if (lat == null || lng == null || !country) return true;
  const code = country.toLowerCase().trim().replace(/[^a-z]/g, '');
  const bounds = COUNTRY_BOUNDS[code];
  if (!bounds) return true; // unknown country — don't reject
  const [minLat, maxLat, minLng, maxLng] = bounds;
  // Russia special-case: eastern tip wraps past 180°; lat-only check is sufficient
  if (code === 'ru') return lat >= minLat && lat <= maxLat;
  return lat >= minLat && lat <= maxLat && lng >= minLng && lng <= maxLng;
}

function isBadCoord(lat, lng, country) {
  // Already nulled — skip (shouldn't reach here given pre-filter, but safe)
  if (lat === null || lng === null) return false;
  // Out-of-range — physically impossible coordinates
  if (lat < -90 || lat > 90)   return true;
  if (lng < -180 || lng > 180) return true;
  // Null Island — (0, 0) is a geocoding failure default
  if (lat === 0 && lng === 0)  return true;
  // Country bounding-box plausibility
  if (!isCoordPlausible(lat, lng, country)) return true;
  return false;
}

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
  let nulledOutOfRange   = 0;
  let nulledNullIsland   = 0;
  let nulledCountryMismatch = 0;

  while (true) {
    // Fetch next batch by ID cursor — no offset shifting
    const { data, error } = await supabase
      .from('ufosint_sightings')
      .select('id, lat, lng, country')
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

    for (const r of geocoded) {
      const lat = r.lat;
      const lng = r.lng;
      if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
        outOfRange.push(r.id);
      } else if (lat === 0 && lng === 0) {
        nullIsland.push(r.id);
      } else if (!isCoordPlausible(lat, lng, r.country)) {
        countryBad.push(r.id);
      }
    }

    const allBadIds = [...outOfRange, ...nullIsland, ...countryBad];
    nulledOutOfRange      += outOfRange.length;
    nulledNullIsland      += nullIsland.length;
    nulledCountryMismatch += countryBad.length;

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
  console.log('═══════════════════════════════════════════');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
