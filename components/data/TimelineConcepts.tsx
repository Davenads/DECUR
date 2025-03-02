import { FC } from 'react';

const TimelineConcepts: FC = () => {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Timeline Mechanics</h2>
      
      <div className="space-y-8">
        {/* Timeline Split Theory */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Timeline 1 vs Timeline 2 Split-Point Theory</h3>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm mb-4">
            <div className="p-5">
              <p className="text-gray-700 mb-4">
                According to Dr. Burisch's research, human history diverges into two primary timelines 
                at a critical juncture between 2012-2017. This split creates two distinct future paths:
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                  <h4 className="font-medium text-blue-800 mb-2">Timeline 1</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Characterized by increased global cooperation</li>
                    <li>Gradual environmental restoration</li>
                    <li>Technological advancement with ethical constraints</li>
                    <li>Eventually leads to the P-52 Orions and J-Rods</li>
                    <li>More favorable outcome with less extreme adaptation</li>
                  </ul>
                </div>
                
                <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                  <h4 className="font-medium text-red-800 mb-2">Timeline 2</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Marked by continued conflict and division</li>
                    <li>Severe environmental degradation</li>
                    <li>Technological advancement without ethical governance</li>
                    <li>Leads to the P-45 J-Rods</li>
                    <li>Less favorable outcome requiring extreme adaptation</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-gray-700">
                The split-point theory suggests that human decisions and actions within this critical window 
                determine which timeline becomes dominant. Dr. Burisch reported that visitors from both 
                potential futures have traveled back to influence events toward their respective timelines.
              </p>
            </div>
          </div>
        </section>
        
        {/* Looking Glass Technology */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Looking Glass Technology</h3>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-5">
              <p className="text-gray-700 mb-4">
                The Looking Glass is described as a device capable of viewing probable futures and pasts by creating 
                and stabilizing micro-wormholes that access the quantum informational field connecting different points in time.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                <h4 className="font-medium text-gray-800 mb-2">Technical Components</h4>
                <ul className="list-disc list-inside text-gray-700 space-y-1">
                  <li>Cylindrical array of rotating superconductors</li>
                  <li>Argon-mercury gas mixture as a medium</li>
                  <li>Electromagnetic field generators</li>
                  <li>Specialized crystalline structures for focusing</li>
                </ul>
              </div>
              
              <p className="text-gray-700 mb-4">
                According to Dr. Burisch's testimony, Looking Glass viewings showed multiple probability strings for future 
                events, with probability percentages attached to each outcome. The technology was reportedly deactivated 
                worldwide in early 2006 due to concerns that its operation might be influencing or reinforcing the 
                catastrophic Timeline 2 probability string.
              </p>
              
              <p className="text-gray-700">
                Records indicate that multiple Looking Glass devices were constructed at various locations globally, 
                with different technical approaches and varying degrees of stability and accuracy in their temporal viewing capabilities.
              </p>
            </div>
          </div>
        </section>
        
        {/* Treaty Systems */}
        <section>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Treaty Systems</h3>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="p-5">
              <p className="text-gray-700 mb-4">
                Dr. Burisch documented a series of treaties between human representatives and various extraterrestrial groups, 
                most notably the "T-9 Treaties" which established protocols for contact, technology exchange, and 
                non-interference agreements.
              </p>
              
              <div className="space-y-4 mb-4">
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <h4 className="font-medium text-gray-800 mb-2">Key Treaty Provisions</h4>
                  <ul className="list-disc list-inside text-gray-700 space-y-1">
                    <li>Limited technology transfer with restrictions on weapons applications</li>
                    <li>Permission for controlled biological sampling from human populations</li>
                    <li>Designated contact protocols and authorized meeting facilities</li>
                    <li>Non-disclosure agreements regarding extraterrestrial presence</li>
                    <li>Timeline non-interference clauses (added in later amendments)</li>
                  </ul>
                </div>
              </div>
              
              <p className="text-gray-700">
                According to the documentation, these treaties underwent multiple revisions as the understanding of 
                timeline mechanics evolved, with significant modifications occurring after the discovery that some 
                extraterrestrial visitors originated from Earth's potential futures rather than other star systems.
              </p>
            </div>
          </div>
        </section>
        
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

export default TimelineConcepts;