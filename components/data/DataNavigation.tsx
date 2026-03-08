import { FC } from 'react';
import { CategoryType } from '../../types/data';
import { DataNavigationProps } from '../../types/components';
import { getEntriesByCategory } from '../../lib/useTimelineData';

const NAV_ITEMS: { category: CategoryType; label: string; categories: string[]; description: string }[] = [
  {
    category: 'events',
    label: 'Historical Events',
    categories: ['famous-cases', 'sightings'],
    description: 'Famous cases & sightings',
  },
  {
    category: 'figures',
    label: 'Key Figures',
    categories: ['spotlight'],
    description: 'Researchers, officials & witnesses',
  },
  {
    category: 'quotes',
    label: 'Quotes',
    categories: ['quotes'],
    description: 'Notable statements',
  },
  {
    category: 'media',
    label: 'Media & Documents',
    categories: ['documentaries', 'books-documents'],
    description: 'Films, books & official docs',
  },
  {
    category: 'news',
    label: 'News',
    categories: ['news'],
    description: 'Reports & developments',
  },
];

const DataNavigation: FC<DataNavigationProps> = ({ activeCategory, setActiveCategory }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold font-heading mb-4">Data Categories</h2>
      <nav className="space-y-1">
        {NAV_ITEMS.map(item => {
          const count = getEntriesByCategory(item.categories).length;
          const isActive = activeCategory === item.category;
          return (
            <button
              key={item.category}
              onClick={() => setActiveCategory(item.category)}
              className={`w-full text-left px-3 py-3 rounded-lg transition-colors group ${
                isActive
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{item.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                }`}>
                  {count}
                </span>
              </div>
              <p className={`text-xs mt-0.5 ${isActive ? 'text-white/70' : 'text-gray-400'}`}>
                {item.description}
              </p>
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default DataNavigation;
