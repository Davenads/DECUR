import { FC } from 'react';
import Link from 'next/link';
import { NavItem } from '../../types/navigation';

interface NavDropdownProps {
  id: string;
  title: string;
  items: NavItem[];
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
  dropdownRef: (el: HTMLDivElement | null) => void;
}

const NavDropdown: FC<NavDropdownProps> = ({ id, title, items, isActive, isOpen, onToggle, dropdownRef }) => (
  <div
    className="relative"
    ref={dropdownRef}
  >
    <button
      className={`flex items-center space-x-1 ${
        isActive
          ? 'text-primary font-medium border-b-2 border-primary pb-1'
          : 'text-gray-600 hover:text-primary dark:text-gray-400 dark:hover:text-primary-light transition-colors'
      }`}
      onClick={onToggle}
      aria-expanded={isOpen}
      aria-haspopup="true"
    >
      <span>{title}</span>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className={`h-4 w-4 transition-transform ${isOpen ? 'transform rotate-180' : ''}`}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>

    {isOpen && (
      <div className="absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 dark:ring-gray-700 focus:outline-none z-50">
        <div className="py-1" role="menu" aria-orientation="vertical">
          {items.map((item, index) => (
            <Link
              key={index}
              href={item.path}
              className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-primary dark:hover:text-primary-light"
              role="menuitem"
            >
              {item.title}
            </Link>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default NavDropdown;
