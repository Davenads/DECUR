import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

/**
 * POST /api/auth/update-password
 * Body: { password: string }
 *
 * Updates the authenticated user's password server-side using the session
 * from the browser client's cookies. This bypasses the browser client's
 * in-memory session entirely — the server reads decur-auth-v1.* cookies
 * directly from the HTTP request, which the browser client writes to
 * document.cookie after the PKCE recovery code exchange.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { password } = req.body as { password?: string };
  if (!password || typeof password !== 'string') {
    return res.status(400).json({ error: 'password is required' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  }

  const supabase = getSupabaseServerClient(req, res);

  // Validate the session via the cookies in the request
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return res.status(401).json({ error: 'Auth session missing or expired. Please request a new reset link.' });
  }

  // Update the password using the authenticated session
  const { error: updateError } = await supabase.auth.updateUser({ password });
  if (updateError) {
    return res.status(400).json({ error: updateError.message });
  }

  return res.status(200).json({ ok: true });
}
