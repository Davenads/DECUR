/**
 * /api/sightings/[...path]
 *
 * Phase 3: Queries own Supabase table when UFOSINT_USE_SUPABASE=true.
 * Falls back to UFOSINT REST API proxy → static JSON files.
 *
 * Route examples:
 *   GET /api/sightings/stats         → Supabase ufosint_sightings / UFOSINT API
 *   GET /api/sightings/hexbin?zoom=3 → Supabase (live) / static hexbins-z*.json
 *   GET /api/sightings/count_by?field=shape  → Supabase view / static
 *   GET /api/sightings/count_by?field=country
 *   GET /api/sightings/search?q=...&limit=25 → Supabase (Phase 3 only)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';

const UPSTREAM_BASE = 'https://ufosint.com/api';
const MCP_URL       = 'https://ufosint-explorer.azurewebsites.net/mcp';
const CACHE_TTL     = 300; // 5 minutes (CDN s-maxage)

const USE_SUPABASE  = process.env.UFOSINT_USE_SUPABASE === 'true';

/* ── In-process TTL cache ─────────────────────────────────────────────── */
// Prevents cold-start stampedes in dev (no CDN) and multiple simultaneous
// requests from all hitting upstream at once.

interface CacheEntry { data: unknown; expiresAt: number }
const memCache = new Map<string, CacheEntry>();
const MEM_TTL_MS = CACHE_TTL * 1000;

function cacheGet(key: string): unknown | null {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) { memCache.delete(key); return null; }
  return entry.data;
}

function cacheSet(key: string, data: unknown): void {
  // Evict stale entries if cache grows large
  if (memCache.size > 50) {
    const now = Date.now();
    memCache.forEach((v, k) => { if (now > v.expiresAt) memCache.delete(k); });
  }
  memCache.set(key, { data, expiresAt: Date.now() + MEM_TTL_MS });
}

function cacheKey(apiPath: string, query: NextApiRequest['query']): string {
  const q = Object.entries(query)
    .filter(([k]) => k !== 'path')
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  return `${apiPath}?${q}`;
}

/* ── Static fallback ───────────────────────────────────────────────────── */

function loadStaticFallback(apiPath: string, query: NextApiRequest['query']): unknown | null {
  try {
    const base = join(process.cwd(), 'data', 'ufosint');
    switch (apiPath) {
      case 'stats':
        return JSON.parse(readFileSync(join(base, 'stats.json'), 'utf-8'));
      case 'timeline':
        return { data: JSON.parse(readFileSync(join(base, 'yearly-counts.json'), 'utf-8')) };
      case 'hexbin': {
        const zoom = parseInt(String(query.zoom ?? '3'), 10);
        const z = Math.min(Math.max(zoom, 3), 5);
        return JSON.parse(readFileSync(join(base, `hexbins-z${z}.json`), 'utf-8'));
      }
      case 'count_by': {
        const field = String(query.field ?? '');
        if (field === 'shape')   return JSON.parse(readFileSync(join(base, 'shape-counts.json'), 'utf-8'));
        if (field === 'country') return JSON.parse(readFileSync(join(base, 'top-countries.json'), 'utf-8'));
        return null;
      }
      default:
        return null;
    }
  } catch {
    return null;
  }
}

/* ── MCP proxy (legacy) ───────────────────────────────────────────────── */

async function callMcpCountBy(field: string, limit = 30): Promise<unknown> {
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'DECUR/1.0 (decur.org)',
    },
    body: JSON.stringify({
      jsonrpc: '2.0', id: 1,
      method: 'tools/call',
      params: { name: 'count_by', arguments: { field, limit } },
    }),
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`MCP HTTP ${res.status}`);
  const envelope = await res.json() as {
    result?: { content?: Array<{ text: string }> };
    error?: { message: string };
  };
  if (envelope.error) throw new Error(envelope.error.message);
  const text = envelope.result?.content?.[0]?.text;
  if (!text) throw new Error('Empty MCP response');
  return JSON.parse(text);
}

/* ── Supabase handlers ────────────────────────────────────────────────── */

