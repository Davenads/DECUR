import { FC } from 'react';
import Link from 'next/link';
import { NavItem } from '../../types/navigation';

interface MobileNavDropdownProps {
  title: string;
  items: NavItem[];
  isActive: boolean;
  isOpen: boolean;
  onToggle: () => void;
  onItemClick: () => void;
}

const MobileNavDropdown: FC<MobileNavDropdownProps> = ({ title, items, isActive, isOpen, onToggle, onItemClick }) => (
  <div className="space-y-1">
    <button
      className="flex items-center justify-between w-full text-left text-gray-600"
      onClick={onToggle}
    >
      <span className={isActive ? 'text-primary font-medium' : ''}>{title}</span>
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
      <div className="pl-4 space-y-2 mt-2">
        {items.map((item, index) => (
          <Link
            key={index}
            href={item.path}
            className="block text-gray-500 hover:text-primary"
            onClick={onItemClick}
          >
            {item.title}
          </Link>
        ))}
      </div>
    )}
  </div>
);

export default MobileNavDropdown;
