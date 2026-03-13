import { FC, useState } from 'react';
import { BurischData } from '../../../../types/data';
import burischData from '../../../../data/key-figures/burisch.json';

const data = burischData as BurischData;

const TimelineTab: FC = () => {
  const { timeline } = data;
  const categories = Array.from(new Set(timeline.map(e => e.category)));
  const [filter, setFilter] = useState<string>('all');

  const filtered = filter === 'all' ? timeline : timeline.filter(e => e.category === filter);

  const categoryColors: Record<string, string> = {
    biography: 'bg-blue-100 text-blue-700',
    operations: 'bg-red-100 text-red-700',
    'entity-contact': 'bg-purple-100 text-purple-700',
    documents: 'bg-amber-100 text-amber-700',
    research: 'bg-green-100 text-green-700',
    archive: 'bg-gray-100 text-gray-600',
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5">
        <button
          onClick={() => setFilter('all')}
          className={`text-xs px-2.5 py-1 rounded-full font-medium transition-colors ${
            filter === 'all' ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`text-xs px-2.5 py-1 rounded-full font-medium capitalize transition-colors ${
              filter === cat ? 'bg-primary text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {cat.replace(/-/g, ' ')}
          </button>
        ))}
      </div>

      <div className="relative pl-6 border-l-2 border-gray-100 space-y-4">
        {filtered.map((ev, i) => (
          <div key={i} className="relative">
            <div className="absolute -left-[1.65rem] top-1 w-3 h-3 rounded-full bg-primary border-2 border-white" />
            <div className="flex items-start gap-3">
              <span className="font-mono text-xs text-gray-400 whitespace-nowrap pt-0.5">{ev.date}</span>
              <div>
                <p className="text-sm text-gray-800 leading-relaxed">{ev.event}</p>
                <span className={`text-xs px-1.5 py-0.5 rounded mt-1 inline-block font-medium ${categoryColors[ev.category] ?? 'bg-gray-100 text-gray-500'}`}>
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
