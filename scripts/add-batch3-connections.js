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

// ─── George Knapp ────────────────────────────────────────────────────────────
// key_events[0]=1987 KLAS-TV, [1]=1989-05 Lazar broadcast, [2]=1989 investigating,
// [3]=c.2000 introduces Reid to Bigelow, [4]=2005 Hunt for Skinwalker,
// [5]=2007 AAWSAP funded, [6]=2017-12-16 NYT, [7]=2021 Skinwalkers at Pentagon,
// [8]=2021-05 Reid interview, [9]=2022 Weaponized, [10]=2025 testimony
const knappConnections = [
  {
    event_index: 1,
    node_type: 'figure',
    node_id: 'bob-lazar',
    node_label: 'Bob Lazar',
    relationship: 'Broadcast Lazar\'s first S-4 interview on KLAS-TV, launching the modern Area 51 mythology',
    connection_type: 'investigation',
  },
  {
    event_index: 3,
    node_type: 'figure',
    node_id: 'harry-reid',
    node_label: 'Sen. Harry Reid',
    relationship: 'Introduced Reid to Robert Bigelow; Reid later cited this introduction as the catalyst for AAWSAP',
    connection_type: 'institutional',
  },
  {
    event_index: 3,
    node_type: 'figure',
    node_id: 'robert-bigelow',
    node_label: 'Robert Bigelow',
    relationship: 'Reported on Bigelow\'s private UAP research since 1990s; introduced him to Reid, enabling AAWSAP',
    connection_type: 'institutional',
  },
  {
    event_index: 5,
    node_type: 'program',
    node_id: 'aawsap',
    node_label: 'AAWSAP',
    relationship: 'Knapp\'s introductions and advocacy helped make AAWSAP politically possible through Reid',
    connection_type: 'institutional',
  },
  {
    event_index: 7,
    node_type: 'figure',
    node_id: 'james-lacatski',
    node_label: 'Dr. James Lacatski',
    relationship: 'Co-authored "Skinwalkers at the Pentagon" (2021), drawing on Lacatski\'s DIA insider perspective',
    connection_type: 'publication',
  },
  {
    event_index: 9,
    node_type: 'figure',
    node_id: 'jeremy-corbell',
    node_label: 'Jeremy Corbell',
    relationship: 'Co-hosts Weaponized podcast; together published leaked UAP imagery and classified documents',
    connection_type: 'collaboration',
  },
];

// ─── Leslie Kean ─────────────────────────────────────────────────────────────
// key_events[0]=1999 COMETA, [1]=2000 Coalition for Freedom of Information,
// [2]=2000-2009 building sources, [3]=2010 UFOs book,
// [4]=2010-2017 building connections, [5]=2017-12-16 NYT article,
// [6]=2019-04-26 follow-up NYT, [7]=2019 more NYT, [8]=2019 Surviving Death
const keanConnections = [
  {
    event_index: 5,
    node_type: 'figure',
    node_id: 'luis-elizondo',
    node_label: 'Luis Elizondo',
    relationship: 'Elizondo was Kean\'s primary government source for the landmark 2017 NYT AATIP article',
    connection_type: 'collaboration',
  },
  {
    event_index: 5,
    node_type: 'figure',
    node_id: 'chris-mellon',
    node_label: 'Chris Mellon',
    relationship: 'Mellon facilitated release of Navy UAP videos to the media, enabling the 2017 article',
    connection_type: 'collaboration',
  },
  {
    event_index: 5,
    node_type: 'figure',
    node_id: 'harry-reid',
    node_label: 'Sen. Harry Reid',
    relationship: 'Reid was named in the article as AATIP\'s political architect; his $22M appropriation was the story\'s foundation',
    connection_type: 'investigation',
  },
  {
    event_index: 5,
    node_type: 'program',
    node_id: 'aatip',
    node_label: 'AATIP',
    relationship: 'Co-authored the article that revealed AATIP\'s existence for the first time; triggered the disclosure era',
    connection_type: 'investigation',
  },
  {
    event_index: 3,
    node_type: 'figure',
    node_id: 'john-podesta',
    node_label: 'John Podesta',
    relationship: 'Wrote the foreword to Kean\'s 2010 book, lending significant political credibility',
    connection_type: 'publication',
  },
];

// ─── Ross Coulthart ──────────────────────────────────────────────────────────
// key_events[0]=1990s-2010s career, [1]=2020 begins UAP investigation,
// [2]=2021 In Plain Sight, [3]=2023-06-05 Grusch interview,
// [4]=2023 continues reporting, [5]=2024 Gallaudet interviews,
// [6]=2025-01 Barber story, [7]=2025 ongoing
const coulthartConnections = [
  {
    event_index: 3,
    node_type: 'figure',
    node_id: 'david-grusch',
    node_label: 'David Grusch',
    relationship: 'Conducted Grusch\'s first major televised interview; credited with ensuring the disclosure was taken seriously',
    connection_type: 'collaboration',
  },
  {
    event_index: 5,
    node_type: 'figure',
    node_id: 'tim-gallaudet',
    node_label: 'Tim Gallaudet',
    relationship: 'Gallaudet appeared in multiple NewsNation specials with Coulthart on the underwater UAP domain',
    connection_type: 'collaboration',
  },
  {
    event_index: 6,
    node_type: 'figure',
    node_id: 'jake-barber',
    node_label: 'Jake Barber',
    relationship: 'Broke the Barber story exclusively; presented never-before-seen retrieval footage and four corroborating veterans',
    connection_type: 'investigation',
  },
];

