/**
 * backfill-ufosint-by-source.mjs
 *
 * Second-pass import that sweeps each of the 5 UFOSINT sources independently
 * using the same monthly → weekly → daily adaptive strategy.
 *
 * Recovers the ~199k records missed in the first pass because single days
 * exceeded the 200-record API cap. By filtering per-source, each window has
 * at most ~1/5 the density, making the 200-record limit rarely a problem.
 *
 * Since upsert uses merge-duplicates (conflict on id), existing records are
 * silently skipped — safe to run multiple times.
 *
 * Usage:
 *   node scripts/backfill-ufosint-by-source.mjs
 *   node scripts/backfill-ufosint-by-source.mjs --resume
 *   node scripts/backfill-ufosint-by-source.mjs --dry-run
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// ── Config ─────────────────────────────────────────────────────────────────
// Edit these two constants before running. Never commit real keys.
// For decur-dev: https://bosszjlkhglatuashtbd.supabase.co
// For prod:      https://iyvngosoyzptliytlcov.supabase.co
// Get the service role key from: Supabase dashboard → Settings → API

const SUPABASE_URL  = process.env.IMPORT_SUPABASE_URL  ?? 'https://bosszjlkhglatuashtbd.supabase.co';
const SERVICE_KEY   = process.env.IMPORT_SERVICE_KEY   ?? '';
const MCP_URL       = 'https://ufosint-explorer.azurewebsites.net/mcp';
const TABLE         = 'ufosint_sightings';

const SOURCES       = ['NUFORC', 'MUFON', 'UFOCAT', 'UPDB', 'UFO-search'];
const START_YEAR    = 1947;
const END_YEAR      = 2026;
const DELAY_MS      = 600;
const UPSERT_BATCH  = 500;
const LIMIT         = 200;
const OVERFLOW_THRESHOLD = 195;

const __dir = dirname(fileURLToPath(import.meta.url));
const CHECKPOINT_FILE = join(__dir, '..', 'data', 'ufosint', 'backfill-checkpoint.json');

const DRY_RUN = process.argv.includes('--dry-run');
const RESUME  = process.argv.includes('--resume');

// ── Checkpoint ──────────────────────────────────────────────────────────────

function loadCheckpoint() {
  if (!existsSync(CHECKPOINT_FILE)) return { done: new Set(), inserted: 0 };
  try {
    const raw = JSON.parse(readFileSync(CHECKPOINT_FILE, 'utf-8'));
    return { done: new Set(raw.done ?? []), inserted: raw.inserted ?? 0 };
  } catch {
    return { done: new Set(), inserted: 0 };
  }
}

function saveCheckpoint(cp) {
  writeFileSync(CHECKPOINT_FILE, JSON.stringify({
    done: [...cp.done],
    inserted: cp.inserted,
    updated_at: new Date().toISOString(),
  }, null, 2));
}

// ── Date helpers ────────────────────────────────────────────────────────────

function pad(n) { return String(n).padStart(2, '0'); }

function monthRange(year, month) {
  const last = new Date(year, month, 0).getDate();
  return {
    from: `${year}-${pad(month)}-01`,
    to:   `${year}-${pad(month)}-${pad(last)}`,
  };
}

function weekRanges(year, month) {
  const lastDay = new Date(year, month, 0).getDate();
  const splits = [1, 8, 15, 22, lastDay + 1];
  const weeks = [];
  for (let i = 0; i < splits.length - 1; i++) {
    const start = splits[i];
    const end = Math.min(splits[i + 1] - 1, lastDay);
    if (start > lastDay) break;
    weeks.push({
      from: `${year}-${pad(month)}-${pad(start)}`,
      to:   `${year}-${pad(month)}-${pad(end)}`,
    });
  }
  return weeks;
}

function dayRanges(year, month, wFrom, wTo) {
  const days = [];
  const start = new Date(wFrom + 'T00:00:00Z');
  const end   = new Date(wTo   + 'T00:00:00Z');
  for (let d = new Date(start); d <= end; d.setUTCDate(d.getUTCDate() + 1)) {
    const iso = d.toISOString().slice(0, 10);
    days.push({ from: iso, to: iso });
  }
  return days;
}

// ── MCP search ──────────────────────────────────────────────────────────────

async function searchSightings(dateFrom, dateTo, source, limit = LIMIT) {
  const args = { date_from: dateFrom, date_to: dateTo, limit };
  if (source) args.source = source;

  const r = await fetch(MCP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1, method: 'tools/call',
      params: { name: 'search_sightings', arguments: args },
    }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!r.ok) throw new Error(`MCP HTTP ${r.status}`);
  const env = await r.json();
  const text = env.result?.content?.[0]?.text;
  if (!text) throw new Error('Empty MCP response');
  return JSON.parse(text);
}

// ── Supabase upsert ─────────────────────────────────────────────────────────

async function upsertBatch(records) {
  if (DRY_RUN || records.length === 0) return;
  const r = await fetch(`${SUPABASE_URL}/rest/v1/${TABLE}`, {
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

// ── Transform ───────────────────────────────────────────────────────────────

function transform(raw) {
  let lat = raw.latitude  != null ? parseFloat(raw.latitude)  : null;
  let lng = raw.longitude != null ? parseFloat(raw.longitude) : null;
  if (lat != null) {
    if (lat < -90 || lat > 90) lat = null;
    else lat = Math.round(lat * 1e6) / 1e6;
  }
  if (lng != null) {
    if (lng < -180 || lng > 180) lng = null;
    else lng = Math.round(lng * 1e6) / 1e6;
  }
  const trunc = (s, n) => (s && s.length > n) ? s.slice(0, n) : s;
  return {
    id:          raw.id,
    date:        raw.date_event ? raw.date_event.slice(0, 10) : null,
    shape:       trunc(raw.shape ?? null, 60),
    source:      trunc(raw.source ?? 'UNKNOWN', 60),
    city:        trunc(raw.city ?? null, 120),
    state:       trunc(raw.state ?? null, 120),
    country:     trunc(raw.country ?? null, 120),
    lat, lng,
    description: raw.description ?? null,
    duration:    trunc(raw.duration ?? null, 120),
    witnesses:   raw.num_witnesses != null ? parseInt(raw.num_witnesses, 10) : null,
  };
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ── Flush ───────────────────────────────────────────────────────────────────

async function flushBuffer(buffer, cp) {
  if (buffer.length === 0) return;
  for (let i = 0; i < buffer.length; i += UPSERT_BATCH) {
    const batch = buffer.slice(i, i + UPSERT_BATCH);
    await upsertBatch(batch);
    cp.inserted += batch.length;
    if (!DRY_RUN) console.log(`  → upserted ${batch.length} (total: ${cp.inserted})`);
  }
  buffer.length = 0;
}

// ── Sweep one source×date window ────────────────────────────────────────────

async function sweep(from, to, source, label, cp, buffer) {
  await sleep(DELAY_MS);
  let result;
  try {
    result = await searchSightings(from, to, source);
  } catch (err) {
    console.warn(`  ⚠ ${label} error: ${err.message} — retrying`);
    await sleep(2000);
    result = await searchSightings(from, to, source);
  }

  const { total, returned, results } = result;
  if (returned >= OVERFLOW_THRESHOLD && total > LIMIT) {
    return { overflow: true, total };
  }

  let newCount = 0;
  for (const r of results) {
    if (!cp.seen.has(r.id)) {
      cp.seen.add(r.id);
      buffer.push(transform(r));
      newCount++;
    }
  }
  if (total > 0) console.log(`    ${label}: ${returned}/${total} (+${newCount} new)`);
  return { overflow: false, total };
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!SERVICE_KEY && !DRY_RUN) {
    console.error('❌  No service key. Set IMPORT_SERVICE_KEY env var or check CLAUDE.md for instructions.');
    process.exit(1);
  }

  console.log(`\n🔄 UFOSINT backfill by source${DRY_RUN ? ' [DRY RUN]' : ''}${RESUME ? ' [RESUME]' : ''}`);
  console.log(`   Target: ${SUPABASE_URL}`);

  const cp = RESUME ? loadCheckpoint() : { done: new Set(), inserted: 0 };
  cp.seen = new Set();

  if (RESUME) console.log(`   Resuming: ${cp.done.size} source×windows done, ${cp.inserted} rows inserted`);

  const buffer = [];
  let apiCalls = 0;
  let skipped = 0;

  for (const source of SOURCES) {
    console.log(`\n══ Source: ${source} ══════════════════`);

    for (let year = START_YEAR; year <= END_YEAR; year++) {
      const yearKey = `${source}:${year}`;
      if (RESUME && cp.done.has(yearKey)) { skipped++; continue; }

      console.log(`  ── ${year}`);

      for (let month = 1; month <= 12; month++) {
        const { from: mFrom, to: mTo } = monthRange(year, month);
        const monthKey = `${source}:${year}-${pad(month)}`;
        if (RESUME && cp.done.has(monthKey)) { skipped++; continue; }

        await sleep(DELAY_MS);
        apiCalls++;

        let monthResult;
        try {
          monthResult = await searchSightings(mFrom, mTo, source);
        } catch (err) {
          console.warn(`  ⚠ ${monthKey} error: ${err.message}`);
          continue;
        }

        const { total: mTotal, returned: mReturned, results: mResults } = monthResult;

        if (mTotal === 0) { cp.done.add(monthKey); continue; }

        if (mReturned < OVERFLOW_THRESHOLD) {
          let newCount = 0;
          for (const r of mResults) {
            if (!cp.seen.has(r.id)) { cp.seen.add(r.id); buffer.push(transform(r)); newCount++; }
          }
          if (newCount > 0) console.log(`    ${monthKey}: ${mReturned}/${mTotal} (+${newCount} new)`);
          cp.done.add(monthKey);
        } else {
          console.log(`    ${monthKey}: overflow (${mTotal}) → weekly`);
          const weeks = weekRanges(year, month);

          for (const { from: wFrom, to: wTo } of weeks) {
            const weekKey = `${source}:${wFrom}/${wTo}`;
            if (RESUME && cp.done.has(weekKey)) { skipped++; continue; }

            await sleep(DELAY_MS);
            apiCalls++;
            let wResult;
            try { wResult = await searchSightings(wFrom, wTo, source); }
            catch (err) { console.warn(`  ⚠ ${weekKey}: ${err.message}`); continue; }

            const { total: wTotal, returned: wReturned, results: wResults } = wResult;

            if (wReturned < OVERFLOW_THRESHOLD) {
              let newCount = 0;
              for (const r of wResults) {
                if (!cp.seen.has(r.id)) { cp.seen.add(r.id); buffer.push(transform(r)); newCount++; }
              }
              if (newCount > 0) console.log(`      ${weekKey}: ${wReturned}/${wTotal} (+${newCount} new)`);
              cp.done.add(weekKey);
            } else {
              console.log(`      ${weekKey}: overflow (${wTotal}) → daily`);
              const days = dayRanges(year, month, wFrom, wTo);

              for (const { from: dFrom, to: dTo } of days) {
                const dayKey = `${source}:${dFrom}`;
                if (RESUME && cp.done.has(dayKey)) { skipped++; continue; }

                const res = await sweep(dFrom, dTo, source, dayKey, cp, buffer);
                if (res.overflow) {
                  console.warn(`      ${dayKey}: ⚠ ${res.total} records for single source×day, capped`);
                }
                cp.done.add(dayKey);
                apiCalls++;
              }
            }
            cp.done.add(weekKey);
          }
          cp.done.add(monthKey);
        }

        if (buffer.length >= UPSERT_BATCH) {
          await flushBuffer(buffer, cp);
          saveCheckpoint(cp);
        }
      }

      await flushBuffer(buffer, cp);
      cp.done.add(yearKey);
      saveCheckpoint(cp);
      console.log(`  ✓ ${source}:${year} done (api calls: ${apiCalls}, inserted: ${cp.inserted})`);
    }
  }

  await flushBuffer(buffer, cp);
  saveCheckpoint(cp);

  console.log(`\n✅ Backfill complete!`);
  console.log(`   API calls:  ${apiCalls}`);
  console.log(`   New IDs:    ${cp.seen.size}`);
  console.log(`   Inserted:   ${cp.inserted}`);
  console.log(`   Skipped:    ${skipped} (already done)`);
}

main().catch(err => {
  console.error('\n❌ Fatal:', err);
  process.exit(1);
});
