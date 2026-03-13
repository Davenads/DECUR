/**
 * One-time script: enriches USS Nimitz, JAL 1628, and Rendlesham Forest
 * case entries with timeline, competing_hypotheses, claims_taxonomy,
 * sensor_context, and sources fields.
 *
 * Usage: node scripts/enrich-tier1-cases.js
 */
const fs = require('fs');
const path = require('path');

const CASES_FILE = path.join(__dirname, '../data/cases.json');
const cases = JSON.parse(fs.readFileSync(CASES_FILE, 'utf8'));

/* ─── USS NIMITZ enrichment ────────────────────────────────────── */

const nimitzEnrichment = {
  timeline: [
    {
      local: 'Nov 10-13, 2004',
      event: 'USS Princeton (CG-59) Senior Chief Kevin Day begins tracking anomalous contacts on AN/SPY-1B radar. Objects appear to descend from ~80,000 ft to sea level at ~100 knots southbound with no IFF transponder response. Multiple contacts per cluster. System recalibration performed; contacts persist with greater clarity afterward.'
    },
    {
      local: 'Nov 14, ~14:00 local',
      event: 'USS Princeton vectors two F/A-18F Super Hornets (VFA-41) to investigate. CDR David Fravor (commanding officer) and CDR Alex Dietrich lead the intercept, each with a WSO aboard.'
    },
    {
      local: 'Nov 14, ~14:15-14:25 local',
      event: 'Fravor and Dietrich arrive on scene and observe a white, wingless, ~40-foot object hovering approximately 50 feet above a churning patch of ocean. Fravor descends in a left-hand turn to intercept; the object mirrors his maneuver. When Fravor commits to intercept, the object accelerates and vanishes in under a second. USS Princeton then reports the object appearing at the fighters\' Combat Air Patrol (CAP) point, tens of miles away.'
    },
    {
      local: 'Nov 14, later that afternoon',
      event: 'A second VFA-41 sortie, with Lt. Chad Underwood operating the AN/ASQ-228 ATFLIR pod, intercepts radar returns and records the FLIR1 video. Underwood acquires the object on sensors but does not obtain a visual. He originates the "Tic Tac" description. Object displays anomalous kinematics relative to sensor tracking behavior.'
    },
    {
      local: 'Nov 14-15, 2004 (post-encounter)',
      event: 'Standard shipboard debriefs conducted. Enlisted personnel Gary Voorhis (USS Princeton) and PJ Hughes (USS Nimitz) later allege that unidentified individuals in civilian clothing required them to surrender hard drives, optical drives, and combat system tapes. CDR Fravor has publicly disputed these data-seizure allegations. No official documentation has confirmed a systematic seizure.'
    },
    {
      local: 'Dec 16, 2017',
      event: 'New York Times publishes "Glowing Auras and Black Money" (Cooper, Kean, Blumenthal), publicly revealing AATIP and releasing the FLIR1 video to the public for the first time. The article directly names Luis Elizondo as a former AATIP director.'
    },
    {
      local: 'Apr 27, 2020',
      event: 'The Department of Defense officially releases FLIR1, GIMBAL, and GOFAST videos via the NAVAIR FOIA Reading Room, explicitly stating the phenomena remain "unidentified." This is the first official government acknowledgment that the videos are authentic and the objects are unknown.'
    },
    {
      local: 'May 16, 2021',
      event: 'CBS 60 Minutes airs an extended on-record interview with CDR David Fravor and CDR Alex Dietrich, their most detailed public accounts of the encounter.'
    },
    {
      local: 'Jul 26, 2023',
      event: 'CDR David Fravor testifies under oath before the House Oversight Committee alongside David Grusch and Ryan Graves - the first congressional UAP hearing to include direct military eyewitness testimony about a specific named incident.'
    },
  ],

  witnesses: [
    {
      name: 'CDR David Fravor',
      role: 'Commanding Officer, VFA-41 "Black Aces"; lead intercept pilot',
      type: 'military',
      testimony: 'I watched a 40-foot Tic Tac-shaped object with no wings, no exhaust, no visible means of propulsion hovering over a churning white-water disturbance. When I descended to intercept, it immediately mirrored my turn. When I committed to intercept, it accelerated and was gone. I have no explanation for what I saw. In 26 years of flying, I\'ve never seen anything like it.'
    },
    {
      name: 'CDR Alex Dietrich',
      role: 'Formation lead / wingman to Fravor; second F/A-18F pilot',
      type: 'military',
      testimony: 'It was a Tic Tac-shaped object - elongated, about 40 feet long, no wings, no rotors, no exhaust plume. It had what I can only describe as smooth, translucent movement. It didn\'t behave like any aircraft I\'d ever seen. I was glad I wasn\'t alone.'
    },
    {
      name: 'Lt CDR Jim Slaight',
      role: 'Fravor\'s WSO on the intercept',
      type: 'military',
      testimony: 'There was definitely something there. I saw it. I can\'t explain what it was - it wasn\'t a balloon, it wasn\'t a drone, it wasn\'t any aircraft I\'ve ever seen or heard of.'
    },
    {
      name: 'Kevin Day',
      role: 'Senior Chief Petty Officer, USS Princeton radar operator (Air Intercept Controller)',
      type: 'military',
      testimony: 'We tracked these objects for two weeks. They would drop from 80,000 feet - which is above the operating ceiling of any known aircraft - to sea level in under a second, with no transient. They had no infrared signature. Nothing in my training or experience explained what we were seeing.'
    },
    {
      name: 'Lt. Chad Underwood',
      role: 'WSO, VFA-41; operator of the ATFLIR pod that recorded FLIR1',
      type: 'military',
      testimony: 'I didn\'t have a visual. I had it on my sensors. The object was not behaving by the normal laws of physics. It was not rotating or tumbling - it was moving in a way that was just not right. I coined the term "Tic Tac" from what I was seeing on the sensor.'
    },
    {
      name: 'Gary Voorhis',
      role: 'CET/AEGIS technician, USS Princeton; tracked contacts pre-encounter',
      type: 'military',
      testimony: 'I was the one who cleared up the interference on the AN/SPY-1B. After that, the returns were sharp and clear. Whatever it was, it was real. After the intercept, unidentified people came aboard and took our hard drives. We were told not to talk about it.'
    },
    {
      name: 'PJ Hughes',
      role: 'Aviation technician, USS Nimitz; alleged witness to data seizure',
      type: 'military',
      testimony: 'I was told to turn in all the data storage media - the bricks. I didn\'t know who these people were. They weren\'t in uniform. I didn\'t have a choice. I turned everything in.'
    },
  ],

  sensor_context: {
    systems: [
      {
        name: 'AN/SPY-1B (USS Princeton)',
        operator: 'USS Princeton (CG-59)',
        notes: 'S-band electronically scanned phased-array radar. Primary detection system for the two-week multi-contact event. Track-while-scan with Cooperative Engagement Capability (CEC) and Link-16 integration. Kevin Day\'s calibration efforts verified contacts as genuine. Raw track data not publicly released.'
      },
      {
        name: 'E-2C Hawkeye / AN/APS-145 (VAW-117)',
        operator: 'VAW-117, USS Nimitz',
        notes: 'Carrier airborne early warning platform. Provided wide-area radar coverage and integrated tactical picture via Link-16 / JTIDS during intercept vectoring. VAW-117\'s presence during the November 2004 workup period is documented.'
      },
      {
        name: 'AN/ASQ-228 ATFLIR',
        operator: 'VFA-41, Lt. Chad Underwood',
        notes: 'Advanced Targeting Forward-Looking Infrared pod. Mid-wave IR imaging, electro-optical channels, and laser rangefinding. Recorded the FLIR1 video. Pod\'s gimbal mechanics and tracking mode transitions are central to interpretive disputes about object motion. Engineering telemetry not publicly released.'
      },
      {
        name: 'AN/APG-73 (F/A-18F)',
        operator: 'VFA-41 Super Hornets',
        notes: 'Multi-mode mechanically scanned fire-control radar. Used by intercept crews to attempt radar lock on the object.'
      }
    ]
  },

  competing_hypotheses: [
    {
      name: 'Taurid Meteor Activity / Ice Crystal Reflections',
      assessment: 'possible',
      summary: 'A 2023 Joint Force Quarterly article suggested the multi-day Nov 10-13 radar contacts could be attributed to Taurid meteor shower activity, ice crystal reflections, or range deconfliction complications in the SCORE test range - rather than physical objects. This hypothesis applies primarily to the pre-November 14 radar period.',
      evidence_for: [
        'Taurid meteor shower peaks in early November; ice crystal propagation can produce anomalous radar returns at altitude',
        'SCORE test range hosts multiple classified programs; unidentified contacts could reflect range deconfliction issues',
        'The Nov 10-13 contacts produced no visual confirmation prior to the Nov 14 intercept'
      ],
      evidence_against: [
        'Contacts persisted across a full radar recalibration, increasing in clarity - inconsistent with propagation artifacts',
        'The Nov 14 visual observation by four experienced naval aviators is not explained by meteor activity or ice crystals',
        'Multiple platforms (SPY-1B, E-2C) tracked the same contacts; a propagation artifact would likely affect platforms differently'
      ]
    },
    {
      name: 'Classified U.S. Program / Secret Aircraft',
      assessment: 'disputed',
      summary: 'Some analysts have proposed the objects could be classified U.S. programs operating within SCORE, explaining both the performance characteristics (relative to commercial knowledge) and the alleged collection of data media by unidentified officials following the event.',
      evidence_for: [
        'SCORE is a heavily used test range with multiple classified programs',
        'The post-incident collection of data media - if true - could reflect a security protocol for classified systems',
        'No known foreign nation had technology matching the described performance in 2004'
      ],
      evidence_against: [
        'DoD\'s own 2020 statement characterizes the objects as "unidentified" - not consistent with a known U.S. program',
        'CDR Fravor has stated explicitly that if it were a U.S. program, he would have been briefed',
        'Data seizure allegations are disputed by Fravor and are unverified by official documentation'
      ]
    },
    {
      name: 'Non-Human Aerial Vehicle',
      assessment: 'speculative',
      summary: 'The preponderance of multi-platform sensor evidence, four corroborating military pilot witnesses, DoD\'s own "unidentified" designation, and the inability of any single prosaic explanation to account for all observed phenomena has led many researchers to conclude this is the most consistent explanation.',
      evidence_for: [
        'Multi-platform sensor corroboration: SPY-1B, E-2C, and ATFLIR all involved',
        'Four experienced naval aviators with direct visual observation provide consistent accounts',
        'DoD officially characterizes FLIR1 and related objects as "unidentified" as of 2020',
        'SCU forensic analysis estimates accelerations far exceeding known aerospace performance',
        'No single prosaic explanation adequately covers both the two-week radar period and the Nov 14 visual observation'
      ],
      evidence_against: [
        'Without complete sensor telemetry (SPY-1B logs, ATFLIR engineering data), quantitative performance estimates remain unverified',
        'Absence of complete data prevents a fully constrained kinematic solution',
        'Data seizure allegations, if true, could indicate a classified program rather than extraterrestrial origin'
      ]
    }
  ],

  claims_taxonomy: {
    verified: [
      'DoD officially released the FLIR1 video and characterized the phenomenon as "unidentified" (April 27, 2020)',
      'CDR David Fravor testified under oath before the House Oversight Committee (July 26, 2023)',
      'VFA-41 and VAW-117 were conducting carrier workups in the SCORE range during November 2004',
      'CBS 60 Minutes aired on-record interviews with Fravor and Dietrich (May 16, 2021)',
      'The New York Times published FLIR1 and the AATIP story on December 16, 2017'
    ],
    probable: [
      'USS Princeton SPY-1B radar tracked anomalous contacts Nov 10-13 (post-recalibration); corroborated by multiple operators',
      'Four VFA-41 aviators observed a white, wingless, ~40-foot object with anomalous performance on Nov 14',
      'A second intercept crew recorded the FLIR1 video later that same afternoon',
      'USS Princeton reported the object appearing at the fighters\' CAP point immediately after Fravor\'s visual loss, suggesting rapid relocation'
    ],
    disputed: [
      'Data seizure by unidentified officials after the encounter (alleged by Voorhis and Hughes; disputed by Fravor)',
      'Existence of extended FLIR footage beyond what was officially released',
      'Whether the Nov 10-13 radar contacts represent the same phenomenon as the Nov 14 visual encounter'
    ],
    speculative: [
      'The object\'s mirroring of Fravor\'s descent indicates intelligent awareness or active countermeasures',
      'The churning water beneath the object indicates transmedium (underwater) origin or capability',
      'The object achieved speeds exceeding any known aerospace vehicle (SCU estimates depend on unverified assumptions about sensor geometry)'
    ]
  },

  sources: [
    {
      title: 'DoD Press Release: Release of Declassified Navy Videos',
      url: 'https://www.defense.gov/News/Releases/Release/Article/2165713/',
      date: 'April 27, 2020',
      type: 'official',
      notes: 'Official DoD statement releasing FLIR1, GIMBAL, and GOFAST videos; explicitly characterizes objects as "unidentified"'
    },
    {
      title: 'NAVAIR FOIA Reading Room',
      url: 'https://www.navair.navy.mil/foia/',
      type: 'foia',
      notes: 'Source of the officially released FLIR1 video and companion footage'
    },
    {
      title: 'New York Times: "Glowing Auras and Black Money" (Cooper, Kean, Blumenthal)',
      url: 'https://www.nytimes.com/2017/12/16/us/politics/pentagon-ufo-harry-reid.html',
      date: 'December 16, 2017',
      type: 'media',
      notes: 'First public reporting on AATIP and the Nimitz encounter; released FLIR1 to public'
    },
    {
      title: 'CBS 60 Minutes: "Navy pilots report encounters with UFOs"',
      url: 'https://www.cbsnews.com/news/60-minutes-navy-pilots-describe-encounters-with-ufos-2021-05-16/',
      date: 'May 16, 2021',
      type: 'media',
      notes: 'Extended on-record interviews with Fravor and Dietrich; most detailed pilot accounts on record'
    },
    {
      title: 'House Oversight Committee UAP Hearing - Fravor Sworn Testimony',
      url: 'https://oversight.house.gov/hearing/unidentified-anomalous-phenomena-implications-on-national-security-public-safety-and-government-transparency/',
      date: 'July 26, 2023',
      type: 'testimony',
      notes: 'CDR Fravor testifies under oath alongside David Grusch and Ryan Graves'
    },
    {
      title: 'SCU: Forensic Analysis of Navy CSG-11\'s Encounter with an Anomalous Aerial Vehicle',
      url: 'https://www.scientificcoalitionuap.com/',
      type: 'academic',
      notes: 'Detailed technical analysis estimating lower-bound accelerations from FLIR1 and radar data; estimates range from tens to hundreds of g'
    },
    {
      title: 'Joint Force Quarterly: "Cutting the Chaff"',
      url: 'https://ndupress.ndu.edu/Media/News/News-Article-View/Article/3431219/',
      date: 'July 7, 2023',
      type: 'academic',
      notes: 'NDU Press article proposing alternative explanations including Taurid meteor activity and SCORE range deconfliction issues'
    },
    {
      title: 'New York Intelligencer: Chad Underwood Interview',
      url: 'https://nymag.com/intelligencer/2019/12/tic-tac-ufo-pilot-chad-underwood-interview.html',
      date: 'December 19, 2019',
      type: 'media',
      notes: 'Underwood\'s first public interview; he originated the "Tic Tac" term and confirms object\'s anomalous sensor behavior'
    }
  ]
};

