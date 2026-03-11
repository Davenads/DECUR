'use client';

import { useState, useRef, useEffect, FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import SearchBar from './SearchBar';
import NavDropdown from './navigation/NavDropdown';
import MobileNavDropdown from './navigation/MobileNavDropdown';
import { NavItems, DropdownRefs } from '../types/navigation';

const navItems: NavItems = {
  data: {
    title: 'Data',
    path: '/data',
    items: [
      { title: 'Historical Events', path: '/data?category=events' },
      { title: 'Key Figures', path: '/data?category=figures' },
      { title: 'Insiders', path: '/data?category=insiders' },
      { title: 'Quotes', path: '/data?category=quotes' },
      { title: 'Media & Documents', path: '/data?category=media' },
      { title: 'News', path: '/data?category=news' },
    ],
  },
  resources: {
    title: 'Resources',
    path: '/resources',
    items: [
      { title: 'Primary Materials', path: '/resources?tab=materials' },
      { title: 'Transcripts', path: '/resources?tab=transcripts' },
      { title: 'Glossary', path: '/resources?tab=glossary' },
    ],
  },
};

const simpleLinks = [
  { href: '/timeline', label: 'Timeline' },
  { href: '/explore', label: 'Explore' },
  { href: '/about', label: 'About' },
];

const Header: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const dropdownRefs = useRef<DropdownRefs>({});
  const router = useRouter();

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
    <header className="bg-white shadow-md relative z-30">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-heading font-bold text-gray-900">DECUR</span>
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
                  ? 'text-primary font-medium border-b-2 border-primary pb-1'
                  : 'text-gray-600 hover:text-primary transition-colors'
              }
            >
              Home
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

            <NavDropdown
              id="resources"
              title="Resources"
              items={navItems.resources.items}
              isActive={isActive('/resources')}
              isOpen={activeDropdown === 'resources'}
              onToggle={() => toggleDropdown('resources')}
              dropdownRef={el => { dropdownRefs.current['resources'] = el; }}
            />

            {simpleLinks.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={
                  isActive(href)
                    ? 'text-primary font-medium border-b-2 border-primary pb-1'
                    : 'text-gray-600 hover:text-primary transition-colors'
                }
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Search */}
          <div className="hidden md:block w-64">
            <SearchBar onSearch={handleSearch} />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-600 focus:outline-none"
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
          <div className="md:hidden mt-4 pb-4">
            <div className="flex flex-col space-y-4">
              <Link
                href="/"
                className={isActive('/') ? 'text-primary font-medium' : 'text-gray-600'}
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>

              <MobileNavDropdown
                title="Data"
                items={navItems.data.items}
                isActive={isActive('/data')}
                isOpen={activeDropdown === 'mobile-data'}
                onToggle={() => toggleDropdown('mobile-data')}
                onItemClick={() => setIsMenuOpen(false)}
              />

              <MobileNavDropdown
                title="Resources"
                items={navItems.resources.items}
                isActive={isActive('/resources')}
                isOpen={activeDropdown === 'mobile-resources'}
                onToggle={() => toggleDropdown('mobile-resources')}
                onItemClick={() => setIsMenuOpen(false)}
              />

              {simpleLinks.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className={isActive(href) ? 'text-primary font-medium' : 'text-gray-600'}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {label}
                </Link>
              ))}

              <div className="pt-2">
                <SearchBar onSearch={handleSearch} />
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
