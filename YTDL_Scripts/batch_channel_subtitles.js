const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const fsPromises = require('fs').promises;

const subtitlesPath = path.join(__dirname, 'Subtitles_Only');
const ytDlpPath = path.join(__dirname, 'yt-dlp.exe');
const cookiesPath = path.join(__dirname, 'cookies.txt');

fs.ensureDirSync(subtitlesPath);

// Get all video IDs from channel (both videos and live streams)
async function getChannelVideoIds(channelUrl) {
    console.log('Fetching video list from channel...');

    const videosUrl = `${channelUrl}/videos`;
    const streamsUrl = `${channelUrl}/streams`;

    try {
        // Get regular videos
        const videosOutput = execSync(`"${ytDlpPath}" --flat-playlist --get-id "${videosUrl}"`, {
            stdio: ['pipe', 'pipe', 'pipe']
        }).toString().trim();

        const videoIds = videosOutput.split('\n').filter(id => id.trim());
        console.log(`Found ${videoIds.length} regular videos`);

        // Get live streams
        const streamsOutput = execSync(`"${ytDlpPath}" --flat-playlist --get-id "${streamsUrl}"`, {
            stdio: ['pipe', 'pipe', 'pipe']
        }).toString().trim();

        const streamIds = streamsOutput.split('\n').filter(id => id.trim());
        console.log(`Found ${streamIds.length} live streams`);

        // Combine and deduplicate
        const allIds = [...new Set([...videoIds, ...streamIds])];
        console.log(`Total unique videos: ${allIds.length}`);

        return allIds;
    } catch (error) {
        console.error(`Error fetching video IDs: ${error.message}`);
        throw error;
    }
}

// Get metadata for a single video
async function getVideoMetadata(videoId) {
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

    try {
        const title = execSync(`"${ytDlpPath}" --get-title "${videoUrl}"`, {
            stdio: ['pipe', 'pipe', 'pipe']
        }).toString().trim();

        const uploadDate = execSync(`"${ytDlpPath}" --print "%(upload_date)s" "${videoUrl}"`, {
            stdio: ['pipe', 'pipe', 'pipe']
        }).toString().trim();

        const duration = execSync(`"${ytDlpPath}" --get-duration "${videoUrl}"`, {
            stdio: ['pipe', 'pipe', 'pipe']
        }).toString().trim();

        const uploader = execSync(`"${ytDlpPath}" --print "%(uploader)s" "${videoUrl}"`, {
            stdio: ['pipe', 'pipe', 'pipe']
        }).toString().trim();

        // Check if it was a live stream
        let liveStatus = 'video';
        try {
            const status = execSync(`"${ytDlpPath}" --print "%(live_status)s" "${videoUrl}"`, {
                stdio: ['pipe', 'pipe', 'pipe']
            }).toString().trim();
            liveStatus = status === 'was_live' ? 'live_stream' : 'video';
        } catch (e) {
            // If it fails, assume regular video
        }

        return {
            id: videoId,
            url: videoUrl,
            title,
            uploadDate,
            duration,
            uploader,
            liveStatus
        };
    } catch (error) {
        console.error(`Failed to get metadata for ${videoId}: ${error.message}`);
        return null;
    }
}

