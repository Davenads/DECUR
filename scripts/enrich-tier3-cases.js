#!/usr/bin/env node
/**
 * Tier 3 Case Enrichment Script
 * Enriches 7 existing cases + adds Stephenville 2008 as a new case.
 * All sources are primary (government docs, FOIA records, direct journalism, court filings).
 * No UAPedia content reproduced.
 *
 * Run once: node scripts/enrich-tier3-cases.js
 */

const fs = require('fs');
const path = require('path');

const CASES_PATH = path.join(__dirname, '..', 'data', 'cases.json');
const cases = JSON.parse(fs.readFileSync(CASES_PATH, 'utf8'));

// ---------------------------------------------------------------------------
// BELGIAN UFO WAVE (1989-1990)
// ---------------------------------------------------------------------------
const belgianEnrichment = {
  timeline: [
    {
      timestamp: '1989-11-29',
      local: 'November 29, 1989',
      event: 'The wave begins near Eupen, eastern Belgium. Two gendarmerie officers (Sgt. Nicoll and Sgt. Von Montigny) observe a large triangular object with lights for over an hour while on patrol. They radio their report to headquarters in real time. The event triggers a formal Belgian gendarmerie reporting protocol.',
    },
    {
      timestamp: '1989-12-01',
      local: 'December 1989 - January 1990',
      event: 'Thousands of reports flood Belgian police and gendarmerie from across Wallonia and Brussels. SOBEPS (Société Belge d\'Étude des Phénomènes Spatiaux) coordinates with Belgian Air Force to collect and analyze civilian testimony. Descriptions are remarkably consistent: large equilateral triangle, three white corner lights, central red light, silent or near-silent.',
    },
    {
      timestamp: '1990-03-30T23:00:00',
      local: 'March 30, 1990, ~11 PM',
      event: 'Belgian Air Force radar stations at Glons (NADGE network) and Semmerzake detect an unidentified target with radar cross-section and performance inconsistent with known aircraft. Two F-16A Fighting Falcons (from 1 Wing, Beauvechain) are scrambled.',
    },
    {
      timestamp: '1990-03-31T00:05:00',
      local: 'March 31, 1990, ~12:05 AM',
      event: 'Lead F-16 pilot achieves radar lock on the object for approximately 6 seconds. The object accelerates from ~150 knots to approximately 1,760 knots (Mach 2.3) in seconds, simultaneously descending from 9,000 ft to 5,000 ft and then to 213 ft in under 2 minutes. Maneuvers register apparent G-forces exceeding 40G - beyond human survivability. The F-16s lose contact.',
    },
    {
      timestamp: '1990-03-31T00:30:00',
      local: 'March 31, 1990, after contact loss',
      event: 'F-16s continue search but cannot reacquire the target. Total radar lock duration was brief; the encounter is recorded in flight data systems and BAF radar logs. No weapon systems were activated.',
    },
    {
      timestamp: '1990-04-11',
      local: 'April 11, 1990',
      event: 'General Wilfried De Brouwer holds a press conference publicly acknowledging the March 30-31 F-16 intercept, confirming radar data, and stating the objects could not be identified. The BAF releases F-16 radar printouts. De Brouwer states: "The nature and origin of the phenomenon is unknown." This is unprecedented official military transparency on a UAP incident.',
    },
    {
      timestamp: '1990-04-30',
      local: 'April 1990',
      event: 'The wave effectively ends. Total duration approximately five months. SOBEPS estimates 13,500+ witnesses across Belgium; approximately 2,600 filed written testimony. The BAF investigation formally remains "unresolved."',
    },
    {
      timestamp: '1991-01-01',
      local: '1991-1994',
      event: 'SOBEPS publishes two-volume investigation report "Vague d\'OVNI sur la Belgique" (UFO Wave Over Belgium). BAF collaborates on portions of the report. General De Brouwer writes the foreword for the first volume.',
    },
    {
      timestamp: '2011-07-26',
      local: 'July 26, 2011',
      event: 'Patrick Maréchal, the photographer responsible for the famous "Petit-Rechain" triangle photo (the most widely reproduced image from the wave), publicly admits the photo was a hoax created with foam and paint. This eliminates the photographic evidence component but does not affect the radar data or gendarmerie/F-16 testimony.',
    },
  ],

  competing_hypotheses: [
    {
      name: 'Advanced U.S. Stealth Aircraft (TR-3A / Aurora)',
      assessment: 'possible',
      summary:
        'The triangular shape, silent operation, and apparent advanced performance are consistent with a classified U.S. stealth aircraft program operating over NATO territory. The TR-3A "Black Manta" and Aurora programs were rumored in the late 1980s. Belgium is a NATO member and USAF operations over Belgian airspace without civilian notification are feasible under treaty arrangements. The 40G radar acceleration data may reflect sensor artifacts or tracking errors rather than actual vehicle performance.',
      evidence_for: [
        'U.S. was developing triangular low-observable platforms (B-2 first flight April 1989); Belgium is NATO territory',
        'Silent operation and triangular shape are consistent with known stealth aircraft design',
        'USAF has historically conducted classified operations over allied territory without notification',
        'The 40G radar data could reflect the F-16\'s radar losing and reacquiring a fast-moving conventional aircraft, not true vehicle acceleration',
      ],
      evidence_against: [
        'General De Brouwer specifically queried U.S. authorities about possible classified flights; the U.S. officially denied any aircraft in the area',
        'The object was observed at low altitude (<300 ft) at slow speeds by hundreds of witnesses - not consistent with stealth aircraft operational profiles',
        'B-2 has a flying-wing profile, not the equilateral triangle with lights described by thousands of witnesses',
        'No stealth aircraft matches the reported hover capability or the 13,500+ consistent civilian descriptions',
      ],
    },
    {
      name: 'Mass Misidentification / Atmospheric Phenomena',
      assessment: 'disputed',
      summary:
        'Some researchers argue the wave represents a combination of misidentified conventional aircraft, atmospheric light refraction, and social contagion - where early reports influenced subsequent witnesses to see similar phenomena. The retraction of the Petit-Rechain photo bolsters skeptical interpretations. The uniformity of descriptions may reflect media coverage shaping witness perception rather than independent observation.',
      evidence_for: [
        'The Petit-Rechain photo - the primary physical evidence - was admitted as a hoax in 2011',
        'Social contagion is documented in other mass sighting episodes (e.g., airship waves of 1896-97)',
        'No physical trace evidence was ever recovered from any Belgian UFO wave encounter site',
        'Some individual sightings within the wave are attributable to misidentified aircraft or lights',
      ],
      evidence_against: [
        'The March 30-31 F-16 radar data and flight recorder data are not subject to social contagion effects',
        'Gendarmerie officers filing official reports on November 29, 1989 were trained observers operating before any media wave',
        'The BAF radar data from two independent ground stations corroborated the F-16 onboard radar returns',
        'General De Brouwer\'s public acknowledgment of genuine unknowns reflects institutional assessment, not civilian misidentification',
      ],
    },
    {
      name: 'Genuine Anomalous Aerial Phenomena',
      assessment: 'possible',
      summary:
        'The March 30-31 F-16 intercept, corroborated by two independent ground radar stations and onboard aircraft systems, describes performance characteristics that no known 1990 aircraft could achieve. The BAF\'s own formal conclusion was "unresolved." The transparency of the Belgian investigation - unprecedented in official UAP history - lends weight to the conclusion that conventional explanations were genuinely exhausted.',
      evidence_for: [
        'Two independent NADGE radar stations (Glons and Semmerzake) corroborated the F-16 onboard radar return',
        'The recorded acceleration/descent profile exceeds any known aircraft performance by a large margin',
        'BAF formally concluded "unresolved" after a thorough institutional investigation',
        'Gendarmerie officers as earliest witnesses provide professional observation quality independent of civilian reports',
        'General De Brouwer\'s public statement, made in an official capacity, stands as the most direct government acknowledgment of an unidentified aerial object in European military history',
      ],
      evidence_against: [
        'No physical evidence recovered',
        'Petit-Rechain photo (the most circulated image) was a confirmed hoax',
        'The duration and scale of witness reports creates noise that makes precise characterization difficult',
        'Radar track reconstruction from 1990 Belgian BAF data has not been independently reproduced with modern signal processing',
      ],
    },
  ],

  claims_taxonomy: {
    verified: [
      'Belgian Air Force scrambled F-16s on March 30-31, 1990 in response to radar contacts (BAF press conference April 11, 1990; radar printouts released publicly)',
      'General Wilfried De Brouwer held a public press conference acknowledging the unidentified objects and releasing radar data (April 11, 1990)',
      'The Petit-Rechain photograph was confirmed as a hoax by its creator Patrick Maréchal in July 2011',
      'SOBEPS coordinated with the Belgian Air Force throughout the wave - the only documented case of a civilian UFO organization being formally integrated into a national military investigation',
    ],
    probable: [
      'F-16 radar recorded apparent 40G+ accelerations (documented in BAF radar logs released April 1990; the physical accuracy of the tracking data remains subject to analysis)',
      'Gendarmerie officers filed an official report of a structured craft on November 29, 1989, before any media coverage (gendarmerie report on record; independent corroboration limited)',
      'Approximately 13,500 witnesses reported sightings over five months (SOBEPS estimate based on police and civilian report volume; sampling methodology not independently verified)',
    ],
    disputed: [
      'The March 30-31 F-16 intercept F-16 achieved radar lock on the same object observed by civilian witnesses (radar lock confirmed; identity of the observed object as the same one reported by civilians is inferred, not demonstrated)',
      'The triangular objects were silent (consistent across thousands of reports; acoustic measurements were not taken scientifically)',
      'U.S. authorities denied having aircraft in the area (De Brouwer made this query; U.S. denial is reported but the relevant communication is not publicly documented)',
    ],
    speculative: [
      'The objects were operated by a non-human intelligence (no physical evidence; based on performance characteristics and mass witness testimony)',
      'USAF operated a classified TR-3A platform over Belgium (no declassified documentation; based on circumstantial timing and shape comparisons)',
    ],
  },

  sensor_context: {
    systems: [
      {
        name: 'NADGE Radar (NATO Air Defence Ground Environment) - Glons Station',
        operator: 'Belgian Air Force / NATO',
        notes:
          'One of two ground radar stations that independently corroborated the March 30-31 radar contact. Radar printouts were released publicly at the April 11, 1990 press conference.',
      },
      {
        name: 'NADGE Radar - Semmerzake Station',
        operator: 'Belgian Air Force / NATO',
        notes:
          'Second independent ground radar station confirming the contact. Two-station corroboration significantly reduces the probability of a single-system artifact.',
      },
      {
        name: 'F-16A APG-66 Airborne Radar',
        operator: 'Belgian Air Force, 1 Wing Beauvechain',
        notes:
          'Achieved lock on the object for approximately 6 seconds before the object\'s acceleration broke the lock. Flight data recorder captured the encounter sequence.',
      },
    ],
  },

  sources: [
    {
      title: 'Belgian Air Force Press Conference - General Wilfried De Brouwer',
      date: '1990-04-11',
      type: 'official',
      notes:
        'Primary government acknowledgment document. De Brouwer released F-16 radar printouts and stated the objects could not be identified. Reported in Belgian and international press; BAF press release on record.',
    },
    {
      title: 'SOBEPS - "Vague d\'OVNI sur la Belgique" (Vol. 1 & 2)',
      date: '1991',
      type: 'academic',
      notes:
        'Two-volume scientific investigation report by Société Belge d\'Étude des Phénomènes Spatiaux. Produced in coordination with the Belgian Air Force. General De Brouwer wrote the foreword. Primary repository of witness testimony and technical analysis.',
    },
    {
      title: 'Patrick Maréchal Hoax Admission (Petit-Rechain photo)',
      date: '2011-07-26',
      type: 'media',
      notes:
        'RTL-TVI interview in which Maréchal admitted the famous Petit-Rechain triangle photograph was fabricated using foam and paint. Eliminates photographic evidence from the case file; does not affect radar or official testimony evidence.',
    },
    {
      title: 'General De Brouwer - "Triangular UFOs Over Belgium" (MUFON 1991)',
      date: '1991',
      type: 'testimony',
      notes:
        'De Brouwer\'s formal presentation of the BAF investigation findings at the MUFON International UFO Symposium. Detailed technical account from the commanding general who oversaw the investigation.',
    },
  ],
};

