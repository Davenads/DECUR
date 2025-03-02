import { useState, useEffect, FC, ChangeEvent } from 'react';

interface GlossaryTerm {
  term: string;
  definition: string;
}

interface GroupedTerms {
  [key: string]: GlossaryTerm[];
}

const Glossary: FC = () => {
  // Mock glossary terms
  const glossaryTerms: GlossaryTerm[] = [
    {
      term: "AATIP",
      definition: "Advanced Aerospace Threat Identification Program - A classified Pentagon program that operated from 2007 to 2012, focused on investigating Unidentified Aerial Phenomena (UAP) and their potential implications for national security."
    },
    {
      term: "AAWSAP",
      definition: "Advanced Aerospace Weapon System Application Program - A predecessor and broader version of AATIP that included research into various phenomena beyond just aerial threats."
    },
    {
      term: "Ganesh Particle",
      definition: "A theoretical subatomic particle identified in Project Lotus research that appears to facilitate communication between normal matter and dark matter, potentially enabling micro-wormhole formation at the cellular level."
    },
    {
      term: "J-Rod",
      definition: "The designation given to extraterrestrial biological entities that originate from Earth's future timelines, according to Dr. Dan Burisch's testimony. They exhibit significant physiological differences from modern humans due to evolutionary adaptations and environmental pressures."
    },
    {
      term: "Looking Glass",
      definition: "An advanced technology reportedly developed using reverse-engineered extraterrestrial principles that allows for the observation of probable future and past events through the manipulation of energetic fields connecting timelines."
    },
    {
      term: "Majestic-12 (MJ-12)",
      definition: "An alleged secret committee of scientists, military leaders, and government officials formed in 1947 under Executive Order by President Harry S. Truman to investigate extraterrestrial activity and technology."
    },
    {
      term: "Non-Human Intelligence (NHI)",
      definition: "A broader, more neutral term used to describe various forms of intelligent entities that are not human in origin. This term is increasingly preferred in serious UAP research as it avoids the cultural baggage associated with terms like 'aliens' or 'extraterrestrials'."
    },
    {
      term: "Project Lotus",
      definition: "A classified research program focused on studying unusual cellular transformations and the interaction between biological systems and theoretical micro-wormholes, with potential applications for healing and genetic repair, according to Dr. Dan Burisch's testimony."
    },
    {
      term: "P-45",
      definition: "Designation indicating entities originating from approximately 45,000 years in Earth's future along Timeline 2, characterized by more severe genetic degradation than their P-52 counterparts, according to Dr. Dan Burisch's testimony."
    },
    {
      term: "P-52",
      definition: "Designation indicating entities originating from approximately 52,000 years in Earth's future along Timeline 1, showing more advanced ethical development and less genetic degradation than P-45s, according to Dr. Dan Burisch's testimony."
    },
    {
      term: "SAP",
      definition: "Special Access Program - Highly classified government programs with stringent security protocols, compartmentalized information, and restricted personnel access. Multiple whistleblowers have alleged the existence of SAPs related to UAP/NHI research."
    },
    {
      term: "Selkie Particle",
      definition: "A theoretical particle identified in Project Lotus research that appears to act as a carrier for quantum information between dimensions, potentially facilitating genetic modification at the quantum level."
    },
    {
      term: "Shiva Portal",
      definition: "A hypothetical micro-scale wormhole or interdimensional gateway that can form within biological cells under specific conditions, potentially allowing for the transfer of information or energy between different dimensional states."
    },
    {
      term: "Stargate",
      definition: "An alleged device capable of creating stable wormholes between distant points in space or between timelines, allowing for rapid transportation or communication across vast distances."
    },
    {
      term: "T-9 Treaty",
      definition: "A purported agreement between human representatives and multiple extraterrestrial groups that established protocols for limited contact, technology exchange, and non-interference in human affairs."
    },
    {
      term: "Timeline 1",
      definition: "One of two primary potential future timelines identified in Dr. Burisch's research, characterized by greater human cooperation, environmental recovery, and eventual positive extraterrestrial contact."
    },
    {
      term: "Timeline 2",
      definition: "One of two primary potential future timelines identified in Dr. Burisch's research, characterized by increased environmental degradation, societal fragmentation, and harsher conditions leading to more extreme adaptations in human evolution."
    },
    {
      term: "UAP",
      definition: "Unidentified Aerial Phenomena - The modern term used by governments and researchers to describe what were previously called UFOs. The term emphasizes the unknown nature of these observations without presuming their origin or purpose."
    },
    {
      term: "UAPTF",
      definition: "Unidentified Aerial Phenomena Task Force - A Department of Defense program established in 2020 to standardize and collect data on UAP sightings and incidents, particularly those reported by military personnel."
    },
    {
      term: "USG",
      definition: "United States Government - Often referenced in whistleblower testimony regarding knowledge of or involvement with UAP/NHI phenomena."
    },
    {
      term: "Whistleblower",
      definition: "An individual who exposes information or activities that are deemed illegal, unethical, or incorrect within an organization. In the context of UAP/NHI research, whistleblowers are typically current or former government, military, or contractor personnel who come forward with information about classified programs related to these topics."
    }
  ];

  // Sort terms alphabetically
  const sortedTerms = [...glossaryTerms].sort((a, b) => 
    a.term.localeCompare(b.term)
  );

  // Group terms by first letter
  const groupTermsByLetter = (terms: GlossaryTerm[]): GroupedTerms => {
    const grouped: GroupedTerms = {};
    
    terms.forEach(item => {
      const firstLetter = item.term.charAt(0).toUpperCase();
      if (!grouped[firstLetter]) {
        grouped[firstLetter] = [];
      }
      grouped[firstLetter].push(item);
    });
    
    return grouped;
  };

  // Search functionality
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [groupedTerms, setGroupedTerms] = useState<GroupedTerms>({});
  const [activeLetters, setActiveLetters] = useState<string[]>([]);
  
  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  useEffect(() => {
    let filteredTerms;
    
    if (searchQuery) {
      filteredTerms = sortedTerms.filter(item => 
        item.term.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.definition.toLowerCase().includes(searchQuery.toLowerCase())
      );
    } else {
      filteredTerms = sortedTerms;
    }
    
    const grouped = groupTermsByLetter(filteredTerms);
    setGroupedTerms(grouped);
    setActiveLetters(Object.keys(grouped).sort());
  }, [searchQuery, sortedTerms]);

  // Initialize on component mount
  useEffect(() => {
    const grouped = groupTermsByLetter(sortedTerms);
    setGroupedTerms(grouped);
    setActiveLetters(Object.keys(grouped).sort());
  }, [sortedTerms]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Glossary of Terms</h2>
      
      {/* Search bar */}
      <div className="mb-8">
        <div className="relative">
          <input
            type="text"
            placeholder="Search terms..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>
      
      {/* Alphabet navigation */}
      {!searchQuery && (
        <div className="flex flex-wrap justify-center mb-8">
          {Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i)).map(letter => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className={`mx-1 mb-1 w-8 h-8 flex items-center justify-center rounded-full border ${
                activeLetters.includes(letter) 
                  ? 'bg-primary text-white border-primary' 
                  : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
              }`}
            >
              {letter}
            </a>
          ))}
        </div>
      )}
      
      {/* Terms list */}
      <div className="space-y-8">
        {activeLetters.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No terms found matching your search.</p>
        ) : (
          activeLetters.map(letter => (
            <div key={letter} id={`letter-${letter}`}>
              <h3 className="text-2xl font-bold text-primary mb-4 border-b-2 border-gray-200 pb-2">{letter}</h3>
              <div className="space-y-4">
                {groupedTerms[letter].map((item, index) => (
                  <div key={index} className="pb-4">
                    <h4 className="text-lg font-semibold text-gray-900">{item.term}</h4>
                    <p className="mt-1 text-gray-600">{item.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Glossary;