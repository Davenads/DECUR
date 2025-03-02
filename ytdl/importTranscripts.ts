import path from 'path';
import fs from 'fs-extra';
import { importAllTranscripts, saveTranscriptToPublic } from '../utils/transcriptImporter';

/**
 * Import all transcripts from the subtitle_dls directory
 * and save them to the public assets directory
 */
async function importAllDownloadedTranscripts(): Promise<void> {
  try {
    // Define the transcript source directory
    const sourceDir = path.join(process.cwd(), 'ytdl', 'subtitle_dls');
    
    // Ensure the directory exists
    if (!await fs.pathExists(sourceDir)) {
      console.error(`Source directory does not exist: ${sourceDir}`);
      return;
    }
    
    // Import all transcripts
    console.log(`Importing transcripts from: ${sourceDir}`);
    const transcripts = await importAllTranscripts(sourceDir);
    
    if (transcripts.length === 0) {
      console.log('No transcripts found to import.');
      return;
    }
    
    console.log(`Found ${transcripts.length} transcripts to import.`);
    
    // Save each transcript to the public directory
    for (const transcript of transcripts) {
      await saveTranscriptToPublic(transcript);
      console.log(`Imported: ${transcript.title}`);
    }
    
    console.log('Import process completed successfully!');
  } catch (error) {
    console.error(`Import process failed: ${(error as Error).message}`);
  }
}

// Run the import process if this file is executed directly
if (require.main === module) {
  importAllDownloadedTranscripts()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error(`Process failed: ${error.message}`);
      process.exit(1);
    });
}