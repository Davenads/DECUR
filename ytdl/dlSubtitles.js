const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const fsPromises = require('fs').promises;

const subtitlesPath = 'C:\\Projects\\DECUR\\ytdl\\subtitles_dls';
const ytDlpPath = path.join('C:\\Projects\\DECUR\\ytdl', 'yt-dlp.exe');
const cookiesPath = path.join('C:\\Projects\\DECUR\\ytdl', 'cookies.txt');

fs.ensureDirSync(subtitlesPath);

async function downloadSubtitlesOnly(videoUrl) {
    try {
        console.log(`Downloading subtitles from: ${videoUrl}`);

        // Get metadata with better error handling
        let videoTitle, videoUploader, videoUploadDateRaw, videoDuration;
        
        try {
            videoTitle = execSync(`"${ytDlpPath}" --get-title --cookies "${cookiesPath}" "${videoUrl}"`, {
                stdio: ['pipe', 'pipe', 'pipe']
            }).toString().trim();
            
            videoUploader = execSync(`"${ytDlpPath}" --print "%(uploader)s" --cookies "${cookiesPath}" "${videoUrl}"`, {
                stdio: ['pipe', 'pipe', 'pipe']
            }).toString().trim();
            
            videoUploadDateRaw = execSync(`"${ytDlpPath}" --print "%(upload_date)s" --cookies "${cookiesPath}" "${videoUrl}"`, {
                stdio: ['pipe', 'pipe', 'pipe']
            }).toString().trim();
            
            videoDuration = execSync(`"${ytDlpPath}" --get-duration --cookies "${cookiesPath}" "${videoUrl}"`, {
                stdio: ['pipe', 'pipe', 'pipe']
            }).toString().trim();
        } catch (metadataError) {
            console.error(`Failed to fetch video metadata: ${metadataError.message}`);
            throw new Error(`Failed to fetch video metadata: ${metadataError.message}`);
        }
        
        const subtitleType = "Auto-Generated"; // Assuming auto-subtitles

        // Format upload date (from YYYYMMDD to readable format)
        const videoUploadDate = `${videoUploadDateRaw.substring(0,4)}-${videoUploadDateRaw.substring(4,6)}-${videoUploadDateRaw.substring(6,8)}`;

        // Download only the subtitles
        console.log(`Downloading subtitles for: ${videoTitle}`);
        execSync(`"${ytDlpPath}" --cookies "${cookiesPath}" --write-auto-sub --sub-lang en --sub-format vtt --skip-download --output "${subtitlesPath}\\%(title)s.%(ext)s" --verbose "${videoUrl}"`, { stdio: 'inherit' });

        console.log('Subtitles downloaded successfully!');

        // Find the .vtt file - handle filenames with special characters
        const files = await fsPromises.readdir(subtitlesPath);
        const vttFile = files.find(file => 
            file.includes(videoTitle.substring(0, Math.min(20, videoTitle.length))) && 
            file.endsWith('.en.vtt')
        );
        
        if (!vttFile) {
            throw new Error(`No matching VTT file found for: ${videoTitle}`);
        }
        
        const vttFilePath = path.join(subtitlesPath, vttFile);
        console.log(`Found subtitle file: ${vttFilePath}`);
        
        // Create output filename
        const txtFilePath = vttFilePath.replace('.vtt', '.txt');
        
        // Read and clean up VTT subtitles
        console.log(`Processing subtitles: ${vttFile}`);
        const rawSubtitles = await fsPromises.readFile(vttFilePath, 'utf8');
        
        // Direct approach - extract and clean up the raw HTML-like VTT content
        const cleanedSubtitles = processVTTContent(rawSubtitles);

        // Prepare metadata block
        const extractionDate = new Date().toISOString().split('T')[0];
        const metadata = `Title: ${videoTitle}
Source: ${videoUrl}
Uploaded: ${videoUploadDate}
Subtitle Type: ${subtitleType}
Extracted: ${extractionDate}
Duration: ${videoDuration}
Channel: ${videoUploader}

-------------------------------
`;

        // Save cleaned subtitles with metadata
        await fsPromises.writeFile(txtFilePath, metadata + cleanedSubtitles, 'utf8');
        console.log(`Cleaned subtitles saved to: ${txtFilePath}`);
        
        return txtFilePath;
    } catch (error) {
        console.error('Error downloading subtitles:', error);
        throw error;
    }
}

// Process VTT content by directly extracting text content
function processVTTContent(vttContent) {
    try {
        // Split the VTT content into blocks by double newlines
        const blocks = vttContent
            .replace(/WEBVTT[\s\S]*?\n\n/, '') // Remove WEBVTT header
            .split('\n\n')
            .filter(block => block.trim());

        // Process each block
        const processedLines = [];
        let currentTimestamp = '';
        let currentText = '';
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
                if (processedLines.length > 0) {
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
                    } else {
                        // Just update the timestamp's end time
                        const lastLine = processedLines[processedLines.length - 1];
                        const lastTimestamp = lastLine.substring(0, lastLine.indexOf(']') + 1);
                        const lastText = lastLine.substring(lastLine.indexOf(']') + 1).trim();
                        
                        // Update the end time in the timestamp
                        const updatedTimestamp = updateTimestamp(lastTimestamp, endTime);
                        processedLines[processedLines.length - 1] = `${updatedTimestamp} ${lastText}`;
                    }
                }
            } else {
                // New entry
                processedLines.push(`${formattedTimestamp} ${textContent}`);
                currentTimestamp = formattedTimestamp;
                currentText = textContent;
            }
            
            previousText = textContent;
        }

        return processedLines.join('\n');
    } catch (error) {
        console.error("Error processing VTT content:", error);
        return "Error processing subtitles.";
    }
}

// Format the timestamp from HH:MM:SS.mmm to HH:MM:SS.m
function formatTimestamp(timestamp) {
    const parts = timestamp.split('.');
    if (parts.length === 2) {
        return `${parts[0]}.${parts[1].charAt(0)}`;
    }
    return timestamp;
}

// Update the end time in a timestamp string like [HH:MM:SS.m-HH:MM:SS.m]
function updateTimestamp(timestampStr, newEndTime) {
    const matches = timestampStr.match(/\[(.*?)-(.*?)\]/);
    if (matches && matches.length === 3) {
        const startTime = matches[1];
        return `[${startTime}-${formatTimestamp(newEndTime)}]`;
    }
    return timestampStr;
}

// Check if text2 is a continuation or repetition of text1
function isContinuationOrRepetition(text1, text2) {
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

// Extract the non-repeated part from text2 relative to text1
function extractUniqueText(text1, text2) {
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

// Function to handle errors gracefully
async function runWithVideoUrl(videoUrl) {
    try {
        console.log(`Starting subtitle download for: ${videoUrl}`);
        await downloadSubtitlesOnly(videoUrl);
        console.log("Process completed successfully.");
    } catch (error) {
        console.error(`Failed to process video: ${error.message}`);
    }
}

// Use the provided URL or a default one
const args = process.argv.slice(2);
const videoUrl = args[0] || 'https://www.youtube.com/watch?v=AdAQs44IQkY';
runWithVideoUrl(videoUrl);