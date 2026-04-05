import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Proxy (Next.js 16 equivalent of middleware): session refresh + route protection.
 *
 * - Refreshes Supabase auth tokens on every request (required for SSR auth).
 * - Guards /profile/*, /contribute/submit, and /admin/* — redirects to login
 *   with a `redirect` param so the user is returned after signing in.
 */

const PROTECTED_PREFIXES = ['/profile', '/contribute/submit', '/admin'];

export async function proxy(req: NextRequest) {
  let res = NextResponse.next({ request: req });

  // Use SUPABASE_INTERNAL_URL so middleware bypasses the browser proxy and hits
  // Supabase directly. Fixed storageKey must match browser.ts so the cookie
  // the browser writes is the same cookie the middleware reads.
  const supabaseUrl =
    process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const supabase = createServerClient(
    supabaseUrl,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: { storageKey: 'decur-auth-v1' },
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            req.cookies.set(name, value)
          );
          res = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) =>
            res.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — required to keep Supabase auth tokens from expiring
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = req.nextUrl;

  // Route guard: redirect unauthenticated users to login
  const isProtected = PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
  if (isProtected && !user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Admin guard: reject non-admins attempting /admin/*
  // Role check handled server-side in admin pages via service role client.
  // Middleware only ensures the user is authenticated at minimum.

  return res;
}

export const config = {
  matcher: [
    /*
     * Run on all paths except:
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico
     * - public assets (png, jpg, svg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
