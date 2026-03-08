import { useState, FC } from 'react';
import { EntityType, EntityData, EntitiesData, EntityProfilesProps } from '../../types/entities';

const EntityProfiles: FC<EntityProfilesProps> = ({ 
  initialEntity = 'p45',
  showReferences = false,
  className = ''
}) => {
  const [activeEntity, setActiveEntity] = useState<EntityType>(initialEntity);

  // Sample entity data
  const entities: EntitiesData = {
    p45: {
      id: 'p45-jrods',
      name: 'P-45 J-Rods',
      description: 'P-45 J-Rods represent beings from 45,000 years in our future, from Timeline 2. They exhibit distinct physiological features including elongated limbs, enlarged craniums, and reduced body mass.',
      characteristics: [
        'Height: Approximately 4.5 to 5 feet tall',
        'Large, black almond-shaped eyes with no visible pupils',
        'Gray skin with limited pigmentation',
        'Four digits on each hand (three fingers and one thumb)',
        'Limited emotional range compared to humans',
        'Telepathic communication abilities'
      ],
      society: 'Their society is highly structured and technological, with a significant focus on survival due to harsh environmental conditions on their future Earth. They maintain minimal social bonding, with functionality as the primary societal driver.',
      notes: 'The P-45s are described as having developed along Timeline 2, the more problematic of the potential future timelines documented in Dr. Burisch\'s research. Their genetic degradation is more severe than their P-52 counterparts.'
    },
    p52: {
      id: 'p52-jrods',
      name: 'P-52 J-Rods',
      description: 'P-52 J-Rods come from 52,000 years in our future, along Timeline 1. While sharing many physical characteristics with P-45s, they display notable differences in physiology, technology, and social structure.',
      characteristics: [
        'Height: Approximately 4 to 5 feet tall',
        'Large, black eyes with some reports of visible iris patterns',
        'Gray skin with slightly more pigmentation than P-45s',
        'Four digits on each hand with improved dexterity',
        'Wider emotional range than P-45s',
        'Enhanced telepathic abilities'
      ],
      society: 'P-52 society shows greater emphasis on communal values while still maintaining a highly technological infrastructure. They demonstrate more advanced ethical frameworks and philosophical development than their P-45 counterparts.',
      notes: 'P-52s are considered to have developed along the more favorable Timeline 1. Though still suffering from genetic degradation, they have managed this issue more effectively than P-45s, leading to increased longevity and better quality of life.'
    },
    orions: {
      id: 'p52-orions',
      name: 'P-52 Orions/Nordics',
      description: 'P-52 Orions, sometimes referred to as "Nordics," represent a different evolutionary path from the same future timeline as P-52 J-Rods. Their appearance is remarkably human-like, with notable enhancements in physical and mental capabilities.',
      characteristics: [
        'Height: Typically 5.5 to 7 feet tall',
        'Human-like appearance with pale skin and typically blonde hair',
        'Proportionally symmetrical features',
        'Five fingers like humans',
        'Highly developed telepathic and possible empathic abilities',
        'Enhanced physical strength and longevity'
      ],
      society: 'Orion society is characterized by advanced philosophical development with strong ethical frameworks. They prioritize knowledge preservation and spiritual growth alongside technological advancement, creating a more balanced civilization.',
      notes: 'The relationship between J-Rods and Orions remains complex, with both groups originating from the same timeline but following different evolutionary paths. Orions appear to have avoided the severe genetic degradation affecting J-Rods.'
    }
  };

  // Get the currently active entity data
  const activeEntityData = entities[activeEntity];

  return (
    <div className={className}>
      <h2 className="text-2xl font-bold mb-6">Extraterrestrial Biological Entities</h2>
      
      {/* Entity selector tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeEntity === 'p45' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveEntity('p45')}
        >
          P-45 J-Rods
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeEntity === 'p52' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveEntity('p52')}
        >
          P-52 J-Rods
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeEntity === 'orions' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveEntity('orions')}
        >
          P-52 Orions/Nordics
        </button>
      </div>
      
      {/* Entity content */}
      <div className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900">{activeEntityData.name}</h3>
          <p className="mt-2 text-gray-700">{activeEntityData.description}</p>
        </div>
        
        <div>
          <h4 className="text-lg font-medium text-gray-900">Physical Characteristics</h4>
          <ul className="mt-2 list-disc list-inside text-gray-700 space-y-1">
            {activeEntityData.characteristics.map((trait, index) => (
              <li key={index}>{trait}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="text-lg font-medium text-gray-900">Social Structure</h4>
          <p className="mt-2 text-gray-700">{activeEntityData.society}</p>
        </div>
        
        <div>
          <h4 className="text-lg font-medium text-gray-900">Additional Notes</h4>
          <p className="mt-2 text-gray-700">{activeEntityData.notes}</p>
        </div>
        
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h5 className="text-sm font-medium text-blue-800">Research Disclaimer</h5>
              <div className="mt-1 text-sm text-blue-700">
                <p>
                  This information is compiled from Dr. Dan Burisch's research and testimony. 
                  DECUR presents this material for educational purposes, allowing researchers to examine 
                  data that extends beyond conventional scientific understanding.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntityProfiles;