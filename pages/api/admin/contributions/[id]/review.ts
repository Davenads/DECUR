import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServerClient } from '../../../../../lib/supabase/server';
import { supabaseAdmin } from '../../../../../lib/supabase/admin';
import { revalidateContentPaths } from '../../../../../lib/revalidate';

const VALID_ACTIONS = ['approve', 'reject', 'needs_revision', 'review_started'] as const;
type Action = typeof VALID_ACTIONS[number];

const ACTION_TO_STATUS: Record<Action, string> = {
  approve: 'approved',
  reject: 'rejected',
  needs_revision: 'needs_revision',
  review_started: 'under_review',
};

const ACTION_TO_EVENT: Record<Action, string> = {
  approve: 'approved',
  reject: 'rejected',
  needs_revision: 'revision_requested',
  review_started: 'review_started',
};

type RevalidatableContentType = Parameters<typeof revalidateContentPaths>[0];

const REVALIDATABLE_TYPES: ReadonlyArray<RevalidatableContentType> = [
  'figure', 'case', 'document', 'program', 'timeline_event',
];

function isRevalidatable(t: string): t is RevalidatableContentType {
  return REVALIDATABLE_TYPES.includes(t as RevalidatableContentType);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { id } = req.query;
  if (typeof id !== 'string') return res.status(400).json({ error: 'Invalid contribution ID' });

  // Auth
  const supabase = getSupabaseServerClient(req, res);
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return res.status(401).json({ error: 'Unauthorized' });

  // Role check
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
  if (!profile || !['moderator', 'admin'].includes(profile.role)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { action, reviewer_note } = req.body as { action?: string; reviewer_note?: string };
  if (!action || !VALID_ACTIONS.includes(action as Action)) {
    return res.status(400).json({ error: `action must be one of: ${VALID_ACTIONS.join(', ')}` });
  }
  if ((action === 'reject' || action === 'needs_revision') && !reviewer_note?.trim()) {
    return res.status(400).json({ error: 'reviewer_note is required when rejecting or requesting revision.' });
  }

  const typedAction = action as Action;
  const newStatus = ACTION_TO_STATUS[typedAction];

  // Fetch the contribution to get content_type for revalidation
  const { data: contribution, error: fetchError } = await supabaseAdmin
    .from('contributions')
    .select('id, content_type, status')
    .eq('id', id)
    .single();
  if (fetchError || !contribution) return res.status(404).json({ error: 'Contribution not found.' });

  // Update contribution
  const updatePayload: Record<string, unknown> = {
    status: newStatus,
    reviewed_by: user.id,
    reviewed_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  if (reviewer_note?.trim()) updatePayload.reviewer_note = reviewer_note.trim();

  const { error: updateError } = await supabaseAdmin
    .from('contributions')
    .update(updatePayload)
    .eq('id', id);
  if (updateError) {
    console.error('[review] update error:', updateError);
    return res.status(500).json({ error: 'Failed to update contribution.' });
  }

  // Insert audit event
  await supabaseAdmin.from('contribution_events').insert({
    contribution_id: id,
    actor_id: user.id,
    event_type: ACTION_TO_EVENT[typedAction],
    note: reviewer_note?.trim() ?? null,
  });

  // ISR revalidation on approve
  if (typedAction === 'approve' && isRevalidatable(contribution.content_type)) {
    revalidateContentPaths(contribution.content_type)
      .then(async () => {
        await supabaseAdmin.from('contributions').update({ revalidated: true }).eq('id', id);
      })
      .catch(err => console.warn('[revalidate] failed:', err));
  }

  return res.status(200).json({ ok: true, status: newStatus });
}
