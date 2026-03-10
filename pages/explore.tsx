import type { NextPage, GetStaticProps } from 'next';
import EventFrequencyChart from '../components/explore/EventFrequencyChart';
import NetworkGraph from '../components/explore/NetworkGraph';
import TimelineOverlay, { extractYear, WBEvent } from '../components/explore/TimelineOverlay';
import { getAllEntries, TimelineEntry } from '../lib/useTimelineData';
import burischJson from '../data/burisch.json';
import lazarJson from '../data/lazar.json';
import gruschJson from '../data/grusch.json';
import elizondoJson from '../data/elizondo.json';
import fravorJson from '../data/fravor.json';
import nellJson from '../data/nell.json';

interface Props {
  entries: TimelineEntry[];
  insiderEvents: WBEvent[];
}

const Explore: NextPage<Props> = ({ entries, insiderEvents }) => {
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

        {/* Timeline Overlay */}
        <section>
          <TimelineOverlay uapEntries={entries} insiderEvents={insiderEvents} />
        </section>

        {/* Relationship Network Graph */}
        <section>
          <NetworkGraph />
        </section>

      </div>
    </div>
  );
};

export const getStaticProps: GetStaticProps = async () => {
  try {
    const entries = getAllEntries();

    // Burisch timeline events
    const burischEvents: WBEvent[] = burischJson.timeline.reduce(
      (acc: WBEvent[], e: { date: string; event: string; category: string }) => {
        const year = extractYear(e.date);
        if (year) acc.push({ year, event: e.event, category: e.category, source: 'burisch' });
        return acc;
      },
      []
    );

    // Lazar key events
    const lazarEvents: WBEvent[] = lazarJson.profile.key_events.reduce(
      (acc: WBEvent[], e: { date: string; event: string }) => {
        const year = extractYear(e.date);
        if (year) acc.push({ year, event: e.event, source: 'lazar' });
        return acc;
      },
      []
    );

    // Grusch key events
    const gruschEvents: WBEvent[] = gruschJson.profile.key_events.reduce(
      (acc: WBEvent[], e: { date: string; event: string }) => {
        const year = extractYear(e.date);
        if (year) acc.push({ year, event: e.event, source: 'grusch' });
        return acc;
      },
      []
    );

    // Elizondo key events (uses 'year' field, not 'date')
    const elizondoEvents: WBEvent[] = elizondoJson.profile.key_events.reduce(
      (acc: WBEvent[], e: { year: string; event: string }) => {
        const year = extractYear(e.year);
        if (year) acc.push({ year, event: e.event, source: 'elizondo' });
        return acc;
      },
      []
    );

    // Fravor key events (uses 'date' field)
    const fravorEvents: WBEvent[] = fravorJson.profile.key_events.reduce(
      (acc: WBEvent[], e: { date: string; event: string }) => {
        const year = extractYear(e.date);
        if (year) acc.push({ year, event: e.event, source: 'fravor' });
        return acc;
      },
      []
    );

    // Nell key events (uses 'date' field)
    const nellEvents: WBEvent[] = nellJson.profile.key_events.reduce(
      (acc: WBEvent[], e: { date: string; event: string }) => {
        const year = extractYear(e.date);
        if (year) acc.push({ year, event: e.event, source: 'nell' });
        return acc;
      },
      []
    );

    const insiderEvents: WBEvent[] = [...burischEvents, ...lazarEvents, ...gruschEvents, ...elizondoEvents, ...fravorEvents, ...nellEvents];

    return { props: { entries, insiderEvents } };
  } catch (error) {
    console.error('[getStaticProps] explore.tsx:', error);
    return { notFound: true };
  }
};

export default Explore;
