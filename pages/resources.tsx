import { useState } from 'react';
import ResourceList from '../components/resources/ResourceList';
import Glossary from '../components/resources/Glossary';
import type { NextPage } from 'next';

type TabType = 'materials' | 'transcripts' | 'glossary';

const Resources: NextPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>('materials');

  return (
    <div className="container mx-auto px-4">
      <h1 className="text-3xl font-bold mb-8">Resources</h1>
      
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200 mb-8">
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'materials' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('materials')}
        >
          Primary Materials
        </button>
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'transcripts' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('transcripts')}
        >
          Transcripts
        </button>
        <button
          className={`px-6 py-3 font-medium ${activeTab === 'glossary' ? 'text-primary border-b-2 border-primary' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setActiveTab('glossary')}
        >
          Glossary
        </button>
      </div>
      
      {/* Tab Content */}
      <div className="bg-white rounded-lg shadow-md p-6">
        {activeTab === 'materials' && (
          <ResourceList category="materials" />
        )}
        
        {activeTab === 'transcripts' && (
          <ResourceList category="transcripts" />
        )}
        
        {activeTab === 'glossary' && (
          <Glossary />
        )}
      </div>
    </div>
  );
};

export default Resources;