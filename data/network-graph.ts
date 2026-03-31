export type NodeType =
  | 'person'
  | 'facility'
  | 'entity'
  | 'organization'
  | 'project'
  | 'concept'
  | 'technology'
  | 'document'
  | 'case'
  | 'contractor';

export type NodeGroup = 'burisch' | 'lazar' | 'grusch' | 'elizondo' | 'fravor' | 'nell' | 'nolan' | 'puthoff' | 'mellon' | 'davis' | 'bigelow' | 'vallee' | 'pope' | 'shared' | 'corbell' | 'mccullough';

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  group?: NodeGroup; // optional — auto-derived person nodes may omit this
  val?: number; // relative size weight
  aliases?: string[]; // alternate names for search matching
  // injected at runtime by force-graph
  x?: number;
  y?: number;
}

export interface GraphLink {
  source: string;
  target: string;
  label: string;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export const NODE_COLORS: Record<NodeType, string> = {
  person:       '#6da3d8', // blue - muted
  facility:     '#c9973a', // amber - muted
  entity:       '#9d7ec9', // purple - muted
  organization: '#3d9e96', // teal - muted
  project:      '#4ea86a', // green - muted
  concept:      '#7b7ec4', // indigo - muted
  technology:   '#c97840', // orange - muted
  document:     '#c04060', // rose - muted
  case:         '#c05050', // red - muted
  contractor:   '#b07050', // copper - muted
};

// Person nodes for figures WITHOUT dedicated profile pages.
// All profiled insiders are auto-derived from data/key-figures/index.json in NetworkGraph.tsx.
export const supplementaryPersonNodes: GraphNode[] = [
  // john-lear removed - now a profiled figure auto-derived from index.json
  { id: 'jim-slaight',        name: 'Jim Slaight',        type: 'person', group: 'fravor',   val: 2 },
  { id: 'charles-mccullough', name: 'Charles McCullough', type: 'person', group: 'mccullough', val: 3 },
];

export const graphData: GraphData = {
  nodes: [
    ...supplementaryPersonNodes,

    // Entities
    { id: 'chielah',             name: "Chi'el'ah (J-Rod)",    type: 'entity',       group: 'burisch', val: 4 },

    // Facilities
    { id: 's4-papoose',          name: 'S-4 / Papoose Lake',  type: 'facility',     group: 'shared',  val: 5 },
    { id: 'area-51',             name: 'Area 51 / Groom Lake', type: 'facility',     group: 'shared',  val: 3 },

    // Organizations
    { id: 'uap-task-force',      name: 'DoD UAP Task Force',   type: 'organization', group: 'shared',   val: 4 },
    { id: 'aaro',                name: 'AARO',                 type: 'organization', group: 'shared',   val: 3 },
    { id: 'nro',                 name: 'NRO',                  type: 'organization', group: 'grusch',   val: 3 },
    { id: 'sol-foundation',      name: 'Sol Foundation',       type: 'organization', group: 'shared',   val: 3 },
    { id: 'uss-nimitz',         name: 'USS Nimitz Strike Group', type: 'organization', group: 'fravor',  val: 3 },
    { id: 'vfa-41',             name: 'VFA-41 Black Aces',    type: 'organization', group: 'fravor',   val: 2 },
    { id: 'majestic-12',         name: 'Majestic-12',          type: 'organization', group: 'burisch',  val: 4 },
    { id: 'committee-majority',  name: 'Committee of Majority', type: 'organization', group: 'burisch', val: 3 },
    { id: 'egg-corporation',     name: 'EG&G',                 type: 'organization', group: 'lazar',    val: 2 },
    { id: 'los-alamos',          name: 'Los Alamos Lab',       type: 'organization', group: 'lazar',    val: 2 },
    { id: 'naval-intelligence',  name: 'Naval Intelligence',   type: 'organization', group: 'lazar',    val: 2 },
    { id: 'ttsa',                name: 'To The Stars Academy', type: 'organization', group: 'elizondo', val: 3 },
    { id: 'bigelow-aerospace',   name: 'Bigelow Aerospace',    type: 'organization', group: 'bigelow',  val: 3 },
    { id: 'nids',                name: 'NIDS',                 type: 'organization', group: 'bigelow',  val: 3 },
    { id: 'pentagon-ousd',       name: 'OUSD Intelligence',    type: 'organization', group: 'elizondo', val: 3 },
    { id: 'mod-ufo-desk',        name: 'MoD UFO Desk',         type: 'organization', group: 'pope',     val: 2 },

    // Projects
    { id: 'project-aquarius',    name: 'Project Aquarius',     type: 'project',      group: 'burisch',  val: 4 },
    { id: 'project-lotus',       name: 'Project Lotus',        type: 'project',      group: 'burisch',  val: 3 },
    { id: 'project-crystal',     name: 'Project Crystal',      type: 'project',      group: 'burisch',  val: 2 },
    { id: 'project-galileo',     name: 'Project Galileo',      type: 'project',      group: 'lazar',    val: 2 },
    { id: 'project-preserve',    name: 'Project Preserve Destiny', type: 'project',  group: 'burisch',  val: 2 },
    { id: 'aatip',               name: 'AATIP',                type: 'project',      group: 'elizondo', val: 5 },
    // Gerb-researched programs (mentioned across 5+ videos)
    { id: 'project-blue-book',   name: 'Project Blue Book',    type: 'project',      group: 'shared',   val: 4 },
    { id: 'project-grudge',      name: 'Project Grudge',       type: 'project',      group: 'shared',   val: 3 },
    { id: 'project-sign',        name: 'Project Sign',         type: 'project',      group: 'shared',   val: 3 },
    { id: 'disclosure-project',  name: 'Disclosure Project',   type: 'project',      group: 'shared',   val: 3 },
    { id: 'immaculate-constellation', name: 'Immaculate Constellation', type: 'project', group: 'shared', val: 4 },
    { id: 'project-moondust',    name: 'Project Moon Dust',    type: 'project',      group: 'shared',   val: 3 },
    { id: 'operation-paperclip', name: 'Operation Paperclip',  type: 'project',      group: 'shared',   val: 3 },
    { id: 'aawsap',              name: 'AAWSAP',               type: 'project',      group: 'shared',   val: 4 },
    { id: 'robertson-panel',     name: 'Robertson Panel',      type: 'organization', group: 'shared',   val: 3 },
    { id: 'kona-blue',           name: 'Kona Blue',            type: 'project',      group: 'shared',   val: 3 },
    { id: 'ipu',                 name: 'Interplanetary Phenomenon Unit', type: 'organization', group: 'shared', val: 3 },
    { id: 'nicap',               name: 'NICAP',                        type: 'organization', group: 'shared', val: 3 },
    { id: 'mufon',               name: 'MUFON',                        type: 'organization', group: 'shared', val: 3 },
    { id: 'jsoc',                name: 'JSOC',                         type: 'organization', group: 'shared', val: 3 },
    { id: 'afosi',               name: 'AFOSI',                        type: 'organization', group: 'shared', val: 3 },
    { id: 'oga',                 name: 'OGA (CIA)',                     type: 'organization', group: 'shared', val: 3 },
    { id: 'sdi',                 name: 'SDI',                          type: 'project',      group: 'shared', val: 3 },
    { id: 'seti',                name: 'SETI',                         type: 'organization', group: 'shared', val: 3 },

    // Concepts
    { id: 'five-observables',    name: '5 Observables',        type: 'concept',      group: 'elizondo', val: 3 },
    { id: 'looking-glass',       name: 'Looking Glass',        type: 'concept',      group: 'burisch',  val: 3 },
    { id: 'stargates',           name: 'Stargates',            type: 'concept',      group: 'burisch', val: 2 },
    { id: 'timeline-1',          name: 'Timeline 1',           type: 'concept',      group: 'burisch', val: 2 },
    { id: 'timeline-2',          name: 'Timeline 2',           type: 'concept',      group: 'burisch', val: 2 },
    { id: 'ganesh-particles',    name: 'Ganesh Particles',     type: 'concept',      group: 'burisch', val: 2 },
    { id: 'shiva-portals',       name: 'Shiva Portals',        type: 'concept',      group: 'burisch', val: 2 },
    { id: 'gravity-waves',       name: 'Gravity Waves',        type: 'concept',      group: 'lazar',   val: 2 },

    // Technologies
    { id: 'element-115',         name: 'Element 115',          type: 'technology',   group: 'lazar',   val: 3 },
    { id: 'gravity-amplifiers',  name: 'Gravity Amplifiers',   type: 'technology',   group: 'lazar',   val: 2 },
    { id: 'sport-model',         name: 'Sport Model Craft',    type: 'technology',   group: 'lazar',   val: 3 },
    { id: 'som1-01',             name: 'SOM1-01 Document',     type: 'concept',      group: 'burisch', val: 1 },

    // Additional Facilities
    { id: 'skinwalker-ranch', name: 'Skinwalker Ranch',  type: 'facility', group: 'shared', val: 3 },
    { id: 'malmstrom-afb',    name: 'Malmstrom AFB',     type: 'facility', group: 'shared', val: 2 },

    // Cases (sourced from data/cases.json)
    { id: 'nimitz-tic-tac',         name: 'Nimitz Tic Tac (2004)',         type: 'case', val: 5 },
    { id: 'rendlesham-forest',       name: 'Rendlesham Forest (1980)',      type: 'case', val: 4 },
    { id: 'roswell-1947',            name: 'Roswell Incident (1947)',       type: 'case', val: 5 },
    { id: 'washington-dc-1952',      name: 'Washington D.C. Flyover (1952)', type: 'case', val: 4 },
    { id: 'malmstrom-afb-1967',      name: 'Malmstrom AFB (1967)',          type: 'case', val: 3 },
    { id: 'uss-theodore-roosevelt',  name: 'USS Theodore Roosevelt (2014)', type: 'case', val: 4 },
    { id: 'ariel-school-1994',       name: 'Ariel School (1994)',           type: 'case', val: 3 },
    { id: 'iranian-f4-incident',     name: 'Iranian F-4 Incident (1976)',   type: 'case', val: 3 },
    { id: 'kecksburg-1965',          name: 'Kecksburg (1965)',              type: 'case', val: 3 },
    { id: 'jal-flight-1628',         name: 'JAL Flight 1628 (1986)',        type: 'case', val: 3 },

    // Documents (sourced from data/documents.json)
    { id: 'wilson-davis-memo',                name: 'Wilson-Davis Memo',          type: 'document', val: 3 },
    { id: 'uaptf-preliminary-assessment',     name: 'UAPTF Assessment 2021',      type: 'document', val: 3 },
    { id: 'aaro-historical-record-vol1',      name: 'AARO Report Vol. 1',         type: 'document', val: 4 },
    { id: 'aaro-historical-record-vol2-2024', name: 'AARO Report Vol. 2',         type: 'document', val: 2 },
    { id: 'nasa-uap-study-2023',              name: 'NASA UAP Study 2023',        type: 'document', val: 2 },
    { id: 'halt-memo-1981',                   name: 'Halt Memo 1981',             type: 'document', val: 2 },
    { id: 'ndaa-fy2023-uap-provisions',       name: 'NDAA FY2023 UAP',            type: 'document', val: 3 },
    { id: 'robertson-panel-1953',             name: 'Robertson Panel Report',     type: 'document', val: 3 },
    { id: 'blue-book-special-report-14',      name: 'Blue Book Special Report 14',type: 'document', val: 2 },
    { id: 'condon-report-1969',               name: 'Condon Report 1969',         type: 'document', val: 2 },
    { id: 'elizondo-resignation-letter-2017', name: 'Elizondo Resignation Letter',type: 'document', val: 2 },
    { id: 'twining-memo-1947',                name: 'Twining Memo 1947',          type: 'document', val: 2 },
    { id: 'schulgen-memo-1947',               name: 'Schulgen Memo 1947',         type: 'document', val: 2 },
    { id: 'project-sign-estimate-1948',       name: 'Project Sign Estimate',      type: 'document', val: 2 },
    { id: 'dia-iran-f4-1976',                 name: 'DIA Iran F-4 Report',        type: 'document', val: 2 },

    // New must-have cases
    { id: 'levelland-1957',         name: 'Levelland TX (1957)',          type: 'case', val: 3 },
    { id: 'coyne-helicopter-1973',  name: 'Coyne Helicopter (1973)',      type: 'case', val: 3 },

    // New must-have documents
    { id: 'pentacle-memorandum',    name: 'Pentacle Memorandum (1953)',   type: 'document', val: 3 },
    { id: 'hottel-memo',            name: 'Hottel Memo (1950)',           type: 'document', val: 2 },

    // New cases (batch 2)
    { id: 'rb47-1957',              name: 'RB-47 Incident (1957)',        type: 'case', val: 3 },
    { id: 'falcon-lake-1967',       name: 'Falcon Lake (1967)',           type: 'case', val: 3 },
    { id: 'minot-afb-1968',         name: 'Minot AFB (1968)',             type: 'case', val: 3 },

    // New programs (batch 2)
    { id: 'galileo-project',        name: 'Galileo Project',              type: 'project', val: 3 },
    { id: 'project-moon-dust',      name: 'Project Moon Dust',            type: 'project', val: 3 },

    // New documents (batch 2)
    { id: 'ndaa-fy2024-uap-provisions',   name: 'NDAA FY2024 UAP',        type: 'document', val: 3 },
    { id: 'dni-annual-report-uap-2024',   name: 'DNI UAP Report 2024',    type: 'document', val: 2 },

    // Thomas Wilson
    { id: 'dia-organization',  name: 'Defense Intelligence Agency', type: 'organization', val: 3 },

    // Additional organizations for Mike Gallagher
    { id: 'shield-ai',         name: 'Shield AI',                   type: 'organization', val: 2 },

    // Additional organizations for James Fox
    { id: 'the-phenomenon-film',                  name: "The Phenomenon (2020)",                type: 'document', val: 3 },
    { id: 'grusch-ig-complaint-2023',             name: 'Grusch ICIG Complaint (2023)',          type: 'document', val: 4 },
    { id: 'project-grudge-final-report-1949',     name: 'Project Grudge Final Report',           type: 'document', val: 2 },
    { id: 'socorro-blue-book-investigation-1964', name: 'Socorro Blue Book File (1964)',          type: 'document', val: 3 },
    { id: 'baass-aawsap-contract-2008',           name: 'BAASS AAWSAP Contract (2008)',          type: 'document', val: 3 },

    // Tier 2 document nodes + supporting org/person nodes
    { id: 'gepan',                              name: 'GEPAN / SEPRA / GEIPAN',              type: 'organization', group: 'shared', val: 2 },
    { id: 'laurance-rockefeller',               name: 'Laurance Rockefeller',                type: 'person',       group: 'shared', val: 2 },
    { id: 'cometa-report-1999',                 name: 'COMETA Report (1999)',                type: 'document',     val: 3 },
    { id: 'crs-uap-report-2022',                name: 'CRS UAP Report (2022)',               type: 'document',     val: 2 },
    { id: 'rockefeller-briefing-document-1995', name: 'Rockefeller UFO Briefing (1995)',     type: 'document',     val: 2 },

    // Additional cases for Fife Symington
    { id: 'phoenix-lights',      name: 'Phoenix Lights (1997)',     type: 'case',         val: 4 },

    // Additional cases (batch 3 — sourced from data/cases.json)
    // Note: phoenix-lights already exists. jal-flight-1628 already exists (gets new edge below).
    { id: 'belgian-ufo-wave',       name: 'Belgian UFO Wave (1989-90)',    type: 'case', val: 3 },
    { id: 'uss-omaha-2019',         name: 'USS Omaha USO Incident (2019)', type: 'case', val: 3 },
    { id: 'exeter-1965',            name: 'Exeter Incident (1965)',        type: 'case', val: 3 },
    { id: 'loch-raven-dam-1958',    name: 'Loch Raven Dam (1958)',         type: 'case', val: 2 },
    { id: 'socorro-1964',           name: 'Socorro / Zamora (1964)',       type: 'case', val: 4 },
    { id: 'shag-harbour-1967',      name: 'Shag Harbour Incident (1967)', type: 'case', val: 3 },
    { id: 'ohare-airport-2006',     name: "O'Hare Airport Incident (2006)", type: 'case', val: 3 },
    { id: 'stephenville-tx-2008',   name: 'Stephenville, TX (2008)',      type: 'case', val: 3 },

    // Grusch ICIG determination
    { id: 'grusch-icig-determination-2023', name: 'Grusch ICIG Determination (2023)', type: 'document', val: 5 },

    // New documents (batch 4)
    { id: 'uk-mod-ufo-files-2009', name: 'UK MoD UFO Files (1950-2009)', type: 'document', val: 4 },
    { id: 'pentagon-uap-video-release-2020', name: 'Pentagon UAP Video Release (2020)', type: 'document', val: 5 },
    { id: 'sobeps-belgian-ufo-wave-1991', name: 'SOBEPS Belgian UFO Wave Report (1991)', type: 'document', val: 4 },
    { id: 'uap-disclosure-act-2023', name: 'UAP Disclosure Act of 2023', type: 'document', val: 5 },

    // Academic paper documents (batch 5)
    { id: 'sturrock-panel-report-1998',           name: 'Sturrock Panel Report (1998)',           type: 'document', val: 3 },
    { id: 'vallee-davis-incommensurability-2003', name: 'Vallee-Davis Incommensurability (2003)', type: 'document', val: 3 },

    // New cases (batch 4 — sourced from data/cases.json)
    { id: 'kenneth-arnold-1947',     name: 'Kenneth Arnold Sighting (1947)',          type: 'case', val: 4 },
    { id: 'betty-barney-hill-1961',  name: 'Betty & Barney Hill Abduction (1961)',     type: 'case', val: 4 },
    { id: 'walton-abduction-1975',   name: 'Travis Walton Abduction (1975)',           type: 'case', val: 3 },
    { id: 'cash-landrum-1980',       name: 'Cash-Landrum Incident (1980)',             type: 'case', val: 3 },
    { id: 'trans-en-provence-1981',  name: 'Trans-en-Provence Landing (1981)',         type: 'case', val: 3 },

    // Private defense contractors (sourced from data/contractors.json)
    // Note: EG&G already exists as 'egg-corporation' (organization) — not duplicated here.
    { id: 'lockheed-martin',   name: 'Lockheed Martin',              type: 'contractor', val: 4 },
    { id: 'northrop-grumman',  name: 'Northrop Grumman',             type: 'contractor', val: 3 },
    { id: 'raytheon',          name: 'Raytheon Technologies',        type: 'contractor', val: 3 },
    { id: 'battelle',          name: 'Battelle Memorial Institute',  type: 'contractor', val: 3 },
    { id: 'saic',              name: 'SAIC',                         type: 'contractor', val: 2 },
    { id: 'leidos',            name: 'Leidos',                       type: 'contractor', val: 3 },
    { id: 'boeing-defense',    name: 'Boeing Defense',               type: 'contractor', val: 4 },
  ],

  links: [
    // Elizondo personal connections
    { source: 'luis-elizondo',   target: 'aatip',              label: 'directed' },
    { source: 'luis-elizondo',   target: 'pentagon-ousd',      label: 'worked within' },
    { source: 'luis-elizondo',   target: 'ttsa',               label: 'co-founded' },
    { source: 'luis-elizondo',   target: 'five-observables',   label: 'formulated' },
    { source: 'luis-elizondo',   target: 'chris-mellon',       label: 'collaborated with' },
    { source: 'luis-elizondo',   target: 'harry-reid',         label: 'program funded by' },
    { source: 'luis-elizondo',   target: 'david-grusch',       label: 'contemporary disclosure' },
    { source: 'luis-elizondo',   target: 'ryan-graves',        label: 'corroborated by' },
    { source: 'aatip',           target: 'bigelow-aerospace',  label: 'contracted to' },
    { source: 'aatip',           target: 'uap-task-force',     label: 'predecessor of' },
    { source: 'aatip',           target: 'five-observables',   label: 'produced' },
    { source: 'chris-mellon',    target: 'ttsa',               label: 'senior advisor' },
    { source: 'chris-mellon',    target: 'hal-puthoff',        label: 'TTSA co-advisor' },
    { source: 'chris-mellon',    target: 'uap-task-force',     label: 'drafted legislation for' },
    { source: 'chris-mellon',    target: 'aaro',               label: 'drafted legislation for' },
    { source: 'chris-mellon',    target: 'david-grusch',       label: 'legislative coordination' },
    { source: 'harry-reid',      target: 'bigelow-aerospace',  label: 'secured funding for' },

    // Fravor personal connections
    { source: 'david-fravor',    target: 'uss-nimitz',         label: 'commanding officer on' },
    { source: 'david-fravor',    target: 'vfa-41',             label: 'commanding officer' },
    { source: 'david-fravor',    target: 'jim-slaight',        label: 'wingman on Tic Tac' },
    { source: 'david-fravor',    target: 'aatip',              label: 'encounter investigated by' },
    { source: 'david-fravor',    target: 'david-grusch',       label: 'testified alongside' },
    { source: 'david-fravor',    target: 'ryan-graves',        label: 'testified alongside' },
    { source: 'david-fravor',    target: 'karl-nell',          label: 'testified alongside' },
    { source: 'uss-nimitz',      target: 'aatip',              label: 'encounter prompted' },

    // Nell personal connections
    { source: 'karl-nell',       target: 'sol-foundation',     label: 'co-founded' },
    { source: 'karl-nell',       target: 'david-grusch',       label: 'co-founded Sol Foundation' },
    { source: 'karl-nell',       target: 'garry-nolan',        label: 'Sol Foundation co-founder' },
    { source: 'karl-nell',       target: 'ryan-graves',        label: 'testified alongside' },

    // Grusch personal connections
    { source: 'david-grusch',    target: 'nro',                label: 'worked at' },
    { source: 'david-grusch',    target: 'uap-task-force',     label: 'represented NRO on' },
    { source: 'david-grusch',    target: 'aaro',               label: 'liaised with' },
    { source: 'david-grusch',    target: 'sol-foundation',     label: 'co-founded' },
    { source: 'garry-nolan',     target: 'sol-foundation',     label: 'co-founded' },
    { source: 'david-grusch',    target: 'garry-nolan',        label: 'Sol Foundation co-founder' },
    { source: 'garry-nolan',     target: 'luis-elizondo',      label: 'UAP Disclosure Fund board' },
    { source: 'hal-puthoff',     target: 'ttsa',               label: 'co-founded' },
    { source: 'hal-puthoff',     target: 'luis-elizondo',      label: 'TTSA co-founder' },
    { source: 'hal-puthoff',     target: 'bigelow-aerospace',  label: 'AAWSAP subcontractor' },
    { source: 'hal-puthoff',     target: 'garry-nolan',        label: 'physics research intersection' },
    { source: 'eric-davis',      target: 'hal-puthoff',        label: 'EarthTech colleague' },
    { source: 'eric-davis',      target: 'nids',               label: 'visiting research scientist' },
    { source: 'eric-davis',      target: 'aatip',              label: 'DIRD contributor' },
    { source: 'eric-davis',      target: 'david-grusch',       label: 'corroborating crash retrieval claims' },
    { source: 'robert-bigelow',  target: 'nids',               label: 'founded' },
    { source: 'robert-bigelow',  target: 'bigelow-aerospace',  label: 'founded' },
    { source: 'robert-bigelow',  target: 'george-knapp',       label: 'NIDS media partner' },
    { source: 'robert-bigelow',  target: 'hal-puthoff',        label: 'NIDS / BAASS research partnership' },
    { source: 'robert-bigelow',  target: 'eric-davis',         label: 'NIDS visiting scientist; BAASS researcher' },
    { source: 'robert-bigelow',  target: 'harry-reid',         label: 'AAWSAP funding secured by Reid' },
    { source: 'nids',            target: 'bigelow-aerospace',  label: 'evolved into BAASS' },
    { source: 'jacques-vallee',  target: 'nids',               label: 'scientific advisor' },
    { source: 'jacques-vallee',  target: 'hal-puthoff',        label: 'longtime research collaboration' },
    { source: 'jacques-vallee',  target: 'garry-nolan',        label: 'co-authored peer-reviewed UAP paper' },
    { source: 'jacques-vallee',  target: 'sol-foundation',     label: 'senior advisor' },
    { source: 'nick-pope',       target: 'mod-ufo-desk',       label: 'ran (1991-1994)' },
    { source: 'nick-pope',       target: 'luis-elizondo',      label: 'parallel government UAP investigators' },
    { source: 'nick-pope',       target: 'jacques-vallee',     label: 'cited methodological influence' },
    { source: 'david-grusch',    target: 'ross-coulthart',     label: 'disclosed to' },
    { source: 'jake-barber',     target: 'ross-coulthart',     label: 'disclosed to' },
    { source: 'jake-barber',     target: 'david-grusch',       label: 'complementary crash retrieval disclosure' },
    { source: 'tim-gallaudet',   target: 'sol-foundation',     label: 'affiliated with' },
    { source: 'tim-gallaudet',   target: 'david-grusch',       label: 'publicly endorses' },
    { source: 'tim-gallaudet',   target: 'garry-nolan',        label: 'Sol Foundation affiliate' },
    { source: 'tim-gallaudet',   target: 'ross-coulthart',     label: 'disclosed to' },
    { source: 'tim-gallaudet',   target: 'karl-nell',          label: 'Sol Foundation affiliate' },
    { source: 'david-grusch',    target: 'ryan-graves',        label: 'testified alongside' },
    { source: 'uap-task-force',  target: 'aaro',               label: 'predecessor of' },

    // Burisch personal connections
    { source: 'dan-burisch',      target: 's4-papoose',         label: 'worked at' },
    { source: 'dan-burisch',      target: 'chielah',            label: 'studied' },
    { source: 'dan-burisch',      target: 'majestic-12',        label: 'member of' },
    { source: 'dan-burisch',      target: 'committee-majority', label: 'member of' },
    { source: 'dan-burisch',      target: 'project-aquarius',   label: 'conducted research' },
    { source: 'dan-burisch',      target: 'project-lotus',      label: 'led' },
    { source: 'dan-burisch',      target: 'looking-glass',      label: 'operated' },
    { source: 'dan-burisch',      target: 'stargates',          label: 'interacted with' },

    // Lazar personal connections
    { source: 'bob-lazar',        target: 's4-papoose',         label: 'worked at' },
    { source: 'bob-lazar',        target: 'project-galileo',    label: 'assigned to' },
    { source: 'bob-lazar',        target: 'element-115',        label: 'studied' },
    { source: 'bob-lazar',        target: 'gravity-amplifiers', label: 'reverse engineered' },
    { source: 'bob-lazar',        target: 'sport-model',        label: 'examined' },
    { source: 'bob-lazar',        target: 'egg-corporation',    label: 'contracted through' },
    { source: 'bob-lazar',        target: 'los-alamos',         label: 'prior employer' },
    { source: 'bob-lazar',        target: 'george-knapp',       label: 'disclosed to' },
    { source: 'bob-lazar',        target: 'john-lear',          label: 'introduced by' },
    { source: 'bob-lazar',        target: 'naval-intelligence', label: 'cleared by' },

    // Facility connections
    { source: 's4-papoose',       target: 'area-51',            label: 'located within' },
    { source: 's4-papoose',       target: 'majestic-12',        label: 'operated by' },
    { source: 's4-papoose',       target: 'sport-model',        label: 'housed' },
    { source: 's4-papoose',       target: 'chielah',            label: 'containment site' },
    { source: 'egg-corporation',  target: 'area-51',            label: 'contracted at' },

    // Org connections
    { source: 'majestic-12',      target: 'project-aquarius',   label: 'oversees' },
    { source: 'majestic-12',      target: 'committee-majority', label: 'evolved into' },
    { source: 'majestic-12',      target: 'som1-01',            label: 'produced' },

    // Gerb-researched program connections
    { source: 'project-sign',     target: 'project-grudge',     label: 'predecessor of' },
    { source: 'project-grudge',   target: 'project-blue-book',  label: 'predecessor of' },
    { source: 'project-moondust', target: 'uap-task-force',     label: 'predecessor of' },
    { source: 'immaculate-constellation', target: 'uap-task-force', label: 'related program' },
    { source: 'ipu',              target: 'majestic-12',        label: 'evolved into' },
    { source: 'robertson-panel',  target: 'project-blue-book',  label: 'shaped suppression policy within' },
    { source: 'aawsap',           target: 'aatip',              label: 'preceded / overlapped with' },
    { source: 'aawsap',           target: 'bigelow-aerospace',  label: 'contracted to BAASS' },
    { source: 'robert-bigelow',   target: 'aawsap',             label: 'BAASS won contract for' },
    { source: 'hal-puthoff',      target: 'aawsap',             label: 'researcher' },
    { source: 'eric-davis',       target: 'aawsap',             label: 'researcher' },
    { source: 'harry-reid',       target: 'aawsap',             label: 'secured funding for' },
    { source: 'kona-blue',        target: 'aaro',               label: 'assessed by' },
    { source: 'david-grusch',     target: 'kona-blue',          label: 'reported existence of' },

    // Project connections
    { source: 'project-aquarius', target: 'project-lotus',      label: 'sub-project' },
    { source: 'project-aquarius', target: 'project-crystal',    label: 'sub-project' },
    { source: 'project-aquarius', target: 'project-preserve',   label: 'sub-project' },
    { source: 'project-lotus',    target: 'ganesh-particles',   label: 'discovered' },
    { source: 'project-lotus',    target: 'shiva-portals',      label: 'discovered' },
    { source: 'project-crystal',  target: 'looking-glass',      label: 'involves' },
    { source: 'project-crystal',  target: 'stargates',          label: 'involves' },
    { source: 'project-galileo',  target: 'sport-model',        label: 'studied' },

    // Concept/tech connections
    { source: 'looking-glass',    target: 'timeline-1',         label: 'accesses' },
    { source: 'looking-glass',    target: 'timeline-2',         label: 'accesses' },
    { source: 'chielah',          target: 'timeline-2',         label: 'originates from' },
    { source: 'chielah',          target: 'ganesh-particles',   label: 'related to' },
    { source: 'element-115',      target: 'gravity-amplifiers', label: 'powers' },
    { source: 'element-115',      target: 'sport-model',        label: 'fuels' },
    { source: 'gravity-amplifiers',target: 'gravity-waves',     label: 'generates' },
    { source: 'sport-model',      target: 'gravity-waves',      label: 'uses' },

    // Corbell connections
    { source: 'jeremy-corbell',  target: 'bob-lazar',          label: 'produced documentary about' },
    { source: 'jeremy-corbell',  target: 'george-knapp',       label: 'Mystery Wire co-investigator' },
    { source: 'jeremy-corbell',  target: 'jake-barber',        label: 'documented UAP footage' },
    { source: 'jeremy-corbell',  target: 'ryan-graves',        label: 'covered UAP testimony' },

    // McCullough connections
    { source: 'charles-mccullough', target: 'david-grusch',    label: 'represented as whistleblower attorney' },
    { source: 'charles-mccullough', target: 'sol-foundation',  label: 'symposium participant' },
    { source: 'charles-mccullough', target: 'luis-elizondo',   label: 'co-whistleblower legal advocacy' },

    // Leslie Kean connections
    { source: 'leslie-kean',         target: 'david-grusch',        label: 'broke disclosure story with' },
    { source: 'leslie-kean',         target: 'ross-coulthart',      label: 'fellow UAP journalist' },
    { source: 'leslie-kean',         target: 'luis-elizondo',       label: 'reported on AATIP' },

    // Richard Dolan connections
    { source: 'richard-dolan',       target: 'project-blue-book',   label: 'authored history of' },
    { source: 'richard-dolan',       target: 'leslie-kean',         label: 'fellow UAP researcher' },
    { source: 'richard-dolan',       target: 'jacques-vallee',      label: 'fellow UAP researcher' },

    // Daniel Sheehan connections
    { source: 'daniel-sheehan',      target: 'disclosure-project',  label: 'provided legal counsel to' },
    { source: 'daniel-sheehan',      target: 'david-grusch',        label: 'legal advocacy for' },
    { source: 'daniel-sheehan',      target: 'charles-mccullough',  label: 'fellow UAP attorney' },

    // Jesse Michels connections
    { source: 'jesse-michels',       target: 'bob-lazar',           label: 'produced interviews with' },
    { source: 'jesse-michels',       target: 'jeremy-corbell',      label: 'fellow UAP filmmaker' },
    { source: 'jesse-michels',       target: 'david-grusch',        label: 'interviewed' },

    // Alex Dietrich connections
    { source: 'alex-dietrich',       target: 'david-fravor',        label: 'wingman on Tic Tac encounter' },
    { source: 'alex-dietrich',       target: 'uss-nimitz',          label: 'stationed on' },
    { source: 'alex-dietrich',       target: 'vfa-41',              label: 'pilot in' },

    // Disclosure Project connections
    { source: 'disclosure-project',  target: 'daniel-sheehan',      label: 'legal counsel' },
    { source: 'disclosure-project',  target: 'leslie-kean',         label: 'adjacent to disclosure movement' },

    // Operation Paperclip connections
    { source: 'operation-paperclip', target: 'area-51',             label: 'scientists worked at' },
    { source: 'operation-paperclip', target: 'majestic-12',         label: 'preceded; informed' },

    // Chuck Schumer connections
    { source: 'chuck-schumer',       target: 'ndaa-fy2023-uap-provisions', label: 'co-sponsored UAP amendments' },
    { source: 'chuck-schumer',       target: 'david-grusch',        label: 'supported disclosure of' },

    // James Lacatski connections
    { source: 'james-lacatski',      target: 'aawsap',              label: 'founded and directed' },
    { source: 'james-lacatski',      target: 'robert-bigelow',      label: 'contracted BAASS through' },
    { source: 'james-lacatski',      target: 'hal-puthoff',         label: 'AAWSAP researcher' },

    // Kevin Day connections
    { source: 'kevin-day',           target: 'uss-nimitz',          label: 'radar operator on' },
    { source: 'kevin-day',           target: 'david-fravor',        label: 'vectored to UAP contact' },

    // John Mack connections
    { source: 'john-mack',           target: 'jacques-vallee',      label: 'fellow UAP researcher' },
    { source: 'john-mack',           target: 'leslie-kean',         label: 'fellow UAP researcher' },

    // Document connections
    { source: 'wilson-davis-memo',                target: 'eric-davis',        label: 'attributed to' },
    { source: 'wilson-davis-memo',                target: 'david-grusch',      label: 'corroborated by' },
    { source: 'wilson-davis-memo',                target: 'hal-puthoff',       label: 'names' },
    { source: 'uaptf-preliminary-assessment',     target: 'uap-task-force',    label: 'produced by' },
    { source: 'uaptf-preliminary-assessment',     target: 'luis-elizondo',     label: 'advocacy led to' },
    { source: 'uaptf-preliminary-assessment',     target: 'chris-mellon',      label: 'advocacy led to' },
    { source: 'uaptf-preliminary-assessment',     target: 'david-grusch',      label: 'corroborated by' },
    { source: 'aaro-historical-record-vol1',      target: 'aaro',              label: 'published by' },
    { source: 'aaro-historical-record-vol1',      target: 'david-grusch',      label: 'disputes claims of' },
    { source: 'aaro-historical-record-vol1',      target: 'karl-nell',         label: 'publicly disputed by' },
    { source: 'aaro-historical-record-vol1',      target: 'chris-mellon',      label: 'responds to' },
    { source: 'aaro-historical-record-vol1',      target: 'luis-elizondo',     label: 'reviewed' },
    { source: 'aaro-historical-record-vol2-2024', target: 'aaro',              label: 'published by' },
    { source: 'aaro-historical-record-vol2-2024', target: 'david-grusch',      label: 'disputes claims of' },
    { source: 'nasa-uap-study-2023',              target: 'garry-nolan',       label: 'panel methodology cited by' },
    { source: 'nasa-uap-study-2023',              target: 'jacques-vallee',    label: 'methodology aligned with' },
    { source: 'halt-memo-1981',                   target: 'nick-pope',         label: 'investigated by' },
    { source: 'ndaa-fy2023-uap-provisions',       target: 'chris-mellon',      label: 'drafted by' },
    { source: 'ndaa-fy2023-uap-provisions',       target: 'luis-elizondo',     label: 'advocacy led to' },
    { source: 'ndaa-fy2023-uap-provisions',       target: 'david-grusch',      label: 'prompted disclosure of' },
    { source: 'robertson-panel-1953',             target: 'robertson-panel',   label: 'report produced by' },
    { source: 'robertson-panel-1953',             target: 'project-blue-book', label: 'shaped suppression within' },
    { source: 'blue-book-special-report-14',      target: 'project-blue-book', label: 'key report from' },
    { source: 'condon-report-1969',               target: 'project-blue-book', label: 'commissioned by' },
    { source: 'condon-report-1969',               target: 'jacques-vallee',    label: 'methodology critiqued by' },
    { source: 'condon-report-1969',               target: 'luis-elizondo',     label: 'historical precedent cited by' },
    { source: 'elizondo-resignation-letter-2017', target: 'luis-elizondo',     label: 'authored by' },
    { source: 'elizondo-resignation-letter-2017', target: 'chris-mellon',      label: 'informed advocacy of' },
    { source: 'elizondo-resignation-letter-2017', target: 'aatip',             label: 'describes oversight failures in' },
    { source: 'twining-memo-1947',                target: 'j-allen-hynek',     label: 'researched by' },
    { source: 'twining-memo-1947',                target: 'project-sign',      label: 'informed creation of' },
    { source: 'schulgen-memo-1947',               target: 'project-sign',      label: 'preceded' },
    { source: 'project-sign-estimate-1948',       target: 'j-allen-hynek',     label: 'researched by' },
    { source: 'project-sign-estimate-1948',       target: 'project-sign',      label: 'produced by' },
    { source: 'dia-iran-f4-1976',                 target: 'uap-task-force',    label: 'referenced in assessments by' },
    // New program nodes
    { source: 'nicap',             target: 'project-blue-book', label: 'investigated and critiqued' },
    { source: 'nicap',             target: 'j-allen-hynek',     label: 'collaborated with' },
    { source: 'nicap',             target: 'richard-dolan',     label: 'documented by' },
    { source: 'nicap',             target: 'leslie-kean',       label: 'referenced cases by' },
    { source: 'mufon',             target: 'nicap',             label: 'succeeded as primary civilian org' },
    { source: 'mufon',             target: 'bigelow-aerospace', label: 'BAASS data-sharing arrangement (2009)' },
    { source: 'jsoc',              target: 'david-grusch',      label: 'named in crash retrieval testimony' },
    { source: 'jsoc',              target: 'aaro',              label: 'operates alongside' },
    { source: 'afosi',             target: 'project-blue-book', label: 'parallel UAP investigations' },
    { source: 'afosi',             target: 'j-allen-hynek',     label: 'coordinated on cases with' },
    { source: 'oga',               target: 'david-grusch',      label: 'named in crash retrieval testimony' },
    { source: 'oga',               target: 'aaro',              label: 'alleged parallel program' },
    { source: 'sdi',               target: 'aawsap',            label: 'black-budget precedent for' },
    { source: 'seti',              target: 'garry-nolan',       label: 'methodology challenged by' },
    { source: 'seti',              target: 'jacques-vallee',    label: 'search framing debated with' },
    { source: 'ipu',               target: 'project-sign',      label: 'alleged predecessor of' },

    // Dylan Borland connections
    { source: 'dylan-borland',   target: 'aaro',              label: 'testified to as whistleblower' },
    { source: 'dylan-borland',   target: 'david-grusch',      label: 'testified alongside at House Oversight 2025' },
    { source: 'dylan-borland',   target: 'jay-stratton',      label: 'reported to AARO under' },
    { source: 'dylan-borland',   target: 'jeremy-corbell',    label: 'documented by on Weaponized podcast' },

    // Kit Green connections
    { source: 'kit-green',       target: 'garry-nolan',             label: 'Research collaboration on UAP-affected patient neurological effects' },
    { source: 'kit-green',       target: 'hal-puthoff',             label: 'Aviary network; AAWSAP research team' },
    { source: 'kit-green',       target: 'eric-davis',              label: 'Complementary AAWSAP DIRD authors' },
    { source: 'kit-green',       target: 'james-lacatski',          label: 'Authored medical DIRD under AAWSAP directorship' },
    { source: 'kit-green',       target: 'aawsap',                  label: 'Authored DIRD on clinical UAP medical effects (2009)' },
    { source: 'kit-green',       target: 'leslie-kean',             label: 'Briefed on CIA UAP file holdings (2008)' },

    // Colm Kelleher connections
    { source: 'colm-kelleher',   target: 'robert-bigelow',          label: 'Deputy administrator of NIDS; senior researcher at BAASS' },
    { source: 'colm-kelleher',   target: 'george-knapp',            label: 'Co-authored Hunt for the Skinwalker and Skinwalkers at the Pentagon' },
    { source: 'colm-kelleher',   target: 'james-lacatski',          label: 'Co-authored Skinwalkers at the Pentagon; AAWSAP colleagues' },
    { source: 'colm-kelleher',   target: 'hal-puthoff',             label: 'Shared AAWSAP/BAASS research network' },
    { source: 'colm-kelleher',   target: 'aawsap',                  label: 'Senior researcher under BAASS AAWSAP contract' },
    { source: 'colm-kelleher',   target: 'kit-green',               label: 'Parallel AAWSAP researchers on biological/medical UAP effects' },

    // Jim Semivan connections
    { source: 'jim-semivan',     target: 'garry-nolan',             label: 'Co-founded SOL Foundation (2022) to bridge intelligence community UAP knowledge with academic research' },
    { source: 'jim-semivan',     target: 'luis-elizondo',           label: 'Colleagues on TTSA advisory board; shared intelligence community background and public disclosure advocacy' },
    { source: 'jim-semivan',     target: 'chris-mellon',            label: 'TTSA advisory board colleagues; both advocate for congressional UAP transparency' },
    { source: 'jim-semivan',     target: 'ttsa',                    label: 'Advisory board member from founding (2017); provided intelligence community perspective on UAP programs' },
    { source: 'jim-semivan',     target: 'sol-foundation',          label: 'Co-founded and co-organizes SOL Foundation; primary IC perspective within the organization' },
    { source: 'jim-semivan',     target: 'tim-gallaudet',           label: 'SOL Foundation co-organizers; both bring senior government service backgrounds to UAP scientific inquiry' },
    { source: 'jim-semivan',     target: 'karl-nell',               label: 'SOL Foundation colleagues; both former national security figures now publicly advocating for UAP transparency' },
    { source: 'jim-semivan',     target: 'hal-puthoff',             label: 'TTSA colleagues with overlapping interest in consciousness-interactive aspects of UAP phenomena' },

    // Annie Jacobsen connections
    { source: 'annie-jacobsen',  target: 'hal-puthoff',             label: 'Primary named source for Phenomena (2017); Star Gate account' },
    { source: 'annie-jacobsen',  target: 'leslie-kean',             label: 'Fellow UAP investigative journalists; parallel source networks' },
    { source: 'annie-jacobsen',  target: 'ross-coulthart',          label: 'Fellow UAP investigative journalists; complementary book and broadcast tracks' },
    { source: 'annie-jacobsen',  target: 'david-grusch',            label: 'UFO (2023) independently corroborates Grusch crash retrieval claims' },
    { source: 'annie-jacobsen',  target: 'aawsap',                  label: 'Documented AAWSAP program structure and scope in UFO (2023)' },

    // Matthew Brown connections
    { source: 'matthew-brown',   target: 'jeremy-corbell',          label: 'Congressional submission vehicle for IMCON report' },
    { source: 'matthew-brown',   target: 'david-grusch',            label: 'Mutual defense-intelligence whistleblower referral' },
    { source: 'matthew-brown',   target: 'george-knapp',            label: 'Co-hosted 3-part WEAPONIZED interview (Apr-May 2025)' },
    { source: 'matthew-brown',   target: 'immaculate-constellation', label: 'Author of congressional IMCON report; OSD discovery' },
    { source: 'matthew-brown',   target: 'aatip',                   label: 'IMCON established in direct response to AATIP 2017 exposure' },
    { source: 'matthew-brown',   target: 'aaro',                    label: 'Reviewed classified AARO transcripts; alleges obstruction' },
    { source: 'matthew-brown',   target: 'pentagon-ousd',           label: 'Served as policy and technical advisor (OSD, OUSD(I&S))' },

    // Neil McCasland connections
    { source: 'neil-mccasland', target: 'tom-delonge',   label: 'Named by DeLonge in Jan 2016 Podesta email as military adviser; helped assemble DeLonge\'s UAP disclosure advisory team over four months' },
    { source: 'neil-mccasland', target: 'ttsa',          label: 'Aided pre-founding assembly of TTSA advisory team, per DeLonge\'s Jan 2016 WikiLeaks email to Podesta' },
    { source: 'neil-mccasland', target: 'roswell-1947',  label: 'Commanded AFRL Wright-Patterson (2011-2013) - the facility historically cited as repository for Roswell recovered materials' },
    { source: 'neil-mccasland', target: 'tim-burchett',  label: 'Burchett publicly identified McCasland following his 2026 disappearance as connected to UAP and holding significant undisclosed knowledge' },
    { source: 'neil-mccasland', target: 'hal-puthoff',   label: 'Parallel figures in DeLonge\'s pre-TTSA advisory network; both cited in the 2016 Podesta email disclosure circle' },

    // Case node connections
    // Nimitz Tic Tac
    { source: 'nimitz-tic-tac',        target: 'david-fravor',              label: 'witnessed by' },
    { source: 'nimitz-tic-tac',        target: 'alex-dietrich',             label: 'witnessed by' },
    { source: 'nimitz-tic-tac',        target: 'kevin-day',                 label: 'tracked by' },
    { source: 'nimitz-tic-tac',        target: 'uss-nimitz',                label: 'occurred near' },
    { source: 'nimitz-tic-tac',        target: 'vfa-41',                    label: 'pilots involved from' },
    { source: 'nimitz-tic-tac',        target: 'aatip',                     label: 'investigated by' },
    { source: 'nimitz-tic-tac',        target: 'uaptf-preliminary-assessment', label: 'cited in' },

    // Rendlesham Forest
    { source: 'rendlesham-forest',     target: 'nick-pope',                 label: 'investigated by' },
    { source: 'rendlesham-forest',     target: 'mod-ufo-desk',              label: 'handled by' },
    { source: 'rendlesham-forest',     target: 'halt-memo-1981',            label: 'documented in' },
    { source: 'rendlesham-forest',     target: 'afosi',                     label: 'investigated by' },

    // Roswell
    { source: 'roswell-1947',          target: 'majestic-12',               label: 'alleged recovery led to' },
    { source: 'roswell-1947',          target: 'ipu',                       label: 'investigated by' },
    { source: 'roswell-1947',          target: 'project-sign',              label: 'investigated by' },
    { source: 'roswell-1947',          target: 'twining-memo-1947',         label: 'prompted' },
    { source: 'roswell-1947',          target: 'j-allen-hynek',             label: 'researched by' },

    // Washington D.C. 1952
    { source: 'washington-dc-1952',    target: 'project-blue-book',         label: 'investigated by' },
    { source: 'washington-dc-1952',    target: 'j-allen-hynek',             label: 'investigated by' },
    { source: 'washington-dc-1952',    target: 'robertson-panel',           label: 'contributed to formation of' },

    // Malmstrom AFB 1967
    { source: 'malmstrom-afb-1967',    target: 'project-blue-book',         label: 'investigated by' },
    { source: 'malmstrom-afb-1967',    target: 'j-allen-hynek',             label: 'investigated by' },
    { source: 'malmstrom-afb-1967',    target: 'malmstrom-afb',             label: 'occurred at' },

    // USS Theodore Roosevelt
    { source: 'uss-theodore-roosevelt', target: 'ryan-graves',              label: 'witnessed by' },
    { source: 'uss-theodore-roosevelt', target: 'aatip',                    label: 'investigated by' },
    { source: 'uss-theodore-roosevelt', target: 'uaptf-preliminary-assessment', label: 'cited in' },

    // Ariel School
    { source: 'ariel-school-1994',     target: 'john-mack',                 label: 'investigated by' },

    // Iranian F-4 Incident
    { source: 'iranian-f4-incident',   target: 'dia-iran-f4-1976',          label: 'documented in' },
    { source: 'iranian-f4-incident',   target: 'uap-task-force',            label: 'referenced by' },

    // Kecksburg
    { source: 'kecksburg-1965',        target: 'leslie-kean',               label: 'researched by' },
    { source: 'kecksburg-1965',        target: 'project-moondust',          label: 'investigated by' },

    // Facility connections
    { source: 'skinwalker-ranch',      target: 'robert-bigelow',            label: 'purchased by' },
    { source: 'skinwalker-ranch',      target: 'nids',                      label: 'investigated by' },
    { source: 'skinwalker-ranch',      target: 'james-lacatski',            label: 'visit prompted AAWSAP' },
    { source: 'skinwalker-ranch',      target: 'aawsap',                    label: 'investigation prompted' },
    { source: 'malmstrom-afb',         target: 'malmstrom-afb-1967',        label: 'site of' },

    // Harald Malmgren connections
    { source: 'harald-malmgren',       target: 'majestic-12',               label: 'briefed on via CIA DDP Bissell' },
    { source: 'harald-malmgren',       target: 'oga',                       label: 'CIA/NSC interface; Bissell connection' },
    { source: 'harald-malmgren',       target: 'roswell-1947',              label: 'CIA source corroborated broader recovery context' },
    { source: 'jesse-michels',         target: 'harald-malmgren',           label: 'interviewed' },
    { source: 'david-grusch',          target: 'harald-malmgren',           label: 'corroborating compartmentalization accounts' },

    // Stanton Friedman connections
    { source: 'stanton-friedman',    target: 'roswell-1947',              label: 'primary researcher; located Marcel' },
    { source: 'stanton-friedman',    target: 'majestic-12',               label: 'analyzed MJ-12 documents' },
    { source: 'stanton-friedman',    target: 'j-allen-hynek',             label: 'contemporary researchers' },
    { source: 'stanton-friedman',    target: 'richard-dolan',             label: 'mentored' },
    { source: 'stanton-friedman',    target: 'leslie-kean',               label: 'contemporary researchers' },

    // Avi Loeb connections
    { source: 'avi-loeb',            target: 'garry-nolan',               label: 'fellow scientist-advocate' },
    { source: 'avi-loeb',            target: 'tim-gallaudet',             label: 'testified at same 2024 hearing' },
    { source: 'avi-loeb',            target: 'sol-foundation',            label: 'symposium participant' },
    { source: 'avi-loeb',            target: 'seti',                      label: 'challenged SETI framing' },
    { source: 'avi-loeb',            target: 'david-grusch',              label: 'met privately; Lockheed official separately confirmed Grusch claims to Loeb as not wrong' },

    // Donald Keyhoe connections
    { source: 'donald-keyhoe',       target: 'nicap',                     label: 'co-founded and directed' },
    { source: 'donald-keyhoe',       target: 'project-blue-book',         label: 'primary civilian critic of' },
    { source: 'donald-keyhoe',       target: 'j-allen-hynek',             label: 'contemporary; NICAP-Blue Book interface' },
    { source: 'donald-keyhoe',       target: 'richard-dolan',             label: 'documented by' },
    { source: 'donald-keyhoe',       target: 'robertson-panel',           label: 'investigated suppression by' },

    // Levelland case connections
    { source: 'levelland-1957',      target: 'project-blue-book',         label: 'inadequately investigated by' },
    { source: 'levelland-1957',      target: 'j-allen-hynek',             label: 'criticized investigation of' },
    { source: 'levelland-1957',      target: 'donald-keyhoe',             label: 'used in congressional advocacy by' },
    { source: 'levelland-1957',      target: 'nicap',                     label: 'investigated and documented by' },

    // Coyne Helicopter case connections
    { source: 'coyne-helicopter-1973', target: 'j-allen-hynek',           label: 'investigated and personally endorsed' },
    { source: 'coyne-helicopter-1973', target: 'mufon',                   label: 'investigated by' },

    // Pentacle Memorandum connections
    { source: 'pentacle-memorandum',  target: 'robertson-panel',          label: 'sought to control evidence shown to' },
    { source: 'pentacle-memorandum',  target: 'project-blue-book',        label: 'reveals parallel program alongside' },
    { source: 'pentacle-memorandum',  target: 'j-allen-hynek',            label: 'found in papers of' },
    { source: 'pentacle-memorandum',  target: 'jacques-vallee',           label: 'discovered by' },
    { source: 'pentacle-memorandum',  target: 'robertson-panel-1953',     label: 'pre-dates by 2 days; sought to shape' },

    // Hottel Memo connections
    { source: 'hottel-memo',          target: 'roswell-1947',             label: 'describes recovery consistent with' },
    { source: 'hottel-memo',          target: 'oga',                      label: 'circulated within federal government channels' },
    { source: 'hottel-memo',          target: 'ipu',                      label: 'corroborates recovery program context' },

    // Philip Corso connections
    { source: 'philip-corso',         target: 'roswell-1947',             label: 'claimed to manage debris from' },
    { source: 'philip-corso',         target: 'stanton-friedman',         label: 'contemporary Roswell researchers' },

    // Steven Greer connections
    { source: 'steven-greer',         target: 'disclosure-project',       label: 'founded and directed' },
    { source: 'steven-greer',         target: 'daniel-sheehan',           label: 'Disclosure Project legal counsel' },
    { source: 'steven-greer',         target: 'richard-dolan',            label: 'contemporary disclosure researchers' },

    // Jay Stratton connections
    { source: 'jay-stratton',         target: 'uap-task-force',           label: 'directed' },
    { source: 'jay-stratton',         target: 'aaro',                     label: 'first acting director of' },
    { source: 'jay-stratton',         target: 'luis-elizondo',            label: 'contemporaries in DoD UAP investigation' },
    { source: 'jay-stratton',         target: 'david-grusch',             label: 'directed to investigate legacy programs' },

    // Robert Hastings connections
    { source: 'robert-hastings',      target: 'malmstrom-afb-1967',       label: 'documented extensively' },
    { source: 'robert-hastings',      target: 'minot-afb-1968',           label: 'documented via FOIA' },
    { source: 'robert-hastings',      target: 'project-blue-book',        label: 'researched and critiqued' },
    { source: 'robert-hastings',      target: 'nicap',                    label: 'referenced records from' },

    // Sean Kirkpatrick connections
    { source: 'sean-kirkpatrick',     target: 'aaro',                     label: 'directed (2022-2023)' },
    { source: 'sean-kirkpatrick',     target: 'aaro-historical-record-vol1', label: 'oversaw production of' },
    { source: 'sean-kirkpatrick',     target: 'david-grusch',             label: 'publicly contradicted' },
    { source: 'sean-kirkpatrick',     target: 'avi-loeb',                 label: 'co-authored UAP paper with' },

    // New case connections
    { source: 'rb47-1957',            target: 'project-blue-book',        label: 'investigated by' },
    { source: 'rb47-1957',            target: 'j-allen-hynek',            label: 'researched by' },
    { source: 'rb47-1957',            target: 'condon-report-1969',       label: 'classified Unknown in' },

    { source: 'falcon-lake-1967',     target: 'nicap',                    label: 'documented by' },
    { source: 'falcon-lake-1967',     target: 'project-blue-book',        label: 'consulted by Canadian investigators' },

    { source: 'minot-afb-1968',       target: 'robert-hastings',          label: 'documented by' },
    { source: 'minot-afb-1968',       target: 'project-blue-book',        label: 'investigated by (Case 12548)' },
    { source: 'minot-afb-1968',       target: 'malmstrom-afb',            label: 'similar nuclear-site incident at' },

    // New program connections
    { source: 'galileo-project',      target: 'avi-loeb',                 label: 'founded by' },
    { source: 'galileo-project',      target: 'sean-kirkpatrick',         label: 'co-authored paper with director of' },
    { source: 'galileo-project',      target: 'nasa-uap-study-2023',      label: 'methodology aligned with' },
    { source: 'galileo-project',      target: 'seti',                     label: 'methodological alternative to' },

    { source: 'project-moon-dust',    target: 'project-blue-book',        label: 'parallel USAF recovery program' },
    { source: 'project-moon-dust',    target: 'project-moondust',         label: 'same program; different node references' },
    { source: 'project-moon-dust',    target: 'david-grusch',             label: 'cited as recovery precedent by' },
    { source: 'project-moon-dust',    target: 'kecksburg-1965',           label: 'alleged recovery operation for' },

    // New document connections
    { source: 'ndaa-fy2024-uap-provisions', target: 'chuck-schumer',      label: 'introduced by' },
    { source: 'ndaa-fy2024-uap-provisions', target: 'david-grusch',       label: 'Elizondo vindication informed by' },
    { source: 'ndaa-fy2024-uap-provisions', target: 'luis-elizondo',      label: 'explicitly vindicated by' },
    { source: 'ndaa-fy2024-uap-provisions', target: 'chris-mellon',       label: 'advocacy shaped' },
    { source: 'ndaa-fy2024-uap-provisions', target: 'ndaa-fy2023-uap-provisions', label: 'built upon' },
    { source: 'ndaa-fy2024-uap-provisions', target: 'aaro',               label: 'expanded authority of' },

    { source: 'dni-annual-report-uap-2024', target: 'aaro',               label: 'produced by' },
    { source: 'dni-annual-report-uap-2024', target: 'sean-kirkpatrick',   label: 'produced under (final months)' },
    { source: 'dni-annual-report-uap-2024', target: 'uaptf-preliminary-assessment', label: 'successor report to' },
    { source: 'dni-annual-report-uap-2024', target: 'ndaa-fy2023-uap-provisions',   label: 'mandated by' },

    // Kirsten Gillibrand connections
    { source: 'kirsten-gillibrand', target: 'david-grusch',    label: 'Grusch testified before her SASC subcommittee; allegations informed her Disclosure Act' },
    { source: 'kirsten-gillibrand', target: 'aaro',            label: 'primary Senate overseer; conducted hearings with AARO director Kirkpatrick' },
    { source: 'kirsten-gillibrand', target: 'chuck-schumer',   label: 'co-sponsored UAP Disclosure Act; Schumer brought bill to Senate floor' },
    { source: 'kirsten-gillibrand', target: 'sean-kirkpatrick', label: 'Kirkpatrick testified before her subcommittee; subject of sustained oversight scrutiny' },
    { source: 'kirsten-gillibrand', target: 'ttsa',            label: 'legislative efforts built on UAP awareness generated by TTSA 2017 media campaign' },

    // Tim Burchett connections
    { source: 'tim-burchett', target: 'david-grusch',    label: 'Grusch testified at Burchett\'s House Oversight hearing (July 2023), providing key crash retrieval allegations' },
    { source: 'tim-burchett', target: 'ryan-graves',     label: 'Graves testified at Burchett\'s July 2023 hearing on Navy pilot UAP encounters' },
    { source: 'tim-burchett', target: 'david-fravor',    label: 'Fravor testified at Burchett\'s July 2023 House Oversight hearing about the 2004 Nimitz Tic-Tac encounter' },
    { source: 'tim-burchett', target: 'kirsten-gillibrand', label: 'Parallel House-Senate UAP oversight campaigns; coordinated on NDAA provisions and whistleblower protections' },
    { source: 'tim-burchett', target: 'aaro',            label: 'Primary House overseer of AARO; critical of AARO\'s scope and access limitations' },

    // Mike Gallagher connections
    { source: 'mike-gallagher', target: 'david-grusch',   label: 'Co-chaired July 2023 hearing where Grusch testified; explicitly endorsed Grusch\'s credibility' },
    { source: 'mike-gallagher', target: 'ryan-graves',    label: 'Graves testified at Gallagher\'s July 2023 hearing; Gallagher praised account as credible' },
    { source: 'mike-gallagher', target: 'tim-burchett',   label: 'Co-organized the July 2023 House Oversight UAP hearing; both signed the hearing request letter' },
    { source: 'mike-gallagher', target: 'chuck-schumer',  label: 'Co-authored the UAP Disclosure Act of 2023; bill passed Senate before being weakened in conference' },
    { source: 'mike-gallagher', target: 'shield-ai',      label: 'Joined as executive in 2024 after resigning from Congress' },

    // John Burroughs connections
    { source: 'john-burroughs', target: 'rendlesham-forest',  label: 'primary ground witness on first and second nights of incident' },
    { source: 'john-burroughs', target: 'nick-pope',          label: 'co-authored Encounter in Rendlesham Forest (2014); Pope provided UK MOD institutional context' },
    { source: 'john-burroughs', target: 'daniel-sheehan',     label: 'Sheehan provided legal counsel in landmark 2015 VA benefits case forcing review of classified medical records' },
    { source: 'john-burroughs', target: 'halt-memo-1981',     label: 'witness statements became part of the official record alongside the Halt Memo' },

    // Edward Ruppelt connections
    { source: 'edward-ruppelt', target: 'project-blue-book',  label: 'served as chief investigator 1951-1953; overhauled methodology toward genuine analysis' },
    { source: 'edward-ruppelt', target: 'robertson-panel',    label: 'served as Blue Book liaison; privately disagreed with debunking mandate and later documented it critically' },
    { source: 'edward-ruppelt', target: 'j-allen-hynek',      label: 'Hynek served as Blue Book scientific consultant under Ruppelt; foundational professional relationship in early official UAP inquiry' },
    { source: 'edward-ruppelt', target: 'donald-keyhoe',      label: "Ruppelt's insider account and Keyhoe's NICAP research were the era's two most credible public accounts of official UAP investigation" },
    { source: 'edward-ruppelt', target: 'nicap',              label: "Ruppelt's candid 1956 book was foundational to NICAP's credibility case for genuine UAP phenomena" },

    // James McDonald connections
    { source: 'james-mcdonald', target: 'j-allen-hynek',      label: 'colleagues in scientific UAP advocacy; Hynek later adopted positions McDonald had argued years earlier and corroborated his Condon critique' },
    { source: 'james-mcdonald', target: 'donald-keyhoe',      label: 'NICAP collaboration; both leading credentialed voices calling for scientific UAP investigation in the 1960s' },
    { source: 'james-mcdonald', target: 'project-blue-book',  label: 'accessed and critiqued Blue Book files; demonstrated systematic misclassification of unexplained cases as explained' },
    { source: 'james-mcdonald', target: 'nicap',              label: 'consulting researcher who provided scientific credibility to NICAP advocacy work and case documentation' },
    { source: 'james-mcdonald', target: 'edward-ruppelt',     label: "used Ruppelt's candid insider account as primary evidence of Blue Book's internal contradictions and predetermined conclusions" },
    { source: 'james-mcdonald', target: 'condon-report-1969', label: "authored 'Science in Default' demonstrating Condon Report ignored its strongest cases; most rigorous published critique of the report" },

    // Diana Pasulka connections
    { source: 'diana-pasulka', target: 'garry-nolan',    label: 'Nolan is widely believed to be among the insiders documented in American Cosmic; both participated in SOL Foundation symposia' },
    { source: 'diana-pasulka', target: 'hal-puthoff',    label: 'Puthoff appears in American Cosmic as part of the insider network of scientists working on UAP materials analysis' },
    { source: 'diana-pasulka', target: 'sol-foundation', label: 'participated in SOL Foundation symposia as academic humanities bridge between scientific and experiencer UAP research communities' },
    { source: 'diana-pasulka', target: 'avi-loeb',       label: 'both credentialed academics who have taken UAP seriously within legitimate institutional frameworks, from complementary disciplines' },

    // Thomas Townsend Brown connections
    { source: 'townsend-brown', target: 'bob-lazar',        label: "Lazar's Element 115 gravity wave propulsion claims are frequently cited alongside Brown's electrogravitics as parallel evidence of classified anti-gravity development" },
    { source: 'townsend-brown', target: 'hal-puthoff',      label: "Both worked in the classified-adjacent advanced propulsion research space; Puthoff's zero-point energy work connects to Brown's electrogravitics theoretical framework" },
    { source: 'townsend-brown', target: 'eric-davis',       label: "Davis's theoretical work on spacetime metric engineering operates in the same research tradition as Brown's electrogravitics, both connected to the classified advanced propulsion community" },
    { source: 'townsend-brown', target: 'project-blue-book', label: 'Project Winterhaven (1953) was submitted contemporaneously with peak Blue Book activity; both represent mid-1950s U.S. government engagement with anomalous aerospace phenomena' },
    { source: 'townsend-brown', target: 'naval-intelligence', label: 'FBI confirmed Brown as the U.S. Navy top radar detection expert in 1943; his classified research career was anchored within the Navy intelligence apparatus' },

    // Thomas Wilson connections
    { source: 'thomas-wilson',   target: 'eric-davis',         label: 'co-subject of the Wilson-Davis Memo; Davis recorded their alleged 2002 meeting' },
    { source: 'thomas-wilson',   target: 'edgar-mitchell',     label: 'reportedly present at 1997 Pentagon UAP briefing; memo surfaced from Mitchell estate' },
    { source: 'thomas-wilson',   target: 'hal-puthoff',        label: 'connected through NIDS/AAWSAP network and Eric Davis collaboration' },
    { source: 'thomas-wilson',   target: 'wilson-davis-memo',  label: 'central subject of' },
    { source: 'thomas-wilson',   target: 'dia-organization',   label: 'directed (1999-2002)' },
    { source: 'wilson-davis-memo', target: 'thomas-wilson',    label: 'describes access denial experienced by' },
    { source: 'steven-greer',    target: 'thomas-wilson',      label: 'reportedly present at 1997 Pentagon UAP briefing with Wilson' },

    // Charles Halt connections
    { source: 'charles-halt', target: 'rendlesham-forest',  label: 'senior investigating officer and primary military witness; authored official Halt Memo documenting the encounter' },
    { source: 'charles-halt', target: 'john-burroughs',     label: 'Burroughs was a junior airman under Halt\'s command during the Rendlesham incident; Halt later advocated for his VA medical benefits case' },
    { source: 'charles-halt', target: 'nick-pope',          label: 'Pope investigated Rendlesham for UK MOD and has publicly corroborated the significance and authenticity of Halt\'s account' },
    { source: 'charles-halt', target: 'halt-memo-1981',     label: 'authored' },

    // Marco Rubio connections
    { source: 'marco-rubio', target: 'uap-task-force',      label: 'primary Senate architect of the UAPTF legislative mandate in the FY2020 Intelligence Authorization Act' },
    { source: 'marco-rubio', target: 'harry-reid',          label: 'Reid pioneered Senate UAP advocacy; Rubio formalized it through the 2020 UAPTF mandate' },
    { source: 'marco-rubio', target: 'kirsten-gillibrand',  label: 'Rubio\'s UAPTF mandate was the institutional foundation for Gillibrand\'s subsequent SASC oversight work and UAP Disclosure Act' },
    { source: 'marco-rubio', target: 'chuck-schumer',       label: 'collaborated on UAP transparency legislation; Schumer brought the UAP Disclosure Act to the Senate floor' },
    { source: 'marco-rubio', target: 'david-grusch',        label: 'publicly acknowledged Grusch\'s 2023 whistleblower allegations as credible; called for declassification and investigation' },

    // Peter Sturrock connections
    { source: 'peter-sturrock', target: 'jacques-vallee',   label: 'Vallee participated in the Sturrock Panel (1997); both shared the view that UAP warranted rigorous physical evidence analysis' },
    { source: 'peter-sturrock', target: 'j-allen-hynek',    label: 'Contemporaries who both advocated for serious scientific UAP research; Hynek\'s classification system influenced Sturrock\'s evidence framework' },
    { source: 'peter-sturrock', target: 'hal-puthoff',      label: 'Both operated at the intersection of mainstream physics and anomalous phenomena research; Puthoff\'s work was within the broader scientific community Sturrock helped legitimize' },

    // Nathan Twining connections
    { source: 'nathan-twining', target: 'twining-memo-1947',   label: 'authored the foundational 1947 memo concluding flying saucers are real and recommending a permanent classified study group' },
    { source: 'nathan-twining', target: 'project-sign',        label: 'Twining\'s 1947 memo directly recommended the study group that became Project Sign in 1948; AMC under Twining hosted Sign at Wright-Patterson' },
    { source: 'nathan-twining', target: 'project-blue-book',   label: 'institutional originator; Twining\'s memo recommendation created the program lineage that became Project Sign, Grudge, and Blue Book' },
    { source: 'nathan-twining', target: 'edward-ruppelt',      label: 'Ruppelt led Blue Book - the program whose institutional lineage traces directly to Twining\'s 1947 recommendation to establish a permanent classified study group' },
    { source: 'nathan-twining', target: 'j-allen-hynek',       label: 'Hynek served as scientific consultant to Blue Book, the program Twining\'s memo created; Twining\'s institutional framework defined the official UAP inquiry Hynek spent decades working within' },
    { source: 'nathan-twining', target: 'roswell-1947',        label: 'Twining was at Wright-Patterson AFB during the July 1947 Roswell recovery period; some researchers link his presence to material processing; his September 1947 memo followed the incident by weeks' },

    // James Fox connections
    { source: 'james-fox',   target: 'jacques-vallee',          label: 'featured in The Phenomenon; long-term source and collaborator' },
    { source: 'james-fox',   target: 'leslie-kean',             label: 'fellow credentialed journalist; parallel UAP research and sourcing networks' },
    { source: 'james-fox',   target: 'nick-pope',               label: 'Pope appeared in Fox documentaries as institutional UK government source' },
    { source: 'james-fox',   target: 'george-knapp',            label: 'fellow investigative journalist covering UAP; shared interview networks over decades' },
    { source: 'james-fox',   target: 'the-phenomenon-film',     label: 'produced' },
    { source: 'the-phenomenon-film', target: 'uaptf-preliminary-assessment', label: 'themes validated by' },

    // Fife Symington connections
    { source: 'fife-symington', target: 'james-fox',       label: 'recantation featured in I Know What I Saw; Fox provided platform for 2007 public reversal' },
    { source: 'fife-symington', target: 'phoenix-lights',  label: 'primary elected-official witness; initially dismissed publicly, then recanted and stated he personally observed the craft' },
    { source: 'phoenix-lights', target: 'fife-symington',  label: 'Governor of Arizona at time of event; later admitted to witnessing the craft' },

    // Jesse Marcel Sr. connections
    { source: 'jesse-marcel', target: 'roswell-1947',        label: 'primary military intelligence officer who recovered the Roswell debris field material and reported it to base command in July 1947' },
    { source: 'jesse-marcel', target: 'stanton-friedman',    label: 'Friedman located and interviewed Marcel in 1978, launching modern Roswell research; Marcel was Friedman\'s key primary military source' },
    { source: 'jesse-marcel', target: 'philip-corso',        label: 'both are Roswell-era military witnesses; Corso claimed later Pentagon involvement with debris Marcel originally recovered' },

    // Michael Herrera connections
    { source: 'michael-herrera', target: 'david-grusch',    label: 'co-testified at the July 2023 House Oversight hearing; both filed whistleblower complaints with the ICIG regarding UAP programs' },
    { source: 'michael-herrera', target: 'ryan-graves',     label: 'co-testified at the July 2023 House Oversight hearing; both are military veterans who brought firsthand UAP accounts before Congress' },
    { source: 'michael-herrera', target: 'tim-burchett',    label: 'Burchett co-organized the July 2023 hearing where Herrera testified publicly for the first time' },
    { source: 'michael-herrera', target: 'mike-gallagher',  label: 'Gallagher co-chaired the July 2023 hearing where Herrera described the 2009 Sumatra encounter' },

    // Robert Salas connections
    { source: 'robert-salas', target: 'malmstrom-afb-1967', label: 'primary living witness to the Echo Flight incident; was the on-duty launch control officer when all ten Minuteman ICBMs went offline as security personnel reported a UAP over the installation' },
    { source: 'robert-salas', target: 'robert-hastings',    label: 'primary research collaborator; co-developed the documentary case for the nuclear-UAP nexus and co-organized the 2010 National Press Club UFOs and Nuclear Weapons press conference' },
    { source: 'robert-salas', target: 'charles-halt',       label: 'fellow USAF officer and UAP witness; both submitted signed affidavits and appeared together at NPC events advocating for government transparency on military UAP incidents' },
    { source: 'robert-salas', target: 'steven-greer',       label: 'participated in the 2001 Disclosure Project NPC event as one of over 20 former military witnesses presenting testimony on government UAP suppression' },

    // Edgar Mitchell connections
    { source: 'edgar-mitchell', target: 'hal-puthoff',    label: "Puthoff's remote viewing and consciousness research at SRI in the 1970s directly intersected with Mitchell's post-Apollo investigation of anomalous cognition and the IONS research agenda" },
    { source: 'edgar-mitchell', target: 'john-mack',      label: 'parallel credentialed academics who both pursued UAP-adjacent consciousness research from within established institutions; Mitchell through IONS, Mack through Harvard; Rice University archives link both collections' },
    { source: 'edgar-mitchell', target: 'steven-greer',   label: 'participated in the 2001 Disclosure Project NPC event before publicly distancing himself, stating Greer had mischaracterized him as a direct UAP witness' },
    { source: 'edgar-mitchell', target: 'jacques-vallee', label: 'conference circuit contemporaries who shared the view that UAP warranted rigorous scientific investigation across overlapping decades of credentialed research' },

    // Tom DeLonge connections
    { source: 'tom-delonge', target: 'ttsa',             label: 'founded, serves as President and CEO; assembled the advisory team that made TTSA the vehicle for the 2017 UAP disclosure' },
    { source: 'tom-delonge', target: 'luis-elizondo',    label: "recruited Elizondo to TTSA immediately upon his Pentagon resignation; Elizondo is the primary figure through whom DeLonge obtained the Navy UAP videos that drove the December 2017 NYT disclosure" },
    { source: 'tom-delonge', target: 'chris-mellon',     label: 'co-designed the 2017 NYT disclosure strategy; Mellon provided the congressional and DoD institutional network that ensured the release had maximum official impact' },
    { source: 'tom-delonge', target: 'hal-puthoff',      label: 'recruited Puthoff as TTSA Vice President of Science and Technology; provided scientific and classified-program credibility that DeLonge could not supply himself' },
    { source: 'tom-delonge', target: 'jim-semivan',      label: 'recruited Semivan as TTSA Vice President of Operations; Semivan\'s CIA/NCS background gave TTSA intelligence community institutional credibility' },
    { source: 'tom-delonge', target: 'nimitz-tic-tac',   label: 'coordinated the public release of the FLIR1 Tic Tac video in December 2017 alongside the NYT article, making it the first officially acknowledged UAP footage in modern U.S. history' },

    // John Alexander connections
    { source: 'john-alexander', target: 'hal-puthoff',    label: "Puthoff's SRI remote viewing research overlapped with Alexander's INSCOM human technology work under General Stubblebine; Puthoff was a key scientific contributor to the Advanced Theoretical Physics Conference Alexander convened" },
    { source: 'john-alexander', target: 'jacques-vallee', label: 'Vallee participated in the ATP Conference as scientific advisor and wrote the introduction to Alexander\'s 2011 UAP book; both share the view that genuine anomalous phenomena exist without necessarily requiring a coordinated cover-up' },
    { source: 'john-alexander', target: 'colm-kelleher',  label: 'co-participants in NIDS investigations of Skinwalker Ranch; Alexander\'s counterintelligence and field operations background complemented Kelleher\'s scientific approach to NIDS field research' },
    { source: 'john-alexander', target: 'nids',           label: 'participated in NIDS field investigations of anomalous phenomena at Skinwalker Ranch as part of Bigelow\'s assembled research team post-retirement' },
    { source: 'john-alexander', target: 'los-alamos',     label: 'served as Director of Non-Lethal Weapons Department at Los Alamos National Laboratory from 1988; built the DoD non-lethal weapons research program with direct congressional oversight' },

    // John Callahan connections
    { source: 'john-callahan', target: 'jal-flight-1628',  label: 'primary FAA custodian of the complete evidentiary record; compiled radar data, voice recordings, and pilot reports and briefed FAA Administrator Admiral Engen on the encounter' },
    { source: 'john-callahan', target: 'steven-greer',      label: 'testified at the 2001 Disclosure Project NPC event, providing his account of the JAL 1628 incident and alleged CIA data confiscation alongside 20+ former military and government witnesses' },
    { source: 'john-callahan', target: 'leslie-kean',       label: "Kean's 2010 book documents the JAL 1628 case in detail, drawing on the FAA evidentiary record and Captain Terauchi's testimony that Callahan helped bring to public attention" },

    // Richard Doty connections
    { source: 'richard-doty', target: 'majestic-12',       label: 'supplied fabricated MJ-12 style documents to Bill Moore and others; the forged documents he introduced contaminated the evidentiary record that researchers like Friedman spent years attempting to authenticate' },
    { source: 'richard-doty', target: 'stanton-friedman',  label: "Friedman spent years attempting to authenticate MJ-12 documents that were part of the disinformation ecosystem Doty helped create; Doty's fabrications directly undermined Friedman's painstaking authentication work" },
    { source: 'richard-doty', target: 'george-knapp',      label: 'Knapp investigated and documented Doty\'s disinformation activities through KLAS-TV journalism and has interviewed him on Weaponized; the relationship illustrates the tension between investigative journalism and a documented disinformation source' },
    { source: 'richard-doty', target: 'richard-dolan',     label: "Dolan documented the Bennewitz affair and Doty's AFOSI operations in 'UFOs and the National Security State,' providing the most rigorous historical analysis of how deliberate disinformation contaminated the UAP research record" },

    // Barry Goldwater connections
    { source: 'barry-goldwater', target: 'nathan-twining',  label: "Twining's classified UAP protocols at Wright-Patterson established the secrecy culture that produced the 'Blue Room' access barrier Goldwater encountered when denied entry by General LeMay" },
    { source: 'barry-goldwater', target: 'james-mcdonald',  label: 'McDonald corresponded with Goldwater as part of his systematic campaign to engage members of Congress on UAP as a legitimate scientific matter in the late 1960s' },
    { source: 'barry-goldwater', target: 'steven-greer',    label: "Greer's Disclosure Project cited Goldwater's letters and CNN statements as foundational political evidence in congressional briefings; Goldwater's documented access denial became a cornerstone of the disclosure movement's political argument" },
    { source: 'barry-goldwater', target: 'harry-reid',      label: 'Both long-serving U.S. Senators pursued UAP transparency from within the Senate; Reid built on the political groundwork Goldwater had laid decades earlier' },

    // Linda Moulton Howe connections
    { source: 'linda-moulton-howe', target: 'richard-doty',      label: 'Doty targeted Howe with a fabricated classified briefing document at Kirtland AFB in 1983, making her a documented victim of AFOSI disinformation; the encounter is documented in her sworn affidavit' },
    { source: 'linda-moulton-howe', target: 'george-knapp',       label: 'long-term parallel investigative journalists covering UAP and anomalous phenomena across overlapping media environments including Coast to Coast AM over multiple decades' },
    { source: 'linda-moulton-howe', target: 'stanton-friedman',   label: 'long-term contemporaries in the UAP research community who both conducted extensive field investigation and published findings across overlapping decades of independent UAP research' },
    { source: 'linda-moulton-howe', target: 'john-mack',          label: 'parallel credentialed researchers who both applied professional rigor to anomalous phenomena investigation; Howe from broadcast journalism, Mack from Harvard psychiatry' },

    // Jeremy Corbell additional connections (base edges pre-exist in graph)
    { source: 'jeremy-corbell', target: 'tim-gallaudet',  label: 'Gallaudet specifically cited Corbell\'s USS Omaha footage release as significant to naval UAP awareness efforts, the most direct institutional endorsement of his work from a credentialed senior military officer' },
    { source: 'jeremy-corbell', target: 'tim-burchett',   label: 'Burchett entered the Corbell-Knapp UAP Puzzle document into the Congressional Record during the August 2023 House UAP hearing as official congressional documentation' },

    // Whitley Strieber connections
    { source: 'whitley-strieber', target: 'john-mack',     label: 'subject of Harvard abduction research; Mack found no evidence of fabrication' },
    { source: 'whitley-strieber', target: 'jacques-vallee', label: 'long-term Dreamland collaborator; shared view of genuine anomalous contact reality' },
    { source: 'whitley-strieber', target: 'hal-puthoff',   label: 'Dreamland guest; parallel investigations of anomalous phenomena' },
    { source: 'whitley-strieber', target: 'george-knapp',  label: 'Dreamland platform and overlapping UAP research community' },

    // J. Allen Hynek additional connections
    { source: 'j-allen-hynek', target: 'project-blue-book', label: 'scientific consultant 1948-1969' },
    { source: 'j-allen-hynek', target: 'jacques-vallee',    label: 'co-authored The Edge of Reality (1975); intellectual partner until Hyneks death' },
    { source: 'j-allen-hynek', target: 'barry-goldwater',   label: 'contemporaneous public figures pushing for UAP transparency during Blue Book era' },

    // Kenneth Arnold connections
    { source: 'kenneth-arnold', target: 'donald-keyhoe',    label: 'Keyhoe made Arnolds 1947 sighting the cornerstone of NICAP advocacy' },
    { source: 'kenneth-arnold', target: 'edward-ruppelt',   label: 'Ruppelt reviewed Arnold case as Blue Book director; cited as credible in 1956 book' },
    { source: 'kenneth-arnold', target: 'j-allen-hynek',    label: 'Arnolds sighting precipitated Project Sign which Hynek consulted on from 1948' },
    { source: 'kenneth-arnold', target: 'project-blue-book', label: 'Arnolds 1947 sighting directly triggered formation of Project Sign (Blue Books predecessor)' },

    // Bruce Maccabee connections
    { source: 'bruce-maccabee', target: 'stanton-friedman',  label: 'co-founded Fund for UFO Research 1979; 40-year collaboration as credentialed physicists in civilian UAP research' },
    { source: 'bruce-maccabee', target: 'hal-puthoff',       label: 'parallel physics-credentialed investigators; shared methodological approach across overlapping UAP research networks' },
    { source: 'bruce-maccabee', target: 'robert-bigelow',    label: 'Bigelows NIDS engaged Maccabee for photo and film analysis work in the 1990s-2000s' },
    { source: 'bruce-maccabee', target: 'colm-kelleher',     label: 'Kellehers NIDS administration supported Maccabees analytical work under Bigelow funding' },

    // Wilbert Smith connections
    { source: 'wilbert-smith', target: 'stanton-friedman',    label: 'Friedman researched and publicized the 1950 Smith Memorandum after its 1979 declassification; memo became central to his MJ-12 investigations' },
    { source: 'wilbert-smith', target: 'donald-keyhoe',       label: 'parallel 1950s UAP institutional investigators; NICAP and Project Magnet were the two most credentialed contemporary programs' },
    { source: 'wilbert-smith', target: 'project-blue-book',   label: 'Project Magnet (Canada) and Blue Book (U.S.) were parallel official government UAP programs operating simultaneously in the early 1950s' },
    { source: 'wilbert-smith', target: 'roscoe-hillenkoetter', label: 'contemporaneous UAP institutional figures; Hillenkoetter was CIA Director when Smith filed his classified memo about U.S. UAP secrecy levels' },

    // Jesse Marcel Jr. connections
    { source: 'jesse-marcel-jr', target: 'jesse-marcel',      label: 'son of Jesse Marcel Sr.; directly handled Roswell debris his father retrieved from the Foster Ranch crash site in July 1947' },
    { source: 'jesse-marcel-jr', target: 'stanton-friedman',  label: 'Friedmans 1978 interview with Marcel Sr. drew Marcel Jr. into public disclosure; remained in contact through subsequent Roswell investigations' },
    { source: 'jesse-marcel-jr', target: 'roswell-1947',      label: 'childhood firsthand witness; handled anomalous debris brought home by his father from the Foster Ranch site' },

    // Lynne Kitei connections
    { source: 'lynne-kitei', target: 'phoenix-lights',       label: 'primary long-term witness; began documenting 1995 sightings two years before the March 1997 mass event and became the leading investigative voice for the case' },
    { source: 'lynne-kitei', target: 'fife-symington',       label: 'Symingtons 2004 public reversal - admitting he personally witnessed the Phoenix Lights V-formation - corroborated Kiteislong-standing account' },
    { source: 'lynne-kitei', target: 'linda-moulton-howe',   label: 'parallel credentialed women researchers who applied professional backgrounds to UAP field investigation; Howe covered the Phoenix Lights phenomenon' },

    // Anna Paulina Luna connections
    { source: 'anna-paulina-luna', target: 'tim-burchett',      label: 'co-organized July 2023 House Oversight UAP hearing; co-chair of the House UAP Caucus; closest legislative partner in bipartisan UAP oversight' },
    { source: 'anna-paulina-luna', target: 'david-grusch',       label: 'invited Grusch to testify at the July 2023 hearing; his sworn testimony and interdimensional framing directly informed her own public claims' },
    { source: 'anna-paulina-luna', target: 'george-knapp',       label: 'Knapp testified as a witness at Luna\'s September 2025 Task Force hearing on UAP transparency and whistleblower protection' },
    { source: 'anna-paulina-luna', target: 'kirsten-gillibrand', label: 'cross-chamber UAP oversight counterparts; coordinated on NDAA UAP provisions during 2023 and parallel whistleblower protection frameworks' },
    { source: 'anna-paulina-luna', target: 'dylan-borland',      label: 'Borland testified as a military whistleblower at Luna\'s September 2025 Task Force hearing on UAP transparency' },
    { source: 'anna-paulina-luna', target: 'aaro',               label: 'called former AARO Director Kirkpatrick a documented liar in her September 2025 Task Force opening statement; publicly demanded AARO be defunded and dissolved' },

    // Roscoe Hillenkoetter connections
    { source: 'roscoe-hillenkoetter', target: 'donald-keyhoe',    label: 'Naval Academy classmates; NICAP board colleagues 1957-1962' },
    { source: 'roscoe-hillenkoetter', target: 'kenneth-arnold',   label: 'Hillenkoetter was CIA Director when Arnolds 1947 sighting triggered Project Sign' },
    { source: 'roscoe-hillenkoetter', target: 'project-blue-book', label: 'CIA Director during Project Sign formation (1947); agency tracked UAP reports throughout his tenure' },
    { source: 'roscoe-hillenkoetter', target: 'barry-goldwater',  label: 'Contemporaneous institutional figures applying pressure for UAP transparency in the 1957-1964 period' },

    // Private defense contractor connections
    // Lockheed Martin
    { source: 'lockheed-martin',  target: 'david-grusch',             label: 'named as alleged SAP custodian of recovered non-human craft in 2023 congressional testimony under oath' },
    { source: 'lockheed-martin',  target: 's4-papoose',               label: 'Skunk Works personnel alleged connection to S-4 advanced programs' },
    { source: 'lockheed-martin',  target: 'area-51',                  label: 'Advanced Development Programs (Skunk Works) operated adjacent classified facilities' },
    { source: 'lockheed-martin',  target: 'immaculate-constellation', label: 'alleged prime contractor for the classified UAP SAP program' },
    { source: 'lockheed-martin',  target: 'egg-corporation',          label: 'EG&G was a co-contractor in the broader Area 51 classified contractor ecosystem' },

    // Northrop Grumman
    { source: 'northrop-grumman', target: 'david-grusch',             label: 'named as alleged SAP custodian of recovered non-human materials in 2023 congressional testimony under oath' },
    { source: 'northrop-grumman', target: 'nro',                      label: 'inherited extensive NRO classified program contracts via TRW acquisition (2002)' },
    { source: 'northrop-grumman', target: 'lockheed-martin',          label: 'co-named prime contractor in UAP SAP custodianship context' },

    // Raytheon
    { source: 'raytheon',         target: 'karl-nell',                label: 'former Director of Technology Strategy; Nell testified under oath before Congress in July 2023' },
    { source: 'raytheon',         target: 'david-grusch',             label: 'testified alongside Nell at July 2023 House Oversight hearing' },
    { source: 'raytheon',         target: 'nimitz-tic-tac',           label: 'Raytheon sensor systems on USS Princeton and F/A-18s recorded and tracked the 2004 Tic Tac encounter' },
    { source: 'raytheon',         target: 'uss-theodore-roosevelt',   label: 'Raytheon ATFLIR pod sensor systems captured the 2014-2015 UAP footage' },

    // Battelle
    { source: 'battelle',         target: 'project-blue-book',        label: 'primary contractor for statistical analysis of 3,201 UAP cases; produced Special Report No. 14 (1955)' },
    { source: 'battelle',         target: 'blue-book-special-report-14', label: 'produced the report; findings contradicted the Air Force\'s public debunking position' },
    { source: 'battelle',         target: 'j-allen-hynek',            label: 'worked alongside Hynek on Blue Book analytical work; shared scientific assessment of UAP quality data' },

    // SAIC
    { source: 'saic',             target: 'david-grusch',             label: 'named alongside other prime defense contractors as alleged SAP custodian in Grusch disclosure' },
    { source: 'saic',             target: 'dia-organization',         label: 'extensive DIA and intelligence community analytical and technology contracts' },

    // Leidos
    { source: 'leidos',           target: 'saic',                     label: 'Leidos is the government services successor to the original SAIC following the 2013 corporate split; inherited IC and DoD analytical contracts' },
    { source: 'leidos',           target: 'david-grusch',             label: 'operates within the prime government services contractor ecosystem cited by Grusch as the institutional environment for alleged UAP SAP management' },
    { source: 'leidos',           target: 'aaro',                     label: 'holds IC analytical support contracts spanning agencies with direct UAP data collection roles under AARO oversight mandate' },
    { source: 'leidos',           target: 'uap-task-force',           label: 'IC support contract portfolio includes agencies that contributed to the UAPTF preliminary assessment data set' },

    // Boeing Defense
    { source: 'boeing-defense',   target: 'nimitz-tic-tac',           label: 'manufacturer of the F/A-18F Super Hornet flown by Fravor during the 2004 encounter and the aircraft that filmed the FLIR1 footage' },
    { source: 'boeing-defense',   target: 'david-fravor',             label: 'Fravor piloted a Boeing F/A-18F Super Hornet from VFA-41 during the November 2004 Nimitz Tic Tac encounter' },
    { source: 'boeing-defense',   target: 'uss-theodore-roosevelt',   label: 'F/A-18F Super Hornets assigned to USS Theodore Roosevelt filmed the Gimbal and GoFast UAP footage in 2014-2015' },
    { source: 'boeing-defense',   target: 'david-grusch',             label: 'named alongside other prime aerospace contractors with classified advanced development programs as alleged SAP custodians in Grusch 2023 congressional testimony' },
    { source: 'boeing-defense',   target: 'lockheed-martin',          label: 'co-prime aerospace contractor with parallel classified advanced development divisions (Phantom Works / Skunk Works) in UAP SAP custodianship context' },
    { source: 'boeing-defense',   target: 'pentagon-uap-video-release-2020', label: 'the formally released FLIR1, Gimbal, and GoFast footage was captured by sensors aboard Boeing F/A-18 Super Hornets' },

    // Additional case connections (batch 3)
    // Belgian UFO Wave
    { source: 'belgian-ufo-wave',     target: 'jacques-vallee',         label: 'Vallee cited the Belgian wave as among the most rigorously documented mass-sighting events in the modern era' },
    { source: 'belgian-ufo-wave',     target: 'nicap',                  label: 'documented and analyzed by civilian investigative organizations including NICAP and SOBEPS' },

    // USS Omaha USO Incident
    { source: 'uss-omaha-2019',       target: 'tim-gallaudet',          label: 'Gallaudet, former Navy oceanographer and deputy NOAA administrator, cited the USS Omaha transmedium footage as high-credibility evidence' },
    { source: 'uss-omaha-2019',       target: 'uap-task-force',         label: 'footage reviewed by the DoD UAP Task Force as part of its 2021 preliminary assessment data set' },
    { source: 'uss-omaha-2019',       target: 'uaptf-preliminary-assessment', label: 'incident data contributed to the 2021 UAPTF preliminary assessment' },

    // Exeter Incident
    { source: 'exeter-1965',          target: 'j-allen-hynek',          label: 'Hynek investigated the Exeter case for Project Blue Book; it became one of his cited examples of unexplained high-quality reports' },
    { source: 'exeter-1965',          target: 'nicap',                  label: 'NICAP conducted an independent investigation and confirmed multiple independent witness accounts' },
    { source: 'exeter-1965',          target: 'project-blue-book',      label: 'investigated and officially listed as unresolved in Blue Book records' },

    // Loch Raven Dam
    { source: 'loch-raven-dam-1958',  target: 'j-allen-hynek',          label: 'Hynek reviewed the Loch Raven Dam case as part of Blue Book; multi-witness electromagnetic effects made it a notable unsolved case' },
    { source: 'loch-raven-dam-1958',  target: 'project-blue-book',      label: 'investigated under Project Blue Book; electromagnetic effects and car engine failure documented' },

    // Socorro / Zamora
    { source: 'socorro-1964',         target: 'j-allen-hynek',          label: 'Hynek investigated the Socorro landing personally; described it as the most credible close-encounter physical-trace case in the Blue Book files' },
    { source: 'socorro-1964',         target: 'project-blue-book',      label: 'investigated by Project Blue Book; officially listed as unidentified — one of the few cases Condon investigators could not explain' },
    { source: 'socorro-1964',         target: 'nicap',                  label: 'NICAP conducted parallel investigation; confirmed soil disturbance and independent witness corroboration' },

    // Shag Harbour
    { source: 'shag-harbour-1967',    target: 'nicap',                  label: 'one of the few cases involving documented Canadian government investigation; NICAP cross-referenced the official RCMP and DND records' },
    { source: 'shag-harbour-1967',    target: 'donald-keyhoe',          label: 'Keyhoe cited Shag Harbour as a prime example of governments tracking UAP with physical evidence under secrecy' },

    // O'Hare Airport 2006
    { source: 'ohare-airport-2006',   target: 'leslie-kean',            label: "Kean's Chicago Tribune investigation of the O'Hare incident — published Jan 1, 2007 — was among the most widely read UAP news stories of the decade and triggered renewed public debate" },
    { source: 'ohare-airport-2006',   target: 'mufon',                  label: 'MUFON conducted field investigation and collected witness statements from United Airlines personnel' },

    // Stephenville TX
    { source: 'stephenville-tx-2008', target: 'leslie-kean',            label: "Kean covered the Stephenville encounters as part of her systematic documentation of high-credibility military and aviation UAP reports" },
    { source: 'stephenville-tx-2008', target: 'mufon',                  label: 'MUFON deployed its largest field investigation team to Stephenville; collected 200+ witness accounts and radar data' },

    // JAL Flight 1628 (already in graph — add missing figure edge)
    { source: 'jal-flight-1628',      target: 'richard-dolan',          label: 'Dolan cited JAL 1628 as one of the most carefully documented aviation UAP encounters on record, with FAA radar corroboration' },

    // Grusch IC Inspector General Complaint (2023)
    { source: 'grusch-ig-complaint-2023', target: 'david-grusch',                label: 'filed by; foundational document behind modern congressional UAP hearings' },
    { source: 'grusch-ig-complaint-2023', target: 'aaro',                         label: "AARO's Historical Record Report directly disputes the complaint's core allegations" },
    { source: 'grusch-ig-complaint-2023', target: 'ndaa-fy2023-uap-provisions',   label: 'ICWPA framework enabling this complaint builds on UAP whistleblower protections in NDAA' },
    { source: 'grusch-ig-complaint-2023', target: 'wilson-davis-memo',            label: 'both allege the identical private contractor oversight-denial mechanism for UAP program concealment' },
    { source: 'grusch-ig-complaint-2023', target: 'aaro-historical-record-vol1',  label: 'AARO Vol. 1 directly rebuts the core crash retrieval and reverse engineering allegations' },
    { source: 'grusch-ig-complaint-2023', target: 'karl-nell',                    label: 'Nell publicly corroborated the complaint and disputed AARO\'s rebuttal on record' },

    // Project Grudge Final Report (1949)
    { source: 'project-grudge-final-report-1949', target: 'project-grudge',      label: 'produced by; primary deliverable of the Grudge investigation program' },
    { source: 'project-grudge-final-report-1949', target: 'j-allen-hynek',       label: 'Hynek served as astronomical consultant; later disputed the debunking conclusions as methodologically unsound' },
    { source: 'project-grudge-final-report-1949', target: 'project-sign',        label: "succeeded Project Sign's investigative record following Vandenberg's rejection of Sign's extraterrestrial estimate" },
    { source: 'project-grudge-final-report-1949', target: 'project-blue-book',   label: 'Grudge became Blue Book in 1952; the report directly established the debunking mandate Blue Book inherited' },
    { source: 'project-grudge-final-report-1949', target: 'edward-ruppelt',      label: "Ruppelt characterized Grudge as a 'fiasco' and deliberate whitewash; his critique is the most authoritative insider account of the program's failures" },

    // Socorro / Zamora Blue Book Investigation Report (1964)
    { source: 'socorro-blue-book-investigation-1964', target: 'socorro-1964',       label: 'official Project Blue Book investigation file for this case (Case 8766)' },
    { source: 'socorro-blue-book-investigation-1964', target: 'j-allen-hynek',      label: 'Hynek personally investigated and declared it the most credible physical-trace close-encounter in all Blue Book records' },
    { source: 'socorro-blue-book-investigation-1964', target: 'project-blue-book',  label: 'issued by Project Blue Book; officially classified Unidentified with no conventional explanation found' },
    { source: 'socorro-blue-book-investigation-1964', target: 'nicap',              label: 'NICAP conducted independent parallel investigation corroborating physical evidence and Zamora account' },

    // BAASS AAWSAP Contract (2008)
    { source: 'baass-aawsap-contract-2008', target: 'aawsap',                    label: 'the contract that created and funded the AAWSAP program; established the institutional research framework' },
    { source: 'baass-aawsap-contract-2008', target: 'bigelow-aerospace',         label: 'awarded to BAASS (Bigelow Aerospace Advanced Space Studies LLC), a Bigelow subsidiary' },
    { source: 'baass-aawsap-contract-2008', target: 'hal-puthoff',               label: 'authored the scientific statement of work; served as principal DIRD researcher on propulsion and exotic physics' },
    { source: 'baass-aawsap-contract-2008', target: 'luis-elizondo',             label: 'AATIP operated within the institutional framework and DIA relationship established by this contract' },
    { source: 'baass-aawsap-contract-2008', target: 'aaro-historical-record-vol1', label: 'AARO Vol. 1 characterizes AAWSAP as primarily paranormal research; Elizondo and Puthoff dispute this characterization' },

    // GEPAN / SEPRA / GEIPAN (French official UAP investigation office)
    { source: 'gepan', target: 'project-blue-book', label: "France's official counterpart to the US Project Blue Book — both were government-sanctioned systematic UAP investigation programs" },
    { source: 'gepan', target: 'nicap',             label: 'NICAP and GEPAN maintained research correspondence; GEPAN case taxonomy drew on NICAP classification methodology developed in parallel' },

    // COMETA Report (1999)
    { source: 'cometa-report-1999', target: 'gepan',          label: 'extensively cited French GEPAN/SEPRA investigation data as the primary evidentiary foundation for its case analysis' },
    { source: 'cometa-report-1999', target: 'jacques-vallee', label: "analytical framework applied Vallee's physical-trace and EM-effect case classification methodology to GEPAN/SEPRA records" },
    { source: 'cometa-report-1999', target: 'nick-pope',      label: 'contemporaneous parallel European government investigation reaching similar conclusions about the seriousness of unexplained cases' },
    { source: 'cometa-report-1999', target: 'nicap',          label: 'used NICAP international case archives as corroborating database alongside classified GEPAN/SEPRA French records' },
    { source: 'cometa-report-1999', target: 'richard-dolan',  label: "Dolan produced the most comprehensive English-language analysis; treats COMETA as evidence of non-US government awareness exceeding official US acknowledgment" },

    // CRS UAP Report (2022)
    { source: 'crs-uap-report-2022', target: 'ndaa-fy2023-uap-provisions',   label: 'preceded and directly informed the NDAA FY2023 provisions creating AARO and mandating new UAP reporting requirements' },
    { source: 'crs-uap-report-2022', target: 'aaro',                         label: 'analyzed the legislative mandate for and creation of AARO as the primary policy recommendation' },
    { source: 'crs-uap-report-2022', target: 'uaptf-preliminary-assessment', label: 'used the June 2021 UAPTF Preliminary Assessment as the central analytical starting point for legislative context' },
    { source: 'crs-uap-report-2022', target: 'chris-mellon',                 label: "Mellon's Senate Intel work and classified UAP briefings are documented in the legislative background the report analyzed" },

    // Rockefeller UFO Briefing Document (1995)
    { source: 'rockefeller-briefing-document-1995', target: 'laurance-rockefeller', label: 'commissioned and funded by; presented to Clinton White House through Rockefeller\'s direct personal access to senior administration officials' },
    { source: 'rockefeller-briefing-document-1995', target: 'stanton-friedman',     label: 'served as principal scientific consultant and technical reviewer; Roswell case section reflects his research' },
    { source: 'rockefeller-briefing-document-1995', target: 'nicap',                label: 'NICAP case archives provided the primary evidentiary base for all seven high-quality UAP incidents presented' },
    { source: 'rockefeller-briefing-document-1995', target: 'mufon',                label: 'MUFON investigation records used as corroborating case evidence alongside NICAP archives' },

    // Travis Walton connections
    { source: 'travis-walton',    target: 'stanton-friedman',   label: 'Friedman documented and cited the Walton case as one of the highest-credibility multiple-witness CE4 cases; both appeared at UAP conferences together' },
    { source: 'travis-walton',    target: 'whitley-strieber',   label: 'fellow CE4 experiencer-authors; both represent the most sustained first-person public accounts of non-human contact experiences in the research canon' },
    { source: 'travis-walton',    target: 'john-mack',          label: "Mack's 1994 abduction research framework referenced the Walton case as a foundational multi-witness CE4 event" },
    { source: 'travis-walton',    target: 'disclosure-project', label: 'provided testimony at the 2001 Disclosure Project National Press Club event alongside over 20 military and government witnesses' },

    // Budd Hopkins connections
    { source: 'budd-hopkins',     target: 'whitley-strieber',   label: "Hopkins investigated Strieber's 1985-86 experiences; the investigation contributed to Strieber's landmark 1987 memoir Communion" },
    { source: 'budd-hopkins',     target: 'john-mack',          label: 'Hopkins introduced Mack to CE4 research in 1992; Mack subsequently conducted a formal Harvard investigation using Hopkins regression methodology' },
    { source: 'budd-hopkins',     target: 'colm-kelleher',      label: 'NIDS anomalous phenomena research overlapped substantially with Hopkins CE4 documentation; both contributed to the same research conferences' },
    { source: 'budd-hopkins',     target: 'nicap',              label: 'maintained research connections with NICAP and drew on NICAP case archives in developing the missing time framework' },

    // Roger Leir connections
    { source: 'roger-leir',       target: 'garry-nolan',        label: 'both conducted independent materials analysis of alleged non-human physical specimens; Nolan used advanced immunological methods, Leir surgical extraction and metallurgical analysis' },
    { source: 'roger-leir',       target: 'john-mack',          label: 'both approached CE4 from medical professional backgrounds during the same period; Mack psychiatric investigation, Leir surgical and materials analysis' },
    { source: 'roger-leir',       target: 'colm-kelleher',      label: 'NIDS received and analyzed implant specimens from Leir surgical procedures as part of its broad anomalous phenomena research program' },
    { source: 'roger-leir',       target: 'nids',               label: 'National Institute for Discovery Science analyzed specimens from Leir implant removal surgeries and cross-referenced findings with its broader research program' },

    // Betty and Barney Hill connections
    { source: 'betty-barney-hill', target: 'stanton-friedman',  label: 'Friedman conducted the most comprehensive modern investigation and co-authored the definitive 2007 account Captured! with Betty\'s niece Kathleen Marden' },
    { source: 'betty-barney-hill', target: 'donald-keyhoe',     label: 'Betty Hill wrote to NICAP director Keyhoe within weeks of the encounter; NICAP conducted the first formal investigation under his direction' },
    { source: 'betty-barney-hill', target: 'john-mack',         label: "Mack cited the Hill case as the foundational historical reference for the abduction research tradition in his 1994 study Abduction" },
    { source: 'betty-barney-hill', target: 'budd-hopkins',      label: "Hopkins cited the Hill case as the historical touchstone against which all subsequent CE4 cases were calibrated; the case directly established the research tradition Hopkins systematized" },
    { source: 'betty-barney-hill', target: 'nicap',             label: 'NICAP investigated the case as one of the most credible on record after Betty Hill contacted Donald Keyhoe in October 1961' },

    // John Lear connections
    { source: 'john-lear',        target: 'bob-lazar',          label: 'introduced Lazar to journalist George Knapp at KLAS-TV Las Vegas in 1989; the resulting broadcasts produced the most consequential UAP disclosure of the 1980s' },
    { source: 'john-lear',        target: 'george-knapp',       label: 'long-term professional relationship; Lear introduced Lazar to Knapp and appeared in the original KLAS-TV broadcasts corroborating Lazar S-4 claims' },
    { source: 'john-lear',        target: 'richard-doty',       label: 'overlapping networks in the late 1980s UAP disclosure community; Doty documented disinformation operations raise questions about some information Lear received from alleged IC contacts' },
    { source: 'john-lear',        target: 's4-papoose',         label: 'was the first person to publicly claim prior knowledge of S-4 operations before Lazar\'s 1989 disclosure' },
    { source: 'john-lear',        target: 'disclosure-project', label: 'provided testimony at the 2001 Disclosure Project National Press Club event as one of over 20 former government and military witnesses' },

    // Kenneth Arnold Sighting (1947) connections
    { source: 'kenneth-arnold-1947', target: 'project-sign',        label: 'the Arnold sighting directly triggered the formation of Project Sign — the first official US government UAP investigation program' },
    { source: 'kenneth-arnold-1947', target: 'j-allen-hynek',       label: 'Hynek consulted on Project Sign from 1948; the Arnold sighting was the precipitating event that established the program Hynek advised' },
    { source: 'kenneth-arnold-1947', target: 'donald-keyhoe',       label: "Keyhoe cited Arnold's June 24 1947 sighting as the founding event of the modern UAP era and the cornerstone case for NICAP's congressional advocacy" },
    { source: 'kenneth-arnold-1947', target: 'kenneth-arnold',      label: 'primary witness; his account and timing data are the primary evidentiary record' },
    { source: 'kenneth-arnold-1947', target: 'nicap',               label: 'NICAP documented the Arnold case as foundational in its congressional lobbying record and public case archive' },

    // Betty and Barney Hill Abduction (1961) connections
    { source: 'betty-barney-hill-1961', target: 'betty-barney-hill',  label: 'Betty and Barney Hill are the subjects; their separate hypnosis accounts under Dr. Benjamin Simon form the primary record' },
    { source: 'betty-barney-hill-1961', target: 'stanton-friedman',   label: 'Friedman co-authored Captured! (2007) with Kathleen Marden — the definitive forensic re-examination of the Hill case' },
    { source: 'betty-barney-hill-1961', target: 'budd-hopkins',       label: "Hopkins cited the Hill case as the historical touchstone against which all subsequent CE4 abduction research was calibrated; directly influenced Missing Time (1981)" },
    { source: 'betty-barney-hill-1961', target: 'donald-keyhoe',      label: 'NICAP under Keyhoe conducted the first formal investigation in 1961 after Betty Hill wrote to him within weeks of the encounter' },
    { source: 'betty-barney-hill-1961', target: 'john-mack',          label: "Mack cited the Hill case as the foundational reference for the abduction research tradition in Abduction (1994)" },
    { source: 'betty-barney-hill-1961', target: 'nicap',              label: 'NICAP investigators Walter Webb and C.D. Jackson conducted the first formal investigation' },

    // Travis Walton Abduction (1975) connections
    { source: 'walton-abduction-1975', target: 'travis-walton',      label: 'Travis Walton is the primary subject; six crew members witnessed the initial beam-strike event' },
    { source: 'walton-abduction-1975', target: 'budd-hopkins',       label: 'Hopkins referenced the Walton case as notable multi-witness corroboration in his CE4 abduction research framework' },
    { source: 'walton-abduction-1975', target: 'stanton-friedman',   label: 'Friedman investigated the crew polygraph results and concluded the multi-witness corroboration makes this the most evidentially robust CE4 incident on record' },
    { source: 'walton-abduction-1975', target: 'john-mack',          label: 'Mack noted structural similarities between the Walton account and accounts from his clinical CE4 subjects with no prior knowledge of the Walton case' },
    { source: 'walton-abduction-1975', target: 'mufon',              label: 'MUFON conducted a formal investigation alongside APRO and documented the crew polygraph record and witness accounts' },

    // Cash-Landrum Incident (1980) connections
    { source: 'cash-landrum-1980',     target: 'mufon',              label: 'aerospace engineer John Schuessler (MUFON) investigated within days of the incident and maintained the primary investigative record for decades' },
    { source: 'cash-landrum-1980',     target: 'gepan',              label: 'GEPAN investigators cited the Cash-Landrum medical injury documentation as a significant parallel to Trans-en-Provence physical effects in their broader field research' },

    // Trans-en-Provence Landing (1981) connections
    { source: 'trans-en-provence-1981', target: 'gepan',             label: 'GEPAN/CNES conducted the official French government investigation; Technical Note No. 16 is the primary scientific record' },
    { source: 'trans-en-provence-1981', target: 'j-allen-hynek',     label: "Hynek's colleagues at CUFOS cited Trans-en-Provence alongside Socorro as the two strongest physical-trace close-encounter cases in the world literature" },
    { source: 'trans-en-provence-1981', target: 'jacques-vallee',    label: "Vallee conducted independent fieldwork analysis in Confrontations (1990) and concluded it is one of the most rigorously documented UAP physical effect cases in the global research literature" },

    // UK MoD UFO Files (1950-2009) connections
    { source: 'uk-mod-ufo-files-2009', target: 'nick-pope',          label: 'Pope ran the MoD UFO desk (1991-1994) that produced many of the released files; served as primary public communicator during the 2009 release' },
    { source: 'uk-mod-ufo-files-2009', target: 'mod-ufo-desk',       label: 'the MoD UFO desk and its predecessor DI55 are the issuing authority for the operational investigation files in the collection' },
    { source: 'uk-mod-ufo-files-2009', target: 'leslie-kean',        label: "Kean cited the DI55 files extensively in UFOs: Generals, Pilots and Government Officials (2010) as primary evidence of government-level UAP seriousness" },
    { source: 'uk-mod-ufo-files-2009', target: 'rendlesham-forest',  label: 'the Rendlesham Forest 1980 incident files are included in the released collection; DI55 investigation and Charles Halt correspondence are part of the archive' },
    { source: 'uk-mod-ufo-files-2009', target: 'richard-dolan',      label: 'Dolan analyzed the UK release within his UFOs and the National Security State series as the most comprehensive example of European government UAP concealment' },

    // Pentagon UAP Video Formal Release (2020) connections
    { source: 'pentagon-uap-video-release-2020', target: 'luis-elizondo',  label: 'formally legitimized the 2017 TTSA video release that Elizondo orchestrated after resigning from AATIP' },
    { source: 'pentagon-uap-video-release-2020', target: 'david-fravor',   label: 'confirmed authenticity of FLIR1 footage from the 2004 Nimitz encounter Fravor witnessed and publicly testified about' },
    { source: 'pentagon-uap-video-release-2020', target: 'leslie-kean',    label: 'Kean co-authored the 2017 NYT article first publishing the TTSA videos; this release confirmed the footage was genuine' },
    { source: 'pentagon-uap-video-release-2020', target: 'nimitz-tic-tac', label: 'FLIR1 video confirmed as authentic footage from the November 2004 Nimitz Tic Tac encounter' },
    { source: 'pentagon-uap-video-release-2020', target: 'aatip',          label: 'videos were obtained and advocated for by AATIP under Elizondo; formal release retroactively validated program efforts' },

    // Grusch ICIG Determination (2023) connections
    { source: 'grusch-icig-determination-2023', target: 'david-grusch',    label: 'formal ICIG credible-and-urgent determination of Grusch whistleblower complaint' },
    { source: 'grusch-icig-determination-2023', target: 'karl-nell',       label: 'Nell provided corroborating testimony to ICIG supporting credibility of Grusch claims' },
    { source: 'grusch-icig-determination-2023', target: 'luis-elizondo',   label: 'prior AATIP disclosures provided institutional context for ICIG credibility assessment' },
    { source: 'grusch-icig-determination-2023', target: 'uap-task-force',  label: 'Grusch complaint derived from his role as NGA representative to the UAPTF' },
    { source: 'grusch-icig-determination-2023', target: 'aaro',            label: 'ICIG determination preceded and shaped the congressional oversight context in which AARO operated' },

    // SOBEPS Belgian UFO Wave Investigation Report (1991) connections
    { source: 'sobeps-belgian-ufo-wave-1991', target: 'belgian-ufo-wave',  label: 'primary official investigation report documenting the 1989-1991 Belgian UFO wave including F-16 radar intercept data' },
    { source: 'sobeps-belgian-ufo-wave-1991', target: 'jacques-vallee',    label: 'Vallee contributed analysis to the SOBEPS investigation and cited the Belgian wave as among the most rigorously documented mass-sighting events' },
    { source: 'sobeps-belgian-ufo-wave-1991', target: 'leslie-kean',       label: "Kean featured General De Brouwer's account and the Belgian radar data prominently in UFOs: Generals, Pilots and Government Officials (2010)" },
    { source: 'sobeps-belgian-ufo-wave-1991', target: 'richard-dolan',     label: "Dolan documented the SOBEPS investigation extensively in UFOs and the National Security State as a landmark case of official military engagement" },

    // UAP Disclosure Act of 2023 connections
    { source: 'uap-disclosure-act-2023', target: 'chuck-schumer',              label: 'introduced by; Schumer brought bill to Senate floor and cited Grusch testimony as motivating factor' },
    { source: 'uap-disclosure-act-2023', target: 'david-grusch',               label: 'Grusch testimony explicitly cited by Schumer as motivating legislation; contractor seizure provision shaped by his allegations' },
    { source: 'uap-disclosure-act-2023', target: 'karl-nell',                  label: 'classified congressional briefings by Nell cited in Schumer floor statements alongside Grusch testimony' },
    { source: 'uap-disclosure-act-2023', target: 'chris-mellon',               label: 'lobbied extensively for UAP disclosure legislation; advised on JFK Act model used in bill structure' },
    { source: 'uap-disclosure-act-2023', target: 'aaro',                       label: 'enacted version tasks AARO with record collection and expanded reporting requirements' },
    { source: 'uap-disclosure-act-2023', target: 'ndaa-fy2024-uap-provisions', label: 'enacted as Sec. 1841 of FY2024 NDAA in weakened form after conference committee' },

    // Sturrock Panel Report (1998) connections
    { source: 'sturrock-panel-report-1998', target: 'peter-sturrock',   label: 'convened and chaired by' },
    { source: 'sturrock-panel-report-1998', target: 'jacques-vallee',   label: 'Vallee presented physical evidence cases to the panel' },
    { source: 'sturrock-panel-report-1998', target: 'robert-bigelow',   label: 'funded through NIDS' },
    { source: 'sturrock-panel-report-1998', target: 'nids',             label: 'sponsored by' },
    { source: 'sturrock-panel-report-1998', target: 'hal-puthoff',      label: 'NIDS scientific network overlap' },

    // Vallee-Davis Incommensurability (2003) connections
    { source: 'vallee-davis-incommensurability-2003', target: 'jacques-vallee',              label: 'co-authored by' },
    { source: 'vallee-davis-incommensurability-2003', target: 'eric-davis',                  label: 'co-authored by' },
    { source: 'vallee-davis-incommensurability-2003', target: 'hal-puthoff',                 label: "developed within EarthTech International (Puthoff's organization)" },
    { source: 'vallee-davis-incommensurability-2003', target: 'nids',                        label: 'presented at NIDS conference' },
    { source: 'vallee-davis-incommensurability-2003', target: 'wilson-davis-memo',           label: 'Davis authored both in the same period; overlapping classified/open research context' },
    { source: 'vallee-davis-incommensurability-2003', target: 'sturrock-panel-report-1998',  label: 'built upon physical evidence framework established by' },

    // Eric Burlison connections
    { source: 'eric-burlison', target: 'tim-burchett',       label: 'co-founding member of House UAP Caucus launched by Burchett; sustained legislative partnership on UAP oversight through 118th and 119th Congresses' },
    { source: 'eric-burlison', target: 'anna-paulina-luna',  label: 'fellow UAP Caucus founding member; both attended January 2024 SCIF briefing and were jointly briefed by Grusch at Top Secret level' },
    { source: 'eric-burlison', target: 'david-grusch',       label: 'Grusch testified at July 2023 hearing where Burlison cross-examined him; Burlison hired Grusch as Special Advisor to his office in March 2025' },
    { source: 'eric-burlison', target: 'chuck-schumer',      label: 'House counterpart to Schumer Senate UAPDA effort; Burlison introduced UAPDA 2025 in the House modeled on Schumer-Rounds structure' },
    { source: 'eric-burlison', target: 'kirsten-gillibrand', label: 'coordinated with Gillibrand Senate-side office during 2023-2024 NDAA UAP Disclosure Act push' },
    { source: 'eric-burlison', target: 'aaro',               label: 'Oversight Committee member who led bipartisan letter requesting a UAP Select Subcommittee; critical of AARO mandate and access limitations' },

    // Ingo Swann connections
    { source: 'ingo-swann',      target: 'hal-puthoff',        label: 'co-developed CRV protocol; primary subject in SCANATE and Jupiter remote viewing experiment at SRI' },
    { source: 'ingo-swann',      target: 'kit-green',          label: 'Green served as CIA case officer overseeing early SRI remote viewing program; shared intelligence-psi research network' },

    // Joe McMoneagle connections
    { source: 'joe-mcmoneagle',  target: 'hal-puthoff',        label: 'Remote Viewer #001 in GRILL FLAME / STAR GATE; Puthoff SRI research provided methodological foundation for McMoneagle recruitment' },
    { source: 'joe-mcmoneagle',  target: 'ingo-swann',         label: 'Swann designed the CRV protocol McMoneagle used operationally; civilian protocol architect and military practitioner of the same program' },
    { source: 'joe-mcmoneagle',  target: 'kit-green',          label: 'Green CIA oversight of early remote viewing program intersected with McMoneagle operational sessions' },
    { source: 'joe-mcmoneagle',  target: 'robert-monroe',      label: 'Monroe Institute Hemi-Sync methods were foundational to McMoneagle training; long-term Monroe Institute associate and speaker' },

    // Robert Monroe connections
    { source: 'robert-monroe',   target: 'hal-puthoff',        label: 'Skip Atwater 1977 visit bridged Monroe Institute OBE methods and Puthoff SRI remote viewing research into the Stargate training pipeline' },
    { source: 'robert-monroe',   target: 'ingo-swann',         label: 'Monroe Hemi-Sync methods informed the altered-state preparation dimension of Swann CRV protocol training framework' },
    { source: 'robert-monroe',   target: 'kit-green',          label: 'CIA-commissioned Gateway Process assessment connected Monroe methods to Green intelligence network overseeing psi research' },

    // Beatriz Villarroel connections
    { source: 'beatriz-villarroel', target: 'garry-nolan',   label: 'Sol Foundation Advisory Board; joint panel Sol 2024 Symposium' },
    { source: 'beatriz-villarroel', target: 'avi-loeb',       label: 'Sol Foundation colleagues; parallel empirical technosignature programs' },
    { source: 'beatriz-villarroel', target: 'jacques-vallee', label: 'co-authors on 2025 New Science of UAP paper; Sol Foundation symposia' },

    // Kevin Knuth connections
    { source: 'kevin-knuth', target: 'beatriz-villarroel', label: 'co-authors on 2025 New Science of UAP paper; IFEX affiliates' },
    { source: 'kevin-knuth', target: 'avi-loeb',           label: 'Galileo Project affiliate; co-authored observatory methodology paper' },
    { source: 'kevin-knuth', target: 'garry-nolan',        label: 'co-speakers at Sol Foundation inaugural and 2024 symposia' },
    { source: 'kevin-knuth', target: 'jacques-vallee',     label: 'co-speakers at Sol Foundation; co-authors on 2025 New Science of UAP paper' },

    // Matt Szydagis connections
    { source: 'matt-szydagis', target: 'kevin-knuth',        label: 'co-leads UAPx; co-authors on 2025 UAP papers; University at Albany colleagues' },
    { source: 'matt-szydagis', target: 'beatriz-villarroel', label: 'co-authors on 2025 New Science of UAP flagship paper' },
    { source: 'matt-szydagis', target: 'avi-loeb',           label: 'parallel instrumented UAP field research programs; 2025 New Science of UAP co-authors' },

    // David Spergel connections
    { source: 'david-spergel', target: 'sean-kirkpatrick',   label: 'both led major official UAP assessments in 2023 - Spergel NASA panel, Kirkpatrick AARO' },
    { source: 'david-spergel', target: 'avi-loeb',           label: 'parallel elite astrophysicist engagement with UAP; government-mandated vs independent empirical approach' },
    { source: 'david-spergel', target: 'garry-nolan',        label: 'both engaged UAP study publicly from elite scientific positions despite institutional risk' },

    // Hakan Kayal connections
    { source: 'hakan-kayal', target: 'kevin-knuth',        label: 'IFEX affiliates; co-authors on 2025 New Science of UAP paper' },
    { source: 'hakan-kayal', target: 'matt-szydagis',      label: 'IFEX affiliates; co-authors on 2025 New Science of UAP paper' },
    { source: 'hakan-kayal', target: 'beatriz-villarroel', label: 'co-authors on 2025 New Science of UAP flagship paper' },

    // Jeffrey Kripal connections
    { source: 'jeffrey-kripal', target: 'whitley-strieber', label: 'co-authored The Super Natural (2016); Strieber archive housed at Rice Archives of the Impossible' },
    { source: 'jeffrey-kripal', target: 'john-mack',        label: 'Archives of the Impossible holds complete John Mack Archive' },
    { source: 'jeffrey-kripal', target: 'garry-nolan',      label: 'Sol Foundation; presented at inaugural 2023 and 2024 symposia' },
    { source: 'jeffrey-kripal', target: 'diana-pasulka',    label: 'colleagues in academic study of religion and extraordinary experience; shared Sol Foundation network' },

    // Robert Powell connections
    { source: 'robert-powell', target: 'kevin-knuth',   label: 'co-authors on 2019 Entropy UAP physics paper' },
    { source: 'robert-powell', target: 'ryan-graves',   label: 'both work at intersection of pilot testimony and technical UAP analysis' },
    { source: 'robert-powell', target: 'leslie-kean',   label: 'parallel serious-evidence UAP documentation efforts; co-authored UFOs and Government (2012)' },

    // Alexander Wendt connections
    { source: 'alexander-wendt', target: 'leslie-kean',    label: 'contributing chapter in UFOs: Generals, Pilots, and Government Officials (2010)' },
    { source: 'alexander-wendt', target: 'garry-nolan',    label: 'Sol Foundation 2024 symposium; complementary scientific and political theory perspectives' },
    { source: 'alexander-wendt', target: 'jeffrey-kripal', label: 'colleagues in academic humanities engagement with UAP; both at Sol Foundation' },
    { source: 'alexander-wendt', target: 'daniel-sheehan', label: 'both analyze UAP disclosure as a structural political and legal problem' },

    // Gary McKinnon connections
    { source: 'gary-mckinnon', target: 'nick-pope',      label: 'Pope publicly discussed McKinnon\'s UAP evidence claims throughout the extradition battle' },
    { source: 'gary-mckinnon', target: 'steven-greer',   label: 'Disclosure Project 2001 press conference was McKinnon\'s stated inspiration for the intrusions' },
    { source: 'gary-mckinnon', target: 'ross-coulthart', label: 'Coulthart referenced McKinnon\'s case in UAP investigative reporting' },

    // Mathew Bevan connections
    { source: 'mathew-bevan', target: 'gary-mckinnon', label: 'direct historical predecessor; both UK hackers arrested for UAP-motivated US government intrusions; spoke publicly after McKinnon\'s 2002 arrest' },
    { source: 'mathew-bevan', target: 'nick-pope',      label: 'Pope commented on Bevan\'s case as part of his concurrent UK MoD UAP documentation work' },
    { source: 'mathew-bevan', target: 'steven-greer',   label: 'both represent the UAP evidence-hunting tradition Greer\'s Disclosure Project would later amplify' },
  ],
};
