import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import EventsList from '../components/data/EventsList';
import KeyFigures from '../components/data/KeyFigures';
import QuotesBrowser from '../components/data/QuotesBrowser';
import MediaBrowser from '../components/data/MediaBrowser';
import NewsBrowser from '../components/data/NewsBrowser';
import WhistleblowersList from '../components/data/WhistleblowersList';
import DataNavigation, { NavItemDef } from '../components/data/DataNavigation';
import { CategoryType, WhistleblowerEntry } from '../types/data';
import { getEntriesByCategory, TimelineEntry } from '../lib/useTimelineData';
import whistleblowersData from '../data/whistleblowers.json';

const VALID_CATEGORIES: CategoryType[] = ['events', 'figures', 'quotes', 'media', 'news', 'whistleblowers'];

interface DataPageProps {
  categoryData: {
    events: TimelineEntry[];
    figures: TimelineEntry[];
    quotes: TimelineEntry[];
    media: TimelineEntry[];
    news: TimelineEntry[];
  };
  whistleblowers: WhistleblowerEntry[];
  navItems: NavItemDef[];
}

export default function Data({ categoryData, whistleblowers, navItems }: DataPageProps) {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<CategoryType>('events');

  useEffect(() => {
    if (!router.isReady) return;
    const q = router.query.category;
    if (typeof q === 'string' && VALID_CATEGORIES.includes(q as CategoryType)) {
      setActiveCategory(q as CategoryType);
    }
  }, [router.isReady, router.query.category]);

  const renderContent = () => {
    switch (activeCategory) {
      case 'events':  return <EventsList entries={categoryData.events} />;
      case 'figures': return <KeyFigures entries={categoryData.figures} />;
      case 'quotes':  return <QuotesBrowser entries={categoryData.quotes} />;
      case 'media':   return <MediaBrowser entries={categoryData.media} />;
      case 'news':           return <NewsBrowser entries={categoryData.news} />;
      case 'whistleblowers': return <WhistleblowersList entries={whistleblowers} />;
      default:               return <EventsList entries={categoryData.events} />;
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
              navItems={navItems}
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

export const getStaticProps: GetStaticProps = async () => {
  const events  = getEntriesByCategory(['famous-cases', 'sightings']);
  const figures = getEntriesByCategory(['spotlight']);
  const quotes  = getEntriesByCategory(['quotes']);
  const media   = getEntriesByCategory(['documentaries', 'books-documents']);
  const news    = getEntriesByCategory(['news']);

  const navItems: NavItemDef[] = [
    { category: 'events',  label: 'Historical Events',  description: 'Famous cases & sightings',       count: events.length  },
    { category: 'figures', label: 'Key Figures',         description: 'Researchers, officials & witnesses', count: figures.length },
    { category: 'quotes',  label: 'Quotes',              description: 'Notable statements',             count: quotes.length  },
    { category: 'media',   label: 'Media & Documents',   description: 'Films, books & official docs',   count: media.length   },
    { category: 'news',           label: 'News',            description: 'Reports & developments',         count: news.length    },
    { category: 'whistleblowers', label: 'Whistleblowers',  description: 'Firsthand accounts & case files', count: whistleblowersData.length },
  ];

  return {
    props: {
      categoryData: { events, figures, quotes, media, news },
      whistleblowers: whistleblowersData as WhistleblowerEntry[],
      navItems,
    },
  };
};
