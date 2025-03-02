import Link from 'next/link';
import { FC } from 'react';

const Footer: FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo and tagline */}
          <div>
            <Link href="/" className="text-xl font-bold">DECUR</Link>
            <p className="mt-2 text-gray-400 text-sm">
              Data Exceeding Current Understanding of Reality
            </p>
            <p className="mt-4 text-gray-400 text-sm">
              Documenting whistleblower testimony on UAP, NHI, and advanced technologies.
            </p>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-lg font-medium mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/data" className="text-gray-400 hover:text-white transition-colors">
                  Data
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-gray-400 hover:text-white transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>

          {/* Data categories */}
          <div>
            <h3 className="text-lg font-medium mb-4">Featured Whistleblowers</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/data" className="text-gray-400 hover:text-white transition-colors">
                  Dr. Dan Burisch
                </Link>
              </li>
              <li>
                <span className="text-gray-500">
                  David Grusch (Coming Soon)
                </span>
              </li>
              <li>
                <span className="text-gray-500">
                  Luis Elizondo (Coming Soon)
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} DECUR. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0">
            <Link href="/about" className="text-gray-400 hover:text-white text-sm mx-2">
              Privacy Policy
            </Link>
            <Link href="/about" className="text-gray-400 hover:text-white text-sm mx-2">
              Terms of Service
            </Link>
            <Link href="/about" className="text-gray-400 hover:text-white text-sm mx-2">
              Contact
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;