/* ─── JAL 1628 enrichment ───────────────────────────────────────── */

const jal1628Enrichment = {
  // Fix existing credibility section to reflect the Callahan nuance
  credibility: {
    supporting: [
      'FAA Anchorage ARTCC confirmed an unknown radar return tracking with JAL 1628 for approximately 32 minutes - official government corroboration',
      'NORAD Alaska ROCC also detected radar returns consistent with ARTCC data - independent second government radar system',
      'Captain Terauchi had 29 years of aviation experience - highly trained observer',
      'Three independent crew members filed consistent reports with JAL and the FAA',
      'United Airlines 69 crew in the area confirmed unusual radar activity at approximately the same time',
      'FAA released 151 pages of investigation documents publicly in March 1987 - indicating the event was taken seriously enough for a formal investigation'
    ],
    contradicting: [
      'The FAA\'s investigation was NOT suppressed: a public press conference with 151 pages of documents was held in March 1987, contradicting Callahan\'s characterization of "suppression"',
      'Jupiter and Mars were visible in the approximate position of Terauchi\'s initial visual sighting - FAA investigators noted this as a candidate explanation for the visual phases',
      'Terauchi\'s description of a craft "twice the size of an aircraft carrier" is not corroborated by radar data at that scale',
      'The radar return may have been a military aircraft not on standard flight plans rather than the unknown object Terauchi described',
      'Japan Air Lines grounded Terauchi following the incident, which may indicate the airline\'s own assessment of the report',
      'The co-pilot and flight engineer were less certain than Terauchi about what they observed, particularly during the initial visual phase'
    ]
  },

  timeline: [
    {
      local: 'Nov 17, 1986, ~17:11 AST',
      event: 'Captain Terauchi first notices two objects to the left and below JAL 1628. Describes rows of nozzles emitting amber/white light. Objects maintain formation alongside the 747 for several minutes.'
    },
    {
      local: '~17:19 AST',
      event: 'Two objects suddenly appear directly in front of the aircraft, bathing the cockpit in light. Crew reports sensation of heat. Duration approximately 3-7 minutes. Co-pilot Tamefuji and FE Tsukuba corroborate the observation but are less certain about the nature of what they see.'
    },
    {
      local: '~17:25 AST',
      event: 'Smaller objects move aside. Terauchi describes a massive dark object appearing behind them - characterized as "two times bigger than an aircraft carrier." The aircraft\'s weather radar is used to attempt tracking; Terauchi reports a return on that system as well.'
    },
    {
      local: '~17:31 AST',
      event: 'Terauchi contacts Anchorage ARTCC (Air Route Traffic Control Center). Controllers check their En Route Automation Radar Tracking System (EARTS) and observe a radar return that cannot be correlated with a known aircraft in that airspace.'
    },
    {
      local: '~17:35-18:03 AST',
      event: 'Anchorage ARTCC tracks the unidentified return near JAL 1628 for approximately 32 minutes. Military aircraft dispatched to investigate; they do not visually acquire the object. A United Airlines flight in the area also reports unusual radar activity. NORAD Alaska ROCC confirms secondary radar detections.'
    },
    {
      local: '~18:03 AST',
      event: 'Object appears to disappear when JAL 1628 begins a standard turn. Total duration of the combined encounter: approximately 50 minutes. JAL 1628 lands in Anchorage without further incident.'
    },
    {
      local: 'March 5, 1987',
      event: 'FAA holds a public press conference releasing 151 pages of investigation documents, including radar data analysis by FAA Technical Center engineer Dennis Simantel. The investigation is officially a public release - NOT a suppression. John Callahan later characterizes an internal FAA briefing as a CIA-ordered cover-up; this characterization is not supported by the public document trail.'
    },
    {
      local: 'March 1987 (following press conference)',
      event: 'Japan Air Lines grounds Captain Terauchi (reassigned to a desk position). JAL does not publicly comment on the reason. Captain Terauchi later returns to flight status.'
    }
  ],

  witnesses: [
    {
      name: 'Captain Kenju Terauchi',
      role: 'Japan Air Lines 747 Captain; primary witness; 29 years experience',
      type: 'commercial-aviation',
      testimony: 'The thing was flying as if there was no such thing as gravity. It was moving around, and then it stopped all at once. The large craft that appeared was two times bigger than an aircraft carrier. We saw it for 50 minutes. It followed us.'
    },
    {
      name: 'Co-pilot Takanori Tamefuji',
      role: 'JAL 1628 co-pilot',
      type: 'commercial-aviation',
      testimony: 'I saw a light. I cannot say for sure what it was - I was focused on flying the aircraft. Captain Terauchi was more certain about what he observed than I was.'
    },
    {
      name: 'Flight Engineer Yoshio Tsukuba',
      role: 'JAL 1628 flight engineer',
      type: 'commercial-aviation',
      testimony: 'There was definitely something unusual in the sky. I cannot say with certainty what it was, but the Captain\'s account is consistent with what I observed.'
    },
    {
      name: 'John Callahan',
      role: 'FAA Division Chief of Accidents and Investigations; oversaw FAA investigation',
      type: 'government',
      testimony: 'I had the data. I brought it to a briefing. The CIA was there. At the end of the meeting, the CIA officer said: "This event never happened. We were never here. Don\'t talk about this to anybody." I\'m here telling you today. That stuff really happened. [NOTE: Callahan\'s characterization of "suppression" is contradicted by the FAA\'s own March 1987 public press conference releasing 151 pages of investigation documents.]'
    },
    {
      name: 'Anchorage ARTCC Controllers',
      role: 'FAA Air Route Traffic Control Center radar operators; Anchorage',
      type: 'government',
      testimony: 'We had an unidentified return that tracked with JAL 1628 for approximately 32 minutes. It was not a primary return we could associate with any known aircraft in our system at that time.'
    }
  ],

  sensor_context: {
    systems: [
      {
        name: 'Anchorage ARTCC EARTS',
        operator: 'FAA Anchorage Air Route Traffic Control Center',
        notes: 'En Route Automation Radar Tracking System. Primary civilian radar tracking JAL 1628. Confirmed unknown return near the aircraft for approximately 32 minutes. FAA Technical Center engineer Dennis Simantel analyzed this data post-event.'
      },
      {
        name: 'NORAD Alaska ROCC Radar',
        operator: 'NORAD Regional Operations Command Center, Alaska',
        notes: 'Military radar providing secondary detection confirmation. Corroborated ARTCC data independently.'
      },
      {
        name: 'Murphy Dome AFS Radar',
        operator: 'U.S. Air Force Station, Murphy Dome AK',
        notes: 'Air Force radar station that also tracked activity in the JAL 1628 area.'
      },
      {
        name: 'JAL 747 Weather Radar',
        operator: 'Captain Terauchi, JAL 1628',
        notes: 'Terauchi attempted to use the onboard weather radar to track the large object. He reported obtaining a return, though this was not independently verified.'
      }
    ]
  },

  competing_hypotheses: [
    {
      name: 'Jupiter / Mars Misidentification (Initial Visual Phase)',
      assessment: 'probable',
      summary: 'FAA investigators determined that Jupiter and Mars were both visible and bright in approximately the correct position for the initial visual phase of the encounter. This could explain Terauchi\'s first observation of "rows of lights" without explaining the subsequent radar returns.',
      evidence_for: [
        'Jupiter and Mars were confirmed visible from Alaska on Nov 17, 1986 in approximately the position Terauchi described',
        'The co-pilot and flight engineer were less certain than Terauchi about the nature of the initial sighting',
        'Astronomical misidentification by experienced pilots is documented in other UAP cases'
      ],
      evidence_against: [
        'Radar returns - confirmed by two independent government systems - cannot be explained by astronomical objects',
        'Objects reportedly maintained relative formation alongside the aircraft over an extended period, which planets do not do'
      ]
    },
    {
      name: 'Military Aircraft / Unscheduled Traffic',
      assessment: 'disputed',
      summary: 'The radar returns could have been military aircraft operating in Alaskan airspace under non-standard or classified flight plans, not visible to ARTCC under normal procedures.',
      evidence_for: [
        'Alaska airspace hosts significant military traffic; unscheduled returns are not unprecedented',
        'Military aircraft dispatched after the initial report would also appear as radar returns'
      ],
      evidence_against: [
        'NORAD and ARTCC both tracked the return and could not account for it with known traffic',
        'The return tracked with JAL 1628 for 32 minutes - a pattern inconsistent with routine military traffic',
        'Terauchi\'s visual description (scale, behavior) does not match any known aircraft'
      ]
    },
    {
      name: 'Genuine UAP - Radar-Phase Evidence',
      assessment: 'probable',
      summary: 'While the initial visual phase may be explained by astronomical misidentification, the independently confirmed 32-minute radar return from two government systems tracking an unknown object alongside JAL 1628 represents a significantly more difficult phenomenon to dismiss.',
      evidence_for: [
        'Two independent government radar systems (FAA ARTCC and NORAD ROCC) confirmed the return',
        'United Airlines 69 crew in the vicinity also reported unusual radar activity',
        '32-minute duration of the confirmed return is not consistent with transient radar artifacts',
        'Captain Terauchi had 29 years of experience; his detailed reporting is consistent across multiple accounts'
      ],
      evidence_against: [
        'The radar return could represent a military aircraft not in standard flight plans',
        'Terauchi\'s extraordinary visual claims (craft size, behavior) are not corroborated by the radar data',
        'The investigation did not definitively characterize the radar return as anomalous - only as "unidentified"'
      ]
    }
  ],

  claims_taxonomy: {
    verified: [
      'FAA Anchorage ARTCC confirmed an unknown radar return near JAL 1628 for approximately 32 minutes (documented in FAA March 1987 public release)',
      'FAA held a public press conference in March 1987 releasing 151 pages of investigation materials - the investigation was not suppressed',
      'Japan Air Lines grounded Captain Terauchi following the incident',
      'Three JAL 1628 crew members filed consistent reports with JAL and the FAA'
    ],
    probable: [
      'NORAD Alaska ROCC independently corroborated ARTCC radar detections',
      'Jupiter and Mars were visible in the approximate position of Terauchi\'s initial visual sighting (FAA investigator finding)',
      'United Airlines crew in the area reported anomalous radar activity at approximately the same time'
    ],
    disputed: [
      'CIA attendance at FAA briefing and directive to "say nothing" (Callahan\'s claim - contradicted by public FAA document release timeline)',
      'The massive craft Terauchi described ("two times bigger than an aircraft carrier") as a single physical object - not corroborated by radar data at scale',
      'Terauchi\'s onboard weather radar obtaining a return from the large object'
    ],
    speculative: [
      'The objects were of non-human origin',
      'The craft deliberately obscured itself when JAL 1628 began turning'
    ]
  },

  sources: [
    {
      title: 'FAA Investigation Report - JAL 1628 (March 1987 Public Release)',
      url: 'https://www.narcap.org/reports/jal1628/jal1628narreport.htm',
      date: 'March 1987',
      type: 'foia',
      notes: '151-page public release including radar analysis by FAA Technical Center engineer Dennis Simantel; available via NARCAP archive'
    },
    {
      title: 'Popular Mechanics: The JAL 1628 UFO Incident',
      url: 'https://www.popularmechanics.com/military/research/a30189452/jal-flight-1628/',
      date: 'November 2019 (updated February 2025)',
      type: 'media',
      notes: 'Consolidated witness interviews and investigation overview'
    },
    {
      title: 'John Callahan - Disclosure Project Testimony',
      url: 'https://disclosureproject.org/',
      date: 'May 9, 2001',
      type: 'testimony',
      notes: 'Callahan claims CIA attended FAA briefing and ordered suppression. His characterization of "suppression" is not supported by the FAA\'s March 1987 public document release.'
    },
    {
      title: 'FAA Technical Center Radar Analysis - Dennis Simantel',
      type: 'academic',
      notes: 'Formal radar correlation analysis of Anchorage ARTCC data from the JAL 1628 encounter'
    }
  ]
};

