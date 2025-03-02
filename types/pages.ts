/**
 * Page-specific types for the application
 */
import type { NextPage } from 'next';
import { MetaData } from './common';

/**
 * Extends NextPage with custom properties
 */
export type CustomNextPage<P = {}> = NextPage<P> & {
  getLayout?: (page: React.ReactElement) => React.ReactNode;
};

/**
 * Home page props
 */
export interface HomePageProps {
  featuredData?: any[];
  recentUpdates?: any[];
}

/**
 * Data page props
 */
export interface DataPageProps {
  initialCategory?: string;
  filters?: {
    [key: string]: string | string[];
  };
}

/**
 * Resources page props
 */
export interface ResourcesPageProps {
  initialTab?: string;
  resources?: any[];
}

/**
 * About page props
 */
export interface AboutPageProps {
  meta?: MetaData;
}