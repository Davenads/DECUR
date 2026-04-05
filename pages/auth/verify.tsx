import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '../../lib/supabase/browser';

/**
 * OAuth + email-link callback handler.
 * Supabase redirects here after email verification or OAuth login.
 * Explicitly calls exchangeCodeForSession for reliable PKCE handling in production.
 */
export default function VerifyPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();

    const isRecovery =
      typeof window !== 'undefined' &&
      new URLSearchParams(window.location.search).get('type') === 'recovery';

    const getRedirectTarget = () => {
      if (isRecovery) return '/auth/reset-password?mode=recovery';
      return typeof router.query.redirect === 'string' ? router.query.redirect : '/profile';
    };

    // Guard against double-handling (SDK auto-exchange vs explicit call race)
    let handled = false;

    function handleSuccess(session: Session | null) {
      if (handled) return;
      handled = true;

      if (isRecovery && session) {
        sessionStorage.setItem(
          'decur-recovery-tokens',
          JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
          })
        );
        setStatus('success');
        setTimeout(() => router.push('/auth/reset-password?mode=recovery'), 1200);
      } else {
        setStatus('success');
        setTimeout(() => router.push(getRedirectTarget()), 1200);
      }
    }

    function handleError(msg?: string) {
      if (handled) return;
      handled = true;
      setStatus('error');
      setMessage(msg ?? 'Verification failed. Please try signing in again.');
    }

    // Subscribe to auth state changes before triggering any exchange
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && isRecovery)) {
          handleSuccess(session);
        } else if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
          handleSuccess(session);
        } else if (event === 'SIGNED_OUT') {
          handleError('Verification link may have expired. Please request a new one.');
        }
      }
    );

    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');

    if (code) {
      // Explicitly exchange the PKCE code — required for reliable production behaviour.
      // createBrowserClient may auto-exchange on init (race condition); if it beats us,
      // exchangeCodeForSession returns an error and we fall back to getSession().
      supabase.auth.exchangeCodeForSession(code).then(
        ({ data, error }: { data: { session: Session | null }; error: { message: string } | null }) => {
        if (!error) {
          // SIGNED_IN will fire via onAuthStateChange; handle it there.
          // Call handleSuccess here only if the event somehow didn't fire.
          setTimeout(() => {
            if (!handled) handleSuccess(data.session);
          }, 500);
        } else {
          // Code was likely already exchanged by the SDK on initialization.
          // Check for an existing session before surfacing an error.
          supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
            if (session) {
              handleSuccess(session);
            } else {
              handleError('Verification failed. Please try signing in again.');
            }
          });
        }
      });
    } else {
      // No code param — check for an already-established session (hash-based flows)
      supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
        if (session) {
          handleSuccess(session);
        }
      });
    }

    // Safety timeout: surface an error if nothing resolved in 10 seconds
    const timeout = setTimeout(() => {
      if (!handled) {
        handled = true;
        setStatus('error');
        setMessage('Verification timed out. Please try signing in again.');
      }
    }, 10000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
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
