import type { NextApiRequest, NextApiResponse } from 'next';
import { Resend } from 'resend';
import { getSupabaseServerClient } from '../../../../../lib/supabase/server';
import { supabaseAdmin } from '../../../../../lib/supabase/admin';
import { revalidateContentPaths } from '../../../../../lib/revalidate';
import { notifyContributionReviewed } from '../../../../../lib/discord';

const resend = new Resend(process.env.RESEND_API_KEY);

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
    .select('id, content_type, title, status')
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

  // Discord notification on terminal review actions (non-blocking)
  if (typedAction === 'approve' || typedAction === 'reject' || typedAction === 'needs_revision') {
    notifyContributionReviewed(
      contribution.title ?? id,
      typedAction === 'approve' ? 'approved' : typedAction === 'reject' ? 'rejected' : 'needs_revision',
      reviewer_note?.trim()
    ).catch(err => console.warn('[discord] review notify failed:', err));
  }

  // Approval notification email — lightweight, link only (non-blocking)
  if (typedAction === 'approve') {
    const devEmail = process.env.DECUR_DEV_EMAIL ?? 'decur-dave@proton.me';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const briefUrl = `${siteUrl}/admin/contributions/${id}`;
    const typeLabel = contribution.content_type.replace(/_/g, ' ');

    resend.emails.send({
      from: 'DECUR Admin <noreply@decur.org>',
      to: [devEmail],
      subject: `[DECUR] Approved contribution ready for implementation: ${contribution.content_type}`,
      text: [
        `A community contribution has been approved and is ready for implementation.`,
        ``,
        `Type: ${typeLabel}`,
        `Contribution ID: ${id}`,
        ``,
        `Open the admin panel to download the implementation brief:`,
        briefUrl,
        ``,
        `The brief includes the submitted data, a pre-filled JSON schema skeleton,`,
        `and a research checklist. Paste it into Claude to implement the data point.`,
      ].join('\n'),
      html: `
        <p>A community contribution has been approved and is ready for implementation.</p>
        <table style="border-collapse:collapse;margin:12px 0">
          <tr><td style="padding:2px 12px 2px 0;color:#6b7280;font-size:13px">Type</td><td style="font-size:13px">${typeLabel}</td></tr>
          <tr><td style="padding:2px 12px 2px 0;color:#6b7280;font-size:13px">Contribution ID</td><td style="font-family:monospace;font-size:12px">${id}</td></tr>
        </table>
        <p style="margin:16px 0">
          <a href="${briefUrl}" style="display:inline-block;padding:8px 16px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:500">
            Open in Admin Panel
          </a>
        </p>
        <p style="color:#6b7280;font-size:12px">
          Download the implementation brief from the admin panel. Paste it into Claude to implement the data point.
        </p>
      `,
    }).catch(err => console.warn('[review] approval email failed:', err));
  }

  return res.status(200).json({ ok: true, status: newStatus });
}
