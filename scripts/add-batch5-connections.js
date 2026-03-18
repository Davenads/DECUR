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

// ─── Jake Barber ─────────────────────────────────────────────────────────────
// key_events use "date" field, indices:
// [0]=1990s-2000s USAF, [1]=Post-service contractor/retrieval program,
// [2]=c.2022-2023 contacts Coulthart, [3]=January 2025 broadcast,
// [4]=January 2025 Pentagon investigation
const barberConnections = [
  {
    event_index: 2,
    node_type: 'figure',
    node_id: 'ross-coulthart',
    node_label: 'Ross Coulthart',
    relationship: 'Barber contacted Coulthart to share his account; Coulthart broke the story exclusively on NewsNation with never-before-seen retrieval footage',
    connection_type: 'collaboration',
  },
  {
    event_index: 3,
    node_type: 'figure',
    node_id: 'david-grusch',
    node_label: 'David Grusch',
    relationship: 'Barber\'s January 2025 disclosure followed the pattern established by Grusch\'s 2023 congressional testimony on crash retrieval programs',
    connection_type: 'collaboration',
  },
];

// ─── Robert Bigelow ──────────────────────────────────────────────────────────
// key_events use "date" field, indices:
// [0]=1944 born, [1]=1992-1994 begins funding, [2]=1995 NIDS, [3]=1996 Skinwalker Ranch,
// [4]=1999 Bigelow Aerospace, [5]=2002-2005 NIDS investigation,
// [6]=2007 BAASS AAWSAP contract, [7]=2008-2012 AAWSAP administration,
// [8]=2016 sells ranch, [9]=May 2017 60 Minutes, [10]=December 2017 NYT,
// [11]=2020-present
const bigelowConnections = [
  {
    event_index: 2,
    node_type: 'figure',
    node_id: 'george-knapp',
    node_label: 'George Knapp',
    relationship: 'Longtime media partner and NIDS collaborator; Knapp introduced Bigelow to Senator Reid, enabling the AAWSAP appropriation',
    connection_type: 'institutional',
  },
  {
    event_index: 2,
    node_type: 'figure',
    node_id: 'jacques-vallee',
    node_label: 'Jacques Vallee',
    relationship: 'Vallee served as scientific advisor to NIDS; his rigorous research framework helped establish NIDS\'s scientific credibility',
    connection_type: 'collaboration',
  },
  {
    event_index: 6,
    node_type: 'figure',
    node_id: 'harry-reid',
    node_label: 'Harry Reid',
    relationship: 'Reid directed the $22M AAWSAP contract to BAASS; the Reid-Bigelow relationship is the central axis of the modern government UAP research program',
    connection_type: 'institutional',
  },
  {
    event_index: 7,
    node_type: 'figure',
    node_id: 'hal-puthoff',
    node_label: 'Hal Puthoff',
    relationship: 'Puthoff was a lead researcher for BAASS under the AAWSAP contract, bringing EarthTech\'s physics expertise to the program',
    connection_type: 'institutional',
  },
  {
    event_index: 7,
    node_type: 'figure',
    node_id: 'eric-davis',
    node_label: 'Eric Davis',
    relationship: 'Davis conducted AAWSAP field investigations and produced classified DIRDs for BAASS on warp drives and exotic propulsion',
    connection_type: 'institutional',
  },
];

// ─── Alex Dietrich ───────────────────────────────────────────────────────────
// key_events use "year" field, indices:
// [0]=c.1999 commissioned, [1]=2004-11-14 Nimitz encounter,
// [2]=2004-2021 keeps private, [3]=2021-05-16 60 Minutes
const dietrichConnections = [
  {
    event_index: 1,
    node_type: 'figure',
    node_id: 'david-fravor',
    node_label: 'David Fravor',
    relationship: 'Dietrich was Fravor\'s wingman during the Nimitz encounter; her account from the maintaining-altitude observer position is the primary corroboration of Fravor\'s engagement with the Tic Tac object',
    connection_type: 'investigation',
  },
];

// ─── Jay Stratton ────────────────────────────────────────────────────────────
// key_events use "year" field, indices:
// [0]=2017 works with Elizondo, [1]=2020 UAPTF director,
// [2]=2021 UAPTF assessment, [3]=2021 departs, [4]=2022 acting AARO director
const strattonConnections = [
  {
    event_index: 0,
    node_type: 'figure',
    node_id: 'luis-elizondo',
    node_label: 'Luis Elizondo',
    relationship: 'Worked closely with Elizondo during the AATIP era; served as key institutional continuity figure after Elizondo\'s resignation',
    connection_type: 'institutional',
  },
  {
    event_index: 1,
    node_type: 'figure',
    node_id: 'david-grusch',
    node_label: 'David Grusch',
    relationship: 'Grusch served as the NRO\'s representative under Stratton\'s UAPTF leadership; Stratton directed him to investigate legacy UAP crash retrieval programs',
    connection_type: 'institutional',
  },
];

// ─── Dylan Borland ───────────────────────────────────────────────────────────
// key_events use "year" field, indices:
// [0]=2010 enlisted, [1]=2012 Langley encounter, [2]=2013 discharged,
// [3]=Mar 2023 ICIG filing, [4]=2023 AARO testimony, [5]=Sep 2025 House Oversight
const borlandConnections = [
  {
    event_index: 3,
    node_type: 'figure',
    node_id: 'david-grusch',
    node_label: 'David Grusch',
    relationship: 'Borland followed the same official whistleblower path established by Grusch - ICIG filing, AARO testimony, then congressional testimony',
    connection_type: 'collaboration',
  },
  {
    event_index: 4,
    node_type: 'figure',
    node_id: 'jay-stratton',
    node_label: 'Jay Stratton',
    relationship: 'Both are connected through the AARO institutional context; Borland testified to AARO, which Stratton had briefly directed before Kirkpatrick',
    connection_type: 'institutional',
  },
];

// ─── Apply all ───────────────────────────────────────────────────────────────
const batch = [
  { id: 'barber', connections: barberConnections },
  { id: 'bigelow', connections: bigelowConnections },
  { id: 'dietrich', connections: dietrichConnections },
  { id: 'jay-stratton', connections: strattonConnections },
  { id: 'dylan-borland', connections: borlandConnections },
];

for (const { id, connections } of batch) {
  const data = load(id);
  const eventCount = data.profile.key_events?.length ?? 0;
  validate(id, connections, eventCount);
  data.career_connections = connections;
  save(id, data);
  console.log(`Updated ${id}.json with ${connections.length} career_connections (${eventCount} events)`);
}

console.log('\nBatch 5 complete.');
