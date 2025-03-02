/**
 * Data related types used in data components
 */

/**
 * Represents data category types
 */
export type CategoryType = 'entities' | 'timelines' | 'lotus' | 'whistleblowers';

/**
 * Expanded sections state for data navigation
 */
export interface ExpandedSections {
  entities: boolean;
  technologies: boolean;
  programs: boolean;
  whistleblowers: boolean;
}

/**
 * Represents a generic data item
 */
export interface DataItem {
  id: string;
  title: string;
  category: CategoryType;
  description?: string;
  date?: string;
  source?: string;
  tags?: string[];
}

/**
 * Entity profile data
 */
export interface EntityProfile extends DataItem {
  type: string;
  origin?: string;
  abilities?: string[];
  timeline?: string;
  appearance?: string;
  interactions?: string[];
  images?: string[];
}

/**
 * Timeline concept data
 */
export interface TimelineConcept extends DataItem {
  timeframe: string;
  implications?: string[];
  relatedTechnologies?: string[];
}

/**
 * Lotus finding data
 */
export interface LotusFinding extends DataItem {
  projectPhase?: string;
  participants?: string[];
  outcomes?: string[];
  relatedPrograms?: string[];
}