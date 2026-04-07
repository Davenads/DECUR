import { FC, useEffect, useRef, useState, FormEvent } from 'react';

interface CollectionEntry {
  id: string;
  title: string;
  has_bookmark: boolean;
  collection_items: [{ count: number }] | [];
}

interface CollectionPickerProps {
  bookmarkId: string;
  onClose: () => void;
  /** Called when a new collection is created so the parent can update its list */
  onCollectionCreated?: (col: { id: string; title: string }) => void;
}

const CollectionPicker: FC<CollectionPickerProps> = ({ bookmarkId, onClose, onCollectionCreated }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [collections, setCollections]   = useState<CollectionEntry[]>([]);
  const [loading, setLoading]           = useState(true);
  const [saving, setSaving]             = useState<string | null>(null); // collectionId being toggled
  const [showCreate, setShowCreate]     = useState(false);
  const [newTitle, setNewTitle]         = useState('');
  const [creating, setCreating]         = useState(false);
  const [createError, setCreateError]   = useState<string | null>(null);

  // Close on click-outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  // Fetch collections with membership info
  useEffect(() => {
    fetch(`/api/collections?include_bookmark=${encodeURIComponent(bookmarkId)}`)
      .then(r => r.json())
      .then(({ collections: data }) => {
        setCollections(data ?? []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [bookmarkId]);

  function getCount(col: CollectionEntry): number {
    return Array.isArray(col.collection_items)
      ? (col.collection_items[0] as { count: number } | undefined)?.count ?? 0
      : 0;
  }

  async function handleToggle(col: CollectionEntry) {
    if (saving) return;
    setSaving(col.id);

    const adding = !col.has_bookmark;

    // Optimistic update
    setCollections(prev =>
      prev.map(c =>
        c.id === col.id
          ? {
              ...c,
              has_bookmark: adding,
              collection_items: [{ count: getCount(c) + (adding ? 1 : -1) }] as [{ count: number }],
            }
          : c
      )
    );

    if (adding) {
      const res = await fetch(`/api/collections/${col.id}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmark_id: bookmarkId }),
      });
      if (!res.ok) {
        // Revert on error
        setCollections(prev =>
          prev.map(c =>
            c.id === col.id
              ? { ...c, has_bookmark: false, collection_items: [{ count: getCount(c) - 1 }] as [{ count: number }] }
              : c
          )
        );
      }
    } else {
      const res = await fetch(
        `/api/collections/${col.id}/items?bookmark_id=${encodeURIComponent(bookmarkId)}`,
        { method: 'DELETE' }
      );
      if (!res.ok) {
        // Revert on error
        setCollections(prev =>
          prev.map(c =>
            c.id === col.id
              ? { ...c, has_bookmark: true, collection_items: [{ count: getCount(c) + 1 }] as [{ count: number }] }
              : c
          )
        );
      }
    }

    setSaving(null);
  }

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    setCreating(true);
    setCreateError(null);

    // Create collection
    const createRes = await fetch('/api/collections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.trim() }),
    });
    const createJson = await createRes.json() as { collection?: { id: string; title: string }; error?: string };

    if (!createRes.ok || !createJson.collection) {
      setCreateError(createJson.error ?? 'Failed to create collection.');
      setCreating(false);
      return;
    }

    const newCol = createJson.collection;

    // Add the bookmark to the new collection
    await fetch(`/api/collections/${newCol.id}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookmark_id: bookmarkId }),
    });

    // Append to local list as already-checked
    setCollections(prev => [
      { id: newCol.id, title: newCol.title, has_bookmark: true, collection_items: [{ count: 1 }] },
      ...prev,
    ]);

    onCollectionCreated?.(newCol);
    setNewTitle('');
    setShowCreate(false);
    setCreating(false);
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-8 z-50 w-64 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b border-gray-100 dark:border-gray-800">
        <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
          Add to collection
        </p>
        <button
          onClick={onClose}
          className="p-0.5 rounded text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Collection list */}
      <div className="max-h-52 overflow-y-auto py-1">
        {loading ? (
          <div className="px-3 py-4 space-y-2">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-6 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
            ))}
          </div>
        ) : collections.length === 0 ? (
          <p className="px-3 py-4 text-xs text-gray-400 dark:text-gray-500 text-center">
            No collections yet
          </p>
        ) : (
          collections.map(col => {
            const count = getCount(col);
            const isSaving = saving === col.id;
            return (
              <label
                key={col.id}
                className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={col.has_bookmark}
                  onChange={() => handleToggle(col)}
                  disabled={!!saving}
                  className="rounded border-gray-300 dark:border-gray-600 text-primary focus:ring-primary/50 shrink-0"
                />
                <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">
                  {col.title}
                </span>
                {isSaving ? (
                  <div className="w-3 h-3 border border-primary border-t-transparent rounded-full animate-spin shrink-0" />
                ) : (
                  <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0">
                    {count}
                  </span>
                )}
              </label>
            );
          })
        )}
      </div>

      {/* New collection quick-create */}
      <div className="border-t border-gray-100 dark:border-gray-800">
        {showCreate ? (
          <form onSubmit={handleCreate} className="px-3 py-2.5 space-y-2">
            {createError && (
              <p className="text-xs text-red-500">{createError}</p>
            )}
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              placeholder="Collection name"
              autoFocus
              className="w-full px-2.5 py-1.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
            />
            <div className="flex gap-1.5">
              <button
                type="submit"
                disabled={creating || !newTitle.trim()}
                className="flex-1 px-3 py-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-medium rounded-lg transition-colors disabled:opacity-60"
              >
                {creating ? 'Creating...' : 'Create & add'}
              </button>
              <button
                type="button"
                onClick={() => { setShowCreate(false); setNewTitle(''); setCreateError(null); }}
                className="px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 w-full px-3 py-2.5 text-xs text-primary hover:text-primary-dark dark:text-primary-light transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New collection
          </button>
        )}
      </div>
    </div>
  );
};

export default CollectionPicker;
