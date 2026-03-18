/**
 * One-time script: adds provenance_chain arrays to 7 documents.
 * Run with: node scripts/add-provenance-chains.js
 */
const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '../data/documents.json');
const docs = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

const CHAINS = {
  'wilson-davis-memo': [
    {
      id: 'creation',
      label: 'Authored by Eric Davis',
      description: 'Dr. Eric W. Davis, EarthTech International, recorded a meeting with Vice Admiral Thomas Wilson in a Las Vegas parking lot.',
      date: 'Oct 2002',
      type: 'creation',
    },
    {
      id: 'mitchell-estate',
      label: 'Edgar Mitchell Estate',
      description: 'Document found among the files of Apollo 14 astronaut Dr. Edgar Mitchell after his death in February 2016.',
      date: 'c. 2016',
      type: 'transfer',
    },
    {
      id: 'researcher-copy',
      label: 'Grant Cameron',
      description: 'Canadian UFO researcher Grant Cameron confirmed possession of a copy, received from the Mitchell estate network.',
      date: 'c. 2018',
      type: 'transfer',
    },
    {
      id: 'public-release',
      label: 'Public Release',
      description: 'Posted online by the Greer/Doty/Basterfield research network; rapidly mirrored across platforms.',
      date: 'Jun 2019',
      type: 'leak',
    },
    {
      id: 'archive',
      label: 'Publicly Archived',
      description: 'Hosted on multiple document repositories including The Black Vault and UFO researcher archives.',
      date: '2019-present',
      type: 'archive',
    },
  ],

  'twining-memo-1947': [
    {
      id: 'creation',
      label: 'Authored by Gen. Twining',
      description: 'Lt. Gen. Nathan F. Twining, Commanding General Army Air Forces, drafted memo to Brig. Gen. Schulgen at AMC, Wright-Patterson.',
      date: 'Sep 23, 1947',
      type: 'creation',
    },
    {
      id: 'classification',
      label: 'Classified SECRET',
      description: 'Classified SECRET by the USAAF under the emerging postwar national security framework.',
      date: '1947',
      type: 'classification',
    },
    {
      id: 'declassification',
      label: 'Declassified',
      description: 'Declassified as part of the USAF Project Blue Book records transfer to the National Archives.',
      date: '1969',
      type: 'declassification',
    },
    {
      id: 'foia',
      label: 'FOIA / Public Access',
      description: 'Entered full public access via FOIA requests and NARA microfilm records of Project Blue Book.',
      date: '1975-1984',
      type: 'foia',
    },
    {
      id: 'archive',
      label: 'National Archives (NARA)',
      description: 'Held in Record Group 341 at NARA, College Park, MD. Also digitized and hosted by The Black Vault.',
      date: 'present',
      type: 'archive',
    },
  ],

  'schulgen-memo-1947': [
    {
      id: 'creation',
      label: 'Authored by Brig. Gen. Schulgen',
      description: 'Brig. Gen. George F. Schulgen, Air Intelligence Requirements Division, drafted intelligence collection directive on "flying discs."',
      date: 'Oct 30, 1947',
      type: 'creation',
    },
    {
      id: 'classification',
      label: 'Classified SECRET',
      description: 'Classified SECRET; circulated within AMC, Air Intelligence, and FBI liaison channels.',
      date: '1947',
      type: 'classification',
    },
    {
      id: 'declassification',
      label: 'Declassified',
      description: 'Declassified with Blue Book records upon program termination and congressional pressure.',
      date: '1969',
      type: 'declassification',
    },
    {
      id: 'foia',
      label: 'FOIA Release',
      description: 'Released via FOIA requests to researchers studying the FBI and USAF joint early UFO investigations.',
      date: '1970s-1980s',
      type: 'foia',
    },
    {
      id: 'archive',
      label: 'NARA / FBI Vault',
      description: 'Available at NARA (Project Blue Book records) and FBI Vault digital archive.',
      date: 'present',
      type: 'archive',
    },
  ],

  'halt-memo-1981': [
    {
      id: 'creation',
      label: 'Authored by Lt. Col. Halt',
      description: 'Lt. Col. Charles I. Halt, Deputy Base Commander at RAF Bentwaters, authored memo documenting the Rendlesham Forest incident.',
      date: 'Jan 13, 1981',
      type: 'creation',
    },
    {
      id: 'classification',
      label: 'Restricted Within DoD',
      description: 'Circulated within RAF and USAF command structure; formally classified within DoD routing.',
      date: '1981',
      type: 'classification',
    },
    {
      id: 'foia',
      label: 'Obtained via FOIA',
      description: 'Obtained by researcher Barry Greenwood through a FOIA request to the Department of Defense.',
      date: 'Jan 1984',
      type: 'foia',
    },
    {
      id: 'public-release',
      label: 'Published by CAUS',
      description: 'Published in the Citizens Against UFO Secrecy (CAUS) newsletter by Peter Gersten, making it the first confirmed official UAP record for the Rendlesham case.',
      date: '1984',
      type: 'public',
    },
    {
      id: 'uk-archive',
      label: 'UK National Archives',
      description: 'UK Ministry of Defence files including the Halt memo released to the UK National Archives under a 30-year rule review.',
      date: '2009',
      type: 'archive',
    },
  ],

  'uaptf-preliminary-assessment': [
    {
      id: 'creation',
      label: 'Produced by UAPTF / ODNI',
      description: 'Produced by the UAP Task Force with ODNI oversight per Section 1603 of the National Defense Authorization Act FY2020.',
      date: 'Jun 2021',
      type: 'creation',
    },
    {
      id: 'declassification',
      label: 'Unclassified Version Prepared',
      description: 'An unclassified version was prepared for public release; a classified annex was delivered separately to congressional intelligence committees.',
      date: 'Jun 2021',
      type: 'declassification',
    },
    {
      id: 'public-release',
      label: 'Released by ODNI',
      description: 'Released publicly by the Office of the Director of National Intelligence on the ODNI website.',
      date: 'Jun 25, 2021',
      type: 'public',
    },
    {
      id: 'archive',
      label: 'ODNI Website',
      description: 'Hosted on the official ODNI website as a permanent public record.',
      date: '2021-present',
      type: 'archive',
    },
  ],

  'elizondo-resignation-letter-2017': [
    {
      id: 'creation',
      label: 'Written by Luis Elizondo',
      description: 'Written by Luis Elizondo, Director of AATIP, addressed to Secretary of Defense James Mattis, citing lack of resources and institutional resistance to UAP transparency.',
      date: 'Oct 4, 2017',
      type: 'creation',
    },
    {
      id: 'transfer',
      label: 'Submitted to DoD SAPCO',
      description: 'Submitted through official DoD Special Access Programs Central Office (SAPCO) channels upon Elizondo\'s resignation.',
      date: 'Oct 2017',
      type: 'transfer',
    },
    {
      id: 'public-release',
      label: 'Released via TTSA',
      description: 'Released publicly by Elizondo through To The Stars Academy of Arts and Science (TTSA) to demonstrate the existence of AATIP.',
      date: '2018',
      type: 'public',
    },
    {
      id: 'archive',
      label: 'Publicly Archived',
      description: 'Hosted on multiple document platforms and cited in congressional UAP disclosure hearings as evidence of institutional suppression.',
      date: '2018-present',
      type: 'archive',
    },
  ],

  'robertson-panel-1953': [
    {
      id: 'creation',
      label: 'CIA Scientific Advisory Panel',
      description: 'Convened by the CIA under physicist H.P. Robertson. Five-day review of USAF UFO evidence concluded cases posed no direct threat but recommended debunking efforts.',
      date: 'Jan 1953',
      type: 'creation',
    },
    {
      id: 'classification',
      label: 'Classified SECRET',
      description: 'Full report classified SECRET by CIA; summary distributed to senior intelligence and USAF officials only.',
      date: '1953',
      type: 'classification',
    },
    {
      id: 'declassification-partial',
      label: 'Partial Declassification',
      description: 'A sanitized version released following congressional pressure and public interest in UFO secrecy.',
      date: '1966',
      type: 'declassification',
    },
    {
      id: 'declassification-full',
      label: 'Full Declassification',
      description: 'Full text declassified and released via the CIA FOIA Reading Room and CREST database.',
      date: '1975',
      type: 'foia',
    },
    {
      id: 'archive',
      label: 'CIA FOIA Reading Room',
      description: 'Available via CIA CREST (CREST: 25X1-human) database and the National Security Archive at George Washington University.',
      date: 'present',
      type: 'archive',
    },
  ],
};

let updated = 0;
const result = docs.map(doc => {
  if (CHAINS[doc.id]) {
    updated++;
    return { ...doc, provenance_chain: CHAINS[doc.id] };
  }
  return doc;
});

fs.writeFileSync(DATA_PATH, JSON.stringify(result, null, 2) + '\n');
console.log(`Updated ${updated} documents with provenance_chain data.`);
