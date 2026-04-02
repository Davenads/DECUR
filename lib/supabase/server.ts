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
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
