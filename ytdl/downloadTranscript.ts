import path from 'path';
import { downloadSubtitlesOnly } from './dlSubtitles';
import { importTranscript, saveTranscriptToPublic } from '../utils/transcriptImporter';

/**
 * Download and import a transcript from a YouTube URL
 * @param videoUrl YouTube video URL
 * @returns The path to the saved transcript in the public directory
 */
async function downloadAndImportTranscript(videoUrl: string): Promise<string> {
  try {
    console.log(`Starting process for: ${videoUrl}`);
    
    // Step 1: Download the video subtitles
    const jsonFilePath = await downloadSubtitlesOnly(videoUrl);
    console.log(`Downloaded transcript: ${jsonFilePath}`);
    
    // Step 2: Import the transcript into our data model
    const transcript = await importTranscript(jsonFilePath);
    console.log(`Imported transcript: ${transcript.title}`);
    
    // Step 3: Save the transcript to the public assets directory
    await saveTranscriptToPublic(transcript);
    console.log(`Transcript saved to public directory`);
    
    return jsonFilePath;
  } catch (error) {
    console.error(`Error in transcript download process: ${(error as Error).message}`);
    throw error;
  }
}

// Run the download process if this file is executed directly
if (require.main === module) {
  const args = process.argv.slice(2);
  const videoUrl = args[0];
  
  if (!videoUrl) {
    console.error('Please provide a YouTube URL as an argument');
    process.exit(1);
  }
  
  downloadAndImportTranscript(videoUrl)
    .then(path => {
      console.log(`Process completed successfully!`);
      process.exit(0);
    })
    .catch(error => {
      console.error(`Process failed: ${error.message}`);
      process.exit(1);
    });
}