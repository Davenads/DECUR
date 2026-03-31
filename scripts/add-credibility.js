const fs = require('fs');
const cases = require('../data/cases.json');

const credibilityData = {
  'levelland-1957': {
    supporting: [
      'Approximately 15 independent witnesses across a 3-4 hour window, including multiple law enforcement officers',
      'Consistent electromagnetic effects (engine stall, headlights failure) reported by separate witnesses in separate vehicles',
      'Wide geographic spread of sightings rules out a single misidentification event',
      'Sheriff Weir Clem personally witnessed the object and corroborated civilian reports',
      'Project Blue Book acknowledged the unusually high number of independent witnesses in its own report'
    ],
    contradicting: [
      'Project Blue Book concluded ball lightning or St. Elmo\'s fire, citing an electrical storm in the area that night',
      'No physical trace, material sample, or photographic evidence was recovered',
      'Night-time conditions may have limited precise visual characterization for some witnesses',
      'The electromagnetic effects, while consistent, have not been definitively linked to the observed object by scientific analysis'
    ]
  },
  'coyne-helicopter-1973': {
    supporting: [
      'Four active-duty military crew members (Army Reserve) with professional aviation experience provided independent convergent accounts',
      'Five additional civilian ground witnesses from two separate vehicles independently observed both the helicopter and the object from below',
      'Anomalous altitude gain from 1,700 to 3,500 feet despite dive-configured controls - documented by instrumentation and all four crew members',
      'Compass deviation during and after the encounter was noted and reported',
      'Dr. J. Allen Hynek personally co-presented the case to the United Nations Special Political Committee in 1978',
      'CUFOS and MUFON investigations found no prosaic explanation after thorough independent review'
    ],
    contradicting: [
      'No physical evidence or material sample was collected from the encounter site',
      'Night-time conditions and the brevity of the encounter limited photographic documentation',
      'Radio failure, while anomalous, could theoretically have a separate electrical cause unrelated to the object'
    ]
  },
  'kenneth-arnold-1947': {
    supporting: [
      'Arnold was an experienced private pilot with hundreds of hours in Pacific Northwest airspace - not an inexperienced observer',
      'He used a standard aviation navigation technique (timing between two known mountain landmarks) to estimate speed - not a subjective impression',
      'Project Sign classified the case Unidentified after Army Air Force intelligence officers personally interviewed Arnold',
      'The extraordinary institutional response (intelligence officers flying from Hamilton Field) indicates the military took the report seriously',
      'A subsequent 1947 wave of sightings across the US involved many additional independent credible witnesses reporting similar objects'
    ],
    contradicting: [
      'Single witness with no corroboration at the moment of observation',
      'No photographic evidence or physical trace of any kind was recorded',
      'No radar tracking of the objects was available at the time',
      'Some researchers have questioned Arnold\'s size and distance estimations, though not the timing methodology'
    ]
  },
  'betty-barney-hill-1961': {
    supporting: [
      'Two witnesses provided convergent accounts under hypnosis conducted in separate, sequentially isolated sessions - neither heard the other\'s testimony',
      'Physical evidence predating any hypnosis suggestion: torn dress, broken binocular strap, compass anomaly on car trunk, ring of warts on Barney',
      'Dr. Benjamin Simon (nationally recognized forensic hypnosis specialist) found no evidence of deliberate fabrication after six months of clinical sessions',
      'Pease Air Force Base (100th Bomb Wing) filed an official Project Blue Book report noting an unidentified object',
      'Marjorie Fish\'s Zeta Reticuli star map interpretation was published in Astronomy magazine and validated by multiple professional and amateur astronomers'
    ],
    contradicting: [
      'Hypnotic regression evidence is methodologically controversial; false or confabulated memories can be induced through hypnosis',
      'Dr. Simon himself remained personally agnostic on the physical reality of the abduction event while concluding the Hills were not fabricating',
      'The star map interpretation has been disputed by some astronomers who found alternative stellar configurations equally consistent with Betty\'s drawing',
      'No physical craft evidence or material sample of non-terrestrial origin was recovered'
    ]
  },
  'walton-abduction-1975': {
    supporting: [
      'Six independent crew witnesses observed the initial beam-strike event - the largest crew corroboration of any CE4 abduction case on record',
      'Five of six crew members passed professionally administered Arizona DPS polygraph examinations on November 10, 1975',
      'The official missing person report, multi-day sheriff\'s search operation, and Walton\'s physical condition upon return all corroborate the timeline independently',
      'Walton\'s account has remained structurally consistent for nearly 50 years across books, interviews, and public testimony under sustained scrutiny',
      'APRO investigators and Stanton Friedman concluded after independent review that no evidence of coordinated deception was found'
    ],
    contradicting: [
      'One crew member requested a polygraph reschedule at the initial session; the early 1975 Walton polygraph administered by an inexperienced examiner produced a failed result (later superseded by a 1993 passed examination)',
      'Philip Klass and skeptic investigators alleged financial motivation, citing the National Enquirer prize (though the prize was not announced until after the incident occurred)',
      'No physical evidence or material sample was recovered from the encounter site',
      'The 1993 film Fire in the Sky altered significant details of Walton\'s account, creating a conflation risk between the film and the actual testimony'
    ]
  },
  'cash-landrum-1980': {
    supporting: [
      'Three independent witnesses with corroborating accounts from the same vehicle',
      'Medical documentation of radiation-consistent injuries (blistering, hair loss, eye damage, elevated blood cell counts) predating any investigative contact',
      'Twelve additional independent witnesses confirmed CH-47 military helicopters in the area that night',
      'Jerry and Naomi McDonald independently reported a diamond-shaped object and accompanying helicopters from a separate location on the same night',
      'Federal court proceedings produced depositions from three US government agencies (Army, Air Force, NASA), creating an official record of inability to explain the craft or injuries'
    ],
    contradicting: [
      'No official US government entity has acknowledged ownership of or knowledge of the craft',
      'The $20 million federal lawsuit was dismissed on procedural grounds (inability to establish government ownership) rather than on the merits of the witnesses\' claims',
      'No photographs or video footage of the craft were taken during the encounter',
      'The specific radiation type and dose involved were never definitively established through medical testing'
    ]
  },
  'trans-en-provence-1981': {
    supporting: [
      'Official investigation by GEPAN/CNES (French space agency) conducted under rigorous scientific protocols - the only such national government investigation of a UAP physical trace case',
      'Landing trace documented by gendarmerie within hours of the event, before any public attention or contamination',
      'INRA laboratory analysis (Dr. Michel Bounias) found statistically significant plant biochemistry changes: 38-50% chlorophyll reduction in trace samples vs. control plants',
      'Soil crystalline structure changes in trace samples consistent with rapid heating to 300-600 degrees Celsius',
      'GEPAN Technical Note No. 16 officially concluded the data reflect a physical phenomenon of unknown nature',
      'The Sturrock Panel (Stanford, 1997) - nine physical scientists - cited this as the strongest physical trace case in the world literature'
    ],
    contradicting: [
      'Single eyewitness to the craft landing itself - no corroborating observer of the aerial event',
      'No photographs or video of the craft were taken',
      'The specific energy mechanism responsible for the biochemical effects has not been identified or replicated in laboratory conditions',
      'Some skeptical researchers have proposed that conventional agricultural or environmental factors could explain the trace, though no specific conventional mechanism has been demonstrated'
    ]
  }
};

let updatedCount = 0;
const updated = cases.map(c => {
  if (credibilityData[c.id]) {
    updatedCount++;
    return { ...c, credibility: credibilityData[c.id] };
  }
  return c;
});

fs.writeFileSync('./data/cases.json', JSON.stringify(updated, null, 2));
console.log('Updated ' + updatedCount + ' cases with credibility data.');

// Verify none remain missing
const stillMissing = updated.filter(x => !x.credibility);
console.log('Cases still missing credibility: ' + stillMissing.length);
