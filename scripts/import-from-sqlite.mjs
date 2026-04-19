/**
 * import-from-sqlite.mjs
 *
 * Reads all 614,505 records from ufo_public.db (DuelingGroks export) and
 * upserts them into the ufosint_sightings Supabase table.
 *
 * - Inserts the ~94k records that were unreachable via the MCP API
 * - Updates all existing records with enriched fields (hynek, vallee, quality, etc.)
 * - Description field is intentionally skipped (db strips raw text; keep MCP values)
 * - Checkpoints by last processed id so the script is resumable
 *
 * Usage:
 *   node --env-file=.env.local scripts/import-from-sqlite.mjs [--resume]
 *
 * Required env vars:
 *   IMPORT_SUPABASE_URL   - Supabase project URL
 *   IMPORT_SERVICE_KEY    - Service role key (never anon key)
 *   SQLITE_DB_PATH        - (optional) path to ufo_public.db; defaults to .plans/ufo_public.db
 */

import { createClient } from '@supabase/supabase-js';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { isCoordPlausible, isStateCoordPlausible } from './coord-validation.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ── Config ────────────────────────────────────────────────────────────────────

const SUPABASE_URL  = process.env.IMPORT_SUPABASE_URL;
const SERVICE_KEY   = process.env.IMPORT_SERVICE_KEY;
const DB_PATH       = process.env.SQLITE_DB_PATH
  ?? path.join(ROOT, '.plans', 'ufo_public.db');
const CHECKPOINT    = path.join(ROOT, 'data', 'ufosint', 'sqlite-import-checkpoint.json');
const BATCH_SIZE    = 100;
const RESUME        = process.argv.includes('--resume');
// --retry-range <fromId> <toId>  — reprocess a specific id range (for fixing earlier errors)
const RETRY_IDX     = process.argv.indexOf('--retry-range');
const RETRY_FROM    = RETRY_IDX !== -1 ? parseInt(process.argv[RETRY_IDX + 1], 10) : null;
const RETRY_TO      = RETRY_IDX !== -1 ? parseInt(process.argv[RETRY_IDX + 2], 10) : null;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing IMPORT_SUPABASE_URL or IMPORT_SERVICE_KEY env vars.');
  console.error('Add them to .env.local and run: node --env-file=.env.local scripts/import-from-sqlite.mjs');
  process.exit(1);
}
if (!fs.existsSync(DB_PATH)) {
  console.error(`SQLite db not found at: ${DB_PATH}`);
  console.error('Set SQLITE_DB_PATH env var or place ufo_public.db in .plans/');
  process.exit(1);
}

// ── Supabase client ───────────────────────────────────────────────────────────

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── Coordinate validation ─────────────────────────────────────────────────────
// Shared validation logic is in scripts/coord-validation.mjs.
// isCoordPlausible is imported at the top of this file.

let coordMismatchCount = 0;

// ── Checkpoint helpers ────────────────────────────────────────────────────────

function loadCheckpoint() {
  if (RESUME && fs.existsSync(CHECKPOINT)) {
    const cp = JSON.parse(fs.readFileSync(CHECKPOINT, 'utf8'));
    console.log(`Resuming from checkpoint: lastId=${cp.lastId}, inserted=${cp.inserted}, updated=${cp.updated}`);
    return cp;
  }
  return { lastId: 0, inserted: 0, updated: 0, errors: 0, startedAt: new Date().toISOString() };
}

function saveCheckpoint(cp) {
  fs.mkdirSync(path.dirname(CHECKPOINT), { recursive: true });
  fs.writeFileSync(CHECKPOINT, JSON.stringify({ ...cp, savedAt: new Date().toISOString() }, null, 2));
}

// ── SQLite query ──────────────────────────────────────────────────────────────

const SELECT_QUERY = `
  SELECT
    s.id,
    d.name                    AS source,
    sc.name                   AS collection,
    s.date_event              AS date,
    l.city,
    l.state,
    l.country,
    l.latitude                AS lat,
    l.longitude               AS lng,
    s.shape,
    s.standardized_shape,
    s.primary_color,
    s.duration,
    s.duration_bucket,
    s.num_witnesses           AS witnesses,
    s.hynek,
    s.vallee,
    s.svp_rating,
    s.quality_score,
    s.richness_score,
    s.hoax_likelihood,
    s.dominant_emotion        AS emotion_label,
    s.vader_compound,
    s.has_description,
    s.has_media,
    s.direction,
    s.movement_type,
    s.event_type
  FROM sighting s
  LEFT JOIN source_database   d  ON s.source_db_id  = d.id
  LEFT JOIN source_collection sc ON d.collection_id = sc.id
  LEFT JOIN location          l  ON s.location_id   = l.id
  WHERE s.id > ?
  ORDER BY s.id ASC
  LIMIT ?
`;

// ── Row mapper ────────────────────────────────────────────────────────────────

