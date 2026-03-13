import type { NextPage } from 'next';
import SeoHead from '../components/SeoHead';
import Link from 'next/link';

interface SourceCardProps {
  name: string;
  url: string;
  type: string;
  typeColor: string;
  description: string;
  entries?: number;
  coverage?: string;
  notes?: string;
}

const SourceCard: React.FC<SourceCardProps> = ({
  name, url, type, typeColor, description, entries, coverage, notes,
}) => (
  <div className="bg-white border border-gray-200 rounded-lg p-5 space-y-3">
    <div className="flex items-start justify-between gap-3 flex-wrap">
      <div>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-primary hover:underline text-base"
        >
          {name}
        </a>
        <p className="text-xs text-gray-400 mt-0.5">{url}</p>
      </div>
      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 ${typeColor}`}>
        {type}
      </span>
    </div>

    <p className="text-sm text-gray-700">{description}</p>

    <div className="flex flex-wrap gap-4 text-xs text-gray-500">
      {entries !== undefined && (
        <span><span className="font-semibold text-gray-800">{entries.toLocaleString()}</span> entries</span>
      )}
      {coverage && (
        <span>Coverage: <span className="font-semibold text-gray-800">{coverage}</span></span>
      )}
    </div>

    {notes && (
      <p className="text-xs text-gray-400 italic border-t border-gray-100 pt-2">{notes}</p>
    )}
  </div>
);

const Sources: NextPage = () => {
  return (
    <>
      <SeoHead
        title="Data Sources"
        description="Primary sources, data pipelines, and attribution for DECUR's UAP and NHI research archive."
        path="/sources"
      />
      <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Data Sources</h1>
          <p className="text-gray-500 max-w-2xl">
            All data presented on DECUR is traceable to a documented external source. This page
            catalogs every platform we have drawn from, how the data was obtained, and what it
            contributes to the DECUR dataset.
          </p>
        </div>

        {/* Timeline data sources */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Timeline Data</h2>
            <p className="text-sm text-gray-500 mt-1">
              Sources contributing to the <Link href="/data" className="text-primary hover:underline">Historical Events</Link> database
              ({(385 + 1178 + 12).toLocaleString()} entries total).
              Each entry retains a direct link back to its origin.
            </p>
          </div>

          <SourceCard
            name="Open Minds TV"
            url="https://www.openminds.tv"
            type="Scraped - WordPress API"
            typeColor="bg-blue-100 text-blue-700"
            description="Independent UAP research and journalism outlet covering modern cases, government disclosures, military encounters, and analysis from credentialed researchers. Primary source for post-2009 UAP developments."
            entries={1178}
            coverage="2009 – 2025"
            notes="Data retrieved via the public WordPress REST API. Each entry links directly to the originating article."
          />

          <SourceCard
            name="UFO Timeline"
            url="https://www.ufotimeline.com"
            type="Scraped"
            typeColor="bg-blue-100 text-blue-700"
            description="Comprehensive chronological catalog of UFO/UAP incidents, government acknowledgments, notable quotes, key figures, and media documentation spanning recorded history."
            entries={385}
            coverage="1561 – 2026"
            notes="Data scraped from public article listings. Provides the historical depth of the dataset, including pre-modern era cases."
          />

          <SourceCard
            name="NICAP Chronology"
            url="https://www.nicap.org"
            type="Scraped - HTML"
            typeColor="bg-blue-100 text-blue-700"
            description="National Investigations Committee on Aerial Phenomena. Maintained by Fran Ridge, NICAP's chronology pages document thousands of significant UAP cases cross-referenced with Project Blue Book records, military reports, and primary witness accounts. Considered one of the most rigorously curated civilian UAP databases for the 1947-1989 era."
            entries={251}
            coverage="1947 – 1989"
            notes="Historical events added to the timeline from NICAP chronology pages. Inclusion criteria: Project Blue Book Unknown (BBU) status or direct military/radar involvement, plus a dedicated NICAP case detail page. All 251 entries link directly to their NICAP case file."
          />

          <SourceCard
            name="Papoose Lake Archive"
            url="https://www.papooselake.org"
            type="Scraped"
            typeColor="bg-blue-100 text-blue-700"
            description="Dedicated archive documenting Bob Lazar's timeline at S-4, his public disclosures, and the network of individuals connected to his accounts. Contributes Lazar-specific events to the timeline."
            entries={12}
            coverage="1988 – 2019"
            notes="Source for Lazar-tagged entries in timeline.json. Also used as a primary reference in building the Lazar case file."
          />
        </section>

        {/* Case file sources */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Insider Case File References</h2>
            <p className="text-sm text-gray-500 mt-1">
              Sources consulted in building the manually curated{' '}
              <Link href="/data?category=key-figures" className="text-primary hover:underline">Insider</Link>{' '}
              case files (11 profiles). These are reference sources, not scraped datasets.
            </p>
          </div>

          {/* Burisch */}
          <SourceCard
            name="Burisch Archive"
            url="https://www.burischarchive.com"
            type="Primary Archive"
            typeColor="bg-purple-100 text-purple-700"
            description="Repository of primary documents related to Dan Burisch's testimony, including the Tom Mack Letter, Congressional Record entries, and sworn affidavits. Core documentary basis for the Burisch case file."
            notes="Used for: Dan Burisch. Source URLs preserved in burisch.json document entries."
          />

          {/* Lazar */}
          <SourceCard
            name="The Bob Lazar Corner (otherhand.org)"
            url="https://www.otherhand.org/home-page/area-51-and-other-places/the-bob-lazar-corner/"
            type="Research / Analysis"
            typeColor="bg-amber-100 text-amber-700"
            description="Technical credibility analysis of Lazar's claims by researcher Dr. David Morgan. Provides structured analysis of the supporting and contradicting evidence used in the Lazar Assessment tab."
            notes="Used for: Bob Lazar."
          />

          <SourceCard
            name="UAPedia - Bob Lazar"
            url="https://www.uapedia.ai/bob-lazar"
            type="Structured Reference"
            typeColor="bg-teal-100 text-teal-700"
            description="Structured knowledge base entry on Bob Lazar with organized claim summaries, timeline data, and cross-references. Used as a secondary reference during case file construction."
            notes="Used for: Bob Lazar."
          />

          <SourceCard
            name="Internet Archive - 1989 Lazar Interview"
            url="https://archive.org/details/bob-lazar-1989-interview"
            type="Primary Source"
            typeColor="bg-green-100 text-green-700"
            description="Preserved audio/video of Bob Lazar's original 1989 public disclosure interview. Used to verify claims and quotes documented in the Lazar case file."
            notes="Used for: Bob Lazar."
          />

          <SourceCard
            name="Sacred Texts - Dreamland Transcript"
            url="https://www.sacred-texts.com/ufo/lazar.htm"
            type="Primary Transcript"
            typeColor="bg-green-100 text-green-700"
            description="Full transcript of the 1989 KLAS-TV Dreamland interview, Lazar's first public appearance. Primary source for direct quotes and initial disclosure claims documented in the case file."
            notes="Used for: Bob Lazar."
          />

          <SourceCard
            name="SingJuPost - JRE #1315 Transcript"
            url="https://singjupost.com/joe-rogan-and-bob-lazar-transcript-jre-1315/"
            type="Transcript"
            typeColor="bg-gray-100 text-gray-600"
            description="Full transcript of the Joe Rogan Experience episode #1315 featuring Bob Lazar and Jeremy Corbell (June 2019). Used to document and verify Lazar's most recent comprehensive public statements."
            coverage="June 2019"
            notes="Used for: Bob Lazar."
          />

          {/* Shared modern disclosure */}
          <SourceCard
            name="New York Times - 'Glowing Auras and Black Money' (Dec 2017)"
            url="https://www.nytimes.com/2017/12/16/us/politics/pentagon-program-ufo-harry-reid.html"
            type="Primary Journalism"
            typeColor="bg-green-100 text-green-700"
            description="The December 2017 New York Times investigation that publicly revealed AATIP, the Navy UAP videos, and Luis Elizondo's resignation. The single most consequential piece of modern UAP journalism. Chris Mellon is credited with facilitating release of the videos to the Times."
            coverage="December 2017"
            notes="Used for: Luis Elizondo, Chris Mellon."
          />

          <SourceCard
            name="New York Times - 'No Longer in Shadows' (Oct 2020)"
            url="https://www.nytimes.com/2020/07/23/us/politics/pentagon-ufo-task-force.html"
            type="Primary Journalism"
            typeColor="bg-green-100 text-green-700"
            description="October 2020 New York Times article in which Eric Davis confirmed he briefed a Defense Department agency and members of Congress about 'off-world vehicles not made on this earth.' The most direct on-record statement by a named researcher about crash-retrieved non-human craft."
            coverage="October 2020"
            notes="Used for: Eric Davis."
          />

          <SourceCard
            name="The Debrief - Ross Coulthart / Nathan Wurtzel (June 2023)"
            url="https://thedebrief.org/intelligence-officials-say-u-s-has-retrieved-non-human-craft/"
            type="Primary Journalism"
            typeColor="bg-green-100 text-green-700"
            description="The June 2023 article in The Debrief that first publicly identified David Grusch as a whistleblower who filed a formal Disclosure of Urgent Concern with the IC Inspector General regarding classified UAP crash retrieval programs."
            coverage="June 2023"
            notes="Used for: David Grusch."
          />

          <SourceCard
            name="U.S. House Oversight Committee - July 2023 UAP Hearing"
            url="https://oversight.house.gov/hearing/unidentified-anomalous-phenomena-implications-on-national-security-public-safety-and-government-transparency/"
            type="Government / Congressional Record"
            typeColor="bg-blue-100 text-blue-700"
            description="Official record of the July 26, 2023 House Oversight Subcommittee hearing on UAP, featuring sworn testimony from David Grusch, David Fravor, Ryan Graves, and Karl Nell. Includes written statements, oral testimony, and member Q&A transcripts."
            coverage="July 26, 2023"
            notes="Used for: David Grusch, David Fravor, Karl Nell."
          />

          <SourceCard
            name="The Drive / The War Zone"
            url="https://www.thedrive.com/the-war-zone"
            type="Investigative Journalism"
            typeColor="bg-amber-100 text-amber-700"
            description="Tyler Rogoway's defense and aviation reporting unit at The Drive, producing the most technically rigorous investigative UAP journalism. Primary source for Nimitz encounter documentation, FOIA-released UAP reports, and the AATIP/AAWSAP program history."
            notes="Used for: David Fravor, Luis Elizondo."
          />

          <SourceCard
            name="To The Stars Academy"
            url="https://www.tothestarsacademy.com"
            type="Organization Archive"
            typeColor="bg-teal-100 text-teal-700"
            description="TTSA's official website and publication archive. Primary source for organizational structure, membership biographies, public disclosures, and the TTSA multimedia releases that include the Navy UAP videos."
            notes="Used for: Luis Elizondo, Hal Puthoff, Chris Mellon."
          />

          <SourceCard
            name="Sol Foundation"
            url="https://www.sol-foundation.org"
            type="Organization Archive"
            typeColor="bg-teal-100 text-teal-700"
            description="The Stanford-affiliated academic UAP research organization co-founded by Karl Nell, David Grusch, and Dr. Garry Nolan. Symposium proceedings, member biographies, and published papers were used to document the Sol Foundation sections across multiple case files."
            notes="Used for: Karl Nell, David Grusch, Garry Nolan."
          />

          <SourceCard
            name="Stanford University - Nolan Lab"
            url="https://nolan-lab.stanford.edu"
            type="Academic"
            typeColor="bg-purple-100 text-purple-700"
            description="Dr. Garry Nolan's laboratory page at Stanford School of Medicine, documenting his research positions, publications, patent portfolio, and academic biography. Used to establish his institutional credentials and research history."
            notes="Used for: Garry Nolan."
          />

          <SourceCard
            name="CIA CREST Database - STARGATE Program Documents"
            url="https://www.cia.gov/readingroom/collection/stargate"
            type="Declassified Government"
            typeColor="bg-blue-100 text-blue-700"
            description="CIA's declassified STARGATE remote viewing program documents, available through the CIA FOIA Reading Room. Primary source for the SRI International remote viewing program history, Puthoff's directorship, and program findings (1972-1995)."
            notes="Used for: Hal Puthoff."
          />

          <SourceCard
            name="DIA AAWSAP DIRD Collection (FOIA)"
            url="https://www.dia.mil/FOIA/FOIA-Electronic-Reading-Room/"
            type="Declassified Government"
            typeColor="bg-blue-100 text-blue-700"
            description="Declassified Defense Intelligence Reference Documents produced under the AAWSAP program (2007-2012), released via FOIA. Confirmed authorship of 38 papers including documents by Hal Puthoff and Eric Davis covering warp drives, wormholes, and related exotic physics."
            notes="Used for: Hal Puthoff, Eric Davis."
          />

          <SourceCard
            name="ChrisMellon.net / Substack"
            url="https://www.christophermellon.net"
            type="Primary Source"
            typeColor="bg-green-100 text-green-700"
            description="Chris Mellon's personal website and Substack publication. Primary source for his analysis of UAP program budget line items, legislative strategy, and documentation of Congressional advocacy efforts. Includes Washington Post op-eds and policy papers."
            notes="Used for: Chris Mellon."
          />

          <SourceCard
            name="Wilson-Davis Memo (leaked document, June 2019)"
            url="https://richarddolanmembers.com/articles/the-wilson-leak-and-the-extraordinary-claim/"
            type="Leaked Document"
            typeColor="bg-red-100 text-red-600"
            description="15-page document recording physicist Eric Davis's notes from an alleged 2002 meeting with Vice Admiral Thomas R. Wilson about a private aerospace contractor running a UAP crash retrieval program. Leaked to the TTSA community platform in June 2019; extensively analyzed by UAP researchers for authenticity. Wilson has denied the account."
            coverage="October 2002 (alleged); June 2019 (leaked)"
            notes="Used for: Eric Davis. Document status: disputed — see Davis case file Wilson-Davis Memo tab."
          />
        </section>

        {/* Methodology */}
        <section className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Methodology</h2>

          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Scraped Timeline Data</p>
              <p>
                Timeline entries from ufotimeline.com, openminds.tv, papooselake.org, and nicap.org were retrieved
                via their public APIs or HTML scraping. Every entry preserves a direct link
                (<code className="bg-gray-200 px-1 py-0.5 rounded text-xs">source_url</code>) to its
                originating article. DECUR does not alter the title or content of scraped entries.
                NICAP entries additionally carry a <code className="bg-gray-200 px-1 py-0.5 rounded text-xs">source: &quot;nicap&quot;</code> field
                for provenance tracking.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-1">Manually Curated Case Files</p>
              <p>
                Insider profiles (Dan Burisch, Bob Lazar, David Grusch, Luis Elizondo, David Fravor,
                Karl Nell, Garry Nolan, Hal Puthoff, Chris Mellon, Eric Davis, and others) are built
                by hand from multiple primary and secondary sources. Claims, timelines, and assessments
                are structured and organized by DECUR contributors. Supporting and contradicting
                evidence is documented without adjudication; DECUR does not endorse or dismiss any
                individual claim.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-1">Attribution Policy</p>
              <p>
                All data presented on DECUR is attributed to its origin. Scraped data retains source
                metadata. Case file references are documented in each profile. DECUR is a research
                aggregator; we organize and present information for educational purposes, not as a
                primary publisher.
              </p>
            </div>
          </div>
        </section>

        {/* Disclaimer */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Disclaimer</p>
          <p className="text-sm text-amber-900">
            DECUR presents third-party information for educational and research purposes only.
            Inclusion of a source does not constitute endorsement of its content or editorial position.
            Source availability and content may change after the time of data collection.
          </p>
        </div>

      </div>
    </div>
    </>
  );
};

export default Sources;
