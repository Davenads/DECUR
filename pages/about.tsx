import { FormEvent } from 'react';
import type { NextPage } from 'next';

const About: NextPage = () => {
  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission
    console.log('Form submitted');
  };

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">About DECUR</h1>
        
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Header background */}
          <div className="h-40 bg-gradient-to-r from-blue-900 to-indigo-900"></div>
          
          {/* Content */}
          <div className="px-6 py-8 -mt-16">
            <div className="bg-white p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
              <p className="text-gray-700 mb-4">
                DECUR (Data Exceeding Current Understanding of Reality) is dedicated to cataloging, analyzing, and 
                making accessible whistleblower testimony that extends beyond conventional scientific and governmental acknowledgment.
                We focus on Unidentified Aerial Phenomena (UAP), Non-Human Intelligence (NHI), and advanced technologies 
                as reported by credible witnesses from military, intelligence, scientific, and government backgrounds.
              </p>
              <p className="text-gray-700">
                We believe that scientific and public understanding benefits from the organized preservation of this testimony. 
                By providing a structured repository of information that challenges conventional paradigms, we aim to 
                facilitate research, cross-referencing, and pattern recognition across multiple witness accounts.
              </p>
            </div>
            
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-bold mb-3">Platform Purpose</h2>
                <p className="text-gray-700">
                  DECUR serves as a comprehensive knowledge base beginning with Dr. Dan Burisch's research as our 
                  foundation, while continuously expanding to include testimony from other credible whistleblowers. 
                  We present this information with analytical rigor while maintaining neutrality, allowing researchers 
                  to examine the data and draw their own conclusions about the nature of UAP/NHI phenomena.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-bold mb-3">Featured Whistleblower: Dr. Dan Burisch</h2>
                <p className="text-gray-700">
                  Our initial database focuses on Dr. Dan Burisch, a microbiologist whose controversial research has 
                  challenged conventional understanding of extraterrestrial biological entities, timeline mechanics, 
                  and cellular transformation. His accounts of Project Lotus, interactions with various non-human 
                  entities, and testimony regarding classified programs form the foundation of our initial database.
                </p>
                <p className="text-gray-700 mt-2">
                  As DECUR expands, we will incorporate testimony from additional whistleblowers including military 
                  personnel, intelligence officers, government contractors, and scientific researchers who have come 
                  forward with accounts of UAP encounters, recovered materials, and special access programs.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-bold mb-3">Contact</h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        placeholder="Your email"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                      Subject
                    </label>
                    <input
                      type="text"
                      id="subject"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Message subject"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Your message"
                    ></textarea>
                  </div>
                  <div>
                    <button
                      type="submit"
                      className="btn btn-primary px-6 py-2"
                    >
                      Send Message
                    </button>
                  </div>
                </form>
              </section>
            </div>

            <div className="mt-12 pt-6 border-t border-gray-200">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Disclaimer</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        DECUR presents information for educational and research purposes only. We neither endorse nor dismiss 
                        the claims contained within the whistleblower testimony we archive, but rather provide a platform for organized 
                        access to this material. The accounts documented here may challenge conventional understanding and official narratives. 
                        Readers are encouraged to apply critical thinking and draw their own conclusions.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;