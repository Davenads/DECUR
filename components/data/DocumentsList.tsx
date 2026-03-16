import { FC, useMemo, useState } from 'react';
import { DocumentEntry } from '../../types/data';
import { ps } from './shared/profileStyles';
import DocumentDetail, { authConfig, AuthStatus } from './shared/DocumentDetail';

/* ─── Documents list view ──────────────────────────────────────── */

type DocSortMode = 'date' | 'alpha';

interface DocumentsListProps {
  documents: DocumentEntry[];
}

const DocumentsList: FC<DocumentsListProps> = ({ documents }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<DocSortMode>('date');

  const sorted = useMemo(() => {
    if (sortMode === 'alpha') return [...documents].sort((a, b) => a.name.localeCompare(b.name));
    return [...documents].sort((a, b) => a.date.localeCompare(b.date));
  }, [documents, sortMode]);

  const selected = documents.find(d => d.id === selectedId) ?? null;

  if (selected) {
    return <DocumentDetail d={selected} onBack={() => setSelectedId(null)} />;
  }

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-100 mb-1">Primary Documents</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Official government records, declassified intelligence reports, and foundational source documents - annotated for provenance, authenticity, and significance.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs text-gray-400 mr-1">Sort:</span>
        {(['date', 'alpha'] as DocSortMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setSortMode(mode)}
            className={sortMode === mode ? ps.filterPillActive : ps.filterPill}
          >
            {mode === 'date' ? 'By Date' : 'A-Z'}
          </button>
        ))}
      </div>

      {/* Auth legend */}
      <div className="flex flex-wrap gap-2 mb-6 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
        {(Object.keys(authConfig) as AuthStatus[]).map(k => (
          <span key={k} className={`text-xs px-2 py-0.5 rounded-full font-medium ${authConfig[k].classes}`}>
            {authConfig[k].label}
          </span>
        ))}
      </div>

      <div className="grid gap-4">
        {sorted.map(d => {
          const auth = authConfig[d.authenticity_status];
          return (
            <div
              key={d.id}
              className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-primary hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-2 flex-wrap">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 leading-snug">{d.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedId(d.id)}
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap shrink-0"
                >
                  View Document
                </button>
              </div>

              <p className="text-xs font-medium text-primary mb-0.5">{d.issuing_authority}</p>
              <p className="text-xs text-gray-400 mb-2">
                {d.date} · {d.page_count} pages
              </p>

              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${auth.classes}`}>{auth.label}</span>
                {d.insider_connections.length > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                    {d.insider_connections.length} insider connection{d.insider_connections.length !== 1 ? 's' : ''}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3">{d.summary}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentsList;
