import Head from 'next/head';
import Link from 'next/link';
import type { GetServerSideProps, NextPage } from 'next';

// ── Types ──────────────────────────────────────────────────────────────────

interface CollectionSummary {
  id: string;
  title: string;
  description: string | null;
  updated_at: string;
  item_count: number;
  owner_name: string;
}

interface Props {
  collections: CollectionSummary[];
}

// ── Component ──────────────────────────────────────────────────────────────

const CollectionsIndexPage: NextPage<Props> = ({ collections }) => {
  return (
    <>
      <Head>
        <title>Research Collections - DECUR</title>
        <meta
          name="description"
          content="Community-curated research collections on DECUR - bundles of related figures, cases, documents, and programs."
        />
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

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 mb-2">
            Research Collections
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-prose">
            Community-curated bundles of related figures, cases, documents, and programs. Collections are created and shared by DECUR users.
          </p>
        </div>

        {/* Collections list */}
        {collections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <svg className="w-10 h-10 text-gray-300 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            <p className="text-base font-medium text-gray-700 dark:text-gray-300 mb-1">No public collections yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 max-w-sm">
              Public collections will appear here once users share them. Sign in to create your own.
            </p>
            <Link
              href="/auth/login"
              className="mt-5 inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
            >
              Sign in
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {collections.map(col => {
              const updatedDate = new Date(col.updated_at).toLocaleDateString('en-US', {
                month: 'long', day: 'numeric', year: 'numeric',
              });
              return (
                <Link
                  key={col.id}
                  href={`/collections/${col.id}`}
                  className="block border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-primary hover:shadow-sm transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          Public
                        </span>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {col.item_count} item{col.item_count !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors leading-snug">
                        {col.title}
                      </h2>
                      {col.description && (
                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-snug">
                          {col.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                        By <span className="font-medium text-gray-600 dark:text-gray-400">{col.owner_name}</span>
                        {' '}- Updated {updatedDate}
                      </p>
                    </div>
                    <svg className="h-5 w-5 text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Footer CTA */}
        {collections.length > 0 && (
          <div className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
              Sign in to create and share your own research collections.
            </p>
            <Link
              href="/auth/login"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary-dark text-white text-sm font-medium rounded-lg transition-colors"
            >
              Sign in
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default CollectionsIndexPage;

// ── getServerSideProps ─────────────────────────────────────────────────────

export const getServerSideProps: GetServerSideProps<Props> = async () => {
  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(
    process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data: rows, error } = await supabase
    .from('collections')
    .select(`
      id, title, description, updated_at,
      profiles!collections_user_id_fkey(display_name, username),
      collection_items(id)
    `)
    .eq('is_public', true)
    .order('updated_at', { ascending: false })
    .limit(20);

  if (error || !rows) {
    return { props: { collections: [] } };
  }

  const collections: CollectionSummary[] = rows.map(row => {
    const profile = (row.profiles as unknown) as { display_name: string | null; username: string | null } | null;
    const items = row.collection_items as Array<{ id: string }> | null;
    return {
      id: row.id as string,
      title: row.title as string,
      description: (row.description as string | null) ?? null,
      updated_at: row.updated_at as string,
      item_count: items?.length ?? 0,
      owner_name: profile?.display_name ?? profile?.username ?? 'a DECUR user',
    };
  });

  return { props: { collections } };
};
