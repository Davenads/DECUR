import { useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import type { GetServerSideProps } from 'next';
import { supabaseAdmin } from '../../../lib/supabase/admin';
import { createServerClient } from '@supabase/ssr';

// ── Types ──────────────────────────────────────────────────────────────────

interface SubmitterProfile {
  display_name: string | null;
  username: string | null;
}

interface ReviewerProfile {
  display_name: string | null;
}

interface ContributionDetail {
  id: string;
  content_type: string;
  title: string;
  status: string;
  submitter_note: string | null;
  reviewer_note: string | null;
  payload: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  profiles: SubmitterProfile | null;
  reviewer: ReviewerProfile | null;
}

interface ContributionEvent {
  id: string;
  event_type: string;
  note: string | null;
  created_at: string;
  actor: { display_name: string | null; username: string | null } | null;
}

interface Props {
  contribution: ContributionDetail;
  events: ContributionEvent[];
}

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  submitted:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  under_review:   'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  approved:       'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  rejected:       'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  needs_revision: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  draft:          'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

const TYPE_BADGE: Record<string, string> = {
  figure:         'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  case:           'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  timeline_event: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  correction:     'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  source:         'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
};

const EVENT_LABELS: Record<string, string> = {
  submitted:         'Submitted',
  review_started:    'Review started',
  approved:          'Approved',
  rejected:          'Rejected',
  revision_requested: 'Revision requested',
  resubmitted:       'Resubmitted',
  revalidated:       'Revalidated',
};

function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function isReviewable(status: string): boolean {
  return ['submitted', 'under_review', 'needs_revision'].includes(status);
}

// ── Payload renderer ───────────────────────────────────────────────────────

function renderPayloadValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined) {
    return <span className="text-gray-400 dark:text-gray-500 italic">null</span>;
  }
  if (typeof value === 'boolean') {
    return <span className="text-gray-700 dark:text-gray-300">{value ? 'Yes' : 'No'}</span>;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return <span className="text-gray-400 dark:text-gray-500 italic">empty list</span>;
    return (
      <ul className="list-disc list-inside space-y-0.5 mt-1">
        {value.map((item, i) => (
          <li key={i} className="text-sm text-gray-700 dark:text-gray-300">
            {typeof item === 'object' ? JSON.stringify(item) : String(item)}
          </li>
        ))}
      </ul>
    );
  }
  if (typeof value === 'object') {
    return (
      <pre className="text-xs bg-gray-50 dark:bg-gray-800 rounded p-2 overflow-x-auto text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
        {JSON.stringify(value, null, 2)}
      </pre>
    );
  }
  const str = String(value);
  const isUrl = /^https?:\/\//i.test(str);
  if (isUrl) {
    return (
      <a
        href={str}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline dark:text-primary-light break-all text-sm"
      >
        {str}
      </a>
    );
  }
  return <span className="text-sm text-gray-700 dark:text-gray-300 break-words">{str}</span>;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function AdminContributionDetailPage({ contribution, events }: Props) {
  const router = useRouter();
  const [action, setAction] = useState<'approve' | 'reject' | 'needs_revision' | 'review_started' | null>(null);
  const [reviewerNote, setReviewerNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitter =
    contribution.profiles?.display_name ??
    contribution.profiles?.username ??
    'Unknown';

  const submittedDate = new Date(contribution.created_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  async function handleReviewSubmit() {
    if (!action) return;
    if ((action === 'reject' || action === 'needs_revision') && !reviewerNote.trim()) {
      setSubmitError('A reviewer note is required when rejecting or requesting revision.');
      return;
    }
    setSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch(`/api/admin/contributions/${contribution.id}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reviewer_note: reviewerNote.trim() || undefined }),
      });
      const json = await res.json() as { ok?: boolean; error?: string };
      if (!res.ok || json.error) {
        setSubmitError(json.error ?? 'Failed to submit review.');
        setSubmitting(false);
        return;
      }
      // Reload page to reflect updated status
      router.replace(router.asPath);
    } catch {
      setSubmitError('An unexpected error occurred.');
      setSubmitting(false);
    }
  }

  return (
    <>
      <Head><title>{contribution.title} - Admin Review - DECUR</title></Head>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {/* Back link */}
        <Link
          href="/admin/contributions"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mb-6"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to queue
        </Link>

        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-5">
          <div className="flex flex-wrap items-start gap-2 mb-3">
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${TYPE_BADGE[contribution.content_type] ?? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
              {contribution.content_type.replace(/_/g, ' ')}
            </span>
            <span className={`px-2 py-0.5 rounded text-xs font-medium ${STATUS_BADGE[contribution.status] ?? STATUS_BADGE.draft}`}>
              {statusLabel(contribution.status)}
            </span>
          </div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">{contribution.title}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Submitted by <span className="font-medium text-gray-700 dark:text-gray-300">{submitter}</span> on {submittedDate}
          </p>
        </div>

        {/* Submitter note */}
        {contribution.submitter_note && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl p-4 mb-5">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-700 dark:text-amber-400 mb-1">Submitter note</p>
            <p className="text-sm text-amber-900 dark:text-amber-200">{contribution.submitter_note}</p>
          </div>
        )}

        {/* Reviewer note (if already reviewed) */}
        {contribution.reviewer_note && (
          <div className={`border rounded-xl p-4 mb-5 ${
            contribution.status === 'approved'
              ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-700/50'
              : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-700/50'
          }`}>
            <p className={`text-xs font-semibold uppercase tracking-wide mb-1 ${
              contribution.status === 'approved'
                ? 'text-green-700 dark:text-green-400'
                : 'text-red-700 dark:text-red-400'
            }`}>
              Reviewer note
              {contribution.reviewer && (
                <span className="normal-case font-normal ml-1">
                  - {contribution.reviewer.display_name ?? 'Moderator'}
                </span>
              )}
            </p>
            <p className={`text-sm ${
              contribution.status === 'approved'
                ? 'text-green-900 dark:text-green-200'
                : 'text-red-900 dark:text-red-200'
            }`}>
              {contribution.reviewer_note}
            </p>
          </div>
        )}

        {/* Payload */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-5">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Submitted Data</h2>
          <div className="space-y-3">
            {Object.entries(contribution.payload).map(([key, value]) => (
              <div key={key} className="grid grid-cols-[160px_1fr] gap-3 items-start">
                <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400 pt-0.5 break-all">
                  {key.replace(/_/g, ' ')}
                </span>
                <div>{renderPayloadValue(value)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit trail */}
        {events.length > 0 && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5 mb-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Audit Trail</h2>
            <ol className="relative border-l border-gray-200 dark:border-gray-700 space-y-4 ml-2">
              {events.map(evt => (
                <li key={evt.id} className="ml-4">
                  <div className="absolute w-2.5 h-2.5 bg-gray-300 dark:bg-gray-600 rounded-full -left-1.5 border border-white dark:border-gray-900 mt-1" />
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200">
                      {EVENT_LABELS[evt.event_type] ?? evt.event_type}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {new Date(evt.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </span>
                    {evt.actor && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        by {evt.actor.display_name ?? evt.actor.username ?? 'Unknown'}
                      </span>
                    )}
                  </div>
                  {evt.note && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{evt.note}</p>
                  )}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Review action form */}
        {isReviewable(contribution.status) && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 p-5">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-4">Review Action</h2>

            {submitError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700/50">
                <p className="text-sm text-red-700 dark:text-red-400">{submitError}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setAction(action === 'review_started' ? null : 'review_started')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  action === 'review_started'
                    ? 'bg-gray-700 text-white border-gray-700'
                    : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800'
                }`}
              >
                Mark Under Review
              </button>
              <button
                onClick={() => setAction(action === 'approve' ? null : 'approve')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  action === 'approve'
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white dark:bg-gray-900 text-green-700 dark:text-green-400 border-green-300 dark:border-green-700 hover:bg-green-50 dark:hover:bg-green-900/20'
                }`}
              >
                Approve
              </button>
              <button
                onClick={() => setAction(action === 'needs_revision' ? null : 'needs_revision')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  action === 'needs_revision'
                    ? 'bg-amber-500 text-white border-amber-500'
                    : 'bg-white dark:bg-gray-900 text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                }`}
              >
                Request Revision
              </button>
              <button
                onClick={() => setAction(action === 'reject' ? null : 'reject')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  action === 'reject'
                    ? 'bg-red-600 text-white border-red-600'
                    : 'bg-white dark:bg-gray-900 text-red-700 dark:text-red-400 border-red-300 dark:border-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
                }`}
              >
                Reject
              </button>
            </div>

            {/* Reviewer note textarea */}
            {action && (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">
                    Reviewer note
                    {(action === 'reject' || action === 'needs_revision') && (
                      <span className="text-red-500 ml-1">*</span>
                    )}
                    {action === 'approve' && (
                      <span className="text-gray-400 dark:text-gray-500 ml-1">(optional)</span>
                    )}
                  </label>
                  <textarea
                    value={reviewerNote}
                    onChange={e => setReviewerNote(e.target.value)}
                    rows={3}
                    placeholder={
                      action === 'reject'
                        ? 'Explain why this contribution is being rejected...'
                        : action === 'needs_revision'
                        ? 'Describe what changes are needed...'
                        : 'Optional note for the contributor...'
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-none transition-colors"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReviewSubmit}
                    disabled={submitting}
                    className="px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-60"
                  >
                    {submitting ? 'Submitting...' : 'Submit review'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setAction(null); setReviewerNote(''); setSubmitError(null); }}
                    className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

// ── getServerSideProps ─────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.params as { id: string };
  const { req, res } = context;

  // Auth: use cookie-based server client to identify the requesting user
  const supabaseUrl =
    process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;

  const supabase = createServerClient(
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
          cookiesToSet.forEach(({ name, value }) => {
            res.setHeader('Set-Cookie', `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { redirect: { destination: '/', permanent: false } };
  }

  // Role check
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || !['moderator', 'admin'].includes(profile.role as string)) {
    return { redirect: { destination: '/', permanent: false } };
  }

  // Fetch contribution
  const { data: contribution, error } = await supabaseAdmin
    .from('contributions')
    .select(`
      id, content_type, title, status, submitter_note, reviewer_note,
      payload, created_at, updated_at, reviewed_at,
      profiles!contributions_user_id_fkey(display_name, username),
      reviewer:profiles!contributions_reviewed_by_fkey(display_name)
    `)
    .eq('id', id)
    .single();

  if (error || !contribution) {
    return { notFound: true };
  }

  // Fetch audit events
  const { data: eventsRaw } = await supabaseAdmin
    .from('contribution_events')
    .select(`
      id, event_type, note, created_at,
      actor:profiles!contribution_events_actor_id_fkey(display_name, username)
    `)
    .eq('contribution_id', id)
    .order('created_at', { ascending: true });

  return {
    props: {
      contribution: contribution as unknown as ContributionDetail,
      events: (eventsRaw ?? []) as unknown as ContributionEvent[],
    },
  };
};
