const fs = require('fs');
const path = require('path');

const extractedDir = path.join(__dirname, 'data/channels/interviews/jesse-michels/extracted');
const approvedDir = path.join(__dirname, 'data/channels/interviews/jesse-michels/approved');

const allPeople = new Set();
const allPrograms = new Set();
const allEvents = [];
const videoData = [];

function processDirectory(dir, isDerived = false) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    if (!file.endsWith('.json')) return;
    
    const filePath = path.join(dir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(content);
    
    // Collect video metadata
    const videoEntry = {
      video_id: data.video_id,
      title: data.title,
      guest: data.speakers?.guest || 'Unknown',
      published_at: data.published_at,
      source: isDerived ? 'approved' : 'extracted'
    };
    videoData.push(videoEntry);
    
    // Collect people
    if (data.people_mentioned && Array.isArray(data.people_mentioned)) {
      data.people_mentioned.forEach(person => {
        allPeople.add(person);
      });
    }
    
    // Collect programs
    if (data.programs_mentioned && Array.isArray(data.programs_mentioned)) {
      data.programs_mentioned.forEach(prog => {
        allPrograms.add(prog);
      });
    }
    
    // Collect events
    if (data.events && Array.isArray(data.events)) {
      data.events.forEach(evt => {
        allEvents.push({
          year: evt.year,
          description: evt.description,
          video_id: data.video_id,
          video_title: data.title
        });
      });
    }
  });
}

processDirectory(extractedDir, false);
processDirectory(approvedDir, true);

console.log('=== UNIQUE PEOPLE ===');
Array.from(allPeople).sort().forEach(p => console.log(p));

console.log('\n=== UNIQUE PROGRAMS ===');
Array.from(allPrograms).sort().forEach(p => console.log(p));

console.log('\n=== TOTAL COUNTS ===');
console.log(`Total unique people: ${allPeople.size}`);
console.log(`Total unique programs: ${allPrograms.size}`);
console.log(`Total events: ${allEvents.length}`);
console.log(`Total videos processed: ${videoData.length}`);
