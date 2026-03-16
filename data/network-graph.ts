export type NodeType =
  | 'person'
  | 'facility'
  | 'entity'
  | 'organization'
  | 'project'
  | 'concept'
  | 'technology'
  | 'document';

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
  person:       '#3b82f6', // blue
  facility:     '#f59e0b', // amber
  entity:       '#8b5cf6', // purple
  organization: '#14b8a6', // teal
  project:      '#22c55e', // green
  concept:      '#6366f1', // indigo
  technology:   '#f97316', // orange
  document:     '#e11d48', // rose
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
  ],
};
