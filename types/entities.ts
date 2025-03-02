/**
 * Entity-related types for the EntityProfiles component
 */

/**
 * Types of entities in the system
 */
export type EntityType = 'p45' | 'p52' | 'orions' | 'other';

/**
 * Data structure for entity information
 */
export interface EntityData {
  id: string;
  name: string;
  description: string;
  characteristics: string[];
  society: string;
  notes: string;
  origin?: string;
  timeline?: string;
  images?: string[];
  references?: {
    title: string;
    source: string;
    url?: string;
  }[];
}

/**
 * Map of entity data by entity type
 */
export interface EntitiesData {
  [key: string]: EntityData;
}

/**
 * Props for the EntityProfiles component
 */
export interface EntityProfilesProps {
  initialEntity?: EntityType;
  showReferences?: boolean;
  className?: string;
}