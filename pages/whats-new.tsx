import { useState, useMemo } from 'react';
import Link from 'next/link';
import type { FC } from 'react';
import SeoHead from '../components/SeoHead';
import changelogData from '../data/changelog.json';

interface ChangelogEntry {
  date: string;
  category: 'figure' | 'case' | 'document' | 'program' | 'timeline' | 'quote';
  id: string;
  name: string;
  action: 'added' | 'updated';
  note: string;
}

const entries = changelogData as ChangelogEntry[];

const CATEGORY_CONFIG: Record<ChangelogEntry['category'], { label: string; color: string; href: (id: string) => string }> = {
  figure:   { label: 'Key Figure',  color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',     href: (id) => `/figures/${id}` },
  case:     { label: 'Case',        color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300', href: (id) => `/cases/${id}` },
  document: { label: 'Document',    color: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300', href: (id) => `/documents/${id}` },
  program:  { label: 'Program',     color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300', href: (id) => `/programs/${id}` },
  timeline: { label: 'Timeline',    color: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300',         href: () => '/timeline' },
  quote:    { label: 'Quote',       color: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',      href: () => '/data?category=quotes' },
};

const ACTION_CONFIG: Record<ChangelogEntry['action'], { label: string; color: string }> = {
  added:   { label: 'Added',   color: 'text-emerald-600 dark:text-emerald-400' },
  updated: { label: 'Updated', color: 'text-sky-600 dark:text-sky-400' },
};

const FILTER_OPTIONS: Array<{ value: ChangelogEntry['category'] | 'all'; label: string }> = [
  { value: 'all',      label: 'All' },
  { value: 'figure',   label: 'Key Figures' },
  { value: 'case',     label: 'Cases' },
  { value: 'document', label: 'Documents' },
  { value: 'program',  label: 'Programs' },
  { value: 'timeline', label: 'Timeline' },
  { value: 'quote',    label: 'Quotes' },
];

function groupByMonth(items: ChangelogEntry[]): Array<{ label: string; entries: ChangelogEntry[] }> {
  const groups = new Map<string, ChangelogEntry[]>();
  for (const entry of items) {
    const d = new Date(entry.date);
    const key = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(entry);
  }
  return Array.from(groups.entries()).map(([label, entries]) => ({ label, entries }));
}

const WhatsNew: FC = () => {
  const [activeFilter, setActiveFilter] = useState<ChangelogEntry['category'] | 'all'>('all');

  const filtered = useMemo(
    () => activeFilter === 'all' ? entries : entries.filter(e => e.category === activeFilter),
    [activeFilter]
  );

  const groups = useMemo(() => groupByMonth(filtered), [filtered]);

  return (
    <>
      <SeoHead
        title="What's New - DECUR"
        description="Recently added and updated profiles, cases, documents, and programs in the DECUR archive."
        path="/whats-new"
      />

      <div className="max-w-4xl mx-auto px-4 py-10 space-y-10">

        {/* Header */}
        <div className="border-b border-gray-200 dark:border-gray-700 pb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            What&apos;s New
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Recently added and updated profiles, cases, documents, and programs.
          </p>
        </div>

        {/* Category filter pills */}
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map(opt => {
            const isActive = activeFilter === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => setActiveFilter(opt.value)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Grouped entries */}
        {groups.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500 py-8 text-center">
            No entries for this category yet.
          </p>
        ) : (
          <div className="space-y-10">
            {groups.map(group => (
              <div key={group.label}>
                <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500 mb-4">
                  {group.label}
                </h2>
                <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900">
                  {group.entries.map((entry, i) => {
                    const cat = CATEGORY_CONFIG[entry.category];
                    const action = ACTION_CONFIG[entry.action];
                    return (
                      <Link
                        key={i}
                        href={cat.href(entry.id)}
                        className="flex flex-col sm:flex-row sm:items-start gap-1.5 sm:gap-4 px-3 sm:px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group"
                      >
                        {/* Top meta row: date + badges (stacked on mobile, sidebar on sm+) */}
                        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
                          <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 w-12 sm:w-16 font-mono">
                            {new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                          <div className="flex gap-1.5 shrink-0">
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase tracking-wide ${cat.color}`}>
                              {cat.label}
                            </span>
                            <span className={`text-[10px] font-semibold pt-0.5 ${action.color}`}>
                              {action.label}
                            </span>
                          </div>
                        </div>

                        {/* Content + arrow row */}
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 group-hover:text-primary dark:group-hover:text-primary-light transition-colors mb-0.5">
                              {entry.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                              {entry.note}
                            </p>
                          </div>

                          {/* Arrow */}
                          <div className="shrink-0 text-gray-300 dark:text-gray-600 group-hover:text-primary dark:group-hover:text-primary-light transition-colors pt-0.5">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </>
  );
};

export default WhatsNew;