function mapRow(r) {
  // Normalize to YYYY-MM-DD. Postgres DATE rejects partial dates like "1947" or "1890-01".
  let date = r.date ?? null;
  if (date) {
    if (date.includes('T')) {
      date = date.split('T')[0];           // "1978-11-23T18:30" -> "1978-11-23"
    }
    // Pad partial dates so Postgres DATE accepts them
    const parts = date.split('-');
    if (parts.length === 1) {
      date = `${parts[0]}-01-01`;           // "1947" -> "1947-01-01"
    } else if (parts.length === 2) {
      date = `${parts[0]}-${parts[1]}-01`; // "1890-01" -> "1890-01-01"
    }
    // Validate: if year is obviously bogus (< 1800 or > 2030) set null
    const year = parseInt(parts[0], 10);
    if (isNaN(year) || year < 1800 || year > 2030) date = null;
  }

  // ── Coordinate sanity check ───────────────────────────────────────────────
  // Validate before assignment; null out both if any check fails so the record
  // is kept for text search but not plotted on the map.
  let lat = r.lat ?? null;
  let lng = r.lng ?? null;
  // Out-of-range values are corrupt source data
  if (lat !== null && (lat < -90  || lat > 90))  { lat = null; lng = null; }
  if (lng !== null && (lng < -180 || lng > 180)) { lat = null; lng = null; }
  // (0, 0) = Null Island — almost always a geocoding failure, never a real UAP location
  if (lat === 0 && lng === 0) { lat = null; lng = null; }
  // Country bounding-box plausibility — catches city in NJ plotted in Europe, etc.
  if (lat !== null && !isCoordPlausible(lat, lng, r.country)) {
    lat = null; lng = null;
    coordMismatchCount++;
  }
  // US state-level check — catches records where stated state and coords disagree
  if (lat !== null && r.country) {
    const cNorm = r.country.toLowerCase().trim().replace(/[^a-z]/g, '');
    if (cNorm === 'us' && !isStateCoordPlausible(lat, lng, r.state)) {
      lat = null; lng = null;
      coordMismatchCount++;
    }
  }

  return {
    id:                r.id,
    source:            r.source            ?? 'unknown',
    collection:        r.collection        ?? null,
    date:              date,
    city:              r.city              ? r.city.substring(0, 120) : null,
    state:             r.state             ? r.state.substring(0, 120) : null,
    country:           r.country           ? r.country.substring(0, 120) : null,
    lat,
    lng,
    shape:             r.shape             ? r.shape.substring(0, 60) : null,
    standardized_shape: r.standardized_shape ? r.standardized_shape.substring(0, 60) : null,
    primary_color:     r.primary_color     ? r.primary_color.substring(0, 60) : null,
    duration:          r.duration          ? r.duration.substring(0, 120) : null,
    duration_bucket:   r.duration_bucket   ?? null,
    witnesses:         r.witnesses         ?? null,
    hynek:             r.hynek             ? r.hynek.substring(0, 20) : null,
    vallee:            r.vallee            ? r.vallee.substring(0, 20) : null,
    svp_rating:        r.svp_rating        ? r.svp_rating.substring(0, 10) : null,
    quality_score:     r.quality_score     ?? null,
    richness_score:    r.richness_score    ?? null,
    hoax_likelihood:   r.hoax_likelihood   ?? null,
    emotion_label:     r.emotion_label     ? r.emotion_label.substring(0, 60) : null,
    vader_compound:    r.vader_compound    ?? null,
    has_description:   r.has_description === 1,
    has_media:         r.has_media === 1,
    direction:         r.direction         ? r.direction.substring(0, 60) : null,
    movement_type:     r.movement_type     ?? null,
    event_type:        r.event_type        ?? null,
    // description is intentionally omitted - db strips raw text; preserve MCP values
  };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`SQLite db: ${DB_PATH}`);
  console.log(`Target:    ${SUPABASE_URL}`);
  console.log(`Batch size: ${BATCH_SIZE}`);
  console.log('');

  const db  = new Database(DB_PATH, { readonly: true });
  const stmt = db.prepare(SELECT_QUERY);

  // Total record count for progress display
  const { total } = db.prepare('SELECT COUNT(*) AS total FROM sighting').get();
  console.log(`Total records in SQLite: ${total.toLocaleString()}`);

  // Retry mode: reprocess a specific id range in batches with per-record fallback
  if (RETRY_FROM !== null && RETRY_TO !== null) {
    console.log(`Retry mode: reprocessing ids ${RETRY_FROM.toLocaleString()} - ${RETRY_TO.toLocaleString()}`);
    const retryRows = db.prepare(`
      SELECT s.id, d.name as source, sc.name as collection, s.date_event as date, l.city, l.state, l.country,
        l.latitude as lat, l.longitude as lng, s.shape, s.standardized_shape, s.primary_color, s.duration,
        s.duration_bucket, s.num_witnesses as witnesses, s.hynek, s.vallee, s.svp_rating, s.quality_score,
        s.richness_score, s.hoax_likelihood, s.dominant_emotion as emotion_label, s.vader_compound,
        s.has_description, s.has_media, s.direction, s.movement_type, s.event_type
      FROM sighting s
      LEFT JOIN source_database d ON s.source_db_id=d.id
      LEFT JOIN source_collection sc ON d.collection_id=sc.id
      LEFT JOIN location l ON s.location_id=l.id
      WHERE s.id >= ${RETRY_FROM} AND s.id <= ${RETRY_TO}
      ORDER BY s.id ASC
    `).all();
    const total = retryRows.length;
    console.log(`Retrying ${total.toLocaleString()} records in batches of ${BATCH_SIZE}...`);
    let retryOk = 0, retryErr = 0;
    for (let i = 0; i < total; i += BATCH_SIZE) {
      const batch = retryRows.slice(i, i + BATCH_SIZE).map(mapRow);
      const { error } = await supabase.from('ufosint_sightings')
        .upsert(batch, { onConflict: 'id', ignoreDuplicates: false });
      if (error) {
        // Batch failed - retry individually
        for (const row of batch) {
          const { error: rowErr } = await supabase.from('ufosint_sightings')
            .upsert(row, { onConflict: 'id', ignoreDuplicates: false });
          if (rowErr) { retryErr++; if (retryErr <= 5) console.error(`  id=${row.id}: ${rowErr.message}`); }
          else retryOk++;
        }
      } else {
        retryOk += batch.length;
      }
      if (Math.floor(i / BATCH_SIZE) % 50 === 0) {
        const pct = ((i + batch.length) / total * 100).toFixed(1);
        console.log(`  [${pct}%] ${(i + batch.length).toLocaleString()}/${total.toLocaleString()} | ok=${retryOk} err=${retryErr}`);
      }
    }
    console.log(`\nRetry complete: ok=${retryOk} err=${retryErr}`);
    db.close();
    return;
  }

  const cp = loadCheckpoint();
  let { lastId, inserted, updated, errors } = cp;

  const startTime = Date.now();
  let batchNum = 0;

  while (true) {
    const rows = stmt.all(lastId, BATCH_SIZE);
    if (rows.length === 0) break;

    batchNum++;
    const mapped = rows.map(mapRow);

    const { error, data } = await supabase
      .from('ufosint_sightings')
      .upsert(mapped, {
        onConflict: 'id',
        ignoreDuplicates: false,   // always update enriched fields
      })
      .select('id');

    if (error) {
      // Batch failed - retry each record individually so one bad row doesn't lose 500
      console.warn(`Batch ${batchNum} failed (ids ${rows[0].id}-${rows[rows.length-1].id}): ${error.message} — retrying individually`);
      for (const row of mapped) {
        const { error: rowErr } = await supabase
          .from('ufosint_sightings')
          .upsert(row, { onConflict: 'id', ignoreDuplicates: false });
        if (rowErr) {
          errors++;
        } else {
          inserted++;
        }
      }
    } else {
      inserted += rows.length;
    }

    lastId = rows[rows.length - 1].id;

    // Progress report every 10 batches (~5k records)
    if (batchNum % 10 === 0) {
      const elapsed    = ((Date.now() - startTime) / 1000).toFixed(0);
      const pct        = ((inserted + errors) / total * 100).toFixed(1);
      const rate       = ((inserted + errors) / Math.max(1, elapsed)).toFixed(0);
      const remaining  = Math.round((total - inserted - errors) / Math.max(1, rate));
      console.log(
        `[${pct}%] ${(inserted + errors).toLocaleString()}/${total.toLocaleString()} | ` +
        `lastId=${lastId} | ${rate} rec/s | ~${remaining}s remaining | errors=${errors}`
      );
      saveCheckpoint({ lastId, inserted, updated, errors, startedAt: cp.startedAt });
    }
  }

  db.close();

  const elapsed = ((Date.now() - startTime) / 1000 / 60).toFixed(1);
  console.log('');
  console.log('═══════════════════════════════════════════');
  console.log(`Done in ${elapsed} min`);
  console.log(`Processed: ${(inserted + errors).toLocaleString()} records`);
  console.log(`Errors:    ${errors}`);
  if (coordMismatchCount > 0) {
    console.log(`Coords nulled (country mismatch / Null Island / out-of-range): ${coordMismatchCount.toLocaleString()}`);
  }
  console.log('═══════════════════════════════════════════');

  saveCheckpoint({ lastId, inserted, updated, errors, startedAt: cp.startedAt, completedAt: new Date().toISOString() });

  if (errors > 0) {
    console.warn(`\n${errors} records failed. Run with --resume to retry from checkpoint.`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
