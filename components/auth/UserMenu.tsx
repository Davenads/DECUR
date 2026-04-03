import { useState, useRef, useEffect, FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../pages/_app';
import { getSupabaseBrowserClient } from '../../lib/supabase/browser';

const UserMenu: FC = () => {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on route change
  useEffect(() => {
    setOpen(false);
  }, [router.pathname]);

  async function handleSignOut() {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push('/');
  }

  // Don't render until auth state is known
  if (loading) {
    return <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />;
  }

  // Unauthenticated: Sign in link
  if (!user) {
    return (
      <Link
        href={`/auth/login?redirect=${encodeURIComponent(router.asPath)}`}
        className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
        Sign in
      </Link>
    );
  }

  // Extract initials for avatar fallback
  const displayName: string =
    (user.user_metadata?.display_name as string | undefined) ||
    user.email?.split('@')[0] ||
    'U';
  const initials = displayName
    .split(' ')
    .map(w => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(prev => !prev)}
        aria-label="Account menu"
        aria-expanded={open}
        className="flex items-center gap-2 focus:outline-none group"
      >
        {/* Avatar circle */}
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold select-none group-hover:ring-2 group-hover:ring-primary/40 transition-all">
          {initials}
        </div>
        {/* Chevron */}
        <svg
          className={`w-3.5 h-3.5 text-gray-500 dark:text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg py-1 z-50">
          {/* User info header */}
          <div className="px-4 py-2.5 border-b border-gray-100 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{displayName}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{user.email}</p>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/profile"
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              My Profile
            </Link>
            <Link
              href="/profile#saved"
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
              Saved Items
            </Link>
            <Link
              href="/contribute/submit"
              className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Submit Contribution
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-gray-100 dark:border-gray-800 py-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