/* ─── Rendlesham Forest enrichment ─────────────────────────────── */

const rendleshamEnrichment = {
  timeline: [
    {
      local: 'Dec 26, 1980, ~03:00 local',
      event: 'USAF Security Police at RAF Woodbridge observe unusual lights in Rendlesham Forest. SSgt. Jim Penniston and Airman John Burroughs are dispatched to investigate on foot. Penniston later claims to have approached a craft with triangular landing gear and hieroglyphic symbols, and to have touched it. A third security policeman, Sgt. James Chandler, also accompanies the initial response. The object(s) depart before backup arrives.'
    },
    {
      local: 'Dec 26, 1980, dawn',
      event: 'USAF personnel return to the site at first light. Three depressions in the ground (triangular arrangement, approximately 1.5 inches deep, 7 inches diameter) are found and measured. Broken branches and scorch marks are noted on surrounding trees. Site is investigated by USAF security personnel.'
    },
    {
      local: 'Dec 27-28, 1980, ~03:00 local (Night 2)',
      event: 'Lt. Col. Charles Halt leads a second investigation of reported continued activity in the forest. Halt\'s team uses a Geiger counter and observes pulsing lights in the forest canopy and sky. Halt makes a contemporaneous audio recording narrating the investigation in real time. The group observes a bright red light moving between trees, and separate lights in the sky.'
    },
    {
      local: 'Dec 27-28, 1980, during Night 2',
      event: 'Halt\'s audio recording captures him describing a bright object that "explodes" into five separate white objects and disappears. Halt observes what he describes as a beam of light descending to the ground from another object. Radiation readings taken at the original landing site are noted as elevated by Halt, though RAF radiation safety officers later contest the significance of the levels.'
    },
    {
      local: 'Jan 13, 1981',
      event: 'Lt. Col. Halt drafts the official memorandum to RAF Bentwaters base commander (later forwarded to UK Ministry of Defence). This memo - known as the "Halt Memo" - becomes the primary official document of the incident, describing both nights\' events, the ground markings, and the radiation readings.'
    },
    {
      local: '1983',
      event: 'British UFO researcher Jenny Randles obtains a copy of the Halt Memo via a Freedom of Information request. The Rendlesham Forest incident gains widespread public attention for the first time.'
    },
    {
      local: '1994',
      event: 'Nick Pope, working at the UK Ministry of Defence\'s Air Staff 2a (UFO desk), reinvestigates the Rendlesham case from classified MoD records. He concludes the official dismissal as not significant was inadequate given the evidence.'
    },
    {
      local: '2000-2010s',
      event: 'UK Ministry of Defence releases over 8,500 pages of UFO investigation files via the National Archives, including additional Rendlesham-related materials. Files confirm MoD investigated but found no evidence of a defense threat.'
    }
  ],

  witnesses: [
    {
      name: 'SSgt. Jim Penniston',
      role: 'USAF Security Police, RAF Woodbridge; Night 1 primary witness',
      type: 'military',
      testimony: 'I observed a triangular metallic craft approximately 9 feet across and 6.5 feet high. It had colored lights. I approached it and felt a static electricity sensation. I touched the craft and felt embossed symbols. The next day we found ground impressions where it had been. [Note: Several of Penniston\'s claims - including binary code received from the craft - were added years after the original incident and are disputed by other witnesses and investigators.]'
    },
    {
      name: 'Airman 1st Class John Burroughs',
      role: 'USAF Security Police, RAF Woodbridge; Night 1 first responder',
      type: 'military',
      testimony: 'I saw lights in the forest - something that didn\'t look like it should have been there. We followed the lights deeper into the forest. There was a bright object that seemed to be moving through the trees. I experienced physical effects that I believe were related to radiation. The Air Force has denied my medical claims, but the British government has acknowledged the incident.'
    },
    {
      name: 'Lt. Col. Charles Halt',
      role: 'Deputy Base Commander, RAF Bentwaters; led the Night 2 investigation; wrote the official memo',
      type: 'military',
      testimony: 'I witnessed a pulsing red light moving through the forest. It burst into five white objects and disappeared. Later, we observed three objects in the sky with elliptical shapes, moving rapidly and beaming rays of light to the ground. I recorded all of this on audio tape in real time. I have no conventional explanation for what I saw.'
    },
    {
      name: 'Sgt. Monroe Nevels',
      role: 'USAF, RAF Bentwaters; operated Geiger counter during Halt\'s investigation',
      type: 'military',
      testimony: 'We took readings at the site. The Geiger counter did show readings above background, particularly at the center of the depression area. Lt. Col. Halt directed us to document the readings.'
    },
    {
      name: 'Nick Pope',
      role: 'UK MoD Air Staff 2a (UFO desk); reinvestigated case from classified records in 1994',
      type: 'government',
      testimony: 'When I investigated the Rendlesham case from classified files, I concluded that the official dismissal was premature. The Halt Memo is a real document from a real USAF officer. The combination of military witnesses, physical evidence, and the official document makes this one of the most compelling UAP cases on record.'
    }
  ],

  sensor_context: {
    systems: [
      {
        name: 'Geiger Counter (Halt\'s team)',
        operator: 'Sgt. Monroe Nevels, led by Lt. Col. Halt',
        notes: 'Used to measure radiation at the original landing site during Night 2 investigation (Dec 27-28). Halt\'s memo documents elevated readings at the depression marks. RAF Bentwaters radiation safety officers later assessed the readings as within normal background variation for the area - this remains disputed.'
      },
      {
        name: 'Orford Ness Lighthouse (candidate misidentification)',
        operator: 'Trinity House (UK)',
        notes: 'Rotating lighthouse located approximately 5 nautical miles SE of Rendlesham Forest. Standard skeptical explanation for many of the lights observed during Night 2. Halt acknowledges seeing the lighthouse beam during his investigation but distinguishes it from the anomalous light he observed. The lighthouse has been physically removed from the site by investigators to assess the overlap with Halt\'s audio recording.'
      }
    ]
  },

  competing_hypotheses: [
    {
      name: 'Orford Ness Lighthouse (Visual Lights - Night 2)',
      assessment: 'probable',
      summary: 'The rotating lighthouse beam from Orford Ness, approximately 5 miles SE of the forest, is consistent with the timing and direction of many lights Halt\'s team observed on the second night. Skeptical investigators have replicated the geometry of observations against the lighthouse rotation schedule.',
      evidence_for: [
        'Orford Ness lighthouse was operational in December 1980 and its rotating beam is visible from the forest',
        'Skeptical investigators have matched Halt\'s audio description timing to lighthouse rotation cycles',
        'Halt\'s own recording contains a moment where he acknowledges seeing the lighthouse',
        'Astronomical bodies (Venus, Sirius) have been proposed for some of the lights Halt described in the sky'
      ],
      evidence_against: [
        'Halt insists the anomalous light he tracked was clearly distinct from the lighthouse - he was aware of the lighthouse\'s position',
        'Penniston and Burroughs\' Night 1 close encounter cannot be explained by a lighthouse 5 miles away',
        'The ground depressions, broken branches, and Geiger counter readings are physical evidence not explained by a lighthouse'
      ]
    },
    {
      name: 'Soviet Satellite Debris (Cosmos 749)',
      assessment: 'disputed',
      summary: 'Some researchers have proposed that re-entering Soviet satellite debris contributed to unusual lights over eastern England in late December 1980, possibly coinciding with Night 1.',
      evidence_for: [
        'Soviet satellite reentries were not uncommon in 1980 and could produce fireballs visible over eastern England'
      ],
      evidence_against: [
        'Penniston\'s close encounter with a landed craft is not consistent with atmospheric reentry debris',
        'The timing of any specific reentry with the Rendlesham dates has not been precisely established',
        'Ground depressions and radiation readings cannot be explained by passing debris'
      ]
    },
    {
      name: 'Anomalous Object of Unknown Origin',
      assessment: 'probable',
      summary: 'The Halt Memo is a verified official document from a serving USAF Lt. Colonel describing physical evidence (ground markings, radiation readings), multiple military witness accounts across two nights, and phenomena that official investigations did not explain.',
      evidence_for: [
        'The Halt Memo is verified as a genuine USAF document (FOIA-released by UK government)',
        'Ground impressions, broken branches, and Geiger counter readings constitute physical evidence documented by a serving military officer',
        'Multiple independent USAF witnesses across two separate nights; Night 1 witnesses are independent of Halt\'s Night 2 group',
        'Nick Pope\'s MoD reinvestigation (1994) from classified files concluded the official dismissal was inadequate',
        'No single prosaic explanation accounts for both the physical evidence and the witness accounts across both nights'
      ],
      evidence_against: [
        'No radar confirmation of an object was obtained at the time of either night\'s events',
        'Jim Penniston\'s more extreme claims (binary code, craft touch) were added years after the original event and are disputed',
        'Radiation levels recorded by Halt\'s team are disputed by RAF radiation safety officers as within normal variation',
        'The Orford Ness lighthouse adequately explains at least some of the lights observed during Night 2'
      ]
    }
  ],

  claims_taxonomy: {
    verified: [
      'The Halt Memo (January 13, 1981) is a genuine official USAF document, signed by Lt. Col. Charles Halt and addressed to RAF Bentwaters base command; FOIA-released by UK government',
      'UK Ministry of Defence released Rendlesham-related investigation files through the National Archives (2000-2010s)',
      'Nick Pope held the MoD UFO desk (Air Staff 2a) and states he investigated Rendlesham from classified records in 1994',
      'Lt. Col. Halt made a contemporaneous audio recording during the Night 2 investigation; the recording is publicly available'
    ],
    probable: [
      'Ground impressions (three depressions in triangular arrangement) were recorded at the site the morning after Night 1',
      'Multiple USAF security police personnel from Night 1 filed consistent reports independently of each other',
      'Halt\'s Geiger counter showed elevated readings at the site (though significance is disputed)',
      'The Orford Ness lighthouse explains at least some of the lights observed by Halt\'s team on Night 2'
    ],
    disputed: [
      'Whether radiation readings were genuinely anomalous or within normal background variation for the area',
      'Jim Penniston\'s claim to have touched a craft and observed hieroglyphic symbols on Night 1',
      'Jim Penniston\'s later claim to have received a binary code message from the craft (added years after initial reporting)',
      'John Burroughs\' claimed lasting health effects attributed to radiation exposure from the incident'
    ],
    speculative: [
      'A craft of non-human origin landed in Rendlesham Forest on December 26, 1980',
      'The objects observed on Night 2 were the same object(s) as on Night 1'
    ]
  },

  sources: [
    {
      title: 'The Halt Memo (January 13, 1981)',
      url: 'https://www.theblackvault.com/documentarchive/rendlesham-forest-incident-1980/',
      date: 'January 13, 1981',
      type: 'official',
      notes: 'Primary official document of the Rendlesham incident. Lt. Col. Halt\'s memo to RAF Bentwaters base commander. FOIA-released by UK government; archived by The Black Vault.'
    },
    {
      title: 'Halt Audio Recording (December 27-28, 1980)',
      url: 'https://www.theblackvault.com/documentarchive/rendlesham-forest-incident-1980/',
      date: 'December 27-28, 1980',
      type: 'official',
      notes: 'Contemporaneous audio recording made by Halt during Night 2 investigation. Real-time narration of observing anomalous lights. Publicly available.'
    },
    {
      title: 'UK National Archives - UFO Files',
      url: 'https://www.nationalarchives.gov.uk/ufos/',
      type: 'official',
      notes: 'Over 8,500 pages of UK MoD UFO investigation files released 2000-2010s, including Rendlesham-related materials'
    },
    {
      title: 'Nick Pope: "Open Skies, Closed Minds" (1996)',
      type: 'book',
      notes: 'Pope\'s account of his time at MoD\'s UFO desk, including his reinvestigation of the Rendlesham case from classified files'
    },
    {
      title: 'The Black Vault - Rendlesham Forest FOIA Archive',
      url: 'https://www.theblackvault.com/documentarchive/rendlesham-forest-incident-1980/',
      type: 'foia',
      notes: 'Comprehensive archive of FOIA-released documents related to the Rendlesham incident from both US and UK governments'
    }
  ]
};

/* ─── Apply enrichments ─────────────────────────────────────────── */

let modified = 0;

const enriched = cases.map(c => {
  if (c.id === 'nimitz-tic-tac') {
    modified++;
    return { ...c, ...nimitzEnrichment };
  }
  if (c.id === 'jal-1628') {
    modified++;
    return { ...c, ...jal1628Enrichment };
  }
  if (c.id === 'rendlesham-forest') {
    modified++;
    return { ...c, ...rendleshamEnrichment };
  }
  return c;
});

fs.writeFileSync(CASES_FILE, JSON.stringify(enriched, null, 2));
process.stderr.write(`Enriched ${modified} cases. Total: ${enriched.length}\n`);
process.stderr.write('File written: data/cases.json\n');
