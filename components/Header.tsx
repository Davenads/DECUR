'use client';

import { useState, useRef, useEffect, FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useTheme } from 'next-themes';
import SearchBar from './SearchBar';
import NavDropdown from './navigation/NavDropdown';
import MobileNavDropdown from './navigation/MobileNavDropdown';
import UserMenu from './auth/UserMenu';
import { NavItems, DropdownRefs } from '../types/navigation';

const navItems: NavItems = {
  data: {
    title: 'Data',
    path: '/data',
    items: [
      { title: 'Historical Events', path: '/data?category=events' },
      { title: 'Key Figures', path: '/data?category=key-figures' },
      { title: 'Cases', path: '/data?category=cases' },
      { title: 'Quotes', path: '/data?category=quotes' },
      { title: 'Media', path: '/data?category=media' },
      { title: 'Documents', path: '/data?category=documents' },
      { title: 'Programs', path: '/data?category=programs' },
      { title: 'News', path: '/data?category=news' },
      { title: 'Collections', path: '/collections' },
      { title: "What's New", path: '/whats-new' },
      { title: 'Compare Figures', path: '/compare' },
      { title: 'Search & Filter', path: '/search' },
    ],
  },
  resources: {
    title: 'Resources',
    path: '/resources',
    items: [
      { title: 'Primary Sources', path: '/resources?tab=sources' },
      { title: 'Testimony & Interviews', path: '/resources?tab=testimony' },
      { title: 'Glossary', path: '/resources?tab=glossary' },
    ],
  },
};

const exploreLink = { href: '/explore', label: 'Explore' };
const timelineLink = { href: '/timeline', label: 'Timeline' };
const sightingsLink = { href: '/sightings', label: 'Sightings' };
const aboutLink = { href: '/about', label: 'About' };

const Header: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mounted, setMounted] = useState<boolean>(false);
  const dropdownRefs = useRef<DropdownRefs>({});
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        activeDropdown &&
        dropdownRefs.current[activeDropdown] &&
        !dropdownRefs.current[activeDropdown]?.contains(event.target as Node)
      ) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeDropdown]);

  useEffect(() => {
    setActiveDropdown(null);
    setIsMenuOpen(false);
  }, [router.pathname]);

  const toggleDropdown = (key: string): void => {
    setActiveDropdown(activeDropdown === key ? null : key);
  };

  const isActive = (path: string): boolean => router.pathname === path;

  const handleSearch = (query: string): void => {
    router.push(`/search?q=${encodeURIComponent(query)}`);
  };

  return (
    <header className="sticky top-0 z-[60] bg-white/85 dark:bg-gray-900/85 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-700/60">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-heading font-bold text-gray-900 dark:text-gray-100">DECUR</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className={
                isActive('/')
                  ? 'text-primary font-medium border-b-2 border-primary pb-1'
                  : 'text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light transition-colors'
              }
            >
              Home
            </Link>

            <Link
              href={exploreLink.href}
              className={
                isActive(exploreLink.href)
                  ? 'text-primary font-medium border-b-2 border-primary pb-1'
                  : 'text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light transition-colors'
              }
            >
              {exploreLink.label}
            </Link>

            <NavDropdown
              id="data"
              title="Data"
              items={navItems.data.items}
              isActive={isActive('/data')}
              isOpen={activeDropdown === 'data'}
              onToggle={() => toggleDropdown('data')}
              dropdownRef={el => { dropdownRefs.current['data'] = el; }}
            />

            <Link
              href={timelineLink.href}
              className={
                isActive(timelineLink.href)
                  ? 'text-primary font-medium border-b-2 border-primary pb-1'
                  : 'text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light transition-colors'
              }
            >
              {timelineLink.label}
            </Link>

            <Link
              href={sightingsLink.href}
              className={
                isActive(sightingsLink.href)
                  ? 'text-primary font-medium border-b-2 border-primary pb-1'
                  : 'text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light transition-colors'
              }
            >
              {sightingsLink.label}
            </Link>

            <NavDropdown
              id="resources"
              title="Resources"
              items={navItems.resources.items}
              isActive={isActive('/resources')}
              isOpen={activeDropdown === 'resources'}
              onToggle={() => toggleDropdown('resources')}
              dropdownRef={el => { dropdownRefs.current['resources'] = el; }}
            />

            <Link
              href={aboutLink.href}
              className={
                isActive(aboutLink.href)
                  ? 'text-primary font-medium border-b-2 border-primary pb-1'
                  : 'text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light transition-colors'
              }
            >
              {aboutLink.label}
            </Link>
          </nav>

          {/* Search */}
          <div className="hidden md:block w-64">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center">
            <UserMenu />
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="p-2 rounded-md text-gray-600 hover:text-primary hover:bg-gray-100 dark:text-gray-400 dark:hover:text-primary-light dark:hover:bg-gray-800 transition-colors"
          >
            {mounted && theme === 'dark' ? (
              /* Sun icon */
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 5a7 7 0 100 14 7 7 0 000-14z" />
              </svg>
            ) : (
              /* Moon icon */
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 dark:text-gray-400 focus:outline-none"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
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
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200 dark:border-gray-700 pt-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className={isActive('/') ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-400'}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>

              <Link
                href={exploreLink.href}
                className={isActive(exploreLink.href) ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-400'}
                onClick={() => setIsMenuOpen(false)}
              >
                {exploreLink.label}
              </Link>

              <MobileNavDropdown
                title="Data"
                items={navItems.data.items}
                isActive={isActive('/data')}
                isOpen={activeDropdown === 'mobile-data'}
                onToggle={() => toggleDropdown('mobile-data')}
                onItemClick={() => setIsMenuOpen(false)}
              />

              <Link
                href={timelineLink.href}
                className={isActive(timelineLink.href) ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-400'}
                onClick={() => setIsMenuOpen(false)}
              >
                {timelineLink.label}
              </Link>

              <Link
                href={sightingsLink.href}
                className={isActive(sightingsLink.href) ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-400'}
                onClick={() => setIsMenuOpen(false)}
              >
                {sightingsLink.label}
              </Link>

              <MobileNavDropdown
                title="Resources"
                items={navItems.resources.items}
                isActive={isActive('/resources')}
                isOpen={activeDropdown === 'mobile-resources'}
                onToggle={() => toggleDropdown('mobile-resources')}
                onItemClick={() => setIsMenuOpen(false)}
              />

              <Link
                href={aboutLink.href}
                className={isActive(aboutLink.href) ? 'text-primary font-medium' : 'text-gray-600 dark:text-gray-400'}
                onClick={() => setIsMenuOpen(false)}
              >
                {aboutLink.label}
              </Link>

              <div className="pt-2">
                <SearchBar onSearch={handleSearch} />
              </div>

              <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                <UserMenu />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
