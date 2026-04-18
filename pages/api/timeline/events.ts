/**
 * /api/timeline/events
 *
 * Server-side timeline filtering and pagination backed by Supabase.
 * Replaces client-side Array.filter() over the 1 MB timeline.json payload.
 *
 * GET /api/timeline/events?yearMin=1947&yearMax=1970&categories=sightings,news&q=radar&page=1&limit=50
 *
 * Query params:
 *   yearMin    — start year inclusive (default: 1561)
 *   yearMax    — end year inclusive   (default: current year)
 *   categories — comma-separated list of category slugs to include
 *                (omit for all categories)
 *   q          — full-text search query (optional)
 *   page       — page number, 1-based (default: 1)
 *   limit      — results per page (default: 50, max: 200)
 *
 * Response:
 *   { entries: TimelineEntry[], total: number, page: number, pages: number }
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

export interface TimelineEntry {
  id: number;
  date: string;
  year: number;
  title: string;
  excerpt: string;
  categories: string[];
  source_url: string;
  article_url?: string | null;
}

interface SuccessResponse {
  entries: TimelineEntry[];
  total: number;
  page: number;
  pages: number;
}

interface ErrorResponse {
  error: string;
  detail?: string;
}

function getClient() {
  const url =
    process.env.UFOSINT_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.UFOSINT_SERVICE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponse | ErrorResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const currentYear = new Date().getFullYear();
  const {
    yearMin: yearMinStr,
    yearMax: yearMaxStr,
    categories: categoriesStr,
    q,
    page: pageStr,
    limit: limitStr,
  } = req.query as Record<string, string>;

  // Parse params with defaults
  const yearMin  = parseInt(yearMinStr ?? '1561', 10);
  const yearMax  = parseInt(yearMaxStr ?? String(currentYear), 10);
  const page     = Math.max(1, parseInt(pageStr ?? '1', 10));
  const limitRaw = parseInt(limitStr ?? '50', 10);
  const limit    = isNaN(limitRaw) ? 50 : Math.min(Math.max(1, limitRaw), 200);
  const offset   = (page - 1) * limit;

  // categories: split comma-separated string into array; null means "all"
  const categories: string[] | null = categoriesStr
    ? categoriesStr.split(',').map(c => c.trim()).filter(Boolean)
    : null;

  const sb = getClient();

  try {
    // First: get total count matching the filters
    let countQuery = sb
      .from('timeline_events')
      .select('*', { count: 'exact', head: true })
      .gte('year', isNaN(yearMin) ? 1561 : yearMin)
      .lte('year', isNaN(yearMax) ? currentYear : yearMax);

    if (categories && categories.length > 0) {
      countQuery = countQuery.overlaps('categories', categories);
    }

    if (q && q.trim().length >= 2) {
      countQuery = countQuery.textSearch('search_vec', q.trim(), {
        type: 'websearch',
        config: 'english',
      });
    }

    const { count: total, error: countError } = await countQuery;
    if (countError) {
      console.error('[/api/timeline/events] count error:', countError);
      return res.status(500).json({ error: 'Query failed', detail: countError.message });
    }

    // Second: fetch the page of results
    let dataQuery = sb
      .from('timeline_events')
      .select('id, date, year, title, excerpt, categories, source_url, article_url')
      .gte('year', isNaN(yearMin) ? 1561 : yearMin)
      .lte('year', isNaN(yearMax) ? currentYear : yearMax)
      .order('year', { ascending: false })
      .order('date', { ascending: false })
      .range(offset, offset + limit - 1);

    if (categories && categories.length > 0) {
      dataQuery = dataQuery.overlaps('categories', categories);
    }

    if (q && q.trim().length >= 2) {
      dataQuery = dataQuery.textSearch('search_vec', q.trim(), {
        type: 'websearch',
        config: 'english',
      });
    }

    const { data, error: dataError } = await dataQuery;
    if (dataError) {
      console.error('[/api/timeline/events] data error:', dataError);
      return res.status(500).json({ error: 'Query failed', detail: dataError.message });
    }

    const totalCount = total ?? 0;
    const pages = Math.ceil(totalCount / limit);

    // Cache for 5 minutes — timeline data changes rarely
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    return res.status(200).json({
      entries: (data ?? []) as TimelineEntry[],
      total: totalCount,
      page,
      pages,
    });
  } catch (err) {
    console.error('[/api/timeline/events] unexpected error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
