/**
 * lib/supabase/sightings.ts
 *
 * Server-side query helpers for the ufosint_sightings table.
 * Used by /api/sightings/* when UFOSINT_USE_SUPABASE=true.
 */

import { createClient } from '@supabase/supabase-js';

// Uses dedicated env vars pointing to whichever Supabase project holds the
// ufosint_sightings data. In local dev this is decur-dev (cloud); in production
// it will be the prod Supabase project once the data is migrated there.
//
// Required env vars (add to .env.local for local dev):
//   UFOSINT_SUPABASE_URL  — e.g. https://bosszjlkhglatuashtbd.supabase.co
//   UFOSINT_SERVICE_KEY   — sb_secret_... key from that project's API Keys page
//
// Falls back to main Supabase env vars so existing behaviour is preserved if
// the dedicated vars are absent.
function getAdminClient() {
  const url =
    process.env.UFOSINT_SUPABASE_URL ??
    process.env.SUPABASE_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.UFOSINT_SERVICE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

/* ── Types ────────────────────────────────────────────────────────────── */

export interface SightingStats {
  total_sightings: number;
  mapped_sightings: number;
  high_quality: number;
  by_source: Array<{ name: string; count: number; collection: string }>;
  date_range: { min: string; max: string };
}

export interface CountByItem {
  value: string;
  count: number;
}

export interface SightingRecord {
  id: number;
  date: string | null;
  shape: string | null;
  source: string;
  city: string | null;
  state: string | null;
  country: string | null;
  lat: number | null;
  lng: number | null;
  quality_score: number | null;
  description: string | null;
  duration: string | null;
  witnesses: number | null;
  emotion_label: string | null;
  collection: string | null;
}

export interface SearchParams {
  q?: string;
  source?: string;
  shape?: string;
  country?: string;
  state?: string;
  date_from?: string;
  date_to?: string;
  quality_min?: number;
  limit?: number;
  offset?: number;
}

/* ── Stats ────────────────────────────────────────────────────────────── */

export async function getSightingStats(): Promise<SightingStats> {
  const sb = getAdminClient();

  const { count: total_count } = await sb
    .from('ufosint_sightings')
    .select('*', { count: 'exact', head: true });

  const { count: mapped_count } = await sb
    .from('ufosint_sightings')
    .select('*', { count: 'exact', head: true })
    .not('lat', 'is', null)
    .not('lng', 'is', null);

  const { count: hq_count } = await sb
    .from('ufosint_sightings')
    .select('*', { count: 'exact', head: true })
    .gte('quality_score', 60);

  // Date range
  const { data: dateMin } = await sb
    .from('ufosint_sightings')
    .select('date')
    .not('date', 'is', null)
    .order('date', { ascending: true })
    .limit(1)
    .single();

  const { data: dateMax } = await sb
    .from('ufosint_sightings')
    .select('date')
    .not('date', 'is', null)
    .order('date', { ascending: false })
    .limit(1)
    .single();

  // Source counts from view
  const { data: sources, error: srcErr } = await sb
    .from('ufosint_source_counts')
    .select('name, collection, count');
  if (srcErr) throw srcErr;

  return {
    total_sightings: total_count ?? 0,
    mapped_sightings: mapped_count ?? 0,
    high_quality: hq_count ?? 0,
    by_source: (sources ?? []).map(s => ({
      name: s.name,
      count: s.count,
      collection: s.collection ?? '',
    })),
    date_range: {
      min: dateMin?.date ?? '',
      max: dateMax?.date ?? '',
    },
  };
}

/* ── Count by field ───────────────────────────────────────────────────── */

export async function countByShape(limit = 30): Promise<CountByItem[]> {
  const sb = getAdminClient();
  const { data, error } = await sb
    .from('ufosint_shape_counts')
    .select('value, count')
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(r => ({ value: r.value, count: r.count }));
}

export async function countByCountry(limit = 30): Promise<CountByItem[]> {
  const sb = getAdminClient();
  const { data, error } = await sb
    .from('ufosint_country_counts')
    .select('value, count')
    .limit(limit);
  if (error) throw error;
  return (data ?? []).map(r => ({ value: r.value, count: r.count }));
}

export async function countBySource(): Promise<CountByItem[]> {
  const sb = getAdminClient();
  const { data, error } = await sb
    .from('ufosint_source_counts')
    .select('name, count');
  if (error) throw error;
  return (data ?? []).map(r => ({ value: r.name, count: r.count }));
}

/* ── Hexbin from lat/lng buckets ──────────────────────────────────────── */

interface HexCell { lat: number; lng: number; cnt: number }
interface HexBinResult { cells: HexCell[]; count: number; size: number }

const ZOOM_CELL_DEGREES: Record<3 | 4 | 5, number> = {
  3: 7.5,
  4: 3.5,
  5: 1.5,
};

export async function getHexbins(zoom: 3 | 4 | 5, qualityMin = 0): Promise<HexBinResult> {
  const sb = getAdminClient();
  const cellDeg = ZOOM_CELL_DEGREES[zoom];

  // Fetch geocoded records (lat/lng not null) above quality threshold
  // We aggregate in JS since PostgREST doesn't support FLOOR grouping directly
  const { data, error } = await sb
    .from('ufosint_sightings')
    .select('lat, lng')
    .not('lat', 'is', null)
    .not('lng', 'is', null)
    .gte('quality_score', qualityMin);

  if (error) throw error;

  // Bucket into grid cells
  const buckets = new Map<string, { lat: number; lng: number; cnt: number }>();
  for (const row of data ?? []) {
    const bucketLat = Math.floor(row.lat / cellDeg) * cellDeg + cellDeg / 2;
    const bucketLng = Math.floor(row.lng / cellDeg) * cellDeg + cellDeg / 2;
    const key = `${bucketLat},${bucketLng}`;
    const existing = buckets.get(key);
    if (existing) {
      existing.cnt++;
    } else {
      buckets.set(key, { lat: bucketLat, lng: bucketLng, cnt: 1 });
    }
  }

  const cells = Array.from(buckets.values()).sort((a, b) => b.cnt - a.cnt);
  return { cells, count: cells.length, size: cellDeg };
}

/* ── Search / browse ──────────────────────────────────────────────────── */

export async function searchSightings(params: SearchParams): Promise<{
  total: number;
  results: SightingRecord[];
}> {
  const sb = getAdminClient();
  const limit  = Math.min(params.limit  ?? 25, 200);
  const offset = params.offset ?? 0;

  let q = sb
    .from('ufosint_sightings')
    .select('*', { count: 'exact' });

  if (params.source)    q = q.eq('source', params.source);
  if (params.shape)     q = q.ilike('shape', params.shape);
  if (params.country)   q = q.ilike('country', params.country);
  if (params.state)     q = q.ilike('state', params.state);
  if (params.date_from) q = q.gte('date', params.date_from);
  if (params.date_to)   q = q.lte('date', params.date_to);
  if (params.quality_min != null) q = q.gte('quality_score', params.quality_min);
  if (params.q) {
    // Full-text like search on city + description
    q = q.or(
      `city.ilike.%${params.q}%,` +
      `description.ilike.%${params.q}%,` +
      `state.ilike.%${params.q}%,` +
      `country.ilike.%${params.q}%`
    );
  }

  const { data, count, error } = await q
    .order('date', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) throw error;

  return { total: count ?? 0, results: (data ?? []) as SightingRecord[] };
}
