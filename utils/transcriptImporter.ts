import fs from 'fs-extra';
import path from 'path';
import { 
  Transcript, 
  TranscriptContent, 
  ExtendedTranscript 
} from '../types/transcripts';

/**
 * Import a transcript JSON file and convert it to an ExtendedTranscript
 * @param jsonFilePath Path to the transcript JSON file
 * @returns ExtendedTranscript object
 */
export async function importTranscript(jsonFilePath: string): Promise<ExtendedTranscript> {
  try {
    // Read the JSON file
    const fileContent = await fs.readFile(jsonFilePath, 'utf8');
    const transcriptData = JSON.parse(fileContent) as TranscriptContent;
    
    // Extract metadata from the transcript
    const { metadata } = transcriptData;
    
    // Generate a description from the first 200 characters of content
    const previewText = transcriptData.content
      .map(segment => segment.text)
      .join(' ')
      .substring(0, 200) + '...';
      
    // Create an ExtendedTranscript object
    const extendedTranscript: ExtendedTranscript = {
      id: path.basename(jsonFilePath, '.json'), // Use filename as ID
      title: metadata.title,
      date: metadata.uploadDate,
      description: previewText,
      url: `/assets/documents/transcripts/${path.basename(jsonFilePath)}`,
      category: 'whistleblowers', // Default category
      sourceUrl: metadata.source,
      extractionDate: metadata.extractionDate,
      duration: metadata.duration,
      fullContent: transcriptData
    };
    
    // Optionally parse interviewer from title or metadata
    const interviewMatch = metadata.title.match(/.+Interview.+?([A-Za-z\s]+)$/i);
    if (interviewMatch && interviewMatch[1]) {
      extendedTranscript.interviewer = interviewMatch[1].trim();
    }
    
    return extendedTranscript;
  } catch (error) {
    console.error(`Error importing transcript: ${(error as Error).message}`);
    throw new Error(`Failed to import transcript: ${(error as Error).message}`);
  }
}

/**
 * Import all transcripts from a directory
 * @param directoryPath Path to the directory containing transcript JSON files
 * @returns Array of ExtendedTranscript objects
 */
export async function importAllTranscripts(directoryPath: string): Promise<ExtendedTranscript[]> {
  try {
    // Get all JSON files in the directory
    const files = await fs.readdir(directoryPath);
    const jsonFiles = files.filter(file => file.endsWith('.json'));
    
    // Import each transcript
    const transcripts = await Promise.all(
      jsonFiles.map(file => importTranscript(path.join(directoryPath, file)))
    );
    
    return transcripts;
  } catch (error) {
    console.error(`Error importing transcripts: ${(error as Error).message}`);
    return [];
  }
}

/**
 * Save an ExtendedTranscript to the public assets directory
 * @param transcript ExtendedTranscript object
 * @param publicDir Path to the public directory
 */
export async function saveTranscriptToPublic(
  transcript: ExtendedTranscript, 
  publicDir: string = 'public'
): Promise<void> {
  try {
    // Define the transcripts directory
    const transcriptsDir = path.join(publicDir, 'assets', 'documents', 'transcripts');
    
    // Ensure the directory exists
    await fs.ensureDir(transcriptsDir);
    
    // Create a filename based on the title
    const safeFilename = transcript.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .substring(0, 50);
      
    const jsonFilePath = path.join(transcriptsDir, `${safeFilename}.json`);
    
    // Save the full transcript JSON
    await fs.writeFile(
      jsonFilePath, 
      JSON.stringify(transcript, null, 2), 
      'utf8'
    );
    
    console.log(`Transcript saved to: ${jsonFilePath}`);
  } catch (error) {
    console.error(`Error saving transcript: ${(error as Error).message}`);
    throw new Error(`Failed to save transcript: ${(error as Error).message}`);
  }
}