// ─── Richard Dolan ───────────────────────────────────────────────────────────
// key_events[0]=1995 begins research, [1]=2002 Vol 1, [2]=2009 Vol 2,
// [3]=2012 breakaway civilization, [4]=2012 AD After Disclosure,
// [5]=2014-present Dolan Show, [6]=2017 NYT validates, [7]=2023-present commentary
const dolanConnections = [
  {
    event_index: 1,
    node_type: 'figure',
    node_id: 'stanton-friedman',
    node_label: 'Stanton Friedman',
    relationship: 'Both produced rigorous document-based UAP histories; Friedman\'s nuclear physicist background complemented Dolan\'s Cold War historian approach',
    connection_type: 'collaboration',
  },
  {
    event_index: 1,
    node_type: 'figure',
    node_id: 'donald-keyhoe',
    node_label: 'Donald Keyhoe',
    relationship: 'Keyhoe\'s NICAP documentation of military cases provided foundational archival material that Dolan\'s research built upon',
    connection_type: 'mentorship',
  },
  {
    event_index: 6,
    node_type: 'figure',
    node_id: 'leslie-kean',
    node_label: 'Leslie Kean',
    relationship: 'Kean\'s journalism drew on Dolan\'s archival framework; both prioritized named sources and documentary evidence',
    connection_type: 'collaboration',
  },
  {
    event_index: 2,
    node_type: 'figure',
    node_id: 'jacques-vallee',
    node_label: 'Jacques Vallee',
    relationship: 'Both approached UAP with academic rigor; Dolan\'s institutional history complements Vallee\'s scientific investigation',
    connection_type: 'collaboration',
  },
];

// ─── Robert Hastings ─────────────────────────────────────────────────────────
// key_events[0]=1967 Malmstrom witness, [1]=1973 begins testimony collection,
// [2]=1981 college lectures, [3]=2008 UFOs and Nukes book,
// [4]=Sep 2010 National Press Club, [5]=2015 documentary
const hastingsConnections = [
  {
    event_index: 1,
    node_type: 'figure',
    node_id: 'donald-keyhoe',
    node_label: 'Donald Keyhoe',
    relationship: 'Keyhoe\'s NICAP work provided methodological framework and historical precedent for Hastings\'s nuclear witness research',
    connection_type: 'mentorship',
  },
  {
    event_index: 3,
    node_type: 'figure',
    node_id: 'stanton-friedman',
    node_label: 'Stanton Friedman',
    relationship: 'Friedman\'s document-analysis approach complemented Hastings\'s witness testimony methodology; collaborated at research conferences',
    connection_type: 'collaboration',
  },
];

// ─── Jesse Michels ───────────────────────────────────────────────────────────
// key_events[0]=2021 launches American Alchemy, [1]=Dec 2021 Nolan interview,
// [2]=Feb 2022 Puthoff debate, [3]=Sep 2023 Grusch interview,
// [4]=Oct 2024 Elizondo documentary, [5]=Mar 2026 Weinstein/Davis discussion
const michelsConnections = [
  {
    event_index: 1,
    node_type: 'figure',
    node_id: 'garry-nolan',
    node_label: 'Garry Nolan',
    relationship: 'Early interview on CIA engagement with UAP experiencers and anomalous isotope ratios; helped establish Nolan\'s public profile',
    connection_type: 'collaboration',
  },
  {
    event_index: 2,
    node_type: 'figure',
    node_id: 'hal-puthoff',
    node_label: 'Hal Puthoff',
    relationship: 'Featured Puthoff in a landmark debate with Eric Weinstein on UAP physics and government secrecy',
    connection_type: 'collaboration',
  },
  {
    event_index: 3,
    node_type: 'figure',
    node_id: 'david-grusch',
    node_label: 'David Grusch',
    relationship: 'Conducted one of Grusch\'s earliest pre-testimony interviews; helped establish his public credibility before the July 2023 hearing',
    connection_type: 'collaboration',
  },
  {
    event_index: 4,
    node_type: 'figure',
    node_id: 'luis-elizondo',
    node_label: 'Luis Elizondo',
    relationship: 'Produced a documentary-length interview covering Elizondo\'s full AATIP and disclosure arc',
    connection_type: 'collaboration',
  },
  {
    event_index: 5,
    node_type: 'figure',
    node_id: 'eric-davis',
    node_label: 'Eric Davis',
    relationship: 'Multi-hour discussion on crash retrieval physics and program compartmentalization alongside Eric Weinstein',
    connection_type: 'collaboration',
  },
];

// ─── Apply all ───────────────────────────────────────────────────────────────
const batch = [
  { id: 'knapp', connections: knappConnections },
  { id: 'kean', connections: keanConnections },
  { id: 'coulthart', connections: coulthartConnections },
  { id: 'dolan', connections: dolanConnections },
  { id: 'robert-hastings', connections: hastingsConnections },
  { id: 'jesse-michels', connections: michelsConnections },
];

for (const { id, connections } of batch) {
  const data = load(id);
  const eventCount = data.profile.key_events?.length ?? 0;
  validate(id, connections, eventCount);
  data.career_connections = connections;
  save(id, data);
  console.log(`Updated ${id}.json with ${connections.length} career_connections (${eventCount} events)`);
}

console.log('\nBatch 3 complete.');