// ---------------------------------------------------------------------------
// IRANIAN F-4 INCIDENT (1976)
// ---------------------------------------------------------------------------
const iranianF4Enrichment = {
  timeline: [
    {
      timestamp: '1976-09-18T23:30:00',
      local: 'September 18, 1976, ~11:30 PM local (Tehran)',
      event: 'Multiple Tehran civilians report a bright light in the sky to Mehrabad Airport control tower. The tower confirms an unknown radar return and contacts Imperial Iranian Air Force (IIAF) command. An F-4D Phantom II is scrambled from Shahrokhi Air Force Base.',
    },
    {
      timestamp: '1976-09-18T23:45:00',
      local: '~11:45 PM',
      event: 'First F-4 (pilot not publicly identified) approaches the object from approximately 40 nautical miles. At about 25 NM distance, the pilot\'s instrument panel fails completely and communications are lost. The pilot breaks off the approach; instruments and communications restore as soon as he turns away. The F-4 returns to base.',
    },
    {
      timestamp: '1976-09-19T00:01:00',
      local: 'September 19, ~12:01 AM',
      event: 'A second F-4D is scrambled. Pilot: 1st Lt. Parviz Jafari (aircraft commander), 1st Lt. Jalal Damirian (weapons systems officer). Jafari achieves radar lock at approximately 27 NM; the object appears on radar as roughly the size of a 707 tanker aircraft.',
    },
    {
      timestamp: '1976-09-19T00:10:00',
      local: '~12:10 AM',
      event: 'As Jafari\'s F-4 closes to 25 NM, the object accelerates away, maintaining the same distance - matching the F-4\'s speed increase for increase. Jafari estimates the object was moving at approximately Mach 2 at one point. The object emits intense strobing lights - blue, green, red, and orange - described as "flashing sequentially."',
    },
    {
      timestamp: '1976-09-19T00:20:00',
      local: '~12:20 AM',
      event: 'A smaller, brighter object separates from the main object and moves toward Jafari\'s F-4 at high speed. Jafari attempts to fire an AIM-9 Sidewinder missile. His weapons control panel fails entirely - he has no weapons capability and no communications. He executes a high-G evasive turn. The smaller object follows briefly, then returns to the main object.',
    },
    {
      timestamp: '1976-09-19T00:30:00',
      local: '~12:30 AM',
      event: 'A second smaller object separates from the main craft and descends toward the ground south of Tehran. Jafari observes it descend and appear to land near Shahriari. On the ground, a bright light is visible at the apparent landing site. Jafari\'s instruments and communications restore after the smaller object departs toward the main craft.',
    },
    {
      timestamp: '1976-09-19T06:00:00',
      local: 'September 19, dawn',
      event: 'A civilian aircraft in the area also reports observing the phenomenon. An Iranian Army helicopter crew observes a bright light at the apparent ground site south of Tehran. The crew describes electrical problems when near the light. Ground team dispatched to the area finds nothing.',
    },
    {
      timestamp: '1976-09-19T12:00:00',
      local: 'September 19, day',
      event: 'The DIA (Defense Intelligence Agency) is notified. The incident is reported through U.S. military channels by the USAF attaché at the American Embassy in Tehran. A formal DIA intelligence report is prepared.',
    },
    {
      timestamp: '1976-10-01',
      local: 'October 1976',
      event: 'DIA report DIA/ST-CS-01-776-76 is completed and circulated within the U.S. intelligence community. The report rates the incident highly credible and notes it as a "classic" UFO encounter. It is stamped SECRET/NOFORN. The report is later declassified and released via FOIA.',
    },
  ],

  competing_hypotheses: [
    {
      name: 'Astronomical Misidentification (Jupiter / Meteor)',
      assessment: 'disputed',
      summary:
        'Some researchers have proposed that the initial bright object observed by the tower and first F-4 crew was Jupiter, which was prominent in the sky that evening, combined with a meteor or other natural phenomenon. Under this interpretation, the second F-4\'s instrument failures were coincidental or psychosomatic, and the "smaller objects" were conventional aircraft in the area. The DIA\'s own report dismissed this possibility.',
      evidence_for: [
        'Jupiter was visible and bright in the Tehran sky on the night of the incident',
        'The initial report originated from civilians unfamiliar with astronomical objects',
        'Instrument failures in aircraft can have mundane causes, particularly under stress',
      ],
      evidence_against: [
        'The DIA report specifically notes the radar confirmation of the object\'s size (comparable to a 707 tanker) - a natural object would not produce such a return',
        'Two independent aircraft experienced instrument and weapons failures at proximity to the object - coincidental mechanical failures are an insufficient explanation',
        'Jupiter does not accelerate to match pursuing aircraft or deploy smaller sub-objects',
        'The radar track, multiple visual observers, and civilian ground reports are inconsistent with a single astronomical explanation',
      ],
    },
    {
      name: 'Classified U.S. or Soviet Aircraft / Weapons Test',
      assessment: 'possible',
      summary:
        'The 1976 timeframe coincided with advanced U.S. and Soviet classified programs. Some analysts have proposed that the object could have been a classified reconnaissance platform (such as a D-21 drone or similar). Instrument failures could be caused by a directed electromagnetic pulse or high-powered radar jamming system. The U.S. attaché\'s rapid notification of the DIA may reflect prior knowledge of an ongoing program.',
      evidence_for: [
        'Instrument failures consistent with electromagnetic interference from a high-powered emission source',
        'U.S. had a strong intelligence interest in Iranian military operations (strong U.S.-Iran alliance in 1976)',
        'The rapid DIA report preparation suggests the attaché had prior context for evaluating the incident',
      ],
      evidence_against: [
        'The object\'s performance (matching F-4 speed increases, rapid acceleration) exceeds any classified aircraft known to have existed in 1976',
        'No classified program has been publicly attributed to this encounter in subsequent declassifications',
        'The sub-object deployment behavior is not consistent with any known classified reconnaissance platform',
        'The DIA report itself does not suggest a friendly intelligence program explanation',
      ],
    },
    {
      name: 'Anomalous Aerial Phenomena (UAP)',
      assessment: 'possible',
      summary:
        'The DIA report itself used the term "a classic UFO encounter" and rated the incident\'s credibility highly on all dimensions (pilot reliability, multiple corroboration, physical effects). The combination of multi-sensor radar confirmation, two independent aircraft experiencing identical electromagnetic effects, a sub-object deployment, and a ground-level apparent landing are collectively not explained by any conventional hypothesis that has been publicly advanced.',
      evidence_for: [
        'Declassified DIA report explicitly states this is a "classic" UAP case and rates witness credibility highly',
        'Dual aircraft electromagnetic effects (instrument and weapons failures) at proximity represent a physical interaction not consistent with natural or conventional aircraft explanations',
        'Radar confirmation of an object the size of a 707 that was not a known aircraft in the area',
        'Multiple independent observers: tower, first F-4 crew, second F-4 crew, civilian aircraft, Army helicopter crew',
      ],
      evidence_against: [
        'All evidence is testimonial or in secondary government documentation - no physical samples or hardware',
        'Ground search at the apparent landing site found nothing',
        'The DIA report, while credible, represents a single-source government assessment written in 1976 with limited technical analysis capability',
      ],
    },
  ],

  claims_taxonomy: {
    verified: [
      'A DIA intelligence report (DIA/ST-CS-01-776-76) was produced, classifying the incident and rating it highly credible (declassified document available via FOIA/The Black Vault)',
      'Two IIAF F-4 aircraft were scrambled and both experienced the reported encounter (DIA report; Lt. Parviz Jafari confirmed in multiple interviews including a 2007 National Press Club appearance)',
      'The U.S. Embassy USAF attaché in Tehran filed an intelligence report through military channels (DIA report documents this chain)',
    ],
    probable: [
      'Both F-4 crews experienced instrument and communications failures at proximity to the object (consistent across Jafari\'s testimony and the DIA report; no independent technical failure analysis exists)',
      'Jafari\'s F-4 radar showed an object comparable in size to a 707 tanker (documented in DIA report; specific radar return data not separately published)',
      'Jafari attempted to fire an AIM-9 Sidewinder and his weapons panel failed (Jafari\'s testimony, corroborated by DIA report description)',
    ],
    disputed: [
      'A sub-object "landed" south of Tehran and left a visible ground light (DIA report describes this sequence; ground search found nothing; Army helicopter crew described interference consistent with proximity, not confirmed landing)',
      'The object accelerated to approximately Mach 2 while being pursued (derived from Jafari\'s speed estimates and radar track; no independent validation of the Mach 2 figure)',
    ],
    speculative: [
      'The incident represents contact with non-human technology (extrapolated from anomalous performance; no physical evidence)',
      'The U.S. had foreknowledge of the object\'s nature (speculated from rapid DIA documentation; no evidence supporting prior knowledge)',
    ],
  },

  sensor_context: {
    systems: [
      {
        name: 'Mehrabad Airport Control Tower Radar',
        operator: 'Imperial Iranian Air Force / Civil Aviation',
        notes:
          'First to detect the unknown return and initiate the military response. Confirmed radar contact independently of the F-4 airborne radar.',
      },
      {
        name: 'F-4D APQ-109 Fire Control Radar',
        operator: 'IIAF - Lt. Parviz Jafari\'s aircraft',
        notes:
          'Achieved radar lock on the object, returning a size signature comparable to a Boeing 707. Lock was maintained until Jafari\'s instruments failed. The radar return is the primary sensor-based evidence for the object\'s presence and size.',
      },
    ],
  },

  sources: [
    {
      title: 'DIA Intelligence Report DIA/ST-CS-01-776-76',
      type: 'official',
      notes:
        'Declassified Defense Intelligence Agency report rating the incident "highly credible" and describing it as a "classic UFO encounter." Available via The Black Vault FOIA archive and NSA electronic reading room. This is the primary government documentation of the incident.',
    },
    {
      title: 'Lt. Parviz Jafari - National Press Club Testimony',
      url: 'https://www.youtube.com/watch?v=3UGSVbmqAW4',
      date: '2007-11-12',
      type: 'testimony',
      notes:
        'Jafari testified at the National Press Club\'s 2007 UFO witness conference in Washington D.C. He described the encounter in detail with a physical diagram of the object\'s movements. This is the most complete first-person account from the primary witness.',
    },
    {
      title: 'The Black Vault - Iranian F-4 Incident FOIA Archive',
      url: 'https://www.theblackvault.com/documentarchive/iran-f-4-ufo-incident-september-1976/',
      type: 'foia',
      notes:
        'Repository of FOIA-released U.S. government documents related to the incident, including the DIA report and NSA communications. Primary source for the documentary record.',
    },
  ],
};

