import type { NextPage, GetStaticProps } from 'next';
import { useState, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
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

const ProgramLineageFlow = dynamic(
  () => import('../components/explore/ProgramLineageFlow'),
  { ssr: false }
);

const CongressionalDisclosureFlow = dynamic(
  () => import('../components/explore/CongressionalDisclosureFlow'),
  { ssr: false }
);

const EvidenceTierFlow = dynamic(
  () => import('../components/explore/EvidenceTierFlow'),
  { ssr: false }
);

const OversightHierarchyFlow = dynamic(
  () => import('../components/explore/OversightHierarchyFlow'),
  { ssr: false }
);

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

const SECTION_NAV = [
  { id: 'relationship-network', label: 'Network'  },
  { id: 'timeline',             label: 'Timeline' },
  { id: 'map',                  label: 'Map'      },
  { id: 'program-lineage',      label: 'Programs' },
  { id: 'evidence-tiers',       label: 'Cases'    },
] as const;

type SectionId = typeof SECTION_NAV[number]['id'];

const Explore: NextPage<Props> = ({ entries, insiderEvents, caseEvents, mapCases, mapEvents }) => {
  const [focusEra, setFocusEra] = useState<FocusEra | null>(null);
  const [activeSection, setActiveSection] = useState<SectionId>('relationship-network');
  const [programView, setProgramView] = useState<'lineage' | 'hierarchy' | 'disclosure'>('lineage');
  const overlayRef = useRef<HTMLElement>(null);

  function handleSelectEra(start: number, end: number) {
    const label = start === end - 9 ? `${start}s` : `${start}-${end}`;
    setFocusEra({ start, end, label });
    setTimeout(() => {
      overlayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  // Track which section is in the viewport to highlight the active nav pill
  useEffect(() => {
    const ids = SECTION_NAV.map(s => s.id);
    const observers: IntersectionObserver[] = [];
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id as SectionId); },
        { rootMargin: '-30% 0px -50% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  return (
    <>
      <SeoHead
        title="Explore"
        description="Interactive timeline and relationship network visualizing eight decades of UAP events, key figure disclosures, and government program histories."
        path="/explore"
      />

      {/* Full-width wrapper so the sticky nav can bleed past the Layout's px-4 */}
      <div className="-mx-4 -mt-8">

        {/* Page header - constrained width, matches Layout padding */}
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Explore</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            Interactive visualizations across the full DECUR dataset. Identify patterns,
            connections, and trends that span individual case files and historical records.
          </p>
        </div>

        {/* Sticky section nav */}
        <nav className="sticky top-0 z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 px-4 py-2">
          <div className="max-w-5xl mx-auto flex gap-2 overflow-x-auto">
            {SECTION_NAV.map(s => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                  activeSection === s.id
                    ? 'bg-primary text-white'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                {s.label}
              </a>
            ))}
          </div>
        </nav>

        {/* Sections */}
        <div className="max-w-5xl mx-auto px-4 space-y-12 py-8 pb-16">

          {/* ── Relationship Network (Featured) ──────────────────────────── */}
          <section id="relationship-network">
            <div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4 sm:p-6">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Relationship Network
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary font-semibold uppercase tracking-wide">
                  Featured
                </span>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mb-4">
                Force-directed graph spanning all key figures, programs, cases, and events across the DECUR dataset.
                Click any node to select it and explore its connections. Click again to navigate to its dedicated page.
              </p>
              <NetworkGraph />
            </div>
          </section>

          {/* ── Timeline & History ───────────────────────────────────────── */}
          <section id="timeline">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Timeline & History</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                Historical event frequency and multi-source timeline spanning eight decades of documented UAP activity.
                Click a bar to filter the timeline to that decade.
              </p>
            </div>
            <EventFrequencyChart
              entries={entries}
              onSelectEra={handleSelectEra}
              onClearEra={() => setFocusEra(null)}
              activeEraStart={focusEra?.start ?? null}
            />
            <section ref={overlayRef} className="mt-6">
              <TimelineOverlay
                uapEntries={entries}
                insiderEvents={insiderEvents}
                caseEvents={caseEvents}
                focusEra={focusEra}
                onClearFocus={() => setFocusEra(null)}
              />
            </section>
          </section>

          {/* ── Incident Map ─────────────────────────────────────────────── */}
          <section id="map">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Incident Map</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                Geographic distribution of documented UAP cases and geocoded historical events.
                Click any marker for location details and evidence summary.
              </p>
            </div>
            <CaseMap cases={mapCases} events={mapEvents} />
          </section>

          {/* ── Programs ─────────────────────────────────────────────────── */}
          <section id="program-lineage">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Programs</h2>

              {/* Sub-view toggle */}
              <div className="flex gap-1 mb-3 flex-wrap">
                <button
                  onClick={() => setProgramView('lineage')}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    programView === 'lineage'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  Program Lineage
                </button>
                <button
                  onClick={() => setProgramView('hierarchy')}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    programView === 'hierarchy'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  Oversight Structure
                </button>
                <button
                  onClick={() => setProgramView('disclosure')}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                    programView === 'disclosure'
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                  }`}
                >
                  Congressional Disclosure
                </button>
              </div>

              {programView === 'lineage' ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                  Directed flow of government and private UAP programs showing succession and
                  relationship links over time. Left to right reflects chronological progression.
                  Click any node to view that program&apos;s full profile.
                </p>
              ) : programView === 'hierarchy' ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                  Top-down institutional authority chart mapping government agencies, programs,
                  private contractors, and congressional oversight. Solid lines indicate authority,
                  dashed lines indicate oversight or contractual relationships.
                  Click any node for detail.
                </p>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                  Chronological map of the modern UAP disclosure arc - congressional hearings,
                  key witnesses, and the legislation they drove from 2020 to 2025.
                  Click any witness node to view their full profile.
                </p>
              )}
            </div>

            {programView === 'lineage' ? (
              <ProgramLineageFlow />
            ) : programView === 'hierarchy' ? (
              <OversightHierarchyFlow />
            ) : (
              <CongressionalDisclosureFlow />
            )}
          </section>

          {/* ── Evidence Tiers ────────────────────────────────────────────── */}
          <section id="evidence-tiers">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Cases by Evidence Tier</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                All documented cases organized by evidence quality. Tier 1 cases carry the strongest
                multi-source evidentiary record. Cases are sorted chronologically within each tier.
                Click any case to view its summary, then navigate to the full case file.
              </p>
            </div>
            <EvidenceTierFlow />
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
