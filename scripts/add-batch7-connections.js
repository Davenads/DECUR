const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data', 'key-figures');

function load(id) {
  return JSON.parse(fs.readFileSync(path.join(DATA_DIR, `${id}.json`), 'utf8'));
}

function save(id, data) {
  fs.writeFileSync(path.join(DATA_DIR, `${id}.json`), JSON.stringify(data, null, 2) + '\n');
}

function validate(id, connections, eventCount) {
  for (const c of connections) {
    if (c.event_index >= eventCount) {
      console.warn(`  WARN [${id}] event_index ${c.event_index} out of range (${eventCount} events)`);
    }
  }
}

// ─── J. Allen Hynek ──────────────────────────────────────────────────────────
// key_events[0]=1948 Project Sign, [1]=1948-1952 Project Grudge,
// [2]=1952 Blue Book, [3]=1966 challenges debunking, [4]=1966 Swamp Gas,
// [5]=1969 Blue Book terminated, [6]=1972 UFO Experience book,
// [7]=1973 founds CUFOS, [8]=1975 Edge of Reality with Vallee,
// [9]=1977 Close Encounters film, [10]=1977 Hynek UFO Report,
// [11]=1985 relocates, [12]=1986-04-27 death
const hynekConnections = [
  {
    event_index: 8,
    node_type: 'figure',
    node_id: 'jacques-vallee',
    node_label: 'Jacques Vallee',
    relationship: 'Co-authored "The Edge of Reality" (1975); Vallee was Hynek\'s most important scientific collaborator and the advocate for moving beyond the extraterrestrial hypothesis',
    connection_type: 'collaboration',
  },
  {
    event_index: 7,
    node_type: 'figure',
    node_id: 'donald-keyhoe',
    node_label: 'Donald Keyhoe',
    relationship: 'Both were the leading institutional figures in civilian UAP investigation - Keyhoe\'s NICAP and Hynek\'s CUFOS were the two main evidence-based civilian oversight organizations',
    connection_type: 'collaboration',
  },
];

// ─── John Mack ───────────────────────────────────────────────────────────────
// key_events[0]=1929 born, [1]=1955 Harvard MD, [2]=1976 T.E. Lawrence book,
// [3]=1977 Pulitzer, [4]=1990 begins experiencer research, [5]=1993 PEER,
// [6]=Jan 1994 Abduction book, [7]=1994 Harvard inquiry, [8]=Sep 1994 Zimbabwe,
// [9]=1995 cleared, [10]=1999 Passport to Cosmos, [11]=2004 death
const mackConnections = [
  {
    event_index: 4,
    node_type: 'figure',
    node_id: 'jacques-vallee',
    node_label: 'Jacques Vallee',
    relationship: 'Both approached UAP from consciousness and non-materialist frameworks that positioned the phenomenon as something beyond simple craft identification',
    connection_type: 'collaboration',
  },
];

// ─── Stanton Friedman ────────────────────────────────────────────────────────
// key_events[0]=1967 first lecture, [1]=1978 Jesse Marcel interview,
// [2]=1980 Roswell Incident book, [3]=1987 MJ-12 / Cosmic Watergate,
// [4]=1996 Top Secret/MAJIC, [5]=2008 Flying Saucers and Science,
// [6]=May 2019 death
const friedmanConnections = [
  {
    event_index: 1,
    node_type: 'figure',
    node_id: 'j-allen-hynek',
    node_label: 'J. Allen Hynek',
    relationship: 'Both were the foremost scientific researchers in the civilian UAP field; Friedman\'s FOIA document analysis complemented Hynek\'s scientific case classification work',
    connection_type: 'collaboration',
  },
  {
    event_index: 2,
    node_type: 'figure',
    node_id: 'leslie-kean',
    node_label: 'Leslie Kean',
    relationship: 'Kean\'s investigative methodology built on Friedman\'s archival precedent; both prioritized documentary evidence and named, credentialed sources',
    connection_type: 'collaboration',
  },
];

// ─── Donald Keyhoe ───────────────────────────────────────────────────────────
// key_events[0]=1950 Flying Saucers Are Real, [1]=1953 Flying Saucers from Outer Space,
// [2]=1956 co-founded NICAP, [3]=1958 NICAP 14,000 members,
// [4]=1960 Senate testimony, [5]=1969 forced out, [6]=Nov 1988 death
const keyhoeConnections = [
  {
    event_index: 3,
    node_type: 'figure',
    node_id: 'j-allen-hynek',
    node_label: 'J. Allen Hynek',
    relationship: 'NICAP under Keyhoe and CUFOS under Hynek were the two primary civilian UAP oversight institutions; Keyhoe\'s military source network complemented Hynek\'s scientific credibility',
    connection_type: 'collaboration',
  },
  {
    event_index: 0,
    node_type: 'figure',
    node_id: 'richard-dolan',
    node_label: 'Richard Dolan',
    relationship: 'Dolan\'s "UFOs and the National Security State" archival work built directly on NICAP\'s Cold War documentation framework, which Keyhoe established',
    connection_type: 'mentorship',
  },
];

// ─── Apply all ───────────────────────────────────────────────────────────────
const batch = [
  { id: 'hynek', connections: hynekConnections },
  { id: 'john-mack', connections: mackConnections },
  { id: 'stanton-friedman', connections: friedmanConnections },
  { id: 'donald-keyhoe', connections: keyhoeConnections },
];

for (const { id, connections } of batch) {
  const data = load(id);
  const eventCount = data.profile.key_events?.length ?? 0;
  validate(id, connections, eventCount);
  data.career_connections = connections;
  save(id, data);
  console.log(`Updated ${id}.json with ${connections.length} career_connections (${eventCount} events)`);
}

console.log('\nBatch 7 complete.');
