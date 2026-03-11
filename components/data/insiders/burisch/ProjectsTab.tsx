import { FC, useState } from 'react';
import { BurischData, BurischProject } from '../../../../types/data';
import burischData from '../../../../data/insiders/burisch.json';

const data = burischData as BurischData;

const ProjectsTab: FC = () => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const { projects } = data;

  const umbrella = projects.find(p => p.id === 'project-aquarius');
  const subProjects = projects.filter(p => p.id !== 'project-aquarius');

  return (
    <div className="space-y-5">
      {umbrella && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-5">
          <p className="text-xs font-medium text-primary uppercase tracking-wide mb-1">Umbrella Program</p>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">{umbrella.name}</h3>
          {umbrella.established && (
            <p className="text-xs text-gray-400 mb-2">Est. {umbrella.established} · {umbrella.classification}</p>
          )}
          <p className="text-sm text-gray-700">{umbrella.purpose}</p>
          {umbrella.admin && <p className="text-xs text-gray-500 mt-2">{umbrella.admin}</p>}
        </div>
      )}

      <h4 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Sub-Projects</h4>
      <div className="space-y-2">
        {subProjects.map((proj: BurischProject) => {
          const isOpen = expanded === proj.id;
          return (
            <div key={proj.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : proj.id)}
                className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
              >
                <div>
                  <span className="font-medium text-gray-900 text-sm">{proj.name}</span>
                  {proj.aliases && (
                    <span className="text-xs text-gray-400 ml-2">({proj.aliases.join(', ')})</span>
                  )}
                </div>
                <svg
                  className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isOpen && (
                <div className="px-4 pb-4 space-y-2 border-t border-gray-100">
                  <p className="text-sm text-gray-700 pt-3">{proj.purpose}</p>
                  {proj.key_personnel && (
                    <p className="text-xs text-gray-500"><span className="font-medium">Key Personnel:</span> {proj.key_personnel.join(', ')}</p>
                  )}
                  {proj.location && (
                    <p className="text-xs text-gray-500"><span className="font-medium">Location:</span> {proj.location}</p>
                  )}
                  {proj.discoveries && (
                    <p className="text-xs text-gray-500"><span className="font-medium">Discoveries:</span> {proj.discoveries.join(', ')}</p>
                  )}
                  {proj.outcome && (
                    <p className="text-xs text-gray-500"><span className="font-medium">Outcome:</span> {proj.outcome}</p>
                  )}
                  {proj.notes && (
                    <p className="text-xs text-gray-500 italic">{proj.notes}</p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProjectsTab;
