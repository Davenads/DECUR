import Link from 'next/link';
import { FC, useEffect, useState } from 'react';

const Footer: FC = () => {
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-gray-100 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700/60">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and tagline */}
          <div>
            <Link href="/" className="text-xl font-bold text-gray-900 dark:text-white">DECUR</Link>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
              Documenting insider testimony on UAP, NHI, and advanced technologies.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/data" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors duration-200">
                  Data
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors duration-200">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors duration-200">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Explore */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wide mb-4">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/timeline" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors duration-200">
                  Timeline
                </Link>
              </li>
              <li>
                <Link href="/explore" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors duration-200">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/search" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors duration-200">
                  Search
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            &copy; {currentYear} DECUR. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <Link href="/sources" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white mx-2 transition-colors duration-200">
              Data Sources
            </Link>
            <Link href="/about" className="text-sm text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-white mx-2 transition-colors duration-200">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;