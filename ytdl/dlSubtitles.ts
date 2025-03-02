import { execSync } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { promises as fsPromises } from 'fs';

// Define types for transcript data
interface TranscriptMetadata {
  title: string;
  source: string;
  uploadDate: string;
  extractionDate: string;
  duration: string;
  channel: string;
  subtitleType: string;
}

interface TranscriptSegment {
  timestamp: {
    start: string;
    end: string;
  };
  text: string;
}

interface TranscriptContent {
  metadata: TranscriptMetadata;
  content: TranscriptSegment[];
}

// Configuration
const ROOT_DIR = process.cwd();
const SUBTITLE_OUTPUT_DIR = path.join(ROOT_DIR, 'ytdl', 'subtitle_dls');
const YT_DLP_PATH = path.join(ROOT_DIR, 'ytdl', 'yt-dlp'); // For Linux/Mac
// const YT_DLP_PATH = path.join(ROOT_DIR, 'ytdl', 'yt-dlp.exe'); // For Windows
const COOKIES_PATH = path.join(ROOT_DIR, 'ytdl', 'cookies.txt');

// Ensure directory exists
fs.ensureDirSync(SUBTITLE_OUTPUT_DIR);

/**
 * Downloads subtitles from a YouTube video and processes them
 * @param videoUrl The YouTube video URL
 * @returns Path to the saved transcript file
 */
async function downloadSubtitlesOnly(videoUrl: string): Promise<string> {
  try {
    console.log(`Downloading subtitles from: ${videoUrl}`);

    // Get metadata with better error handling
    let videoTitle: string, videoUploader: string, videoUploadDateRaw: string, videoDuration: string;
    
    try {
      videoTitle = execSync(`"${YT_DLP_PATH}" --get-title --cookies "${COOKIES_PATH}" "${videoUrl}"`, {
        stdio: ['pipe', 'pipe', 'pipe']
      }).toString().trim();
      
      videoUploader = execSync(`"${YT_DLP_PATH}" --print "%(uploader)s" --cookies "${COOKIES_PATH}" "${videoUrl}"`, {
        stdio: ['pipe', 'pipe', 'pipe']
      }).toString().trim();
      
      videoUploadDateRaw = execSync(`"${YT_DLP_PATH}" --print "%(upload_date)s" --cookies "${COOKIES_PATH}" "${videoUrl}"`, {
        stdio: ['pipe', 'pipe', 'pipe']
      }).toString().trim();
      
      videoDuration = execSync(`"${YT_DLP_PATH}" --get-duration --cookies "${COOKIES_PATH}" "${videoUrl}"`, {
        stdio: ['pipe', 'pipe', 'pipe']
      }).toString().trim();
    } catch (metadataError) {
      console.error(`Failed to fetch video metadata: ${(metadataError as Error).message}`);
      throw new Error(`Failed to fetch video metadata: ${(metadataError as Error).message}`);
    }
    
    const subtitleType = "Auto-Generated"; // Assuming auto-subtitles

    // Format upload date (from YYYYMMDD to readable format)
    const videoUploadDate = `${videoUploadDateRaw.substring(0,4)}-${videoUploadDateRaw.substring(4,6)}-${videoUploadDateRaw.substring(6,8)}`;

    // Download only the subtitles
    console.log(`Downloading subtitles for: ${videoTitle}`);
    execSync(`"${YT_DLP_PATH}" --cookies "${COOKIES_PATH}" --write-auto-sub --sub-lang en --sub-format vtt --skip-download --output "${SUBTITLE_OUTPUT_DIR}/%(title)s.%(ext)s" "${videoUrl}"`, { stdio: 'inherit' });

    console.log('Subtitles downloaded successfully!');

    // Find the .vtt file - handle filenames with special characters
    const files = await fsPromises.readdir(SUBTITLE_OUTPUT_DIR);
    const vttFile = files.find(file => 
      file.includes(videoTitle.substring(0, Math.min(20, videoTitle.length))) && 
      file.endsWith('.en.vtt')
    );
    
    if (!vttFile) {
      throw new Error(`No matching VTT file found for: ${videoTitle}`);
    }
    
    const vttFilePath = path.join(SUBTITLE_OUTPUT_DIR, vttFile);
    console.log(`Found subtitle file: ${vttFilePath}`);
    
    // Create output filenames
    const txtFilePath = vttFilePath.replace('.vtt', '.txt');
    const jsonFilePath = vttFilePath.replace('.en.vtt', '.json');
    
    // Read and clean up VTT subtitles
    console.log(`Processing subtitles: ${vttFile}`);
    const rawSubtitles = await fsPromises.readFile(vttFilePath, 'utf8');
    
    // Process VTT content
    const { cleanedSubtitles, segments } = processVTTContent(rawSubtitles);

    // Prepare metadata
    const extractionDate = new Date().toISOString().split('T')[0];
    const metadata: TranscriptMetadata = {
      title: videoTitle,
      source: videoUrl,
      uploadDate: videoUploadDate,
      subtitleType: subtitleType,
      extractionDate: extractionDate,
      duration: videoDuration,
      channel: videoUploader
    };

    // Prepare metadata block for text file
    const metadataText = `Title: ${videoTitle}
Source: ${videoUrl}
Uploaded: ${videoUploadDate}
Subtitle Type: ${subtitleType}
Extracted: ${extractionDate}
Duration: ${videoDuration}
Channel: ${videoUploader}

-------------------------------
`;

    // Create structured transcript content
    const transcriptContent: TranscriptContent = {
      metadata: metadata,
      content: segments
    };

    // Save as both TXT and JSON
    await fsPromises.writeFile(txtFilePath, metadataText + cleanedSubtitles, 'utf8');
    await fsPromises.writeFile(jsonFilePath, JSON.stringify(transcriptContent, null, 2), 'utf8');
    
    console.log(`Transcript saved as TXT: ${txtFilePath}`);
    console.log(`Transcript saved as JSON: ${jsonFilePath}`);
    
    return jsonFilePath;
  } catch (error) {
    console.error('Error downloading subtitles:', error);
    throw error;
  }
}

