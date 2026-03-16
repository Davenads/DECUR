import type { NextPage, GetStaticProps } from 'next';
import { useState, useRef } from 'react';
import SeoHead from '../components/SeoHead';
import EventFrequencyChart from '../components/explore/EventFrequencyChart';
import NetworkGraph from '../components/explore/NetworkGraph';
import TimelineOverlay, { extractYear, WBEvent, CaseEvent } from '../components/explore/TimelineOverlay';
import CaseMap, { MapCase, MapEvent } from '../components/explore/CaseMap';
import { getAllEntries, TimelineEntry } from '../lib/timelineData';
import insiderIndex from '../data/key-figures/index.json';
import { insiderRegistry } from '../data/key-figures/registry';
import casesData from '../data/cases.json';
import timelineData from '../data/timeline.json';

interface Props {
  entries: TimelineEntry[];
  insiderEvents: WBEvent[];
  caseEvents: CaseEvent[];
  mapCases: MapCase[];
  mapEvents: MapEvent[];
}

interface FocusEra {
  start: number;
  end: number;
  label: string;
}

const Explore: NextPage<Props> = ({ entries, insiderEvents, caseEvents, mapCases, mapEvents }) => {
  const [focusEra, setFocusEra] = useState<FocusEra | null>(null);
  const overlayRef = useRef<HTMLElement>(null);

  function handleSelectEra(start: number, end: number) {
    const label = start === end - 9
      ? `${start}s`
      : `${start}-${end}`;
    setFocusEra({ start, end, label });
    // Scroll to overlay
    setTimeout(() => {
      overlayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  return (
    <>
      <SeoHead
        title="Explore"
        description="Interactive timeline and relationship network visualizing eight decades of UAP events, key figure disclosures, and government program histories."
        path="/explore"
      />
      <div className="container mx-auto px-4">
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Page header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Explore</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            Interactive visualizations across the full DECUR dataset. Identify patterns,
            connections, and trends that span individual case files and historical records.
          </p>
        </div>

        {/* Relationship Network Graph */}
        <section id="relationship-network">
          <NetworkGraph />
        </section>

        {/* Event Frequency Chart */}
        <section>
          <EventFrequencyChart
            entries={entries}
            onSelectEra={handleSelectEra}
            onClearEra={() => setFocusEra(null)}
            activeEraStart={focusEra?.start ?? null}
          />
        </section>

        {/* Timeline Overlay */}
        <section ref={overlayRef}>
          <TimelineOverlay
            uapEntries={entries}
            insiderEvents={insiderEvents}
            caseEvents={caseEvents}
            focusEra={focusEra}
            onClearFocus={() => setFocusEra(null)}
          />
        </section>

        {/* Incident Map */}
        <section>
          <CaseMap cases={mapCases} events={mapEvents} />
        </section>

      </div>
    </div>
    </>
  );
};

/**
 * Extract WBEvent[] from a profile data object.
 * Handles two schemas:
 * - Burisch: data.timeline[] with { date, event, category }
 * - All others: data.profile.key_events[] with { year | date, event }
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractProfileEvents(id: string, data: any): WBEvent[] {
  if (!data) return [];

  // Burisch uses a dedicated .timeline array
  if (id === 'dan-burisch' && Array.isArray(data.timeline)) {
    return data.timeline.reduce((acc: WBEvent[], e: { date: string; event: string; category?: string }) => {
      const year = extractYear(e.date);
      if (year) acc.push({ year, event: e.event, ...(e.category ? { category: e.category } : {}), source: id });
      return acc;
    }, []);
  }

  // All other profiles use profile.key_events
  const keyEvents = data?.profile?.key_events;
  if (!Array.isArray(keyEvents)) return [];

  return keyEvents.reduce((acc: WBEvent[], e: { year?: string; date?: string; event: string }) => {
    const year = extractYear(e.year ?? e.date ?? '');
    if (year) acc.push({ year, event: e.event, source: id });
    return acc;
  }, []);
}

export const getStaticProps: GetStaticProps = async () => {
  try {
    const entries = getAllEntries();

    // Build insider events from all profiles flagged for explore inclusion.
    // To add a new profile: set includeInExplore: true in data/key-figures/index.json
    // and ensure the profile is registered in data/key-figures/registry.ts.
    const insiderEvents: WBEvent[] = (insiderIndex as Array<{ id: string; includeInExplore?: boolean }>)
      .filter(entry => entry.includeInExplore)
      .flatMap(entry => {
        const data = insiderRegistry[entry.id];
        return extractProfileEvents(entry.id, data);
      });

    // Build case events for the Timeline Overlay cases swimlane
    const caseEvents: CaseEvent[] = (casesData as Array<{
      id: string;
      name: string;
      date: string;
      location: string;
      evidence_tier: 'tier-1' | 'tier-2';
      classification_status: string;
    }>).reduce((acc, c) => {
      const year = extractYear(c.date);
      if (year) {
        acc.push({
          year,
          name: c.name,
          id: c.id,
          evidence_tier: c.evidence_tier,
          location: c.location,
          classification_status: c.classification_status,
        });
      }
      return acc;
    }, [] as CaseEvent[]);

    // Build map cases - only include cases with coordinates
    const mapCases: MapCase[] = (casesData as Array<{
      id: string;
      name: string;
      date: string;
      location: string;
      country: string;
      evidence_tier: 'tier-1' | 'tier-2';
      classification_status: string;
      summary: string;
      coordinates?: { lat: number; lng: number };
    }>).filter(c => c.coordinates).map(c => ({
      id: c.id,
      name: c.name,
      date: c.date,
      location: c.location,
      country: c.country,
      evidence_tier: c.evidence_tier,
      classification_status: c.classification_status,
      summary: c.summary,
      coordinates: c.coordinates!,
    }));

    // Build geocoded timeline events for the map
    const mapEvents: MapEvent[] = (timelineData as Array<{
      id: number;
      title: string;
      year?: number;
      date?: string;
      excerpt?: string;
      lat?: number;
      lng?: number;
      article_url?: string | null;
      source_url?: string;
    }>)
      .filter(e => e.lat && e.lng)
      .map(e => ({
        id: e.id,
        title: e.title,
        year: e.year ?? 0,
        date: e.date ?? '',
        excerpt: e.excerpt ?? '',
        lat: e.lat!,
        lng: e.lng!,
        article_url: e.article_url ?? null,
        source_url: e.source_url ?? '',
      }));

    return { props: { entries, insiderEvents, caseEvents, mapCases, mapEvents }, revalidate: 3600 };
  } catch (error) {
    console.error('[getStaticProps] explore.tsx:', error);
    return { notFound: true };
  }
};

export default Explore;
