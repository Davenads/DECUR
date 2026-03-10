import type { NextPage, GetStaticProps } from 'next';
import EventFrequencyChart from '../components/explore/EventFrequencyChart';
import NetworkGraph from '../components/explore/NetworkGraph';
import TimelineOverlay, { extractYear, WBEvent } from '../components/explore/TimelineOverlay';
import { getAllEntries, TimelineEntry } from '../lib/useTimelineData';
import burischJson from '../data/insiders/burisch.json';
import lazarJson from '../data/insiders/lazar.json';
import gruschJson from '../data/insiders/grusch.json';
import elizondoJson from '../data/insiders/elizondo.json';
import fravorJson from '../data/insiders/fravor.json';
import nellJson from '../data/insiders/nell.json';
import nolanJson from '../data/insiders/nolan.json';
import puthoffJson from '../data/insiders/puthoff.json';
import mellonJson from '../data/insiders/mellon.json';
import davisJson from '../data/insiders/davis.json';
import bigelowJson from '../data/insiders/bigelow.json';
import valleeJson from '../data/insiders/vallee.json';
import popeJson from '../data/insiders/pope.json';

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

    // Puthoff key events
    const puthoffEvents: WBEvent[] = puthoffJson.profile.key_events.reduce(
      (acc: WBEvent[], e: { date: string; event: string }) => {
        const year = extractYear(e.date);
        if (year) acc.push({ year, event: e.event, source: 'puthoff' });
        return acc;
      },
      []
    );

    // Nolan key events (uses 'date' field)
    const nolanEvents: WBEvent[] = nolanJson.profile.key_events.reduce(
      (acc: WBEvent[], e: { date: string; event: string }) => {
        const year = extractYear(e.date);
        if (year) acc.push({ year, event: e.event, source: 'nolan' });
        return acc;
      },
      []
    );

    // Mellon key events (uses 'date' field)
    const mellonEvents: WBEvent[] = mellonJson.profile.key_events.reduce(
      (acc: WBEvent[], e: { date: string; event: string }) => {
        const year = extractYear(e.date);
        if (year) acc.push({ year, event: e.event, source: 'mellon' });
        return acc;
      },
      []
    );

    // Davis key events (uses 'date' field)
    const davisEvents: WBEvent[] = davisJson.profile.key_events.reduce(
      (acc: WBEvent[], e: { date: string; event: string }) => {
        const year = extractYear(e.date);
        if (year) acc.push({ year, event: e.event, source: 'davis' });
        return acc;
      },
      []
    );

    // Bigelow key events (uses 'date' field)
    const bigelowEvents: WBEvent[] = bigelowJson.profile.key_events.reduce(
      (acc: WBEvent[], e: { date: string; event: string }) => {
        const year = extractYear(e.date);
        if (year) acc.push({ year, event: e.event, source: 'bigelow' });
        return acc;
      },
      []
    );

    // Vallée key events (uses 'date' field)
    const valleeEvents: WBEvent[] = valleeJson.profile.key_events.reduce(
      (acc: WBEvent[], e: { date: string; event: string }) => {
        const year = extractYear(e.date);
        if (year) acc.push({ year, event: e.event, source: 'vallee' });
        return acc;
      },
      []
    );

    // Pope key events (uses 'date' field)
    const popeEvents: WBEvent[] = popeJson.profile.key_events.reduce(
      (acc: WBEvent[], e: { date: string; event: string }) => {
        const year = extractYear(e.date);
        if (year) acc.push({ year, event: e.event, source: 'pope' });
        return acc;
      },
      []
    );

    const insiderEvents: WBEvent[] = [...burischEvents, ...lazarEvents, ...gruschEvents, ...elizondoEvents, ...fravorEvents, ...nellEvents, ...nolanEvents, ...puthoffEvents, ...mellonEvents, ...davisEvents, ...bigelowEvents, ...valleeEvents, ...popeEvents];

    return { props: { entries, insiderEvents }, revalidate: 3600 };
  } catch (error) {
    console.error('[getStaticProps] explore.tsx:', error);
    return { notFound: true };
  }
};

export default Explore;
