# YouTube Transcript Downloader

This module provides functionality to download and process transcripts from YouTube videos for the DECUR project.

## Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Download yt-dlp:**
   - Download the appropriate yt-dlp executable for your platform from [https://github.com/yt-dlp/yt-dlp/releases](https://github.com/yt-dlp/yt-dlp/releases)
   - Place it in the `ytdl` directory
   - For Linux/Mac, make it executable: `chmod +x ./ytdl/yt-dlp`

3. **Create a cookies.txt file:**
   - Create a `cookies.txt` file in the `ytdl` directory
   - You can export cookies from your browser using a cookies.txt extension
   - This is needed for age-restricted or private videos

## Usage

### Download a Transcript

To download a transcript from a YouTube video:

```bash
npm run transcript:download -- "https://www.youtube.com/watch?v=VIDEO_ID"
```

This will:
1. Download the auto-generated subtitles from the video
2. Process them into a clean transcript format
3. Save both a text version and a structured JSON version
4. Import the transcript into the DECUR project structure

### Import All Downloaded Transcripts

If you have transcript files in the `ytdl/subtitle_dls` directory that you want to import into the project:

```bash
npm run transcript:import
```

This will:
1. Scan the `ytdl/subtitle_dls` directory for JSON transcript files
2. Convert each transcript into the DECUR transcript format
3. Save them to the public assets directory for use in the application

## File Structure

- `dlSubtitles.ts` - Core functionality for downloading and processing subtitles
- `downloadTranscript.ts` - Script for downloading a single transcript
- `importTranscripts.ts` - Script for importing all downloaded transcripts
- `subtitle_dls/` - Directory where downloaded transcripts are stored

## Output Format

Transcripts are stored in two formats:

1. **Text (.txt)** - Plain text transcript with metadata header, useful for reading
2. **JSON (.json)** - Structured data format with metadata and segmented transcript, useful for application integration

The JSON format follows this structure:

```typescript
{
  "metadata": {
    "title": "Video Title",
    "source": "YouTube URL",
    "uploadDate": "YYYY-MM-DD",
    "extractionDate": "YYYY-MM-DD",
    "duration": "HH:MM:SS",
    "channel": "Channel Name",
    "subtitleType": "Auto-Generated"
  },
  "content": [
    {
      "timestamp": {
        "start": "00:00:00.0",
        "end": "00:00:05.0"
      },
      "text": "Transcript segment text..."
    },
    // More segments...
  ]
}
```

## Integration with DECUR

The transcripts are integrated with the DECUR project through:

1. The `TranscriptContent` interface in `types/transcripts.ts`
2. The `importTranscript` utility in `utils/transcriptImporter.ts`
3. Imported transcripts are saved to `public/assets/documents/transcripts/`