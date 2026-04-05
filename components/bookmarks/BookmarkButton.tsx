import { useState, useEffect, FC } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../pages/_app';

interface BookmarkButtonProps {
  contentType: 'figure' | 'case' | 'document' | 'program' | 'timeline';
  contentId: string;
  contentName: string;
  /** Render as an icon-only button (default) or with a label */
  variant?: 'icon' | 'labeled';
  className?: string;
}

interface BookmarkState {
  bookmarked: boolean;
  bookmarkId: string | null;
  loading: boolean;
}

const BookmarkButton: FC<BookmarkButtonProps> = ({
  contentType,
  contentId,
  contentName,
  variant = 'icon',
  className = '',
}) => {
  const { user } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<BookmarkState>({
    bookmarked: false,
    bookmarkId: null,
    loading: true,
  });

  // On mount, check if this content is already bookmarked
  useEffect(() => {
    if (!user) {
      setState({ bookmarked: false, bookmarkId: null, loading: false });
      return;
    }

    let cancelled = false;
    fetch('/api/bookmarks')
      .then(r => r.json())
      .then(({ bookmarks }: { bookmarks: Array<{ id: string; content_type: string; content_id: string }> }) => {
        if (cancelled) return;
        const match = bookmarks?.find(
          b => b.content_type === contentType && b.content_id === contentId
        );
        setState({
          bookmarked: !!match,
          bookmarkId: match?.id ?? null,
          loading: false,
        });
      })
      .catch(() => setState(s => ({ ...s, loading: false })));

    return () => { cancelled = true; };
  }, [user, contentType, contentId]);

  async function handleClick() {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(router.asPath)}`);
      return;
    }

    // Optimistic update
    setState(s => ({ ...s, bookmarked: !s.bookmarked, loading: true }));

    try {
      const res = await fetch('/api/bookmarks/toggle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content_type: contentType, content_id: contentId, content_name: contentName }),
      });

      if (!res.ok) throw new Error('Failed');

      const { bookmarked, bookmark } = await res.json() as {
        bookmarked: boolean;
        bookmark: { id: string } | null;
      };

      setState({
        bookmarked,
        bookmarkId: bookmark?.id ?? null,
        loading: false,
      });
    } catch {
      // Revert optimistic update on error
      setState(s => ({ ...s, bookmarked: !s.bookmarked, loading: false }));
    }
  }

  const label = state.bookmarked ? 'Saved' : 'Save';
  const title = state.bookmarked ? 'Remove from saved items' : 'Save to profile';

  if (variant === 'labeled') {
    return (
      <button
        onClick={handleClick}
        disabled={state.loading}
        title={title}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
          ${state.bookmarked
            ? 'bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary-light'
            : 'bg-gray-100 text-gray-600 hover:bg-primary/10 hover:text-primary dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-primary/20 dark:hover:text-primary-light'
          }
          disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        <BookmarkIcon filled={state.bookmarked} className="w-4 h-4" />
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      disabled={state.loading}
      title={title}
      aria-label={title}
      className={`p-1.5 rounded-md transition-colors
        ${state.bookmarked
          ? 'text-primary dark:text-primary-light'
          : 'text-gray-400 hover:text-primary dark:text-gray-500 dark:hover:text-primary-light'
        }
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      <BookmarkIcon filled={state.bookmarked} className="w-5 h-5" />
    </button>
  );
};

function BookmarkIcon({ filled, className }: { filled: boolean; className?: string }) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M5 4a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 20V4z" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
    </svg>
  );
}

export default BookmarkButton;
