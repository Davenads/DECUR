import type { NextApiRequest, NextApiResponse } from 'next';
import { createServerClient } from '@supabase/ssr';
import { serialize } from 'cookie';

/**
 * Server-side OAuth callback handler.
 *
 * Supabase redirects here after Google/GitHub OAuth with a PKCE code.
 * The browser includes the decur-auth-v1-code-verifier cookie automatically
 * (first-party request to the same origin), so the server can perform the
 * exchange reliably — avoiding the race conditions that affect client-side
 * PKCE exchange via @supabase/ssr's browser storage adapter.
 *
 * After exchange the session is committed as cookies and the user is
 * redirected to the intended destination.
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const code  = req.query.code  as string | undefined;
  const next  = (req.query.redirect as string) || '/profile';

  if (!code) {
    return res.redirect(302, '/auth/login');
  }

  type CookieToSet = { name: string; value: string; options?: Record<string, unknown> };
  const cookieStore: CookieToSet[] = [];

  // Use NEXT_PUBLIC_SUPABASE_URL directly (never the internal dev proxy) so
  // the PKCE exchange goes to the correct Supabase project.
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      // Must match the browser client's storageKey so cookie names are
      // consistent and the browser client can read the session after redirect.
      auth: { storageKey: 'decur-auth-v1' },
      cookies: {
        getAll() {
          // The code verifier cookie (decur-auth-v1-code-verifier) is included
          // here automatically — the browser sends all first-party cookies.
          return Object.entries(req.cookies).map(([name, value]) => ({
            name,
            value: value ?? '',
          }));
        },
        setAll(cookies: CookieToSet[]) {
          cookieStore.push(...cookies);
        },
      },
    }
  );

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    const dest = `/auth/login?error=${encodeURIComponent(error.message)}`;
    return res.redirect(302, dest);
  }

  // Commit all session cookies in a single Set-Cookie header array so that
  // none are overwritten (res.setHeader in a loop would overwrite each time).
  if (cookieStore.length > 0) {
    res.setHeader(
      'Set-Cookie',
      cookieStore.map(({ name, value, options = {} }) =>
        serialize(name, value, {
          path:     '/',
          sameSite: 'lax',
          httpOnly: false,
          maxAge:   400 * 24 * 60 * 60, // 400 days
          ...(options as Parameters<typeof serialize>[2]),
        })
      )
    );
  }

  return res.redirect(302, next);
}
