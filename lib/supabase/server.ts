import { createServerClient } from '@supabase/ssr';
import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * Request-scoped Supabase client for use in:
 * - API routes (pages/api/*)
 * - getServerSideProps
 *
 * Uses cookie-based session management compatible with @supabase/ssr.
 */
export function getSupabaseServerClient(req: NextApiRequest, res: NextApiResponse) {
  // Server-side: use SUPABASE_INTERNAL_URL (direct to 127.0.0.1:54321) so API
  // routes bypass the browser proxy rewrite entirely. Fixed storageKey ensures
  // the cookie name always matches what the browser client writes.
  const supabaseUrl =
    process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;

  return createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { storageKey: 'decur-auth-v1' },
      cookies: {
        getAll() {
          return Object.entries(req.cookies).map(([name, value]) => ({
            name,
            value: value ?? '',
          }));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            const opts = options ?? {};
            const cookieParts = [
              `${name}=${value}`,
              'Path=/',
              'HttpOnly',
              'SameSite=Lax',
              opts.maxAge ? `Max-Age=${opts.maxAge}` : '',
              opts.secure ? 'Secure' : '',
            ].filter(Boolean);
            res.setHeader('Set-Cookie', cookieParts.join('; '));
          });
        },
      },
    }
  );
}
