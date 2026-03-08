import type { NextPage, GetStaticProps } from 'next';
import EventFrequencyChart from '../components/explore/EventFrequencyChart';
import { getAllEntries, TimelineEntry } from '../lib/useTimelineData';

interface Props {
  entries: TimelineEntry[];
}

const Explore: NextPage<Props> = ({ entries }) => {
  return (
    <div className="container mx-auto px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Explore</h1>
          <p className="text-gray-500 max-w-2xl">
            Interactive visualizations across the full DECUR dataset. Identify patterns,
            connections, and trends that span individual case files and historical records.
          </p>
        </div>

        {/* Event Frequency Chart */}
        <section>
          <EventFrequencyChart entries={entries} />
        </section>

        {/* Placeholder panels for upcoming visualizations */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[180px] space-y-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-lg">
              ⬡
            </div>
            <p className="text-sm font-medium text-gray-500">Relationship Network</p>
            <p className="text-xs text-gray-400">
              Connections between whistleblowers, facilities, entities, and programs
            </p>
            <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Coming soon</span>
          </div>

          <div className="bg-gray-50 border border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[180px] space-y-2">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 text-lg">
              ◎
            </div>
            <p className="text-sm font-medium text-gray-500">Timeline Overlay</p>
            <p className="text-xs text-gray-400">
              Whistleblower key events layered over the global UAP event timeline
            </p>
            <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">Coming soon</span>
          </div>
        </section>

      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  const entries = getAllEntries();
  return { props: { entries } };
};

export default Explore;