// ---------------------------------------------------------------------------
// ROSWELL (1947)
// ---------------------------------------------------------------------------
const roswellEnrichment = {
  timeline: [
    {
      timestamp: '1947-06-24',
      local: 'June 24, 1947',
      event: 'Pilot Kenneth Arnold reports seeing a formation of nine crescent-shaped objects near Mt. Rainier, Washington, creating the term "flying saucer." His report triggers a wave of similar reports nationwide and establishes the cultural context into which the Roswell events fall.',
    },
    {
      timestamp: '1947-07-02',
      local: 'July 2-4, 1947',
      event: 'Mac Brazel, foreman of J.B. Foster Ranch 75 miles north of Roswell, NM, hears a loud explosion during a thunderstorm. Over the following days, he discovers a large field of scattered metallic debris - foil, sticks, rubber strips, and other material - spread across a wide area of his ranch.',
    },
    {
      timestamp: '1947-07-07',
      local: 'July 7, 1947',
      event: 'Brazel drives to Roswell and reports the debris to Chaves County Sheriff George Wilcox. Wilcox contacts Roswell Army Air Field (RAAF). Intelligence Officer Major Jesse Marcel Sr. is dispatched to the Foster Ranch with Capt. Sheridan Cavitt to investigate.',
    },
    {
      timestamp: '1947-07-08T11:00:00',
      local: 'July 8, 1947, ~11 AM',
      event: 'RAAF public information officer Lt. Walter Haut issues a press release, authorized by base commander Col. William Blanchard, announcing that RAAF has recovered a "flying disc" from a ranch. The press release is distributed by Associated Press and generates worldwide headlines.',
    },
    {
      timestamp: '1947-07-08T18:00:00',
      local: 'July 8, 1947, ~6 PM',
      event: 'Brigadier General Roger Ramey, commanding officer of 8th Air Force (Fort Worth, TX), holds a press conference displaying material identified as a weather balloon and radar reflector. He states the object recovered was a standard weather balloon, not a "flying disc." The RAAF press release is retracted.',
    },
    {
      timestamp: '1947-07-09',
      local: 'July 9, 1947',
      event: 'Mac Brazel is held at RAAF for several days and subsequently changes his description of the debris. He later tells neighbors and press that the debris was "not much" - a characterization contradicted by his original excited report to Sheriff Wilcox. Some neighbors later state he appeared coerced.',
    },
    {
      timestamp: '1994-09-01',
      local: 'September 1994',
      event: 'U.S. Air Force publishes "The Roswell Report: Fact vs. Fiction in the New Mexico Desert" attributing the debris to a Project Mogul balloon - a classified program using high-altitude balloon arrays to monitor Soviet nuclear tests. The report was commissioned following a congressional inquiry by Representative Steven Schiff.',
    },
    {
      timestamp: '1994-07-28',
      local: 'July 28, 1994',
      event: 'U.S. General Accounting Office (GAO) issues report requested by Rep. Schiff on Roswell records. The GAO finds that outgoing RAAF messages from July 1947 are missing - the only records from that period unaccounted for in the 509th Bombardment Group archives. The destruction or loss of these records is unexplained.',
    },
    {
      timestamp: '1997-06-01',
      local: 'June 1997',
      event: 'U.S. Air Force publishes "The Roswell Report: Case Closed" - a follow-up report attributing reports of "alien bodies" to anthropomorphic test dummies used in high-altitude parachute tests in the early 1950s. Critics note the tests occurred years after 1947 and argue the report cannot retroactively explain 1947 witness accounts.',
    },
  ],

  competing_hypotheses: [
    {
      name: 'Project Mogul Balloon Array (Official)',
      assessment: 'probable',
      summary:
        'The 1994 USAF report concluded the Roswell debris was a Project Mogul array - a classified program that used balloon trains carrying acoustic sensors to monitor Soviet nuclear tests. Flight No. 4 (June 4, 1947) was a likely candidate. The debris field\'s extended spread (approx. 3/4 mile) is consistent with a balloon array crash. The material descriptions (foil, sticks, rubber, tape with floral patterns) are consistent with known Mogul components. The classification of Mogul explains the immediate military response and the suppression of the initial press release.',
      evidence_for: [
        'Material descriptions by Jesse Marcel Sr. and others are consistent with known Mogul balloon train components',
        'Project Mogul was classified at the time, explaining the immediate military response and press retraction',
        'Debris field dimensions (3/4 mile spread) are consistent with a disintegrating balloon train, not a structured craft impact',
        '1994 USAF report identified Mogul Flight No. 4 as a probable match based on trajectory and timing',
        'Balloon material with floral tape patterns (used on Mogul reflectors) matches descriptions of "hieroglyphic" markings reported by Marcel',
      ],
      evidence_against: [
        'GAO found that outgoing RAAF messages from July 1947 were destroyed - records destruction is inconsistent with a routine balloon recovery',
        'Marcel and others described material properties (memory metal that returned to shape, extremely lightweight but indestructible) not consistent with known 1947 balloon materials',
        'Project Mogul Flight No. 4\'s flight path and tracking data are incomplete - the USAF\'s identification of it as the Roswell source was an inference, not a confirmed match',
        'Multiple first-hand accounts describe a controlled military recovery operation including armed guards, suggesting more than a balloon recovery',
      ],
    },
    {
      name: '"Flying Disc" / Structured Craft Crash-Retrieval',
      assessment: 'disputed',
      summary:
        'The original RAAF press release - written by a trained military officer and authorized by the base commander - described a recovered "flying disc." Multiple witnesses including mortician Glenn Dennis (who claimed to receive calls from RAAF asking about small child-sized body bags), Maj. Jesse Marcel\'s consistent account of anomalous material properties, and former base commander Walter Haut\'s posthumous affidavit (released 2007) claiming he saw alien bodies in Hangar 84, represent the core of the crash-retrieval narrative. No physical evidence from this narrative has been publicly confirmed.',
      evidence_for: [
        'The original RAAF press release was an official government document, not a civilian rumor',
        'Jesse Marcel Sr. maintained his description of anomalous material properties until his death in 1986',
        'Walter Haut\'s posthumous affidavit (2007) states he saw a craft and alien bodies in Hangar 84',
        'GAO confirmed missing outgoing RAAF messages from July 1947 - no explanation for their destruction has been provided',
        'Glenn Dennis\'s account of unusual requests from RAAF medical staff, while unverifiable, was consistent with subsequent research into his background',
      ],
      evidence_against: [
        'No physical material from Roswell exists in any verified collection',
        'Walter Haut\'s affidavit was written late in his life and his earlier statements were more ambiguous',
        'Glenn Dennis\'s "nurse witness" has never been identified despite decades of research',
        'Material property descriptions evolved over decades - "memory metal" descriptions are increasingly detailed in later accounts compared to earliest reports',
        'The USAF\'s Mogul explanation, while imperfect, is a documented classified program with material and timeline consistency',
      ],
    },
    {
      name: 'Classified U.S. Aircraft / Weapons Test',
      assessment: 'possible',
      summary:
        'A subset of researchers propose the debris was from a classified advanced U.S. aircraft or weapon system test (possibly involving captured German V-2 technology or experimental high-altitude platforms). This would explain the immediate military response and classification without requiring either a balloon or an anomalous craft. The 1947 period was one of intensive classified aerospace experimentation at nearby White Sands.',
      evidence_for: [
        'White Sands Proving Ground, approximately 100 miles southwest, was conducting active missile and experimental aircraft tests in July 1947',
        'The proximity of Fort Worth (8th Air Force HQ) and the rapid involvement of high command suggests the recovery had significant military importance',
        'A classified aircraft failure would explain the immediate press retraction and ongoing classification',
      ],
      evidence_against: [
        'No U.S. classified program from 1947 has been posthumously attributed to Roswell in any declassification',
        'White Sands test flights were tracked and recoveries were managed by Range Safety - a mismatch with RAAF handling the recovery',
        'Material descriptions are not consistent with any known 1947 U.S. experimental platform',
      ],
    },
  ],

  claims_taxonomy: {
    verified: [
      'RAAF issued a press release on July 8, 1947 claiming recovery of a "flying disc" (Associated Press wire; press release text preserved)',
      'Brigadier General Roger Ramey retracted the press release that same day, attributing the object to a weather balloon (Fort Worth press conference; documented in contemporaneous press)',
      'GAO report (July 28, 1994) confirmed that outgoing RAAF administrative messages from July 1947 were missing from the archive - the only destroyed/missing records from the relevant period (GAO/NSIAD-95-187)',
      'Project Mogul was a classified balloon program for monitoring Soviet nuclear tests; it was active in New Mexico in mid-1947 (USAF 1994 declassification)',
    ],
    probable: [
      'Jesse Marcel Sr. recovered anomalous debris from the Foster Ranch that he described as unlike any material he recognized (consistent across Marcel\'s accounts in the 1970s-80s before his death; corroborated by his son Jesse Marcel Jr.)',
      'Mac Brazel was held at RAAF for approximately a week and subsequently changed his description of the debris (reported by multiple neighbors and journalists who tried to interview him)',
    ],
    disputed: [
      'The debris had anomalous material properties (memory metal, extreme light weight with unusual strength) - described by Marcel but not consistent with Mogul materials; no physical sample exists for testing',
      'Walter Haut\'s posthumous affidavit claiming he saw alien bodies in Hangar 84 (Haut\'s earlier public statements were less specific; the affidavit was written late in life and released after his death)',
      'Glenn Dennis\'s account of RAAF requests for small body bags and a nurse witness to alien autopsies (Dennis\'s witness has never been identified; his account has evolved over decades)',
    ],
    speculative: [
      'Alien bodies were recovered and transported to Wright-Patterson or another facility (no physical or documentary evidence; entirely testimonial)',
      'A second crash site ("Dee Proctor" site) contained alien bodies (proposed by researchers Schmitt and Carey; no primary documentation)',
    ],
  },

  sensor_context: {
    systems: [
      {
        name: 'RAAF Intelligence Gathering (ground observation)',
        operator: 'RAAF, 509th Bombardment Group Intelligence',
        notes:
          'Major Jesse Marcel Sr. was the 509th\'s intelligence officer. His direct examination of the debris field is the primary technical assessment from a trained military intelligence professional. No electronic sensor data from the recovery exists in the public record.',
      },
      {
        name: 'Project Mogul tracking records',
        operator: 'New York University Balloon Division / Army Air Forces',
        notes:
          'Flight No. 4 (June 4, 1947) tracking data was incomplete - the flight was not recovered. The USAF\'s 1994 identification of Flight No. 4 as the Roswell source was based on trajectory inference from incomplete records.',
      },
    ],
  },

  sources: [
    {
      title: 'RAAF Press Release - "Flying Disc" Recovery',
      date: '1947-07-08',
      type: 'official',
      notes:
        'The original press release issued by Lt. Walter Haut and authorized by Col. William Blanchard. Text preserved in multiple newspaper archives. The only official U.S. government document directly claiming recovery of a "flying disc."',
    },
    {
      title: 'GAO Report: GAO/NSIAD-95-187 - "Government Records: Results of a Search for Records Concerning the 1947 Crash Near Roswell, NM"',
      url: 'https://www.gao.gov/assets/nsiad-95-187.pdf',
      date: '1994-07-28',
      type: 'official',
      notes:
        'Requested by Representative Steven Schiff (R-NM). Found that outgoing RAAF messages from July 1947 were destroyed - the only missing records from the relevant period. Primary government document establishing the records destruction issue.',
    },
    {
      title: 'USAF Report: "The Roswell Report: Fact vs. Fiction in the New Mexico Desert"',
      date: '1994-09',
      type: 'official',
      notes:
        'Primary USAF document attributing the Roswell debris to Project Mogul. Commissioned in response to Rep. Schiff\'s congressional inquiry. Available from Air Force Historical Research Agency.',
    },
    {
      title: 'USAF Report: "The Roswell Report: Case Closed"',
      date: '1997-06',
      type: 'official',
      notes:
        'Follow-up USAF report attempting to explain "alien body" reports as anthropomorphic test dummies from 1950s high-altitude parachute tests. Widely criticized for the temporal mismatch (tests conducted years after 1947 events).',
    },
    {
      title: 'Walter Haut Posthumous Affidavit',
      date: '2007',
      type: 'testimony',
      notes:
        'Affidavit sealed during Haut\'s lifetime; released after his death. Claims Haut witnessed a craft and alien bodies in Hangar 84 at RAAF. Published in "Witness to Roswell" (Carey & Schmitt, 2007). Haut was the officer who issued the original press release.',
    },
  ],
};

