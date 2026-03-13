import { FC, useState } from 'react';
import { BurischData, BurischConcept } from '../../../../types/data';
import burischData from '../../../../data/key-figures/burisch.json';

const data = burischData as BurischData;

const ConceptsTab: FC = () => {
  const { concepts } = data;
  const [expanded, setExpanded] = useState<string | null>(concepts[0]?.id ?? null);
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        Theoretical frameworks and phenomena central to Burisch's research.
      </p>
      {concepts.map((c: BurischConcept) => {
        const isOpen = expanded === c.id;
        return (
          <div key={c.id} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setExpanded(isOpen ? null : c.id)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <h4 className="font-semibold text-gray-900 text-sm">{c.name}</h4>
              <svg
                className={`h-4 w-4 text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isOpen && (
              <div className="px-5 pb-5 border-t border-gray-100 space-y-3">
                <p className="text-sm text-gray-700 pt-3">{c.summary}</p>
                {c.mechanics && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Mechanics</p>
                    <ul className="space-y-1">
                      {c.mechanics.map((m, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-primary mt-0.5 shrink-0">›</span><span>{m}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {c.key_claims && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Key Claims</p>
                    <ul className="space-y-1">
                      {c.key_claims.map((kc, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-primary mt-0.5 shrink-0">›</span><span>{kc}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {c.factions && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Factions</p>
                    <ul className="space-y-1">
                      {c.factions.map((f, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-primary mt-0.5 shrink-0">›</span><span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {c.framework && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Framework</p>
                    <ul className="space-y-1">
                      {c.framework.map((f, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-primary mt-0.5 shrink-0">›</span><span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {c.genetic_component && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Genetic Component</p>
                    <ul className="space-y-1">
                      {c.genetic_component.map((g, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-primary mt-0.5 shrink-0">›</span><span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {c.properties && (
                  <div>
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1.5">Properties</p>
                    <ul className="space-y-1">
                      {c.properties.map((p, i) => (
                        <li key={i} className="flex gap-2 text-sm text-gray-700">
                          <span className="text-primary mt-0.5 shrink-0">›</span><span>{p}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {c.outcome && (
                  <div className="bg-green-50 border border-green-100 rounded p-3">
                    <p className="text-xs font-medium text-green-700 uppercase tracking-wide mb-1">Outcome</p>
                    <p className="text-sm text-gray-700">{c.outcome}</p>
                  </div>
                )}
                {c.implication && (
                  <div className="bg-amber-50 border border-amber-100 rounded p-3">
                    <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-1">Implication</p>
                    <p className="text-sm text-gray-700">{c.implication}</p>
                  </div>
                )}
                {c.research_context && (
                  <p className="text-xs text-gray-400 italic">{c.research_context}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ConceptsTab;
