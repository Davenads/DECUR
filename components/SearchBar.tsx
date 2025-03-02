'use client';

import { useState, FormEvent, ChangeEvent, FC } from 'react';
import { useRouter } from 'next/router';
import { SearchProps } from '../types/components';

const SearchBar: FC<SearchProps> = ({ 
  placeholder = 'Search DECUR...',
  onSearch = () => {},
  initialQuery = '',
  className = ''
}) => {
  const [searchQuery, setSearchQuery] = useState<string>(initialQuery);
  const _router = useRouter(); // Keeping for future implementation

  const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    // Call the onSearch function passed as a prop
    onSearch(searchQuery);
    // In a real app, this would also navigate to search results page
    console.log('Searching for:', searchQuery);
    // router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setSearchQuery(e.target.value);
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <input
        type="text"
        placeholder={placeholder}
        value={searchQuery}
        onChange={handleChange}
        className="w-full pl-10 pr-4 py-2 text-sm bg-gray-100 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>
    </form>
  );
};

export default SearchBar;