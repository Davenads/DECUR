/**
 * Merges curated glossary terms with Gerb-extracted contributions
 * into data/glossary.json for use by the Glossary component.
 */
const fs = require('fs');
const path = require('path');

const gerbPath = path.join(__dirname, '../../data/channels/gerb/contributions/glossary.json');
const outPath  = path.join(__dirname, '../../data/glossary.json');

const gerb = JSON.parse(fs.readFileSync(gerbPath, 'utf8'));

const curated = [
  { term: 'AARO', definition: 'All-domain Anomaly Resolution Office - Established by the DoD in July 2022 as the centralized office for detecting, identifying, and attributing UAP. Replaced the UAP Task Force. Responsible for producing the 2024 Historical Record Report.', source: 'curated' },
  { term: 'AATIP', definition: 'Advanced Aerospace Threat Identification Program - A classified Pentagon program that ran from 2007 to 2012 under Defense Intelligence Agency funding, focused on investigating UAP reported by U.S. military personnel. Luis Elizondo claims to have directed it through 2017 under a different organizational umbrella. Publicly confirmed via a 2017 New York Times investigation.', source: 'curated' },
  { term: 'AAWSAP', definition: 'Advanced Aerospace Weapon System Application Program - The broader predecessor to AATIP, managed by the Defense Intelligence Agency with Bigelow Aerospace Advanced Space Studies (BAASS) as primary contractor. Covered a wider range of anomalous phenomena than AATIP\'s aerial focus.', source: 'curated' },
  { term: 'Bigelow Aerospace', definition: 'Bigelow Aerospace Advanced Space Studies (BAASS) - Robert Bigelow\'s aerospace company that served as the primary contractor for AAWSAP. Senator Harry Reid secured the AATIP funding at Bigelow\'s request. BAASS reportedly studied materials collected in connection with UAP incidents.', source: 'curated' },
  { term: 'Crash Retrieval', definition: 'In UAP research, the alleged government practice of recovering downed or crashed non-human craft. David Grusch\'s 2023 congressional testimony alleged the U.S. has maintained a multi-decade crash retrieval and reverse engineering program concealed from congressional oversight.', source: 'curated' },
  { term: 'Five Observables', definition: 'An analytical framework developed by Luis Elizondo describing five consistent flight characteristics observed across UAP encounters studied under AATIP: (1) anti-gravity lift, (2) sudden and instantaneous acceleration, (3) hypersonic velocity without sonic signature, (4) low observability or cloaking, and (5) trans-medium travel. None are consistent with known human aerospace capability.', source: 'curated' },
  { term: 'ICIG', definition: 'Intelligence Community Inspector General - The independent oversight body within the U.S. intelligence community. In May 2022, ICIG Thomas Monheim received David Grusch\'s formal Disclosure of Urgent Concern and deemed it credible and urgent - a formal legal threshold that triggered congressional notification.', source: 'curated' },
  { term: 'Insider', definition: 'On DECUR, an individual with claimed direct access to classified programs who has come forward publicly with testimony regarding UAP, non-human intelligence, or related government programs. Typically current or former military, intelligence, or contractor personnel. Distinct from witnesses and researchers who lack direct program access.', source: 'curated' },
  { term: 'KONA BLUE', definition: 'A Special Access Program proposal submitted to the Department of Homeland Security that was never approved, funded, or implemented. Referenced in connection with some of David Grusch\'s reported sources. AARO\'s 2024 Historical Record Report identified it as evidence that some disclosed programs may reflect misidentified or unfunded proposals.', source: 'curated' },
  { term: 'Majestic-12', definition: 'An alleged secret committee of scientists, military leaders, and government officials formed in 1947 to oversee UAP investigation and any recovered materials. Existence remains unverified. Referenced extensively in Dan Burisch\'s testimony. MJ-12 documents surfaced in the 1980s but their authenticity is disputed.', source: 'curated' },
  { term: 'NHI', definition: 'Non-Human Intelligence - A broad term used in UAP research to describe intelligent entities not of human origin, without presuming whether they are extraterrestrial, extradimensional, or otherwise. Increasingly used in congressional and government contexts as a more neutral alternative to extraterrestrial.', source: 'curated' },
  { term: 'NRO', definition: 'National Reconnaissance Office - The U.S. intelligence agency responsible for operating reconnaissance satellites. David Grusch served as the NRO\'s representative to the DoD UAP Task Force, giving him access to intelligence community-wide UAP reporting.', source: 'curated' },
  { term: 'SAP', definition: 'Special Access Program - Classified U.S. government programs with access controls beyond standard Top Secret/SCI clearance. Multiple insiders, including Grusch and Elizondo, have alleged UAP-related programs operate as SAPs or within SAP compartments, limiting congressional oversight.', source: 'curated' },
  { term: 'SCI', definition: 'Sensitive Compartmented Information - A classification level above Top Secret requiring access to specific compartments based on need-to-know. Elizondo and Grusch both held TS/SCI clearances. Much of their testimony concerns programs that operate within SCI compartments.', source: 'curated' },
  { term: 'UAP', definition: 'Unidentified Anomalous Phenomena (previously Unidentified Aerial Phenomena) - The modern government and research term for what were previously called UFOs. Aerial was broadened to Anomalous in the 2023 NDAA to encompass objects observed in space, underwater, and transitioning between domains.', source: 'curated' },
  { term: 'UAP Task Force', definition: 'Unidentified Aerial Phenomena Task Force - Established by the DoD in August 2020 following Senate Intelligence Committee pressure. Standardized and centralized UAP data collection. Predecessor to AARO. David Grusch served as the NRO\'s representative to the Task Force from 2019 to 2021.', source: 'curated' },
  { term: 'UAPTF', definition: 'See UAP Task Force.', source: 'curated' },
  { term: 'UAP Disclosure Act', definition: 'The UAP Disclosure Act of 2023, introduced by Senators Schumer and Rounds as an NDAA amendment following David Grusch\'s congressional testimony. Modeled on the JFK Records Act, it established a presumption of disclosure for UAP-related government records and created a Presidential Review Board. Partially enacted in the 2024 NDAA.', source: 'curated' },
];

const curatedUpper = new Set(curated.map(t => t.term.toUpperCase()));

// Gerb terms: high or medium confidence, not already curated, has a real definition
const gerbTerms = gerb
  .filter(t =>
    (t.confidence === 'high' || t.confidence === 'medium') &&
    !curatedUpper.has(t.term.toUpperCase()) &&
    t.definition &&
    t.definition.length > 10
  )
  .map(t => ({
    term: t.term,
    definition: t.expansion
      ? t.expansion + ' - ' + t.definition
      : t.definition,
    source: 'gerb',
  }));

const merged = [...curated, ...gerbTerms].sort((a, b) =>
  a.term.localeCompare(b.term)
);

fs.writeFileSync(outPath, JSON.stringify(merged, null, 2));
console.log('Curated:', curated.length);
console.log('Gerb new:', gerbTerms.length);
console.log('Total merged:', merged.length);
console.log('Written:', outPath);
