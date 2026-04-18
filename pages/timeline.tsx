import SeoHead from '../components/SeoHead';
import TimelineView from '../components/timeline/TimelineView';

export default function Timeline() {
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
            1,866 documented events from 1561 to present.
            Data sourced from <a href="https://ufotimeline.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">UFO Timeline</a>.
          </p>
        </div>
        <TimelineView />
      </div>
    </>
  );
}
