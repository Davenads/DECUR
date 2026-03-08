import { useMemo } from 'react';
import rawEntries from '../data/ufotimeline.json';

export interface TimelineEntry {
  id: number;
  date: string;
  year: number;
  title: string;
  excerpt: string;
  content?: string;
  categories: string[];
  source_url: string;
}

const entries = rawEntries as TimelineEntry[];

export function useTimelineData(categories?: string[]): TimelineEntry[] {
  return useMemo(() => {
    if (!categories || categories.length === 0) return entries;
    return entries.filter(e => e.categories.some(c => categories.includes(c)));
  }, [categories]);
}

export function getAllEntries(): TimelineEntry[] {
  return entries;
}

export function getEntriesByCategory(categories: string[]): TimelineEntry[] {
  return entries.filter(e => e.categories.some(c => categories.includes(c)));
}
