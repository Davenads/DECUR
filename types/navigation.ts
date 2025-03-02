/**
 * Navigation related types used in Header and navigation components
 */

/**
 * Represents a navigation item in the header
 */
export interface NavItem {
  title: string;
  path: string;
  isExternal?: boolean;
  icon?: string;
}

/**
 * Represents a navigation section with dropdown items
 */
export interface NavSection {
  title: string;
  path: string;
  items: NavItem[];
}

/**
 * Map of navigation sections used in the header
 */
export interface NavItems {
  [key: string]: NavSection;
}

/**
 * References to dropdown elements for handling click outside
 */
export interface DropdownRefs {
  [key: string]: HTMLDivElement | null;
}