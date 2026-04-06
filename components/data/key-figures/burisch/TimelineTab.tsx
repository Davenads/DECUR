import { FC, useState } from 'react';
import { BurischData } from '../../../../types/data';
import burischData from '../../../../data/key-figures/burisch.json';
import { ps } from '../../shared/profileStyles';

const data = burischData as BurischData;

const TimelineTab: FC = () => {
  const { timeline } = data;
  const categories = Array.from(new Set(timeline.map(e => e.category)));
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? timeline : timeline.filter(e => e.category === filter);

  const categoryColors: Record<string, string> = {
    biography: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    operations: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    'entity-contact': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300',
    documents: 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300',
    research: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    archive: 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter('all')}
          className={filter === 'all' ? ps.filterPillActive : ps.filterPill}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`${filter === cat ? ps.filterPillActive : ps.filterPill} capitalize`}
          >
            {cat.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      <div className={`${ps.timelineLine} space-y-4`}>
        {filtered.map((ev, i) => (
          <div key={i} className="relative">
            <div className={ps.timelineDot} />
            <div className="flex items-start gap-3">
              <span className="font-mono text-xs text-gray-400 whitespace-nowrap pt-0.5">{ev.date}</span>
              <div>
                <p className={`${ps.value} leading-relaxed`}>{ev.event}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded mt-1 inline-block font-medium ${categoryColors[ev.category] ?? 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'}`}>
                  {ev.category.replace(/-/g, ' ')}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineTab;
