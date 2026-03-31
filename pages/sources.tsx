import type { NextPage } from 'next';
import SeoHead from '../components/SeoHead';
import Link from 'next/link';

interface FeaturedSourceProps {
  name: string;
  url: string;
  institution: string;
  type: string;
}

const FeaturedSource: React.FC<FeaturedSourceProps> = ({ name, url, institution, type }) => (
  <a
    href={url}
    target="_blank"
    rel="noopener noreferrer"
    className="flex flex-col gap-1.5 bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4 hover:border-blue-400 dark:hover:border-blue-600 transition-colors group"
  >
    <div className="flex items-start justify-between gap-2">
      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100 group-hover:text-primary transition-colors leading-snug">{name}</span>
      <span className="text-xs px-2 py-0.5 rounded-full font-medium shrink-0 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300">{type}</span>
    </div>
    <span className="text-xs text-gray-500 dark:text-gray-400">{institution}</span>
  </a>
);

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
  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-5 space-y-3">
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
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{url}</p>
      </div>
      <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 ${typeColor}`}>
        {type}
      </span>
    </div>

    <p className="text-sm text-gray-700 dark:text-gray-300">{description}</p>

    <div className="flex flex-wrap gap-4 text-xs text-gray-500 dark:text-gray-400">
      {entries !== undefined && (
        <span><span className="font-semibold text-gray-800 dark:text-gray-200">{entries.toLocaleString()}</span> entries</span>
      )}
      {coverage && (
        <span>Coverage: <span className="font-semibold text-gray-800 dark:text-gray-200">{coverage}</span></span>
      )}
    </div>

    {notes && (
      <p className="text-xs text-gray-400 dark:text-gray-500 italic border-t border-gray-100 dark:border-gray-700 pt-2">{notes}</p>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Data Sources</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            All data presented on DECUR is traceable to a documented external source. This page
            catalogs every platform we have drawn from, how the data was obtained, and what it
            contributes to the DECUR dataset.
          </p>
        </div>

        {/* Featured government sources */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Primary Institutional Sources</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Official government records, FOIA releases, and institutional archives form the evidentiary backbone of DECUR&apos;s data. These are the highest-authority sources drawn from across all platform sections.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <FeaturedSource
              name="National Archives - Project Blue Book Files"
              url="https://www.archives.gov/research/military/air-force/ufos"
              institution="U.S. National Archives and Records Administration"
              type="Primary Government Archive"
            />
            <FeaturedSource
              name="ODNI UAP Preliminary Assessment (June 2021)"
              url="https://www.dni.gov/files/ODNI/documents/assessments/Prelimary-Assessment-UAP-20210625.pdf"
              institution="Office of the Director of National Intelligence"
              type="Official Government Report"
            />
            <FeaturedSource
              name="AARO Historical Record Report Vol. 1 (March 2024)"
              url="https://www.aaro.mil/Portals/136/PDFs/UAP_Historical_Record_Report_Vol1_20240306.pdf"
              institution="All-domain Anomaly Resolution Office (DoD)"
              type="Official Government Report"
            />
            <FeaturedSource
              name="CIA CREST Database - STARGATE Program Documents"
              url="https://www.cia.gov/readingroom/collection/stargate"
              institution="Central Intelligence Agency FOIA Reading Room"
              type="FOIA / Declassified"
            />
            <FeaturedSource
              name="FBI Records: The Vault - Hottel Memo (1950)"
              url="https://vault.fbi.gov/hottel_memo"
              institution="Federal Bureau of Investigation"
              type="Declassified Government"
            />
            <FeaturedSource
              name="House Oversight Committee - July 2023 UAP Hearing"
              url="https://oversight.house.gov/hearing/unidentified-anomalous-phenomena-implications-on-national-security-public-safety-and-government-transparency/"
              institution="U.S. House Committee on Oversight and Government Reform"
              type="Congressional Record"
            />
            <FeaturedSource
              name="DIA AAWSAP DIRD Collection (FOIA)"
              url="https://www.dia.mil/FOIA/FOIA-Electronic-Reading-Room/"
              institution="Defense Intelligence Agency"
              type="FOIA / Declassified"
            />
            <FeaturedSource
              name="NDAA FY2024 - UAP Provisions"
              url="https://www.congress.gov/bill/118th-congress/house-bill/2670/text"
              institution="U.S. Congress (congress.gov)"
              type="Official Government"
            />
          </div>
        </section>

        {/* Timeline data sources */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Timeline Data</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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

          <SourceCard
            name="Wonders in the Sky: Unexplained Aerial Objects from Antiquity to Modern Times (Vallee & Aubeck, 2009)"
            url="https://www.amazon.com/Wonders-Sky-Unexplained-Antiquity-Modern/dp/1585427683"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="The most scholarly systematic treatment of pre-modern UAP accounts, authored by Jacques Vallee and Chris Aubeck. Documents and cross-references 500 cases from 1460 to 1879 against primary historical sources - ecclesiastical records, astronomical journals, and newspaper archives. Reference basis for the 1759 Jacobsson entry in the DECUR timeline."
            coverage="1460 – 1879"
            notes="Reference for historically documented pre-modern accounts. Provides primary source citations for each case."
          />

          <SourceCard
            name="Journal of the Royal Astronomical Society of Canada - Chant (1913)"
            url="https://archive.org/details/journalofroyal07roya"
            type="Academic Journal"
            typeColor="bg-teal-100 text-teal-700"
            description="Dr. Clarence Chant's compiled witness account of the February 9, 1913 Procession of Meteors, published in Vol. VII of the RASC Journal. The primary academic documentation of a formation of luminous objects traveling in near-horizontal trajectory from Saskatchewan to Bermuda - anomalous behavior for meteoric phenomena. Used for the 1913 Procession timeline entry."
            coverage="February 9, 1913"
            notes="Primary academic source for the 1913 Procession of Meteors (Cyrillids) timeline entry."
          />

          <SourceCard
            name="U.S. Navy Historical Records - USS Supply Log (1904)"
            url="https://en.wikipedia.org/wiki/USS_Supply_incident_(1904)"
            type="Primary Government Record"
            typeColor="bg-blue-100 text-blue-700"
            description="Official Navy log entry filed February 28, 1904 by Lt. Frank H. Schofield documenting the observation of three luminous objects from the USS Supply approximately 300 miles off the California coast. One of the earliest on-record military UAP reports by a named officer. Schofield later rose to Commander in Chief, U.S. Pacific Fleet. Used for the 1904 USS Supply timeline entry."
            coverage="February 28, 1904"
            notes="Primary source for the 1904 USS Supply Aerial Encounter timeline entry. Original held in National Archives RG24."
          />
        </section>

        {/* Case file sources */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Key Figure Profile Sources</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sources consulted in building the manually curated{' '}
              <Link href="/data?category=key-figures" className="text-primary hover:underline">Key Figure</Link>{' '}
              profiles (60+ figures). These are reference sources, not scraped datasets. The sources listed here represent core profile references; not all 60+ figures are fully enumerated.
            </p>
          </div>

          {/* Robert Monroe */}
          <SourceCard
            name="Journeys Out of the Body - Robert Monroe (1971)"
            url="https://www.amazon.com/Journeys-Out-Body-Robert-Monroe/dp/0385008619"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Foundational text that coined the modern term 'out-of-body experience.' Documents Monroe's decade of systematic OBE research and introduces the Hemi-Sync methodology."
            notes="Used for: Robert Monroe."
          />
          <SourceCard
            name="CIA - Analysis and Assessment of Gateway Process (1983, declassified 2003)"
            url="https://www.cia.gov/readingroom/document/cia-rdp96-00788r001700210016-5"
            type="Government Document"
            typeColor="bg-yellow-100 text-yellow-700"
            description="Declassified 29-page CIA/Army document formally evaluating Monroe's Gateway Process for intelligence applications. Concludes the methods are 'plausible in terms of physical science.' Page 25 permanently withheld."
            notes="Used for: Robert Monroe."
          />
          <SourceCard
            name="Far Journeys - Robert Monroe (1985)"
            url="https://www.amazon.com/Far-Journeys-Robert-Monroe/dp/0385231822"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Monroe's second book describing INSPEC entity encounters during deep OBE sessions. Primary source for his NHI contact claims."
            notes="Used for: Robert Monroe."
          />

          {/* Joe McMoneagle */}
          <SourceCard
            name="The Stargate Chronicles: Memoirs of a Psychic Spy - Joseph McMoneagle (2002)"
            url="https://www.amazon.com/Stargate-Chronicles-Joseph-McMoneagle/dp/1571742255"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Primary source for McMoneagle's operational session accounts including the Typhoon submarine description, General Dozier location, and Skylab re-entry prediction. The most detailed first-person account of Army STAR GATE operations."
            notes="Used for: Joseph McMoneagle."
          />
          <SourceCard
            name="Joe McMoneagle - Psi Encyclopedia"
            url="https://psi-encyclopedia.spr.ac.uk/articles/joe-mcmoneagle/"
            type="Research Archive"
            typeColor="bg-green-100 text-green-700"
            description="Academic summary of McMoneagle's experimental record, Legion of Merit background, and published work. Used for biographical verification and credibility context."
            notes="Used for: Joseph McMoneagle."
          />

          {/* Ingo Swann */}
          <SourceCard
            name="Penetration: The Question of Extraterrestrial and Human Telepathy - Ingo Swann (1998)"
            url="https://www.amazon.com/Penetration-Question-Extraterrestrial-Human-Telepathy/dp/0966767403"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Primary source for Swann's UAP-specific claims including the clandestine government agency, moon base remote viewing session, and Alaskan lake encounter. Swann states verbal secrecy agreements from the 1970s had expired by publication."
            notes="Used for: Ingo Swann."
          />
          <SourceCard
            name="CIA CREST Collection - STAR GATE Remote Viewing Program Documents"
            url="https://www.cia.gov/readingroom/collection/stargate"
            type="Government Archive"
            typeColor="bg-yellow-100 text-yellow-700"
            description="Declassified CIA Reading Room collection of STAR GATE program documents including session transcripts, program evaluations, and the 1995 AIR review that led to termination."
            notes="Used for: Ingo Swann."
          />
          <SourceCard
            name="Puthoff and Targ - Information Transmission Under Conditions of Sensory Shielding (Nature, 1974)"
            url="https://www.nature.com/articles/251602a0"
            type="Academic Paper"
            typeColor="bg-indigo-100 text-indigo-700"
            description="Landmark peer-reviewed Nature paper documenting SRI remote viewing experiments. Includes the Jupiter experimental data and is the foundational academic record of Swann's program participation."
            notes="Used for: Ingo Swann."
          />

          {/* Beatriz Villarroel */}
          <SourceCard
            name="VASCO Paper I - The Astronomical Journal (Villarroel et al., 2020)"
            url="https://arxiv.org/abs/1911.05068"
            type="Academic Paper"
            typeColor="bg-indigo-100 text-indigo-700"
            description="Foundational VASCO methodology paper comparing USNO-B1.0 against Pan-STARRS DR1. Documents 798 genuinely vanished objects from 15,593+ manually reviewed plate pairs."
            notes="Used for: Dr. Beatriz Villarroel."
          />
          <SourceCard
            name="A bright triple transient that vanished within 50 min - MNRAS (Villarroel et al., 2024)"
            url="https://academic.oup.com/mnras/article/527/3/6312/7457759"
            type="Academic Paper"
            typeColor="bg-indigo-100 text-indigo-700"
            description="Documents the July 19, 1952 triple co-located transient coinciding with the Washington D.C. UFO flap and presents the 22-sigma shadow-avoidance statistical result."
            notes="Used for: Dr. Beatriz Villarroel."
          />
          <SourceCard
            name="Transients in the POSS-I associated with nuclear testing and UAP - Scientific Reports (2025)"
            url="https://www.nature.com/articles/s41598-025-21620-3"
            type="Academic Paper"
            typeColor="bg-indigo-100 text-indigo-700"
            description="Statistical analysis finding POSS-I transients 45% more frequent within one day of above-ground nuclear tests and correlating with historical UAP report volumes."
            notes="Used for: Dr. Beatriz Villarroel."
          />
          <SourceCard
            name="ExoProbe: A Cost-Effective Search for Extraterrestrial Probes - MNRAS (2025)"
            url="https://academic.oup.com/mnras/article/546/2/staf1158/8221885"
            type="Academic Paper"
            typeColor="bg-indigo-100 text-indigo-700"
            description="Real-time detection network proof-of-concept using Earth's shadow to filter satellites, analyzing 200,000+ Zwicky Transient Facility images."
            notes="Used for: Dr. Beatriz Villarroel."
          />

          {/* Kevin Knuth */}
          <SourceCard
            name="Estimating Flight Characteristics of Anomalous UAVs - Entropy (Knuth et al., 2019)"
            url="https://www.mdpi.com/1099-4300/21/10/939"
            type="Academic Paper"
            typeColor="bg-indigo-100 text-indigo-700"
            description="Peer-reviewed physics analysis of documented UAP cases finding accelerations of 100 to 1,000+ g with no sonic booms or thermal signatures. The most-cited academic paper specifically calculating UAP flight performance."
            notes="Used for: Dr. Kevin Knuth."
          />
          <SourceCard
            name="The New Science of Unidentified Aerospace-Undersea Phenomena - Progress in Aerospace Sciences (2025)"
            url="https://arxiv.org/abs/2502.06794"
            type="Academic Paper"
            typeColor="bg-indigo-100 text-indigo-700"
            description="Flagship 2025 collaborative framework paper with 30+ co-authors establishing empirical methods for UAP investigation. Knuth is lead author."
            notes="Used for: Dr. Kevin Knuth."
          />

          {/* Matt Szydagis */}
          <SourceCard
            name="Initial Results from the First Field Expedition of UAPx - Progress in Aerospace Sciences (Szydagis et al., 2025)"
            url="https://www.semanticscholar.org/paper/Initial-results-from-the-first-field-expedition-of-Szydagis-Knuth/29ccad2a0081bf577c89210a3b327bae4c370f09"
            type="Academic Paper"
            typeColor="bg-indigo-100 text-indigo-700"
            description="First peer-reviewed report of an academic instrumented UAP field expedition. Documents the 2021 Laguna Beach multi-sensor campaign with electromagnetic, optical, and environmental detectors. Szydagis is first author."
            notes="Used for: Dr. Matt Szydagis."
          />

          {/* David Spergel */}
          <SourceCard
            name="NASA UAP Independent Study Team Final Report (September 2023)"
            url="https://www.nasa.gov/news-release/update-nasa-shares-uap-independent-study-report-names-director/"
            type="Government Report"
            typeColor="bg-yellow-100 text-yellow-700"
            description="Official report of the 16-member panel chaired by Spergel. Concluded no evidence of extraterrestrial origin; identified data quality and sensor calibration gaps as the primary scientific barriers; recommended NASA leverage existing assets and establish civilian UAP reporting infrastructure."
            notes="Used for: Dr. David Spergel."
          />
          <SourceCard
            name="David Spergel Selected as NASA UAP Study Chair - Princeton University"
            url="https://web.astro.princeton.edu/news/astrophysicist-david-spergel-selected-chair-nasa-team-studying-unidentified-aerial-phenomena"
            type="Press Release"
            typeColor="bg-yellow-100 text-yellow-700"
            description="Princeton University announcement of Spergel's appointment to chair the NASA UAP panel, including career context and Spergel's own statement about the professional risk of the role."
            notes="Used for: Dr. David Spergel."
          />

          {/* Hakan Kayal */}
          <SourceCard
            name="Novel onboard data processing strategies on nanosatellite SONATE-2 - SPIE Proceedings (Kayal et al., 2025)"
            url="https://www.spiedigitallibrary.org/conference-proceedings-of-spie/13546/3062655/Novel-onboard-data-processing-strategies-on-nanosatellite-SONATE-2/10.1117/12.3062655.full"
            type="Academic Paper"
            typeColor="bg-indigo-100 text-indigo-700"
            description="Peer-reviewed report on SONATE-2's onboard AI performance for anomalous object detection from low Earth orbit. SONATE-2 is the first academic satellite with an explicit UAP anomaly detection mission."
            notes="Used for: Prof. Hakan Kayal."
          />
          <SourceCard
            name="German University Center Includes UAP Study - Leonard David"
            url="https://www.leonarddavid.com/german-university-center-includes-study-of-unidentified-aerial-phenomenon/"
            type="News Article"
            typeColor="bg-orange-100 text-orange-700"
            description="Coverage of IFEX founding at the University of Wurzburg as the first European academic institution to formally incorporate UAP into its research mandate. Documents Kayal's rationale and research infrastructure."
            notes="Used for: Prof. Hakan Kayal."
          />

          {/* Jeffrey Kripal */}
          <SourceCard
            name="How to Think Impossibly: About Souls, UFOs, Time, Belief, and Everything Else - Kripal (2024)"
            url="https://press.uchicago.edu/ucp/books/book/chicago/H/bo216049049.html"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Kripal's most direct engagement with UAP as an epistemological challenge. Argues extraordinary phenomena require moving beyond both literal belief and dismissal - published by University of Chicago Press."
            notes="Used for: Dr. Jeffrey Kripal."
          />
          <SourceCard
            name="Archives of the Impossible - Rice University (Jeffrey Kripal profile)"
            url="https://impossiblearchives.rice.edu/jeffrey-j-kripal"
            type="Research Archive"
            typeColor="bg-green-100 text-green-700"
            description="Primary institutional biography and overview of the Archives of the Impossible at Rice University, one of the world's largest academic repositories of UAP and contact research materials."
            notes="Used for: Dr. Jeffrey Kripal."
          />

          {/* Robert Powell */}
          <SourceCard
            name="UFOs: A Scientist Explains What We Know (And Don't Know) - Powell (2024)"
            url="https://www.amazon.com/UFOs-Scientist-Explains-What-Know/dp/1538173581"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Powell's comprehensive 2024 overview of UAP evidence, government programs, and scientific analysis. Covers radar data, sensor corroboration, and the history of official UAP investigation."
            notes="Used for: Robert Powell."
          />
          <SourceCard
            name="SCU Stephenville Lights Radar Analysis - Scientific Coalition for UAP Studies (2008)"
            url="https://www.explorescu.org/post/stephenville-lights"
            type="Research Report"
            typeColor="bg-green-100 text-green-700"
            description="Landmark FOIA radar analysis of the 2008 Stephenville, Texas UAP sightings, documenting an unidentified high-speed object with no flight plan or transponder. Primary source for Powell's analytical methodology."
            notes="Used for: Robert Powell."
          />

          {/* Alexander Wendt */}
          <SourceCard
            name="Sovereignty and the UFO - Political Theory (Wendt & Duvall, 2008)"
            url="https://journals.sagepub.com/doi/abs/10.1177/0090591708317902"
            type="Academic Paper"
            typeColor="bg-indigo-100 text-indigo-700"
            description="The first peer-reviewed article in a major political science journal to treat UFOs as a governance problem. Argues the UFO taboo is structurally produced by anthropocentric sovereignty assumptions. Co-authored with Raymond Duvall."
            notes="Used for: Dr. Alexander Wendt."
          />

          {/* Gary McKinnon */}
          <SourceCard
            name="The Hacker - Jon Ronson, The Guardian (2006)"
            url="https://www.theguardian.com/technology/2005/jul/09/hacking.ufo"
            type="News Article"
            typeColor="bg-orange-100 text-orange-700"
            description="Primary journalistic account of McKinnon's motivations and claims, including the NASA Building 8 photograph and Non-Terrestrial Officers spreadsheet. One of the most widely cited primary accounts."
            notes="Used for: Gary McKinnon."
          />
          <SourceCard
            name="Project Camelot - Gary McKinnon Interview (2006)"
            url="https://www.youtube.com/watch?v=OmXaGwmWADU"
            type="Video Interview"
            typeColor="bg-blue-100 text-blue-700"
            description="Extended primary source interview in which McKinnon details the Non-Terrestrial Officers claim, the Building 8 photograph, and his intrusion methodology across 97 US government systems."
            notes="Used for: Gary McKinnon."
          />
          <SourceCard
            name="US Department of Justice - McKinnon Indictment (2002)"
            url="https://www.justice.gov/archive/usao/vae/ArchivePress/NovemberPDFs/McKinnon-indictment.pdf"
            type="Government Document"
            typeColor="bg-yellow-100 text-yellow-700"
            description="Primary legal record of seven computer fraud charges filed in the Eastern District of Virginia. Establishes the 97 systems accessed and $700,000 damage figure central to the extradition case."
            notes="Used for: Gary McKinnon."
          />
          <SourceCard
            name="Theresa May Statement - UK Parliament Hansard (Oct 2012)"
            url="https://hansard.parliament.uk/commons/2012-10-16/debates/12101638000001/GaryMcKinnonExtradition"
            type="Government Record"
            typeColor="bg-yellow-100 text-yellow-700"
            description="Official parliamentary record of Home Secretary Theresa May's decision to block McKinnon's extradition to the United States, citing human-rights grounds and Asperger syndrome diagnosis."
            notes="Used for: Gary McKinnon."
          />

          {/* Mathew Bevan */}
          <SourceCard
            name="Mathew Bevan - Wikipedia"
            url="https://en.wikipedia.org/wiki/Mathew_Bevan"
            type="Research Archive"
            typeColor="bg-green-100 text-green-700"
            description="Primary reference for Bevan's biographical details, arrest timeline, charges, and post-acquittal career in security consulting."
            notes="Used for: Mathew Bevan."
          />
          <SourceCard
            name="UK Hacker Says He Found Anti-Gravity Engine File At W/P AFB - Bibliotecapleyades"
            url="https://www.bibliotecapleyades.net/ciencia/secret_projects/project159.htm"
            type="News Article"
            typeColor="bg-orange-100 text-orange-700"
            description="Primary source for Bevan's anti-gravity engine claim and Hangar 18 interrogation account, describing a working prototype using a heavy element found in Wright-Patterson AFB systems."
            notes="Used for: Mathew Bevan."
          />
          <SourceCard
            name="Bevan Overview - UFO Hackers"
            url="https://www.ufohackers.org/hackers/mathew-bevan/bevan-overview"
            type="Research Archive"
            typeColor="bg-green-100 text-green-700"
            description="Dedicated case overview with details of Bevan's methods, charges, the Datastream Cowboy partnership, and post-acquittal career."
            notes="Used for: Mathew Bevan."
          />

          {/* Clifford Stone */}
          <SourceCard
            name="Eyes Only: The Story of Clifford Stone and UFO Crash Retrievals (Stone, 2012)"
            url="https://www.amazon.com/Eyes-Only-Story-Clifford-Retrievals/dp/1467958670"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Stone's primary written disclosure. First-person account of his claimed 22-year crash retrieval career under Project Moon Dust and Operation Blue Fly, co-authored with Paola Leopizzi Harris."
            notes="Used for: Clifford Stone."
          />
          <SourceCard
            name="Project Moon Dust FOIA Documents - Kevin Randle / NICAP"
            url="https://www.nicap.org/moondust.htm"
            type="Research Archive"
            typeColor="bg-green-100 text-green-700"
            description="Documents the Stone-Bingaman FOIA sequence and the Air Force's 1992 admission through Colonel Mattingley that Moon Dust and Blue Fly programs existed - the primary verified element of Stone's case."
            notes="Used for: Clifford Stone."
          />
          <SourceCard
            name="Cliff Stone Has Died - Kevin Randle (A Different Perspective, 2021)"
            url="http://kevinrandle.blogspot.com/2021/02/cliff-stone-has-died.html"
            type="News Article"
            typeColor="bg-orange-100 text-orange-700"
            description="Memorial post from credible skeptical UAP researcher Kevin Randle, acknowledging Stone's role in forcing the official Moon Dust and Blue Fly admission while noting his reservations about Stone's personal claims."
            notes="Used for: Clifford Stone."
          />

          {/* John Ramirez */}
          <SourceCard
            name="GS-15 CIA Officer John Ramirez - Sasquatch Chronicles (2021)"
            url="https://sasquatchchronicles.com/gs-15-cia-officer-john-ramirez/"
            type="News Article"
            typeColor="bg-orange-100 text-orange-700"
            description="Primary reference for Ramirez's career summary and public profile. Cites a vetted DoD source confirming his CIA employment, establishing the credibility of his professional background."
            notes="Used for: John Ramirez."
          />
          <SourceCard
            name="Ross Coulthart - Air Force Derived Technology Statement (Twitter/X, Nov 2022)"
            url="https://x.com/rosscoulthart/status/1595739137096974336"
            type="News Article"
            typeColor="bg-orange-100 text-orange-700"
            description="Coulthart reports Ramirez's claim that the Air Force withholds UAP data to protect derived-technology programs - his most specific structural disclosure."
            notes="Used for: John Ramirez."
          />

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

          <SourceCard
            name="StantonFriedman.com - Official Website"
            url="http://www.stantonfriedman.com"
            type="Primary Archive"
            typeColor="bg-purple-100 text-purple-700"
            description="Friedman's own website preserving his bibliography, lecture schedule archive, research papers, and public statements spanning five decades of UAP investigation. Primary reference for career timeline and publication record."
            notes="Used for: Stanton Friedman."
          />

          <SourceCard
            name="Flying Saucers and Science (Friedman, 2008)"
            url="https://www.amazon.com/Flying-Saucers-Science-Physicist-Investigates/dp/1601630115"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Friedman's nuclear physics-based analysis of UAP propulsion, interstellar travel feasibility, and the scientific case for extraterrestrial origin. His most technically rigorous publication and the primary source for the physics-based sections of his profile."
            notes="Used for: Stanton Friedman."
          />

          <SourceCard
            name="Top Secret/MAJIC (Friedman, 1996)"
            url="https://www.amazon.com/Top-SecretMajic-Stanton-T-Friedman/dp/1569248079"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Friedman's comprehensive analysis of the MJ-12 briefing documents. Applied historical document methodology to the authenticity question. Primary source for the MJ-12 sections of his profile and for context on the document dispute."
            notes="Used for: Stanton Friedman."
          />

          <SourceCard
            name="Galileo Project - Harvard University"
            url="https://projects.iq.harvard.edu/galileo"
            type="Academic Institution"
            typeColor="bg-green-100 text-green-700"
            description="Official Galileo Project homepage at Harvard, documenting the project's multi-sensor observatory methodology, peer-reviewed publications, and findings. Primary source for Avi Loeb's Galileo Project profile sections."
            notes="Used for: Avi Loeb."
          />

          <SourceCard
            name="Extraterrestrial: The First Sign of Intelligent Life Beyond Earth (Loeb, 2021)"
            url="https://www.amazon.com/Extraterrestrial-First-Sign-Intelligent-Beyond/dp/0358278147"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Loeb's international bestseller arguing for rigorous scientific investigation of potential extraterrestrial technological artifacts. Primary source for his 'Oumuamua analysis and public advocacy positions documented in his profile."
            notes="Used for: Avi Loeb."
          />

          <SourceCard
            name="NICAP.org - Case Files and Chronology"
            url="https://www.nicap.org"
            type="Research Archive"
            typeColor="bg-amber-100 text-amber-700"
            description="National Investigations Committee on Aerial Phenomena's digitized case files, organizational history, and chronology pages. Primary source for Donald Keyhoe's NICAP directorship period and the Levelland, Texas case documentation."
            notes="Used for: Donald Keyhoe, Levelland 1957 case."
          />

          <SourceCard
            name="UFOs and the National Security State, Vol. 1 (Dolan, 2002)"
            url="https://www.amazon.com/UFOs-National-Security-State-Chronology/dp/1571743561"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Historian Richard Dolan's foundational two-volume history of government UAP involvement and civilian research organizations. The most comprehensive published account of the Keyhoe/NICAP era. Used as the primary secondary source for Keyhoe's profile."
            notes="Used for: Donald Keyhoe."
          />

          <SourceCard
            name="UFOs and the National Security State Volume 2: The Cover-Up Exposed 1973-1991 - Dolan (2009)"
            url="https://www.amazon.com/UFOs-National-Security-State-Vol/dp/0967799511"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Second volume of Dolan's historical series covering 1973-1991. Documents contractor involvement, Bentwaters/Rendlesham, JAL 1628, Cash-Landrum, and MJ-12 controversy. Paired with Volume 1, constitutes the most comprehensive open-source history of UAP program suppression."
            notes="Used for: Dolan Vol. 2 resource entry."
          />

          <SourceCard
            name="The Day After Roswell (Corso, Birnes - 1997)"
            url="https://www.simonandschuster.com/books/The-Day-After-Roswell/Philip-J-Corso/9780671009830"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Philip Corso's memoir co-authored with William J. Birnes, detailing his claimed role managing Roswell crash debris at the Pentagon's Foreign Technology Division and seeding artifacts to private contractors. New York Times bestseller and primary source for the Corso profile."
            notes="Used for: Philip Corso."
          />

          <SourceCard
            name="Disclosure Project - National Press Club 2001 (C-SPAN)"
            url="https://www.c-span.org/video/?163766-1/ufo-research"
            type="Primary Video Archive"
            typeColor="bg-green-100 text-green-700"
            description="C-SPAN recording of the May 9, 2001 Disclosure Project National Press Club event organized by Steven Greer, featuring testimony from 20+ former military and government witnesses. Primary source for the Greer profile's disclosure event documentation."
            coverage="May 9, 2001"
            notes="Used for: Steven Greer, Daniel Sheehan."
          />

          <SourceCard
            name="UFOs and Nukes - Official Research Website (Hastings)"
            url="https://www.ufos-nukes.com"
            type="Primary Research Archive"
            typeColor="bg-amber-100 text-amber-700"
            description="Robert Hastings's official research site documenting UAP incidents at nuclear weapons facilities, with FOIA-obtained military documents, veteran testimony summaries, and case-by-case analysis. Primary source for the Hastings profile and for the Minot AFB 1968 case documentation."
            notes="Used for: Robert Hastings, Minot AFB 1968."
          />

          <SourceCard
            name="AARO Senate Testimony - Kirkpatrick (April 2023)"
            url="https://www.armed-services.senate.gov/hearings/to-receive-testimony-on-the-mission-of-the-all-domain-anomaly-resolution-office"
            type="Congressional Record"
            typeColor="bg-blue-100 text-blue-700"
            description="Official Senate Armed Services Subcommittee record of Sean Kirkpatrick's April 2023 testimony - the first public congressional appearance by an AARO director. Primary source for Kirkpatrick's profile and AARO's organizational record."
            coverage="April 19, 2023"
            notes="Used for: Sean Kirkpatrick, AARO."
          />

          <SourceCard
            name="Kirkpatrick / Loeb - Physical Constraints on UAP (arXiv 2022)"
            url="https://arxiv.org/abs/2209.15215"
            type="Academic Preprint"
            typeColor="bg-teal-100 text-teal-700"
            description="Preprint paper co-authored by AARO director Sean Kirkpatrick and Harvard astrophysicist Avi Loeb, proposing physical signature hypotheses for UAP. The only peer-reviewed paper co-authored by a sitting AARO director. Used for both Kirkpatrick and Loeb profiles."
            notes="Used for: Sean Kirkpatrick, Avi Loeb."
          />

          {/* Dylan Borland */}
          <SourceCard
            name="House Oversight Committee - Borland Written Testimony (Sep 9, 2025)"
            url="https://oversight.house.gov/wp-content/uploads/2025/09/Borland-Written-Testimony.pdf"
            type="Congressional Record"
            typeColor="bg-blue-100 text-blue-700"
            description="Dylan Borland's official written testimony submitted to the House Committee on Oversight and Government Reform for the September 9, 2025 hearing on UAP transparency. Describes the summer 2012 close-range triangle UAP encounter at Langley AFB and the alleged retaliation following his whistleblower disclosures."
            coverage="September 9, 2025"
            notes="Used for: Dylan Borland."
          />

          <SourceCard
            name="NewsNation - Whistleblower Describes UAP Retaliation"
            url="https://www.newsnationnow.com/space/ufo/whistleblower-describes-uap-retaliation/"
            type="News Article"
            typeColor="bg-amber-100 text-amber-700"
            description="NewsNation coverage of Dylan Borland's whistleblower account, including his Langley AFB sighting and claims of security clearance manipulation and blacklisting from intelligence community contracting work."
            notes="Used for: Dylan Borland."
          />

          <SourceCard
            name="DefenseScoop - Military Whistleblowers Share New Evidence at UAP Hearing"
            url="https://defensescoop.com/2025/09/09/military-whistleblowers-share-new-evidence-alleged-uap-ufo-hearing/"
            type="Investigative Journalism"
            typeColor="bg-amber-100 text-amber-700"
            description="DefenseScoop reporting on the September 9, 2025 House Oversight UAP hearing, covering testimony from military whistleblowers including Dylan Borland."
            coverage="September 9, 2025"
            notes="Used for: Dylan Borland."
          />

          {/* Travis Walton */}
          <SourceCard
            name="Fire in the Sky: The Walton Experience (Walton, 1993)"
            url="https://www.amazon.com/dp/1569800855"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Travis Walton's definitive first-person memoir of the November 5, 1975 abduction incident near Snowflake, Arizona (Marlowe & Company, 1993). The primary source for all event chronology, aboard-craft account, and polygraph documentation in the Walton profile."
            notes="Used for: Travis Walton."
          />

          <SourceCard
            name="NICAP Case Report - Travis Walton Abduction (1975)"
            url="https://www.nicap.org/751105dir.htm"
            type="Research Archive"
            typeColor="bg-amber-100 text-amber-700"
            description="NICAP's contemporaneous investigation file for the November 1975 Walton case, including the Arizona Department of Public Safety polygraph summary for the six crew witnesses and initial field investigation notes."
            notes="Used for: Travis Walton."
          />

          <SourceCard
            name="UFO Evidence - Travis Walton Case Documentation"
            url="https://www.ufoevidence.org/cases/case311.htm"
            type="Research Archive"
            typeColor="bg-amber-100 text-amber-700"
            description="Compiled case documentation for the Walton incident including polygraph records, crew witness statements, and the physician examination notes from Walton's return. Secondary reference used to cross-verify the polygraph timeline and crew corroboration record."
            notes="Used for: Travis Walton."
          />

          {/* Budd Hopkins */}
          <SourceCard
            name="Missing Time: A Documented Study of UFO Abductions (Hopkins, 1981)"
            url="https://www.amazon.com/dp/0345302974"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Hopkins' foundational CE4 research text introducing the 'missing time' framework and hypnotic regression methodology (Richard Marek Publishers, 1981). The primary source for Hopkins' career timeline, research methodology, and foundational contribution to abduction research."
            notes="Used for: Budd Hopkins."
          />

          <SourceCard
            name="Intruders: The Incredible Visitations at Copley Woods (Hopkins, 1987)"
            url="https://www.amazon.com/dp/0345341392"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Hopkins' New York Times bestseller documenting the 'Kathie Davis' case (Random House, 1987). Used to document the 1987 timeline entry and the CBS miniseries adaptation that followed. Secondary source for Hopkins' research methodology."
            notes="Used for: Budd Hopkins."
          />

          <SourceCard
            name="Witnessed: The True Story of the Brooklyn Bridge UFO Abductions (Hopkins, 1996)"
            url="https://www.amazon.com/dp/0671523201"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Hopkins' most comprehensive single CE4 case study, documenting the Linda Cortile case with multiple claimed witnesses (Pocket Books, 1996). Primary source for the 1996 key event and Hopkins' research legacy section."
            notes="Used for: Budd Hopkins."
          />

          {/* Roger Leir */}
          <SourceCard
            name="The Aliens and the Scalpel (Leir, 2nd ed. 2005)"
            url="https://www.amazon.com/dp/0926524585"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Dr. Roger Leir's primary research monograph documenting 17 implant removal surgeries, laboratory analysis methodology, and anomalous findings including isotopic ratio data from UC San Diego and absence of inflammatory response (Granite Publishing, expanded 2005 edition). Primary source for the Leir profile."
            notes="Used for: Dr. Roger Leir."
          />

          <SourceCard
            name="Casebook: Alien Implants (Leir, 2000)"
            url="https://www.amazon.com/dp/0440236886"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Leir's secondary case documentation volume expanding on the surgical procedures and materials analysis results from additional implant removal cases (Dell, 2000). Used to verify the full procedure count and analysis timeline documented in the Leir profile."
            notes="Used for: Dr. Roger Leir."
          />

          <SourceCard
            name="A&S Research Inc. Documentation Archive"
            url="https://www.alienscalpel.com/"
            type="Research Archive"
            typeColor="bg-amber-100 text-amber-700"
            description="Primary institutional archive for Leir's documented case record, surgery films, and laboratory analysis results maintained by A&S Research Inc. Reference source for procedure count, specimen custodian chain, and analysis laboratory attribution."
            notes="Used for: Dr. Roger Leir."
          />

          {/* Betty and Barney Hill */}
          <SourceCard
            name="The Interrupted Journey (Fuller, 1966)"
            url="https://www.amazon.com/dp/0425032051"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="John Fuller's landmark account of the September 1961 Hill encounter, written with Betty and Barney Hill's full cooperation and based directly on Dr. Benjamin Simon's hypnosis session transcripts (Dial Press, 1966). The foundational primary source for all timeline, entity account, and physical anomaly documentation in the Hill profile."
            notes="Used for: Betty and Barney Hill."
          />

          <SourceCard
            name="Captured! The Betty and Barney Hill UFO Experience (Friedman & Marden, 2007)"
            url="https://www.amazon.com/dp/1564149102"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Comprehensive modern investigation of the Hill case by Stanton Friedman and Betty's niece Kathleen Marden (New Page Books, 2007). Used as the primary secondary source for credibility analysis, physical evidence documentation, and the polygraph/star map sections of the Hill profile."
            notes="Used for: Betty and Barney Hill."
          />

          <SourceCard
            name="NICAP Case File - Hill Abduction (1961)"
            url="https://www.nicap.org/611919dir.htm"
            type="Research Archive"
            typeColor="bg-amber-100 text-amber-700"
            description="NICAP's original investigation records including Walter Webb's field report on the Hill encounter from October 1961. Used to verify the initial investigation timeline and NICAP's credibility assessment of the case."
            notes="Used for: Betty and Barney Hill."
          />

          <SourceCard
            name="The Zeta Reticuli Incident - Astronomy Magazine (1974-1975)"
            url="https://www.nicap.org/zetaret.htm"
            type="Academic Article"
            typeColor="bg-teal-100 text-teal-700"
            description="Marjorie Fish's star map analysis identifying Betty Hill's hypnotic sketch as a possible Zeta Reticuli vantage point, originally published in the MUFON UFO Journal (1974) and reprinted in Astronomy Magazine (1975). Primary source for the star map claim and credibility sections of the Hill profile."
            notes="Used for: Betty and Barney Hill."
          />

          {/* John Lear */}
          <SourceCard
            name="The John Lear Statement (1987)"
            url="https://www.bibliotecapleyades.net/sociopolitica/esp_sociopol_mj12_6.htm"
            type="Primary Document"
            typeColor="bg-red-100 text-red-700"
            description="Lear's December 1987 disclosure document distributed via CompuServe - one of the first internet-distributed UAP disclosure texts. Archived online. Primary source for the claims section and the 1987 key event documentation in the Lear profile."
            notes="Used for: John Lear."
          />

          <SourceCard
            name="George Knapp - John Lear Interview, KLAS-TV (1989)"
            url="https://www.youtube.com/watch?v=n0Ew0CPQQRU"
            type="Television Archive"
            typeColor="bg-green-100 text-green-700"
            description="KLAS-TV archive of George Knapp's interviews with John Lear in the period surrounding the Bob Lazar disclosures (1989-1990). Primary video record of Lear's claims, his role in facilitating the Lazar introduction, and the corroboration he provided for Lazar's S-4 account."
            notes="Used for: John Lear."
          />

          <SourceCard
            name="UFOs and the National Security State, Vol. 2 (Dolan, 2009)"
            url="https://www.amazon.com/dp/0967799511"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Richard Dolan's continuation of his National Security State history covering 1973-1991, including the most measured scholarly analysis of Lear's role in the 1980s disclosure community and his relationship to the AFOSI disinformation framework (Richard Dolan Press, 2009)."
            notes="Used for: John Lear."
          />

          {/* Eric Burlison */}
          <SourceCard
            name="Rep. Eric Burlison - Official Congressional Biography"
            url="https://burlison.house.gov/about"
            type="Government Record"
            typeColor="bg-yellow-100 text-yellow-700"
            description="Official House biography with committee assignments, district information, and background. Primary source for all biographical data in the Burlison profile."
            notes="Used for: Rep. Eric Burlison."
          />

          <SourceCard
            name="Burlison Hires Grusch as Special Advisor - Official Press Release (Mar 27, 2025)"
            url="https://burlison.house.gov/media/press-releases/rep-burlison-welcomes-former-us-air-force-officer-david-grusch-special-advisor"
            type="Government Record"
            typeColor="bg-yellow-100 text-yellow-700"
            description="Official press release announcing David Grusch's four-month appointment as Special Advisor to Burlison's office for work on the Task Force on the Declassification of Federal Secrets. Primary source for Grusch advisory appointment details and clearance level."
            notes="Used for: Rep. Eric Burlison."
          />

          <SourceCard
            name="UAP Disclosure Act of 2025 - Official Press Release (Aug 29, 2025)"
            url="https://burlison.house.gov/media/press-releases/rep-burlison-introduces-uap-disclosure-act-2025-amendment-ndaa"
            type="Government Record"
            typeColor="bg-yellow-100 text-yellow-700"
            description="Official press release announcing the UAPDA 2025 as an FY2026 NDAA amendment, modeled on the JFK Records Act structure. Primary source for legislative details and framing."
            notes="Used for: Rep. Eric Burlison."
          />

          <SourceCard
            name="Missourinet: Burlison on UFOs - Either Angels or Man-Made (Aug 21, 2023)"
            url="https://www.missourinet.com/2023/08/21/burlison-on-ufos-theyre-either-angels-or-man-made/"
            type="News Article"
            typeColor="bg-orange-100 text-orange-700"
            description="Post-hearing public statement establishing Burlison's skeptical position: 'I think it's either angels or it's manmade. I think the most likely explanation is that it's manmade.' Primary source for the stated-position claim and credibility framing."
            notes="Used for: Rep. Eric Burlison."
          />

          <SourceCard
            name="Springfield Daily Citizen: ET Is the Least Likely Scenario - Burlison Interview Transcript"
            url="https://sgfcitizen.org/government/eric-burlison-interview-transcript-et-is-the-least-likely-scenario/"
            type="News Article"
            typeColor="bg-orange-100 text-orange-700"
            description="Full transcript of extended interview with Burlison articulating his skeptical reasoning on ET origin and his framework for thinking about UAP. Primary source for his stated position on human-technology explanations."
            notes="Used for: Rep. Eric Burlison."
          />

          <SourceCard
            name="The Hill: Classified UFO Briefing Leaves House Members With Mixed Feelings (Jan 2024)"
            url="https://thehill.com/homenews/house/4406059-classified-ufo-briefing-house-members-mixed-feelings/"
            type="News Article"
            typeColor="bg-orange-100 text-orange-700"
            description="Reporting on the January 12, 2024 SCIF briefing provided by the ICIG, including Burlison's characterization of footage showing objects defying physics and intelligently controlled plasma orbs."
            notes="Used for: Rep. Eric Burlison."
          />

          <SourceCard
            name="That UFO Podcast: Rep. Eric Burlison - UAP, Grusch and More (Jan 16, 2024)"
            url="https://www.youtube.com/watch?v=KCziN3OzwmQ"
            type="Video Interview"
            typeColor="bg-blue-100 text-blue-700"
            description="Primary interview source for SCIF briefing details, Grusch clearance claims, the SCIF denial prior to the July 2023 hearing, and Burlison's legislative outlook. Interviewed by Andy McGrillen."
            notes="Used for: Rep. Eric Burlison."
          />

          <SourceCard
            name="That UFO Podcast: Rep. Eric Burlison - Trump Is the Disclosure President (Nov 25, 2025)"
            url="https://www.youtube.com/watch?v=sKHZ8wA1__E"
            type="Video Interview"
            typeColor="bg-blue-100 text-blue-700"
            description="Primary interview source for NDAA strategy, Grusch Top Secret briefing details, White House executive order push, and specific locations given to Burlison for investigation. Interviewed by Andy McGrillen."
            notes="Used for: Rep. Eric Burlison."
          />

          <SourceCard
            name="Liberation Times: Rep. Burlison - White House-Approved Trip to NAS Patuxent River (2026)"
            url="https://www.liberationtimes.com/home/white-house-approved-trip-allegedly-took-congressman-to-maryland-base-to-examine-suspected-ufo-facility"
            type="News Article"
            typeColor="bg-orange-100 text-orange-700"
            description="Reports on Burlison's White House-approved visit to NAS Patuxent River to examine a hangar alleged to be connected to a proposed non-human materials transfer. Follow-up reporting raised questions from three sources about which specific hangar was accessed."
            notes="Used for: Rep. Eric Burlison."
          />

          <SourceCard
            name="Hunt for the Skinwalker: Science Confronts the Unexplained at a Remote Ranch in Utah - Kelleher & Knapp (2005)"
            url="https://www.amazon.com/Hunt-Skinwalker-Science-Confronts-Unexplained/dp/1416505210"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Primary account of NIDS investigation of Skinwalker Ranch 1996-2004. Co-authored by NIDS deputy administrator Colm Kelleher and investigative journalist George Knapp. Documents the research that directly motivated James Lacatski's 2008 visit and the subsequent AAWSAP program."
            notes="Used for: Hunt for the Skinwalker resource entry."
          />

          <SourceCard
            name="American Cosmic: UFOs, Religion, and Technology - D.W. Pasulka (2019)"
            url="https://global.oup.com/academic/product/american-cosmic-9780190692087"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Academic ethnographic study by UNC Wilmington religious studies professor Diana Walsh Pasulka, examining UAP belief systems among credentialed insiders. Published by Oxford University Press. Based on access to the private scientist community including figures widely believed to include Garry Nolan and Jacques Vallee."
            notes="Used for: American Cosmic resource entry."
          />
        </section>

        {/* Government programs sources */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Government Programs</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sources consulted in building the manually curated{' '}
              <Link href="/data" className="text-primary hover:underline">Government Program</Link>{' '}
              pages (Project Blue Book, Sign, Grudge, AAWSAP, AARO, UAP Task Force, Immaculate Constellation, Kona Blue, TTSA, Sol Foundation, NIDS, Bigelow Aerospace, and others).
              These are reference sources, not scraped datasets.
            </p>
          </div>

          <SourceCard
            name="National Archives - Project Blue Book Files"
            url="https://www.archives.gov/research/military/air-force/ufos"
            type="Primary Government Archive"
            typeColor="bg-blue-100 text-blue-700"
            description="The official declassified records of Project Blue Book and predecessor programs (Sign, Grudge), held at the National Archives. Comprises approximately 130,000 pages of case files, administrative records, and investigative reports. The primary evidentiary basis for the Blue Book, Sign, and Grudge program pages."
            coverage="1947-1969"
            notes="Used for: Project Blue Book, Project Sign, Project Grudge."
          />

          <SourceCard
            name="AARO Official Website"
            url="https://www.aaro.mil"
            type="Official Government"
            typeColor="bg-blue-100 text-blue-700"
            description="The All-domain Anomaly Resolution Office's official public-facing website. Primary source for AARO's stated mandate, organizational structure, reporting framework, and historical record publications. Used to document AARO's establishment, scope, and public findings."
            notes="Used for: AARO."
          />

          <SourceCard
            name="AARO Historical Record Report Vol. 1 (March 2024)"
            url="https://www.aaro.mil/Portals/136/PDFs/UAP_Historical_Record_Report_Vol1_20240306.pdf"
            type="Official Government Report"
            typeColor="bg-blue-100 text-blue-700"
            description="The Pentagon's first official historical account of U.S. government UAP programs. Provides AARO's characterization of AAWSAP, Kona Blue, and other predecessor programs. Used for both factual program data and as a reference point for contested claims in the disclosure community."
            coverage="March 2024"
            notes="Used for: AARO, Kona Blue, AAWSAP."
          />

          <SourceCard
            name="Skinwalkers at the Pentagon (Lacatski, Kelleher, Knapp - 2021)"
            url="https://www.amazon.com/dp/B09LRL6JTD"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="First-person account of the AAWSAP program by AAWSAP's founding program manager James T. Lacatski, Colm Kelleher, and George Knapp. Primary source for AAWSAP's true scope, Bigelow Aerospace's BAASS contract, and the connection to Skinwalker Ranch investigations. Also used for NIDS organizational history and Bigelow Aerospace's role."
            notes="Used for: AAWSAP, NIDS, Bigelow Aerospace."
          />

          <SourceCard
            name="AAWSAP DIRD Reports (FOIA - The Black Vault)"
            url="https://www.theblackvault.com/casefiles/the-advanced-aerospace-weapon-system-applications-aawsap-documents/"
            type="FOIA Release"
            typeColor="bg-amber-100 text-amber-700"
            description="The 38 Defense Intelligence Reference Documents (DIRDs) produced under AAWSAP and released via FOIA. Used to document the program's scientific scope and the participation of researchers including Hal Puthoff and Eric Davis."
            notes="Used for: AAWSAP."
          />

          <SourceCard
            name="The Report on Unidentified Flying Objects (Ruppelt, 1956)"
            url="https://archive.org/details/reportonunidenti00rupp"
            type="Primary Memoir"
            typeColor="bg-green-100 text-green-700"
            description="Written by Capt. Edward J. Ruppelt, the first director of Project Blue Book. The definitive insider account of the transition from Project Grudge to Blue Book, the 1952 Washington D.C. UFO wave, and the institutional pressures shaping official investigation. Primary source for Sign and Grudge program histories."
            notes="Used for: Project Sign, Project Grudge, Project Blue Book."
          />

          <SourceCard
            name="The UFO Experience (Hynek, 1972)"
            url="https://www.amazon.com/UFO-Experience-Scientific-Inquiry/dp/0892810610"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Scientific analysis of the UFO phenomenon by J. Allen Hynek, Blue Book's chief scientific consultant for its entire 21-year run. Provides Hynek's first-person critique of Blue Book methodology and his classification system for UFO reports. Used to document Hynek's role and Blue Book's analytical limitations."
            notes="Used for: Project Blue Book."
          />

          <SourceCard
            name="To The Stars Academy - SEC Filing (2017)"
            url="https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=0001710274"
            type="SEC Filing"
            typeColor="bg-gray-100 text-gray-600"
            description="TTSA's official SEC Regulation A offering circular documenting the company's stated mission, organizational structure, founding team biographies, and financial disclosures. Used as the primary source for TTSA membership data, organizational purpose, and founding timeline."
            coverage="2017"
            notes="Used for: TTSA."
          />

          <SourceCard
            name="Sol Foundation Official Website"
            url="https://www.thesolfoundation.org"
            type="Organization Archive"
            typeColor="bg-teal-100 text-teal-700"
            description="The Sol Foundation's official website, documenting its academic mission, leadership, symposium proceedings, and affiliated researchers. Primary source for organizational structure and the published outputs of the 2023 and 2024 UAP symposia."
            notes="Used for: Sol Foundation."
          />

          <SourceCard
            name="House Oversight Subcommittee UAP Hearing - Grusch Testimony (July 26, 2023)"
            url="https://oversight.house.gov/hearing/unidentified-anomalous-phenomena-implications-on-national-security-public-safety-and-government-transparency/"
            type="Congressional Record"
            typeColor="bg-blue-100 text-blue-700"
            description="Official congressional record of David Grusch's sworn testimony identifying Immaculate Constellation by name as a UAP analysis program. The only on-record public reference to Immaculate Constellation that served as the primary source for that program entry."
            coverage="July 26, 2023"
            notes="Used for: Immaculate Constellation, AARO, Kona Blue."
          />

          <SourceCard
            name="DoD Establishment of UAP Task Force (August 2020)"
            url="https://www.defense.gov/News/Releases/Release/Article/2314065/establishment-of-unidentified-aerial-phenomena-task-force/"
            type="Official Government"
            typeColor="bg-blue-100 text-blue-700"
            description="Department of Defense official press release announcing the formal establishment of the UAP Task Force within the Office of Naval Intelligence, signed by Deputy Secretary of Defense David Norquist. Primary source for the UAPTF founding mandate and organizational structure."
            coverage="August 14, 2020"
            notes="Used for: UAP Task Force (UAPTF)."
          />

          <SourceCard
            name="ODNI UAP Preliminary Assessment (June 2021)"
            url="https://www.dni.gov/files/ODNI/documents/assessments/Prelimary-Assessment-UAP-20210625.pdf"
            type="Official Government Report"
            typeColor="bg-blue-100 text-blue-700"
            description="The UAP Task Force's 9-page unclassified preliminary assessment, released by the Office of the Director of National Intelligence. Found 143 of 144 reported incidents unexplained. The primary output of the UAPTF and the document that directly drove the creation of AARO."
            coverage="June 25, 2021"
            notes="Used for: UAP Task Force (UAPTF)."
          />

          <SourceCard
            name="Galileo Project - Harvard University"
            url="https://projects.iq.harvard.edu/galileo"
            type="Academic Institution"
            typeColor="bg-green-100 text-green-700"
            description="Official Galileo Project homepage at Harvard, documenting the project's multi-sensor observatory methodology, peer-reviewed publications, and research findings since its 2021 founding. Primary source for the Galileo Project program entry."
            coverage="2021-present"
            notes="Used for: Galileo Project."
          />

          <SourceCard
            name="Project Moon Dust FOIA Documents (The Black Vault)"
            url="https://www.theblackvault.com/documentarchive/project-moon-dust/"
            type="FOIA Archive"
            typeColor="bg-amber-100 text-amber-700"
            description="Declassified documents confirming the existence and operational scope of Project Moon Dust and Operation Blue Fly, obtained via FOIA requests. Includes State Department cables referencing Moon Dust field operations in Bolivia, Pakistan, and other international locations. Primary source for the Moon Dust program entry."
            notes="Used for: Project Moon Dust / Blue Fly."
          />

          <SourceCard
            name="Clear Intent: The Government Cover-Up of the UFO Experience (Fawcett, Greenwood - 1984)"
            url="https://www.amazon.com/Clear-Intent-Government-Cover-Up-Experience/dp/0131352539"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="The foundational research publication establishing Project Moon Dust's existence through FOIA document analysis by Barry Greenwood and Lawrence Fawcett. Documents the scope of government UAP-related recovery programs through declassified records."
            notes="Used for: Project Moon Dust / Blue Fly."
          />
        </section>

        {/* Documented cases sources */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Documented Cases</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sources consulted in building the manually curated{' '}
              <Link href="/data?category=cases" className="text-primary hover:underline">Documented Cases</Link>{' '}
              pages. Includes investigative reports, declassified files, congressional records, and academic analyses.
            </p>
          </div>

          <SourceCard
            name="National Archives - Project Blue Book Records"
            url="https://www.archives.gov/research/military/air-force/ufos"
            type="Primary Government Archive"
            typeColor="bg-blue-100 text-blue-700"
            description="Declassified Project Blue Book investigation files, including the official case reports for Levelland (1957) and many other historically documented cases. The primary official record for cases investigated during the Blue Book era (1952-1969)."
            coverage="1947-1969"
            notes="Used for: Levelland 1957, Malmstrom AFB 1967, Washington D.C. 1952, and other Blue Book-era cases."
          />

          <SourceCard
            name="NICAP Case Files"
            url="http://www.nicap.org"
            type="Civilian Research Archive"
            typeColor="bg-amber-100 text-amber-700"
            description="NICAP's digitized case investigation files maintained by Fran Ridge. Includes the independent investigation reports for Levelland (1957) that challenged Blue Book's ball lightning explanation, and the Coyne Helicopter (1973) documentation."
            notes="Used for: Levelland 1957, Coyne Helicopter 1973."
          />

          <SourceCard
            name="NARCAP - National Aviation Reporting Center on Anomalous Phenomena (narcap.org)"
            url="https://www.narcap.org"
            type="Research Archive"
            typeColor="bg-green-100 text-green-700"
            description="Aviation-focused UAP research organization co-founded by former NASA scientist Dr. Richard Haines. Maintains a protocol-driven database of pilot UAP encounters applying ICAO safety reporting standards. Published over 20 technical reports including analysis of the 2006 O'Hare Airport incident. Methodology influenced Ryan Graves's Aviation Safety Reporting Coalition."
            notes="Used for: NARCAP resource entry."
          />

          <SourceCard
            name="CUFOS - Coyne Helicopter Case Study (Zeidman, 1979)"
            url="https://www.cufos.org"
            type="Academic Investigation"
            typeColor="bg-purple-100 text-purple-700"
            description="Jennie Zeidman's comprehensive CUFOS investigation report on the October 18, 1973 Coyne Helicopter encounter near Mansfield, Ohio. The most detailed case analysis available, based on interviews with all four crew members and independent civilian witnesses. J. Allen Hynek co-presented the case to the United Nations in 1978."
            coverage="1973 incident; 1979 publication"
            notes="Used for: Coyne Helicopter 1973."
          />

          <SourceCard
            name="Condon Report - Case 5 (RB-47 Incident, 1957)"
            url="https://files.ncas.org/condon/text/case05.htm"
            type="Official Government Study"
            typeColor="bg-blue-100 text-blue-700"
            description="The Condon Committee's full analysis of the July 17, 1957 RB-47H encounter, formally classified Unknown. The only Condon case involving simultaneous ELINT sensor, ground radar, and visual confirmation of the same object. Investigated by atmospheric physicist Dr. James McDonald. Primary source for the RB-47 case entry."
            coverage="July 17, 1957 incident; 1968-1969 Condon investigation"
            notes="Used for: RB-47 1957."
          />

          <SourceCard
            name="NICAP - RB-47 Case Documentation"
            url="https://www.nicap.org/570717dir.htm"
            type="Civilian Research Archive"
            typeColor="bg-amber-100 text-amber-700"
            description="NICAP's case file for the July 17, 1957 RB-47H incident, including Air Force intelligence report references, crew testimony summaries, and cross-references to the Condon analysis."
            coverage="July 17, 1957"
            notes="Used for: RB-47 1957."
          />

          <SourceCard
            name="The Falcon Lake Incident (Michalak, Rutkowski)"
            url="https://www.amazon.com/Falcon-Lake-Incident-Stefan-Michalak/dp/0888012438"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Book-length account of the May 20, 1967 Falcon Lake encounter by witness Stefan Michalak and Canadian UAP researcher Chris Rutkowski. Includes medical documentation, RCMP investigation records, and physical evidence analysis. Primary source for the Falcon Lake case entry."
            coverage="May 20, 1967 incident"
            notes="Used for: Falcon Lake 1967."
          />

          <SourceCard
            name="Robert Hastings - Minot AFB 1968 FOIA Documentation"
            url="https://www.ufos-nukes.com"
            type="FOIA Research"
            typeColor="bg-amber-100 text-amber-700"
            description="Robert Hastings's compiled documentation of the October 24, 1968 Minot AFB incident, incorporating FOIA-obtained Air Force intelligence report (Project Blue Book Case 12548), B-52 crew records, and security team reports. Primary source for the Minot AFB case entry."
            coverage="October 24, 1968"
            notes="Used for: Minot AFB 1968."
          />

          <SourceCard
            name="The Coming of the Saucers - Arnold and Palmer (1952)"
            url="https://www.amazon.com/dp/B0007DBO9M"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Kenneth Arnold's own account of the June 24, 1947 Mount Rainier sighting and the subsequent Army Air Force investigation. The primary firsthand record of the case that coined the term 'flying saucer' and launched the modern UAP era."
            notes="Used for: Kenneth Arnold Sighting 1947."
          />

          <SourceCard
            name="Project Blue Book Archive - Arnold Case File"
            url="https://www.theprojectbluebookarchive.org/"
            type="Government Document"
            typeColor="bg-yellow-100 text-yellow-700"
            description="Original USAF Project Sign investigation documentation for the Kenneth Arnold sighting, including the Army Air Force intelligence report from Hamilton Field and Arnold's signed written statement of July 12, 1947. Classified Unidentified."
            notes="Used for: Kenneth Arnold Sighting 1947."
          />

          <SourceCard
            name="The Interrupted Journey - John Fuller (1966)"
            url="https://www.amazon.com/dp/0425034437"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="First major published account of the Betty and Barney Hill September 19-20, 1961 abduction case. Written with the cooperation of treating psychiatrist Dr. Benjamin Simon; includes hypnosis session transcripts and Simon's clinical commentary. Primary source for the Hill case entry."
            notes="Used for: Betty and Barney Hill Abduction 1961."
          />

          <SourceCard
            name="Captured! The Betty and Barney Hill UFO Experience - Friedman and Marden (2007)"
            url="https://www.amazon.com/dp/1564149641"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Comprehensive forensic re-examination of the Hill case by nuclear physicist Stanton Friedman and Kathleen Marden (Betty Hill's niece). Includes previously unpublished NICAP investigation documents, Simon session notes, and analysis of the Marjorie Fish Zeta Reticuli star map."
            notes="Used for: Betty and Barney Hill Abduction 1961."
          />

          <SourceCard
            name="Fire in the Sky: The Walton Experience - Travis Walton (1993)"
            url="https://www.amazon.com/dp/1569800855"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Travis Walton's definitive first-person account of the November 5, 1975 Apache-Sitgreaves National Forest abduction. Includes the full event sequence, polygraph documentation for the six crew witnesses, and Walton's complete recollection of the five-day absence. Primary source for the Walton Abduction case entry."
            notes="Used for: Travis Walton Abduction 1975."
          />

          <SourceCard
            name="UFO-Related Human Physiological Effects - John F. Schuessler (1996)"
            url="https://www.amazon.com/dp/1575100134"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Comprehensive documentation of the December 29, 1980 Cash-Landrum incident by aerospace engineer and MUFON investigator John Schuessler. Includes full medical records for all three witnesses, investigation timeline, and analysis of the $20 million federal lawsuit proceedings. Primary source for the Cash-Landrum case entry."
            notes="Used for: Cash-Landrum Incident 1980."
          />

          <SourceCard
            name="GEPAN Technical Note No. 16 (1981)"
            url="https://www.cnes-geipan.fr/en/geipan/archives"
            type="Government Report"
            typeColor="bg-yellow-100 text-yellow-700"
            description="Official French government investigation report by GEPAN (operating under CNES, the French space agency) on the January 8, 1981 Trans-en-Provence landing. Includes Dr. Michel Bounias's INRA laboratory analysis showing 38-50% chlorophyll reduction and soil crystalline structure changes. The primary source for the Trans-en-Provence case entry and the only national government scientific investigation report on a UAP physical trace case."
            notes="Used for: Trans-en-Provence Landing 1981."
          />

          <SourceCard
            name="Confrontations - Jacques Vallee (1990)"
            url="https://www.amazon.com/dp/0345369092"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Includes detailed fieldwork analysis of the Trans-en-Provence case by researcher Jacques Vallee, including independent review of the GEPAN investigation methodology and physical evidence. Vallee concluded it is one of the most rigorously documented UAP physical effect cases in the global research literature."
            notes="Used for: Trans-en-Provence Landing 1981."
          />
        </section>

        {/* Primary documents sources */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Primary Documents</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sources for the declassified, leaked, and official documents cataloged in the{' '}
              <Link href="/data?category=documents" className="text-primary hover:underline">Documents</Link>{' '}
              section.
            </p>
          </div>

          <SourceCard
            name="FBI Records: The Vault - Hottel Memo"
            url="https://vault.fbi.gov/hottel_memo"
            type="Declassified Government"
            typeColor="bg-blue-100 text-blue-700"
            description="The FBI's official online Freedom of Information Act database containing the March 22, 1950 Hottel Memo - a field office memo to J. Edgar Hoover describing recovered craft and occupants. The FBI's own Vault page notes this is its most-accessed document and explicitly states the information is unverified."
            coverage="March 22, 1950"
            notes="Used for: Hottel Memo (1950)."
          />

          <SourceCard
            name="NICAP - Pentacle Memorandum"
            url="https://www.nicap.org/docs/pentacle.htm"
            type="Document Archive"
            typeColor="bg-amber-100 text-amber-700"
            description="NICAP's hosted copy of the January 9, 1953 Pentacle Memorandum - a classified Battelle Memorial Institute memo to Wright-Patterson AFB revealing a parallel secret UAP analysis program alongside Blue Book, discovered in J. Allen Hynek's personal papers by Jacques Vallee. Primary source for the document profile."
            coverage="January 9, 1953"
            notes="Used for: Pentacle Memorandum (1953)."
          />

          <SourceCard
            name="NDAA FY2024 - congress.gov"
            url="https://www.congress.gov/bill/118th-congress/house-bill/2670/text"
            type="Official Government"
            typeColor="bg-blue-100 text-blue-700"
            description="Full text of the National Defense Authorization Act for Fiscal Year 2024, signed December 22, 2023. Contains the UAP provisions including eminent domain authorization, NDA review requirements, and language vindicating Luis Elizondo's AATIP role. Primary source for the NDAA FY2024 document entry."
            coverage="December 22, 2023"
            notes="Used for: NDAA FY2024 UAP Provisions."
          />

          <SourceCard
            name="2024 ODNI Annual Report on UAP (March 2024)"
            url="https://www.dni.gov/index.php/newsroom/reports-publications/reports-publications-2024"
            type="Official Government Report"
            typeColor="bg-blue-100 text-blue-700"
            description="The Office of the Director of National Intelligence's 2024 annual UAP report covering calendar year 2023. Documents 291 new cases bringing the total AARO database to over 2,300 entries; 97% lack sufficient data for characterization. Primary source for the 2024 DNI Annual Report document entry."
            coverage="January-December 2023; released March 2024"
            notes="Used for: 2024 DNI Annual Report on UAP."
          />

          {/* Grusch IG Complaint */}
          <SourceCard
            name="The Debrief - 'Intelligence Officials Say U.S. Has Retrieved Non-Human Craft' (Jun 5, 2023)"
            url="https://thedebrief.org/intelligence-officials-say-u-s-has-retrieved-non-human-craft/"
            type="Investigative Journalism"
            typeColor="bg-green-100 text-green-700"
            description="The June 5, 2023 article by Leslie Kean, Ralph Blumenthal, and Ross Coulthart that first identified David Grusch as the whistleblower who filed a formal Disclosure of Urgent Concern with the Intelligence Community Inspector General. The article confirmed the ICIG's 'credible and urgent' determination and described the core allegations. Primary public disclosure source for the Grusch ICIG Complaint document entry."
            coverage="June 2023"
            notes="Used for: Grusch ICIG Complaint (2023)."
          />

          <SourceCard
            name="ICIG Congressional Notification Letter (June 9, 2023)"
            url="https://www.dni.gov/files/ICIG/Documents/Congressional%20Correspondence/20230609_ICIG_Congressional_Notification.pdf"
            type="Official Government Correspondence"
            typeColor="bg-blue-100 text-blue-700"
            description="The Intelligence Community Inspector General's formal notification letter to the House Permanent Select Committee on Intelligence and Senate Select Committee on Intelligence, confirming that Grusch's complaint met the legal standard of 'credible and urgent' under the Intelligence Community Whistleblower Protection Act. The official government document confirming the complaint's legal status."
            coverage="June 9, 2023"
            notes="Used for: Grusch ICIG Complaint (2023)."
          />

          {/* Grusch ICIG Determination */}
          <SourceCard
            name="ICIG Statement on Grusch Complaint and Referral (2023)"
            url="https://www.dni.gov/files/ICIG/Documents/ICIG%20News/ICIG%20Statement%20on%20Grusch%20Complaint%20and%20Referral.pdf"
            type="Government Statement"
            typeColor="bg-yellow-100 text-yellow-700"
            description="Official ICIG public statement confirming the credible-and-urgent determination. Primary source for document metadata and legal threshold context."
            notes="Used for: Grusch ICIG Whistleblower Determination."
          />

          <SourceCard
            name="David Grusch Interview - NewsNation (2023)"
            url="https://www.newsnation.com/politics-news/david-grusch-interview-ufo-whistleblower/"
            type="Television Interview"
            typeColor="bg-blue-100 text-blue-700"
            description="First major public interview by Grusch explaining the complaint's background and his role in the UAP Task Force. Context source for significance and provenance."
            notes="Used for: Grusch ICIG Whistleblower Determination."
          />

          {/* Project Grudge Final Report */}
          <SourceCard
            name="The Report on Unidentified Flying Objects (Ruppelt, 1956)"
            url="https://archive.org/details/reportonunidenti00rupp"
            type="Primary Memoir"
            typeColor="bg-green-100 text-green-700"
            description="Project Blue Book's first director Capt. Edward Ruppelt's candid account of the transition from Project Grudge to Blue Book, including his characterization of the Grudge investigation as a 'fiasco' and 'deliberate whitewash.' The most authoritative insider critique of the Grudge program's predetermined conclusions. Already in use for Sign and Blue Book program entries; also primary source for the Grudge Final Report document entry."
            coverage="1949-1953 (events); 1956 (publication)"
            notes="Used for: Project Grudge Final Report (1949), Project Grudge (program)."
          />

          <SourceCard
            name="Fold3 - Project Blue Book Records Archive"
            url="https://www.fold3.com/title/521/project-blue-book"
            type="Digitized Government Archive"
            typeColor="bg-blue-100 text-blue-700"
            description="Fold3's digitized and indexed archive of the Project Blue Book microfilm collection, including the Project Grudge Final Report (1949), Project Sign records, and individual case files including the Socorro / Zamora investigation (Case 8766, April 1964). Provides searchable access to the 130,000-page Blue Book record held at the National Archives."
            coverage="1947-1969"
            notes="Used for: Project Grudge Final Report (1949), Socorro / Zamora Blue Book Investigation Report (1964)."
          />

          {/* Socorro Blue Book Investigation */}
          <SourceCard
            name="NICAP - Socorro, New Mexico Case Documentation (April 24, 1964)"
            url="https://www.nicap.org/640424dir.htm"
            type="Civilian Research Archive"
            typeColor="bg-amber-100 text-amber-700"
            description="NICAP's comprehensive case file for the April 24, 1964 Socorro / Zamora landing incident, including Lonnie Zamora's original testimony, Captain Richard Holder's initial military investigation report, J. Allen Hynek's independent analysis, and FBI Agent Arthur Byrnes Jr.'s evidence examination report. The most complete publicly accessible compilation of the multi-agency investigation record."
            coverage="April 24, 1964"
            notes="Used for: Socorro / Zamora Blue Book Investigation Report (1964), Socorro case entry."
          />

          <SourceCard
            name="The UFO Experience (Hynek, 1972) - Socorro Chapter"
            url="https://www.amazon.com/UFO-Experience-Scientific-Inquiry/dp/0892810610"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="J. Allen Hynek's landmark scientific analysis of UAP includes a detailed chapter on the Socorro case as his primary example of a close-encounter physical-trace case. Hynek's firsthand account of his personal investigation and his conclusion that no conventional explanation was tenable is the most authoritative scientific assessment of the case. Already referenced for Blue Book; also key source for the Socorro investigation report."
            coverage="April 1964 (incident); 1972 (publication)"
            notes="Used for: Socorro / Zamora Blue Book Investigation Report (1964)."
          />

          {/* BAASS/AAWSAP Contract */}
          <SourceCard
            name="Skinwalkers at the Pentagon (Lacatski, Kelleher, Knapp - 2021)"
            url="https://www.amazon.com/dp/B09LRL6JTD"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="First-person account of the AAWSAP program by DIA program manager James T. Lacatski, BAASS researcher Colm Kelleher, and investigative journalist George Knapp. The definitive public account of the BAASS contract (HHM402-08-C-0072), its $10 million award, the 38 DIRDs, and the Skinwalker Ranch investigation conducted under contract provisions. Already referenced for AAWSAP program; also primary source for the contract document entry."
            coverage="2008-2012 (program); October 2021 (publication)"
            notes="Used for: BAASS AAWSAP Contract (2008), AAWSAP (program)."
          />

          <SourceCard
            name="The Black Vault - AAWSAP DIRD FOIA Collection"
            url="https://www.theblackvault.com/casefiles/the-advanced-aerospace-weapon-system-applications-aawsap-documents/"
            type="FOIA Archive"
            typeColor="bg-amber-100 text-amber-700"
            description="The Black Vault's compiled FOIA release of the 38 Defense Intelligence Reference Documents (DIRDs) produced under the BAASS AAWSAP contract. The partial unclassified releases confirm the contract's existence, research scope, and the participating researchers (Puthoff, Davis, Green). Primary documentary evidence corroborating the contract's scope and scientific content."
            notes="Used for: BAASS AAWSAP Contract (2008), AAWSAP (program)."
          />

          {/* COMETA Report (1999) */}
          <SourceCard
            name="UFO Evidence Archive - COMETA Report (Full Text, English)"
            url="https://www.ufoevidence.org/documents/doc830.htm"
            type="Research Archive"
            typeColor="bg-amber-100 text-amber-700"
            description="The primary publicly accessible English-language archive of the COMETA Report ('Les OVNIs et la Defense,' July 1999). Hosts the full translated text of the 90-page French government-adjacent study produced by senior retired military and intelligence officials under General Denis Letty, including the case analysis, policy recommendations, and extraterrestrial hypothesis evaluation."
            coverage="July 1999"
            notes="Used for: COMETA Report (1999)."
          />

          <SourceCard
            name="UFOs and the National Security State, Vol. 2 (Dolan, 2009)"
            url="https://www.amazon.com/dp/0967799511"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Richard Dolan's second volume of his foundational history of government UAP involvement provides the most thorough English-language analysis of the COMETA Report, contextualizing it within the broader pattern of non-US government UAP acknowledgment that exceeded contemporaneous official US positions. Primary secondary source for the COMETA document entry and associated network connections."
            coverage="1973-2001 (events); 2009 (publication)"
            notes="Used for: COMETA Report (1999)."
          />

          {/* CRS UAP Report (2022) */}
          <SourceCard
            name="Congressional Research Service - IF11971: Unidentified Aerial Phenomena (UAP)"
            url="https://crsreports.congress.gov/product/details?prodcode=IF11971"
            type="Official Government Document"
            typeColor="bg-blue-100 text-blue-700"
            description="The Congressional Research Service's primary nonpartisan analysis of UAP incidents, oversight history, and legislation, prepared by defense policy analyst Kelley M. Sayler. First published May 2021 and updated through 2022, this report served as the foundational Congressional reference document as Members developed the NDAA FY2023 UAP provisions creating AARO. Publicly available at crsreports.congress.gov."
            coverage="2021-2022"
            notes="Used for: CRS UAP Report (2022)."
          />

          {/* Rockefeller Briefing Document (1995) */}
          <SourceCard
            name="Archive.org - UFOs Briefing Document: The Best Available Evidence (1995)"
            url="https://archive.org/details/UFOsBriefingDocumentTheBestAvailableEvidence"
            type="Digitized Primary Document"
            typeColor="bg-amber-100 text-amber-700"
            description="The digitized 169-page briefing document commissioned by Laurance S. Rockefeller and prepared by Don Berliner and Marie Galbraith (with scientific consultation from Stanton Friedman). Presented to Clinton White House Science Advisor John H. Gibbons in December 1995. The primary source for the Rockefeller UFO Disclosure Initiative document entry and the Rockefeller network node."
            coverage="December 1995"
            notes="Used for: Rockefeller UFO Briefing Document (1995)."
          />

          <SourceCard
            name="UFOs and the National Security State, Vol. 2 (Dolan, 2009) - Rockefeller Initiative Chapter"
            url="https://www.amazon.com/dp/0967799511"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Richard Dolan's account of the Rockefeller Initiative provides the most thoroughly sourced published analysis of the 1993-1996 private disclosure campaign, including the timeline of Rockefeller's Clinton administration contacts, the delivery of the briefing document to John Gibbons, and the reported Rockefeller-Clinton meeting at Jackson Hole. Primary secondary source for the political and institutional context surrounding the briefing document."
            coverage="1993-1996 (events); 2009 (publication)"
            notes="Used for: Rockefeller UFO Briefing Document (1995)."
          />

          {/* UK MoD UFO Files (1950-2009) */}
          <SourceCard
            name="The National Archives (UK) - UFO Files Collection"
            url="https://www.nationalarchives.gov.uk/ufos/"
            type="Government Archive"
            typeColor="bg-yellow-100 text-yellow-700"
            description="The National Archives (Kew) official landing page for the UK Ministry of Defence UFO files release, providing direct access to all 209 released files totaling approximately 52,000 pages. Includes the DI55 operational assessment files, Secretariat Air Staff correspondence, pilot reports, and civilian UAP reports covering 1950-2009. Primary source for the UK MoD UFO Files document entry."
            coverage="1950-2009 (files); 2008-2013 (release)"
            notes="Used for: UK Ministry of Defence UFO Files (1950-2009)."
          />

          <SourceCard
            name="UFOs: Generals, Pilots and Government Officials Go on the Record - Leslie Kean (2010)"
            url="https://www.amazon.com/dp/0307716848"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Kean's landmark 2010 investigative book draws directly on the UK National Archives release as one of its primary documentary sources. The DI55 assessments and MoD investigation files are central to Kean's argument that governments privately treated UAP as a serious intelligence and defense matter. Nick Pope contributed a chapter on the UK program, and General Wilfried De Brouwer contributed a chapter on the Belgian wave. Primary secondary source for the UK MoD UFO Files document entry, Pentagon UAP Video Formal Release, and SOBEPS Belgian UFO Wave Investigation Report."
            coverage="2009-2010"
            notes="Used for: UK Ministry of Defence UFO Files (1950-2009), Pentagon UAP Video Formal Release, SOBEPS Belgian UFO Wave Investigation Report."
          />

          {/* SOBEPS Belgian UFO Wave Investigation Report (1991) */}
          <SourceCard
            name="Vague d'OVNI sur la Belgique - SOBEPS (1991)"
            url="https://www.amazon.fr/Vague-dovni-Belgique-collectif-SOBEPS/dp/2871290091"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Primary two-volume SOBEPS investigation report compiling 2,600+ witness reports and Belgian Air Force cooperation data including F-16 radar intercept analysis."
            notes="Used for: SOBEPS Belgian UFO Wave Investigation Report."
          />

          {/* Pentagon UAP Video Formal Release (2020) */}
          <SourceCard
            name="DoD Statement - Pentagon UAP Video Release (2020)"
            url="https://www.defense.gov/News/Releases/Release/Article/2165713/statement-by-the-department-of-defense-releasing-ufo-videos/"
            type="Government Statement"
            typeColor="bg-yellow-100 text-yellow-700"
            description="Official DoD press release formally declassifying FLIR1, Gimbal, and GoFast UAP videos. Primary source for document metadata and significance."
            notes="Used for: Pentagon UAP Video Formal Release."
          />

          {/* UAP Disclosure Act of 2023 */}
          <SourceCard
            name="UAP Disclosure Act of 2023 - S.2226 (118th Congress)"
            url="https://www.congress.gov/bill/118th-congress/senate-bill/2226"
            type="Government Record"
            typeColor="bg-yellow-100 text-yellow-700"
            description="Official Congress.gov record of S.2226 including full bill text, amendment history, and vote records. Primary source for all legislative metadata."
            notes="Used for: UAP Disclosure Act of 2023."
          />

          <SourceCard
            name="Sen. Schumer Floor Statement on UAP Disclosure Act (2023)"
            url="https://www.schumer.senate.gov/newsroom/press-releases/schumer-rounds-introduce-ufo-uap-disclosure-act-of-2023"
            type="Government Statement"
            typeColor="bg-yellow-100 text-yellow-700"
            description="Official Senate press release with Schumer's floor statements explicitly linking Grusch testimony to the legislation. Source for significance and provenance context."
            notes="Used for: UAP Disclosure Act of 2023."
          />

          <SourceCard
            name="Sturrock Panel Report: Physical Evidence Related to UFO Reports (1998)"
            url="https://www.scientificexploration.org/docs/12/jse_12_2_sturrock.pdf"
            type="Academic Paper"
            typeColor="bg-indigo-100 text-indigo-700"
            description="Published in the Journal of Scientific Exploration Vol. 12 No. 2. Five-day workshop convened by Peter Sturrock at Pocantico Conference Center (1997), bringing nine physical scientists to review physical evidence cases. Panel concluded evidence warrants serious scientific investigation."
            notes="Used for: Sturrock Panel Report document entry."
          />

          <SourceCard
            name="Incommensurability, Orthodoxy and the Physics of High Strangeness - Vallee & Davis (2003)"
            url="https://www.ufoskeptic.org/vallee-davis.pdf"
            type="Academic Paper"
            typeColor="bg-indigo-100 text-indigo-700"
            description="30-page theoretical paper presented at the 2003 NIDS conference by Jacques Vallee and Eric W. Davis. Proposes a 6-layer phenomenological model for UAP, arguing phenomena are incommensurable with conventional physics. Primary reference for the incommensurability framework cited in subsequent UAP research."
            notes="Used for: Vallee-Davis Incommensurability document entry."
          />
        </section>

        {/* Private Defense Contractors */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Private Defense Contractors</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sources for the private defense and government services contractor profiles in the{' '}
              <Link href="\data?category=contractors" className="text-primary hover:underline">Contractors</Link>{' '}
              section.
            </p>
          </div>

          {/* Leidos */}
          <SourceCard
            name="Leidos Corporate Profile - Investor Relations (2024)"
            url="https://ir.leidos.com/overview/default.aspx"
            type="Corporate Record"
            typeColor="bg-green-100 text-green-700"
            description="Official Leidos investor relations page confirming corporate history, the 2013 SAIC spin-off origin, contract portfolio, and government customer base spanning DoD, ODNI, NGA, NSA, and DHS."
            notes="Used for: Leidos."
          />

          <SourceCard
            name="House Oversight UAP Hearing - Grusch Contractor Testimony (Jul 2023)"
            url="https://oversight.house.gov/hearing/unidentified-anomalous-phenomena-implications-on-national-security-public-safety-and-government-transparency/"
            type="Congressional Record"
            typeColor="bg-yellow-100 text-yellow-700"
            description="Grusch testified under oath that private defense and government services contractors operate the classified SAP infrastructure in which alleged UAP materials are held. Primary source for all contractor UAP-claim entries."
            notes="Used for: Leidos, Boeing Defense, Lockheed Martin, Northrop Grumman, SAIC."
          />

          {/* Boeing Defense */}
          <SourceCard
            name="DoD Statement - Pentagon UAP Video Release (Apr 2020)"
            url="https://www.defense.gov/News/Releases/Release/Article/2165713/statement-by-the-department-of-defense-releasing-ufo-videos/"
            type="Government Statement"
            typeColor="bg-yellow-100 text-yellow-700"
            description="Formal DoD declassification confirming the F/A-18-captured FLIR1, Gimbal, and GoFast UAP videos. Primary source for Boeing Defense's platform connection to documented UAP encounters - the F/A-18 Super Hornet is the aircraft that filmed all three videos."
            notes="Used for: Boeing Defense."
          />

          <SourceCard
            name="Boeing Defense, Space & Security - Official Profile"
            url="https://www.boeing.com/defense"
            type="Corporate Record"
            typeColor="bg-green-100 text-green-700"
            description="Official Boeing BDS division profile confirming the Phantom Works advanced development division, F/A-18 production and sustainment programs, and classified platform portfolio."
            notes="Used for: Boeing Defense."
          />

          <SourceCard
            name="The Nimitz Encounters (Dave Beaty Documentary, 2019)"
            url="https://www.youtube.com/watch?v=zuBLUyc3Mck"
            type="Documentary"
            typeColor="bg-blue-100 text-blue-700"
            description="Comprehensive documentary on the 2004 Nimitz encounter featuring Fravor, Slaight, and crew accounts from VFA-41. Documents the F/A-18 Super Hornet platform's role in the encounter and the ATFLIR pod footage in detail."
            notes="Used for: Boeing Defense."
          />
        </section>

        {/* Glossary sources */}
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Glossary Sources</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Sources used to build the{' '}
              <Link href="/resources?tab=glossary" className="text-primary hover:underline">Glossary</Link>{' '}
              of UAP and defense terminology (308 terms).
            </p>
          </div>

          <SourceCard
            name="Skinwalkers at the Pentagon"
            url="https://www.amazon.com/dp/B09LRL6JTD"
            type="Published Book"
            typeColor="bg-purple-100 text-purple-700"
            description="Non-fiction account of the AAWSAP program by James T. Lacatski, Colm Kelleher, and George Knapp (2021). The book's Key to Abbreviations appendix served as a primary reference for defense and intelligence terminology used in UAP research contexts, including program-specific terms like BAASS, DIRD, NIDS, and SVP."
            notes="15 terms sourced from this reference."
          />

          <SourceCard
            name="Gerb YouTube Channel - UAP Research Videos"
            url="https://www.youtube.com/@Gerb"
            type="YouTube / Scraped-Transcripts"
            typeColor="bg-red-100 text-red-600"
            description="61 research-focused UAP videos by independent analyst Gerb covering government programs, key figures, and technical concepts. Transcripts were extracted and processed to identify domain-specific terminology used across the UAP research community."
            coverage="275 terms extracted across 61 videos"
            notes="Terms sourced from this channel are tagged with source: gerb in glossary data."
          />

          <SourceCard
            name="Curated Editorial Terms"
            url="/resources?tab=glossary"
            type="Manual Curation"
            typeColor="bg-teal-100 text-teal-700"
            description="18 foundational UAP and NHI terms written and defined by DECUR contributors. Covers core concepts like Non-Human Intelligence, Crash Retrieval, the Five Observables, and key program names not adequately defined elsewhere."
            notes="Terms tagged with source: curated in glossary data."
          />
        </section>

        {/* Methodology */}
        <section className="bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Methodology</h2>

          <div className="space-y-3 text-sm text-gray-700 dark:text-gray-300">
            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Scraped Timeline Data</p>
              <p>
                Timeline entries from ufotimeline.com, openminds.tv, papooselake.org, and nicap.org were retrieved
                via their public APIs or HTML scraping. Every entry preserves a direct link
                (<code className="bg-gray-200 dark:bg-gray-700 dark:text-gray-300 px-1 py-0.5 rounded text-xs">source_url</code>) to its
                originating article. DECUR does not alter the title or content of scraped entries.
                NICAP entries additionally carry a <code className="bg-gray-200 dark:bg-gray-700 dark:text-gray-300 px-1 py-0.5 rounded text-xs">source: &quot;nicap&quot;</code> field
                for provenance tracking.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Manually Curated Key Figure Profiles &amp; Program Pages</p>
              <p>
                60+ key figure profiles (including David Grusch, Luis Elizondo, David Fravor, Garry Nolan,
                Hal Puthoff, Eric Davis, Chris Mellon, Bob Lazar, Dan Burisch, and many others) and government
                program pages (Project Blue Book, AAWSAP, AARO, TTSA, and others) are built by hand from
                multiple primary and secondary sources. Claims, timelines, and assessments are structured
                and organized by DECUR contributors. Supporting and contradicting evidence is documented
                without adjudication; DECUR does not endorse or dismiss any individual claim.
              </p>
            </div>

            <div>
              <p className="font-semibold text-gray-900 dark:text-gray-100 mb-1">Attribution Policy</p>
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
        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
          <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-1">Disclaimer</p>
          <p className="text-sm text-amber-900 dark:text-amber-200">
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
