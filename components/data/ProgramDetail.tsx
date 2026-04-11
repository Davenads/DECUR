import { FC, useState } from 'react';
import Link from 'next/link';
import { ProgramEntry } from '../../types/data';
import ProfileTabBar from './shared/ProfileTabBar';
import BookmarkButton from '../bookmarks/BookmarkButton';
import { ps } from './shared/profileStyles';

/* ─── Status badge config ───────────────────────────────────────── */

const STATUS_CONFIG: Record<ProgramEntry['status'], { label: string; classes: string }> = {
  'active':      { label: 'Active',      classes: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
  'defunct':     { label: 'Defunct',     classes: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300' },
  'classified':  { label: 'Classified',  classes: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
  'unknown':     { label: 'Unknown',     classes: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' },
};

const TYPE_CONFIG: Record<ProgramEntry['type'], string> = {
  'project':      'Project',
  'organization': 'Organization',
  'study':        'Study',
};

/* ─── Tabs ──────────────────────────────────────────────────────── */

const PROGRAM_TABS = [
  { id: 'overview',     label: 'Overview' },
  { id: 'timeline',     label: 'Timeline' },
  { id: 'connections',  label: 'Connections' },
  { id: 'sources',      label: 'Sources' },
] as const;

type ProgramTabId = typeof PROGRAM_TABS[number]['id'];

/* ─── Tab sub-components ────────────────────────────────────────── */

const OverviewTab: FC<{ p: ProgramEntry }> = ({ p }) => {
  const status = STATUS_CONFIG[p.status];
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={ps.infoCard}>
          <p className={ps.label}>Type</p>
          <p className={ps.value}>{TYPE_CONFIG[p.type]}</p>
        </div>
        <div className={ps.infoCard}>
          <p className={ps.label}>Status</p>
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.classes}`}>{status.label}</span>
        </div>
        <div className={ps.infoCard}>
          <p className={ps.label}>Active Period</p>
          <p className={ps.monoValue}>{p.active_period}</p>
        </div>
        <div className={`${ps.infoCard} sm:col-span-1`}>
          <p className={ps.label}>Parent Organization</p>
          <p className={ps.value}>{p.parent_org}</p>
        </div>
      </div>

      <div>
        <h3 className={`${ps.h3} mb-2`}>Summary</h3>
        <p className={ps.body}>{p.summary}</p>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg p-4">
        <p className="text-xs font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide mb-1">Significance</p>
        <p className="text-sm text-blue-900 dark:text-blue-100 leading-relaxed">{p.significance}</p>
      </div>

      {p.key_personnel.length > 0 && (
        <div>
          <h3 className={`${ps.h3} mb-3`}>Key Personnel</h3>
          <div className="space-y-2">
            {p.key_personnel.map((person, i) => (
              <div key={i} className={`${ps.borderCard} flex items-start gap-3`}>
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{person.name.charAt(0)}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{person.name}</p>
                  <p className={ps.muted}>{person.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {p.limitations.length > 0 && (
        <div>
          <h3 className={`${ps.h3} mb-3`}>Limitations & Caveats</h3>
          <ul className="space-y-2">
            {p.limitations.map((lim, i) => (
              <li key={i} className={`${ps.borderCard} flex gap-2`}>
                <span className="text-amber-400 mt-0.5 shrink-0 font-bold">!</span>
                <span className={`${ps.body} leading-relaxed`}>{lim}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Blue Book cases index link - only show for project-blue-book */}
      {p.id === 'project-blue-book' && (
        <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg">
          <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
            Unidentified Cases Archive
          </p>
          <p className="text-sm text-amber-800 dark:text-amber-300 mb-3">
            558 cases classified as Unidentified, verified by NICAP independent review.
          </p>
          <a
            href="/blue-book"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 dark:text-amber-400 hover:text-amber-900 dark:hover:text-amber-200 transition-colors"
          >
            Browse the full index
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      )}
    </div>
  );
};

const TimelineTab: FC<{ p: ProgramEntry }> = ({ p }) => (
  <div className="space-y-4">
    <p className={ps.muted}>Key events in the history of {p.name}.</p>
    <div className={ps.timelineLine}>
      {p.key_events.map((ev, i) => (
        <div key={i} className="relative pl-6 pb-6 last:pb-0">
          <div className={`${ps.timelineDot} absolute -left-[5px] top-1`} />
          <p className="font-mono text-xs font-bold text-primary mb-0.5">{ev.year}</p>
          <p className={ps.body}>{ev.event}</p>
        </div>
      ))}
    </div>
  </div>
);

const ConnectionsTab: FC<{ p: ProgramEntry }> = ({ p }) => (
  <div className="space-y-6">
    {p.connected_figures.length > 0 && (
      <div>
        <h3 className={`${ps.h3} mb-3`}>Connected Figures</h3>
        <div className="flex flex-wrap gap-2">
          {p.connected_figures.map((figId, i) => (
            <Link
              key={i}
              href={`/figures/${figId}`}
              className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium hover:bg-primary/20 transition-colors"
            >
              {figId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </Link>
          ))}
        </div>
      </div>
    )}

    {p.connected_documents.length > 0 && (
      <div>
        <h3 className={`${ps.h3} mb-3`}>Connected Documents</h3>
        <div className="space-y-2">
          {p.connected_documents.map((docId, i) => (
            <Link key={i} href={`/documents/${docId}`} className={`${ps.borderCard} flex items-center gap-2 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all group`}>
              <span className="text-xs text-gray-400 font-mono group-hover:text-primary transition-colors">DOC</span>
              <span className={`${ps.body} group-hover:text-primary transition-colors`}>{docId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
            </Link>
          ))}
        </div>
      </div>
    )}

    {p.connected_figures.length === 0 && p.connected_documents.length === 0 && (
      <div className="text-center py-10">
        <p className={ps.muted}>No documented connections recorded.</p>
      </div>
    )}
  </div>
);

const SourcesTab: FC<{ p: ProgramEntry }> = ({ p }) => (
  <div className="space-y-3">
    <p className={ps.muted}>References and source materials for {p.name}.</p>
    {p.sources.map((src, i) => (
      <div key={i} className={ps.borderCard}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{src.title}</p>
            <p className={ps.muted}>{src.type}</p>
          </div>
          {src.url && (
            <a
              href={src.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline shrink-0"
            >
              View
            </a>
          )}
        </div>
      </div>
    ))}
  </div>
);

/* ─── ProgramDetail (exported) ──────────────────────────────────── */

export interface ProgramDetailProps {
  p: ProgramEntry;
  onBack: () => void;
  backLabel?: string;
  networkNodeId?: string;
}

const ProgramDetail: FC<ProgramDetailProps> = ({ p, onBack, backLabel = 'Programs', networkNodeId }) => {
  const [activeTab, setActiveTab] = useState<ProgramTabId>('overview');
  const status = STATUS_CONFIG[p.status];

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab p={p} />;
      case 'timeline':    return <TimelineTab p={p} />;
      case 'connections': return <ConnectionsTab p={p} />;
      case 'sources':     return <SourcesTab p={p} />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={onBack}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ← {backLabel}
          </button>
          {networkNodeId && (
            <Link
              href={`/explore?node=${networkNodeId}#relationship-network`}
              className="text-xs text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary transition-colors"
            >
              View in Network →
            </Link>
          )}
        </div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-100 leading-snug">{p.name}</h2>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.classes}`}>{status.label}</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {TYPE_CONFIG[p.type]}
              </span>
              <span className="text-xs text-gray-400">{p.active_period}</span>
            </div>
          </div>
          <BookmarkButton contentType="program" contentId={p.id} contentName={p.name} />
        </div>
      </div>

      <ProfileTabBar
        tabs={PROGRAM_TABS as unknown as Array<{ id: string; label: string }>}
        activeTab={activeTab}
        onTabChange={(id) => setActiveTab(id as ProgramTabId)}
      />

      <div>{renderTab()}</div>
    </div>
  );
};

export default ProgramDetail;
