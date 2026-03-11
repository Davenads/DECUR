/**
 * Server-side data utilities for ufotimeline data.
 * Use these in getStaticProps only -- do NOT import in client components.
 */
import rawEntries from '../data/ufotimeline.json';
import aodQuotes  from '../data/aod-quotes-platform.json';

export interface TimelineEntry {
  id: number;
  date: string;
  year: number;
  title: string;
  excerpt: string;
  categories: string[];
  source_url: string;
  source?: string;
  article_url?: string | null;
  article_type?: 'article' | 'video' | null;
  quote_text?: string | null;
  quote_attribution?: string | null;
  topic?: string | null;
  timestamp?: string | null;
}

// Merge ufotimeline entries with AoD quotes
const entries = [
  ...(rawEntries as TimelineEntry[]),
  ...(aodQuotes  as TimelineEntry[]),
];

export function getAllEntries(): TimelineEntry[] {
  return entries;
}

export function getEntriesByCategory(categories: string[]): TimelineEntry[] {
  return entries.filter(e => e.categories.some(c => categories.includes(c)));
}

export function getCategoryCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  entries.forEach(e => {
    e.categories.forEach(c => {
      counts[c] = (counts[c] || 0) + 1;
    });
  });
  return counts;
}
