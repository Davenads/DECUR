export type NodeType =
  | 'person'
  | 'facility'
  | 'entity'
  | 'organization'
  | 'project'
  | 'concept'
  | 'technology'
  | 'document'
  | 'case';

export type NodeGroup = 'burisch' | 'lazar' | 'grusch' | 'elizondo' | 'fravor' | 'nell' | 'nolan' | 'puthoff' | 'mellon' | 'davis' | 'bigelow' | 'vallee' | 'pope' | 'shared' | 'corbell' | 'mccullough';

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  group?: NodeGroup; // optional — auto-derived person nodes may omit this
  val?: number; // relative size weight
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
};

// Person nodes for figures WITHOUT dedicated profile pages.
// All profiled insiders are auto-derived from data/key-figures/index.json in NetworkGraph.tsx.
export const supplementaryPersonNodes: GraphNode[] = [
  { id: 'john-lear',          name: 'John Lear',          type: 'person', group: 'lazar',    val: 2 },
  { id: 'jim-slaight',        name: 'Jim Slaight',        type: 'person', group: 'fravor',   val: 2 },
  { id: 'jeremy-corbell',     name: 'Jeremy Corbell',     type: 'person', group: 'corbell',  val: 3 },
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
    { id: 'the-phenomenon-film', name: "The Phenomenon (2020)",     type: 'document',     val: 3 },

    // Additional cases for Fife Symington
    { id: 'phoenix-lights',      name: 'Phoenix Lights (1997)',     type: 'case',         val: 4 },
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

    // Barry Goldwater connections
    { source: 'barry-goldwater', target: 'nathan-twining',  label: "Twining's classified UAP protocols at Wright-Patterson established the secrecy culture that produced the 'Blue Room' access barrier Goldwater encountered when denied entry by General LeMay" },
    { source: 'barry-goldwater', target: 'james-mcdonald',  label: 'McDonald corresponded with Goldwater as part of his systematic campaign to engage members of Congress on UAP as a legitimate scientific matter in the late 1960s' },
    { source: 'barry-goldwater', target: 'steven-greer',    label: "Greer's Disclosure Project cited Goldwater's letters and CNN statements as foundational political evidence in congressional briefings; Goldwater's documented access denial became a cornerstone of the disclosure movement's political argument" },
    { source: 'barry-goldwater', target: 'harry-reid',      label: 'Both long-serving U.S. Senators pursued UAP transparency from within the Senate; Reid built on the political groundwork Goldwater had laid decades earlier' },
  ],
};
