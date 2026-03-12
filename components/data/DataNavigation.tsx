import { FC } from 'react';
import { DataNavigationProps, NavItemDef } from '../../types/components';

interface ExtendedProps extends DataNavigationProps {
  navItems: NavItemDef[];
}

const DataNavigation: FC<ExtendedProps> = ({ activeCategory, setActiveCategory, navItems }) => {
  return (
    <div className="bg-white dark:bg-gray-800 dark:shadow-gray-900/50 rounded-lg shadow-md p-4">
      <h2 className="text-xl font-bold font-heading mb-4">Data Categories</h2>
      <nav className="space-y-1">
        {navItems.map(item => {
          const isActive = activeCategory === item.category;
          return (
            <button
              key={item.category}
              onClick={() => setActiveCategory(item.category)}
              className={`w-full text-left px-3 py-3 rounded-lg transition-colors group ${
                isActive ? 'bg-primary text-white' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm">{item.label}</span>
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                  isActive ? 'bg-white/20 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 group-hover:bg-gray-200 dark:group-hover:bg-gray-600'
                }`}>
                  {item.count}
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
