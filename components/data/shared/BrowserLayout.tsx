import { FC, ReactNode, ChangeEvent } from 'react';

interface SelectFilter {
  value: string;
  onChange: (val: string) => void;
  options: Array<{ value: string; label: string }>;
}

interface BrowserLayoutProps {
  title: string;
  description: string;
  searchValue: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  filters?: SelectFilter[];
  /** Optional content rendered to the right of the results count (e.g. sort button) */
  headerExtra?: ReactNode;
  resultCount: number;
  children: ReactNode;
}

const SearchIcon: FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const BrowserLayout: FC<BrowserLayoutProps> = ({
  title,
  description,
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  filters = [],
  headerExtra,
  resultCount,
  children,
}) => {
  return (
    <div>
      <h2 className="text-2xl font-bold font-heading mb-2 text-gray-900 dark:text-gray-100">{title}</h2>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-6">{description}</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e: ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
            className="w-full px-4 py-2 pl-9 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <SearchIcon />
        </div>

        {filters.map((filter, i) => (
          <select
            key={i}
            value={filter.value}
            onChange={e => filter.onChange(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {filter.options.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        ))}
      </div>

      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-gray-400 dark:text-gray-500">{resultCount} results</p>
        {headerExtra}
      </div>

      {children}
    </div>
  );
};

export default BrowserLayout;
