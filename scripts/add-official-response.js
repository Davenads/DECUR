const fs = require('fs');
const cases = require('../data/cases.json');

const officialResponses = {
  'levelland-1957': {
    agencies: ['Project Blue Book (USAF)', 'Levelland Police Department', 'Hockley County Sheriff'],
    statements: [
      {
        source: 'Project Blue Book',
        date: 'November 1957',
        statement: 'Project Blue Book investigators visited Levelland and concluded the sightings were caused by ball lightning or St. Elmo\'s fire combined with an electrical storm in the area. The explanation was widely criticized by investigators including astronomer Dr. J. Allen Hynek, who noted that the weather conditions on the night in question did not support the ball lightning hypothesis.'
      },
      {
        source: 'Sheriff Weir Clem',
        date: 'November 3, 1957',
        statement: 'I saw a strange-looking flash of light. It was definitely moving in a northwesterly direction. I couldn\'t tell if it was a light or a fireball.'
      }
    ]
  },
  'coyne-helicopter-1973': {
    agencies: ['US Army Reserve', 'CUFOS (Center for UFO Studies)', 'United Nations Special Political Committee'],
    statements: [
      {
        source: 'US Army Reserve',
        date: 'October 1973',
        statement: 'Captain Coyne filed an official incident report with the Army Reserve following the October 18, 1973 encounter. The report documented the object, the radio failure, and the unexplained helicopter ascent. The Army did not issue a public classification or explanation.'
      },
      {
        source: 'United Nations Special Political Committee',
        date: 'November 27, 1978',
        statement: 'Captain Lawrence Coyne testified before the United Nations Special Political Committee alongside Dr. J. Allen Hynek and Gordon Cooper, presenting the helicopter encounter as part of a broader call for an international UAP investigation body. This represented one of the only formal presentations of a specific UAP case to a UN body.'
      }
    ]
  },
  'kenneth-arnold-1947': {
    agencies: ['Army Air Force Intelligence (Hamilton Field)', 'Project Sign (USAF)', 'Federal Bureau of Investigation'],
    statements: [
      {
        source: 'Army Air Force Intelligence',
        date: 'July 1947',
        statement: 'Lt. Frank Brown and Capt. William Davidson flew from Hamilton Field to Pendleton, Oregon to interview Arnold personally. Their investigation report documented his account and was forwarded to Air Force intelligence. The case was classified Unidentified by Project Sign.'
      },
      {
        source: 'Project Sign (USAF)',
        date: '1948',
        statement: 'Project Sign investigators reviewed the Arnold report and classified the June 24, 1947 Mount Rainier sighting as Unidentified. The case has never been officially explained. Edward Ruppelt, first head of Project Blue Book, later cited it as the event that effectively launched organized government UAP investigation.'
      },
      {
        source: 'FBI Field Office - Pendleton, Oregon',
        date: 'June 25, 1947',
        statement: 'Arnold first reported the sighting to FBI agents in Pendleton, Oregon. FBI agents directed him to Army Air Force authorities, noting the military\'s jurisdiction over aerial phenomena. The FBI contact record is the earliest official documentation of the report.'
      }
    ]
  },
  'betty-barney-hill-1961': {
    agencies: ['Pease Air Force Base (100th Bomb Wing)', 'Project Blue Book (USAF)', 'NICAP'],
    statements: [
      {
        source: 'Pease Air Force Base - 100th Bomb Wing',
        date: 'September 21, 1961',
        statement: 'Major Paul Henderson filed a Blue Book report on the Hill incident two days after the encounter. The report noted: "The object was a large disk-like object about 60 feet in diameter and 15 to 20 feet thick. It moved very smoothly and made no sound." The Air Force report listed the sighting as Unidentified.'
      },
      {
        source: 'Project Blue Book (USAF)',
        date: '1961-1962',
        statement: 'Project Blue Book retained the Hill case file but did not issue a public explanation or classification. Astronomer Donald Menzel, serving as a Blue Book consultant, privately attributed the sighting to misidentified stars (Jupiter and Saturn), an explanation that NICAP investigators and Dr. Simon rejected as inadequate given the Barney Hill binocular observations and the missing time.'
      }
    ]
  },
  'walton-abduction-1975': {
    agencies: ['Navajo County Sheriff\'s Department', 'Arizona Department of Public Safety', 'APRO (Aerial Phenomena Research Organization)'],
    statements: [
      {
        source: 'Navajo County Sheriff\'s Department',
        date: 'November 5-10, 1975',
        statement: 'Sheriff Marlin Gillespie opened a missing person investigation on the evening of November 5, 1975 following the crew\'s report. A multi-day search operation found no trace of Walton. Deputies who interviewed the crew reported that the men appeared genuinely frightened and showed no signs of fabrication. Gillespie later stated the incident was among the most unusual he encountered in his career.'
      },
      {
        source: 'Arizona Department of Public Safety - Polygraph Division',
        date: 'November 10, 1975',
        statement: 'DPS polygraph specialist Cy Gilson administered examinations to five of the six crew members on November 10, 1975. Gilson\'s report concluded that all five men were telling the truth as they understood it regarding the events of November 5. One crew member requested a reschedule due to emotional distress. No governmental investigation body challenged Gilson\'s methodology or findings.'
      },
      {
        source: 'APRO Investigation Report',
        date: '1976',
        statement: 'APRO (Aerial Phenomena Research Organization) conducted a formal investigation and published findings concluding that the case represented a genuine anomalous incident. APRO investigators reviewed the polygraph documentation, crew testimonies, sheriff\'s records, and Walton\'s account and found no evidence of coordinated deception.'
      }
    ]
  },
  'cash-landrum-1980': {
    agencies: ['US Army (Department of Defense)', 'US Air Force', 'NASA', 'US District Court - Southern District of Texas'],
    statements: [
      {
        source: 'US Army',
        date: '1986',
        statement: 'In depositions filed in Cash and Landrum v. United States (Case No. H-81-2072), the US Army denied ownership of or knowledge of any diamond-shaped craft operating in the Huffman, Texas area on December 29, 1980. The Army stated no CH-47 Chinook helicopters under its command were in the area that night.'
      },
      {
        source: 'US Air Force',
        date: '1986',
        statement: 'The US Air Force submitted depositions in the federal lawsuit denying any Air Force aircraft or classified experimental craft was operating near Huffman, Texas on the night of the incident. No Air Force flight logs for the area were produced.'
      },
      {
        source: 'US District Court - Southern District of Texas',
        date: 'August 21, 1986',
        statement: 'Judge Ross Sterling dismissed Cash and Landrum v. United States without prejudice. The dismissal was on procedural grounds - the plaintiffs could not establish that a US government entity owned the craft, which was required for the Federal Tort Claims Act to apply. The court did not make a finding that the government was uninvolved. No explanation for the witnesses\' radiation-consistent injuries or the helicopter presence was entered into the record.'
      }
    ]
  },
  'trans-en-provence-1981': {
    agencies: ['GEPAN / CNES (French Space Agency)', 'Gendarmerie Nationale', 'INRA (Institut National de la Recherche Agronomique)'],
    statements: [
      {
        source: 'Gendarmerie Nationale - Var Department',
        date: 'January 8, 1981',
        statement: 'Gendarmerie officers responded to Renato Niccolai\'s report the same evening of the incident. They documented the circular landing trace (approximately 2.4-2.5 meters diameter), photographed it, and collected soil samples. The gendarmerie report was transmitted to GEPAN, initiating the official investigation chain.'
      },
      {
        source: 'GEPAN Technical Note No. 16 (CNES)',
        date: '1981',
        statement: 'GEPAN\'s official investigation report concluded: "The convergence of physical evidence - the trace geometry, the soil crystalline modifications, and the biochemical anomalies in plant samples - are consistent with the action of a powerful, localized physical phenomenon of unknown nature. No conventional explanation has been identified." This is the only official national government scientific report to reach such a conclusion regarding a UAP physical trace case.'
      },
      {
        source: 'INRA - Dr. Michel Bounias',
        date: '1981',
        statement: 'Dr. Michel Bounias\' laboratory analysis of plant samples from the landing trace found chlorophyll reduction of 38-50% in trace samples compared to control plants from adjacent areas. The phosphate and biochemical marker profiles were anomalous. Bounias stated: "The observed effects on plant biochemistry are unlike anything I have previously encountered in standard agronomic investigation. The pattern of degradation is inconsistent with any known agricultural, mechanical, or chemical cause."'
      }
    ]
  }
};

let updatedCount = 0;
const updated = cases.map(c => {
  if (officialResponses[c.id]) {
    updatedCount++;
    return { ...c, official_response: officialResponses[c.id] };
  }
  return c;
});

fs.writeFileSync('./data/cases.json', JSON.stringify(updated, null, 2));
console.log('Updated ' + updatedCount + ' cases with official_response data.');
