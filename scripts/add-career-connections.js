const fs = require('fs');
const path = require('path');

const updates = {
  'grusch.json': [
    {
      event_index: 4,
      node_type: 'program',
      node_id: 'uap-task-force',
      node_label: 'UAP Task Force',
      relationship: 'Detailed as NRO representative in 2019; began identifying classified SAP and CAP compartments related to UAP programs',
      connection_type: 'institutional'
    },
    {
      event_index: 6,
      node_type: 'figure',
      node_id: 'leslie-kean',
      node_label: 'Leslie Kean',
      relationship: 'Co-authored the June 5, 2023 Debrief article that first named Grusch publicly, lending immediate journalistic credibility',
      connection_type: 'publication'
    },
    {
      event_index: 8,
      node_type: 'program',
      node_id: 'sol-foundation',
      node_label: 'Sol Foundation',
      relationship: 'Co-founded upon departing government service with Karl Nell, Dr. Garry Nolan, and Dr. Peter Skafish',
      connection_type: 'institutional'
    },
    {
      event_index: 10,
      node_type: 'figure',
      node_id: 'ross-coulthart',
      node_label: 'Ross Coulthart',
      relationship: 'Conducted first televised interview on NewsNation in June 2023; longtime UAP investigative reporter who contextualized the disclosures',
      connection_type: 'collaboration'
    },
    {
      event_index: 11,
      node_type: 'figure',
      node_id: 'chuck-schumer',
      node_label: 'Chuck Schumer',
      relationship: 'Introduced the UAP Disclosure Act as NDAA amendment in July 2023 directly in response to the disclosures',
      connection_type: 'institutional'
    },
    {
      event_index: 12,
      node_type: 'figure',
      node_id: 'ryan-graves',
      node_label: 'Ryan Graves',
      relationship: 'Co-testified at July 26, 2023 House Oversight hearing; Graves encounter data grounded the broader program-level disclosures',
      connection_type: 'testimony'
    },
    {
      event_index: 12,
      node_type: 'figure',
      node_id: 'david-fravor',
      node_label: 'David Fravor',
      relationship: 'Co-testified at July 26, 2023 hearing; Fravor Tic Tac account provided the direct experiential anchor for the session',
      connection_type: 'testimony'
    },
    {
      event_index: 12,
      node_type: 'figure',
      node_id: 'karl-nell',
      node_label: 'Karl Nell',
      relationship: 'Nell corroborated existence of classified UAP programs at the same July 2023 hearing, lending institutional military weight',
      connection_type: 'testimony'
    }
  ],

  'mellon.json': [
    {
      event_index: 5,
      node_type: 'program',
      node_id: 'ttsa',
      node_label: 'To The Stars Academy',
      relationship: 'Joined as Senior National Security Affairs Advisor alongside Luis Elizondo and Dr. Hal Puthoff in 2017',
      connection_type: 'institutional'
    },
    {
      event_index: 5,
      node_type: 'figure',
      node_id: 'luis-elizondo',
      node_label: 'Luis Elizondo',
      relationship: 'TTSA co-advisor; coordinated the strategy to release Nimitz videos and deliver congressional UAP briefings',
      connection_type: 'collaboration'
    },
    {
      event_index: 6,
      node_type: 'figure',
      node_id: 'david-fravor',
      node_label: 'David Fravor',
      relationship: 'Mellon facilitated release of the FLIR1 Tic Tac video to the NY Times - footage from the Fravor 2004 encounter',
      connection_type: 'collaboration'
    },
    {
      event_index: 9,
      node_type: 'figure',
      node_id: 'harry-reid',
      node_label: 'Harry Reid',
      relationship: 'Coordinated on UAP Task Force legislation via Rubio-Gillibrand channels; shared disclosure goals with Reid',
      connection_type: 'collaboration'
    },
    {
      event_index: 10,
      node_type: 'figure',
      node_id: 'david-grusch',
      node_label: 'David Grusch',
      relationship: 'Coordinated with Grusch attorney on whistleblower protections in 2022; ICIG complaint aligned with the legislative strategy',
      connection_type: 'collaboration'
    },
    {
      event_index: 11,
      node_type: 'figure',
      node_id: 'ryan-graves',
      node_label: 'Ryan Graves',
      relationship: 'Provided Congressional member briefings supporting the July 2023 House hearing featuring Graves, Grusch, and Fravor',
      connection_type: 'collaboration'
    }
  ],

  'graves.json': [
    {
      event_index: 3,
      node_type: 'figure',
      node_id: 'luis-elizondo',
      node_label: 'Luis Elizondo',
      relationship: 'Elizondo identified military pilot stigma through AATIP; Graves June 2019 NY Times account directly validated this finding',
      connection_type: 'collaboration'
    },
    {
      event_index: 4,
      node_type: 'figure',
      node_id: 'chris-mellon',
      node_label: 'Christopher Mellon',
      relationship: 'Mellon provided behind-the-scenes Congressional coordination and briefings supporting Americans for Safe Aerospace',
      connection_type: 'collaboration'
    },
    {
      event_index: 5,
      node_type: 'figure',
      node_id: 'david-grusch',
      node_label: 'David Grusch',
      relationship: 'Co-testified at July 26, 2023 House Oversight hearing; Graves encounter evidence grounded the program-level disclosures',
      connection_type: 'testimony'
    },
    {
      event_index: 5,
      node_type: 'figure',
      node_id: 'david-fravor',
      node_label: 'David Fravor',
      relationship: 'Co-testified with Fravor at July 2023 hearing; both represent the military aviator class of UAP witnesses',
      connection_type: 'testimony'
    },
    {
      event_index: 5,
      node_type: 'figure',
      node_id: 'karl-nell',
      node_label: 'Karl Nell',
      relationship: 'Nell testified alongside Graves and is affiliated with Sol Foundation, which overlaps with ASA advocacy work',
      connection_type: 'testimony'
    }
  ],

  'fravor.json': [
    {
      event_index: 2,
      node_type: 'figure',
      node_id: 'alex-dietrich',
      node_label: 'Alex Dietrich',
      relationship: 'Dietrich piloted the second F/A-18 during the Tic Tac encounter; first public corroborating account on 60 Minutes in 2021',
      connection_type: 'collaboration'
    },
    {
      event_index: 5,
      node_type: 'program',
      node_id: 'aatip',
      node_label: 'AATIP',
      relationship: 'The Nimitz encounter was the central AATIP case; FLIR1 video became the most studied evidence from the program',
      connection_type: 'investigation'
    },
    {
      event_index: 5,
      node_type: 'figure',
      node_id: 'luis-elizondo',
      node_label: 'Luis Elizondo',
      relationship: 'Elizondo released the FLIR1 Tic Tac video through AATIP and TTSA in 2017; Fravor encounter was the primary AATIP case',
      connection_type: 'collaboration'
    },
    {
      event_index: 7,
      node_type: 'figure',
      node_id: 'david-grusch',
      node_label: 'David Grusch',
      relationship: 'Co-testified at July 26, 2023 House hearing; Fravor direct encounter provided experiential grounding for Grusch program disclosures',
      connection_type: 'testimony'
    },
    {
      event_index: 7,
      node_type: 'figure',
      node_id: 'ryan-graves',
      node_label: 'Ryan Graves',
      relationship: 'Co-testified at July 2023 hearing; both military aviator witnesses whose combined accounts anchored the congressional session',
      connection_type: 'testimony'
    }
  ],

  'nell.json': [
    {
      event_index: 4,
      node_type: 'figure',
      node_id: 'david-grusch',
      node_label: 'David Grusch',
      relationship: 'Connected with Grusch through the UAP research community in 2022; Grusch network brought Nell into the active disclosure circle',
      connection_type: 'collaboration'
    },
    {
      event_index: 4,
      node_type: 'figure',
      node_id: 'garry-nolan',
      node_label: 'Garry Nolan',
      relationship: 'Connected through UAP research community in 2022; later co-founded Sol Foundation with Nell at Stanford University',
      connection_type: 'collaboration'
    },
    {
      event_index: 5,
      node_type: 'figure',
      node_id: 'david-fravor',
      node_label: 'David Fravor',
      relationship: 'Co-testified at July 26, 2023 House hearing; Fravor encounter testimony provided operational grounding for Nell program corroborations',
      connection_type: 'testimony'
    },
    {
      event_index: 5,
      node_type: 'figure',
      node_id: 'ryan-graves',
      node_label: 'Ryan Graves',
      relationship: 'Co-testified at July 2023 hearing; both affiliated with the Sol Foundation UAP research and advocacy ecosystem',
      connection_type: 'testimony'
    },
    {
      event_index: 6,
      node_type: 'program',
      node_id: 'sol-foundation',
      node_label: 'Sol Foundation',
      relationship: 'Co-founded October 2023 at Stanford alongside Grusch, Dr. Garry Nolan, and Dr. Peter Skafish after the congressional hearing',
      connection_type: 'institutional'
    }
  ]
};

Object.entries(updates).forEach(([filename, connections]) => {
  const filepath = path.join('./data/key-figures', filename);
  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));
  data.career_connections = connections;
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log('Updated:', filename, '(' + connections.length + ' connections)');
});