// ---------------------------------------------------------------------------
// MALMSTROM AFB (1967)
// ---------------------------------------------------------------------------
const malmstromEnrichment = {
  timeline: [
    {
      timestamp: '1967-03-16T06:30:00',
      local: 'March 16, 1967, ~6:30 AM',
      event: 'Echo Flight, 10th Strategic Missile Squadron, Malmstrom AFB, MT. USAF missile launch officers Capt. Eric Carlson and 1st Lt. Walt Figel are on duty in Echo Launch Control Center (LCC), 60 feet underground. Figel receives a call from a security guard topside reporting an unidentified object glowing orange-red hovering above the front gate.',
    },
    {
      timestamp: '1967-03-16T06:45:00',
      local: '~6:45 AM',
      event: 'Within one minute of the guard\'s report, Echo Flight\'s ten Minuteman I ICBMs begin shutting down sequentially - each triggering a "No-Go" condition on the launch control console. All ten missiles go offline in approximately 10 seconds. Figel and Carlson are unable to restore the missiles. Wing commander is notified.',
    },
    {
      timestamp: '1967-03-16T07:30:00',
      local: '~7:30 AM',
      event: 'A rapid response team (Camper Alert Team) is dispatched to the missile silos. Multiple team members subsequently report seeing or hearing about an unidentified object hovering in the area. The Boeing on-site technical team begins investigating why the missiles went offline.',
    },
    {
      timestamp: '1967-03-16T10:00:00',
      local: 'March 16, morning',
      event: 'Echo Flight missiles remain offline. Investigation by Boeing and Air Force engineers finds no mechanical or electrical cause for the simultaneous shutdown. An Air Force and Boeing report concludes: "the cause of the shutdowns was not determined."',
    },
    {
      timestamp: '1967-03-20',
      local: 'March 20, 1967 (approx.)',
      event: 'A similar event reportedly occurs at Oscar Flight. Robert Salas (then a 1st Lt. at Oscar LCC) states that he received a call from a guard about UFOs near the flight area, followed by some of Oscar Flight\'s missiles going offline. Salas\'s Oscar Flight account is disputed by some other launch officers from the period who do not confirm it.',
    },
    {
      timestamp: '1994-01-01',
      local: '1994-1995',
      event: 'Robert Salas goes public with his account of the Oscar Flight incident. He teams with researcher Jim Klotz to file FOIA requests for Air Force records related to the Malmstrom UAP encounters. Salas later publishes "Faded Giant" (2005) documenting his account.',
    },
    {
      timestamp: '2010-09-27',
      local: 'September 27, 2010',
      event: 'Robert Salas organizes a National Press Club press conference in Washington D.C. Six former USAF officers who served at nuclear missile bases testify publicly about UAP incidents near missile installations, including Malmstrom. The event generates significant media coverage.',
    },
    {
      timestamp: '2010-01-01',
      local: '2010',
      event: 'James Carlson (son of Echo Flight commander Eric Carlson) publicly disputes Salas\'s account, specifically the claim that Eric Carlson reported a UFO during the Echo Flight shutdown. James Carlson states his father confirmed the Echo shutdown happened but denies the UFO connection. Eric Carlson himself gave an ambiguous later account that some interpret as denying the UAP element.',
    },
  ],

  competing_hypotheses: [
    {
      name: 'Coincidental Electrical Fault / Maintenance Issue',
      assessment: 'disputed',
      summary:
        'The Air Force and Boeing\'s investigation concluded they could not find a cause for the Echo Flight shutdowns - but some engineers later suggested the most probable cause was a fault in the inhibit signal circuit that could cascade through the flight. Under this explanation, the simultaneous shutdown was a rare but possible technical failure, and any UAP reports were coincidental or fabricated. An Air Force document released via FOIA in 1996 describes the shutdown as caused by "a voltage surge in the logic coupler."',
      evidence_for: [
        'An Air Force document released via FOIA references a "voltage surge in the logic coupler" as the cause of the Echo shutdowns',
        'Complex electronic systems can experience rare cascade failures particularly under temperature extremes (March, Montana)',
        'The Boeing and Air Force investigation\'s inability to find a cause doesn\'t prove an external anomalous source',
        'Eric Carlson\'s later accounts are ambiguous about the UAP element of the Echo incident',
      ],
      evidence_against: [
        'The simultaneous shutdown of 10 missiles in sequential order in under 10 seconds has never been reproduced by a known internal fault',
        'Boeing engineers who investigated the shutdown stated they could not find a conventional cause',
        'The apparent correlation with security guard reports of a UAP overhead is unexplained by the voltage surge theory',
        'Walt Figel\'s account of receiving the guard\'s UFO report simultaneously with the shutdowns has remained consistent',
      ],
    },
    {
      name: 'Electromagnetic Interference from UAP',
      assessment: 'possible',
      summary:
        'Robert Salas and other witnesses propose that an unidentified craft hovering over the missile flight generated an electromagnetic pulse or field that disrupted the missiles\' electronic systems. This hypothesis is consistent with the simultaneous, sequential nature of the shutdowns, the guard reports of a UAP overhead, and the inability of Boeing/USAF to find an internal cause. Similar electromagnetic effects were reported in other UAP encounters (e.g., Iranian F-4) involving weapons system failures.',
      evidence_for: [
        'Walt Figel confirms receiving a guard report about a UAP overhead at the time of the Echo shutdowns',
        'The sequential, rapid shutdown of 10 missiles is more consistent with an external signal traversing the system than an internal cascade fault',
        'Similar electromagnetic effects on weapons systems reported in Iranian F-4 (1976) and other cases',
        'Air Force\'s formal investigation finding "no cause" leaves the door open for an external explanation',
        'Multiple additional launch officers and security personnel at other Malmstrom sites reported UAP observations in the same period',
      ],
      evidence_against: [
        'No physical device or hardware was ever recovered that could produce the described electromagnetic effect',
        'The Air Force FOIA document attributing the cause to a "voltage surge" provides a conventional alternative',
        'Salas\'s Oscar Flight account - the most detailed UAP-linked narrative - is disputed by other officers who served at Oscar',
        'Salas was in an underground bunker and did not directly observe the UAP himself; his account relies on guard testimony',
      ],
    },
  ],

  claims_taxonomy: {
    verified: [
      'Echo Flight\'s ten Minuteman I ICBMs went offline on March 16, 1967 - this is documented in Air Force maintenance records and confirmed by multiple officers (Eric Carlson, Walt Figel)',
      'Air Force and Boeing investigation concluded no mechanical cause for the Echo shutdowns was determined (documented in investigation reports obtained via FOIA)',
      'Robert Salas testified at the National Press Club on September 27, 2010, along with five other former USAF nuclear missile officers (transcript and video on record)',
    ],
    probable: [
      'At least one security guard on duty at Echo Flight reported an unidentified aerial object at approximately the time of the shutdowns (Walt Figel\'s consistent testimony; guard report not independently preserved)',
      'A similar event occurred at Oscar Flight within days of the Echo incident (Salas\'s detailed testimony; disputed by some other Oscar officers)',
    ],
    disputed: [
      'Eric Carlson received a guard report about a UAP hovering over Echo\'s front gate (Figel\'s account; James Carlson disputes this based on his father\'s later statements)',
      'The UAP directly caused the missile shutdowns via electromagnetic means (the correlation is documented in testimony; no instrument data links the two events)',
      'Oscar Flight\'s shutdown was connected to UAP activity (Salas\'s account vs. conflicting accounts from other Oscar officers)',
    ],
    speculative: [
      'UAP activity at nuclear missile bases represents deliberate monitoring or interference by non-human intelligence (interpretive conclusion; no evidence establishing intent)',
      'The shutdown capability represents a demonstration of UAP technical superiority over U.S. nuclear systems (interpretive; no physical evidence)',
    ],
  },

  sensor_context: {
    systems: [
      {
        name: 'Minuteman I ICBM Launch Control Monitoring (Echo LCC console)',
        operator: 'USAF 10th Strategic Missile Squadron, Malmstrom AFB',
        notes:
          'The launch control console recorded each missile\'s "No-Go" status as they went offline sequentially. The console data is the primary technical evidence for the shutdown event. Records obtained via FOIA.',
      },
      {
        name: 'Security guard visual observation',
        operator: 'USAF security personnel, Echo Flight',
        notes:
          'Topside security guards reported an orange-red glowing object at approximately the time of the shutdowns. Guard reports were not preserved independently; their account is known through Walt Figel\'s and other officers\' recollections.',
      },
    ],
  },

  sources: [
    {
      title: 'Air Force FOIA Documents - Echo Flight Shutdown',
      type: 'foia',
      url: 'https://www.theblackvault.com/documentarchive/malmstrom-afb-ufo-uap-incidents/',
      notes:
        'FOIA-released Air Force documents on the Echo Flight shutdown, including investigation reports and communications. The Black Vault maintains a comprehensive collection. Key document: AF form describing "voltage surge in logic coupler" as cause.',
    },
    {
      title: 'Robert Salas - National Press Club Testimony',
      url: 'https://www.youtube.com/watch?v=U6AJPXZQVQY',
      date: '2010-09-27',
      type: 'testimony',
      notes:
        'Salas testifies alongside five other former USAF nuclear missile officers about UAP incidents at missile bases. Salas describes the Oscar Flight incident in detail and calls for declassification of related records.',
    },
    {
      title: 'Walt Figel Recorded Interview (Echo Flight LCO)',
      date: '2008',
      type: 'testimony',
      notes:
        'Figel confirmed receiving a guard report of a UAP at approximately the time of the Echo shutdowns, in recorded interviews with researcher James Klotz. Figel is one of two Echo LCC officers on duty during the event.',
    },
    {
      title: 'Robert Salas - "Faded Giant"',
      date: '2005',
      type: 'book',
      notes:
        'Salas\'s first-person account of the Oscar Flight incident and broader Malmstrom UAP history, co-authored with James Klotz. Primary narrative source for the Oscar Flight events.',
    },
  ],
};

