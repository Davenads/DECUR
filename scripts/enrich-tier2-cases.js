#!/usr/bin/env node
/**
 * Tier 2 Case Enrichment Script
 * Adds timeline, competing_hypotheses, claims_taxonomy, sensor_context, and sources
 * to: kecksburg-1965, uss-theodore-roosevelt, uss-omaha-2019
 *
 * Run once: node scripts/enrich-tier2-cases.js
 */

const fs = require('fs');
const path = require('path');

const CASES_PATH = path.join(__dirname, '..', 'data', 'cases.json');
const cases = JSON.parse(fs.readFileSync(CASES_PATH, 'utf8'));

// ---------------------------------------------------------------------------
// KECKSBURG (1965)
// ---------------------------------------------------------------------------
const kecksburgEnrichment = {
  timeline: [
    {
      timestamp: '1965-12-09T16:43:00',
      local: '4:43 PM EST',
      event: 'Large fireball observed across Ontario, Michigan, Ohio, Indiana, West Virginia, New York, and Pennsylvania. Trajectory recorded by amateur astronomers and documented in the Journal of the Royal Astronomical Society of Canada (JRASC).',
    },
    {
      timestamp: '1965-12-09T16:45:00',
      local: '~4:45 PM EST',
      event: 'Object reported to come down in wooded area near Kecksburg, Westmoreland County, PA. A brush fire ignites at the impact site, drawing initial civilian and fire department attention.',
    },
    {
      timestamp: '1965-12-09T17:30:00',
      local: '~5:30 PM EST',
      event: 'Kecksburg Volunteer Fire Department dispatched. Firefighter Jim Romansky enters the woods and reports approaching an acorn-shaped, bronze-gold metallic object bearing hieroglyphic-like markings on a rear "bumper" band.',
    },
    {
      timestamp: '1965-12-09T18:30:00',
      local: '~6:30-8:00 PM EST',
      event: 'U.S. Army personnel arrive and cordon off the area. Civilian witnesses, including firefighters and journalists, are removed from the scene. WHJB news director John Murphy photographs the object; his film and tapes are subsequently confiscated by men identifying as government officials.',
    },
    {
      timestamp: '1965-12-09T22:00:00',
      local: 'Late evening',
      event: 'Multiple witnesses report a flatbed truck under military escort removing a large object (covered by tarpaulin) from the wooded area. Army spokesperson states publicly: "We\'ve checked and there\'s no evidence of anything crashing or landing in Kecksburg."',
    },
    {
      timestamp: '1965-12-10',
      local: 'Dec 10, 1965',
      event: 'A USAF major from the Pentagon contacts Air Force press offices requesting talking points about the Kecksburg fireball. Project Blue Book classifies the event as a "meteor bolide." Pentagon memo documenting this contact later declassified via FOIA.',
    },
    {
      timestamp: '2005-01-01',
      local: '2005',
      event: 'NASA issues public statement claiming its experts had analyzed fragments from the Kecksburg area in 1987 and concluded the object was a Soviet satellite re-entering the atmosphere. NASA simultaneously acknowledges that all records of this 1987 analysis have been lost.',
    },
    {
      timestamp: '2003-01-01',
      local: '2003',
      event: 'Journalist Leslie Kean files federal FOIA lawsuit against NASA (Kean v. NASA, 480 F. Supp. 2d 150, D.D.C.) demanding full production of Kecksburg-related records.',
    },
    {
      timestamp: '2007-10-01',
      local: 'October 2007',
      event: 'Kean v. NASA settled. Court orders NASA to produce hundreds of additional documents and pay plaintiff\'s attorney fees. NASA produces records but maintains the 1987 analysis files remain missing. No definitive identification of the object emerges.',
    },
  ],

  competing_hypotheses: [
    {
      name: 'Meteor/Bolide (Official)',
      assessment: 'probable',
      summary:
        'Project Blue Book and mainstream scientific consensus hold that the Kecksburg fireball was a large bolide burning up in the atmosphere. Trajectory analysis published in JRASC is consistent with a natural object on a shallow atmospheric entry path. The terminal portion of the trajectory over southwestern Pennsylvania matches a meteor coming apart at low altitude, producing a ground-level impact signature.',
      evidence_for: [
        'JRASC trajectory analysis established the fireball\'s flight path as consistent with a natural bolide',
        'Project Blue Book classification (December 1965) based on available sensor and observational data',
        'Infrasound and seismic data from the period is consistent with a meteor airburst/impact event',
        'Fireball was widely visible across six states - consistent with a large meteor entry, not a controlled vehicle',
      ],
      evidence_against: [
        'Romansky\'s description of a seamless, acorn-shaped metallic object with non-alphabetic markings is not consistent with any known meteorite morphology',
        'Military cordon and removal of an object is inconsistent with treatment of a standard meteor impact site',
        'No meteor fragments or crater were publicly documented from Kecksburg',
      ],
    },
    {
      name: 'Kosmos 96 Soviet Satellite',
      assessment: 'debunked',
      summary:
        'NASA\'s 2005 statement attributed the object to a re-entering Soviet satellite, widely assumed to be Kosmos 96. However, this hypothesis is physically impossible: Kosmos 96 re-entered the atmosphere approximately 13 hours before the Kecksburg fireball - at approximately 3:18 AM EST on December 9, 1965, not 4:43 PM. U.S. Space Surveillance records confirm this timing. NASA\'s own researcher James Oberg documented this timing conflict. The Kosmos 96 explanation was introduced without supporting records and cannot account for the observed fireball.',
      evidence_for: [
        'NASA official statement (2005) attributed Kecksburg object to Soviet satellite re-entry',
        'Soviet GE Mark 2 re-entry vehicles have an acorn-like shape superficially consistent with some descriptions',
      ],
      evidence_against: [
        'U.S. Space Surveillance Network data confirms Kosmos 96 re-entered ~13 hours before the Kecksburg fireball - the timing is irreconcilable',
        'NASA researcher James Oberg publicly documented that the Kosmos 96 timing eliminates it as a candidate',
        'NASA produced no surviving records supporting the satellite attribution claim',
        'Federal court (Kean v. NASA) found NASA\'s records search was inadequate, implying the attribution was not supported by surviving documentation',
      ],
    },
    {
      name: 'Acorn-Shaped Structured Craft (Crash-Retrieval)',
      assessment: 'disputed',
      summary:
        'Multiple Kecksburg witnesses, led by Romansky, describe encountering a large, structured metallic object with no seams, no rivets, an acorn shape, and markings resembling hieroglyphs on a raised rear band. The cordon and removal by military personnel, the confiscation of journalist Murphy\'s film, and the sanitizing of his documentary are consistent with a crash-retrieval operation. No definitive evidence of an extraterrestrial or classified craft has been publicly produced.',
      evidence_for: [
        'Jim Romansky\'s technically specific, internally consistent account maintained over three decades without material change',
        'John Murphy\'s behavior (producing sanitized documentary, confiscation of original materials) corroborated by two independent WHJB employees',
        'Military cordon and object removal reported by multiple civilian witnesses',
        'No conventional explanation for the "bumper band" markings described by Romansky',
        'Federal FOIA litigation revealed NASA initially withheld records and its records search was inadequate',
      ],
      evidence_against: [
        'No physical material from Kecksburg exists in any verified collection',
        'Murphy\'s original recordings and photographs were destroyed or lost - the confiscation account rests on secondary testimony',
        'A single primary close-up witness (Romansky) with no corroborating close-range observations',
        'Military activity at meteorite/bolide impact sites is not unprecedented - crash-of-any-aircraft protocol would trigger similar response',
      ],
    },
  ],

  claims_taxonomy: {
    verified: [
      'A large, widely-observed fireball crossed six US states and parts of Canada on December 9, 1965 at ~4:43 PM EST (documented in JRASC and contemporaneous press)',
      'USAF Pentagon personnel contacted Air Force press offices the following day requesting talking points about Kecksburg (declassified USAF memo, December 10, 1965)',
      'Federal FOIA lawsuit Kean v. NASA (480 F. Supp. 2d 150) was filed, litigated, and settled with a court order requiring NASA to expand its document search (court records)',
      'Kosmos 96 re-entered the atmosphere ~13 hours before the Kecksburg fireball, ruling it out as the observed object (U.S. Space Surveillance Network records)',
    ],
    probable: [
      'Military/government personnel arrived at Kecksburg and established a cordon (corroborated by multiple independent civilian witnesses including fire department personnel)',
      'WHJB journalist John Murphy\'s film and audio recordings were confiscated by persons identifying as government officials (two independent WHJB employees corroborate Bonnie Milslagle\'s account)',
      'An object was removed from the site under military escort (multiple civilian witnesses; consistent across accounts)',
    ],
    disputed: [
      'Jim Romansky\'s description of an acorn-shaped metallic object with hieroglyphic-style markings (single close-range witness; no physical corroboration)',
      'NASA\'s claim that its 1987 analysis concluded the object was a Soviet satellite (all supporting records allegedly lost; Kosmos 96 timing rules out the most likely candidate)',
      'John Murphy\'s original documentary content before government interference (no surviving original recording; account reconstructed from secondary testimony)',
    ],
    speculative: [
      'Murphy\'s 1969 death in a hit-and-run was connected to his Kecksburg investigation (no evidence linking the two; circumstantial)',
      'The object was extraterrestrial in origin (no physical evidence; based solely on witness description of anomalous morphology)',
    ],
  },

  sensor_context: {
    systems: [
      {
        name: 'Civilian optical observation network',
        operator: 'Amateur astronomers / general public',
        notes:
          'Fireball trajectory documented by multiple observers across six states. JRASC published contemporaneous trajectory analysis. No classified sensor data has been made public.',
      },
      {
        name: 'U.S. Space Surveillance Network',
        operator: 'U.S. Air Force',
        notes:
          'Orbital tracking data that established Kosmos 96 re-entered ~13 hours before the Kecksburg fireball, eliminating it as a candidate. Referenced in James Oberg\'s public analysis.',
      },
      {
        name: 'Project Blue Book investigation',
        operator: 'U.S. Air Force',
        notes:
          'Classified the event as a meteor bolide. Blue Book files now available via National Archives (NARA) and The Black Vault FOIA archive.',
      },
    ],
  },

  sources: [
    {
      title: 'JRASC Trajectory Analysis of the December 9, 1965 Fireball',
      date: '1966',
      type: 'academic',
      notes:
        'Journal of the Royal Astronomical Society of Canada. Contemporaneous trajectory reconstruction establishing the fireball\'s flight path over six states, consistent with a shallow-entry bolide terminating over southwestern Pennsylvania.',
    },
    {
      title: 'USAF Pentagon Memo - Kecksburg Talking Points Request',
      date: '1965-12-10',
      type: 'official',
      notes:
        'Declassified document showing a USAF major contacted Air Force press offices the day after the incident requesting talking points about the fireball. Available via The Black Vault FOIA archive.',
    },
    {
      title: 'Project Blue Book - Kecksburg Case File',
      type: 'official',
      notes:
        'Official USAF classification of the Kecksburg event as a meteor bolide. Available via National Archives (NARA) microfilm and The Black Vault digital archive.',
    },
    {
      title: 'NASA Public Statement on Kecksburg',
      date: '2005',
      type: 'official',
      notes:
        'NASA stated its experts analyzed Kecksburg-area fragments in 1987 and concluded Soviet satellite origin. Simultaneously acknowledged the 1987 analysis records were lost. Statement made in context of Leslie Kean\'s then-pending FOIA litigation.',
    },
    {
      title: 'Kean v. NASA, 480 F. Supp. 2d 150 (D.D.C. 2007)',
      date: '2007-10-26',
      type: 'official',
      url: 'https://law.justia.com/cases/federal/district-courts/FSupp2/480/150/2321090/',
      notes:
        'Federal FOIA lawsuit settlement. Court ordered NASA to conduct a more thorough document search and pay plaintiff\'s attorney fees. NASA produced hundreds of new documents but no definitive identification emerged. CourtListener and Justia carry the decision.',
    },
    {
      title: 'Pittsburgh Post-Gazette - Kecksburg Coverage',
      date: '1965-12-10',
      type: 'media',
      notes:
        'Contemporaneous newspaper coverage of the fireball and military activity near Kecksburg. Primary source for establishing the timeline of public reporting and official statements in the 24 hours following the event.',
    },
    {
      title: 'Stan Gordon Research Archive',
      url: 'https://www.stangordon.info/',
      type: 'foia',
      notes:
        'Decades of witness interview documentation and FOIA-retrieved records compiled by the primary long-term civilian investigator of the Kecksburg incident. Primary source for Romansky and Murphy accounts and for corroborating witness contacts.',
    },
  ],
};

