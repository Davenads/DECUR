import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '../../lib/supabase/browser';

/**
 * OAuth + email-link callback handler.
 * Supabase redirects here after email verification or OAuth login.
 * The URL contains the token/code fragments which the SDK handles automatically.
 */
export default function VerifyPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    // Detect if this is a password-recovery callback from the reset email.
    // We use window.location.search directly (not router.query) because router
    // may not be ready on the first render cycle.
    const isRecovery =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('type') === 'recovery';

    const getRedirectTarget = () => {
      if (isRecovery) return '/auth/reset-password?mode=recovery';
      return typeof router.query.redirect === 'string' ? router.query.redirect : '/profile';
    };

    // Listen for auth state - Supabase SDK automatically exchanges
    // the token/code in the URL fragment on page load.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'PASSWORD_RECOVERY') {
        // Persist the recovery tokens to sessionStorage so the reset-password page
        // can restore the session if the browser client loses it during navigation.
        // The SDK may not persist recovery sessions to localStorage in all cases,
        // and getUser() server-side calls can clear the in-memory session.
        if (session) {
          sessionStorage.setItem('decur-recovery-tokens', JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          }));
        }
        setStatus('success');
        setTimeout(() => router.push('/auth/reset-password?mode=recovery'), 1200);
      } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setStatus('success');
        // Small delay so user sees success state briefly
        setTimeout(() => router.push(getRedirectTarget()), 1200);
      } else if (event === 'SIGNED_OUT') {
        setStatus('error');
        setMessage('Verification link may have expired. Please request a new one.');
      }
    });

    // Fallback: if createBrowserClient already consumed the hash before our
    // subscription registered (common race), getSession() will return the
    // already-established session from localStorage.
    // Use getSession() (local read) rather than getUser() (server request) to
    // avoid server-side JWT validation which can clear the recovery session.
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      if (session && status === 'loading') {
        setStatus('success');
        setTimeout(() => router.push(getRedirectTarget()), 1200);
      }
    });

    return () => subscription.unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>Verifying - DECUR</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-sm text-center">
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8">
            {status === 'loading' && (
              <>
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-sm text-gray-500 dark:text-gray-400">Verifying your account...</p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">Verified!</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">Redirecting you now...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">Verification failed</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{message}</p>
                <Link
                  href="/auth/login"
                  className="text-sm text-primary hover:underline dark:text-primary-light"
                >
                  Back to sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
