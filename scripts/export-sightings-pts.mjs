#!/usr/bin/env node
/**
 * Export all geocoded sightings as a compact JSON for static CDN serving.
 *
 * Output: public/data/ufosint/sightings-pts.json
 * Format: { "v": 1, "n": <total>, "pts": [[lng, lat, quality, id], ...] }
 *
 * The file is fetched once by SightingsMapInner on component mount.
 * Re-run after every DuelingGroks import:
 *
 *   node --env-file=.env.local scripts/export-sightings-pts.mjs
 *
 * Requires UFOSINT_SUPABASE_URL + UFOSINT_SERVICE_KEY (or IMPORT_* equivalents)
 * in .env.local.  max-rows must be >= 10000 in the Supabase dashboard API settings.
 */

import { createClient } from '@supabase/supabase-js';
import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const url = process.env.UFOSINT_SUPABASE_URL ?? process.env.IMPORT_SUPABASE_URL;
const key = process.env.UFOSINT_SERVICE_KEY   ?? process.env.IMPORT_SERVICE_KEY;

if (!url || !key) {
  console.error('Missing env vars. Set UFOSINT_SUPABASE_URL + UFOSINT_SERVICE_KEY in .env.local');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

const PAGE_SIZE = 10_000;
let lastId = 0;
let total  = 0;
let page   = 0;

/** @type {[number, number, number, number][]} */
const pts = [];

console.log('Exporting geocoded sightings from Supabase (keyset pagination)...');
console.log('Note: requires max-rows >= 10000 in Supabase dashboard API settings.\n');

while (true) {
  page++;
  process.stdout.write(`  Page ${page} (last_id=${lastId}) ...`);

  const { data, error } = await sb
    .from('ufosint_sightings')
    .select('id, lat, lng, quality_score')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .gt('id', lastId)
    .order('id', { ascending: true })
    .limit(PAGE_SIZE);

  if (error) {
    console.error('\nSupabase error:', error.message);
    process.exit(1);
  }

  if (!data || data.length === 0) {
    console.log(' done.');
    break;
  }

  for (const row of data) {
    pts.push([
      Math.round(row.lng * 10000) / 10000,   // 4dp ≈ 11m precision
      Math.round(row.lat * 10000) / 10000,
      row.quality_score ?? 0,
      row.id,
    ]);
  }

  lastId = data[data.length - 1].id;
  total += data.length;
  process.stdout.write(` ${data.length} rows  (running total: ${total})\n`);

  if (data.length < PAGE_SIZE) break;
}

const outDir  = join(__dirname, '..', 'public', 'data', 'ufosint');
const outPath = join(outDir, 'sightings-pts.json');

mkdirSync(outDir, { recursive: true });

console.log(`\nWriting ${pts.length.toLocaleString()} points to ${outPath} ...`);
writeFileSync(outPath, JSON.stringify({ v: 1, n: pts.length, pts }));

const bytes = Buffer.byteLength(JSON.stringify({ v: 1, n: pts.length, pts }), 'utf8');
console.log(`Done. File size: ${(bytes / 1024 / 1024).toFixed(1)} MB (uncompressed)`);
console.log('Vercel CDN will Brotli-compress this on delivery (~60-70% reduction).\n');
console.log('Commit the generated file:');
console.log('  git add public/data/ufosint/sightings-pts.json');
console.log('  git commit -m "Refresh sightings-pts static export"');