// ---------------------------------------------------------------------------
// USS THEODORE ROOSEVELT / GIMBAL & GOFAST (2014-2015)
// ---------------------------------------------------------------------------
const rooseveltEnrichment = {
  timeline: [
    {
      timestamp: '2014-01-01',
      local: 'Early 2014',
      event: 'F/A-18 pilots assigned to VFA-11 "Red Rippers" and other squadrons aboard USS Theodore Roosevelt begin encountering unidentified aerial objects during training operations over the U.S. East Coast. Pilots report sphere, cube-in-sphere, and acorn shapes at altitudes from near sea level to above 30,000 ft.',
    },
    {
      timestamp: '2014-06-01',
      local: 'Mid-2014',
      event: 'Lt. Cmdr. Ryan Graves and colleagues report a near-miss incident in which an unidentified object reportedly passed between two F/A-18s flying in formation. Graves later testifies this incident was filed as a near-miss aviation safety report.',
    },
    {
      timestamp: '2014-09-01',
      local: 'Late 2014 (approx.)',
      event: 'The GIMBAL footage is captured during a training exercise off the U.S. East Coast by an AN/ASQ-228 ATFLIR pod aboard an F/A-18. Exact date remains classified. The video shows an object rotating within its own axis while maintaining stable flight, triggering a debate over whether the rotation is of the object or an artifact of the ATFLIR gimbal mechanism.',
    },
    {
      timestamp: '2015-01-21',
      local: 'January 21, 2015',
      event: 'GOFAST footage captured. F/A-18 crew intercepts an object at approximately 25,000 ft over the Atlantic. Subsequent analysis (including by Mick West) calculates the object\'s true groundspeed as approximately 40-50 knots relative to the ocean surface when accounting for wind and the aircraft\'s own speed and bank angle - far slower than the visual impression suggests, but still representing an unidentified low-altitude object with no visible propulsion or control surfaces.',
    },
    {
      timestamp: '2015-06-01',
      local: 'Mid-2015 (approx.)',
      event: 'Roosevelt deployment concludes. Ryan Graves and multiple other pilots have accumulated months of encounter reports. Graves later states he reported the activity "up the chain" but received no formal response or follow-up investigation from Navy leadership at the time.',
    },
    {
      timestamp: '2017-12-16',
      local: 'December 16, 2017',
      event: 'New York Times publishes "Glowing Auras and Black Money: The Pentagon\'s Mysterious U.F.O. Program," the first major disclosure of AATIP. The GIMBAL video appears publicly for the first time as part of this reporting.',
    },
    {
      timestamp: '2020-04-27',
      local: 'April 27, 2020',
      event: 'Department of Defense officially releases all three videos - FLIR1 (Nimitz), GIMBAL, and GOFAST - via a formal press release, confirming they were taken by Navy personnel and that the objects remain "unidentified."',
    },
    {
      timestamp: '2023-07-26',
      local: 'July 26, 2023',
      event: 'Ryan Graves testifies before the House Oversight Committee\'s UAP subcommittee hearing. Graves states near-daily encounter frequency, describes near-miss incidents, and calls for a formal safety reporting mechanism for pilots. His testimony is treated as the most credible first-person pilot account in the congressional record.',
    },
  ],

  competing_hypotheses: [
    {
      name: 'GIMBAL Gimbal-Artifact Hypothesis',
      assessment: 'disputed',
      summary:
        'Analyst Mick West and others argue the apparent rotation of the object in the GIMBAL video is an artifact of the AN/ASQ-228 ATFLIR\'s gimbal mechanism - specifically the IR camera rotating to maintain lock, rather than the object itself rotating. The "aura" effect is attributed to the ATFLIR\'s whitehot/blackhot IR contrast mode and atmospheric diffraction. Under this analysis, the object could be a distant aircraft whose exhaust plume creates the observed heat signature.',
      evidence_for: [
        'AN/ASQ-228 ATFLIR is known to produce gimbal-rotation artifacts in certain tracking scenarios',
        'The rotation timing in the video is consistent with a gimbal mechanical adjustment rather than an independent object rotation',
        'At extreme range, a commercial or military aircraft\'s heat signature could produce the observed shape and "aura"',
        'Mick West produced a detailed technical breakdown with ATFLIR engineering documentation',
      ],
      evidence_against: [
        'Ryan Graves and other pilots who observed the objects visually (not solely via ATFLIR) describe characteristics inconsistent with known aircraft',
        'Multiple independent sensor modalities (radar + visual + ATFLIR) corroborated encounters across the deployment - difficult to attribute all to sensor artifact',
        'Navy fighter pilots with thousands of hours of ATFLIR experience stated the footage did not match known sensor artifact behavior',
        'DoD confirmed the objects remain "unidentified" despite internal access to full sensor data and classification context not available to outside analysts',
      ],
    },
    {
      name: 'GOFAST Altitude/Speed Misinterpretation',
      assessment: 'disputed',
      summary:
        'Analysts including Mick West argue that the GOFAST object, when altitude is calculated from available HUD data, was traveling at a much lower groundspeed than the visual impression suggests - approximately 40-50 knots when pilot motion and wind are accounted for. This would make GOFAST consistent with a low-altitude balloon or slow-moving drone rather than a hypersonic object. The apparent speed is a visual artifact of the F/A-18\'s own high-speed, low-altitude geometry.',
      evidence_for: [
        'HUD data embedded in the GOFAST video allows altitude triangulation; calculations suggest the object was below 13,000 ft',
        'At calculated altitude and with wind correction, true groundspeed is in the range of 40-50 knots - within drone capability',
        'No heat signature suggesting high-speed flight or propulsion visible in ATFLIR imagery',
      ],
      evidence_against: [
        'The object appeared at an altitude and in a restricted airspace where balloon or commercial drone operation would require FAA coordination - no such coordination was logged',
        'An object at the calculated altitude with no visible propulsion, wings, or lift surface at 40-50 knots groundspeed is itself anomalous',
        'Ship radar and aircraft radar did not receive a transponder return or identification from the object',
      ],
    },
    {
      name: 'Adversarial Drone / Intelligence Collection Platform',
      assessment: 'probable',
      summary:
        'The Navy\'s own internal assessment at the time of the encounters focused on whether a foreign adversary (China or Russia) had deployed advanced surveillance drones to collect intelligence on U.S. carrier operations. Ryan Graves has stated this was the primary concern within his squadron. The objects\' apparent ability to operate in U.S. restricted airspace with no transponder, no IFF response, and no known propulsion remains unexplained under this hypothesis.',
      evidence_for: [
        'Encounters occurred during sensitive carrier strike group training operations - high-value intelligence collection opportunity',
        'Drone technology has advanced significantly; state actors have fielded persistent-surveillance UAS platforms',
        'Navy\'s own Task Force initially framed encounters in a national security context rather than an anomalous phenomena context',
        'Objects\' flight altitudes and observed speeds are not physically impossible for advanced drones',
      ],
      evidence_against: [
        'No transponder signal, no IFF, and no RF emissions detected by ship electronic warfare systems during most encounters',
        'Object endurance exceeds known publicly acknowledged drone capabilities for some reported encounter durations',
        'Some objects reported operating in hurricane-force wind conditions where fixed-wing or rotor drone operation is not feasible',
        'Graves\' near-miss safety report was not treated by Navy leadership as a national security escalation, suggesting internal skepticism of the adversary drone explanation',
      ],
    },
    {
      name: 'Anomalous Aerial Phenomena (UAP)',
      assessment: 'possible',
      summary:
        'A subset of the Roosevelt encounters - particularly those with multi-day radar persistence, sea-surface-to-high-altitude transitions, and no visible propulsion - are not explained by any known natural, adversarial, or sensor-artifact hypothesis. The DoD\'s own classification of the objects as "unidentified" after reviewing full classified sensor data implies no conventional explanation has been confirmed.',
      evidence_for: [
        'DoD has not publicly identified any of the Roosevelt-era objects despite access to classified sensor data',
        'Multi-sensor corroboration (radar + ATFLIR + visual) across multiple events',
        'Ryan Graves testified under oath to near-daily encounters with consistent object characteristics over a deployment that lasted months',
        'Objects reportedly appeared at altitudes from near sea level to above 30,000 ft with no propulsion signature',
      ],
      evidence_against: [
        'The strongest photographic evidence (GIMBAL, GOFAST) has plausible conventional explanations under technical analysis',
        'Absence of explanation is not evidence of anomalous origin',
        'No recovered materials or definitive sensor data has been publicly released confirming non-conventional performance',
      ],
    },
  ],

  claims_taxonomy: {
    verified: [
      'GIMBAL and GOFAST videos are authentic Navy footage taken during F/A-18 operations (DoD press release, April 27, 2020)',
      'DoD confirmed the objects in both videos remain "unidentified" as of the April 2020 release',
      'Ryan Graves testified under oath before the House Oversight Committee on July 26, 2023, describing sustained encounters',
      'The AN/ASQ-228 ATFLIR sensor system was in use during the encounters (acknowledged in Navy and DoD statements)',
    ],
    probable: [
      'A near-miss aviation safety incident between F/A-18s and an unidentified object was reported by Graves (his congressional testimony under oath; not yet independently confirmed by released documentation)',
      'Encounters occurred near-daily over an extended period during the 2014-2015 Roosevelt deployment (Graves and other pilot testimony; consistent across multiple accounts)',
      'Objects appeared on ship radar as well as in ATFLIR footage (referenced in Graves\' testimony and USNI reporting; raw radar data not publicly released)',
    ],
    disputed: [
      'The GIMBAL object was physically rotating (contested by gimbal-artifact hypothesis; DoD has not publicly resolved the dispute)',
      'GOFAST object was traveling at hypersonic speed (analyst calculations suggest lower true groundspeed; DoD has not publicly confirmed performance data)',
      'Objects were capable of sea-surface to high-altitude transitions (described in broader Roosevelt encounter accounts; specific GIMBAL/GOFAST footage does not show this)',
    ],
    speculative: [
      'Objects were operated by a foreign adversary conducting intelligence collection (plausible but no public evidence linking objects to any nation-state program)',
      'Objects represent non-human intelligence technology (no physical evidence; based on performance characteristics that remain disputed)',
    ],
  },

  sensor_context: {
    systems: [
      {
        name: 'AN/ASQ-228 ATFLIR (Advanced Targeting Forward Looking Infrared)',
        operator: 'U.S. Navy F/A-18 Super Hornet crews, VFA-11 and associated squadrons',
        notes:
          'Primary sensor system that captured both GIMBAL and GOFAST footage. The ATFLIR\'s gimbal mechanics are central to the gimbal-artifact hypothesis. Operating in IR mode (whitehot/blackhot) for both videos.',
      },
      {
        name: 'AN/APG-79 AESA Radar',
        operator: 'U.S. Navy F/A-18E/F Super Hornet',
        notes:
          'Active electronically scanned array radar on F/A-18E/F. Referenced in pilot accounts as detecting objects during encounters. Specific radar return data not publicly released.',
      },
      {
        name: 'AN/SPY-1 Aegis radar (USS Theodore Roosevelt)',
        operator: 'USS Theodore Roosevelt (CVN-71) Combat Information Center',
        notes:
          'Ship-based phased array radar. Graves and other pilots indicated objects were tracked on ship radar; specific tracking data remains classified.',
      },
    ],
  },

  sources: [
    {
      title: 'DoD Press Release: Navy Videos of Unidentified Aerial Phenomena',
      url: 'https://www.defense.gov/News/Releases/Release/Article/2165713/',
      date: '2020-04-27',
      type: 'official',
      notes:
        'Official DoD release authorizing public release of FLIR1, GIMBAL, and GOFAST videos. Confirms videos were taken by Navy personnel and that the objects remain unidentified. Primary authentication document for all three videos.',
    },
    {
      title: 'Ryan Graves Congressional Testimony - House Oversight UAP Subcommittee',
      date: '2023-07-26',
      type: 'testimony',
      notes:
        'Graves testifies under oath to near-daily encounters, near-miss incidents, and systematic lack of official response. Describes the encounters as a sustained national security and aviation safety issue. Full transcript available via congress.gov.',
    },
    {
      title: 'New York Times: "Glowing Auras and Black Money: The Pentagon\'s Mysterious U.F.O. Program"',
      url: 'https://www.nytimes.com/2017/12/16/us/politics/pentagon-program-ufo-harry-reid.html',
      date: '2017-12-16',
      type: 'media',
      notes:
        'First major public disclosure of AATIP and the associated Navy videos. Published GIMBAL footage for the first time. Reporting by Helene Cooper, Ralph Blumenthal, and Leslie Kean.',
    },
    {
      title: 'Mick West - GIMBAL Analysis: "What is the Gimbal UFO?"',
      url: 'https://www.metabunk.org/threads/what-is-the-gimbal-ufo.10238/',
      date: '2019-01-01',
      type: 'academic',
      notes:
        'Detailed technical analysis of the GIMBAL video arguing the rotation is an ATFLIR gimbal artifact. Includes engineering documentation on ATFLIR mechanics. The primary source for the gimbal-artifact competing hypothesis.',
    },
    {
      title: 'Mick West - GOFAST Analysis: Speed Calculation',
      url: 'https://www.metabunk.org/threads/go-fast-ufo-what-is-the-actual-speed.9933/',
      date: '2018-01-01',
      type: 'academic',
      notes:
        'Altitude and groundspeed calculation for the GOFAST object using HUD data embedded in the video. Concludes true groundspeed is approximately 40-50 knots when accounting for aircraft speed, bank angle, and wind. Primary source for the GOFAST speed-misinterpretation hypothesis.',
    },
    {
      title: 'USNI News: Navy Updates UFO Reporting Guidelines',
      date: '2019-04-24',
      type: 'media',
      notes:
        'U.S. Naval Institute News report on the Navy\'s 2019 update to its UAP reporting procedures, directly citing the Roosevelt-era encounter pattern as motivation. Confirms Navy institutional acknowledgment of the encounter series.',
    },
  ],
};

