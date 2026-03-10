import { useState, useEffect, FC, ChangeEvent } from 'react';

interface GlossaryTerm {
  term: string;
  definition: string;
  source: 'curated' | 'gerb';
}

interface GlossaryProps {
  terms: GlossaryTerm[];
}

interface GroupedTerms {
  [key: string]: GlossaryTerm[];
}

const Glossary: FC<GlossaryProps> = ({ terms }) => {
  const sorted = [...terms].sort((a, b) => a.term.localeCompare(b.term));

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
      <p className="text-sm text-gray-500 mb-1">
        Key terms and acronyms used across government, military, and insider disclosure contexts.
      </p>
      <p className="text-xs text-gray-400 mb-6">
        {terms.filter(t => t.source === 'curated').length} curated &middot; {terms.filter(t => t.source === 'gerb').length} extracted from UAP Gerb research
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
                  <div key={i} className="flex gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900">{item.term}</h4>
                        {item.source === 'gerb' && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-400 font-normal leading-none">
                            research
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed">{item.definition}</p>
                    </div>
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
