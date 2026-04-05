import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServerClient } from '../../../../../lib/supabase/server';
import { supabaseAdmin } from '../../../../../lib/supabase/admin';
import { revalidateContentPaths } from '../../../../../lib/revalidate';
import { notifyContributionReviewed } from '../../../../../lib/discord';
import { sendEmail } from '../../../../../lib/email';

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
    .select('id, content_type, title, status, user_id')
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

  // Submitter notification email on all terminal review actions (non-blocking)
  if (typedAction === 'approve' || typedAction === 'reject' || typedAction === 'needs_revision') {
    const submitterResult = await supabaseAdmin.auth.admin.getUserById(contribution.user_id);
    const submitterEmail = submitterResult.data.user?.email;

    if (submitterEmail) {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
      const profileUrl = `${siteUrl}/profile`;
      const titleLabel = contribution.title ?? `${contribution.content_type.replace(/_/g, ' ')} contribution`;

      const subjectMap: Record<typeof typedAction, string> = {
        approve: `Your contribution has been approved - ${titleLabel}`,
        reject: `Your contribution was not accepted - ${titleLabel}`,
        needs_revision: `Your contribution needs revision - ${titleLabel}`,
      };

      const bodyMap: Record<typeof typedAction, { text: string; html: string }> = {
        approve: {
          text: [
            `Hi,`,
            ``,
            `Your contribution to DECUR has been reviewed and approved.`,
            ``,
            `Contribution: ${titleLabel}`,
            ``,
            `Thank you for helping build the platform. Your submission will be integrated into the database.`,
            ``,
            `View your submissions: ${profileUrl}`,
          ].join('\n'),
          html: `
            <p>Hi,</p>
            <p>Your contribution to DECUR has been <strong>approved</strong>.</p>
            <p style="margin:12px 0;padding:12px;background:#f0fdf4;border-left:3px solid #22c55e;border-radius:4px">
              <strong>${titleLabel}</strong>
            </p>
            <p>Thank you for helping build the platform. Your submission will be integrated into the database.</p>
            <p><a href="${profileUrl}" style="color:#4f46e5">View your submissions</a></p>
          `,
        },
        reject: {
          text: [
            `Hi,`,
            ``,
            `Your contribution to DECUR was reviewed but was not accepted at this time.`,
            ``,
            `Contribution: ${titleLabel}`,
            reviewer_note?.trim() ? `\nReviewer note: ${reviewer_note.trim()}` : '',
            ``,
            `You're welcome to submit again with updated information.`,
            ``,
            `View your submissions: ${profileUrl}`,
          ].join('\n'),
          html: `
            <p>Hi,</p>
            <p>Your contribution to DECUR was reviewed but was <strong>not accepted</strong> at this time.</p>
            <p style="margin:12px 0;padding:12px;background:#fef2f2;border-left:3px solid #ef4444;border-radius:4px">
              <strong>${titleLabel}</strong>
            </p>
            ${reviewer_note?.trim() ? `<p><strong>Reviewer note:</strong> ${reviewer_note.trim()}</p>` : ''}
            <p>You're welcome to submit again with updated information.</p>
            <p><a href="${profileUrl}" style="color:#4f46e5">View your submissions</a></p>
          `,
        },
        needs_revision: {
          text: [
            `Hi,`,
            ``,
            `Your contribution to DECUR has been reviewed and requires some changes before it can be accepted.`,
            ``,
            `Contribution: ${titleLabel}`,
            reviewer_note?.trim() ? `\nRequested changes: ${reviewer_note.trim()}` : '',
            ``,
            `Please review the feedback and resubmit when ready.`,
            ``,
            `View your submissions: ${profileUrl}`,
          ].join('\n'),
          html: `
            <p>Hi,</p>
            <p>Your contribution to DECUR requires <strong>revision</strong> before it can be accepted.</p>
            <p style="margin:12px 0;padding:12px;background:#fffbeb;border-left:3px solid #f59e0b;border-radius:4px">
              <strong>${titleLabel}</strong>
            </p>
            ${reviewer_note?.trim() ? `<p><strong>Requested changes:</strong> ${reviewer_note.trim()}</p>` : ''}
            <p>Please review the feedback and resubmit when ready.</p>
            <p><a href="${profileUrl}" style="color:#4f46e5">View your submissions</a></p>
          `,
        },
      };

      sendEmail({
        to: submitterEmail,
        subject: subjectMap[typedAction],
        text: bodyMap[typedAction].text,
        html: bodyMap[typedAction].html,
      }).catch(err => console.warn('[review] submitter notification email failed:', err));
    }
  }

  // Dev admin implementation brief — sent separately to the dev/admin email on approve
  if (typedAction === 'approve') {
    const devEmail = process.env.DECUR_DEV_EMAIL ?? 'decur-dave@proton.me';
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
    const briefUrl = `${siteUrl}/admin/contributions/${id}`;
    const typeLabel = contribution.content_type.replace(/_/g, ' ');

    sendEmail({
      to: devEmail,
      subject: `[DECUR] Approved contribution ready for implementation: ${contribution.content_type}`,
      text: [
        `A community contribution has been approved and is ready for implementation.`,
        ``,
        `Type: ${typeLabel}`,
        `Title: ${contribution.title ?? id}`,
        ``,
        `Open the admin panel to download the implementation brief:`,
        briefUrl,
      ].join('\n'),
      html: `
        <p>A community contribution has been approved and is ready for implementation.</p>
        <table style="border-collapse:collapse;margin:12px 0">
          <tr><td style="padding:2px 12px 2px 0;color:#6b7280;font-size:13px">Type</td><td style="font-size:13px">${typeLabel}</td></tr>
          <tr><td style="padding:2px 12px 2px 0;color:#6b7280;font-size:13px">Title</td><td style="font-size:13px">${contribution.title ?? id}</td></tr>
        </table>
        <p style="margin:16px 0">
          <a href="${briefUrl}" style="display:inline-block;padding:8px 16px;background:#4f46e5;color:#fff;text-decoration:none;border-radius:6px;font-size:13px;font-weight:500">
            Open in Admin Panel
          </a>
        </p>
      `,
    }).catch(err => console.warn('[review] admin brief email failed:', err));
  }

  return res.status(200).json({ ok: true, status: newStatus });
}