// ---------------------------------------------------------------------------
// USS OMAHA (2019)
// ---------------------------------------------------------------------------
const omahaEnrichment = {
  timeline: [
    {
      timestamp: '2019-07-01',
      local: 'Early July 2019',
      event: 'Multiple U.S. Navy ships operating off the Southern California coast (including USS Omaha, USS Russell, USS Kidd, and others) begin tracking unidentified objects. Lt. Cmdr. Ryan Graves, flying F/A-18s in the same operational theater from shore-based assignment, later connects this period to the broader Pacific encounter cluster.',
    },
    {
      timestamp: '2019-07-14',
      local: 'July 14-15, 2019 (approx.)',
      event: 'USS Omaha CIC crew begins tracking a spherical, metallic object with no visible wings, rotors, or propulsion. The object tracks at approximately 130 knots on an erratic course. Multiple crew members and watch standers are present in the CIC during the observation.',
    },
    {
      timestamp: '2019-07-15',
      local: 'July 15, 2019',
      event: 'USS Omaha FLIR operator films the object during a sustained tracking event. The video captures the object approaching and then apparently descending into the Pacific Ocean. CIC crew audio recorded: "Wow, it\'s going into the water." [Pause] "Splash. No wreckage."',
    },
    {
      timestamp: '2019-07-15T23:59:00',
      local: 'Same evening',
      event: 'USS Omaha launches a helicopter search and deploys a submarine to locate the submerged object. Neither finds any debris, wreckage, or trace of the object. The ocean floor search produces no results.',
    },
    {
      timestamp: '2019-07-01',
      local: 'July 2019 (concurrent)',
      event: 'USS Russell films a cluster of unidentified blinking lights flying in formation at night off the Southern California coast. Pentagon later authenticates this footage alongside the Omaha video. USS Kidd and other vessels log similar observations in the same period.',
    },
    {
      timestamp: '2021-04-08',
      local: 'April 8, 2021',
      event: 'Documentary filmmaker Jeremy Corbell obtains and publishes the USS Omaha FLIR footage on his website (extraordinarybeliefs.com) along with a still image from the USS Russell encounter. The release generates significant media coverage.',
    },
    {
      timestamp: '2021-04-30',
      local: 'April 30, 2021',
      event: 'Pentagon confirms the Omaha and Russell footage is authentic: "The aerial phenomena observed in the videos remain characterized as \'unidentified.\'" The DoD statement authenticates the footage but does not identify the objects. Distinguishes from the April 2020 official release of FLIR1, GIMBAL, and GOFAST.',
    },
    {
      timestamp: '2023-07-26',
      local: 'July 26, 2023',
      event: 'Retired Rear Admiral Tim Gallaudet testifies before the House Oversight UAP subcommittee. Gallaudet, former acting NOAA administrator, references the systematic neglect of underwater UAP incidents and describes Navy reports of objects entering and exiting the ocean at anomalous speeds - directly relevant to the Omaha encounter pattern.',
    },
  ],

  competing_hypotheses: [
    {
      name: 'Advanced Drone / UAS Swarm',
      assessment: 'probable',
      summary:
        'At the time of the encounters, the U.S. Navy\'s own internal concern - reflected in subsequent Task Force briefings - was that the objects could be advanced unmanned aerial systems, potentially from a foreign adversary, conducting persistent surveillance of carrier and surface ship operations. The 2019 West Coast encounter cluster coincided with an elevated Navy security posture regarding Chinese and Russian UAS development. The 6-foot spherical estimate and 130-knot tracking speed are within the theoretical envelope of advanced UAS platforms.',
      evidence_for: [
        'Navy\'s internal Task Force framing focused on the national security/adversary-drone hypothesis',
        'Multiple objects appearing in the same operational area over multiple nights is consistent with a structured UAS surveillance operation',
        '130-knot airspeed is within the performance range of advanced fixed-wing UAS platforms',
        'No evidence of hypersonic or physically anomalous performance has been publicly disclosed for the Omaha encounter specifically',
      ],
      evidence_against: [
        'No RF emissions, transponder signal, or IFF response detected from the objects during ship-based electronic warfare monitoring',
        'An object operating in U.S. Navy restricted operations area with no flight clearance and no transponder constitutes a violation regardless of origin',
        'The apparent controlled submersion into the ocean without debris is not consistent with any known drone failure mode or controlled water landing capability',
        'Submarine and helicopter search found nothing - a drone landing in the ocean would leave recoverable debris',
      ],
    },
    {
      name: 'Transmedium Craft (USO)',
      assessment: 'possible',
      summary:
        'The Omaha footage is the strongest piece of evidence in the public domain for what researchers term a "transmedium" object - one capable of operating in both air and water. The object\'s apparent controlled descent into the ocean, the absence of any debris or surface disturbance, and the negative results of both helicopter and submarine search are collectively difficult to explain with any conventional vehicle. Rear Admiral Gallaudet\'s testimony specifically references underwater UAP incidents of this type.',
      evidence_for: [
        'Object appears to descend into the ocean in a controlled manner with no observable crash or debris',
        'Pentagon-authenticated FLIR footage shows the descent sequence',
        'CIC crew audio reaction ("no wreckage") is contemporaneous and consistent with an anomalous event',
        'Submarine and helicopter search found nothing, consistent with the object having departed the area underwater',
        'Tim Gallaudet\'s independent testimony describes Navy documentation of objects transitioning between air and water environments',
      ],
      evidence_against: [
        'Video resolution does not conclusively show the object entering the water - some analysts argue it passes below the sensor\'s effective horizon',
        'The "submersion" could be a camera angle artifact as the object descends below the ship\'s horizon or into sea clutter',
        'No sonar contact was reported during the submarine search, which would be expected if a large metallic object entered the water nearby',
        'A negative search result is consistent with both a departed anomalous object and a sensor tracking error',
      ],
    },
    {
      name: 'Sensor/Camera Artifact',
      assessment: 'disputed',
      summary:
        'A minority of analysts argue the "submersion" event in the Omaha footage could be a FLIR tracking loss event rather than a genuine water entry - the object passes below the visible horizon or into sea clutter and the camera loses lock, which the crew interprets as a splash. The spherical appearance may reflect the FLIR\'s resolution limitations at range rather than actual object morphology.',
      evidence_for: [
        'FLIR tracking of small objects at sea level in sea-clutter conditions is known to produce false lock-loss events',
        'The Pentagon authenticated the footage but did not confirm the object entered the water - only that the footage was genuine Navy footage',
        'No sonar contact was reported by USS Omaha or the deployed submarine',
      ],
      evidence_against: [
        'Multiple trained CIC operators were present and contemporaneously reported "splash, no wreckage" - not a sensor-loss event interpretation',
        'Crew immediately dispatched helicopter and submarine, consistent with genuine belief that something entered the water',
        'Pentagon authentication specifically covers the "aerial phenomena" including the descent sequence',
      ],
    },
  ],

  claims_taxonomy: {
    verified: [
      'USS Omaha FLIR footage is authentic Navy footage (Pentagon statement, April 30, 2021)',
      'USS Russell footage of the "light swarm" is authentic Navy footage from the same period (Pentagon statement, April 30, 2021)',
      'Pentagon confirmed the objects remain "unidentified" as of the authentication statement',
      'Jeremy Corbell published the Omaha footage on April 8, 2021, before any official release',
    ],
    probable: [
      'The object tracked at approximately 130 knots before descending (consistent across CIC crew audio and video tracking data; specific speed not officially confirmed)',
      'A helicopter search and submarine deployment found no debris or trace of the object (referenced in Corbell\'s published account and consistent with Navy operational protocol; not yet officially confirmed in a public document)',
      'The 2019 Southern California cluster involved multiple ships over multiple nights (Pentagon authenticated Omaha and Russell footage; other vessels\' encounters referenced in UAP Task Force materials)',
    ],
    disputed: [
      'The object entered the ocean in a controlled manner (video shows descent but "submersion" interpretation contested by some analysts; camera tracking-loss is an alternative)',
      'The object was approximately 6 feet in diameter (size estimate from FLIR targeting; range and atmospheric conditions introduce significant uncertainty)',
      'Ryan Graves was operating in the same theater during this period (stated by Graves in interviews; not officially corroborated in public documents)',
    ],
    speculative: [
      'The object is a transmedium craft capable of operating in both air and water environments (possible interpretation of evidence; no physical confirmation)',
      'The encounter cluster represents organized surveillance of U.S. Navy operations by a foreign adversary (plausible national security framing; no confirmed attribution)',
    ],
  },

  sensor_context: {
    systems: [
      {
        name: 'Ship FLIR (Forward Looking Infrared)',
        operator: 'USS Omaha (LCS-12) Combat Information Center crew',
        notes:
          'Primary sensor that captured the authenticated footage. Operated in IR mode; the video shows the object in flight and apparent descent into the ocean. Pentagon-authenticated April 30, 2021.',
      },
      {
        name: 'Surface Search Radar',
        operator: 'USS Omaha (LCS-12)',
        notes:
          'Ship radar tracked the object during the encounter. Specific radar return data and track plots remain classified and have not been publicly released.',
      },
      {
        name: 'Submarine sonar',
        operator: 'U.S. Navy submarine (unit not publicly identified)',
        notes:
          'Deployed following the apparent water entry to locate the object. No contact was reported. The negative sonar result is cited both as evidence the object departed and as grounds for questioning whether it entered the water at all.',
      },
    ],
  },

  sources: [
    {
      title: 'Pentagon Authentication Statement - USS Omaha / USS Russell Footage',
      date: '2021-04-30',
      type: 'official',
      notes:
        'DoD statement confirming the Omaha and Russell footage was taken by Navy personnel and that the objects remain "unidentified." Primary authentication document. Distinct from the April 27, 2020 release of FLIR1/GIMBAL/GOFAST.',
    },
    {
      title: 'Jeremy Corbell - USS Omaha FLIR Footage Release',
      url: 'https://www.extraordinarybeliefs.com/',
      date: '2021-04-08',
      type: 'media',
      notes:
        'First public release of the USS Omaha footage by documentary filmmaker Jeremy Corbell. Published before any official DoD statement. The video, including the CIC crew audio, originates from this release. Corbell\'s publishing triggered the Pentagon\'s April 30 authentication.',
    },
    {
      title: 'Ryan Graves Congressional Testimony - House Oversight UAP Subcommittee',
      date: '2023-07-26',
      type: 'testimony',
      notes:
        'Graves describes the Southern California operational theater as part of the broader 2019 encounter cluster he observed from his shore-based assignment. Connects the Pacific encounters to the East Coast Roosevelt-era events as part of a sustained pattern.',
    },
    {
      title: 'Rear Admiral Tim Gallaudet Congressional Testimony',
      date: '2023-07-26',
      type: 'testimony',
      notes:
        'Gallaudet (former Acting NOAA Administrator) testifies to systematic neglect of underwater UAP incidents and describes Navy documentation of objects entering and exiting water at anomalous speeds. Directly relevant to the Omaha transmedium encounter.',
    },
    {
      title: 'USNI News: Multiple Navy ships encountered UAPs in 2019',
      date: '2021-05-28',
      type: 'media',
      notes:
        'U.S. Naval Institute News reporting on the 2019 Southern California encounter cluster, referencing USS Omaha, USS Russell, and other vessels. First institutional news source to contextualize the multi-ship nature of the encounter series.',
    },
  ],
};

// ---------------------------------------------------------------------------
// Apply enrichments
// ---------------------------------------------------------------------------
const enriched = cases.map((c) => {
  if (c.id === 'kecksburg-1965') return { ...c, ...kecksburgEnrichment };
  if (c.id === 'uss-theodore-roosevelt') return { ...c, ...rooseveltEnrichment };
  if (c.id === 'uss-omaha-2019') return { ...c, ...omahaEnrichment };
  return c;
});

fs.writeFileSync(CASES_PATH, JSON.stringify(enriched, null, 2), 'utf8');

const ids = ['kecksburg-1965', 'uss-theodore-roosevelt', 'uss-omaha-2019'];
ids.forEach((id) => {
  const original = cases.find((c) => c.id === id);
  const updated = enriched.find((c) => c.id === id);
  const origLen = JSON.stringify(original).length;
  const newLen = JSON.stringify(updated).length;
  console.log(`${id}: ${origLen} → ${newLen} chars (+${newLen - origLen})`);
});

console.log('\nTier 2 enrichment complete.');
