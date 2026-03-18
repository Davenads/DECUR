const fs = require('fs');
const path = require('path');

const updates = {
  'puthoff.json': [
    {
      event_index: 3,
      node_type: 'figure',
      node_id: 'eric-davis',
      node_label: 'Eric Davis',
      relationship: 'Davis later joined EarthTech and co-authored AAWSAP DIRDs with Puthoff; the STARGATE-era theoretical framework directly informed their exotic propulsion research',
      connection_type: 'collaboration'
    },
    {
      event_index: 8,
      node_type: 'program',
      node_id: 'aawsap',
      node_label: 'AAWSAP',
      relationship: 'Authored at least 6 of 38 Defense Intelligence Reference Documents covering traversable wormholes, warp drives, and metric engineering under AAWSAP',
      connection_type: 'institutional'
    },
    {
      event_index: 8,
      node_type: 'figure',
      node_id: 'robert-bigelow',
      node_label: 'Robert Bigelow',
      relationship: 'AAWSAP research was contracted through Bigelow BAASS; a long-term research relationship spanning NIDS and AAWSAP programs',
      connection_type: 'institutional'
    },
    {
      event_index: 9,
      node_type: 'program',
      node_id: 'ttsa',
      node_label: 'To The Stars Academy',
      relationship: 'Co-founded TTSA in October 2017 as the theoretical physics lead alongside Elizondo, Mellon, and DeLonge',
      connection_type: 'institutional'
    },
    {
      event_index: 9,
      node_type: 'figure',
      node_id: 'luis-elizondo',
      node_label: 'Luis Elizondo',
      relationship: 'TTSA co-founder; Elizondo provided the operational UAP intelligence perspective while Puthoff provided the theoretical physics framework',
      connection_type: 'collaboration'
    },
    {
      event_index: 9,
      node_type: 'figure',
      node_id: 'garry-nolan',
      node_label: 'Garry Nolan',
      relationship: 'Puthoff is cited by Nolan as a key figure in the insider physics network; their biological and physics research approaches are mutually reinforcing',
      connection_type: 'collaboration'
    }
  ],

  'davis.json': [
    {
      event_index: 2,
      node_type: 'figure',
      node_id: 'hal-puthoff',
      node_label: 'Hal Puthoff',
      relationship: 'Joined EarthTech International as Senior Research Physicist under Puthoff; became long-term collaborators on exotic propulsion theory and AAWSAP research topics',
      connection_type: 'institutional'
    },
    {
      event_index: 3,
      node_type: 'document',
      node_id: 'wilson-davis-memo',
      node_label: 'Wilson-Davis Memo',
      relationship: 'Davis authored the memo documenting Adm. Wilson description of being denied access to a private aerospace contractor managing an off-world vehicle program',
      connection_type: 'publication'
    },
    {
      event_index: 3,
      node_type: 'figure',
      node_id: 'david-grusch',
      node_label: 'David Grusch',
      relationship: 'The Wilson-Davis memo became foundational to understanding denied-access UAP programs; its 2019 leak directly informed Grusch investigation of classified compartments',
      connection_type: 'collaboration'
    },
    {
      event_index: 4,
      node_type: 'program',
      node_id: 'aawsap',
      node_label: 'AAWSAP',
      relationship: 'Co-authored multiple DIRDs on traversable wormholes and warp drives under the AAWSAP contract administered through Bigelow BAASS',
      connection_type: 'institutional'
    },
    {
      event_index: 7,
      node_type: 'figure',
      node_id: 'luis-elizondo',
      node_label: 'Luis Elizondo',
      relationship: 'Davis 2019 classified congressional briefings on UAP materials preceded and reinforced the broader Elizondo disclosure campaign on Capitol Hill',
      connection_type: 'collaboration'
    }
  ],

  'nolan.json': [
    {
      event_index: 1,
      node_type: 'figure',
      node_id: 'hal-puthoff',
      node_label: 'Hal Puthoff',
      relationship: 'Puthoff was part of the insider physics network that connected Nolan to CIA-adjacent UAP research; both are cited as core figures in the technical disclosure community',
      connection_type: 'collaboration'
    },
    {
      event_index: 5,
      node_type: 'figure',
      node_id: 'jacques-vallee',
      node_label: 'Jacques Vallee',
      relationship: 'Co-authored the 2022 Progress in Aerospace Sciences paper on UAP detection methodology - first peer-reviewed UAP methods paper in a major aerospace journal',
      connection_type: 'publication'
    },
    {
      event_index: 6,
      node_type: 'program',
      node_id: 'sol-foundation',
      node_label: 'Sol Foundation',
      relationship: 'Co-founded October 2023 at Stanford alongside Karl Nell, David Grusch, and Dr. Peter Skafish following the congressional hearing season',
      connection_type: 'institutional'
    },
    {
      event_index: 6,
      node_type: 'figure',
      node_id: 'david-grusch',
      node_label: 'David Grusch',
      relationship: 'Co-founded Sol Foundation; Nolan Stanford affiliation and scientific credibility provide academic legitimacy to the organization Grusch helped launch',
      connection_type: 'collaboration'
    },
    {
      event_index: 6,
      node_type: 'figure',
      node_id: 'karl-nell',
      node_label: 'Karl Nell',
      relationship: 'Co-founded Sol Foundation together; Nell Army intelligence background and Nolan scientific credibility are complementary institutional anchors for the organization',
      connection_type: 'collaboration'
    }
  ],

  'lacatski.json': [
    {
      event_index: 1,
      node_type: 'figure',
      node_id: 'harry-reid',
      node_label: 'Harry Reid',
      relationship: 'Worked with Reid office and DIA leadership to structure the $22M AAWSAP appropriation; Reid was the political architect who secured the funding',
      connection_type: 'institutional'
    },
    {
      event_index: 2,
      node_type: 'program',
      node_id: 'aawsap',
      node_label: 'AAWSAP',
      relationship: 'Served as the DIA program manager overseeing AAWSAP, directing 38 DIRDs on advanced aerospace topics and Skinwalker Ranch phenomena over four years',
      connection_type: 'institutional'
    },
    {
      event_index: 2,
      node_type: 'figure',
      node_id: 'robert-bigelow',
      node_label: 'Robert Bigelow',
      relationship: 'AAWSAP contract was awarded to Bigelow BAASS; Lacatski managed the DIA relationship with Bigelow as prime contractor throughout the program',
      connection_type: 'institutional'
    },
    {
      event_index: 3,
      node_type: 'figure',
      node_id: 'hal-puthoff',
      node_label: 'Hal Puthoff',
      relationship: 'Puthoff authored multiple DIRDs on traversable wormholes and metric engineering that were commissioned under AAWSAP while Lacatski served as program manager',
      connection_type: 'collaboration'
    },
    {
      event_index: 5,
      node_type: 'figure',
      node_id: 'george-knapp',
      node_label: 'George Knapp',
      relationship: 'Co-authored Skinwalkers at the Pentagon (2021) - the most detailed insider account of AAWSAP scope, findings, and institutional history',
      connection_type: 'publication'
    }
  ],

  'avi-loeb.json': [
    {
      event_index: 2,
      node_type: 'figure',
      node_id: 'garry-nolan',
      node_label: 'Garry Nolan',
      relationship: 'Both advocate for rigorous peer-reviewed UAP research at major academic institutions; Nolan biological materials analysis complements Loeb astronomical and materials science approach',
      connection_type: 'collaboration'
    },
    {
      event_index: 4,
      node_type: 'figure',
      node_id: 'tim-gallaudet',
      node_label: 'Tim Gallaudet',
      relationship: 'Gallaudet oceanographic expertise aligns with the Galileo Project trans-medium and undersea UAP focus; both testified at the November 2024 House hearing',
      connection_type: 'collaboration'
    },
    {
      event_index: 5,
      node_type: 'figure',
      node_id: 'jake-barber',
      node_label: 'Jake Barber',
      relationship: 'Co-testified at the November 13, 2024 Exposing the Truth joint House hearing on UAP alongside Barber and other witnesses',
      connection_type: 'testimony'
    }
  ],

  'vallee.json': [
    {
      event_index: 3,
      node_type: 'figure',
      node_id: 'j-allen-hynek',
      node_label: 'J. Allen Hynek',
      relationship: 'Met Hynek at Northwestern and began the most formative UAP research collaboration of his career; Hynek called Vallee the most rigorous scientific mind he encountered in UAP research',
      connection_type: 'mentorship'
    },
    {
      event_index: 11,
      node_type: 'program',
      node_id: 'nids',
      node_label: 'NIDS',
      relationship: 'Served as scientific advisor to Bigelow National Institute for Discovery Science from 1995-2004, contributing methodology and case analysis to the research program',
      connection_type: 'institutional'
    },
    {
      event_index: 11,
      node_type: 'figure',
      node_id: 'robert-bigelow',
      node_label: 'Robert Bigelow',
      relationship: 'Bigelow engaged Vallee as NIDS scientific advisor for nearly a decade; both shared an evidence-based investigative approach to anomalous phenomena',
      connection_type: 'institutional'
    },
    {
      event_index: 15,
      node_type: 'figure',
      node_id: 'garry-nolan',
      node_label: 'Garry Nolan',
      relationship: 'Co-authored the 2021 Progress in Aerospace Sciences paper on UAP detection methodology - the first peer-reviewed UAP methods paper in a major aerospace journal',
      connection_type: 'publication'
    },
    {
      event_index: 16,
      node_type: 'figure',
      node_id: 'david-grusch',
      node_label: 'David Grusch',
      relationship: 'Participates alongside Grusch in Sol Foundation activities as the elder statesman of scientific UAP research following the 2023 congressional disclosure hearings',
      connection_type: 'collaboration'
    }
  ]
};

Object.entries(updates).forEach(([filename, connections]) => {
  const filepath = path.join('./data/key-figures', filename);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

  // Validate all event_index values
  const eventCount = data.profile.key_events?.length ?? 0;
  connections.forEach(c => {
    if (c.event_index >= eventCount) {
      console.error(`WARN: ${filename} event_index ${c.event_index} out of range (has ${eventCount} events)`);
    }
  });

  data.career_connections = connections;
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`Updated: ${filename} (${connections.length} connections)`);
});
