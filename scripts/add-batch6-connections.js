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

// ─── Bob Lazar ───────────────────────────────────────────────────────────────
// key_events use "date" field, 14 events:
// [0]=Nov 29 1988 Teller, [1]=Dec 1 1988 EG&G, [2]=Dec 6 1988 Area 51,
// [3]=Mid-Dec 1988 S-4, [4]=Jan 16 1989 briefing files,
// [5]=Mar 22 1989 first disc, [6]=Mar 29 1989 second disc,
// [7]=Apr 5 1989 intercepted, [8]=Apr 6 1989 fired,
// [9]=May 15 1989 anonymous KLAS-TV, [10]=Nov 10 1989 identified KLAS-TV,
// [11]=Nov 14 1989 second KLAS segment, [12]=Dec 8 2018 Corbell doc,
// [13]=Jun 20 2019 Joe Rogan
const lazarConnections = [
  {
    event_index: 9,
    node_type: 'figure',
    node_id: 'george-knapp',
    node_label: 'George Knapp',
    relationship: 'Knapp was Lazar\'s primary journalist; broadcast his anonymous interview, investigated his background, and has vouched for his credibility for 35+ years',
    connection_type: 'collaboration',
  },
  {
    event_index: 12,
    node_type: 'figure',
    node_id: 'jeremy-corbell',
    node_label: 'Jeremy Corbell',
    relationship: 'Corbell directed the 2018 documentary "Bob Lazar: Area 51 & Flying Saucers," bringing Lazar\'s account to a new generation with updated production quality',
    connection_type: 'collaboration',
  },
];

// ─── Nick Pope ───────────────────────────────────────────────────────────────
// key_events use "date" field, 10 events:
// [0]=1985 MoD joined, [1]=1991 UFO desk, [2]=1991 systematic review,
// [3]=1993-03-30 Cosford, [4]=1993 Rendlesham reinvestigation,
// [5]=1994 formal conclusion, [6]=1996 Open Skies book,
// [7]=2006 left MoD, [8]=2014 Rendlesham co-authored book, [9]=2023 commentary
const popeConnections = [
  {
    event_index: 8,
    node_type: 'figure',
    node_id: 'john-burroughs',
    node_label: 'John Burroughs',
    relationship: 'Co-authored "Encounter in Rendlesham Forest" (2014) with Burroughs and Jim Penniston, drawing on Pope\'s MoD files and the airmen\'s direct experience',
    connection_type: 'publication',
  },
  {
    event_index: 9,
    node_type: 'figure',
    node_id: 'luis-elizondo',
    node_label: 'Luis Elizondo',
    relationship: 'Both credentialed government UAP investigators who entered their roles as skeptics and emerged as cautious believers; Pope is widely described as the UK equivalent of Elizondo',
    connection_type: 'collaboration',
  },
];

// ─── Steven Greer ────────────────────────────────────────────────────────────
// key_events use "year" field, 8 events:
// [0]=1990 CSETI, [1]=1993 Disclosure Project, [2]=1994 Woolsey briefing,
// [3]=1997 congressional briefing, [4]=2001 NPC Disclosure Event,
// [5]=2013 Sirius, [6]=2017 Unacknowledged, [7]=2022 Cosmic Hoax
const greerConnections = [
  {
    event_index: 4,
    node_type: 'figure',
    node_id: 'daniel-sheehan',
    node_label: 'Daniel Sheehan',
    relationship: 'Sheehan served as General Counsel for the 2001 Disclosure Project National Press Club event, providing legal framework for the witness testimonies',
    connection_type: 'collaboration',
  },
];

// ─── Philip Corso ────────────────────────────────────────────────────────────
// key_events use "year" field, 8 events:
// [0]=1947 Fort Riley, [1]=1953 NSC, [2]=1961 Army R&D, [3]=1961 Roswell filing cabinet,
// [4]=1963 retires, [5]=1997 book, [6]=1997 Senate testimony, [7]=1998 death
const corsoConnections = [
  {
    event_index: 5,
    node_type: 'figure',
    node_id: 'stanton-friedman',
    node_label: 'Stanton Friedman',
    relationship: 'Friedman\'s extensive Roswell documentation provided historical context for evaluating Corso\'s reverse-engineering claims; held mixed views on the specifics',
    connection_type: 'collaboration',
  },
  {
    event_index: 2,
    node_type: 'figure',
    node_id: 'j-allen-hynek',
    node_label: 'J. Allen Hynek',
    relationship: 'Both served in overlapping government roles in the 1950s-60s; Hynek\'s Project Blue Book work ran concurrent with Corso\'s Pentagon Foreign Technology tenure',
    connection_type: 'institutional',
  },
];

// ─── Apply all ───────────────────────────────────────────────────────────────
const batch = [
  { id: 'lazar', connections: lazarConnections },
  { id: 'pope', connections: popeConnections },
  { id: 'steven-greer', connections: greerConnections },
  { id: 'philip-corso', connections: corsoConnections },
];

for (const { id, connections } of batch) {
  const data = load(id);
  const eventCount = data.profile.key_events?.length ?? 0;
  validate(id, connections, eventCount);
  data.career_connections = connections;
  save(id, data);
  console.log(`Updated ${id}.json with ${connections.length} career_connections (${eventCount} events)`);
}

console.log('\nBatch 6 complete.');
