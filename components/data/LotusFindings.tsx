import { useState, FC } from 'react';

type TabType = 'overview' | 'ganesh' | 'shiva' | 'cellular';

const LotusFindings: FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Project Lotus</h2>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-6">
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'overview' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'ganesh' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('ganesh')}
        >
          Ganesh Particles
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'shiva' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('shiva')}
        >
          Shiva Portals
        </button>
        <button
          className={`px-4 py-2 font-medium ${activeTab === 'cellular' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('cellular')}
        >
          Cellular Transformation
        </button>
      </div>
      
      {/* Content for each tab */}
      <div className="space-y-6">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div>
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm p-5 mb-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Project Lotus Overview</h3>
              <p className="text-gray-700 mb-4">
                Project Lotus was a classified research program conducted by Dr. Dan Burisch from 
                approximately 1999 to 2004. The project focused on studying unusual cellular transformations 
                and the interaction between biological systems and theoretical micro-dimensional portals.
              </p>
              <p className="text-gray-700 mb-4">
                According to Dr. Burisch's documentation, the project originated from observations of 
                an anomalous silicon-based crystalline growth in a sealed, sterile environment. This 
                led to a series of experiments examining the relationship between these crystals and 
                biological cells, particularly in the presence of specific electromagnetic fields.
              </p>
              <p className="text-gray-700">
                The core findings of Project Lotus centered around three primary phenomena: Ganesh particles, 
                Shiva portals, and cellular transformation mechanisms. These discoveries suggested potential 
                applications in healing technology and genetic repair, with possible implications for 
                addressing the genetic degradation observed in extraterrestrial biological entities.
              </p>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5">
              <h4 className="font-medium text-gray-800 mb-2">Key Experimental Elements</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mb-4">
                <li>Silicon oxide crystal structures</li>
                <li>Specific frequency electromagnetic fields</li>
                <li>Prismatic light sources</li>
                <li>Biological cell samples (primarily neuronal)</li>
                <li>Temperature and pressure-controlled environments</li>
              </ul>
              
              <h4 className="font-medium text-gray-800 mb-2">Timeline of Significant Discoveries</h4>
              <div className="relative border-l-2 border-gray-300 ml-3 pl-8 pb-2">
                <div className="mb-6 relative">
                  <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                  <p className="font-medium text-gray-900">1999: Initial Crystal Formation</p>
                  <p className="text-gray-700">First observation of anomalous silicon crystal growth in sealed environment</p>
                </div>
                <div className="mb-6 relative">
                  <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                  <p className="font-medium text-gray-900">2000: Ganesh Particle Identification</p>
                  <p className="text-gray-700">Detection of unusual subatomic behavior in proximity to crystals</p>
                </div>
                <div className="mb-6 relative">
                  <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                  <p className="font-medium text-gray-900">2001: Shiva Portal Observation</p>
                  <p className="text-gray-700">Documentation of micro-wormhole formation at cellular level</p>
                </div>
                <div className="relative">
                  <div className="absolute -left-10 mt-1.5 h-4 w-4 rounded-full bg-primary"></div>
                  <p className="font-medium text-gray-900">2003: Cellular Transformation Breakthrough</p>
                  <p className="text-gray-700">Successful induction of controlled genetic repair mechanisms</p>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Ganesh Particles Tab */}
        {activeTab === 'ganesh' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Ganesh Particles</h3>
            <p className="text-gray-700 mb-4">
              Ganesh particles were identified in Project Lotus as theoretical subatomic particles that 
              appear to facilitate communication between normal matter and dark matter, potentially 
              enabling micro-wormhole formation at the cellular level.
            </p>
            
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm p-5 mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Observed Properties</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Non-standard quantum behavior, exhibiting both wave and particle characteristics simultaneously</li>
                <li>Ability to transition between observable and non-observable states</li>
                <li>Tendency to cluster around specific cellular structures, particularly mitochondria</li>
                <li>Relationship with electromagnetic fields of specific frequencies (notably 432Hz)</li>
                <li>Correspondence with anomalous energy readings during cellular transformation events</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Theoretical Framework</h4>
              <p className="text-gray-700 mb-3">
                In Dr. Burisch's theoretical model, Ganesh particles act as intermediaries between 
                conventional matter and theoretical non-observable dimensions. This model proposes that 
                these particles can temporarily bind to cellular structures, creating energetic pathways 
                that alter conventional physics at the quantum level.
              </p>
              <p className="text-gray-700">
                The particles were named "Ganesh" after the Hindu deity who removes obstacles, as they 
                appeared to break down barriers between dimensional states, allowing for information and 
                energy transfer across these boundaries.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h4 className="font-medium text-blue-800 mb-3">Research Implications</h4>
              <p className="text-gray-700 mb-3">
                If verified, Ganesh particles would represent a significant extension to the Standard 
                Model of particle physics, potentially offering a bridge between quantum mechanics and 
                theories of extra dimensions or parallel realities.
              </p>
              <p className="text-gray-700">
                The documented interactions between these particles and biological systems suggest 
                possible applications in advanced healing technologies, particularly for conditions 
                involving cellular degradation or genetic damage.
              </p>
            </div>
          </div>
        )}
        
        {/* Shiva Portals Tab */}
        {activeTab === 'shiva' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Shiva Portals</h3>
            <p className="text-gray-700 mb-4">
              Shiva portals are described in Project Lotus documentation as microscopic wormhole-like 
              structures that can form temporarily within or between cells under specific conditions. 
              These portals appear to facilitate the transfer of information and energy between different 
              dimensional states.
            </p>
            
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm p-5 mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Documented Characteristics</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Microscopic scale, typically 10-100 nanometers in diameter</li>
                <li>Transient nature, with observable durations from milliseconds to several seconds</li>
                <li>Formation typically occurs at cellular boundaries or within mitochondria</li>
                <li>Associated with unusual electromagnetic readings and light phenomena</li>
                <li>Correlation with cellular rejuvenation or transformation events</li>
                <li>Increased frequency in the presence of certain crystalline structures</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Formation Conditions</h4>
              <p className="text-gray-700 mb-3">
                According to experimental records, Shiva portal formation was consistently associated with:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mb-3">
                <li>Presence of silicon oxide crystalline structures</li>
                <li>Specific electromagnetic field frequencies (primarily in the 400-450Hz range)</li>
                <li>Prismatic light exposure at precise angles</li>
                <li>Cellular stress or damage requiring repair mechanisms</li>
              </ul>
              <p className="text-gray-700">
                The portals were named "Shiva" after the Hindu deity associated with both destruction and 
                transformation, reflecting their role in cellular breakdown and subsequent regeneration.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h4 className="font-medium text-blue-800 mb-3">Theoretical Significance</h4>
              <p className="text-gray-700 mb-3">
                The Shiva portal phenomena, if verified by conventional science, would represent a 
                groundbreaking discovery in physics and biology. These structures potentially demonstrate 
                a natural mechanism for information transfer between dimensional states at the cellular level.
              </p>
              <p className="text-gray-700">
                Dr. Burisch's research suggested that these portals may play a role in natural cellular 
                repair processes, accessing information templates from a non-local field to guide 
                genetic restoration and cellular regeneration.
              </p>
            </div>
          </div>
        )}
        
        {/* Cellular Transformation Tab */}
        {activeTab === 'cellular' && (
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Cellular Transformation</h3>
            <p className="text-gray-700 mb-4">
              The cellular transformation aspects of Project Lotus involved documented cases of rapid 
              cellular regeneration, repair, and in some cases, fundamental alteration of cellular 
              structures when exposed to specific experimental conditions.
            </p>
            
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm p-5 mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Key Observations</h4>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Accelerated healing of damaged tissue samples</li>
                <li>Correction of intentionally introduced genetic mutations</li>
                <li>Enhancement of mitochondrial function and efficiency</li>
                <li>Unusual protein synthesis patterns during transformation events</li>
                <li>Temporary alteration of cellular electromagnetic signatures</li>
                <li>Correlation between transformation events and measurable quantum fluctuations</li>
              </ul>
            </div>
            
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 mb-6">
              <h4 className="font-medium text-gray-800 mb-3">Transformation Mechanism</h4>
              <p className="text-gray-700">
                According to Project Lotus documentation, cellular transformations followed a consistent pattern:
              </p>
              <ol className="list-decimal list-inside text-gray-700 space-y-1 mt-3">
                <li className="ml-4">Initial cellular stress or damage</li>
                <li className="ml-4">Formation of silicon-based crystalline structures near affected cells</li>
                <li className="ml-4">Increased Ganesh particle activity</li>
                <li className="ml-4">Formation of Shiva portals within cellular structures</li>
                <li className="ml-4">Brief period of cellular breakdown or reorganization</li>
                <li className="ml-4">Rapid reconstruction following an apparent template</li>
                <li className="ml-4">Restoration to original or enhanced cellular function</li>
              </ol>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
              <h4 className="font-medium text-blue-800 mb-3">Applications and Implications</h4>
              <p className="text-gray-700 mb-3">
                The potential applications of the cellular transformation technology included:
              </p>
              <ul className="list-disc list-inside text-gray-700 space-y-1 mb-3">
                <li>Treatment for radiation exposure and genetic damage</li>
                <li>Regenerative medicine for degenerative conditions</li>
                <li>Potential solutions for genetic degradation observed in extraterrestrial entities</li>
                <li>Extended human cellular longevity</li>
              </ul>
              <p className="text-gray-700">
                Dr. Burisch's documentation suggests that this research was of particular interest to 
                both P-45 and P-52 J-Rods, as it potentially offered solutions to the genetic degradation 
                problems their societies faced in Earth's possible futures.
              </p>
            </div>
          </div>
        )}
        
        {/* Research Disclaimer */}
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

export default LotusFindings;