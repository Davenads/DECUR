import { useEffect, useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../../_app';
import { getSupabaseBrowserClient } from '../../../lib/supabase/browser';

// ── Types ──────────────────────────────────────────────────────────────────

interface ContributorProfile {
  display_name: string | null;
  username: string | null;
}

interface ReviewerProfile {
  display_name: string | null;
}

interface Contribution {
  id: string;
  content_type: string;
  title: string;
  status: string;
  submitter_note: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  profiles: ContributorProfile | null;
  reviewer: ReviewerProfile | null;
}

interface AdminContributionsResponse {
  contributions: Contribution[];
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

// ── Constants ──────────────────────────────────────────────────────────────

type FilterTab = 'all' | 'pending' | 'approved' | 'rejected' | 'needs_revision';

const FILTER_TABS: { key: FilterTab; label: string; statusParam: string }[] = [
  { key: 'all',            label: 'All',           statusParam: '' },
  { key: 'pending',        label: 'Pending',       statusParam: 'submitted,under_review' },
  { key: 'approved',       label: 'Approved',      statusParam: 'approved' },
  { key: 'rejected',       label: 'Rejected',      statusParam: 'rejected' },
  { key: 'needs_revision', label: 'Needs Revision', statusParam: 'needs_revision' },
];

const STATUS_BADGE: Record<string, string> = {
  submitted:    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  under_review: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  approved:     'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  rejected:     'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  needs_revision: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  draft:        'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const TYPE_BADGE: Record<string, string> = {
  figure:         'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  case:           'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  timeline_event: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  correction:     'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  source:         'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

function statusLabel(status: string): string {
  return status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
}

// ── Component ──────────────────────────────────────────────────────────────

export default function AdminContributionsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [roleChecked, setRoleChecked] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterTab>('pending');
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Role guard
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.replace('/');
      return;
    }
    const supabase = getSupabaseBrowserClient();
    supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      .then(({ data }: { data: { role: string } | null }) => {
        if (!data || !['moderator', 'admin'].includes(data.role)) {
          router.replace('/');
        } else {
          setRoleChecked(true);
        }
      });
  }, [authLoading, user, router]);

  const fetchContributions = useCallback(async (filter: FilterTab, pg: number) => {
    setLoading(true);
    const tab = FILTER_TABS.find(t => t.key === filter)!;
    const params = new URLSearchParams({ page: String(pg), per_page: '20' });
    if (tab.statusParam) params.set('status', tab.statusParam);

    try {
      const res = await fetch(`/api/admin/contributions?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const json = await res.json() as AdminContributionsResponse;
      setContributions(json.contributions);
      setTotal(json.total);
      setTotalPages(json.total_pages);
    } catch {
      setContributions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!roleChecked) return;
    fetchContributions(activeFilter, page);
  }, [roleChecked, activeFilter, page, fetchContributions]);

  function handleFilterChange(filter: FilterTab) {
    setActiveFilter(filter);
    setPage(1);
  }

  if (authLoading || !roleChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Head><title>Contributions - Admin - DECUR</title></Head>

      <div className="container mx-auto px-4 py-10 max-w-6xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Contribution Queue</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Review and moderate user-submitted contributions.
          </p>
        </div>

        {/* Filter tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="-mb-px flex gap-6 overflow-x-auto">
            {FILTER_TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => handleFilterChange(tab.key)}
                className={`pb-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
                  activeFilter === tab.key
                    ? 'border-primary text-primary dark:text-primary-light'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                }`}
              >
                {tab.label}
                {!loading && activeFilter === tab.key && total > 0 && ` (${total})`}
              </button>
            ))}
          </nav>
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-800">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-4">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-4 flex-1 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-4 w-28 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : contributions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">No contributions</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">
                {activeFilter === 'pending'
                  ? 'No submissions awaiting review.'
                  : `No contributions with status "${activeFilter.replace('_', ' ')}".`}
              </p>
            </div>
          ) : (
            <>
              {/* Header row */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] items-center gap-4 px-4 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-950">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Title</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-28 text-center">Type</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-28">Submitted by</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-24">Date</span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-28 text-center">Status</span>
              </div>

              <ul className="divide-y divide-gray-100 dark:divide-gray-800">
                {contributions.map(c => {
                  const submitter = c.profiles?.display_name ?? c.profiles?.username ?? 'Unknown';
                  const dateStr = new Date(c.created_at).toLocaleDateString('en-US', {
                    month: 'short', day: 'numeric', year: 'numeric',
                  });
                  return (
                    <li key={c.id}>
                      <Link
                        href={`/admin/contributions/${c.id}`}
                        className="flex sm:grid sm:grid-cols-[1fr_auto_auto_auto_auto] items-center gap-3 sm:gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <span className="flex-1 min-w-0 text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {c.title}
                        </span>
                        <span className={`shrink-0 sm:w-28 text-center px-2 py-0.5 rounded text-xs font-medium ${TYPE_BADGE[c.content_type] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                          {c.content_type.replace('_', ' ')}
                        </span>
                        <span className="shrink-0 sm:w-28 text-xs text-gray-500 dark:text-gray-400 truncate hidden sm:block">
                          {submitter}
                        </span>
                        <span className="shrink-0 sm:w-24 text-xs text-gray-400 dark:text-gray-500 hidden sm:block">
                          {dateStr}
                        </span>
                        <span className={`shrink-0 sm:w-28 text-center px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[c.status] ?? STATUS_BADGE.draft}`}>
                          {statusLabel(c.status)}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
        </div>

        {/* Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Page {page} of {totalPages} - {total} total
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
