import Link from 'next/link';
import { FC, useMemo, useState } from 'react';
import { ProgramEntry } from '../../types/data';
import { ps } from './shared/profileStyles';

type SortMode = 'alpha' | 'type';

const TYPE_ORDER: ProgramEntry['type'][] = ['project', 'organization'];

const STATUS_BADGE: Record<ProgramEntry['status'], string> = {
  'active':     'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  'defunct':    'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400',
  'classified': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  'unknown':    'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
};

interface ProgramsListProps {
  programs: ProgramEntry[];
}

const ProgramsList: FC<ProgramsListProps> = ({ programs }) => {
  const [sortMode, setSortMode] = useState<SortMode>('alpha');

  const sorted = useMemo(() => {
    if (sortMode === 'alpha') {
      return [...programs].sort((a, b) => a.name.localeCompare(b.name));
    }
    return [...programs].sort((a, b) => {
      const ai = TYPE_ORDER.indexOf(a.type);
      const bi = TYPE_ORDER.indexOf(b.type);
      const typeDiff = ai - bi;
      return typeDiff !== 0 ? typeDiff : a.name.localeCompare(b.name);
    });
  }, [programs, sortMode]);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-100 mb-1">Government Programs</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Official government and private organization programs involved in UAP investigation, research, and disclosure.
        </p>
      </div>

      <div className="flex items-center gap-2 mb-5">
        <span className="text-xs text-gray-400 mr-1">Sort:</span>
        {(['alpha', 'type'] as SortMode[]).map(mode => (
          <button
            key={mode}
            onClick={() => setSortMode(mode)}
            className={sortMode === mode ? ps.filterPillActive : ps.filterPill}
          >
            {mode === 'alpha' ? 'A-Z' : 'By Type'}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {sorted.map(p => (
          <Link key={p.id} href={`/programs/${p.id}`} className="block group">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors">
                      {p.name}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_BADGE[p.status]}`}>
                      {p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 capitalize">
                      {p.type}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-2">{p.active_period} - {p.parent_org}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{p.summary}</p>
                </div>
                <span className="text-primary text-sm opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  View &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default ProgramsList;
