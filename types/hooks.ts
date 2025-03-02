/**
 * Type definitions for custom hooks
 */
import { DataItem, CategoryType } from './data';

/**
 * Options for the useData hook
 */
export interface UseDataOptions {
  category?: CategoryType;
  limit?: number;
  sortBy?: keyof DataItem;
  filter?: (item: DataItem) => boolean;
}

/**
 * Return type for the useData hook
 */
export interface UseDataResult {
  data: DataItem[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
}

/**
 * Options for the useFilters hook
 */
export interface UseFiltersOptions {
  initialFilters?: Record<string, string | string[] | boolean>;
  onChange?: (filters: Record<string, any>) => void;
}

/**
 * Return type for the useFilters hook
 */
export interface UseFiltersResult {
  filters: Record<string, any>;
  setFilter: (key: string, value: any) => void;
  removeFilter: (key: string) => void;
  clearFilters: () => void;
  hasFilters: boolean;
}