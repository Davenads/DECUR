import { FC } from 'react';

interface Tab {
  readonly id: string;
  readonly label: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ProfileTabBarProps {
  tabs: readonly Tab[];
  activeTab: string;
  onTabChange: (id: any) => void;
}

const ProfileTabBar: FC<ProfileTabBarProps> = ({ tabs, activeTab, onTabChange }) => (
  <div className="flex gap-1 flex-wrap mb-6 border-b border-gray-200 dark:border-gray-700 pb-0">
    {tabs.map(tab => (
      <button
        key={tab.id}
        onClick={() => onTabChange(tab.id)}
        className={`px-3 py-2 text-xs font-medium rounded-t-lg transition-colors whitespace-nowrap border-b-2 -mb-px ${
          activeTab === tab.id
            ? 'border-primary text-primary bg-primary/5'
            : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
        }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

export default ProfileTabBar;