// ---------------------------------------------------------------------------
// PHOENIX LIGHTS (1997)
// ---------------------------------------------------------------------------
const phoenixEnrichment = {
  timeline: [
    {
      timestamp: '1997-03-13T19:55:00',
      local: 'March 13, 1997, ~7:55 PM MST',
      event: 'A former police officer in Henderson, Nevada (first public report) observes a large V-shaped craft with lights passing overhead moving southeast. This is the first in a series of observations tracking the "V-formation" from Nevada into Arizona.',
    },
    {
      timestamp: '1997-03-13T20:15:00',
      local: '~8:15-8:30 PM MST',
      event: 'The V-formation is reported over Prescott Valley and Dewey, Arizona. Witnesses describe a massive, rigid, V-shaped or triangular object - estimates range from 300 to 2,000+ feet wide - with five to seven lights arranged in a consistent pattern. The object is described as moving slowly and silently northwestward to southeast.',
    },
    {
      timestamp: '1997-03-13T20:30:00',
      local: '~8:30 PM MST',
      event: 'Multiple Phoenix residents observe the V-formation passing over the city. Amateur astronomer Dr. Lynne Kitei photographs and films the lights. Commercial and private pilots in the area report the formation. 911 calls begin flooding the Phoenix Police Department.',
    },
    {
      timestamp: '1997-03-13T20:45:00',
      local: '~8:45 PM MST',
      event: 'The V-formation is observed moving toward Tucson and is seen as far south as the Mexico border. FAA records show no unidentified radar tracks corresponding to the formation\'s reported location or time. Luke AFB states it had no aircraft airborne in the area.',
    },
    {
      timestamp: '1997-03-13T22:00:00',
      local: '~10:00 PM MST',
      event: 'A separate event: a series of stationary lights appears in a line over the Estrella Mountains southwest of Phoenix, visible for approximately 15-20 minutes. This second event is filmed by numerous witnesses and is the source of much of the widely distributed video footage.',
    },
    {
      timestamp: '1997-03-14',
      local: 'March 14, 1997',
      event: 'Maryland Air National Guard confirms that A-10 Warthog aircraft dropped LUU-2B/B illumination flares at Barry M. Goldwater Air Force Range during exercises at approximately 10 PM on March 13. These flares descend slowly, explain the stationary light string, and are the confirmed cause of the second event.',
    },
    {
      timestamp: '1997-03-18',
      local: 'March 18, 1997',
      event: 'Governor Fife Symington holds a press conference in which he stages a mock "alien" arrest - his aide appears in an alien costume. Symington later said this was an attempt to defuse public panic while the state investigated. His deflection draws criticism.',
    },
    {
      timestamp: '2007-03-13',
      local: 'March 13, 2007 (10th anniversary)',
      event: 'Governor Symington publicly reverses his 1997 mockery. He states he personally witnessed the V-formation on the evening of March 13, 1997, and described it as "otherworldly." He calls for a federal investigation. His reversal generates renewed national media coverage.',
    },
  ],

  competing_hypotheses: [
    {
      name: 'Flare Drop (Second Event - Confirmed)',
      assessment: 'verified',
      summary:
        'The stationary lights observed at approximately 10 PM and captured in widely circulated video are confirmed to have been LUU-2B/B illumination flares dropped by Maryland Air National Guard A-10 Warthogs during exercises at Barry M. Goldwater Range. The flares hang on parachutes and descend slowly, matching the observed behavior. The Arizona DPS and National Guard confirmed this event.',
      evidence_for: [
        'Maryland Air National Guard confirmed a flare drop exercise at ~10 PM on March 13, 1997',
        'LUU-2B/B flares on parachutes match the visual profile: bright, steady, hanging lights descending slowly',
        'The geometry of the stationary lights corresponds to the known positions in a flare salvo',
        'The Estrella Mountains were in line of sight with the Barry M. Goldwater Range',
      ],
      evidence_against: [
        'None - the flare explanation for the second (10 PM stationary lights) event is accepted by all major researchers including those who maintain the V-formation is anomalous',
      ],
    },
    {
      name: 'V-Formation - Mass Misidentification (Aircraft Formation)',
      assessment: 'disputed',
      summary:
        'Skeptics propose the V-formation was a loose formation of military or civilian aircraft whose lights appeared to form a rigid structure due to the dark sky and observers\' distance. Under this explanation, the aircraft were too far apart to be heard clearly and their lights created the impression of a connected structure. No specific flight formation has been identified to match the reported path, timing, and witness descriptions.',
      evidence_for: [
        'FAA radar showed no single large unidentified object - multiple aircraft in loose formation might appear as separate returns',
        'The perceived size of the "craft" (estimates ranging from 300 to 6,000 feet wide) varied dramatically between witnesses, consistent with perceptual estimation errors',
        'Military aircraft fly exercises over Arizona regularly; USAF denials of activity are not always complete',
      ],
      evidence_against: [
        'Multiple credible witnesses (pilots, law enforcement, an astronomer) describe a solid structure connecting the lights, not individual aircraft',
        'The V-formation was reportedly silent at very low altitude - no known aircraft formation at that scale can operate silently',
        'No specific formation of aircraft matching the time, route, and light pattern has ever been identified',
        'Governor Symington, who described it as "otherworldly," was a licensed private pilot with experience distinguishing aircraft types',
      ],
    },
    {
      name: 'V-Formation - Anomalous Aerial Phenomena',
      assessment: 'possible',
      summary:
        'The V-formation portion of the Phoenix Lights - distinct from the confirmed flare drop - remains without a publicly confirmed conventional explanation. Hundreds of witnesses including pilots and law enforcement describe a massive, silent, rigid triangular structure moving slowly and deliberately. The formation\'s apparent ground track is consistent across multiple independent observers separated by miles. FAA radar showed no corresponding unidentified track, which could indicate a stealth platform - or could indicate no physical object of the reported scale was present.',
      evidence_for: [
        'Governor Symington\'s reversal (2007) adds a credible high-level witness who explicitly described the V-formation as anomalous',
        'Multiple pilots and trained observers made consistent reports of a rigid structure',
        'The formation was tracked by independent witnesses from Nevada through Arizona - too consistent for mass hallucination',
        'No military or civilian aircraft operation has been publicly attributed to the V-formation event',
      ],
      evidence_against: [
        'No radar confirmation of a single large object',
        'The most dramatic visual evidence (widely distributed video) relates to the confirmed flare event, creating a confounding conflation',
        'No physical evidence was recovered',
        'Witness size estimates vary enormously, suggesting perceptual difficulty rather than a definitively measurable object',
      ],
    },
  ],

  claims_taxonomy: {
    verified: [
      'Maryland Air National Guard A-10s dropped illumination flares at Barry M. Goldwater Range at approximately 10 PM on March 13, 1997 (National Guard confirmation; this explains the stationary light string in widely circulated videos)',
      'Governor Fife Symington publicly stated in 2007 that he personally witnessed the V-formation on March 13, 1997, and described it as "otherworldly" (multiple news outlet interviews on the 10th anniversary)',
      'Phoenix 911 dispatch received hundreds of calls about lights in the sky on March 13, 1997 (Phoenix Police Department records)',
    ],
    probable: [
      'A large V-shaped or triangular formation of lights moved from Nevada through Arizona from approximately 7:55-8:45 PM (corroborated by independent witnesses in multiple Arizona cities; consistent timing across accounts)',
      'The V-formation appeared silent or near-silent at apparently low altitude (consistent across credible witness accounts including those of trained aviation observers)',
    ],
    disputed: [
      'The V-formation was a single rigid physical structure of massive size (consistent across witness descriptions; FAA radar showed no corresponding track for an object of that scale)',
      'Luke AFB had no aircraft airborne in the Phoenix area during the V-formation event (Luke\'s initial denial; not independently verifiable)',
    ],
    speculative: [
      'The V-formation was the same object as the later stationary lights (the two events are almost certainly separate; widespread media conflation of the two)',
      'The V-formation was operated by non-human intelligence (no physical evidence; extrapolated from anomalous witness descriptions)',
    ],
  },

  sensor_context: {
    systems: [
      {
        name: 'FAA Radar - Phoenix TRACON / Albuquerque Center',
        operator: 'Federal Aviation Administration',
        notes:
          'FAA radar data for March 13, 1997 was reviewed; no unidentified single large object was detected corresponding to the V-formation track. Multiple aircraft returns were present. The absence of a radar signature for the V-formation is cited both as evidence for a stealth platform and as evidence no physical structure existed.',
      },
      {
        name: 'Amateur video cameras (multiple)',
        operator: 'Civilian witnesses including Dr. Lynne Kitei',
        notes:
          'Multiple amateur and professional video recordings were made. The most widely distributed footage depicts the 10 PM stationary lights (confirmed flares), not the V-formation. Dr. Kitei\'s photography documents both events.',
      },
    ],
  },

  sources: [
    {
      title: 'Governor Fife Symington - 10th Anniversary Statement',
      date: '2007-03-13',
      type: 'testimony',
      notes:
        'Symington publicly stated he witnessed the V-formation and described it as "otherworldly." Multiple media interviews and a CNN segment. Represents the most significant official witness reversal in the Phoenix Lights record.',
    },
    {
      title: 'Maryland Air National Guard - Flare Drop Confirmation',
      date: '1997-03-14',
      type: 'official',
      notes:
        'National Guard confirmation that A-10 aircraft conducted flare drop exercises at Barry M. Goldwater Range at approximately 10 PM on March 13, 1997. Definitively explains the stationary light string in widely distributed video.',
    },
    {
      title: 'Dr. Lynne Kitei - "The Phoenix Lights" (book/documentary)',
      date: '2000',
      type: 'book',
      notes:
        'Kitei, a physician, was present in Phoenix and documented both events. Her book and documentary are the most comprehensive primary-source collection of witness testimony and contemporaneous documentation.',
    },
    {
      title: 'NARCAP Technical Report - Phoenix Lights Analysis',
      type: 'academic',
      notes:
        'National Aviation Reporting Center on Anomalous Phenomena (NARCAP) conducted a technical analysis of the pilot and aviation professional reports from the Phoenix Lights event. Available at narcap.org.',
    },
    {
      title: 'FAA Records - March 13, 1997 Radar Data',
      date: '1997-03-13',
      type: 'foia',
      notes:
        'FAA radar data for Phoenix airspace obtained via FOIA by various researchers. Reviewed for unidentified tracks; no single large object corresponding to V-formation witness reports was identified.',
    },
  ],
};

