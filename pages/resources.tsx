import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SeoHead from '../components/SeoHead';
import ResourceList from '../components/resources/ResourceList';
import Glossary from '../components/resources/Glossary';
import type { NextPage } from 'next';
import { GetStaticProps } from 'next';
import glossaryJson from '../data/glossary.json';
import resourcesJson from '../data/resources.json';

type TabType = 'sources' | 'testimony' | 'glossary';

interface ResourcesProps {
  glossaryTerms: Array<{ term: string; definition: string; source: 'curated' | 'gerb' }>;
  resourcesData: {
    sources: Array<{
      id: string; title: string; type?: string; author?: string; source?: string;
      participants?: string; year?: string; date?: string; description: string;
      url: string; insider: string | null; tags: string[];
    }>;
    testimony: Array<{
      id: string; title: string; type?: string; author?: string; source?: string;
      participants?: string; year?: string; date?: string; description: string;
      url: string; insider: string | null; tags: string[];
    }>;
  };
}

const Resources: NextPage<ResourcesProps> = ({ glossaryTerms, resourcesData }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('sources');

  useEffect(() => {
    const { tab } = router.query;
    if (tab === 'sources' || tab === 'testimony' || tab === 'glossary') {
      setActiveTab(tab);
    }
  }, [router.query]);

  return (
    <>
      <SeoHead
        title="Resources"
        description="Curated transcripts, interviews, primary documents, and a 293-term terminology reference for UAP and NHI research."
        path="/resources"
      />
      <div className="container mx-auto px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 mb-2">Resources</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            Primary source materials, official government documents, and reference definitions supporting DECUR research.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 mb-8">
          <button
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'sources'
                ? 'text-primary border-primary'
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('sources')}
          >
            Primary Sources
          </button>
          <button
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'testimony'
                ? 'text-primary border-primary'
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('testimony')}
          >
            Testimony & Interviews
          </button>
          <button
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'glossary'
                ? 'text-primary border-primary'
                : 'text-gray-500 dark:text-gray-400 border-transparent hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
            onClick={() => setActiveTab('glossary')}
          >
            Glossary
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          {activeTab === 'sources' && <ResourceList category="sources" data={resourcesData} />}
          {activeTab === 'testimony' && <ResourceList category="testimony" data={resourcesData} />}
          {activeTab === 'glossary' && <Glossary terms={glossaryTerms} />}
        </div>
      </div>
    </div>
    </>
  );
};

export const getStaticProps: GetStaticProps<ResourcesProps> = async () => {
  try {
    return {
      props: {
        glossaryTerms: glossaryJson as ResourcesProps['glossaryTerms'],
        resourcesData: resourcesJson as ResourcesProps['resourcesData'],
      },
      revalidate: 3600,
    };
  } catch (error) {
    console.error('[getStaticProps] resources.tsx:', error);
    return { notFound: true };
  }
};

export default Resources;
