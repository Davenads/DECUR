import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServerClient } from '../../../../../lib/supabase/server';
import { supabaseAdmin } from '../../../../../lib/supabase/admin';
import { generateImplementationBrief } from '../../../../../lib/generateImplementationBrief';

/**
 * GET /api/admin/contributions/[id]/brief
 *
 * Returns the implementation brief for an approved contribution as a
 * downloadable Markdown file. Only accessible to moderators and admins.
 * Only available once the contribution status is 'approved'.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid contribution ID' });
  }

  // Auth: identify requesting user from session cookie
  const supabase = getSupabaseServerClient(req, res);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Role check: must be moderator or admin
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['moderator', 'admin'].includes(profile.role as string)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // Fetch the contribution with submitter and reviewer display names
  const { data: contribution, error: fetchError } = await supabaseAdmin
    .from('contributions')
    .select(`
      id, content_type, title, payload,
      submitter_note, reviewer_note,
      created_at, reviewed_at, status,
      profiles!contributions_user_id_fkey(display_name),
      reviewer:profiles!contributions_reviewed_by_fkey(display_name)
    `)
    .eq('id', id)
    .single();

  if (fetchError || !contribution) {
    return res.status(404).json({ error: 'Contribution not found' });
  }

  if (contribution.status !== 'approved') {
    return res.status(400).json({ error: 'Implementation brief is only available for approved contributions.' });
  }

  // Extract nested profile names safely
  const submitterProfile = Array.isArray(contribution.profiles)
    ? contribution.profiles[0]
    : contribution.profiles;
  const reviewerProfile = Array.isArray(contribution.reviewer)
    ? contribution.reviewer[0]
    : contribution.reviewer;

  const brief = generateImplementationBrief({
    id: contribution.id,
    content_type: contribution.content_type,
    title: contribution.title,
    payload: contribution.payload as Record<string, unknown>,
    submitter_note: contribution.submitter_note,
    reviewer_note: contribution.reviewer_note,
    created_at: contribution.created_at,
    reviewed_at: contribution.reviewed_at,
    submitter_display_name: (submitterProfile as { display_name: string | null } | null)?.display_name ?? null,
    reviewer_display_name: (reviewerProfile as { display_name: string | null } | null)?.display_name ?? null,
  });

  const filename = `decur-brief-${id.slice(0, 8)}.md`;

  res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Cache-Control', 'no-store');
  return res.status(200).send(brief);
}
