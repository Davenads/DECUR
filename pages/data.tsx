import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import EventsList from '../components/data/EventsList';
import KeyFigures from '../components/data/KeyFigures';
import QuotesBrowser from '../components/data/QuotesBrowser';
import MediaBrowser from '../components/data/MediaBrowser';
import NewsBrowser from '../components/data/NewsBrowser';
import DataNavigation from '../components/data/DataNavigation';
import { CategoryType } from '../types/data';

const VALID_CATEGORIES: CategoryType[] = ['events', 'figures', 'quotes', 'media', 'news'];

export default function Data() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<CategoryType>('events');

  useEffect(() => {
    const q = router.query.category;
    if (typeof q === 'string' && VALID_CATEGORIES.includes(q as CategoryType)) {
      setActiveCategory(q as CategoryType);
    }
  }, [router.query]);

  const renderContent = () => {
    switch (activeCategory) {
      case 'events':  return <EventsList />;
      case 'figures': return <KeyFigures />;
      case 'quotes':  return <QuotesBrowser />;
      case 'media':   return <MediaBrowser />;
      case 'news':    return <NewsBrowser />;
      default:        return <EventsList />;
    }
  };

  return (
    <>
      <Head>
        <title>DECUR - Research Data</title>
        <meta name="description" content="Explore UAP/NHI research data including historical events, key figures, quotes, media, and news." />
      </Head>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold font-heading mb-8">Research Data</h1>
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-1/4">
            <DataNavigation
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          </div>
          <div className="w-full md:w-3/4">
            <div className="bg-white rounded-lg shadow-md p-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
