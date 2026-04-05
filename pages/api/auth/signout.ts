import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

/**
 * POST /api/auth/signout
 *
 * Signs the user out server-side using the internal Supabase URL (no proxy).
 * This avoids the browser → /supabase-proxy hop failing on remote devices
 * (e.g. Tailscale), where a client-side signOut() network call can silently
 * fail and leave the session cookie intact.
 *
 * The server client's setAll() clears the auth cookies on the response,
 * so the browser drops them on the redirect regardless of network conditions.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const supabase = getSupabaseServerClient(req, res);

  // Sign out server-side — this invalidates the token at Supabase and
  // triggers setAll() to write expired/empty Set-Cookie headers on the response.
  await supabase.auth.signOut();

  return res.status(200).json({ ok: true });
}