async function handleSupabase(
  apiPath: string,
  query: NextApiRequest['query'],
  res: NextApiResponse
): Promise<boolean> {
  // Dynamically import to avoid loading Supabase when flag is off
  const {
    getSightingStats, countByShape, countByCountry,
    searchSightings, getViewportSightings,
  } = await import('../../../lib/supabase/sightings');

  switch (apiPath) {
    case 'stats': {
      const data = await getSightingStats();
      res.setHeader('X-Data-Source', 'supabase');
      res.setHeader('Cache-Control', `s-maxage=${CACHE_TTL}, stale-while-revalidate=60`);
      res.status(200).json(data);
      return true;
    }
    case 'hexbin': {
      // Hexbin is pre-generated static data — too expensive to recompute live
      // from 396k rows on every request. Fall through to static file.
      return false;
    }
    case 'count_by': {
      const field = String(query.field ?? 'shape');
      const limit = parseInt(String(query.limit ?? '30'), 10);
      let data: unknown;
      if (field === 'shape')   data = await countByShape(limit);
      else if (field === 'country') data = await countByCountry(limit);
      else return false; // unsupported field - fall through
      res.setHeader('X-Data-Source', 'supabase');
      res.setHeader('Cache-Control', `s-maxage=${CACHE_TTL}, stale-while-revalidate=60`);
      res.status(200).json(data);
      return true;
    }
    case 'viewport': {
      const n = parseFloat(String(query.n ?? '90'));
      const s = parseFloat(String(query.s ?? '-90'));
      const e = parseFloat(String(query.e ?? '180'));
      const w = parseFloat(String(query.w ?? '-180'));
      const limit = parseInt(String(query.limit ?? '300'), 10);

      // Check in-process cache before hitting Supabase.
      // handleSupabase writes directly to res, bypassing the outer memCache write,
      // so we handle viewport caching here explicitly.
      const vpCacheKey = `viewport?n=${n.toFixed(2)}&s=${s.toFixed(2)}&e=${e.toFixed(2)}&w=${w.toFixed(2)}&limit=${limit}`;
      const cached = cacheGet(vpCacheKey);
      if (cached) {
        res.setHeader('X-Data-Source', 'mem-cache');
        res.setHeader('Cache-Control', 'no-cache');
        res.status(200).json(cached);
        return true;
      }

      const data = await getViewportSightings({ n, s, e, w, limit });
      const payload = { sightings: data };

      // Cache in-process: global views for 5 min, zoomed-in views for 1 min.
      const isGlobalView = n > 75 && s < -60 && e > 150 && w < -150;
      const vpTtl = isGlobalView ? 300_000 : 60_000;
      memCache.set(vpCacheKey, { data: payload, expiresAt: Date.now() + vpTtl });

      res.setHeader('X-Data-Source', 'supabase');
      res.setHeader(
        'Cache-Control',
        isGlobalView
          ? 's-maxage=1800, stale-while-revalidate=300'
          : 'no-cache'
      );
      res.status(200).json(payload);
      return true;
    }
    case 'search': {
      const results = await searchSightings({
        q:           String(query.q ?? ''),
        source:      query.source ? String(query.source) : undefined,
        shape:       query.shape  ? String(query.shape)  : undefined,
        country:     query.country ? String(query.country) : undefined,
        state:       query.state  ? String(query.state)  : undefined,
        date_from:   query.date_from  ? String(query.date_from)  : undefined,
        date_to:     query.date_to    ? String(query.date_to)    : undefined,
        quality_min: query.quality ? parseInt(String(query.quality), 10) : undefined,
        limit:       query.limit  ? parseInt(String(query.limit),  10) : 25,
        offset:      query.offset ? parseInt(String(query.offset), 10) : 0,
      });
      res.setHeader('X-Data-Source', 'supabase');
      res.setHeader('Cache-Control', 'no-cache');
      res.status(200).json(results);
      return true;
    }
    default:
      return false;
  }
}

/* ── Main handler ─────────────────────────────────────────────────────── */

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const pathSegments = Array.isArray(req.query.path) ? req.query.path : [req.query.path ?? ''];
  const apiPath = pathSegments.join('/');

  // Search results are always dynamic — skip cache entirely
  const isCacheable = apiPath !== 'search';
  const ck = isCacheable ? cacheKey(apiPath, req.query) : '';

  // ── In-process cache hit ───────────────────────────────────────────────
  if (isCacheable) {
    const cached = cacheGet(ck);
    if (cached) {
      res.setHeader('X-Data-Source', 'mem-cache');
      res.setHeader('Cache-Control', `s-maxage=${CACHE_TTL}, stale-while-revalidate=60`);
      res.status(200).json(cached);
      return;
    }
  }

  // ── Phase 3: Supabase-first mode ──────────────────────────────────────
  if (USE_SUPABASE) {
    try {
      const handled = await handleSupabase(apiPath, req.query, res);
      if (handled) return;
    } catch (err) {
      console.error('[sightings] Supabase error, falling back:', err);
      // Fall through to UFOSINT proxy
    }
  }

  // ── Phase 2: UFOSINT proxy ─────────────────────────────────────────────
  const forwardParams = new URLSearchParams();
  for (const [key, val] of Object.entries(req.query)) {
    if (key === 'path') continue;
    if (Array.isArray(val)) val.forEach(v => forwardParams.append(key, v));
    else if (val !== undefined) forwardParams.set(key, val);
  }
  const queryString = forwardParams.toString();

  try {
    let data: unknown;

    if (apiPath === 'count_by') {
      const field = String(req.query.field ?? 'shape');
      const limit = parseInt(String(req.query.limit ?? '30'), 10);
      data = await callMcpCountBy(field, limit);
    } else {
      const upstreamUrl = `${UPSTREAM_BASE}/${apiPath}${queryString ? `?${queryString}` : ''}`;
      const upstream = await fetch(upstreamUrl, {
        headers: { 'User-Agent': 'DECUR/1.0 (decur.org)' },
        signal: AbortSignal.timeout(8_000),
      });
      if (!upstream.ok) throw new Error(`Upstream ${upstream.status}`);
      data = await upstream.json();
    }

    if (isCacheable) cacheSet(ck, data);
    res.setHeader('Cache-Control', `s-maxage=${CACHE_TTL}, stale-while-revalidate=60`);
    res.status(200).json(data);
  } catch {
    const fallback = loadStaticFallback(apiPath, req.query);
    if (fallback) {
      if (isCacheable) cacheSet(ck, fallback); // cache fallbacks too
      res.setHeader('X-Data-Source', 'static-fallback');
      res.setHeader('Cache-Control', 'no-cache');
      res.status(200).json(fallback);
    } else {
      res.status(503).json({ error: 'Upstream unavailable and no fallback available' });
    }
  }
}
