import { FC, useState } from 'react';
import { InsiderEntry } from '../../types/data';
import InsiderProfile from './InsiderProfile';
import LazarProfile from './LazarProfile';
import GruschProfile from './GruschProfile';
import ElizondoProfile from './ElizondoProfile';
import FravorProfile from './FravorProfile';
import NellProfile from './NellProfile';
import NolanProfile from './NolanProfile';
import PuthoffProfile from './PuthoffProfile';
import MellonProfile from './MellonProfile';
import DavisProfile from './DavisProfile';
import BigelowProfile from './BigelowProfile';
import ValleeProfile from './ValleeProfile';

interface InsidersListProps {
  entries: InsiderEntry[];
}

const InsidersList: FC<InsidersListProps> = ({ entries }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const selectedEntry = entries.find(e => e.id === selectedId) ?? null;
  const onBack = () => setSelectedId(null);

  if (selectedEntry?.status === 'detailed') {
    if (selectedEntry.id === 'bob-lazar') {
      return <LazarProfile onBack={onBack} />;
    }
    if (selectedEntry.id === 'david-grusch') {
      return <GruschProfile onBack={onBack} />;
    }
    if (selectedEntry.id === 'luis-elizondo') {
      return <ElizondoProfile onBack={onBack} />;
    }
    if (selectedEntry.id === 'david-fravor') {
      return <FravorProfile onBack={onBack} />;
    }
    if (selectedEntry.id === 'hal-puthoff') {
      return <PuthoffProfile onBack={onBack} />;
    }
    if (selectedEntry.id === 'garry-nolan') {
      return <NolanProfile onBack={onBack} />;
    }
    if (selectedEntry.id === 'karl-nell') {
      return <NellProfile onBack={onBack} />;
    }
    if (selectedEntry.id === 'chris-mellon') {
      return <MellonProfile onBack={onBack} />;
    }
    if (selectedEntry.id === 'eric-davis') {
      return <DavisProfile onBack={onBack} />;
    }
    if (selectedEntry.id === 'robert-bigelow') {
      return <BigelowProfile onBack={onBack} />;
    }
    if (selectedEntry.id === 'jacques-vallee') {
      return <ValleeProfile onBack={onBack} />;
    }
    return (
      <InsiderProfile
        id={selectedEntry.id}
        onBack={onBack}
      />
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold font-heading text-gray-900 mb-1">Insiders</h2>
        <p className="text-sm text-gray-500">
          Individuals who have provided firsthand testimony regarding classified programs, extraterrestrial phenomena, and advanced technologies.
        </p>
      </div>

      <div className="grid gap-4">
        {entries.map(entry => (
          <div
            key={entry.id}
            className="border border-gray-200 rounded-lg p-5 hover:border-primary hover:shadow-md transition-all group"
          >
            {/* Name row + button — only these two compete for width */}
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-semibold text-gray-900">{entry.name}</h3>
                {entry.aliases.length > 0 && (
                  <span className="text-xs text-gray-400 italic">
                    aka {entry.aliases.join(', ')}
                  </span>
                )}
                {entry.status === 'stub' && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                    Stub
                  </span>
                )}
              </div>
              <div className="flex-shrink-0">
                {entry.status === 'detailed' ? (
                  <button
                    onClick={() => setSelectedId(entry.id)}
                    className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap"
                  >
                    View Case File
                  </button>
                ) : (
                  <span className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg whitespace-nowrap cursor-not-allowed">
                    Coming Soon
                  </span>
                )}
              </div>
            </div>

            {/* Full-width content below */}
            <p className="text-sm font-medium text-primary mb-0.5">{entry.role}</p>
            <p className="text-xs text-gray-400 mb-3">
              {entry.period} · {entry.affiliation}
            </p>
            <p className="text-sm text-gray-600 leading-relaxed mb-3">{entry.summary}</p>
            <div className="flex flex-wrap gap-1.5">
              {entry.tags.map(tag => (
                <span
                  key={tag}
                  className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InsidersList;
