import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import EntityProfiles from '../components/data/EntityProfiles';
import TimelineConcepts from '../components/data/TimelineConcepts';
import LotusFindings from '../components/data/LotusFindings';
import DataNavigation from '../components/data/DataNavigation';
import { CategoryType } from '../types/data';
import { CustomNextPage, DataPageProps } from '../types/pages';

const Data: CustomNextPage<DataPageProps> = ({ initialCategory = 'entities' }) => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<CategoryType>(initialCategory as CategoryType);
  
  // Update category from URL query parameters
  useEffect(() => {
    if (router.query.category && typeof router.query.category === 'string') {
      const category = router.query.category;
      if (['entities', 'timelines', 'lotus', 'whistleblowers'].includes(category)) {
        setActiveCategory(category as CategoryType);
      }
    }
  }, [router.query]);

  // Render the appropriate content based on the active category
  const renderContent = () => {
    switch (activeCategory) {
      case 'entities':
        return <EntityProfiles />;
      case 'timelines':
        return <TimelineConcepts />;
      case 'lotus':
        return <LotusFindings />;
      case 'whistleblowers':
        return <EntityProfiles />;
      default:
        return <EntityProfiles />;
    }
  };

  return (
    <>
      <Head>
        <title>DECUR - Research Data</title>
        <meta name="description" content="Explore data on Non-Human Intelligence, Advanced Technologies, and Special Access Programs." />
      </Head>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Research Data</h1>
      
      <div className="flex flex-col md:flex-row">
        {/* Left sidebar navigation */}
        <div className="w-full md:w-1/4 md:pr-8 mb-6 md:mb-0">
          <DataNavigation 
            activeCategory={activeCategory} 
            setActiveCategory={(category) => setActiveCategory(category)} 
          />
        </div>
        
        {/* Main content area */}
        <div className="w-full md:w-3/4">
          <div className="bg-white rounded-lg shadow-md p-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Data;