/**
 * Process VTT content by extracting text content
 * @param vttContent The raw VTT content as string
 * @returns Cleaned subtitles and structured segments
 */
function processVTTContent(vttContent: string): { cleanedSubtitles: string; segments: TranscriptSegment[] } {
  try {
    // Split the VTT content into blocks by double newlines
    const blocks = vttContent
      .replace(/WEBVTT[\s\S]*?\n\n/, '') // Remove WEBVTT header
      .split('\n\n')
      .filter(block => block.trim());

    // Process each block
    const processedLines: string[] = [];
    const segments: TranscriptSegment[] = [];
    let previousText = '';

    for (const block of blocks) {
      const lines = block.split('\n').filter(line => line.trim());
      if (lines.length < 2) continue;
      
      // Get timestamp line
      const timestampLine = lines[0];
      const timestampMatch = timestampLine.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
      if (!timestampMatch) continue;
      
      // Format the timestamp
      const startTime = timestampMatch[1];
      const endTime = timestampMatch[2];
      const formattedTimestamp = `[${formatTimestamp(startTime)}-${formatTimestamp(endTime)}]`;
      
      // Extract text content
      const textContent = lines.slice(1)
        .join(' ')
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .trim();
      
      // Skip if there's no text
      if (!textContent) continue;
      
      // Check if this text is a continuation or repetition
      if (isContinuationOrRepetition(previousText, textContent)) {
        // Update the end time for the existing entry
        if (processedLines.length > 0 && segments.length > 0) {
          // Extract non-repeated text
          const uniqueText = extractUniqueText(previousText, textContent);
          
          if (uniqueText.trim()) {
            // If unique text exists, append it to the previous entry
            const lastLine = processedLines[processedLines.length - 1];
            const lastTimestamp = lastLine.substring(0, lastLine.indexOf(']') + 1);
            const lastText = lastLine.substring(lastLine.indexOf(']') + 1).trim();
            
            // Update the end time in the timestamp
            const updatedTimestamp = updateTimestamp(lastTimestamp, endTime);
            
            // Combine the text
            processedLines[processedLines.length - 1] = `${updatedTimestamp} ${lastText}${uniqueText.startsWith(' ') ? uniqueText : ' ' + uniqueText}`;
            
            // Update the segment
            const lastSegment = segments[segments.length - 1];
            lastSegment.timestamp.end = formatTimestamp(endTime);
            lastSegment.text = `${lastText}${uniqueText.startsWith(' ') ? uniqueText : ' ' + uniqueText}`;
          } else {
            // Just update the timestamp's end time
            const lastLine = processedLines[processedLines.length - 1];
            const lastTimestamp = lastLine.substring(0, lastLine.indexOf(']') + 1);
            const lastText = lastLine.substring(lastLine.indexOf(']') + 1).trim();
            
            // Update the end time in the timestamp
            const updatedTimestamp = updateTimestamp(lastTimestamp, endTime);
            processedLines[processedLines.length - 1] = `${updatedTimestamp} ${lastText}`;
            
            // Update the segment end time
            segments[segments.length - 1].timestamp.end = formatTimestamp(endTime);
          }
        }
      } else {
        // New entry
        processedLines.push(`${formattedTimestamp} ${textContent}`);
        
        // Add new segment
        segments.push({
          timestamp: {
            start: formatTimestamp(startTime),
            end: formatTimestamp(endTime)
          },
          text: textContent
        });
      }
      
      previousText = textContent;
    }

    return { 
      cleanedSubtitles: processedLines.join('\n'),
      segments 
    };
  } catch (error) {
    console.error("Error processing VTT content:", error);
    return { 
      cleanedSubtitles: "Error processing subtitles.",
      segments: [] 
    };
  }
}

