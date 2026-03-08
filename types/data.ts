/**
 * Data related types used in data components
 */

/**
 * Represents data category types
 */
export type CategoryType = 'events' | 'figures' | 'quotes' | 'media' | 'news' | 'whistleblowers';

/**
 * Expanded sections state for data navigation
 */
export interface ExpandedSections {
  entities: boolean;
  technologies: boolean;
  programs: boolean;
  whistleblowers: boolean;
}

/**
 * Represents a generic data item
 */
export interface DataItem {
  id: string;
  title: string;
  category: CategoryType;
  description?: string;
  date?: string;
  source?: string;
  tags?: string[];
}

/**
 * Entity profile data
 */
export interface EntityProfile extends DataItem {
  type: string;
  origin?: string;
  abilities?: string[];
  timeline?: string;
  appearance?: string;
  interactions?: string[];
  images?: string[];
}

/**
 * Timeline concept data
 */
export interface TimelineConcept extends DataItem {
  timeframe: string;
  implications?: string[];
  relatedTechnologies?: string[];
}

/**
 * Lotus finding data
 */
export interface LotusFinding extends DataItem {
  projectPhase?: string;
  participants?: string[];
  outcomes?: string[];
  relatedPrograms?: string[];
}

/**
 * Whistleblower index entry (list view)
 */
export interface WhistleblowerEntry {
  id: string;
  name: string;
  aliases: string[];
  role: string;
  period: string;
  affiliation: string;
  summary: string;
  status: 'detailed' | 'stub';
  tags: string[];
  data_file: string | null;
}

/**
 * Burisch entity profile
 */
export interface BurischEntity {
  id: string;
  name: string;
  designation: string;
  classification: string;
  origin: {
    species: string;
    timeline: string;
    home: string;
    crash_date: string;
    crash_location: string;
    crash_cause: string;
  };
  physical: Record<string, string>;
  medical_conditions: string[];
  communication: string;
  age: string;
  name_meaning: string;
  containment: { facility: string; sphere: string; notes: string };
  mission: string[];
  connection_to_burisch: string;
}

/**
 * Burisch project entry
 */
export interface BurischProject {
  id: string;
  name: string;
  aliases?: string[];
  parent?: string;
  classification?: string;
  established?: string;
  purpose: string;
  key_personnel?: string[];
  location?: string;
  discoveries?: string[];
  outcome?: string;
  notes?: string;
  admin?: string;
  documentation?: string;
  distribution?: string;
  related_object?: string;
  director?: string;
}

/**
 * Burisch document entry
 */
export interface BurischDocument {
  id: string;
  designation: string;
  common_name: string;
  date?: string;
  authors?: string[];
  significance: string;
  leak_history?: string;
  status?: string;
  source_url?: string;
}

/**
 * Burisch testimony entry
 */
export interface BurischTestimony {
  id: string;
  witness: string;
  real_identity?: string;
  background: string;
  introduced_by?: string;
  key_claims: string[];
  burisch_connection: string;
  notes?: string;
  source?: string;
}

/**
 * Burisch argument entry
 */
export interface BurischArgument {
  category: string;
  claim: string;
}

/**
 * Burisch concept entry
 */
export interface BurischConcept {
  id: string;
  name: string;
  summary: string;
  mechanics?: string[];
  key_claims?: string[];
  factions?: string[];
  outcome?: string;
  framework?: string[];
  genetic_component?: string[];
  implication?: string;
  properties?: string[];
  research_context?: string;
}

/**
 * MJ-12 roster entry
 */
export interface MJ12Member {
  seat: string;
  name: string;
  roles: string[];
  notes?: string;
}

/* ─── Lazar Types ──────────────────────────────────────────────── */

export interface LazarClaim {
  id: string;
  category: string;
  claim: string;
  status: 'unverified' | 'partially-verified' | 'disputed' | 'partially-contradicted' | 'verified';
  notes?: string;
}

export interface LazarDisclosure {
  date: string;
  type: 'television' | 'radio' | 'podcast' | 'documentary';
  title: string;
  outlet: string;
  interviewer?: string;
  notes?: string;
}

export interface LazarPerson {
  id: string;
  name: string;
  role: string;
  relationship: string;
}

export interface LazarSource {
  title: string;
  url: string;
  type: string;
  notes: string;
}

export interface LazarGravityMode {
  name: string;
  description: string;
  notes?: string;
}

export interface LazarData {
  profile: {
    id: string;
    name: string;
    aliases: string[];
    born: string;
    roles: string[];
    service_period: string;
    organizations: string[];
    clearance: string;
    summary: string;
    early_life: string[];
    key_events: Array<{ date: string; event: string }>;
  };
  facility: {
    id: string;
    name: string;
    aliases: string[];
    location: string;
    construction: string;
    access: string;
    security: string[];
    hangar_count: number;
    hangar_notes: string;
    lazar_account: string;
  };
  crafts: {
    total_count: number;
    primary_studied: string;
    descriptions: Array<{
      designation: string;
      description: string;
      diameter_estimate?: string;
      notes?: string;
    }>;
  };
  propulsion: {
    overview: string;
    fuel: {
      element: string;
      claim: string;
      context: string;
      significance: string;
    };
    reactor: {
      description: string;
      output: string;
    };
    gravity_amplifiers: {
      count: number;
      position: string;
      function: string;
      modes: LazarGravityMode[];
    };
    space_time_distortion: string;
    glow_explanation: string;
  };
  claims: LazarClaim[];
  credibility: {
    supporting: string[];
    contradicting: string[];
  };
  associated_people: LazarPerson[];
  disclosures: LazarDisclosure[];
  sources: LazarSource[];
}

/**
 * Full Burisch data structure
 */
export interface BurischData {
  profile: {
    id: string;
    name: string;
    aliases: string[];
    born: string;
    roles: string[];
    service_period: string;
    organizations: string[];
    clearance: string;
    summary: string;
    early_life: string[];
    key_events: Array<{ year: string; event: string }>;
  };
  entity: BurischEntity;
  facility: {
    id: string;
    name: string;
    aliases: string[];
    location: string;
    construction: string;
    security: string[];
    levels: Array<{ designation: string; notes: string }>;
    notable_equipment: Array<Record<string, unknown>>;
    notable_visitors: string[];
  };
  projects: BurischProject[];
  documents: BurischDocument[];
  timeline: Array<{ date: string; event: string; category: string }>;
  mj12: MJ12Member[];
  testimonies: BurischTestimony[];
  arguments: { supporting: BurischArgument[]; against: BurischArgument[] };
  concepts: BurischConcept[];
}