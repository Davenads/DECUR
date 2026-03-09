import { useState, useEffect, FC, ChangeEvent } from 'react';

interface GlossaryTerm {
  term: string;
  definition: string;
}

interface GroupedTerms {
  [key: string]: GlossaryTerm[];
}

const TERMS: GlossaryTerm[] = [
  {
    term: "AARO",
    definition: "All-domain Anomaly Resolution Office - Established by the DoD in July 2022 as the centralized office for detecting, identifying, and attributing UAP. Replaced the UAP Task Force. Responsible for producing the 2024 Historical Record Report."
  },
  {
    term: "AATIP",
    definition: "Advanced Aerospace Threat Identification Program - A classified Pentagon program that ran from 2007 to 2012 under Defense Intelligence Agency funding, focused on investigating UAP reported by U.S. military personnel. Luis Elizondo claims to have directed it through 2017 under a different organizational umbrella. Publicly confirmed via a 2017 New York Times investigation."
  },
  {
    term: "AAWSAP",
    definition: "Advanced Aerospace Weapon System Application Program - The broader predecessor to AATIP, managed by the Defense Intelligence Agency with Bigelow Aerospace Advanced Space Studies (BAASS) as primary contractor. Covered a wider range of anomalous phenomena than AATIP's aerial focus."
  },
  {
    term: "Bigelow Aerospace",
    definition: "Bigelow Aerospace Advanced Space Studies (BAASS) - Robert Bigelow's aerospace company that served as the primary contractor for AAWSAP. Senator Harry Reid secured the AATIP funding at Bigelow's request. BAASS reportedly studied materials collected in connection with UAP incidents."
  },
  {
    term: "Crash Retrieval",
    definition: "In UAP research, the alleged government practice of recovering downed or crashed non-human craft. David Grusch's 2023 congressional testimony alleged the U.S. has maintained a multi-decade crash retrieval and reverse engineering program concealed from congressional oversight."
  },
  {
    term: "Five Observables",
    definition: "An analytical framework developed by Luis Elizondo describing five consistent flight characteristics observed across UAP encounters studied under AATIP: (1) anti-gravity lift, (2) sudden and instantaneous acceleration, (3) hypersonic velocity without sonic signature, (4) low observability or cloaking, and (5) trans-medium travel. None are consistent with known human aerospace capability."
  },
  {
    term: "ICIG",
    definition: "Intelligence Community Inspector General - The independent oversight body within the U.S. intelligence community. In May 2022, ICIG Thomas Monheim received David Grusch's formal Disclosure of Urgent Concern and deemed it 'credible and urgent' - a formal legal threshold that triggered congressional notification."
  },
  {
    term: "Insider",
    definition: "On DECUR, an individual with claimed direct access to classified programs who has come forward publicly with testimony regarding UAP, non-human intelligence, or related government programs. Typically current or former military, intelligence, or contractor personnel. Distinct from witnesses and researchers who lack direct program access."
  },
  {
    term: "KONA BLUE",
    definition: "A Special Access Program proposal submitted to the Department of Homeland Security that was never approved, funded, or implemented. Referenced in connection with some of David Grusch's reported sources. AARO's 2024 Historical Record Report identified it as evidence that some disclosed 'programs' may reflect misidentified or unfunded proposals."
  },
  {
    term: "Majestic-12 (MJ-12)",
    definition: "An alleged secret committee of scientists, military leaders, and government officials formed in 1947 to oversee UAP investigation and any recovered materials. Existence remains unverified. Referenced extensively in Dan Burisch's testimony. MJ-12 documents surfaced in the 1980s but their authenticity is disputed."
  },
  {
    term: "NHI",
    definition: "Non-Human Intelligence - A broad term used in UAP research to describe intelligent entities not of human origin, without presuming whether they are extraterrestrial, extradimensional, or otherwise. Increasingly used in congressional and government contexts as a more neutral alternative to 'extraterrestrial.'"
  },
  {
    term: "NRO",
    definition: "National Reconnaissance Office - The U.S. intelligence agency responsible for operating reconnaissance satellites. David Grusch served as the NRO's representative to the DoD UAP Task Force, giving him access to intelligence community-wide UAP reporting."
  },
  {
    term: "SAP",
    definition: "Special Access Program - Classified U.S. government programs with access controls beyond standard Top Secret/SCI clearance. Multiple insiders, including Grusch and Elizondo, have alleged UAP-related programs operate as SAPs or within SAP compartments, limiting congressional oversight."
  },
  {
    term: "SCI",
    definition: "Sensitive Compartmented Information - A classification level above Top Secret requiring access to specific compartments based on need-to-know. Elizondo and Grusch both held TS/SCI clearances. Much of their testimony concerns programs that operate within SCI compartments."
  },
  {
    term: "UAP",
    definition: "Unidentified Anomalous Phenomena (previously Unidentified Aerial Phenomena) - The modern government and research term for what were previously called UFOs. 'Aerial' was broadened to 'Anomalous' in the 2023 NDAA to encompass objects observed in space, underwater, and transitioning between domains."
  },
  {
    term: "UAP Task Force",
    definition: "Unidentified Aerial Phenomena Task Force - Established by the DoD in August 2020 following Senate Intelligence Committee pressure. Standardized and centralized UAP data collection. Predecessor to AARO. David Grusch served as the NRO's representative to the Task Force from 2019 to 2021."
  },
  {
    term: "UAPTF",
    definition: "See UAP Task Force."
  },
  {
    term: "UAP Disclosure Act",
    definition: "The UAP Disclosure Act of 2023, introduced by Senators Schumer and Rounds as an NDAA amendment following David Grusch's congressional testimony. Modeled on the JFK Records Act, it established a presumption of disclosure for UAP-related government records and created a Presidential Review Board. Partially enacted in the 2024 NDAA."
  }
];