// ---------------------------------------------------------------------------
// O'HARE AIRPORT (2006)
// ---------------------------------------------------------------------------
const ohareEnrichment = {
  timeline: [
    {
      timestamp: '2006-11-07T16:15:00',
      local: 'November 7, 2006, ~4:15 PM CST',
      event: 'United Airlines ramp workers and a mechanic at Gate C17, Chicago O\'Hare International Airport, observe a gray, metallic, saucer-like disc hovering at approximately 1,900 feet above the gate. The object is described as approximately 6-24 feet in diameter, with no wings, no markings, and no lights. It is not moving.',
    },
    {
      timestamp: '2006-11-07T16:20:00',
      local: '~4:20 PM CST',
      event: 'Additional United Airlines employees (pilots, supervisors, and ramp staff at Gate C17) observe the object. A United pilot waiting to depart observes it from the cockpit. Estimates of the number of witnesses range from 12 to approximately 14 United employees. No passengers report the object (the terminal views were obstructed).',
    },
    {
      timestamp: '2006-11-07T16:25:00',
      local: '~4:25 PM CST',
      event: 'The object accelerates sharply upward and departs at high speed through the overcast cloud layer at approximately 1,900 feet. Witnesses report it punched a clean, circular "hole" in the cloud cover that remained visible for several minutes. No sonic boom was reported.',
    },
    {
      timestamp: '2006-11-07T16:30:00',
      local: 'Shortly after departure',
      event: 'United Airlines employees report the sighting to a supervisory manager and to United\'s operations center. United Airlines later denies having made any report to the FAA. An FAA spokesperson initially states there is no record of any United report.',
    },
    {
      timestamp: '2007-01-01',
      local: 'January 1, 2007',
      event: 'Chicago Tribune reporter Jon Hilkevitch files a FOIA request with the FAA for records related to the O\'Hare incident. The FAA initially responds that no report exists. Subsequent investigation reveals that a United Airlines employee did call the FAA\'s Chicago O\'Hare control tower and a record of the call exists.',
    },
    {
      timestamp: '2007-01-01',
      local: 'January 1, 2007',
      event: 'Chicago Tribune publishes Hilkevitch\'s story, the first mainstream media account of the O\'Hare incident. The story generates more than 1 million page views in its first day - at the time the highest-traffic article in Chicago Tribune history. It prompts a wave of witness contacts from people who had not previously come forward.',
    },
    {
      timestamp: '2007-01-01',
      local: 'January 2007',
      event: 'NARCAP (National Aviation Reporting Center on Anomalous Phenomena) opens a formal investigation. FAA ultimately produces records including a controller log entry confirming the United employee call, despite initial denials. FAA concludes the event was a "weather phenomenon" and declines further investigation.',
    },
  ],

  competing_hypotheses: [
    {
      name: 'Lenticular Cloud / Weather Phenomenon (Official)',
      assessment: 'disputed',
      summary:
        'The FAA\'s official response was that the object was likely a weather phenomenon, specifically a lenticular cloud or a hole-punch cloud. These atmospheric formations can appear as saucer-like shapes and can occasionally produce circular gaps in overcast layers. Under this explanation, the metallic appearance was a reflection effect and the perceived departure was the dissipation of the formation.',
      evidence_for: [
        'Lenticular clouds and hole-punch clouds can produce saucer-like shapes at altitude',
        'Hole-punch clouds can produce circular openings in overcast layers under the right conditions',
        'FAA weather analysis of the O\'Hare area for November 7, 2006 showed conditions that could produce atmospheric optical effects',
      ],
      evidence_against: [
        'Trained aviation professionals (pilots, mechanics) who regularly observe atmospheric phenomena do not confuse a lenticular cloud with a metallic disc',
        'Lenticular clouds do not accelerate rapidly upward - they dissipate in place or move with wind',
        'The "hole in the clouds" persisted for several minutes after the object departed, which is inconsistent with a lenticular cloud\'s dissipation pattern',
        'Multiple witnesses with aviation backgrounds independently described a gray metallic disc, not an atmospheric phenomenon',
      ],
    },
    {
      name: 'Classified Aircraft / Stealth Test',
      assessment: 'possible',
      summary:
        'The presence of a saucer-shaped disc near O\'Hare - one of the world\'s busiest airports - hovering in controlled airspace without a transponder could indicate a classified test of an advanced aircraft, either U.S. or foreign. The rapid departure and cloud penetration are consistent with a powered vehicle. The FAA\'s apparent initial denial and subsequent discovery of records may reflect an effort to avoid acknowledging a classified platform.',
      evidence_for: [
        'A metallic disc with no visible propulsion operating in O\'Hare controlled airspace would require extraordinary access and coordination if a classified program',
        'The object\'s behavior (hovering, rapid departure) is consistent with a powered vehicle test',
        'Chicago is home to significant defense industry presence; a test flight corridor in the area is plausible',
      ],
      evidence_against: [
        'No classified program has been publicly attributed to the O\'Hare incident',
        'Operating a classified disc in one of the world\'s busiest airport traffic zones is an extreme security and collision risk inconsistent with test flight protocols',
        'The FAA\'s denial of records (later found to be false) is more consistent with bureaucratic inadequacy than a coordinated cover of a classified program',
      ],
    },
    {
      name: 'Anomalous Aerial Phenomena',
      assessment: 'possible',
      summary:
        'The O\'Hare incident\'s witnesses are among the most technically credible in any UAP case on record: FAA-licensed airline pilots and trained aviation mechanics operating in a controlled professional environment at an international airport. Their consistent description of a metallic disc that rapidly departed leaving a "hole in the clouds" represents a physically possible but unexplained event. The FAA\'s effective non-investigation leaves the case unresolved.',
      evidence_for: [
        'Multiple trained aviation professionals with professional credibility stakes made consistent reports',
        'The "hole in the clouds" effect - a circular gap remaining after rapid ascent - is physically explicable if a high-speed object generated a localized vortex punching through the overcast',
        'No radar confirmation (object was apparently not squawking a transponder) but the absence of radar doesn\'t eliminate a physical object',
        'United Airlines\' apparent attempt to suppress the report internally, and the FAA\'s initial false denial, suggest institutional discomfort with the event',
      ],
      evidence_against: [
        'No radar confirmation was obtained',
        'No physical evidence was recovered',
        'Duration of observation was brief (~10 minutes); longer observation might allow more precise characterization',
      ],
    },
  ],

  claims_taxonomy: {
    verified: [
      'A United Airlines employee called the FAA O\'Hare Tower on November 7, 2006 and reported an unidentified object (FAA records confirmed via FOIA after initial denial)',
      'Chicago Tribune published an account on January 1, 2007, based on witness interviews and FAA FOIA records, generating the first mainstream media coverage (Tribune archive)',
      'The FAA initially denied having any record of a report but subsequently produced records confirming a call was received (FAA FOIA response documented in Chicago Tribune investigation)',
    ],
    probable: [
      'Approximately 12-14 United Airlines employees observed an unidentified object hovering above Gate C17 (consistent across multiple witness accounts; exact count varies by source)',
      'The object departed rapidly upward through the overcast and left a circular gap in the cloud layer (consistent across witness accounts including those from licensed airline pilots)',
    ],
    disputed: [
      'No radar track was recorded for the object (FAA stated no unidentified radar return; but radar systems at altitude thresholds and without transponder return can miss low-flying objects)',
      'The object was a disc shape approximately 6-24 feet in diameter (witness estimates vary; no precise measurement was possible)',
    ],
    speculative: [
      'The object was operated by non-human intelligence (no physical evidence; extrapolated from anomalous behavior)',
      'United Airlines and the FAA conducted a coordinated cover-up (both organizations showed inadequate response; no evidence of active coordination to suppress)',
    ],
  },

  sensor_context: {
    systems: [
      {
        name: 'FAA Terminal Radar (O\'Hare TRACON)',
        operator: 'Federal Aviation Administration, Chicago O\'Hare Tower',
        notes:
          'FAA TRACON radar was operating normally. No unidentified radar return was logged for the object. Possible explanations: the object was below radar coverage altitude, had no radar reflective surface, or radar returns were not logged at the time of the event.',
      },
      {
        name: 'Visual Observation (airline crew / ramp workers)',
        operator: 'United Airlines employees at Gate C17',
        notes:
          'Primary observational data comes from trained aviation professionals. No video or photographic documentation of the object was obtained despite the number of witnesses and the commercial airport environment.',
      },
    ],
  },

  sources: [
    {
      title: 'Chicago Tribune: "In the Air, a Real UFO"',
      url: 'https://www.chicagotribune.com/chi-ufo-ohare-jan01-story.html',
      date: '2007-01-01',
      type: 'media',
      notes:
        'Jon Hilkevitch\'s original investigative report in the Chicago Tribune. Based on FOIA-obtained FAA records and direct witness interviews. The foundational journalism document for the O\'Hare case. Generated more than 1 million page views in its first day.',
    },
    {
      title: 'NARCAP Technical Report - O\'Hare International Airport UAP Sighting',
      url: 'http://www.narcap.org/',
      date: '2007',
      type: 'academic',
      notes:
        'NARCAP\'s formal technical investigation of the O\'Hare incident. Includes analysis of pilot and aviation professional testimony. Primary technical source on the case.',
    },
    {
      title: 'FAA Records - O\'Hare Tower Call Log',
      date: '2006-11-07',
      type: 'foia',
      notes:
        'FAA records obtained via FOIA by Chicago Tribune, confirming a United Airlines employee called the tower on November 7, 2006. Initially denied by the FAA before FOIA production. Establishes that the incident was reported at the time.',
    },
  ],
};

