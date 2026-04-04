import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSideProps } from 'next';
import { getSupabaseBrowserClient } from '../../lib/supabase/browser';

// ── Types ─────────────────────────────────────────────────────────────────

interface CollectionOwner {
  display_name: string | null;
  username: string | null;
}

interface CollectionItem {
  id: string;
  bookmark_id: string;
  note: string | null;
  position: number | null;
  added_at: string;
  bookmarks: {
    content_type: string;
    content_id: string;
    content_name: string;
  } | null;
}

interface PublicCollection {
  id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  updated_at: string;
  profiles: CollectionOwner | null;
  collection_items: CollectionItem[];
}

interface Props {
  collection: PublicCollection;
}

// ── Constants ─────────────────────────────────────────────────────────────

const CONTENT_META: Record<string, { label: string; color: string; href: (id: string) => string }> = {
  figure:   { label: 'Key Figure',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',    href: id => `/figures/${id}` },
  case:     { label: 'Case',        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300', href: id => `/cases/${id}` },
  document: { label: 'Document',    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300', href: id => `/documents/${id}` },
  program:  { label: 'Program',     color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300', href: id => `/programs/${id}` },
  timeline: { label: 'Event',       color: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',        href: _id => `/timeline` },
};

// ── Component ─────────────────────────────────────────────────────────────

export default function PublicCollectionPage({ collection }: Props) {
  const ownerName =
    collection.profiles?.display_name ??
    collection.profiles?.username ??
    'a DECUR user';

  const updatedDate = new Date(collection.updated_at).toLocaleDateString('en-US', {
    month: 'long', day: 'numeric', year: 'numeric',
  });

  const items = collection.collection_items ?? [];

  function handleCopyLink() {
    navigator.clipboard.writeText(window.location.href).catch(() => {});
  }

  return (
    <>
      <Head>
        <title>{collection.title} - DECUR Collection</title>
        <meta name="description" content={collection.description ?? `A DECUR research collection by ${ownerName}.`} />
        <meta property="og:title" content={`${collection.title} - DECUR`} />
        <meta property="og:description" content={collection.description ?? `A curated DECUR research collection.`} />
      </Head>

      <div className="container mx-auto px-4 py-10 max-w-3xl">
        {/* Back link */}
        <Link
          href="/data"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors mb-8"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Data
        </Link>

        {/* Collection header */}
        <div className="mb-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  Public Collection
                </span>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">{collection.title}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Curated by <span className="font-medium text-gray-700 dark:text-gray-300">{ownerName}</span>
                {' '}-{' '}
                {items.length} item{items.length !== 1 ? 's' : ''}
                {' '}-{' '}
                Updated {updatedDate}
              </p>
              {collection.description && (
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-300 max-w-prose">{collection.description}</p>
              )}
            </div>

            <button
              onClick={handleCopyLink}
              title="Copy link to clipboard"
              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:border-gray-400 dark:hover:border-gray-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              Copy link
            </button>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 mb-6" />

        {/* Items list */}
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <svg className="w-8 h-8 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">No items yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">This collection is empty.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-gray-800">
            {items.map(item => {
              const bm = item.bookmarks;
              if (!bm) return null;
              const meta = CONTENT_META[bm.content_type] ?? CONTENT_META.figure;
              return (
                <li key={item.id} className="py-3.5">
                  <div className="flex items-start gap-3">
                    <span className={`shrink-0 mt-0.5 px-2 py-0.5 rounded text-xs font-medium ${meta.color}`}>
                      {meta.label}
                    </span>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={meta.href(bm.content_id)}
                        className="text-sm font-medium text-gray-800 dark:text-gray-200 hover:text-primary dark:hover:text-primary-light transition-colors"
                      >
                        {bm.content_name}
                      </Link>
                      {item.note && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 italic">{item.note}</p>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 hidden sm:block mt-0.5">
                      {new Date(item.added_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        {/* Footer CTA */}
        <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            Explore more UAP/NHI research on DECUR
          </p>
          <Link
            href="/data"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
          >
            Browse the Archive
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}

// ── getServerSideProps ─────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps<Props> = async (context) => {
  const { id } = context.params as { id: string };

  // Use service-role client directly for public reads — no auth cookie needed.
  // RLS allows SELECT on public collections for everyone (is_public = TRUE).
  // We need the service role here only to include the nested profiles join
  // without hitting RLS restrictions on profiles (profiles are publicly readable).
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: collection, error } = await supabase
    .from('collections')
    .select(`
      id, title, description, is_public, updated_at,
      profiles!collections_user_id_fkey(display_name, username),
      collection_items(
        id, bookmark_id, note, position, added_at,
        bookmarks(content_type, content_id, content_name)
      )
    `)
    .eq('id', id)
    .single();

  if (error || !collection) {
    return { notFound: true };
  }

  if (!collection.is_public) {
    return { notFound: true };
  }

  // Sort items by position (nulls last), then by added_at
  const items = (collection.collection_items as unknown as CollectionItem[]).sort((a, b) => {
    if (a.position !== null && b.position !== null) return a.position - b.position;
    if (a.position !== null) return -1;
    if (b.position !== null) return 1;
    return new Date(a.added_at).getTime() - new Date(b.added_at).getTime();
  });

  return {
    props: {
      collection: {
        ...collection,
        profiles: collection.profiles as unknown as CollectionOwner | null,
        collection_items: items,
      } as PublicCollection,
    },
  };
};