// Download subtitles for a single video
async function downloadSubtitlesOnly(videoMetadata, index, total) {
    const { url, title, uploadDate, duration, uploader, liveStatus } = videoMetadata;

    try {
        console.log(`\n[${index}/${total}] Processing: ${title}`);
        console.log(`Upload Date: ${uploadDate}, Type: ${liveStatus}`);

        const subtitleType = "Auto-Generated";

        // Format upload date (from YYYYMMDD to readable format)
        const formattedDate = `${uploadDate.substring(0,4)}-${uploadDate.substring(4,6)}-${uploadDate.substring(6,8)}`;

        // Create chronological filename: YYYYMMDD_###_title
        const paddedIndex = String(index).padStart(3, '0');
        const safeTitle = title.replace(/[<>:"/\\|?*]/g, '_').substring(0, 100);
        const chronologicalPrefix = `${uploadDate}_${paddedIndex}_[${liveStatus}]`;

        // Download only the subtitles
        console.log(`Downloading subtitles...`);
        const outputTemplate = path.join(subtitlesPath, 'temp_subtitle.%(ext)s');
        execSync(`"${ytDlpPath}" --write-auto-sub --sub-lang en --sub-format vtt --skip-download --extractor-args "youtube:player_client=android" --output "${outputTemplate}" "${url}"`, {
            stdio: 'inherit'
        });

        // Find the .vtt file
        const files = await fsPromises.readdir(subtitlesPath);
        const vttFile = files.find(file => file.startsWith('temp_subtitle') && file.endsWith('.en.vtt'));

        if (!vttFile) {
            console.log(`No subtitles available for: ${title}`);
            return null;
        }

        const vttFilePath = path.join(subtitlesPath, vttFile);

        // Read and clean up VTT subtitles
        const rawSubtitles = await fsPromises.readFile(vttFilePath, 'utf8');
        const cleanedSubtitles = processVTTContent(rawSubtitles);

        // Prepare metadata block
        const extractionDate = new Date().toISOString().split('T')[0];
        const metadata = `Title: ${title}
Source: ${url}
Uploaded: ${formattedDate}
Type: ${liveStatus}
Subtitle Type: ${subtitleType}
Extracted: ${extractionDate}
Duration: ${duration}
Channel: ${uploader}
Chronological Index: ${index}/${total}

-------------------------------
`;

        // Save with chronological filename
        const txtFilePath = path.join(subtitlesPath, `${chronologicalPrefix}_${safeTitle}.txt`);
        await fsPromises.writeFile(txtFilePath, metadata + cleanedSubtitles, 'utf8');

        // Clean up temp VTT file
        await fsPromises.unlink(vttFilePath);

        console.log(`✓ Saved to: ${chronologicalPrefix}_${safeTitle}.txt`);
        return txtFilePath;

    } catch (error) {
        console.error(`Error processing ${title}:`, error.message);
        return null;
    }
}

// Process VTT content (same as original script)
function processVTTContent(vttContent) {
    try {
        const blocks = vttContent
            .replace(/WEBVTT[\s\S]*?\n\n/, '')
            .split('\n\n')
            .filter(block => block.trim());

        const processedLines = [];
        let previousText = '';

        for (const block of blocks) {
            const lines = block.split('\n').filter(line => line.trim());
            if (lines.length < 2) continue;

            const timestampLine = lines[0];
            const timestampMatch = timestampLine.match(/(\d{2}:\d{2}:\d{2}\.\d{3}) --> (\d{2}:\d{2}:\d{2}\.\d{3})/);
            if (!timestampMatch) continue;

            const startTime = timestampMatch[1];
            const endTime = timestampMatch[2];
            const formattedTimestamp = `[${formatTimestamp(startTime)}-${formatTimestamp(endTime)}]`;

            const textContent = lines.slice(1)
                .join(' ')
                .replace(/<[^>]+>/g, '')
                .trim();

            if (!textContent) continue;

            if (isContinuationOrRepetition(previousText, textContent)) {
                if (processedLines.length > 0) {
                    const uniqueText = extractUniqueText(previousText, textContent);
                    if (uniqueText.trim()) {
                        const lastLine = processedLines[processedLines.length - 1];
                        const lastTimestamp = lastLine.substring(0, lastLine.indexOf(']') + 1);
                        const lastText = lastLine.substring(lastLine.indexOf(']') + 1).trim();
                        const updatedTimestamp = updateTimestamp(lastTimestamp, endTime);
                        processedLines[processedLines.length - 1] = `${updatedTimestamp} ${lastText}${uniqueText.startsWith(' ') ? uniqueText : ' ' + uniqueText}`;
                    } else {
                        const lastLine = processedLines[processedLines.length - 1];
                        const lastTimestamp = lastLine.substring(0, lastLine.indexOf(']') + 1);
                        const lastText = lastLine.substring(lastLine.indexOf(']') + 1).trim();
                        const updatedTimestamp = updateTimestamp(lastTimestamp, endTime);
                        processedLines[processedLines.length - 1] = `${updatedTimestamp} ${lastText}`;
                    }
                }
            } else {
                processedLines.push(`${formattedTimestamp} ${textContent}`);
            }

            previousText = textContent;
        }

        return processedLines.join('\n');
    } catch (error) {
        console.error("Error processing VTT content:", error);
        return "Error processing subtitles.";
    }
}

function formatTimestamp(timestamp) {
    const parts = timestamp.split('.');
    if (parts.length === 2) {
        return `${parts[0]}.${parts[1].charAt(0)}`;
    }
    return timestamp;
}

function updateTimestamp(timestampStr, newEndTime) {
    const matches = timestampStr.match(/\[(.*?)-(.*?)\]/);
    if (matches && matches.length === 3) {
        const startTime = matches[1];
        return `[${startTime}-${formatTimestamp(newEndTime)}]`;
    }
    return timestampStr;
}

function isContinuationOrRepetition(text1, text2) {
    if (!text1 || !text2) return false;
    if (text1 === text2) return true;
    if (text2.startsWith(text1)) return true;

    const words1 = text1.split(' ');
    const words2 = text2.split(' ');

    if (words1.length >= 3 && words2.length >= 3) {
        for (let i = 3; i <= Math.min(8, words1.length, words2.length); i++) {
            const endOfText1 = words1.slice(-i).join(' ');
            const startOfText2 = words2.slice(0, i).join(' ');
            if (endOfText1 === startOfText2) return true;
        }
    }

    return false;
}

function extractUniqueText(text1, text2) {
    if (!text1 || !text2) return text2;
    if (text1 === text2) return '';
    if (text2.startsWith(text1)) return text2.substring(text1.length);

    const words1 = text1.split(' ');
    const words2 = text2.split(' ');

    if (words1.length >= 3 && words2.length >= 3) {
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

// Main batch processing function
async function processBatchChannel(channelUrl, testMode = false) {
    try {
        console.log(`Starting batch subtitle extraction for: ${channelUrl}`);
        console.log(`Test mode: ${testMode ? 'ON (processing first 3 videos only)' : 'OFF'}\n`);

        // Step 1: Get all video IDs
        const videoIds = await getChannelVideoIds(channelUrl);

        if (videoIds.length === 0) {
            console.log('No videos found in channel.');
            return;
        }

        // Step 2: Get metadata for all videos
        console.log('\nFetching metadata for all videos...');
        const allMetadata = [];

        for (let i = 0; i < videoIds.length; i++) {
            process.stdout.write(`\rProgress: ${i + 1}/${videoIds.length}`);
            const metadata = await getVideoMetadata(videoIds[i]);
            if (metadata) {
                allMetadata.push(metadata);
            }
        }
        console.log('\n');

        // Step 3: Sort chronologically (oldest first)
        allMetadata.sort((a, b) => a.uploadDate.localeCompare(b.uploadDate));

        console.log(`\nSorted ${allMetadata.length} videos chronologically`);
        console.log(`Oldest: ${allMetadata[0].title} (${allMetadata[0].uploadDate})`);
        console.log(`Newest: ${allMetadata[allMetadata.length - 1].title} (${allMetadata[allMetadata.length - 1].uploadDate})`);

        // Step 4: Download subtitles in chronological order
        console.log('\n--- Starting subtitle downloads ---');

        const videosToProcess = testMode ? allMetadata.slice(0, 3) : allMetadata;
        const successCount = [];
        const failedCount = [];

        for (let i = 0; i < videosToProcess.length; i++) {
            const result = await downloadSubtitlesOnly(videosToProcess[i], i + 1, allMetadata.length);
            if (result) {
                successCount.push(result);
            } else {
                failedCount.push(videosToProcess[i].title);
            }
        }

        // Summary
        console.log('\n=== SUMMARY ===');
        console.log(`Total videos: ${allMetadata.length}`);
        console.log(`Processed: ${videosToProcess.length}`);
        console.log(`Success: ${successCount.length}`);
        console.log(`Failed/No subs: ${failedCount.length}`);

        if (failedCount.length > 0) {
            console.log('\nFailed videos:');
            failedCount.forEach(title => console.log(`  - ${title}`));
        }

        console.log(`\nAll subtitles saved to: ${subtitlesPath}`);

    } catch (error) {
        console.error('Error in batch processing:', error);
        throw error;
    }
}

// Run the script
const args = process.argv.slice(2);
const channelUrl = args[0] || 'https://www.youtube.com/@James-d6l9n';
const testMode = args[1] === '--test' || args[1] === '-t';

processBatchChannel(channelUrl, testMode);
