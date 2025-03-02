'use client';

import { useState, useRef, useEffect, FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SearchBar from './SearchBar';
import { NavItem, NavSection, NavItems, DropdownRefs } from '../types/navigation';

interface HeaderProps {}

const Header: FC<HeaderProps> = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<DropdownRefs>({});
  const router = useRouter();

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown && dropdownRefs.current[activeDropdown] && 
          !dropdownRefs.current[activeDropdown]?.contains(event.target as Node)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeDropdown]);

  // Close dropdown when route changes
  useEffect(() => {
    setActiveDropdown(null);
    setIsMenuOpen(false);
  }, [router.pathname]);

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleDropdown = (dropdown: string): void => {
    setActiveDropdown(activeDropdown === dropdown ? null : dropdown);
  };

  const isActive = (path: string): boolean => router.pathname === path;
  
  // Navigation data structure for dropdowns
  const navItems: NavItems = {
    data: {
      title: 'Data',
      path: '/data',
      items: [
        { title: 'Non-Human Intelligence', path: '/data?category=entities' },
        { title: 'Advanced Technologies', path: '/data?category=technologies' },
        { title: 'Special Access Programs', path: '/data?category=programs' },
        { title: 'Whistleblowers', path: '/data?category=whistleblowers' }
      ]
    },
    resources: {
      title: 'Resources',
      path: '/resources',
      items: [
        { title: 'Primary Materials', path: '/resources?tab=materials' },
        { title: 'Transcripts', path: '/resources?tab=transcripts' },
        { title: 'Glossary', path: '/resources?tab=glossary' }
      ]
    }
  };

  return (
    <header className="bg-white shadow-md relative z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-heading font-bold text-primary">DECUR</span>
            <span className="hidden md:inline-block text-sm text-gray-500">
              Data Exceeding Current Understanding of Reality
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className={
                isActive('/') 
                  ? "text-primary font-medium border-b-2 border-primary pb-1" 
                  : "text-gray-600 hover:text-primary transition-colors"
              }
            >
              Home
            </Link>
            
            {/* Data Dropdown */}
            <div 
              className="relative" 
              ref={el => { dropdownRefs.current['data'] = el; return undefined; }}
            >
              <button
                className={`flex items-center space-x-1 ${
                  isActive('/data') 
                    ? "text-primary font-medium border-b-2 border-primary pb-1" 
                    : "text-gray-600 hover:text-primary transition-colors"
                }`}
                onClick={() => toggleDropdown('data')}
                aria-expanded={activeDropdown === 'data'}
                aria-haspopup="true"
              >
                <span>Data</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 transition-transform ${activeDropdown === 'data' ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Data Dropdown Menu */}
              {activeDropdown === 'data' && (
                <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {navItems.data.items.map((item, index) => (
                      <Link 
                        key={index}
                        href={item.path}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary"
                        role="menuitem"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {/* Resources Dropdown */}
            <div 
              className="relative"
              ref={el => { dropdownRefs.current['resources'] = el; return undefined; }}
            >
              <button
                className={`flex items-center space-x-1 ${
                  isActive('/resources') 
                    ? "text-primary font-medium border-b-2 border-primary pb-1" 
                    : "text-gray-600 hover:text-primary transition-colors"
                }`}
                onClick={() => toggleDropdown('resources')}
                aria-expanded={activeDropdown === 'resources'}
                aria-haspopup="true"
              >
                <span>Resources</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  className={`h-4 w-4 transition-transform ${activeDropdown === 'resources' ? 'transform rotate-180' : ''}`} 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Resources Dropdown Menu */}
              {activeDropdown === 'resources' && (
                <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {navItems.resources.items.map((item, index) => (
                      <Link 
                        key={index}
                        href={item.path}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary"
                        role="menuitem"
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <Link 
              href="/about" 
              className={
                isActive('/about') 
                  ? "text-primary font-medium border-b-2 border-primary pb-1" 
                  : "text-gray-600 hover:text-primary transition-colors"
              }
            >
              About
            </Link>
          </nav>

          {/* Search */}
          <div className="hidden md:block w-64">
            <SearchBar onSearch={(query) => console.log('Search:', query)} />
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-600 focus:outline-none" 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M6 18L18 6M6 6l12 12" 
                />
              ) : (
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 6h16M4 12h16M4 18h16" 
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link 
                href="/" 
                className={isActive('/') ? "text-primary font-medium" : "text-gray-600"}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              {/* Mobile Data Dropdown */}
              <div className="space-y-1">
                <button
                  className="flex items-center justify-between w-full text-left text-gray-600"
                  onClick={() => toggleDropdown('mobile-data')}
                >
                  <span className={isActive('/data') ? "text-primary font-medium" : ""}>Data</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 transition-transform ${activeDropdown === 'mobile-data' ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {activeDropdown === 'mobile-data' && (
                  <div className="pl-4 space-y-2 mt-2">
                    {navItems.data.items.map((item, index) => (
                      <Link 
                        key={index}
                        href={item.path}
                        className="block text-gray-500 hover:text-primary"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              {/* Mobile Resources Dropdown */}
              <div className="space-y-1">
                <button
                  className="flex items-center justify-between w-full text-left text-gray-600"
                  onClick={() => toggleDropdown('mobile-resources')}
                >
                  <span className={isActive('/resources') ? "text-primary font-medium" : ""}>Resources</span>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-4 w-4 transition-transform ${activeDropdown === 'mobile-resources' ? 'transform rotate-180' : ''}`} 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {activeDropdown === 'mobile-resources' && (
                  <div className="pl-4 space-y-2 mt-2">
                    {navItems.resources.items.map((item, index) => (
                      <Link 
                        key={index}
                        href={item.path}
                        className="block text-gray-500 hover:text-primary"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        {item.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              
              <Link 
                href="/about" 
                className={isActive('/about') ? "text-primary font-medium" : "text-gray-600"}
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              
              <div className="pt-2">
                <SearchBar onSearch={(query) => console.log('Mobile search:', query)} />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;