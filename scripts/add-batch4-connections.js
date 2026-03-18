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

// ─── Harry Reid ──────────────────────────────────────────────────────────────
// key_events[0]=1987 Senate, [1]=c.2000 meets Bigelow, [2]=c.2006 Knapp intro,
// [3]=2007 AAWSAP earmark, [4]=2008 BAASS contract, [5]=2012 AATIP continues,
// [6]=2017-12-16 NYT, [7]=2019 op-ed, [8]=2020-2021 vocal, [9]=2021-05 Knapp interview,
// [10]=2021-12-28 death
const reidConnections = [
  {
    event_index: 1,
    node_type: 'figure',
    node_id: 'robert-bigelow',
    node_label: 'Robert Bigelow',
    relationship: 'Reid\'s closest ally in UAP research; Bigelow\'s private NIDS research convinced Reid government funding was warranted',
    connection_type: 'institutional',
  },
  {
    event_index: 2,
    node_type: 'figure',
    node_id: 'george-knapp',
    node_label: 'George Knapp',
    relationship: 'Knapp introduced Reid to Bigelow and is credited by Reid as the journalist who convinced him UAP warranted serious government investment',
    connection_type: 'institutional',
  },
  {
    event_index: 3,
    node_type: 'program',
    node_id: 'aawsap',
    node_label: 'AAWSAP',
    relationship: 'Reid secretly earmarked $22M to create AAWSAP at the DIA - the first formally funded Pentagon UAP research program in decades',
    connection_type: 'institutional',
  },
  {
    event_index: 4,
    node_type: 'figure',
    node_id: 'james-lacatski',
    node_label: 'Dr. James Lacatski',
    relationship: 'Lacatski was the DIA program manager who oversaw AAWSAP after Reid\'s appropriation funded the BAASS contract',
    connection_type: 'institutional',
  },
  {
    event_index: 6,
    node_type: 'figure',
    node_id: 'luis-elizondo',
    node_label: 'Luis Elizondo',
    relationship: 'Reid publicly vouched for Elizondo when DoD disputed his AATIP role in 2017; was among those who credited Reid at his death',
    connection_type: 'institutional',
  },
];

// ─── Chuck Schumer ───────────────────────────────────────────────────────────
// key_events[0]=1999 Senate, [1]=2021 Majority Leader, [2]=2022-2023 briefings,
// [3]=2023-07 UAP Disclosure Act, [4]=2023-12 weakened, [5]=2024 continues,
// [6]=2025-01 Minority Leader
const schumerConnections = [
  {
    event_index: 2,
    node_type: 'figure',
    node_id: 'harry-reid',
    node_label: 'Harry Reid',
    relationship: 'Reid\'s UAP legacy motivated Schumer to sponsor the Disclosure Act; Schumer is effectively the political heir to Reid\'s UAP institutional role',
    connection_type: 'mentorship',
  },
  {
    event_index: 2,
    node_type: 'figure',
    node_id: 'chris-mellon',
    node_label: 'Chris Mellon',
    relationship: 'Mellon is widely credited with briefing Schumer and other senators on UAP program allegations, building political will for the Disclosure Act',
    connection_type: 'institutional',
  },
];

// ─── Tim Gallaudet ───────────────────────────────────────────────────────────
// key_events use "date" field, indices:
// [0]=1980s-2014 Navy, [1]=2017-2019 NOAA, [2]=2019 departs,
// [3]=November 2023 Sol Foundation / Coulthart, [4]=June 2024 Reality Check airs,
// [5]=November 2024 House Oversight, [6]=December 6, 2024 USO special
const gallaudetConnections = [
  {
    event_index: 4,
    node_type: 'figure',
    node_id: 'ross-coulthart',
    node_label: 'Ross Coulthart',
    relationship: 'Gallaudet appeared in multiple NewsNation Reality Check interviews with Coulthart on USOs and the oceanic UAP domain',
    connection_type: 'collaboration',
  },
  {
    event_index: 4,
    node_type: 'figure',
    node_id: 'david-grusch',
    node_label: 'David Grusch',
    relationship: 'Gallaudet publicly endorsed Grusch\'s crash retrieval claims and called for science-based investigation of the UAP phenomenon',
    connection_type: 'institutional',
  },
];

