/**
 * /api/sightings/[...path]
 *
 * Thin proxy to the UFOSINT REST API and MCP server.
 * Falls back to pre-generated static JSON files when upstream is unavailable.
 *
 * Route examples:
 *   GET /api/sightings/stats         → https://ufosint.com/api/stats
 *   GET /api/sightings/timeline      → https://ufosint.com/api/timeline
 *   GET /api/sightings/map?...       → https://ufosint.com/api/map?...
 *   GET /api/sightings/hexbin?zoom=3 → https://ufosint.com/api/hexbin?zoom=3
 *   GET /api/sightings/count_by?...  → MCP JSON-RPC (no REST endpoint exists)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { readFileSync } from 'fs';
import { join } from 'path';

const UPSTREAM_BASE = 'https://ufosint.com/api';
const MCP_URL = 'https://ufosint-explorer.azurewebsites.net/mcp';
const CACHE_TTL = 300; // 5 minutes

/** Try to load a pre-generated static fallback file. Returns null if not found. */
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
        const z = Math.min(Math.max(zoom, 3), 5); // clamp 3-5
        return JSON.parse(readFileSync(join(base, `hexbins-z${z}.json`), 'utf-8'));
      }
      case 'count_by': {
        const field = String(query.field ?? '');
        if (field === 'shape') return JSON.parse(readFileSync(join(base, 'shape-counts.json'), 'utf-8'));
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

/** Call count_by via MCP JSON-RPC since no REST endpoint exists for it. */
async function callMcpCountBy(field: string, limit = 30): Promise<unknown> {
  const res = await fetch(MCP_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'User-Agent': 'DECUR/1.0 (decur.org)',
    },
    body: JSON.stringify({
      jsonrpc: '2.0',
      id: 1,
      method: 'tools/call',
      params: { name: 'count_by', arguments: { field, limit } },
    }),
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`MCP HTTP ${res.status}`);
  const envelope = await res.json() as { result?: { content?: Array<{ text: string }> }; error?: { message: string } };
  if (envelope.error) throw new Error(envelope.error.message);
  const text = envelope.result?.content?.[0]?.text;
  if (!text) throw new Error('Empty MCP response');
  return JSON.parse(text);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  // Reconstruct the API path segment from the catch-all
  const pathSegments = Array.isArray(req.query.path) ? req.query.path : [req.query.path ?? ''];
  const apiPath = pathSegments.join('/');

  // Forward all query params except 'path' (the catch-all itself)
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
      // count_by has no REST endpoint - use MCP JSON-RPC
      const field = String(req.query.field ?? 'shape');
      const limit = parseInt(String(req.query.limit ?? '30'), 10);
      data = await callMcpCountBy(field, limit);
    } else {
      // Standard REST proxy
      const upstreamUrl = `${UPSTREAM_BASE}/${apiPath}${queryString ? `?${queryString}` : ''}`;
      const upstream = await fetch(upstreamUrl, {
        headers: { 'User-Agent': 'DECUR/1.0 (decur.org)' },
        signal: AbortSignal.timeout(8000),
      });
      if (!upstream.ok) throw new Error(`Upstream ${upstream.status}`);
      data = await upstream.json();
    }

    res.setHeader('Cache-Control', `s-maxage=${CACHE_TTL}, stale-while-revalidate=60`);
    res.status(200).json(data);
  } catch {
    // Upstream failed - serve static fallback
    const fallback = loadStaticFallback(apiPath, req.query);
    if (fallback) {
      res.setHeader('X-Data-Source', 'static-fallback');
      res.setHeader('Cache-Control', 'no-cache');
      res.status(200).json(fallback);
    } else {
      res.status(503).json({ error: 'Upstream unavailable and no fallback available' });
    }
  }
}
