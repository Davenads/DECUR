import { useEffect, useState, FormEvent } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../_app';
import { getSupabaseBrowserClient } from '../../lib/supabase/browser';

type Tab = 'saved' | 'collections' | 'submissions';

interface Profile {
  display_name: string | null;
  bio: string | null;
  created_at: string;
}

interface Bookmark {
  id: string;
  content_type: string;
  content_id: string;
  content_name: string;
  created_at: string;
}

interface Collection {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  is_public: boolean;
  updated_at: string;
  collection_items: [{ count: number }] | [];
}

interface Submission {
  id: string;
  content_type: string;
  title: string;
  status: string;
  submitter_note: string | null;
  reviewer_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

// Submission status badge colors
const SUBMISSION_STATUS_BADGE: Record<string, string> = {
  submitted:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  under_review:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  approved:       'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  rejected:       'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  needs_revision: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  draft:          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

// Submission content_type badge colors
const SUBMISSION_TYPE_BADGE: Record<string, string> = {
  figure:         'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  case:           'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  timeline_event: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  correction:     'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  source:         'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

// Map content_type → { label, color, href builder }
const CONTENT_META: Record<string, { label: string; color: string; href: (id: string) => string }> = {
  figure:   { label: 'Key Figure',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',    href: id => `/figures/${id}` },
  case:     { label: 'Case',        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', href: id => `/cases/${id}` },
  document: { label: 'Document',    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', href: id => `/documents/${id}` },
  program:  { label: 'Program',     color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', href: id => `/programs/${id}` },
  timeline: { label: 'Event',       color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',        href: _id => `/timeline` },
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab]         = useState<Tab>('saved');
  const [profile, setProfile]             = useState<Profile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [bookmarks, setBookmarks]         = useState<Bookmark[]>([]);
  const [bmLoading, setBmLoading]         = useState(true);

  const [collections, setCollections]     = useState<Collection[]>([]);
  const [colLoading, setColLoading]       = useState(true);

  const [submissions, setSubmissions]     = useState<Submission[]>([]);
  const [subLoading, setSubLoading]       = useState(true);

  // New collection form state
  const [showNewCol, setShowNewCol]       = useState(false);
  const [newColTitle, setNewColTitle]     = useState('');
  const [newColDesc, setNewColDesc]       = useState('');
  const [newColPublic, setNewColPublic]   = useState(false);
  const [newColSaving, setNewColSaving]   = useState(false);
  const [newColError, setNewColError]     = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/auth/login?redirect=/profile');
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const hash = window.location.hash.replace('#', '') as Tab;
    if (hash === 'saved' || hash === 'collections' || hash === 'submissions') setActiveTab(hash);
  }, []);

  // Fetch profile row
  useEffect(() => {
    if (!user) return;
    const supabase = getSupabaseBrowserClient();
    supabase
      .from('profiles')
      .select('display_name, bio, created_at')
      .eq('id', user.id)
      .single()
      .then(({ data }: { data: Profile | null }) => {
        setProfile(data);
        setProfileLoading(false);
      });
  }, [user]);

  // Fetch bookmarks
  useEffect(() => {
    if (!user) return;
    fetch('/api/bookmarks')
      .then(r => r.json())
      .then(({ bookmarks: data }: { bookmarks: Bookmark[] }) => {
        setBookmarks(data ?? []);
        setBmLoading(false);
      })
      .catch(() => setBmLoading(false));
  }, [user]);

  // Fetch collections
  useEffect(() => {
    if (!user) return;
    fetch('/api/collections')
      .then(r => r.json())
      .then(({ collections: data }: { collections: Collection[] }) => {
        setCollections(data ?? []);
        setColLoading(false);
      })
      .catch(() => setColLoading(false));
  }, [user]);

  // Fetch submissions
  useEffect(() => {
    if (!user) return;
    fetch('/api/contributions/mine')
      .then(r => r.json())
      .then(({ submissions: data }: { submissions: Submission[] }) => {
        setSubmissions(data ?? []);
        setSubLoading(false);
      })
      .catch(() => setSubLoading(false));
  }, [user]);

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    window.history.replaceState(null, '', `#${tab}`);
  }

  async function handleRemoveBookmark(id: string) {
    setBookmarks(prev => prev.filter(b => b.id !== id));
    await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' }).catch(() => {
      // Refetch on error
      fetch('/api/bookmarks').then(r => r.json()).then(({ bookmarks: data }) => setBookmarks(data ?? []));
    });
  }

  async function handleCreateCollection(e: FormEvent) {
    e.preventDefault();
    if (!newColTitle.trim()) return;
    setNewColSaving(true);
    setNewColError(null);

    const res = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newColTitle, description: newColDesc || undefined, is_public: newColPublic }),
    });

    const json = await res.json() as { collection?: Collection; error?: string };
    if (!res.ok || json.error) {
      setNewColError(json.error ?? 'Failed to create collection.');
      setNewColSaving(false);
      return;
    }

    setCollections(prev => [json.collection!, ...prev]);
    setNewColTitle('');
    setNewColDesc('');
    setNewColPublic(false);
    setShowNewCol(false);
    setNewColSaving(false);
  }

  const displayName =
    profile?.display_name ||
    (user?.user_metadata?.display_name as string | undefined) ||
    user?.email?.split('@')[0] ||
    'User';

  const initials = displayName.split(' ').map((w: string) => w[0]).slice(0, 2).join('').toUpperCase();
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
      <Head><title>My Profile - DECUR</title></Head>

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
                <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{displayName}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{user?.email}</p>
                {memberSince && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Member since {memberSince}</p>}
                {profile?.bio && <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 max-w-prose">{profile.bio}</p>}
              </>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex gap-6">
            <button
              onClick={() => handleTabChange('saved')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'saved'
                  ? 'border-primary text-primary dark:text-primary-light'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {`Saved Items${!bmLoading && bookmarks.length > 0 ? ` (${bookmarks.length})` : ''}`}
            </button>
            <button
              onClick={() => handleTabChange('collections')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'collections'
                  ? 'border-primary text-primary dark:text-primary-light'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {`Collections${!colLoading && collections.length > 0 ? ` (${collections.length})` : ''}`}
            </button>
            <button
              onClick={() => handleTabChange('submissions')}
              className={`pb-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'submissions'
                  ? 'border-primary text-primary dark:text-primary-light'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              {`Submissions${!subLoading && submissions.length > 0 ? ` (${submissions.length})` : ''}`}
            </button>
          </nav>
        </div>

        {/* Saved Items tab */}
        {activeTab === 'saved' && (
          <>
            {bmLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : bookmarks.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                }
                title="No saved items yet"
                description="Bookmark key figures, cases, documents, and more using the save button on any profile page."
              />
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {bookmarks.map(bm => {
                  const meta = CONTENT_META[bm.content_type] ?? CONTENT_META.figure;
                  return (
                    <li key={bm.id} className="flex items-center gap-3 py-3 group">
                      <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${meta.color}`}>
                        {meta.label}
                      </span>
                      <Link
                        href={meta.href(bm.content_id)}
                        className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light truncate transition-colors"
                      >
                        {bm.content_name}
                      </Link>
                      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 hidden sm:block">
                        {new Date(bm.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => handleRemoveBookmark(bm.id)}
                        title="Remove bookmark"
                        className="shrink-0 p-1 rounded text-gray-300 dark:text-gray-600 hover:text-red-500 dark:hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {/* Submissions tab */}
        {activeTab === 'submissions' && (
          <>
            {subLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : submissions.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                }
                title="No submissions yet"
                description="Submit a contribution to help expand the DECUR database. You can track the review status of each submission here."
              />
            ) : (
              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {submissions.map(sub => {
                  const statusColor = SUBMISSION_STATUS_BADGE[sub.status] ?? SUBMISSION_STATUS_BADGE.draft;
                  const typeColor = SUBMISSION_TYPE_BADGE[sub.content_type] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
                  const isNegative = sub.status === 'rejected' || sub.status === 'needs_revision';
                  return (
                    <li key={sub.id} className="py-3 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${typeColor}`}>
                          {sub.content_type.replace(/_/g, ' ')}
                        </span>
                        <span className="flex-1 text-sm font-medium text-gray-800 dark:text-gray-200 truncate min-w-0">
                          {sub.title}
                        </span>
                        <span className={`shrink-0 px-2 py-0.5 rounded text-xs font-medium ${statusColor}`}>
                          {sub.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        <span className="shrink-0 text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                          {new Date(sub.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      {sub.reviewer_note && isNegative && (
                        <div className="ml-0 p-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50">
                          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 mb-0.5">Reviewer note</p>
                          <p className="text-xs text-amber-900 dark:text-amber-200">{sub.reviewer_note}</p>
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </>
        )}

        {/* Collections tab */}
        {activeTab === 'collections' && (
          <>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {colLoading ? '' : `${collections.length} collection${collections.length !== 1 ? 's' : ''}`}
              </p>
              <button
                onClick={() => setShowNewCol(v => !v)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New collection
              </button>
            </div>

            {/* New collection form */}
            {showNewCol && (
              <form
                onSubmit={handleCreateCollection}
                className="mb-6 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 space-y-4"
              >
                <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Create collection</h3>
                {newColError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{newColError}</p>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Title</label>
                  <input
                    type="text"
                    required
                    value={newColTitle}
                    onChange={e => setNewColTitle(e.target.value)}
                    placeholder="e.g. Roswell Research"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description (optional)</label>
                  <textarea
                    value={newColDesc}
                    onChange={e => setNewColDesc(e.target.value)}
                    rows={2}
                    placeholder="What is this collection about?"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-colors"
                  />
                </div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newColPublic}
                    onChange={e => setNewColPublic(e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary/50"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">Make collection public</span>
                </label>
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={newColSaving}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
                  >
                    {newColSaving ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewCol(false)}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {colLoading ? (
              <div className="grid sm:grid-cols-2 gap-3">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : collections.length === 0 ? (
              <EmptyState
                icon={
                  <svg className="w-8 h-8 text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                }
                title="No collections yet"
                description="Create a collection to organize your saved items. Collections can be kept private or shared publicly."
              />
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {collections.map(col => {
                  const itemCount = Array.isArray(col.collection_items)
                    ? (col.collection_items[0] as { count: number } | undefined)?.count ?? 0
                    : 0;
                  return (
                    <div
                      key={col.id}
                      className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">{col.title}</h3>
                        {col.is_public && (
                          <span className="shrink-0 text-xs px-1.5 py-0.5 rounded bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                            Public
                          </span>
                        )}
                      </div>
                      {col.description && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{col.description}</p>
                      )}
                      <p className="text-xs text-gray-400 dark:text-gray-500">
                        {itemCount} item{itemCount !== 1 ? 's' : ''} - Updated {new Date(col.updated_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4">{icon}</div>
      <h3 className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">{title}</h3>
      <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm">{description}</p>
    </div>
  );
}