const Glossary: FC = () => {
  const sorted = [...TERMS].sort((a, b) => a.term.localeCompare(b.term));

  const [search, setSearch] = useState('');
  const [grouped, setGrouped] = useState<GroupedTerms>({});
  const [activeLetters, setActiveLetters] = useState<string[]>([]);

  const group = (terms: GlossaryTerm[]): GroupedTerms => {
    const g: GroupedTerms = {};
    for (const t of terms) {
      const k = t.term.charAt(0).toUpperCase();
      (g[k] = g[k] ?? []).push(t);
    }
    return g;
  };

  useEffect(() => {
    const q = search.toLowerCase();
    const filtered = q
      ? sorted.filter(t =>
          t.term.toLowerCase().includes(q) ||
          t.definition.toLowerCase().includes(q)
        )
      : sorted;
    const g = group(filtered);
    setGrouped(g);
    setActiveLetters(Object.keys(g).sort());
  }, [search]);

  return (
    <div>
      <h2 className="text-2xl font-bold font-heading text-gray-900 mb-1">Glossary</h2>
      <p className="text-sm text-gray-500 mb-6">
        Key terms and acronyms used across government, military, and insider disclosure contexts.
      </p>

      {/* Search */}
      <div className="relative mb-6">
        <input
          type="text"
          placeholder="Search terms..."
          value={search}
          onChange={(e: ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
          className="w-full px-4 py-2 pl-9 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
          fill="none" viewBox="0 0 24 24" stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Alphabet nav */}
      {!search && (
        <div className="flex flex-wrap gap-1 mb-6">
          {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
            <a
              key={letter}
              href={`#gl-${letter}`}
              className={`w-7 h-7 flex items-center justify-center rounded text-xs font-medium transition-colors ${
                activeLetters.includes(letter)
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-300 cursor-default pointer-events-none'
              }`}
            >
              {letter}
            </a>
          ))}
        </div>
      )}

      {/* Terms */}
      {activeLetters.length === 0 ? (
        <p className="text-gray-500 text-center py-8 text-sm">No terms found.</p>
      ) : (
        <div className="space-y-8">
          {activeLetters.map(letter => (
            <div key={letter} id={`gl-${letter}`}>
              <h3 className="text-lg font-bold text-primary border-b border-gray-200 pb-1 mb-4">{letter}</h3>
              <div className="space-y-4">
                {grouped[letter].map((item, i) => (
                  <div key={i}>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{item.term}</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Glossary;
