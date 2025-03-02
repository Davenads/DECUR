import Link from 'next/link';
import type { FC } from 'react';
import Head from 'next/head';
import { CustomNextPage, HomePageProps } from '../types/pages';

const Home: CustomNextPage<HomePageProps> = ({ featuredData = [], recentUpdates = [] }) => {
  return (
    <>
      <Head>
        <title>DECUR - Data Exceeding Current Understanding of Reality</title>
        <meta name="description" content="A comprehensive repository documenting whistleblower testimony on UAP, NHI, and advanced technologies." />
      </Head>
      <div className="space-y-16">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-xl overflow-hidden shadow-xl">
        <div className="container mx-auto px-6 py-16 flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Data Exceeding Current Understanding of Reality
          </h1>
          <p className="text-xl text-blue-100 max-w-3xl mb-8">
            A comprehensive repository documenting whistleblower testimony on Unidentified Aerial Phenomena, Non-Human Intelligence, and advanced technologies.
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/data" className="btn bg-white text-indigo-900 hover:bg-blue-50 font-medium text-lg px-8 py-3 rounded-lg shadow-md transition-colors">
              Explore the Data
            </Link>
            <Link href="/about" className="btn bg-transparent border-2 border-white text-white hover:bg-white/10 font-medium text-lg px-8 py-3 rounded-lg transition-colors">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* Introduction Section */}
      <section className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Welcome to DECUR</h2>
          <div className="prose prose-lg max-w-none">
            <p className="text-lg text-gray-700">
              DECUR serves as a comprehensive repository for whistleblower testimonies and research involving phenomena that challenge our conventional understanding of reality, including Unidentified Aerial Phenomena (UAP), Non-Human Intelligence (NHI), and advanced technologies.
            </p>
            <p className="text-lg text-gray-700 mt-4">
              Beginning with Dr. Dan Burisch's groundbreaking research as our foundation, we're continuously expanding our archive to include testimony from military personnel, government officials, scientists, and other credible witnesses who have come forward with compelling accounts of encounters and insider knowledge.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Explore Key Research Areas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Category 1 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
              <div className="h-48 bg-blue-800"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Non-Human Intelligence</h3>
                <p className="text-gray-600 mb-4">
                  Documented accounts of various intelligent non-human entities, including their biological 
                  features, technological capabilities, and interactions with humans.
                </p>
                <Link href="/data" className="text-primary font-medium hover:text-primary-dark">
                  Explore NHI Data →
                </Link>
              </div>
            </div>

            {/* Category 2 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
              <div className="h-48 bg-indigo-800"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Advanced Technologies</h3>
                <p className="text-gray-600 mb-4">
                  Whistleblower testimony on recovered or observed exotic technologies including 
                  propulsion systems, temporal manipulation devices, and energy generation.
                </p>
                <Link href="/data" className="text-primary font-medium hover:text-primary-dark">
                  Explore Technologies →
                </Link>
              </div>
            </div>

            {/* Category 3 */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105">
              <div className="h-48 bg-purple-800"></div>
              <div className="p-6">
                <h3 className="text-xl font-bold mb-2">Special Access Programs</h3>
                <p className="text-gray-600 mb-4">
                  Documentation on classified projects investigating non-conventional phenomena,
                  including recovered materials and reverse-engineering efforts.
                </p>
                <Link href="/data" className="text-primary font-medium hover:text-primary-dark">
                  Explore Programs →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="container mx-auto px-4 py-8 text-center">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8 border border-gray-100">
          <h2 className="text-2xl font-bold mb-4">Ready to Dive Deeper?</h2>
          <p className="text-gray-600 mb-6">
            Explore our curated resources, including transcripts, interviews, and a comprehensive 
            glossary of terms to enhance your understanding of UAP/NHI phenomena.
          </p>
          <Link href="/resources" className="btn btn-primary inline-block px-8 py-3 text-lg">
            Browse Resources
          </Link>
        </div>
      </section>
    </div>
    </>
  );
};

export default Home;