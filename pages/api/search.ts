/**
 * /api/search
 *
 * Server-side full-text search over the `search_index` Supabase table.
 * Replaces the client-side Fuse.js corpus approach in pages/search.tsx.
 *
 * GET /api/search?q=grusch&type=insider&figureType=official&limit=50
 *
 * Query params:
 *   q             — search query (required, min 1 char)
 *   type          — filter to one type: insider|case|document|timeline|glossary|program|contractor|resource
 *   figureType    — meta filter for insiders: insider|pilot|scientist|official|journalist|executive
 *   tier          — meta filter for cases: tier-1|tier-2|tier-3
 *   docType       — meta filter for documents: government-report|...
 *   programStatus — meta filter for programs: active|classified|defunct|unknown
 *   limit         — max results (default 100, max 300)
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

function getClient() {
  const url =
    process.env.UFOSINT_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.UFOSINT_SERVICE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export interface SearchResult {
  id: string;
  type: string;
  title: string;
  subtitle: string | null;
  description: string;
  href: string;
  badge: string | null;
  aliases: string[];
  meta: Record<string, string | null> | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const {
    q,
    type,
    figureType,
    tier,
    docType,
    programStatus,
    limit: limitStr,
  } = req.query as Record<string, string>;

  if (!q || q.trim().length === 0) {
    return res.status(400).json({ error: 'Missing query parameter: q' });
  }

  const limitRaw = parseInt(limitStr ?? '100', 10);
  const limit = isNaN(limitRaw) ? 100 : Math.min(limitRaw, 300);
  const query = q.trim();

  const sb = getClient();

  try {
    // Build the query
    // For 2+ character queries: use FTS with websearch syntax + ranking
    // For 1-char queries: prefix ilike fallback (FTS minimum token length is 2)
    const useFts = query.length >= 2;

    let dbQuery = sb
      .from('search_index')
      .select('id, type, title, subtitle, description, href, badge, aliases, meta')
      .limit(limit);

    if (useFts) {
      // websearch_to_tsquery supports: phrases, AND/OR, negation (-)
      // We pass the raw query via textSearch which generates the proper SQL.
      dbQuery = dbQuery.textSearch('search_vec', query, {
        type: 'websearch',
        config: 'english',
      });
    } else {
      // Single-char: ilike prefix match on title only
      dbQuery = dbQuery.ilike('title', `${query}%`);
    }

    // Type filter
    if (type && typeof type === 'string') {
      dbQuery = dbQuery.eq('type', type);
    }

    // Meta filters (all stored as JSONB keys in the `meta` column)
    if (figureType) {
      dbQuery = dbQuery.eq('meta->>figureType', figureType);
    }
    if (tier) {
      dbQuery = dbQuery.eq('meta->>tier', tier);
    }
    if (docType) {
      dbQuery = dbQuery.eq('meta->>docType', docType);
    }
    if (programStatus) {
      dbQuery = dbQuery.eq('meta->>programStatus', programStatus);
    }

    const { data, error } = await dbQuery;

    if (error) {
      console.error('[/api/search] Supabase error:', error);
      return res.status(500).json({ error: 'Search query failed', detail: error.message });
    }

    // Cache for 60 seconds (search results are not real-time critical)
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    return res.status(200).json({ results: data ?? [], query, total: (data ?? []).length });
  } catch (err) {
    console.error('[/api/search] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