/**
 * Format the timestamp from HH:MM:SS.mmm to HH:MM:SS.m
 * @param timestamp Timestamp in HH:MM:SS.mmm format
 * @returns Formatted timestamp
 */
function formatTimestamp(timestamp: string): string {
  const parts = timestamp.split('.');
  if (parts.length === 2) {
    return `${parts[0]}.${parts[1].charAt(0)}`;
  }
  return timestamp;
}

/**
 * Update the end time in a timestamp string like [HH:MM:SS.m-HH:MM:SS.m]
 * @param timestampStr Timestamp string
 * @param newEndTime New end time
 * @returns Updated timestamp string
 */
function updateTimestamp(timestampStr: string, newEndTime: string): string {
  const matches = timestampStr.match(/\[(.*?)-(.*?)\]/);
  if (matches && matches.length === 3) {
    const startTime = matches[1];
    return `[${startTime}-${formatTimestamp(newEndTime)}]`;
  }
  return timestampStr;
}

/**
 * Check if text2 is a continuation or repetition of text1
 * @param text1 First text
 * @param text2 Second text
 * @returns True if text2 is a continuation of text1
 */
function isContinuationOrRepetition(text1: string, text2: string): boolean {
  if (!text1 || !text2) return false;
  
  // Check for exact repetition
  if (text1 === text2) return true;
  
  // Check if text2 starts with text1
  if (text2.startsWith(text1)) return true;
  
  // Check if text1 ends with a significant portion of text2's beginning
  const words1 = text1.split(' ');
  const words2 = text2.split(' ');
  
  if (words1.length >= 3 && words2.length >= 3) {
    // Check if the last 3+ words of text1 match the first 3+ words of text2
    for (let i = 3; i <= Math.min(8, words1.length, words2.length); i++) {
      const endOfText1 = words1.slice(-i).join(' ');
      const startOfText2 = words2.slice(0, i).join(' ');
      
      if (endOfText1 === startOfText2) {
        return true;
      }
    }
  }
  
  return false;
}

/**
 * Extract the non-repeated part from text2 relative to text1
 * @param text1 First text
 * @param text2 Second text
 * @returns Unique part of text2
 */
function extractUniqueText(text1: string, text2: string): string {
  if (!text1 || !text2) return text2;
  
  // If text2 is an exact repetition, return empty string
  if (text1 === text2) return '';
  
  // If text2 starts with text1, return the remainder
  if (text2.startsWith(text1)) {
    return text2.substring(text1.length);
  }
  
  // Check for partial overlaps
  const words1 = text1.split(' ');
  const words2 = text2.split(' ');
  
  if (words1.length >= 3 && words2.length >= 3) {
    // Check if the last N words of text1 match the first N words of text2
    for (let i = Math.min(8, words1.length, words2.length); i >= 3; i--) {
      const endOfText1 = words1.slice(-i).join(' ');
      const startOfText2 = words2.slice(0, i).join(' ');
      
      if (endOfText1 === startOfText2) {
        return words2.slice(i).join(' ');
      }
    }
  }
  
  return text2;
}

/**
 * Function to handle errors gracefully
 * @param videoUrl YouTube video URL
 */
async function runWithVideoUrl(videoUrl: string): Promise<void> {
  try {
    console.log(`Starting subtitle download for: ${videoUrl}`);
    await downloadSubtitlesOnly(videoUrl);
    console.log("Process completed successfully.");
  } catch (error) {
    console.error(`Failed to process video: ${(error as Error).message}`);
  }
}

// Export functions for use in other parts of the application
export {
  downloadSubtitlesOnly,
  runWithVideoUrl,
  TranscriptContent,
  TranscriptMetadata,
  TranscriptSegment
};

// Process video URL from command line arguments
if (require.main === module) {
  const args = process.argv.slice(2);
  const videoUrl = args[0] || 'https://www.youtube.com/watch?v=AdAQs44IQkY';
  runWithVideoUrl(videoUrl);
}