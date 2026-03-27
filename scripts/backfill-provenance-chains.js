#!/usr/bin/env node
/**
 * Backfill provenance_chain arrays for 12 legacy documents in data/documents.json
 * that are currently missing them.
 */

const fs = require('fs');
const path = require('path');

const docsPath = path.join(__dirname, '..', 'data', 'documents.json');
const docs = JSON.parse(fs.readFileSync(docsPath, 'utf8'));

const chains = {
  'aaro-historical-record-vol1': [
    {
      id: 'aaro-vol1-ndaa-mandate',
      label: 'NDAA Mandate',
      date: 'December 2022',
      description: 'FY2023 NDAA Section 1683 established AARO and Section 1672 mandated a historical record review of all U.S. government UAP investigations.',
      type: 'creation'
    },
    {
      id: 'aaro-vol1-production',
      label: 'AARO Production',
      date: '2023-2024',
      description: 'AARO under Dr. Sean Kirkpatrick conducted research, witness interviews, and classified record review to produce the historical assessment.',
      type: 'transfer'
    },
    {
      id: 'aaro-vol1-public-release',
      label: 'Public Release',
      date: 'March 8, 2024',
      description: 'Unclassified report released publicly via media.defense.gov. A classified annex was delivered separately to congressional intelligence committees.',
      type: 'public'
    }
  ],

  'nasa-uap-study-2023': [
    {
      id: 'nasa-uap-commission',
      label: 'NASA Commission',
      date: 'October 2022',
      description: 'NASA commissioned an independent 16-member study team chaired by Dr. David Spergel to assess UAP from a scientific methodology standpoint.',
      type: 'creation'
    },
    {
      id: 'nasa-uap-panel-formation',
      label: 'Independent Panel Formed',
      date: 'Late 2022',
      description: 'Panel assembled including Dr. Scott Kelly, Daniel Evans, and other credentialed scientists and former military officials. Team declared independent of UAPTF and AARO.',
      type: 'transfer'
    },
    {
      id: 'nasa-uap-study-conducted',
      label: 'Study Conducted',
      date: '2022-2023',
      description: 'Panel reviewed unclassified UAP reports and imagery, assessed NASA data infrastructure applicability, and developed scientific methodology recommendations.',
      type: 'transfer'
    },
    {
      id: 'nasa-uap-public-release',
      label: 'Public Release',
      date: 'September 14, 2023',
      description: 'Report released publicly via science.nasa.gov. Release coincided with appointment of Mark McInerney as NASA UAP research director in November 2023.',
      type: 'public'
    }
  ],

  'dia-iran-f4-1976': [
    {
      id: 'dia-iran-f4-creation',
      label: 'Original Classification',
      date: 'September 1976',
      description: 'DIA report on the September 19, 1976 Tehran F-4 intercept incident produced and classified as Secret. Includes Iranian Air Force witness accounts and DIA analytical commentary.',
      type: 'creation'
    },
    {
      id: 'dia-iran-f4-classified-hold',
      label: 'Classified Hold',
      date: '1976-1970s',
      description: 'Held within DIA and intelligence community channels. Cold War context and Iranian Revolutionary upheaval of 1979 further restricted access to follow-up investigation.',
      type: 'classification'
    },
    {
      id: 'dia-iran-f4-foia',
      label: 'FOIA Release',
      date: '1977-1980s',
      description: 'Released through FOIA requests filed by civilian researchers including Barry Greenwood and Lawrence Fawcett as part of a batch of UAP-related intelligence files.',
      type: 'foia'
    },
    {
      id: 'dia-iran-f4-archive',
      label: 'Public Archive',
      date: 'Ongoing',
      description: 'Available through the National Security Archive at George Washington University and the CIA FOIA Electronic Reading Room. Authenticity not disputed.',
      type: 'archive'
    }
  ],

  'ndaa-fy2023-uap-provisions': [
    {
      id: 'ndaa-fy2023-development',
      label: 'Congressional Development',
      date: '2022',
      description: 'UAP provisions developed through Senate and House Armed Services and Intelligence Committees led by Senators Gillibrand and Rubio and Representatives Gallagher and Burchett.',
      type: 'creation'
    },
    {
      id: 'ndaa-fy2023-committee-work',
      label: 'Committee Drafting',
      date: '2022',
      description: 'Chris Mellon worked directly with congressional staff on legislative language. Provisions shaped to create AARO, establish whistleblower protections, and mandate historical review.',
      type: 'transfer'
    },
    {
      id: 'ndaa-fy2023-passage',
      label: 'NDAA Passed',
      date: 'December 2022',
      description: 'Full National Defense Authorization Act passed with overwhelming bipartisan support including the UAP provisions as Sections 1671-1683.',
      type: 'transfer'
    },
    {
      id: 'ndaa-fy2023-signed',
      label: 'Signed Into Law',
      date: 'December 23, 2022',
      description: 'President Biden signed the FY2023 NDAA into law. AARO formally established with statutory mandate, budget authority, and annual congressional reporting requirements.',
      type: 'public'
    }
  ],

  'blue-book-special-report-14': [
    {
      id: 'bb14-usaf-commission',
      label: 'USAF Commission to Battelle',
      date: '1952',
      description: 'Air Technical Intelligence Center contracted Battelle Memorial Institute to perform a rigorous statistical analysis of all USAF UAP sightings accumulated from 1947 onward.',
      type: 'creation'
    },
    {
      id: 'bb14-battelle-production',
      label: 'Battelle Analysis Conducted',
      date: '1952-1955',
      description: 'Four Battelle analysts conducted chi-square statistical analysis of 3,201 sightings across six characteristics, requiring unanimous agreement for Unknown classification.',
      type: 'transfer'
    },
    {
      id: 'bb14-classification',
      label: 'Classified at Production',
      date: '1955',
      description: 'Report classified upon completion. Secretary of the Air Force Donald Quarles publicly mischaracterized findings on October 25, 1955 - stating 3% unknown instead of the actual 22%.',
      type: 'classification'
    },
    {
      id: 'bb14-declassification',
      label: 'Declassified',
      date: '1960s-1970s',
      description: 'Progressively declassified as part of Project Blue Book archive transfer to NARA. Available on NARA Microfilm Publication T1206, Roll 86.',
      type: 'declassification'
    },
    {
      id: 'bb14-archive',
      label: 'Public Archive',
      date: 'Ongoing',
      description: 'Available via Fold3, Internet Archive, and The Black Vault. Quarles\'s false public characterization was never officially retracted.',
      type: 'archive'
    }
  ],

  'condon-report-1969': [
    {
      id: 'condon-uc-contract',
      label: 'University of Colorado Contract',
      date: 'October 1966',
      description: 'USAF awarded contract F44620-67-C-0035 to the University of Colorado for a scientific study of UFOs under project director Dr. Edward U. Condon.',
      type: 'creation'
    },
    {
      id: 'condon-study-conducted',
      label: 'Study Conducted',
      date: '1966-1968',
      description: 'Team investigated approximately 90 cases over two years. Statistician Dr. David Saunders and Norman Levine discovered the Low memo in project files.',
      type: 'transfer'
    },
    {
      id: 'condon-low-memo',
      label: 'Low Memo Controversy',
      date: '1968',
      description: 'Robert Low internal memo describing the study as a "trick" was leaked by Saunders and Levine; published in Look magazine May 1968. Saunders and Levine fired by Condon.',
      type: 'transfer'
    },
    {
      id: 'condon-published',
      label: 'Report Published',
      date: 'January 9, 1969',
      description: 'Report published by E.P. Dutton and Bantam Books. Condon summary concluded further UAP study "cannot be justified," contradicting the body finding that 30% of cases remained unexplained.',
      type: 'public'
    },
    {
      id: 'condon-blue-book-closed',
      label: 'Blue Book Closed',
      date: 'December 1969',
      description: 'Project Blue Book officially closed December 17, 1969 citing the Condon Report. Official U.S. government UAP investigation did not formally resume until approximately 2007.',
      type: 'archive'
    }
  ],

  'project-sign-estimate-1948': [
    {
      id: 'sign-estimate-produced',
      label: 'Estimate Produced',
      date: '1948',
      description: 'Project SIGN team at Air Technical Intelligence Center produced a classified Top Secret assessment concluding that UAP were most likely of extraterrestrial origin.',
      type: 'creation'
    },
    {
      id: 'sign-estimate-classified',
      label: 'Classified Top Secret',
      date: '1948',
      description: 'Document classified Top Secret and routed upward through Air Force command to General Hoyt Vandenberg, Air Force Chief of Staff.',
      type: 'classification'
    },
    {
      id: 'sign-vandenberg-rejection',
      label: 'Vandenberg Rejection',
      date: 'Late 1948',
      description: 'General Vandenberg rejected the extraterrestrial conclusion as insufficiently supported. Project SIGN was subsequently reorganized into Project GRUDGE with a debunking mandate.',
      type: 'transfer'
    },
    {
      id: 'sign-ordered-destroyed',
      label: 'Ordered Destroyed',
      date: 'Late 1948',
      description: 'Vandenberg ordered all copies destroyed. Existence confirmed through Captain Edward Ruppelt\'s 1956 memoir and interviews with surviving SIGN team members. No copies known to survive.',
      type: 'archive'
    }
  ],

  'aaro-historical-record-vol2-2024': [
    {
      id: 'aaro-vol2-ndaa-mandate',
      label: 'NDAA Mandate',
      date: 'December 2022',
      description: 'FY2023 NDAA Section 1672 mandated AARO produce a comprehensive historical record of U.S. government UAP investigations - Vol. 2 extends coverage announced in Vol. 1.',
      type: 'creation'
    },
    {
      id: 'aaro-vol2-production',
      label: 'AARO Production',
      date: '2023-2024',
      description: 'AARO expanded historical review to address additional crash retrieval allegations, KONA BLUE program analysis, and further witness claims raised by congressional witnesses.',
      type: 'transfer'
    },
    {
      id: 'aaro-vol2-classified-annex',
      label: 'Classified Annex Prepared',
      date: '2024',
      description: 'A classified annex was prepared alongside the unclassified report and delivered to congressional intelligence committees with more detailed program and witness assessments.',
      type: 'classification',
      branches_from: 'aaro-vol2-production'
    },
    {
      id: 'aaro-vol2-public-release',
      label: 'Public Release',
      date: 'July 2024',
      description: 'Unclassified Volume 2 released publicly via media.defense.gov, completing AARO\'s official historical record for the unclassified sphere.',
      type: 'public'
    }
  ],

  'pentacle-memorandum': [
    {
      id: 'pentacle-created',
      label: 'Memo Created',
      date: 'January 9, 1953',
      description: 'H.C. Cross of Battelle Memorial Institute wrote the memo to Miles Goll at Wright-Patterson AFB, two days before the Robertson Panel convened, urging control of what evidence the Panel would see.',
      type: 'creation'
    },
    {
      id: 'pentacle-classified',
      label: 'Classified',
      date: '1953',
      description: 'Classified within the Battelle-ATIC administrative channel. Not publicly known; retained in J. Allen Hynek\'s personal files without publicizing its significance.',
      type: 'classification'
    },
    {
      id: 'pentacle-vallee-discovery',
      label: 'Discovered by Vallee',
      date: '1967',
      description: 'Jacques Vallee discovered the memo in J. Allen Hynek\'s personal papers. Hynek had kept the document without publicizing it; Vallee recognized its historical significance.',
      type: 'transfer'
    },
    {
      id: 'pentacle-public-disclosure',
      label: 'Public Disclosure',
      date: '1990s',
      description: 'Vallee described the memo publicly in his research writings, establishing it as evidence of a deliberate two-track UAP investigation system running parallel to Blue Book.',
      type: 'public'
    },
    {
      id: 'pentacle-archive',
      label: 'Authenticated and Archived',
      date: 'Ongoing',
      description: 'Authenticity not formally disputed; content consistent with Battelle-ATIC organizational structure of 1953. Available through NICAP document archive and UAP research repositories.',
      type: 'archive'
    }
  ],

  'hottel-memo': [
    {
      id: 'hottel-created',
      label: 'Memo Created',
      date: 'March 22, 1950',
      description: 'FBI Special Agent in Charge Guy Hottel transmitted a third-hand informant account of three recovered "flying saucers" and humanoid occupants in New Mexico to FBI Director J. Edgar Hoover.',
      type: 'creation'
    },
    {
      id: 'hottel-fbi-filing',
      label: 'FBI Internal Filing',
      date: '1950',
      description: 'Memo filed internally within FBI records. No follow-up investigation was initiated. The document remained in FBI administrative files for decades.',
      type: 'classification'
    },
    {
      id: 'hottel-foia',
      label: 'FOIA Availability',
      date: '1977-1990s',
      description: 'Made available through Freedom of Information Act requests to the FBI. Entered public circulation through UAP researchers accessing FBI files via FOIA.',
      type: 'foia'
    },
    {
      id: 'hottel-fbi-vault',
      label: 'FBI Vault Release',
      date: '2011',
      description: 'FBI launched its online "Vault" FOIA database in 2011; the Hottel memo became the most-accessed document in the Vault, receiving major media attention.',
      type: 'public'
    }
  ],

  'ndaa-fy2024-uap-provisions': [
    {
      id: 'ndaa-fy2024-introduction',
      label: 'Congressional Introduction',
      date: '2023',
      description: 'UAP provisions developed through Senate and House Armed Services Committees building on the FY2023 NDAA AARO framework, with new eminent domain, NDA review, and contractor reporting provisions.',
      type: 'creation'
    },
    {
      id: 'ndaa-fy2024-disclosure-act',
      label: 'UAP Disclosure Act Amendment',
      date: 'July 2023',
      description: 'Senators Schumer and Rounds introduced the UAP Disclosure Act of 2023 (S.2226) as an NDAA amendment, proposing a Presidential Review Board modeled on the JFK Records Act.',
      type: 'transfer'
    },
    {
      id: 'ndaa-fy2024-conference-weakening',
      label: 'Conference Committee Weakening',
      date: 'December 2023',
      description: 'House-Senate conference committee stripped the independent Presidential Review Board authority and private contractor material transfer (seizure) provisions before final passage.',
      type: 'transfer'
    },
    {
      id: 'ndaa-fy2024-signed',
      label: 'Signed Into Law',
      date: 'December 22, 2023',
      description: 'President Biden signed the FY2024 NDAA including weakened UAP provisions. Eminent domain authority, NDA review requirements, Elizondo vindication language, and AARO reporting expansions enacted.',
      type: 'public'
    }
  ],

  'dni-annual-report-uap-2024': [
    {
      id: 'dni-uap-2024-mandate',
      label: 'Statutory Mandate',
      date: '2022',
      description: 'Annual ODNI UAP reporting mandated by the FY2022 Intelligence Authorization Act and subsequent NDAA UAP provisions requiring public unclassified annual reports to Congress.',
      type: 'creation'
    },
    {
      id: 'dni-uap-2024-production',
      label: 'AARO Production',
      date: '2024',
      description: 'Produced by AARO under ODNI direction, covering January 1 through December 31, 2023. Coincided with Sean Kirkpatrick\'s final months as AARO director before his December 2023 resignation.',
      type: 'transfer'
    },
    {
      id: 'dni-uap-2024-congressional-briefing',
      label: 'Congressional Briefing',
      date: '2024',
      description: 'Classified annex delivered to congressional intelligence and armed services committees alongside the unclassified public report.',
      type: 'transfer'
    },
    {
      id: 'dni-uap-2024-public-release',
      label: 'Public Release',
      date: 'March 2024',
      description: 'Report released publicly via the ODNI website covering 291 new cases in 2023, bringing the AARO total database above 2,300 entries.',
      type: 'public'
    }
  ]
};

let updated = 0;
let skipped = 0;

for (const doc of docs) {
  if (chains[doc.id]) {
    if (doc.provenance_chain && doc.provenance_chain.length > 0) {
      console.log(`SKIP (already has chain): ${doc.id}`);
      skipped++;
    } else {
      doc.provenance_chain = chains[doc.id];
      console.log(`UPDATED: ${doc.id} -> ${chains[doc.id].length} nodes`);
      updated++;
    }
  }
}

console.log(`\nDone. Updated: ${updated}, Skipped: ${skipped}`);

fs.writeFileSync(docsPath, JSON.stringify(docs, null, 2) + '\n', 'utf8');
console.log('Written to data/documents.json');
