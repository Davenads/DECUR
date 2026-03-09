import { useState } from 'react';
import ResourceList from '../components/resources/ResourceList';
import Glossary from '../components/resources/Glossary';
import type { NextPage } from 'next';

type TabType = 'sources' | 'testimony' | 'glossary';

const Resources: NextPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('sources');

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-gray-900 mb-2">Resources</h1>
          <p className="text-gray-500 max-w-2xl">
            Primary source materials, official government documents, and reference definitions supporting DECUR research.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-8">
          <button
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'sources'
                ? 'text-primary border-primary'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('sources')}
          >
            Primary Sources
          </button>
          <button
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'testimony'
                ? 'text-primary border-primary'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('testimony')}
          >
            Testimony & Interviews
          </button>
          <button
            className={`px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors ${
              activeTab === 'glossary'
                ? 'text-primary border-primary'
                : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('glossary')}
          >
            Glossary
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          {activeTab === 'sources' && <ResourceList category="sources" />}
          {activeTab === 'testimony' && <ResourceList category="testimony" />}
          {activeTab === 'glossary' && <Glossary />}
        </div>
      </div>
    </div>
  );
};

export default Resources;
