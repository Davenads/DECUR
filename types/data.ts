/**
 * Data related types used in data components
 */

/**
 * Represents data category types
 */
export type CategoryType = 'events' | 'figures' | 'quotes' | 'media' | 'news' | 'key-figures' | 'cases' | 'documents' | 'programs';

/**
 * Expanded sections state for data navigation
 */
export interface ExpandedSections {
  entities: boolean;
  technologies: boolean;
  programs: boolean;
  insiders: boolean;
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
 * Insider index entry (list view)
 */
export interface InsiderEntry {
  id: string;
  name: string;
  aliases: string[];
  role: string;
  period: string;
  affiliation: string;
  summary: string;
  status: 'detailed' | 'stub';
  tags: string[];
  type: 'insider' | 'journalist' | 'pilot' | 'scientist' | 'official' | 'executive';
  data_file: string | null;
  includeInExplore?: boolean;
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

/* ─── Shared Profile Base Types ────────────────────────────────── */

export type ClaimStatus =
  | 'unverified'
  | 'partially-verified'
  | 'disputed'
  | 'contested'
  | 'partially-contradicted'
  | 'verified';

export interface ProfileKeyEvent {
  year?: string;
  date?: string;
  event: string;
}

export interface ProfilePerson {
  id: string;
  name: string;
  role: string;
  relationship: string;
}

export interface ProfileDisclosure {
  date: string;
  type: string;
  title?: string;
  outlet: string;
  interviewer?: string;
  notes?: string;
  description?: string;
}

export interface ProfileSource {
  title: string;
  url: string;
  type: string;
  notes?: string;
}

export interface ProfileCredibility {
  supporting: string[];
  contradicting: string[];
}

export interface ProfileCareerConnection {
  event_index: number;
  node_type: 'person' | 'case' | 'program' | 'figure' | 'document';
  node_id: string;
  node_label: string;
  relationship: string;
  connection_type: string;
}

export interface ProfileBase {
  id: string;
  name: string;
  aliases: string[];
  born?: string;
  died?: string;
  roles: string[];
  service_period: string;
  organizations: string[];
  clearance: string;
  summary: string;
  education?: string[];
  early_career?: string[];
  early_life?: string[];
  key_events: ProfileKeyEvent[];
}

export interface ProfileClaim {
  id: string;
  category: string;
  claim: string;
  status: ClaimStatus;
  notes?: string;
}

/* ─── Lazar Types ──────────────────────────────────────────────── */

export interface LazarClaim {
  id: string;
  category: string;
  claim: string;
  status: ClaimStatus;
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

/* ─── Grusch Types ─────────────────────────────────────────────── */

export interface GruschClaim {
  id: string;
  category: string;
  claim: string;
  status: ClaimStatus;
  notes?: string;
}

export interface GruschDisclosure {
  date: string;
  type: string;
  title: string;
  outlet: string;
  interviewer?: string;
  notes?: string;
}

export interface GruschPerson {
  id: string;
  name: string;
  role: string;
  relationship: string;
}

export interface GruschSource {
  title: string;
  url: string;
  type: string;
  notes: string;
}

export interface GruschData {
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
    education: string[];
    early_career: string[];
    key_events: Array<{ date: string; event: string }>;
  };
  claims: GruschClaim[];
  credibility: {
    supporting: Array<{ argument: string; weight: string }>;
    contradicting: Array<{ argument: string; weight: string }>;
  };
  associated_people: GruschPerson[];
  disclosures: GruschDisclosure[];
  legislative_impact: {
    uap_disclosure_act: {
      introduced: string;
      sponsors: string[];
      provisions: string[];
      outcome: string;
    };
    ndaa_2024: {
      section: string;
      provisions: string[];
    };
    national_archives: string;
  };
  government_response: {
    aaro_historical_report: {
      date: string;
      title: string;
      conclusion: string;
      notes: string;
    };
    pentagon_statement: string;
    icig_assessment: string;
  };
  sources: GruschSource[];
}

/* ─── Elizondo Types ─────────────────────────────────────────── */

export interface ElizondoData {
  profile: ProfileBase & { early_career: string[] };
  aatip: {
    full_name: string;
    established: string;
    ended_official: string;
    ended_claimed: string;
    funding: string;
    primary_contractor: string;
    focus: string;
    classification: string;
    key_findings: string[];
    controversy: string;
  };
  five_observables: Array<{ name: string; description: string }>;
  claims: ProfileClaim[];
  credibility: ProfileCredibility;
  associated_people: ProfilePerson[];
  disclosures: ProfileDisclosure[];
  sources: ProfileSource[];
  career_connections?: ProfileCareerConnection[];
}

/* ─── Fravor Types ──────────────────────────────────────────── */

export interface FravorData {
  profile: ProfileBase & { early_career: string[] };
  encounter: {
    date: string;
    location: string;
    vessel: string;
    detection_platform: string;
    prior_tracking: string;
    fravor_aircraft: string;
    wingman: string;
    object_description: string;
    observed_behavior: string[];
    flir_footage: string;
    witnesses: string[];
  };
  claims: ProfileClaim[];
  credibility: ProfileCredibility;
  associated_people: ProfilePerson[];
  disclosures: ProfileDisclosure[];
  career_connections?: ProfileCareerConnection[];
}

/* ─── Nolan Types ───────────────────────────────────────────── */

export interface NolanData {
  profile: ProfileBase & { early_career: string[] };
  research: {
    cia_consultation: {
      period: string;
      referring_agency: string;
      subject_count: string;
      subject_profile: string;
      method: string;
      key_finding: string;
      nolan_hypothesis: string;
      adverse_outcomes: string;
      classification_status: string;
    };
    publications: Array<{
      year: string;
      title: string;
      journal: string;
      co_authors: string[];
      significance: string;
      url: string;
    }>;
    materials_analysis: {
      description: string;
      methods_used: string;
      public_statements: string;
      classification_note: string;
    };
  };
  sol_foundation: {
    full_name: string;
    affiliation: string;
    established: string;
    co_founders: string[];
    nolan_role: string;
    mission: string;
    inaugural_symposium: string;
    significance: string;
  };
  claims: ProfileClaim[];
  credibility: ProfileCredibility;
  associated_people: ProfilePerson[];
  disclosures: ProfileDisclosure[];
  career_connections?: ProfileCareerConnection[];
}

/* ─── Puthoff Types ─────────────────────────────────────────── */

export interface PuthoffData {
  profile: ProfileBase & { early_career: string[] };
  stargate: {
    official_name: string;
    predecessor_programs: string[];
    period: string;
    funding_agencies: string[];
    location: string;
    puthoff_role: string;
    budget: string;
    principal_viewers: string[];
    declassification: string;
    air_review: string;
    key_findings: string[];
    controversy: string;
  };
  aawsap_dirds: {
    program: string;
    contracting_agency: string;
    period: string;
    total_dirds: number;
    puthoff_authored: string;
    significance: string;
    documents: Array<{
      title: string;
      author: string;
      significance: string;
    }>;
  };
  physics_research: {
    primary_focus: string;
    earthtech_mission: string;
    key_theories: Array<{ name: string; description: string }>;
    publications_note: string;
  };
  claims: ProfileClaim[];
  credibility: ProfileCredibility;
  associated_people: ProfilePerson[];
  disclosures: ProfileDisclosure[];
  career_connections?: ProfileCareerConnection[];
}

/* ─── Mellon Types ──────────────────────────────────────────── */

export interface MellonClaim {
  claim: string;
  status: ClaimStatus;
  basis: string;
  notes?: string | null;
}

export interface MellonDisclosure {
  date: string;
  type: string;
  outlet: string;
  description: string;
}

export interface MellonLegislationAction {
  year: string;
  action: string;
}

export interface MellonData {
  profile: ProfileBase & { early_career: string[] };
  senate_intel: {
    committee: string;
    roles: string[];
    oversight_areas: string[];
    significance: string;
    post_government: string;
  };
  ttsa_role: {
    title: string;
    joined: string;
    co_founders: string[];
    primary_contributions: string[];
    video_release: {
      videos: string[];
      method: string;
      outcome: string;
    };
  };
  legislation: {
    overview: string;
    key_actions: MellonLegislationAction[];
    assessment: string;
  };
  claims: MellonClaim[];
  credibility: ProfileCredibility;
  associated_people: ProfilePerson[];
  disclosures: MellonDisclosure[];
  career_connections?: ProfileCareerConnection[];
  sources?: ProfileSource[];
}

/* ─── Davis Types ───────────────────────────────────────────── */

export interface DavisClaim {
  claim: string;
  status: ClaimStatus;
  basis: string;
  notes?: string;
}

export interface DavisDisclosure {
  date: string;
  type: string;
  outlet: string;
  description: string;
}

export interface DavisData {
  profile: ProfileBase & { early_career: string[] };
  earthtech: {
    founded_by: string;
    location: string;
    also_known_as: string;
    mission: string;
    davis_role: string;
    nids_connection: string;
    key_research_areas: string[];
  };
  aawsap_dirds: {
    contract: string;
    contractor: string;
    period: string;
    total_dirds: number;
    davis_authored: Array<{
      title: string;
      year: string;
      author: string;
      summary: string;
    }>;
  };
  wilson_davis_memo: {
    date: string;
    location: string;
    context: string;
    memo_origin: string;
    wilson_account: string;
    program_description: string;
    leak_date: string;
    leak_source: string;
    status_disputed: string;
    significance: string;
  };
  claims: DavisClaim[];
  credibility: ProfileCredibility;
  associated_people: ProfilePerson[];
  disclosures: DavisDisclosure[];
  career_connections?: ProfileCareerConnection[];
}

/* ─── Bigelow Types ─────────────────────────────────────────── */

export interface BigelowClaim {
  claim: string;
  status: ClaimStatus;
  basis: string;
  notes?: string;
}

export interface BigelowDisclosure {
  date: string;
  type: string;
  outlet: string;
  description: string;
}

export interface BigelowData {
  profile: Omit<ProfileBase, 'early_career'> & {
    background: string[];
    key_events: ProfileKeyEvent[];
  };
  nids: {
    full_name: string;
    founded: string;
    dissolved: string;
    location: string;
    funding: string;
    director: string;
    mission: string;
    notable_members: string[];
    key_outputs: string[];
    significance: string;
  };
  baass_aawsap: {
    full_name: string;
    program: string;
    contract_award: string;
    contract_value: string;
    contracting_agency: string;
    period: string;
    staff: string;
    products: string[];
    congressional_nexus: string;
    ttsa_connection: string;
    declassified_dird_note: string;
  };
  skinwalker_ranch: {
    location: string;
    purchased: string;
    sold: string;
    purchase_price: string;
    seller: string;
    buyer_2016: string;
    research_period: string;
    phenomena_reported: string[];
    research_approach: string;
    published_account: string;
    notes: string;
  };
  claims: BigelowClaim[];
  credibility: ProfileCredibility;
  associated_people: ProfilePerson[];
  disclosures: BigelowDisclosure[];
  career_connections?: ProfileCareerConnection[];
}

/* ─── Vallee Types ──────────────────────────────────────────── */

export interface ValleeClaim {
  claim: string;
  status: ClaimStatus;
  basis: string;
  notes?: string;
}

export interface ValleeDisclosure {
  date: string;
  type: string;
  outlet: string;
  description: string;
}

export interface ValleeData {
  profile: ProfileBase & { early_career: string[] };
  forbidden_science: {
    series_title: string;
    volumes: Array<{
      volume: number;
      subtitle: string;
      published: number;
      period_covered: string;
      summary: string;
    }>;
    historical_significance: string;
    key_figures_documented: string[];
  };
  theory: {
    eth_critique: string;
    control_system_hypothesis: string;
    interdimensional_hypothesis: string;
    magonia_framework: string;
    materials_research_position: string;
    key_publications: Array<{
      year: string;
      title: string;
      significance: string;
    }>;
  };
  nids_role: {
    title: string;
    organization: string;
    period: string;
    founder: string;
    contributions: string[];
    significance: string;
  };
  claims: ValleeClaim[];
  credibility: ProfileCredibility;
  associated_people: ProfilePerson[];
  disclosures: ValleeDisclosure[];
  career_connections?: ProfileCareerConnection[];
  sources?: ProfileSource[];
}

/* ─── Pope Types ────────────────────────────────────────────── */

export interface PopeClaim {
  claim: string;
  status: ClaimStatus;
  basis: string;
  notes: string | null;
}

export interface PopeDisclosure {
  date: string;
  type: string;
  outlet: string;
  description: string;
}

export interface PopeData {
  profile: Omit<ProfileBase, 'early_career'> & {
    career_background: string[];
    key_events: ProfileKeyEvent[];
  };
  mod_role: {
    title: string;
    organization: string;
    period: string;
    reporting_to: string;
    access_level: string;
    methodology: string;
    annual_caseload: string;
    case_breakdown: string;
    key_outputs: string[];
    significance: string;
  };
  investigations: {
    overview: string;
    major_cases: Array<{
      name: string;
      date: string;
      location: string;
      description: string;
      witnesses: string;
      evidence: string;
      pope_assessment: string;
      status: string;
    }>;
  };
  claims: PopeClaim[];
  credibility: ProfileCredibility;
  associated_people: ProfilePerson[];
  disclosures: PopeDisclosure[];
  career_connections?: ProfileCareerConnection[];
}

/* ─── Barber Types ──────────────────────────────────────────── */

export interface BarberData {
  profile: ProfileBase & { early_career: string[] };
  claims: ProfileClaim[];
  credibility: ProfileCredibility;
  associated_people: ProfilePerson[];
  disclosures: ProfileDisclosure[];
  sources: ProfileSource[];
  career_connections?: ProfileCareerConnection[];
}

/* ─── Gallaudet Types ───────────────────────────────────────── */

export interface GallaudetData {
  profile: ProfileBase & { early_career: string[] };
  claims: ProfileClaim[];
  credibility: ProfileCredibility;
  associated_people: ProfilePerson[];
  disclosures: ProfileDisclosure[];
  sources: ProfileSource[];
  career_connections?: ProfileCareerConnection[];
}

/* ─── Nell Types ────────────────────────────────────────────── */

export interface NellData {
  profile: ProfileBase & { early_career: string[] };
  testimony: {
    hearing: string;
    date: string;
    witnesses: string[];
    key_statements: string[];
    context: string;
    classification_constraints: string;
  };
  sol_foundation: {
    full_name: string;
    affiliation: string;
    established: string;
    co_founders: string[];
    nell_role: string;
    mission: string;
    inaugural_symposium: string;
    significance: string;
  };
  claims: ProfileClaim[];
  credibility: ProfileCredibility;
  associated_people: ProfilePerson[];
  disclosures: ProfileDisclosure[];
  career_connections?: ProfileCareerConnection[];
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
/* ─── Cases Types ──────────────────────────────────────────────── */

export type EvidenceTier = 'tier-1' | 'tier-2' | 'tier-3';
export type ClassificationStatus = 'unresolved' | 'explained' | 'disputed';

export interface CaseWitness {
  name: string;
  role: string;
  type: string;
  testimony: string;
}

export interface CaseOfficialStatement {
  source: string;
  date: string;
  statement: string;
}

/* ─── Extended Case Types ──────────────────────────────────────── */

export interface CaseTimelineEvent {
  timestamp?: string;    // ISO datetime or relative (e.g. "Day 1, 14:00 local")
  local?: string;        // Human-readable local time label
  event: string;
}

export type HypothesisAssessment = 'verified' | 'probable' | 'possible' | 'disputed' | 'debunked';

export interface CaseHypothesis {
  name: string;
  assessment: HypothesisAssessment;
  summary: string;
  evidence_for?: string[];
  evidence_against?: string[];
}

export interface CaseTaxonomy {
  verified?: string[];
  probable?: string[];
  disputed?: string[];
  speculative?: string[];
}

export interface CaseSensorSystem {
  name: string;
  operator: string;
  notes?: string;
}

export type CaseSourceType = 'official' | 'media' | 'academic' | 'testimony' | 'foia' | 'book';

export interface CaseSource {
  title: string;
  url?: string;
  date?: string;
  type: CaseSourceType;
  notes?: string;
}

/* ─── Case Entry ───────────────────────────────────────────────── */

export interface CaseEntry {
  id: string;
  name: string;
  date: string;
  location: string;
  country: string;
  category: string;
  evidence_tier: EvidenceTier;
  coordinates?: { lat: number; lng: number };
  classification_status: ClassificationStatus;
  summary: string;
  tags: string[];
  insider_connections: InsiderConnection[];
  overview: {
    key_facts: string[];
  };
  evidence: {
    video_audio: string[];
    documentation: string[];
    physical: string[];
  };
  witnesses: CaseWitness[];
  official_response: {
    agencies: string[];
    statements: CaseOfficialStatement[];
  };
  credibility: {
    supporting: string[];
    contradicting: string[];
  };
  // Enrichment fields (optional - added progressively per case)
  timeline?: CaseTimelineEvent[];
  competing_hypotheses?: CaseHypothesis[];
  claims_taxonomy?: CaseTaxonomy;
  sensor_context?: { systems: CaseSensorSystem[] };
  sources?: CaseSource[];
}

/* ─── Programs Types ───────────────────────────────────────────── */

export interface ProgramPersonnel {
  name: string;
  role: string;
  figure_id?: string;
}

export interface ProgramKeyEvent {
  year: string;
  event: string;
}

export interface ProgramSource {
  title: string;
  url?: string;
  type: string;
}

export interface ProgramEntry {
  id: string;
  name: string;
  type: 'project' | 'organization' | 'study';
  status: 'active' | 'defunct' | 'classified' | 'unknown';
  active_period: string;
  parent_org: string;
  summary: string;
  significance: string;
  key_personnel: ProgramPersonnel[];
  key_events: ProgramKeyEvent[];
  connected_documents: string[];
  connected_figures: string[];
  limitations: string[];
  sources: ProgramSource[];
}

/* ─── Contractors Types ────────────────────────────────────────── */

export type ContractorEvidenceStatus =
  | 'documented'
  | 'primary-document'
  | 'testified-under-oath'
  | 'public-statements'
  | 'unverified-testimony'
  | 'disputed'
  | 'alleged';

export interface ContractorKnownContract {
  program_id: string | null;
  description: string;
  evidence_status: ContractorEvidenceStatus;
}

export interface ContractorUAPClaim {
  claim: string;
  source: string | null;
  credibility: ContractorEvidenceStatus;
  status: 'documented' | 'alleged' | 'disputed';
}

export interface ContractorConnectedFigure {
  id: string;
  name: string;
  role: string;
  relationship: string;
}

export interface ContractorSource {
  title: string;
  url: string | null;
  type: string;
  notes: string;
}

export interface ContractorKeyEvent {
  year: string;
  event: string;
}

export interface ContractorConnectedProgram {
  program_id: string | null;
  program_name: string;
  relationship: string;
}

export interface ContractorRelatedDocument {
  doc_id: string;
  doc_name: string;
  relationship: string;
}

export interface ContractorEntry {
  id: string;
  name: string;
  sublabel: string;
  type: 'contractor';
  status: 'active' | 'defunct';
  founded: string;
  headquarters: string;
  summary: string;
  description: string;
  known_contracts: ContractorKnownContract[];
  uap_claims: ContractorUAPClaim[];
  connected_figures: ContractorConnectedFigure[];
  sources: ContractorSource[];
  tags: string[];
  key_events?: ContractorKeyEvent[];
  connected_programs?: ContractorConnectedProgram[];
  related_documents?: ContractorRelatedDocument[];
}

/* ─── Documents Types ──────────────────────────────────────────── */

export type DocumentAuthStatus =
  | 'confirmed-official'
  | 'declassified-foia'
  | 'leaked-disputed'
  | 'confirmed-leaked'
  | 'declassified-authentic'
  | 'confirmed-authentic'
  | 'documented-destroyed'
  | 'official-declassified';

export type DocumentType =
  | 'government-report'
  | 'government-memo'
  | 'classified-memo'
  | 'intelligence-report'
  | 'academic-study'
  | 'legislation'
  | 'military-memorandum'
  | 'intelligence-collection-directive'
  | 'intelligence-assessment'
  | 'government-assessment'
  | 'investigation-report'
  | 'government-contract'
  | 'whistleblower-complaint'
  | 'private-briefing';

export type ProvenanceNodeType =
  | 'creation'
  | 'classification'
  | 'transfer'
  | 'declassification'
  | 'foia'
  | 'leak'
  | 'public'
  | 'archive';

export interface ProvenanceChainNode {
  id: string;
  label: string;
  description: string;
  date: string;
  type: ProvenanceNodeType;
  branches_from?: string; // id of parent node; places this node vertically below the main chain
}

export interface InsiderConnection {
  id: string;
  role: string;
  note?: string;
}

export interface DocumentEntry {
  id: string;
  name: string;
  date: string;
  issuing_authority: string;
  document_type: DocumentType;
  authenticity_status: DocumentAuthStatus;
  page_count: number;
  public_url: string;
  summary: string;
  significance: string;
  key_findings: string[];
  provenance: string;
  insider_connections: InsiderConnection[];
  limitations: string[];
  provenance_chain?: ProvenanceChainNode[];
}
