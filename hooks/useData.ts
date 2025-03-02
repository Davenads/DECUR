import { useState, useEffect } from 'react';
import { DataItem } from '../types/data';

/**
 * Options for the useData hook
 */
interface UseDataOptions {
  category?: string;
  limit?: number;
  sortBy?: keyof DataItem;
  filter?: (item: DataItem) => boolean;
}

/**
 * Hook for fetching and filtering data
 */
export function useData(options: UseDataOptions = {}): {
  data: DataItem[];
  loading: boolean;
  error: Error | null;
  refresh: () => void;
} {
  const [data, setData] = useState<DataItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Function to refetch data (useful for when filters change)
  const refresh = () => {
    fetchData();
  };

  // Simulated data fetching function
  const fetchData = async () => {
    try {
      setLoading(true);
      // In a real app, this would be an API call
      // For now, we'll use a timeout to simulate network latency
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate data response
      let result = MOCK_DATA;
      
      // Apply category filter if provided
      if (options.category) {
        result = result.filter(item => item.category === options.category);
      }
      
      // Apply custom filter if provided
      if (options.filter) {
        result = result.filter(options.filter);
      }
      
      // Apply sorting if provided
      if (options.sortBy) {
        const sortBy = options.sortBy as keyof DataItem;
        result = [...result].sort((a, b) => {
          const aValue = a[sortBy] ?? '';
          const bValue = b[sortBy] ?? '';
          if (aValue < bValue) return -1;
          if (aValue > bValue) return 1;
          return 0;
        });
      }
      
      // Apply limit if provided
      if (options.limit && options.limit > 0) {
        result = result.slice(0, options.limit);
      }
      
      setData(result);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [options.category, options.limit, options.sortBy]);

  return { data, loading, error, refresh };
}

// Mock data for development
const MOCK_DATA: DataItem[] = [
  {
    id: 'entity-p45',
    title: 'P-45 J-Rods',
    category: 'entities',
    description: 'Future humans from Timeline 2, approximately 45,000 years in the future.',
    date: '2023-08-10',
    tags: ['j-rod', 'future human', 'timeline-2']
  },
  {
    id: 'entity-p52',
    title: 'P-52 J-Rods',
    category: 'entities',
    description: 'Future humans from Timeline 1, approximately 52,000 years in the future.',
    date: '2023-08-15',
    tags: ['j-rod', 'future human', 'timeline-1']
  },
  {
    id: 'tech-looking-glass',
    title: 'Looking Glass Technology',
    category: 'timelines',
    description: 'Technology capable of viewing probable future timelines.',
    date: '2023-07-22',
    tags: ['technology', 'temporal viewing', 'ganesh particle']
  },
  {
    id: 'project-lotus',
    title: 'Project Lotus',
    category: 'lotus',
    description: 'Special access program studying interactions with non-human intelligence.',
    date: '2023-09-01',
    tags: ['project', 'classified', 'majestic']
  }
];