export type NodeType =
  | 'person'
  | 'facility'
  | 'entity'
  | 'organization'
  | 'project'
  | 'concept'
  | 'technology';

export type NodeGroup = 'burisch' | 'lazar' | 'grusch' | 'elizondo' | 'fravor' | 'nell' | 'nolan' | 'puthoff' | 'mellon' | 'davis' | 'shared';

export interface GraphNode {
  id: string;
  name: string;
  type: NodeType;
  group: NodeGroup;
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
};

export const graphData: GraphData = {
  nodes: [
    // People
    { id: 'dan-burisch',         name: 'Dan Burisch',          type: 'person',       group: 'burisch',  val: 5 },
    { id: 'bob-lazar',           name: 'Bob Lazar',            type: 'person',       group: 'lazar',    val: 5 },
    { id: 'david-grusch',        name: 'David Grusch',         type: 'person',       group: 'grusch',   val: 5 },
    { id: 'luis-elizondo',       name: 'Luis Elizondo',        type: 'person',       group: 'elizondo', val: 5 },
    { id: 'chris-mellon',        name: 'Chris Mellon',         type: 'person',       group: 'mellon',   val: 4 },
    { id: 'ross-coulthart',      name: 'Ross Coulthart',       type: 'person',       group: 'grusch',   val: 2 },
    { id: 'ryan-graves',         name: 'Ryan Graves',          type: 'person',       group: 'shared',   val: 2 },
    { id: 'george-knapp',        name: 'George Knapp',         type: 'person',       group: 'lazar',    val: 2 },
    { id: 'john-lear',           name: 'John Lear',            type: 'person',       group: 'lazar',    val: 2 },
    { id: 'harry-reid',          name: 'Harry Reid',           type: 'person',       group: 'elizondo', val: 2 },
    { id: 'david-fravor',        name: 'David Fravor',         type: 'person',       group: 'fravor',   val: 5 },
    { id: 'karl-nell',           name: 'Karl Nell',            type: 'person',       group: 'nell',     val: 4 },
    { id: 'jim-slaight',         name: 'Jim Slaight',          type: 'person',       group: 'fravor',   val: 2 },
    { id: 'garry-nolan',         name: 'Garry Nolan',          type: 'person',       group: 'nolan',    val: 4 },
    { id: 'hal-puthoff',         name: 'Hal Puthoff',          type: 'person',       group: 'puthoff',  val: 4 },
    { id: 'eric-davis',          name: 'Eric Davis',           type: 'person',       group: 'davis',    val: 4 },

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
    { id: 'bigelow-aerospace',   name: 'Bigelow Aerospace',    type: 'organization', group: 'elizondo', val: 2 },
    { id: 'pentagon-ousd',       name: 'OUSD Intelligence',    type: 'organization', group: 'elizondo', val: 3 },

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
    { source: 'eric-davis',      target: 'bigelow-aerospace',  label: 'AAWSAP DIRD author; NIDS affiliation' },
    { source: 'eric-davis',      target: 'aatip',              label: 'DIRD contributor' },
    { source: 'eric-davis',      target: 'david-grusch',       label: 'corroborating crash retrieval claims' },
    { source: 'david-grusch',    target: 'ross-coulthart',     label: 'disclosed to' },
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
  ],
};
