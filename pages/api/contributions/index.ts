import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServerClient } from '../../../lib/supabase/server';
import { ContributionSubmitSchema } from '../../../lib/validation/contributions';
import { notifyContributionSubmitted } from '../../../lib/discord';

// Max pending/submitted contributions per user (abuse prevention)
const MAX_PENDING_PER_USER = 5;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getSupabaseServerClient(req, res);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: 'You must be signed in to submit a contribution.' });
  }

  // Require verified email
  if (!user.email_confirmed_at) {
    return res.status(403).json({ error: 'Please verify your email address before submitting contributions.' });
  }

  // Rate limit: max pending per user
  const { count: pendingCount } = await supabase
    .from('contributions')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .in('status', ['submitted', 'under_review'])
    .then(r => ({ count: r.count ?? 0 }));

  if (pendingCount >= MAX_PENDING_PER_USER) {
    return res.status(429).json({
      error: `You have ${pendingCount} pending contribution${pendingCount !== 1 ? 's' : ''} under review. Please wait for those to be processed before submitting more.`,
    });
  }

  // Validate request body
  const parsed = ContributionSubmitSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      issues: parsed.error.flatten().fieldErrors,
    });
  }

  const { content_type, title, payload } = parsed.data;

  // Insert contribution row + first audit event atomically
  const { data: contribution, error: insertError } = await supabase
    .from('contributions')
    .insert({
      user_id: user.id,
      content_type,
      title,
      payload,
      status: 'submitted',
      submitter_note: (payload as { submitter_note?: string }).submitter_note ?? null,
    })
    .select('id, content_type, title, status, created_at')
    .single();

  if (insertError) {
    console.error('[contributions] insert error:', insertError);
    return res.status(500).json({ error: 'Failed to save contribution. Please try again.' });
  }

  // Insert audit event (non-blocking — failure doesn't fail the request)
  await supabase.from('contribution_events').insert({
    contribution_id: contribution.id,
    actor_id: user.id,
    event_type: 'submitted',
    note: 'Contribution submitted by user.',
  });

  // Discord notification (non-blocking)
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://decur.org';
  notifyContributionSubmitted({
    id: contribution.id,
    contentType: content_type,
    title,
    submitterName: user.email ?? 'unknown',
    reviewUrl: `${siteUrl}/admin/contributions/${contribution.id}`,
  }).catch(err => console.warn('[discord] notify failed:', err));

  return res.status(201).json({ contribution });
}
