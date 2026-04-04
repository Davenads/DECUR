import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServerClient } from '../../../../lib/supabase/server';
import { supabaseAdmin } from '../../../../lib/supabase/admin';

const VALID_STATUSES = ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'needs_revision'];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  // Auth: identify requesting user
  const supabase = getSupabaseServerClient(req, res);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  // Role check: must be moderator or admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || !['moderator', 'admin'].includes(profile.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Parse query params
  const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10));
  const perPage = Math.min(50, Math.max(1, parseInt(String(req.query.per_page ?? '20'), 10)));
  const statusFilter = String(req.query.status ?? '').split(',').filter(s => VALID_STATUSES.includes(s));

  // Build query
  let query = supabaseAdmin
    .from('contributions')
    .select(`
      id, content_type, title, status, submitter_note,
      created_at, updated_at, reviewed_at,
      profiles!contributions_user_id_fkey(display_name, username),
      reviewer:profiles!contributions_reviewed_by_fkey(display_name)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range((page - 1) * perPage, page * perPage - 1);

  if (statusFilter.length > 0) {
    query = query.in('status', statusFilter);
  }

  const { data, count, error } = await query;
  if (error) {
    console.error('[admin/contributions] fetch error:', error);
    return res.status(500).json({ error: 'Failed to fetch contributions.' });
  }

  return res.status(200).json({
    contributions: data ?? [],
    total: count ?? 0,
    page,
    per_page: perPage,
    total_pages: Math.ceil((count ?? 0) / perPage),
  });
}
