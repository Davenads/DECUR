const fs = require('fs');
const docs = require('../data/documents.json');

const newDoc = {
  id: 'uk-mod-ufo-files-2009',
  name: 'UK Ministry of Defence UFO Files (1950-2009)',
  date: '2008-2013 (primary release: 2009)',
  issuing_authority: 'UK Ministry of Defence / The National Archives (Kew)',
  document_type: 'investigation-report',
  authenticity_status: 'official-declassified',
  page_count: 52000,
  public_url: 'https://www.nationalarchives.gov.uk/ufos/',
  summary: 'The largest single government UAP document release in history: approximately 52,000 pages across 209 files covering UK Ministry of Defence UAP investigation activity from 1950 to 2009. Released in tranches to the UK National Archives at Kew beginning May 2008, with the most significant releases occurring in 2009. The files include operational investigation reports from the dedicated MoD UFO desk (Secretariat Air Staff and later Defence Intelligence Staff Section 55 / DI55), pilot encounter reports, civilian sighting reports, internal correspondence, and official assessments. The collection reveals that the UK government privately maintained a sustained, structured UAP investigation program for over five decades while publicly minimizing the subject. DI55 categorized encounters under formal criteria including defense significance and scientific interest, and the files document direct MoD contact with NATO partners and US counterparts on UAP matters.',
  significance: 'The UK MoD files represent the most transparent single disclosure of a national government UAP program in history, released voluntarily to the public record under the UK Freedom of Information Act 2000. They establish that the British government received thousands of formally filed UAP reports from military personnel, commercial aviators, and civilians across five decades; that dedicated defence intelligence staff conducted structured assessments; and that the public-facing position of dismissal was deliberately maintained in tension with private operational interest. The files are particularly significant because they include DI55 assessments evaluating UAP as potential adversary technology and noting specific incidents where no conventional explanation was found, contradicting the contemporaneous public stance.',
  key_findings: [
    'Approximately 11,000 UAP reports were formally filed with the MoD between 1959 and 2009, the large majority from trained observers including military personnel and commercial pilots',
    'DI55 (Defence Intelligence Staff Section 55) maintained an active UAP assessment program from at least the late 1960s; internal files show case-by-case classification under defense significance and scientific interest criteria',
    'Multiple files document incidents in which MoD investigators concluded no conventional explanation was identified, including several events involving radar confirmation and military pilot visual observation',
    "The files reveal that the MoD's public position - that UAP were of no defense significance - was not reflected internally; DI55 explicitly assessed a subset of cases as presenting unresolved defense intelligence questions",
    'Direct correspondence with NATO and USAF counterparts on UAP matters is documented, indicating an international intelligence-sharing dimension that was not publicly acknowledged',
    'The files include the formal DI55 investigation into the 1993 Cosford and West Drayton radar/visual events - among the most compelling multi-witness military UAP encounters in UK records',
    'The 1997 Canary Wharf-area radar event and multiple North Sea oil platform incidents with helicopter crew reports are documented in the operational files',
    'The release process itself revealed that the MoD had systematically retained UAP files outside the standard Cabinet Office 30-year disclosure schedule, requiring special review processes before release'
  ],
  provenance: "Files were held primarily under National Archives reference classes DEFE 24 (Air Ministry and MoD registered files) and AIR 2 (Air Ministry correspondence). The release program was initiated following sustained FOIA requests beginning in 2005 under the UK Freedom of Information Act 2000 and implemented in coordination between the MoD's Directorate of Air Staff and the National Archives. Nick Pope, former head of the MoD UFO desk (1991-1994), served as an informal public liaison during the release, describing the files in press briefings. The MoD officially closed its UAP investigation program in December 2009 concurrently with the completion of the primary file releases, citing resource constraints and the absence of evidence of defense threat.",
  insider_connections: [
    {
      id: 'nick-pope',
      role: 'Former head of the MoD UFO desk (Secretariat Air Staff, 1991-1994); primary public communicator during the file release process',
      note: 'Pope ran the exact desk that produced many of the files in the release during his tenure. He publicly described the files as confirming that official dismissal was inconsistent with internal assessment, and he conducted media briefings on key cases within the release.'
    },
    {
      id: 'leslie-kean',
      role: 'Investigative journalist who covered the UK release and cited DI55 files in UFOs: Generals, Pilots and Government Officials (2010)',
      note: "Kean's 2010 book drew directly on the UK National Archives release as one of its primary documentary sources, using the DI55 assessments to support her central argument that governments privately treated UAP as a serious intelligence matter."
    },
    {
      id: 'richard-dolan',
      role: 'Historian who analyzed the UK MoD files within his UFOs and the National Security State series',
      note: "Dolan's historical analysis of the UK release is the most comprehensive scholarly treatment; he contextualized the DI55 files within the broader pattern of NATO-aligned government UAP concealment."
    }
  ],
  limitations: [
    'Approximately 18% of files within the disclosed collection were withheld in full or released with redactions under Section 26 (defense) and Section 23 (security bodies) exemptions of the UK FOIA',
    'The DI55/2 files covering cases assessed as having the highest defense significance remain withheld; the released files represent primarily the lower-sensitivity tier of the operational record',
    'No classified annex material from signals intelligence components of MoD UAP investigation has been released',
    'The release program was accompanied by the concurrent closure of the MoD UFO desk in December 2009, raising questions about whether the closure was intended to preclude future FOIA obligations',
    'Physical evidence files, photographs, and radar recordings referenced in the investigation reports were not included in the National Archives transfer and their current disposition is not documented'
  ],
  provenance_chain: [
    {
      id: 'mod-ufo-files-creation',
      label: 'MoD UAP Investigation Files Created',
      description: 'The Ministry of Defence and its predecessor the Air Ministry begin systematic documentation of UAP reports from military and civilian sources. DI55 is established as the primary assessment unit, maintaining classified operational files on cases with potential defence or intelligence significance.',
      date: '1950s-1960s',
      type: 'creation'
    },
    {
      id: 'mod-ufo-files-foia-requests',
      label: 'Freedom of Information Requests Filed',
      description: 'Following passage of the UK Freedom of Information Act 2000 (effective January 2005), researchers and journalists file FOIA requests for MoD UAP files. The volume of requests prompts MoD to negotiate a structured release program with the National Archives.',
      date: '2005-2007',
      type: 'transfer'
    },
    {
      id: 'mod-ufo-files-first-release',
      label: 'First National Archives Release',
      description: 'The first tranche of MoD UAP files transferred to The National Archives at Kew and made publicly available. Eight files released covering 1978-1987.',
      date: 'May 2008',
      type: 'public'
    },
    {
      id: 'mod-ufo-files-main-release',
      label: 'Primary 2009 Release',
      description: 'The largest single release: eight additional files totaling approximately 4,000 pages, covering 1981-1996. Includes DI55 operational assessment files and the Cosford/West Drayton 1993 investigation records. Receives major international media coverage.',
      date: 'August 2009',
      type: 'public'
    },
    {
      id: 'mod-desk-closure',
      label: 'MoD UFO Desk Officially Closed',
      description: 'The Ministry of Defence officially closes its UAP investigation program, citing the absence of evidence of defense threat. The closure coincides with the ongoing file transfer to the National Archives.',
      date: 'December 2009',
      type: 'transfer'
    },
    {
      id: 'mod-ufo-files-final-release',
      label: 'Final Releases Completed',
      description: 'The final tranches of MoD UAP files transferred to The National Archives, completing the release program. Total: approximately 52,000 pages across 209 files. All files publicly accessible through the National Archives digital catalogue.',
      date: '2012-2013',
      type: 'archive'
    }
  ]
};

docs.push(newDoc);
fs.writeFileSync('./data/documents.json', JSON.stringify(docs, null, 2));
console.log('Added uk-mod-ufo-files-2009. Total docs:', docs.length);
