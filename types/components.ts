/**
 * Component prop interfaces that are shared across multiple components
 */
import type { ReactNode } from 'react';
import { MetaData } from './common';
import { CategoryType } from './data';

/**
 * Layout component props
 */
export interface LayoutProps {
  children: ReactNode;
  title?: string;
  meta?: MetaData;
  className?: string;
}

/**
 * Data navigation props
 */
export interface DataNavigationProps {
  activeCategory: CategoryType;
  setActiveCategory: (category: CategoryType) => void;
}

/**
 * Props for tab-based components
 */
export interface TabProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: Array<{
    id: string;
    label: string;
  }>;
  className?: string;
}

/**
 * Props for search functionality
 */
export interface SearchProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  initialQuery?: string;
  className?: string;
}