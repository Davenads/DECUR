/**
 * import-ufosint-to-supabase.mjs
 *
 * Imports all UFOSINT sightings into Supabase (decur-dev) via adaptive date-window sweep.
 * Strategy: monthly windows → weekly for overflow (>200) → daily for further overflow.
 * Checkpoints progress to allow safe resume after interruption.
 *
 * Usage:
 *   node scripts/import-ufosint-to-supabase.mjs
 *   node scripts/import-ufosint-to-supabase.mjs --resume   # skip already-done windows
 *   node scripts/import-ufosint-to-supabase.mjs --dry-run  # count only, no upsert
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Config ─────────────────────────────────────────────────────────────────

const SUPABASE_URL  = 'https://bosszjlkhglatuashtbd.supabase.co';
const SERVICE_KEY   = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvc3N6amxraGdsYXR1YXNodGJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTE3MjUyNywiZXhwIjoyMDkwNzQ4NTI3fQ.sH7xGBaCzre0AIr1ZAb-M6BiK6hrGBQz3mTbPKrBpo8';
const MCP_URL       = 'https://ufosint-explorer.azurewebsites.net/mcp';
const TABLE         = 'ufosint_sightings';

const START_YEAR    = 1947;
const END_YEAR      = 2026;
const DELAY_MS      = 600;       // between API calls
const UPSERT_BATCH  = 500;       // records per Supabase upsert
const LIMIT         = 200;       // MCP max
const OVERFLOW_THRESHOLD = 195;  // if returned >= this, assume overflow → split

const __dir = dirname(fileURLToPath(import.meta.url));
const CHECKPOINT_FILE = join(__dir, '..', 'data', 'ufosint', 'import-checkpoint.json');

const DRY_RUN = process.argv.includes('--dry-run');
const RESUME  = process.argv.includes('--resume');

// ── Checkpoint helpers ──────────────────────────────────────────────────────

function loadCheckpoint() {
  if (!existsSync(CHECKPOINT_FILE)) return { done: new Set(), inserted: 0, skipped: 0 };
  try {
    const raw = JSON.parse(readFileSync(CHECKPOINT_FILE, 'utf-8'));
    return { done: new Set(raw.done ?? []), inserted: raw.inserted ?? 0, skipped: raw.skipped ?? 0 };
  } catch {
    return { done: new Set(), inserted: 0, skipped: 0 };
  }
}

function saveCheckpoint(cp) {
  writeFileSync(CHECKPOINT_FILE, JSON.stringify({
    done: [...cp.done],
    inserted: cp.inserted,
    skipped: cp.skipped,
    updated_at: new Date().toISOString(),
  }, null, 2));
}

// ── Date helpers ────────────────────────────────────────────────────────────

function pad(n) { return String(n).padStart(2, '0'); }

function monthRange(year, month) {
  // month: 1-12
  const from = `${year}-${pad(month)}-01`;
  const last = new Date(year, month, 0).getDate(); // last day of month
  const to   = `${year}-${pad(month)}-${pad(last)}`;
  return { from, to };
}

function weekRanges(year, month) {
  // Split month into ~4 weekly chunks
  const lastDay = new Date(year, month, 0).getDate();
  const weeks = [];
  const splits = [1, 8, 15, 22, lastDay + 1];
  for (let i = 0; i < splits.length - 1; i++) {
    const start = splits[i];
    const end   = Math.min(splits[i + 1] - 1, lastDay);
    if (start > lastDay) break;
    weeks.push({
      from: `${year}-${pad(month)}-${pad(start)}`,
      to:   `${year}-${pad(month)}-${pad(end)}`,
    });
  }
  return weeks;
}

function dayRanges(year, month, weekFrom, weekTo) {
  // Every day in the week range
  const days = [];
  const start = new Date(weekFrom + 'T00:00:00Z');
  const end   = new Date(weekTo   + 'T00:00:00Z');
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    days.push({ from: iso, to: iso });
  }
  return days;
}

// ── MCP search ──────────────────────────────────────────────────────────────

async function searchSightings(dateFrom, dateTo, limit = LIMIT) {
  const body = JSON.stringify({
    jsonrpc: '2.0', id: 1,
    method: 'tools/call',
    params: {
      name: 'search_sightings',
      arguments: { date_from: dateFrom, date_to: dateTo, limit },
    },
  });
  const r = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    signal: AbortSignal.timeout(30_000),
  });
  if (!r.ok) throw new Error(`MCP HTTP ${r.status}`);
  const envelope = await r.json();
  const text = envelope.result?.content?.[0]?.text;
  if (!text) throw new Error('Empty MCP response');
  return JSON.parse(text); // { total, returned, results: [...] }
}

// ── Supabase upsert ─────────────────────────────────────────────────────────

async function upsertBatch(records) {
  if (DRY_RUN || records.length === 0) return;
  const url = `${SUPABASE_URL}/rest/v1/${TABLE}`;
  const r = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SERVICE_KEY}`,
      'apikey': SERVICE_KEY,
      'Prefer': 'resolution=merge-duplicates,return=minimal',
    },
    body: JSON.stringify(records),
    signal: AbortSignal.timeout(30_000),
  });
  if (!r.ok) {
    const err = await r.text().catch(() => r.statusText);
    throw new Error(`Supabase upsert failed ${r.status}: ${err}`);
  }
}

// ── Record transform ────────────────────────────────────────────────────────

function transform(raw) {
  // search_sightings returns: id, date_event, shape, hynek, num_witnesses,
  //   duration, description, source, city, state, country, latitude, longitude

  // DECIMAL(9,6) allows max 3 integer digits + 6 decimal places.
  // Clamp to valid geo ranges and round to 6dp to avoid numeric overflow.
  let lat = raw.latitude  != null ? parseFloat(raw.latitude)  : null;
  let lng = raw.longitude != null ? parseFloat(raw.longitude) : null;
  if (lat != null) {
    if (lat < -90 || lat > 90) lat = null;        // out of range → null
    else lat = Math.round(lat * 1e6) / 1e6;        // round to 6dp
  }
  if (lng != null) {
    if (lng < -180 || lng > 180) lng = null;       // out of range → null
    else lng = Math.round(lng * 1e6) / 1e6;        // round to 6dp
  }

  // Truncate string fields to their column max lengths as a safety net
  const trunc = (s, n) => (s && s.length > n) ? s.slice(0, n) : s;

  return {
    id:          raw.id,
    date:        raw.date_event ? raw.date_event.slice(0, 10) : null,
    shape:       trunc(raw.shape ?? null, 60),
    source:      trunc(raw.source ?? 'UNKNOWN', 60),
    city:        trunc(raw.city ?? null, 120),
    state:       trunc(raw.state ?? null, 120),   // widened by migration 005
    country:     trunc(raw.country ?? null, 120), // widened by migration 005
    lat,
    lng,
    description: raw.description ?? null,         // TEXT - no length limit
    duration:    trunc(raw.duration ?? null, 120),
    witnesses:   raw.num_witnesses != null ? parseInt(raw.num_witnesses, 10) : null,
    // quality_score, emotion_label, collection not returned by search_sightings → NULL
  };
}

// ── Sleep ───────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Core sweep ──────────────────────────────────────────────────────────────

async function fetchWindow(from, to, label, cp, buffer) {
  await sleep(DELAY_MS);
  let result;
  try {
    result = await searchSightings(from, to);
  } catch (err) {
    console.warn(`  ⚠ fetch error ${label}: ${err.message} — retrying once`);
    await sleep(2000);
    result = await searchSightings(from, to);
  }

  const { total, returned, results } = result;

  if (returned >= OVERFLOW_THRESHOLD && total > LIMIT) {
    // Overflow - caller must split further
    return { overflow: true, total };
  }

  // Capture these records
  let newCount = 0;
  for (const r of results) {
    if (!cp.seen.has(r.id)) {
      cp.seen.add(r.id);
      buffer.push(transform(r));
      newCount++;
    }
  }

  console.log(`  ${label}: ${returned}/${total} (${newCount} new)`);
  return { overflow: false, total };
}

async function flushBuffer(buffer, cp) {
  if (buffer.length === 0) return;
  const batches = [];
  for (let i = 0; i < buffer.length; i += UPSERT_BATCH) {
    batches.push(buffer.slice(i, i + UPSERT_BATCH));
  }
  for (const batch of batches) {
    await upsertBatch(batch);
    cp.inserted += batch.length;
    if (!DRY_RUN) console.log(`  → upserted batch of ${batch.length} (total: ${cp.inserted})`);
  }
  buffer.length = 0;
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🚀 UFOSINT → Supabase import${DRY_RUN ? ' [DRY RUN]' : ''}${RESUME ? ' [RESUME]' : ''}`);
  console.log(`   Target: ${SUPABASE_URL}`);
  console.log(`   Table:  ${TABLE}`);

  const cp = RESUME ? loadCheckpoint() : { done: new Set(), inserted: 0, skipped: 0 };
  cp.seen  = new Set(); // IDs seen this session (for dedup)

  if (RESUME) {
    console.log(`   Resuming: ${cp.done.size} windows already done, ${cp.inserted} rows inserted`);
  }

  const buffer = []; // staging area for upsert
  let apiCalls = 0;

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    console.log(`\n── ${year} ─────────────────────────`);

    for (let month = 1; month <= 12; month++) {
      const { from: mFrom, to: mTo } = monthRange(year, month);
      const monthKey = `${year}-${pad(month)}`;

      if (RESUME && cp.done.has(monthKey)) {
        cp.skipped++;
        continue;
      }

      await sleep(DELAY_MS);
      apiCalls++;

      let monthResult;
      try {
        monthResult = await searchSightings(mFrom, mTo);
      } catch (err) {
        console.warn(`  ⚠ month ${monthKey} error: ${err.message} — skipping`);
        continue;
      }

      const { total: mTotal, returned: mReturned, results: mResults } = monthResult;

      if (mTotal === 0) {
        cp.done.add(monthKey);
        continue;
      }

      if (mReturned < OVERFLOW_THRESHOLD) {
        // Full month captured
        let newCount = 0;
        for (const r of mResults) {
          if (!cp.seen.has(r.id)) { cp.seen.add(r.id); buffer.push(transform(r)); newCount++; }
        }
        console.log(`  ${monthKey}: ${mReturned}/${mTotal} (${newCount} new)`);
        cp.done.add(monthKey);
      } else {
        // Month overflow → weekly splits
        console.log(`  ${monthKey}: overflow (${mTotal} total) → weekly split`);
        const weeks = weekRanges(year, month);

        for (const { from: wFrom, to: wTo } of weeks) {
          const weekKey = `${wFrom}/${wTo}`;
          if (RESUME && cp.done.has(weekKey)) { cp.skipped++; continue; }

          await sleep(DELAY_MS);
          apiCalls++;

          let weekResult;
          try {
            weekResult = await searchSightings(wFrom, wTo);
          } catch (err) {
            console.warn(`  ⚠ week ${weekKey} error: ${err.message}`);
            continue;
          }

          const { total: wTotal, returned: wReturned, results: wResults } = weekResult;

          if (wReturned < OVERFLOW_THRESHOLD) {
            let newCount = 0;
            for (const r of wResults) {
              if (!cp.seen.has(r.id)) { cp.seen.add(r.id); buffer.push(transform(r)); newCount++; }
            }
            console.log(`    ${weekKey}: ${wReturned}/${wTotal} (${newCount} new)`);
            cp.done.add(weekKey);
          } else {
            // Week overflow → daily splits
            console.log(`    ${weekKey}: overflow (${wTotal} total) → daily split`);
            const days = dayRanges(year, month, wFrom, wTo);

            for (const { from: dFrom, to: dTo } of days) {
              const dayKey = dFrom;
              if (RESUME && cp.done.has(dayKey)) { cp.skipped++; continue; }

              await sleep(DELAY_MS);
              apiCalls++;

              let dayResult;
              try {
                dayResult = await searchSightings(dFrom, dTo);
              } catch (err) {
                console.warn(`  ⚠ day ${dayKey} error: ${err.message}`);
                continue;
              }

              const { total: dTotal, returned: dReturned, results: dResults } = dayResult;

              if (dReturned >= OVERFLOW_THRESHOLD && dTotal > LIMIT) {
                // Single day still overflows (very rare) - accept the cap of 200
                console.warn(`      ${dayKey}: ⚠ ${dTotal} records, capped at ${dReturned}`);
              }

              let newCount = 0;
              for (const r of dResults) {
                if (!cp.seen.has(r.id)) { cp.seen.add(r.id); buffer.push(transform(r)); newCount++; }
              }
              if (dTotal > 0) console.log(`      ${dayKey}: ${dReturned}/${dTotal} (${newCount} new)`);
              cp.done.add(dayKey);
            }
          }
        }
        cp.done.add(monthKey);
      }

      // Flush buffer periodically
      if (buffer.length >= UPSERT_BATCH) {
        await flushBuffer(buffer, cp);
        saveCheckpoint(cp);
      }
    }

    // Flush and checkpoint after each year
    await flushBuffer(buffer, cp);
    saveCheckpoint(cp);
    console.log(`  ✓ ${year} done (api calls so far: ${apiCalls}, inserted: ${cp.inserted})`);
  }

  // Final flush
  await flushBuffer(buffer, cp);
  saveCheckpoint(cp);

  console.log(`\n✅ Import complete!`);
  console.log(`   API calls:  ${apiCalls}`);
  console.log(`   Unique IDs: ${cp.seen.size}`);
  console.log(`   Inserted:   ${cp.inserted}`);
  console.log(`   Skipped:    ${cp.skipped} (already done)`);
  if (DRY_RUN) console.log(`   [DRY RUN - no data written to Supabase]`);
}

main().catch(err => {
  console.error('\n❌ Fatal error:', err);
  process.exit(1);
});
