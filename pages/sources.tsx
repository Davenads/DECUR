import type { NextPage } from 'next';
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
            type="Scraped — WordPress API"
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
            name="Papoose Lake Archive"
            url="https://www.papooselake.org"
            type="Scraped"
            typeColor="bg-blue-100 text-blue-700"
            description="Dedicated archive documenting Bob Lazar's timeline at S-4, his public disclosures, and the network of individuals connected to his accounts. Contributes Lazar-specific events to the timeline."
            entries={12}
            coverage="1988 – 2019"
            notes="Source for Lazar-tagged entries in ufotimeline.json. Also used as a primary reference in building the Lazar case file."
          />
        </section>

        {/* Case file sources */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Whistleblower Case File References</h2>
            <p className="text-sm text-gray-500 mt-1">
              Sources consulted in building the manually curated{' '}
              <Link href="/data?category=whistleblowers" className="text-primary hover:underline">Whistleblower</Link>{' '}
              case files. These are reference sources, not scraped datasets.
            </p>
          </div>

          <SourceCard
            name="Burisch Archive"
            url="https://www.burischarchive.com"
            type="Primary Archive"
            typeColor="bg-purple-100 text-purple-700"
            description="Repository of primary documents related to Dan Burisch's testimony, including the Tom Mack Letter, Congressional Record entries, and sworn affidavits. Core documentary basis for the Burisch case file."
            notes="Source URLs preserved in burisch.json document entries."
          />

          <SourceCard
            name="The Bob Lazar Corner (otherhand.org)"
            url="https://www.otherhand.org/home-page/area-51-and-other-places/the-bob-lazar-corner/"
            type="Research / Analysis"
            typeColor="bg-amber-100 text-amber-700"
            description="Technical credibility analysis of Lazar's claims by researcher Dr. David Morgan. Provides structured analysis of the supporting and contradicting evidence used in the Lazar Assessment tab."
          />

          <SourceCard
            name="UAPedia — Bob Lazar"
            url="https://www.uapedia.ai/bob-lazar"
            type="Structured Reference"
            typeColor="bg-teal-100 text-teal-700"
            description="Structured knowledge base entry on Bob Lazar with organized claim summaries, timeline data, and cross-references. Used as a secondary reference during case file construction."
          />

          <SourceCard
            name="Internet Archive — 1989 Lazar Interview"
            url="https://archive.org/details/bob-lazar-1989-interview"
            type="Primary Source"
            typeColor="bg-green-100 text-green-700"
            description="Preserved audio/video of Bob Lazar's original 1989 public disclosure interview. Used to verify claims and quotes documented in the Lazar case file."
          />

          <SourceCard
            name="Sacred Texts — Dreamland Transcript"
            url="https://www.sacred-texts.com/ufo/lazar.htm"
            type="Primary Transcript"
            typeColor="bg-green-100 text-green-700"
            description="Full transcript of the 1989 KLAS-TV Dreamland interview — Lazar's first public appearance. Primary source for direct quotes and initial disclosure claims documented in the case file."
          />

          <SourceCard
            name="SingJuPost — JRE #1315 Transcript"
            url="https://singjupost.com/joe-rogan-and-bob-lazar-transcript-jre-1315/"
            type="Transcript"
            typeColor="bg-gray-100 text-gray-600"
            description="Full transcript of the Joe Rogan Experience episode #1315 featuring Bob Lazar and Jeremy Corbell (June 2019). Used to document and verify Lazar's most recent comprehensive public statements."
            coverage="June 2019"
          />
        </section>

        {/* Methodology */}
        <section className="bg-gray-50 border border-gray-200 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Methodology</h2>

          <div className="space-y-3 text-sm text-gray-700">
            <div>
              <p className="font-semibold text-gray-900 mb-1">Scraped Timeline Data</p>
              <p>
                Timeline entries from ufotimeline.com, openminds.tv, and papooselake.org were retrieved
                via their public APIs or HTML scraping. Every entry preserves a direct link
                (<code className="bg-gray-200 px-1 py-0.5 rounded text-xs">source_url</code>) to its
                originating article. DECUR does not alter the title or content of scraped entries.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-1">Manually Curated Case Files</p>
              <p>
                Whistleblower profiles (Dan Burisch, Bob Lazar) are built by hand from multiple
                primary and secondary sources. Claims, timelines, and assessments are structured
                and organized by DECUR contributors. Supporting and contradicting evidence is
                documented without adjudication — DECUR does not endorse or dismiss any individual claim.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 mb-1">Attribution Policy</p>
              <p>
                All data presented on DECUR is attributed to its origin. Scraped data retains source
                metadata. Case file references are documented in each profile. DECUR is a research
                aggregator — we organize and present information for educational purposes, not as a
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
  );
};

export default Sources;