// ─── Daniel Sheehan ──────────────────────────────────────────────────────────
// key_events[0]=1971 Pentagon Papers, [1]=1977 classified files,
// [2]=1981 Silkwood, [3]=1986 Christic/Iran-Contra,
// [4]=2001-05-09 Disclosure Project NPC, [5]=2003 Romero Institute,
// [6]=2019-present UC Santa Barbara, [7]=2023 congressional advocacy
const sheehanConnections = [
  {
    event_index: 4,
    node_type: 'figure',
    node_id: 'george-knapp',
    node_label: 'George Knapp',
    relationship: 'Both have been central UAP disclosure figures for decades - Sheehan from law and advocacy, Knapp from investigative journalism',
    connection_type: 'collaboration',
  },
  {
    event_index: 7,
    node_type: 'figure',
    node_id: 'david-grusch',
    node_label: 'David Grusch',
    relationship: 'Sheehan served as a legal advisor and constitutional law advocate for whistleblowers including Grusch during the congressional disclosure period',
    connection_type: 'collaboration',
  },
];

// ─── Harald Malmgren ─────────────────────────────────────────────────────────
// key_events[0]=1961 Kennedy NSC, [1]=Oct 1962 Cuban Missile Crisis,
// [2]=1962 Bluegill Triple Prime, [3]=c.1960s Bissell briefing,
// [4]=1974-1975 Trade Rep, [5]=2023 social media, [6]=Apr 2025 Michels interview
const malmgrenConnections = [
  {
    event_index: 6,
    node_type: 'figure',
    node_id: 'jesse-michels',
    node_label: 'Jesse Michels',
    relationship: 'Michels conducted Malmgren\'s first major on-camera interview in April 2025, providing the platform for his primary UAP disclosure',
    connection_type: 'collaboration',
  },
  {
    event_index: 6,
    node_type: 'figure',
    node_id: 'david-grusch',
    node_label: 'David Grusch',
    relationship: 'Malmgren\'s account of compartmentalized material handling independently corroborates Grusch\'s congressional testimony on the same architecture',
    connection_type: 'collaboration',
  },
  {
    event_index: 6,
    node_type: 'figure',
    node_id: 'hal-puthoff',
    node_label: 'Hal Puthoff',
    relationship: 'Both independently point to Atomic Energy Commission classification infrastructure as the mechanism for UAP secrecy; mentioned together in the Michels interview',
    connection_type: 'collaboration',
  },
];

// ─── Sean Kirkpatrick ────────────────────────────────────────────────────────
// key_events[0]=Nov 2022 AARO director, [1]=Mar 2023 Loeb paper,
// [2]=Apr 2023 Senate testimony, [3]=Jul 2023 contradicts Grusch,
// [4]=Mar 2024 AARO Historical Record, [5]=Dec 2023 resigns, [6]=2024 commentary
const kirkpatrickConnections = [
  {
    event_index: 1,
    node_type: 'figure',
    node_id: 'avi-loeb',
    node_label: 'Dr. Avi Loeb',
    relationship: 'Co-authored a paper on physical constraints on UAP signatures - the only peer-reviewed publication co-authored by a sitting AARO director',
    connection_type: 'publication',
  },
  {
    event_index: 3,
    node_type: 'figure',
    node_id: 'david-grusch',
    node_label: 'David Grusch',
    relationship: 'Kirkpatrick publicly contradicted Grusch\'s congressional testimony, creating a central credibility conflict between AARO\'s official findings and Grusch\'s sworn claims',
    connection_type: 'opposition',
  },
];

// ─── Apply all ───────────────────────────────────────────────────────────────
const batch = [
  { id: 'reid', connections: reidConnections },
  { id: 'schumer', connections: schumerConnections },
  { id: 'gallaudet', connections: gallaudetConnections },
  { id: 'sheehan', connections: sheehanConnections },
  { id: 'harald-malmgren', connections: malmgrenConnections },
  { id: 'sean-kirkpatrick', connections: kirkpatrickConnections },
];

for (const { id, connections } of batch) {
  const data = load(id);
  const eventCount = data.profile.key_events?.length ?? 0;
  validate(id, connections, eventCount);
  data.career_connections = connections;
  save(id, data);
  console.log(`Updated ${id}.json with ${connections.length} career_connections (${eventCount} events)`);
}

console.log('\nBatch 4 complete.');
