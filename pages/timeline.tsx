import SeoHead from '../components/SeoHead';
import { GetStaticProps } from 'next';
import TimelineView, { TimelineEntry } from '../components/timeline/TimelineView';

interface TimelinePageProps {
  entries: TimelineEntry[];
}

export default function Timeline({ entries }: TimelinePageProps) {
  return (
    <>
      <SeoHead
        title="Historical Timeline"
        description="Chronological timeline of UAP/NHI events, sightings, government disclosures, and key historical incidents from 1561 to present."
        path="/timeline"
      />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-gray-100 mb-2">Historical Timeline</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            {entries.length} documented events from {Math.min(...entries.map(e => e.year))} to {Math.max(...entries.map(e => e.year))}.
            Data sourced from <a href="https://ufotimeline.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">UFO Timeline</a>.
          </p>
        </div>
        <TimelineView entries={entries} />
      </div>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const entries: TimelineEntry[] = require('../data/timeline.json');
    return {
      props: { entries },
      revalidate: 3600,
    };
  } catch (error) {
    console.error('[getStaticProps] timeline.tsx:', error);
    return { notFound: true };
  }
};
