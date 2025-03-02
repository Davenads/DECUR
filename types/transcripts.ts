/**
 * Transcript related types
 */

import { DataItem } from './data';

/**
 * Basic transcript metadata
 */
export interface Transcript {
  id: number;
  title: string;
  interviewer?: string;
  date: string;
  description: string;
  url: string;
}

/**
 * Detailed transcript metadata from YouTube
 */
export interface TranscriptMetadata {
  title: string;
  source: string;
  uploadDate: string;
  extractionDate: string;
  duration: string;
  channel: string;
  subtitleType: string;
}

/**
 * Individual transcript segment with timestamp
 */
export interface TranscriptSegment {
  timestamp: {
    start: string;
    end: string;
  };
  text: string;
}

/**
 * Complete transcript content structure
 */
export interface TranscriptContent {
  metadata: TranscriptMetadata;
  content: TranscriptSegment[];
}

/**
 * Extended transcript that can be used in the data model
 */
export interface ExtendedTranscript extends DataItem, Transcript {
  fullContent?: TranscriptContent;
  sourceUrl: string;
  extractionDate: string;
  duration: string;
}