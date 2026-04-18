/**
 * scripts/populate-timeline.mjs
 *
 * Populates the Supabase `timeline_events` table from data/timeline.json.
 * Idempotent — uses UPSERT so it's safe to re-run after any data change.
 *
 * Usage:
 *   node --env-file=.env.local scripts/populate-timeline.mjs
 *
 * Required env vars (in .env.local or environment):
 *   IMPORT_SUPABASE_URL  — Supabase project URL
 *   IMPORT_SERVICE_KEY   — Supabase service role key (sb_secret_...)
 *
 * Falls back to UFOSINT_SUPABASE_URL / UFOSINT_SERVICE_KEY if IMPORT_* not set.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Supabase client ──────────────────────────────────────────────────────────

const url =
  process.env.IMPORT_SUPABASE_URL ??
  process.env.UFOSINT_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.IMPORT_SERVICE_KEY ??
  process.env.UFOSINT_SERVICE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing IMPORT_SUPABASE_URL / IMPORT_SERVICE_KEY env vars.');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

// ── Load source data ──────────────────────────────────────────────────────────

const timeline = JSON.parse(readFileSync(resolve(ROOT, 'data/timeline.json'), 'utf8'));
console.log(`Loaded ${timeline.length} entries from timeline.json`);

// ── Upsert in batches ──────────────────────────────────────────────────────────

const BATCH_SIZE = 200;

async function upsertBatch(rows) {
  const { error } = await sb
    .from('timeline_events')
    .upsert(rows, { onConflict: 'id' });
  if (error) {
    console.error('UPSERT error:', error.message);
    process.exit(1);
  }
}

async function main() {
  console.log('Populating timeline_events...\n');

  const rows = timeline.map(entry => ({
    id:          entry.id,
    date:        entry.date,
    year:        entry.year,
    title:       entry.title,
    excerpt:     entry.excerpt ?? null,
    categories:  Array.isArray(entry.categories) ? entry.categories : [],
    source_url:  entry.source_url ?? null,
    article_url: entry.article_url ?? null,
  }));

  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    await upsertBatch(batch);
    inserted += batch.length;
    process.stdout.write(`  ${inserted}/${rows.length}\r`);
  }
  console.log(`  ${inserted}/${rows.length} — done`);

  // Verify
  const { count, error } = await sb
    .from('timeline_events')
    .select('*', { count: 'exact', head: true });
  if (error) {
    console.error('Count query failed:', error.message);
  } else {
    console.log(`\nTotal rows in timeline_events: ${count} (inserted ${inserted} this run)`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