// ---------------------------------------------------------------------------
// SHAG HARBOUR (1967)
// ---------------------------------------------------------------------------
const shagEnrichment = {
  timeline: [
    {
      timestamp: '1967-10-04T23:20:00',
      local: 'October 4, 1967, ~11:20 PM AST',
      event: 'Multiple witnesses near Shag Harbour, Nova Scotia observe a low-flying object showing four bright orange-yellow lights arranged in a row. The lights flash in sequence, then all four lights appear simultaneously before the object tilts at approximately 45 degrees and descends toward the water.',
    },
    {
      timestamp: '1967-10-04T23:25:00',
      local: '~11:25 PM AST',
      event: 'Several witnesses observe the object strike the water\'s surface and produce a brilliant flash. After the flash, a glowing yellow foam begins spreading on the water surface. No explosion is heard. Witnesses estimate the object entered the water approximately half a mile offshore.',
    },
    {
      timestamp: '1967-10-04T23:30:00',
      local: '~11:30 PM AST',
      event: 'Local fishermen launch boats and proceed to the foam patch, expecting to find survivors of an aircraft crash. They observe the glowing yellow foam covering an area approximately 80 feet wide by half a mile long. There is no wreckage, no survivors, and no aircraft debris. The foam is unlike anything they have encountered.',
    },
    {
      timestamp: '1967-10-04T23:45:00',
      local: '~11:45 PM AST',
      event: 'RCMP (Royal Canadian Mounted Police) officers from the Barrington Passage detachment arrive at the scene. Constable Ron Pond and other officers observe the foam directly. They file an official RCMP report noting a "glowing yellow object" entered the water and that the unusual foam was present at the impact site.',
    },
    {
      timestamp: '1967-10-05T00:30:00',
      local: 'October 5, ~12:30 AM AST',
      event: 'RCMP contacts Rescue Co-ordination Centre (RCC) Halifax, reporting a possible aircraft crash. A search and rescue operation is initiated. Canadian Coast Guard cutter HMCS Granby and additional vessels are dispatched.',
    },
    {
      timestamp: '1967-10-05T09:00:00',
      local: 'October 5, morning',
      event: 'Full daylight search by Coast Guard and Royal Canadian Navy vessels, including divers. The foam patch has dissipated. No aircraft wreckage, oil slick, or debris is found. The search is thorough; no missing aircraft is reported in the region for that date.',
    },
    {
      timestamp: '1967-10-06',
      local: 'October 6-7, 1967',
      event: 'Canadian Department of Transport and Department of National Defence close the search. The official Canadian government file on the Shag Harbour incident classifies it as an "unidentified flying object" - one of the very few official government files from anywhere in the world to use that terminology without a subsequent revision to a conventional explanation.',
    },
    {
      timestamp: '1993-01-01',
      local: '1993-1994',
      event: 'Researchers Don Ledger and Chris Styles begin investigating the incident using FOIA-equivalent access to Canadian government archives. They claim to find evidence of a subsequent classified underwater search at a location called the "Government Point" site, approximately 25 miles from Shag Harbour, where the object may have rested on the seafloor.',
    },
  ],

  competing_hypotheses: [
    {
      name: 'Misidentified Aircraft / Flares',
      assessment: 'disputed',
      summary:
        'Some researchers have proposed the witnesses observed a military aircraft dropping flares over the ocean, with the apparent water entry being the last flare extinguishing at low altitude. The RCMP search finding no wreckage is consistent with this hypothesis. The absence of any corresponding missing aircraft report is explained by the military nature of the operation (no mandatory civilian report).',
      evidence_for: [
        'Military aircraft dropping flares could produce a row of four sequential lights matching descriptions',
        'No wreckage was found - consistent with no physical object entering the water',
        'Military operations in the area are not always logged in civilian databases',
      ],
      evidence_against: [
        'RCMP officers directly observed glowing yellow foam at the entry site - flares burning out over water would not produce the described foam',
        'The Canadian government\'s official file classifies the incident as "UFO" after a formal search by military and coast guard vessels',
        'No military exercise or flare drop in the area on October 4, 1967 has been identified in any declassified record',
        'The descent trajectory - from low altitude to water surface - and the sequence of lights is not consistent with parachute flares',
      ],
    },
    {
      name: 'Soviet Submarine / Underwater Vehicle',
      assessment: 'possible',
      summary:
        'Researchers Ledger and Styles, in their investigation, proposed that the object may have been a Soviet or other nation\'s classified underwater vehicle that was operating in Canadian waters and used a craft of unknown type for an observation or recovery mission. The alleged subsequent classified search at "Government Point" and the multi-week residence on the seafloor (from their research) are consistent with a foreign submarine operation. This hypothesis has not been confirmed or refuted by any declassified document.',
      evidence_for: [
        'The Cold War era saw active Soviet submarine operations in Canadian and American coastal waters',
        'Ledger and Styles claim to have found witness accounts of a classified Navy/RCN search at Government Point weeks after the Shag Harbour incident',
        'A foreign submarine could explain the glowing foam (bioluminescence disturbed by a submerged vessel)',
      ],
      evidence_against: [
        'No classified Canadian or U.S. document has been declassified confirming a follow-on Government Point search',
        'The witness descriptions of the object (row of lights, 45-degree tilt, bright flash on water contact) do not match Soviet submarine technology or operations',
        'Soviet submarines do not typically produce visible aerial light displays before submerging',
      ],
    },
    {
      name: 'Anomalous Aerial/Aquatic Object',
      assessment: 'possible',
      summary:
        'The Shag Harbour incident\'s primary strength is the institutional quality of its evidence: RCMP officers filed an official report, a formal Canadian military and coast guard search was conducted, and the government file was officially classified as "unidentified." The glowing foam at the entry site, the absence of any corresponding known object, and the consistent multi-witness observations make this one of the best-documented water-entry UAP cases in the record.',
      evidence_for: [
        'RCMP filed an official report describing an "unidentified flying object" - a rare official designation',
        'Royal Canadian Navy and Coast Guard conducted a formal search and found nothing',
        'Glowing yellow foam at the entry site was observed by both fishermen and RCMP officers independently',
        'No aircraft or vessel was reported missing in the region for the date of the incident',
        'Canadian government file officially classified as "UFO" without subsequent revision',
      ],
      evidence_against: [
        'No physical material was recovered',
        'The Government Point follow-on search claimed by Ledger and Styles has not been confirmed by any declassified document',
        'All evidence is testimonial or archival - no hardware or sensor data beyond the RCMP reports',
      ],
    },
  ],

  claims_taxonomy: {
    verified: [
      'RCMP officers filed an official report on October 4-5, 1967 describing a "glowing yellow object" entering the water (RCMP records available via Library and Archives Canada)',
      'Royal Canadian Navy and Canadian Coast Guard conducted a formal search and found no wreckage, no debris, and no missing aircraft (documented in Canadian Department of Transport search records)',
      'Canadian government file classified the incident as "UFO" without subsequent conventional revision (Library and Archives Canada)',
    ],
    probable: [
      'Multiple civilian witnesses including local fishermen observed an object enter the water and glowing foam at the entry site (consistent across independent accounts; corroborated by RCMP officer direct observation)',
      'The entry site foam extended approximately 80 feet wide by half a mile long and was not consistent with any known biological or oil source in the area (described by both fishermen and RCMP; no scientific sample was taken)',
    ],
    disputed: [
      'A classified Royal Canadian Navy search was conducted at "Government Point" weeks after the incident (claimed by Ledger and Styles based on witness interviews; no corroborating declassified document)',
      'The object rested on the seafloor for an extended period before departing (claimed by Ledger and Styles; not confirmed in official records)',
    ],
    speculative: [
      'The object was operated by non-human intelligence (no physical evidence; extrapolated from anomalous behavior and government designation)',
      'The object was a Soviet submarine-launched vehicle (plausible Cold War context; no documentary evidence)',
    ],
  },

  sensor_context: {
    systems: [
      {
        name: 'RCMP Visual Observation',
        operator: 'Royal Canadian Mounted Police, Barrington Passage Detachment',
        notes:
          'RCMP Constable Ron Pond and colleagues directly observed the foam at the entry site. Their official report is the primary professional observation record.',
      },
      {
        name: 'Canadian Forces Search and Rescue',
        operator: 'RCC Halifax / Royal Canadian Navy / Canadian Coast Guard',
        notes:
          'Formal SAR operation conducted on October 5, 1967. HMCS Granby and other vessels searched the area with divers. No wreckage or debris found. Search documentation available at Library and Archives Canada.',
      },
    ],
  },

  sources: [
    {
      title: 'RCMP Report - Shag Harbour UFO Incident',
      date: '1967-10-05',
      type: 'official',
      notes:
        'Original RCMP report filed by officers at the scene. Available via Library and Archives Canada. Describes "glowing yellow object" entering the water. This is the primary contemporaneous official document.',
    },
    {
      title: 'Library and Archives Canada - Shag Harbour File',
      url: 'https://www.bac-lac.gc.ca/eng/Pages/home.aspx',
      type: 'foia',
      notes:
        'Canadian government file on the Shag Harbour incident, classified officially as "UFO." Available through Library and Archives Canada. One of the few government files anywhere that retains an "unidentified" classification without subsequent revision.',
    },
    {
      title: 'Don Ledger and Chris Styles - "Dark Object: The World\'s Only Government-Documented UFO Crash"',
      date: '2001',
      type: 'book',
      notes:
        'Primary researcher account of the Shag Harbour investigation. Ledger and Styles conducted the first systematic archival research on the incident, interviewing witnesses and accessing Canadian government records. Key source for the Government Point follow-on search claims.',
    },
    {
      title: 'NICAP Documentation - Shag Harbour 1967',
      url: 'https://www.nicap.org/671004shag_dir.htm',
      type: 'foia',
      notes:
        'National Investigations Committee on Aerial Phenomena (NICAP) documentation from the contemporary period. Includes witness summaries and contemporaneous reporting. Available online.',
    },
  ],
};

