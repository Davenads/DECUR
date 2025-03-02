/**
 * Common shared interfaces used across multiple components
 */

/**
 * LinkItem represents a navigation link with optional icon and external flag
 */
export interface LinkItem {
  href: string;
  label: string;
  icon?: string;
  external?: boolean;
}

/**
 * MetaData for page head information
 */
export interface MetaData {
  title: string;
  description: string;
  keywords?: string[];
  canonical?: string;
  ogImage?: string;
}

/**
 * Generic response for any data fetching operations
 */
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}