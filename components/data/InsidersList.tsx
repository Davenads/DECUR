import Link from 'next/link';
import { FC, useMemo, useState } from 'react';
import { InsiderEntry } from '../../types/data';
import { ps } from './shared/profileStyles';

type SortMode = 'alpha' | 'type';

const TYPE_ORDER: InsiderEntry['type'][] = ['insider', 'official', 'scientist', 'pilot', 'journalist', 'executive'];

interface InsidersListProps {
  entries: InsiderEntry[];
}

const InsidersList: FC<InsidersListProps> = ({ entries }) => {
  const [sortMode, setSortMode] = useState<SortMode>('alpha');

  const sorted = useMemo(() => {
    if (sortMode === 'alpha') {
      return [...entries].sort((a, b) => a.name.localeCompare(b.name));
    }
    return [...entries].sort((a, b) => {
      const ai = TYPE_ORDER.indexOf(a.type as InsiderEntry['type']);
      const bi = TYPE_ORDER.indexOf(b.type as InsiderEntry['type']);
      const typeDiff = (ai === -1 ? 99 : ai) - (bi === -1 ? 99 : bi);
      return typeDiff !== 0 ? typeDiff : a.name.localeCompare(b.name);
    });
  }, [entries, sortMode]);

  return (
    <div>
      <div className="mb-4">
        <h2 className="text-2xl font-bold font-heading text-gray-900 dark:text-gray-100 mb-1">Key Figures</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Individuals who have provided firsthand testimony regarding classified programs, extraterrestrial phenomena, and advanced technologies.
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

      <div className="grid gap-4">
        {sorted.map(entry => (
          <div
            key={entry.id}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-5 hover:border-primary hover:shadow-md transition-all group"
          >
            {/* Name row + button */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{entry.name}</h3>
                {entry.aliases.length > 0 && (
                  <span className="text-xs text-gray-400 italic">
                    aka {entry.aliases.join(', ')}
                  </span>
                )}
                {entry.status === 'stub' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                    Stub
                  </span>
                )}
              </div>
              <div className="flex-shrink-0">
                {entry.status === 'detailed' ? (
                  <Link
                    href={`/figures/${entry.id}`}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
                  >
                    View Case File
                  </Link>
                ) : (
                  <span className="px-4 py-2 text-sm font-medium text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-gray-700 rounded-lg whitespace-nowrap cursor-not-allowed">
                    Coming Soon
                  </span>
                )}
              </div>
            </div>

            {/* Full-width content below */}
            <p className="text-sm font-medium text-primary dark:text-primary-light mb-0.5">{entry.role}</p>
            <p className="text-xs text-gray-400 mb-3">
              {entry.period} · {entry.affiliation}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed mb-3">{entry.summary}</p>
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsidersList;
