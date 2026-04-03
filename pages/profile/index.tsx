import { useEffect, useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../_app';
import { getSupabaseBrowserClient } from '../../lib/supabase/browser';

type Tab = 'saved' | 'collections';

interface Profile {
  display_name: string | null;
  bio: string | null;
  avatar_url: string | null;
  created_at: string;
}

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>('saved');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Middleware handles redirect for unauthenticated users, but guard here too
  // for cases where JS auth state lags slightly behind.
  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login?redirect=/profile');
    }
  }, [authLoading, user, router]);

  // Resolve hash-based tab from URL (e.g. /profile#saved)
  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as Tab;
    if (hash === 'saved' || hash === 'collections') {
      setActiveTab(hash);
    }
  }, []);

  // Fetch profile row from Supabase
  useEffect(() => {
    if (!user) return;

    const supabase = getSupabaseBrowserClient();
    supabase
      .from('profiles')
      .select('display_name, bio, avatar_url, created_at')
      .eq('id', user.id)
      .single()
      .then(({ data }: { data: Profile | null }) => {
        setProfile(data);
        setProfileLoading(false);
      });
  }, [user]);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    window.history.replaceState(null, '', `#${tab}`);
  }

  const displayName =
    profile?.display_name ||
    (user?.user_metadata?.display_name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'User';

  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const memberSince = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    : null;

  if (authLoading || (!user && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>My Profile - DECUR</title>
      </Head>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Profile header */}
        <div className="flex items-start gap-5 mb-8">
          <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold shrink-0 select-none">
            {initials}
          </div>
          <div className="min-w-0">
            {profileLoading ? (
              <div className="space-y-2">
                <div className="h-5 w-36 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-3.5 w-24 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
              </div>
            ) : (
              <>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100 truncate">{displayName}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
                {memberSince && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Member since {memberSince}</p>
                )}
                {profile?.bio && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 max-w-prose">{profile.bio}</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex gap-6">
            {(['saved', 'collections'] as Tab[]).map(tab => (
              <button
                key={tab}
                onClick={() => handleTabChange(tab)}
                className={`pb-3 text-sm font-medium capitalize transition-colors border-b-2 ${
                  activeTab === tab
                    ? 'border-primary text-primary dark:text-primary-light'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {tab === 'saved' ? 'Saved Items' : 'Collections'}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab content */}
        {activeTab === 'saved' && (
          <EmptyState
            icon={
              <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            }
            title="No saved items yet"
            description="Bookmark key figures, cases, documents, and more. They'll appear here for quick access."
          />
        )}

        {activeTab === 'collections' && (
          <EmptyState
            icon={
              <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            }
            title="No collections yet"
            description="Organize your saved items into collections. Share them publicly or keep them private."
          />
        )}
      </div>
    </>
  );
}

function EmptyState({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm">{description}</p>
    </div>
  );
}
