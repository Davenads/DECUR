import { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Head from 'next/head';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { getSupabaseBrowserClient } from '../../lib/supabase/browser';

/**
 * Two-step password reset:
 * Step 1 (default) - User enters email, receives reset link.
 * Step 2 (after clicking link) - Supabase redirects back with a session;
 *   we detect the PASSWORD_RECOVERY event and show the new-password form.
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  // Start with 'request' on both server and client to avoid hydration mismatch.
  // useEffect reads the query param after mount and upgrades to 'set' if present.
  const [step, setStep] = useState<'request' | 'set'>('request');

  // Detect Supabase error redirects (e.g. expired/already-used reset link)
  // and pre-populate the error state so the user sees a clear explanation.
  const [linkError, setLinkError] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const errorCode = params.get('error_code');
      if (errorCode === 'otp_expired') {
        return 'This reset link has expired or was already used. Please request a new one below.';
      }
      if (params.get('error') === 'access_denied') {
        return 'This reset link is invalid. Please request a new one below.';
      }
    }
    return null;
  });
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  // DEBUG state - remove after diagnosing
  const [debugInfo, setDebugInfo] = useState<Record<string, unknown> | null>(null);

  // After mount: check ?mode=recovery in the URL and switch to the set-password
  // form. Doing this in useEffect (not a lazy useState initializer) ensures server
  // and client render the same initial HTML, preventing hydration mismatch.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('mode') === 'recovery') {
      setStep('set');
    }
  }, []);

  // Detect PASSWORD_RECOVERY event (user clicked the reset link)
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      console.log('[reset-password] auth event:', event, session ? `user=${session.user?.id}` : 'no session');
      if (event === 'PASSWORD_RECOVERY') {
        setStep('set');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // DEBUG: log browser session state when step switches to 'set'
  useEffect(() => {
    if (step !== 'set') return;
    const supabase = getSupabaseBrowserClient();
    supabase.auth.getSession().then(({ data: { session } }: { data: { session: Session | null } }) => {
      const visibleCookies = typeof document !== 'undefined' ? document.cookie : '';
      const storedTokens = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('decur-recovery-tokens') : null;
      console.log('[reset-password:set] browser session:', session ? `user=${session.user?.id} exp=${session.expires_at}` : null);
      console.log('[reset-password:set] document.cookie keys:', visibleCookies.split(';').map(c => c.trim().split('=')[0]).filter(Boolean));
      console.log('[reset-password:set] sessionStorage tokens present:', !!storedTokens);
    });
  }, [step]);

  async function handleRequest(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const supabase = getSupabaseBrowserClient();
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      // Route through /auth/verify so the hash is consumed there.
      // Verify detects the PASSWORD_RECOVERY session and redirects to
      // /auth/reset-password?mode=recovery (a plain query param, not a hash).
      redirectTo: `${window.location.origin}/auth/verify?type=recovery`,
    });

    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
    }
    setLoading(false);
  }

  async function handleSetPassword(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    // DEBUG: snapshot browser-side state before the API call
    const supabase = getSupabaseBrowserClient();
    const { data: { session: browserSession } } = await supabase.auth.getSession();
    const visibleCookies = typeof document !== 'undefined' ? document.cookie : '(server-side)';
    const storedTokensRaw = typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('decur-recovery-tokens') : null;

    const preCallDebug = {
      browserSession: browserSession
        ? { userId: browserSession.user?.id, expiresAt: browserSession.expires_at }
        : null,
      visibleCookieKeys: visibleCookies.split(';').map(c => c.trim().split('=')[0]).filter(Boolean),
      sessionStorageHasTokens: !!storedTokensRaw,
    };

    // Route the password update through a server-side API endpoint.
    const response = await fetch('/api/auth/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPassword }),
    });
    // Clean up stored recovery tokens regardless of outcome
    if (typeof window !== 'undefined') sessionStorage.removeItem('decur-recovery-tokens');

    const body = await response.json().catch(() => ({ error: 'Unknown error' }));

    // DEBUG: surface all diagnostic data in the UI
    setDebugInfo({
      status: response.status,
      ok: response.ok,
      responseBody: body,
      ...preCallDebug,
    });

    if (!response.ok) {
      const msg: string = body?.error ?? 'Unknown error';
      if (msg.toLowerCase().includes('session') || msg.toLowerCase().includes('missing') || msg.toLowerCase().includes('expired')) {
        setError('Your reset session has expired. Please request a new reset link.');
        setStep('request');
      } else {
        setError(msg);
      }
      setLoading(false);
      return;
    }

    router.push('/profile');
  }

  return (
    <>
      <Head>
        <title>Reset Password - DECUR</title>
      </Head>
      <div className="min-h-screen flex items-center justify-center px-4 py-16 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link href="/" className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">
              DECUR
            </Link>
            <h1 className="mt-4 text-xl font-semibold text-gray-800 dark:text-gray-200">
              {step === 'request' ? 'Reset your password' : 'Set new password'}
            </h1>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-8">
            {/* Step 1: Request reset email */}
            {step === 'request' && !success && (
              <form onSubmit={handleRequest} className="space-y-5">
                {linkError && (
                  <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-sm text-amber-700 dark:text-amber-400">
                    {linkError}
                  </div>
                )}
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                    {error}
                  </div>
                )}

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Enter your email address and we&apos;ll send you a link to reset your password.
                </p>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Email address
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="you@example.com"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Sending...' : 'Send reset link'}
                </button>

                <div className="text-center">
                  <Link href="/auth/login" className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                    Back to sign in
                  </Link>
                </div>
              </form>
            )}

            {/* Request sent confirmation */}
            {step === 'request' && success && (
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Reset link sent to <strong>{email}</strong>. Check your inbox.
                </p>
                <Link href="/auth/login" className="mt-4 inline-block text-sm text-primary hover:underline dark:text-primary-light">
                  Back to sign in
                </Link>
              </div>
            )}

            {/* Step 2: Set new password */}
            {step === 'set' && (
              <form onSubmit={handleSetPassword} className="space-y-5">
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                    {error}
                  </div>
                )}

                {/* DEBUG PANEL - remove after diagnosing */}
                {debugInfo && (
                  <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 text-xs font-mono text-yellow-900 dark:text-yellow-200 overflow-auto max-h-64 whitespace-pre-wrap break-all">
                    <strong className="block mb-1 text-yellow-700 dark:text-yellow-400">[DEBUG] API Response</strong>
                    {JSON.stringify(debugInfo, null, 2)}
                  </div>
                )}

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    New password
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="At least 8 characters"
                  />
                </div>

                <div>
                  <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                    Confirm new password
                  </label>
                  <input
                    id="confirm"
                    type="password"
                    autoComplete="new-password"
                    required
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-primary hover:bg-primary-dark text-white font-medium text-sm rounded-lg transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? 'Updating...' : 'Update password'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