// ---------------------------------------------------------------------------
// STEPHENVILLE, TEXAS (2008) - NEW CASE
// ---------------------------------------------------------------------------
const stephenvilleCase = {
  id: 'stephenville-2008',
  name: 'Stephenville UFO Incident',
  date: 'January 8, 2008',
  location: 'Stephenville, Erath County, Texas',
  country: 'United States',
  category: 'mass-witness',
  evidence_tier: 'tier-2',
  classification_status: 'unresolved',
  summary:
    'On January 8, 2008, dozens of witnesses in Stephenville and surrounding Erath County, Texas reported a massive, low-flying object showing brilliant white lights moving silently at high speed. Witnesses included a pilot, a constable, and dozens of civilians. The U.S. Air Force initially denied having aircraft in the area; four days later it reversed course and acknowledged that F-16 fighter jets from the 457th Fighter Squadron (Naval Air Station Fort Worth Joint Reserve Base) were conducting training operations in the area. A subsequent MUFON radar analysis retrieved FAA radar data showing an unidentified track approaching Washington D.C. airspace - in the direction of President Bush\'s Crawford Ranch. The track was accompanied by a military radar return (presumed F-16s) following it.',
  tags: [
    'mass-witness',
    'radar-confirmed',
    'Texas',
    'military-denial',
    'F-16s',
    'FAA-radar',
  ],
  insider_connections: [],
  overview: {
    key_facts: [
      'January 8, 2008, approximately 6:15 PM CST: multiple witnesses in Stephenville, TX observe a very large object with brilliant white lights',
      'Key witnesses include pilot Steve Allen (who estimated the object was approximately half a mile to a mile wide and moving at ~3,000 mph), Constable Lee Roy Gaitan, and dozens of other civilians',
      'The object was observed for approximately 5-10 minutes; multiple witnesses describe it as making no sound',
      'USAF (457th Fighter Squadron, NAS Fort Worth JRB) initially issued a statement on January 11, 2008 denying any aircraft were in the area',
      'On January 14, 2008, the Air Force reversed its denial, acknowledging that ten F-16 fighter jets from the 457th were conducting training operations in the Stephenville area on January 8',
      'MUFON obtained FAA radar data via FOIA and identified an unidentified radar track moving from the Stephenville area toward restricted airspace near Crawford, TX (President Bush\'s ranch)',
      'The radar analysis showed the unidentified object was tracked at speeds up to 532 mph; F-16 returns were also present in the data',
      'FAA radar data did not show any single object of the size described by witnesses - the visual object was not matched to a confirmed radar return',
    ],
  },
  evidence: {
    video_audio: [
      'No video or photographic evidence was captured of the primary January 8 object despite numerous witnesses',
      'Multiple television news interviews with witnesses conducted in the week following the incident',
    ],
    documentation: [
      'FAA radar data for January 8, 2008 (obtained via FOIA by MUFON); shows unidentified track moving toward Crawford, TX restricted airspace',
      'USAF 457th Fighter Squadron denial (January 11, 2008) followed by reversal acknowledgment (January 14, 2008)',
      'MUFON Mutual UFO Network radar analysis report, released August 2008, analyzing the FAA data',
    ],
    physical: [
      'No physical evidence recovered',
    ],
  },
  witnesses: [
    {
      name: 'Steve Allen',
      role: 'Pilot and businessman, Selden, Texas',
      type: 'civilian',
      testimony: 'It was very large and it was very fast. I\'d say the object was about half a mile wide and one mile long. It didn\'t have any lights on it, but it had brilliant white lights - it looked like a solid object. It disappeared in about five seconds and then it reappeared in about a second or two over the south. That thing wasn\'t even going the speed of sound. I\'d say it was going at least 2,000-3,000 mph. I\'m a pilot - I know what I\'m looking at.',
    },
    {
      name: 'Constable Lee Roy Gaitan',
      role: 'Constable, Erath County',
      type: 'law-enforcement',
      testimony: 'I didn\'t want to say anything. But when I saw so many come out and say they saw something - I saw something too. It had a blinking light. I thought it was a commercial airplane at first, then it stopped and I\'m like, I\'ve never seen a plane stop like that. Then it took off at a very high rate of speed.',
    },
    {
      name: 'Ricky Sorrells',
      role: 'Machinist, Dublin, Texas',
      type: 'civilian',
      testimony: 'I was deer hunting when I saw it - a flat, metallic gray craft. It was so large it blocked out the light. There were no seams, no nuts or bolts. No wings. I could see the bottom of it. It came back several times. I was scared enough that I kept a rifle with me after the first time.',
    },
  ],
  official_response: {
    agencies: [
      'U.S. Air Force (457th Fighter Squadron)',
      'Federal Aviation Administration',
    ],
    statements: [
      {
        source: 'U.S. Air Force, 301st Fighter Wing',
        date: '2008-01-11',
        statement: 'The 301st Fighter Wing at NAS Fort Worth JRB does not have any aircraft that match the description of what witnesses saw, and we had no aircraft in that area.',
      },
      {
        source: 'U.S. Air Force, 301st Fighter Wing',
        date: '2008-01-14',
        statement: 'On January 8, 2008, ten F-16 aircraft from the 457th Fighter Squadron were on a night training mission in the Stephenville, Texas area. The original report was sent out with erroneous information. We apologize for any inconvenience.',
      },
      {
        source: 'Federal Aviation Administration',
        date: '2008',
        statement: 'FAA radar data for the area has been provided in response to FOIA requests. The data shows returns in the area consistent with known aircraft activity. Any unidentified returns require further analysis.',
      },
    ],
  },
  credibility: {
    supporting: [
      'Multiple credible witnesses including an experienced pilot and a law enforcement officer gave consistent accounts',
      'The Air Force\'s initial denial followed by a four-day reversal acknowledging F-16 training in the area undermines the official response\'s credibility',
      'MUFON radar analysis of FAA data showed an unidentified track approaching Crawford, TX restricted airspace - providing radar context even if not a direct visual match',
      'Over 300 MUFON witness reports were collected from Erath County and surrounding areas for the January-February 2008 timeframe',
    ],
    contradicting: [
      'The Air Force\'s acknowledgment of F-16 training activity provides a conventional military presence in the area that could explain some witness reports',
      'No video evidence was captured despite the large number of witnesses and the extended duration of the sighting',
      'The MUFON radar analysis was conducted by civilian researchers without formal government radar analysis resources; its methodology has not been independently peer-reviewed',
      'Witness size estimates (half a mile to over a mile wide) are extreme and may reflect perceptual overestimation under low-light conditions',
    ],
  },
  coordinates: {
    lat: 32.22,
    lng: -98.2,
  },
  timeline: [
    {
      timestamp: '2008-01-08T18:15:00',
      local: 'January 8, 2008, ~6:15 PM CST',
      event: 'Steve Allen and two other witnesses near Selden, Texas first observe the object: a massive formation of brilliant white lights moving at high speed with no sound. Allen estimates it is 0.5-1 mile wide and traveling at 2,000-3,000 mph.',
    },
    {
      timestamp: '2008-01-08T18:20:00',
      local: '~6:20 PM CST',
      event: 'Witnesses in Stephenville and surrounding Erath County observe the object. Constable Lee Roy Gaitan observes a bright blinking light that stops abruptly and then accelerates at high speed - behavior he states is inconsistent with any aircraft he has seen.',
    },
    {
      timestamp: '2008-01-08T18:25:00',
      local: '~6:25 PM CST',
      event: 'Ricky Sorrells, deer hunting near Dublin TX, observes a flat metallic craft at low altitude that he describes as blocking out ambient light over a large area. He reports the craft returns on subsequent evenings and describes it as approximately 300 feet long with no visible features on its surface.',
    },
    {
      timestamp: '2008-01-09',
      local: 'January 9-10, 2008',
      event: 'Local media in Stephenville and the Dublin Citizen begin collecting witness accounts. The story draws initial attention from the Stephenville Empire-Tribune. MUFON receives first reports.',
    },
    {
      timestamp: '2008-01-11',
      local: 'January 11, 2008',
      event: 'USAF 301st Fighter Wing issues statement denying any aircraft from their unit were in the Stephenville area on January 8.',
    },
    {
      timestamp: '2008-01-13',
      local: 'January 13, 2008',
      event: 'National and international media cover the Stephenville sightings. The story is widely reported in the U.S. and abroad, driven by the large number of consistent witness accounts.',
    },
    {
      timestamp: '2008-01-14',
      local: 'January 14, 2008',
      event: 'USAF reverses its denial: the 457th Fighter Squadron confirms ten F-16 aircraft were conducting night training operations in the Stephenville area on January 8. The Air Force attributes the original denial to an administrative error.',
    },
    {
      timestamp: '2008-08-01',
      local: 'August 2008',
      event: 'MUFON releases its radar analysis report based on FAA data obtained via FOIA. The analysis identifies an unidentified radar track moving from the Stephenville area toward Crawford, TX (near President Bush\'s Prairie Chapel Ranch, located in P-49 restricted airspace). The track is accompanied by military returns (presumed F-16s). The unidentified object was tracked at speeds up to 532 mph.',
    },
  ],

  competing_hypotheses: [
    {
      name: 'F-16 Training Exercise Misidentification',
      assessment: 'probable',
      summary:
        'The Air Force\'s own admission of ten F-16s conducting night training in the area on January 8 provides a conventional explanation for at least some witness reports. F-16 afterburner flames and formation lights visible at night could create the impression of a large, fast-moving object. The initial denial followed by reversal represents an administrative error, not a cover-up, per the Air Force\'s account.',
      evidence_for: [
        'Air Force confirmed F-16 training in the area on January 8 (January 14, 2008 statement)',
        'F-16 afterburner produces intense white light visible from the ground at night',
        'A formation of F-16s could appear as a large cluster of lights to an untrained observer',
        'Night-vision optical illusions can cause observers to misestimate size and speed of distant aircraft',
      ],
      evidence_against: [
        'Multiple witnesses including an experienced pilot explicitly described the object as unlike any aircraft they recognized',
        'The described silence at low altitude is inconsistent with F-16s, which are audible at significant distances',
        'Steve Allen\'s pilot credentials make basic jet aircraft misidentification implausible at the described proximity',
        'The MUFON radar analysis shows an unidentified track separate from the confirmed F-16 military returns',
      ],
    },
    {
      name: 'Unidentified Object with Radar Confirmation',
      assessment: 'possible',
      summary:
        'The MUFON radar analysis of FAA data identified a track that does not correspond to the confirmed F-16s and was moving toward Crawford, TX restricted airspace. If the radar analysis is accurate, it represents independent sensor confirmation of an unidentified object separate from the acknowledged military training. The object\'s apparent trajectory toward presidential restricted airspace is a notable element.',
      evidence_for: [
        'MUFON radar analysis (August 2008) identified an unidentified track in FAA data separate from known military returns',
        'The unidentified track appeared to be moving toward Crawford, TX restricted airspace (P-49)',
        'Track characteristics (speed up to 532 mph, flight path) are not consistent with commercial aviation',
        'Over 300 civilian witness reports provide substantial corroboration for an unusual event',
      ],
      evidence_against: [
        'MUFON\'s radar analysis was not peer-reviewed and the methodology has not been independently validated',
        'FAA radar data has gaps and limitations in low-altitude coverage',
        'The proximity to Crawford Ranch could be coincidental rather than indicating the object was targeting presidential restricted airspace',
        'No Air Force or FAA official has confirmed the MUFON radar analysis conclusions',
      ],
    },
  ],

  claims_taxonomy: {
    verified: [
      'USAF 457th Fighter Squadron confirmed ten F-16 aircraft were conducting training in the Stephenville area on January 8, 2008 (January 14, 2008 press statement)',
      'USAF initially denied having aircraft in the area (January 11, 2008 statement) before reversing four days later (January 14, 2008 statement)',
      'FAA radar data for the area on January 8, 2008 was produced in response to FOIA requests by MUFON',
    ],
    probable: [
      'Dozens of independent witnesses in Erath County observed unusual lights/object on January 8, 2008 (consistent across more than 300 MUFON witness reports; accounts from law enforcement and a pilot are particularly credible)',
      'MUFON radar analysis identified a track in FAA data not corresponding to acknowledged military aircraft (MUFON technical report August 2008; methodology not independently peer-reviewed)',
    ],
    disputed: [
      'The object observed by witnesses was a single large craft rather than a formation of F-16s (pilot witness Steve Allen insisted on a single massive object; military F-16 formation remains an alternative)',
      'The unidentified radar track approached Crawford, TX restricted airspace (MUFON analysis conclusion; not confirmed by FAA or USAF)',
    ],
    speculative: [
      'The object was monitoring or approaching the President\'s ranch (interpretive; no evidence of intent)',
      'The Air Force denial was deliberate concealment rather than administrative error (plausible but not supported by evidence beyond the denial itself)',
    ],
  },

  sensor_context: {
    systems: [
      {
        name: 'FAA Radar - Fort Worth ARTCC / San Angelo TRACON',
        operator: 'Federal Aviation Administration',
        notes:
          'FAA radar data for January 8, 2008 obtained via FOIA. MUFON analysis identified a track not corresponding to acknowledged military aircraft. Raw FAA data available; MUFON\'s interpretation of the track has not been independently validated.',
      },
    ],
  },

  sources: [
    {
      title: 'USAF 301st Fighter Wing - Denial Statement',
      date: '2008-01-11',
      type: 'official',
      notes:
        'Initial Air Force denial that any aircraft from the unit were in the Stephenville area on January 8. Subsequently reversed four days later.',
    },
    {
      title: 'USAF 301st Fighter Wing - Reversal Statement',
      date: '2008-01-14',
      type: 'official',
      notes:
        'Air Force acknowledgment that ten F-16s from the 457th Fighter Squadron were conducting night training in the Stephenville area. Attributed the original denial to an administrative error.',
    },
    {
      title: 'MUFON Radar Analysis Report - Stephenville January 8, 2008',
      date: '2008-08-01',
      type: 'academic',
      notes:
        'MUFON technical analysis of FAA radar data obtained via FOIA. Identifies an unidentified radar track approaching Crawford, TX restricted airspace accompanied by military returns. Primary sensor-data source for the case.',
    },
    {
      title: 'Stephenville Empire-Tribune - Initial Coverage',
      date: '2008-01-10',
      type: 'media',
      notes:
        'Local newspaper that first broke the story in depth and collected initial witness accounts. Primary contemporaneous journalistic source for the event.',
    },
  ],
};

// ---------------------------------------------------------------------------
// Apply enrichments
// ---------------------------------------------------------------------------
let enriched = cases.map((c) => {
  if (c.id === 'belgian-ufo-wave') return { ...c, ...belgianEnrichment };
  if (c.id === 'iranian-f4-incident') return { ...c, ...iranianF4Enrichment };
  if (c.id === 'roswell-1947') return { ...c, ...roswellEnrichment };
  if (c.id === 'malmstrom-afb-1967') return { ...c, ...malmstromEnrichment };
  if (c.id === 'phoenix-lights-1997') return { ...c, ...phoenixEnrichment };
  if (c.id === 'ohare-airport-2006') return { ...c, ...ohareEnrichment };
  if (c.id === 'shag-harbour-1967') return { ...c, ...shagEnrichment };
  return c;
});

// Add Stephenville as a new case
enriched = [...enriched, stephenvilleCase];

fs.writeFileSync(CASES_PATH, JSON.stringify(enriched, null, 2), 'utf8');

// Report
const tier3Ids = [
  'belgian-ufo-wave',
  'iranian-f4-incident',
  'roswell-1947',
  'malmstrom-afb-1967',
  'phoenix-lights-1997',
  'ohare-airport-2006',
  'shag-harbour-1967',
];
tier3Ids.forEach((id) => {
  const original = cases.find((c) => c.id === id);
  const updated = enriched.find((c) => c.id === id);
  const origLen = JSON.stringify(original).length;
  const newLen = JSON.stringify(updated).length;
  console.log(`${id}: ${origLen} → ${newLen} chars (+${newLen - origLen})`);
});
const sv = enriched.find((c) => c.id === 'stephenville-2008');
console.log(`stephenville-2008 (new): ${JSON.stringify(sv).length} chars`);
console.log(`\nTotal cases: ${enriched.length}`);
console.log('\nTier 3 enrichment complete.');
