/**
 * generate-hexbins.mjs
 *
 * Regenerates data/ufosint/hexbins-z{3,4,5}.json from the live Supabase
 * ufosint_sightings table. Run this after any large import to update the
 * static hexbin files used by the sightings map.
 *
 * Uses a hex grid at three resolutions:
 *   zoom 3: ~7° cell size  (world overview)
 *   zoom 4: ~3.5° cell size (continental)
 *   zoom 5: ~1.75° cell size (regional)
 *
 * Usage:
 *   node --env-file=.env.local scripts/generate-hexbins.mjs
 *
 * Required env vars: IMPORT_SUPABASE_URL, IMPORT_SERVICE_KEY
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'data', 'ufosint');

const SUPABASE_URL = process.env.IMPORT_SUPABASE_URL;
const SERVICE_KEY  = process.env.IMPORT_SERVICE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing IMPORT_SUPABASE_URL or IMPORT_SERVICE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false },
});

// ── Hex grid helpers ───────────────────────────────────────────────────────

function cellSize(zoom) {
  // Approximate degrees per cell at each zoom tier
  const sizes = { 3: 7, 4: 3.5, 5: 1.75 };
  return sizes[zoom] ?? 7;
}

function toHexCell(lat, lng, size) {
  // Offset hex grid: odd rows shifted by half a cell width
  const col = Math.round(lng / size);
  const row = Math.round(lat / (size * 0.866)); // 0.866 = sin(60°) for hex rows
  // Snap lat/lng to hex center
  const cLat = row * size * 0.866;
  const cLng = (col + (row % 2 === 0 ? 0 : 0.5)) * size;
  return { row, col, lat: Math.round(cLat * 1000) / 1000, lng: Math.round(cLng * 1000) / 1000 };
}

async function buildHexbins(zoom) {
  const size = cellSize(zoom);
  console.log(`\nBuilding hexbins-z${zoom} (cell size ~${size}°)...`);

  // Stream all geocoded records using pagination
  const PAGE = 1000;
  let offset = 0;
  const cellMap = new Map(); // key -> { lat, lng, cnt }

  while (true) {
    const { data, error } = await supabase
      .from('ufosint_sightings')
      .select('lat, lng')
      .not('lat', 'is', null)
      .not('lng', 'is', null)
      .range(offset, offset + PAGE - 1);

    if (error) throw new Error(`Supabase error: ${error.message}`);
    if (!data || data.length === 0) break;

    for (const row of data) {
      const cell = toHexCell(row.lat, row.lng, size);
      const key = `${cell.row}:${cell.col}`;
      if (cellMap.has(key)) {
        cellMap.get(key).cnt++;
      } else {
        cellMap.set(key, { lat: cell.lat, lng: cell.lng, cnt: 1 });
      }
    }

    offset += data.length;
    if (offset % 50000 === 0) {
      process.stdout.write(`  ${offset.toLocaleString()} records processed, ${cellMap.size} cells...\r`);
    }
    if (data.length < PAGE) break;
  }

  // Convert to sorted array (descending cnt)
  const cells = Array.from(cellMap.values())
    .filter(c => c.cnt > 0)
    .sort((a, b) => b.cnt - a.cnt)
    .map(c => ({ lat: c.lat, lng: c.lng, cnt: c.cnt }));

  console.log(`  Done: ${offset.toLocaleString()} records → ${cells.length} cells`);
  console.log(`  Max density: ${cells[0]?.cnt?.toLocaleString()} @ [${cells[0]?.lat}, ${cells[0]?.lng}]`);
  console.log(`  Top 5 hotspots:`);
  cells.slice(0, 5).forEach(c => {
    console.log(`    [${c.lat}, ${c.lng}] = ${c.cnt.toLocaleString()}`);
  });

  return { cells };
}

async function main() {
  console.log(`Source: ${SUPABASE_URL}`);
  console.log(`Output: ${OUT_DIR}`);

  for (const zoom of [3, 4, 5]) {
    const data = await buildHexbins(zoom);
    const outPath = path.join(OUT_DIR, `hexbins-z${zoom}.json`);
    fs.writeFileSync(outPath, JSON.stringify(data));
    console.log(`  Wrote ${outPath} (${(fs.statSync(outPath).size / 1024).toFixed(0)}KB)`);
  }

  console.log('\nAll hexbins regenerated. Commit data/ufosint/hexbins-z*.json to deploy.');
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
