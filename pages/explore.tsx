import type { NextPage, GetStaticProps } from 'next';
import { useState, useRef, useEffect, useCallback } from 'react';
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

const FlowSkeleton = () => (
  <div className="w-full h-[420px] rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 animate-pulse flex items-center justify-center">
    <span className="text-xs text-gray-300 dark:text-gray-700">Loading diagram...</span>
  </div>
);

const ProgramLineageFlow = dynamic(
  () => import('../components/explore/ProgramLineageFlow'),
  { ssr: false, loading: () => <FlowSkeleton /> }
);

const CongressionalDisclosureFlow = dynamic(
  () => import('../components/explore/CongressionalDisclosureFlow'),
  { ssr: false, loading: () => <FlowSkeleton /> }
);

const EvidenceTierFlow = dynamic(
  () => import('../components/explore/EvidenceTierFlow'),
  { ssr: false, loading: () => <FlowSkeleton /> }
);

const OversightHierarchyFlow = dynamic(
  () => import('../components/explore/OversightHierarchyFlow'),
  { ssr: false, loading: () => <FlowSkeleton /> }
);

const ClaimsCorroborationGraph = dynamic(
  () => import('../components/explore/ClaimsCorroborationGraph'),
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

// ── View types ──────────────────────────────────────────────────

/** Hero section: the two network graphs */
type HeroView = 'network' | 'claims';

/** Secondary section: lazy-mounted tab views */
type TabView = 'timeline' | 'map' | 'program-lineage' | 'evidence-tiers';

const TAB_VIEWS: Array<{ id: TabView; label: string }> = [
  { id: 'timeline',        label: 'Timeline'  },
  { id: 'map',             label: 'Map'       },
  { id: 'program-lineage', label: 'Programs'  },
  { id: 'evidence-tiers',  label: 'Cases'     },
];

// Nav ID: single anchor for the hero section + the four tab views
type NavId = 'networks' | TabView;

// ── Component ───────────────────────────────────────────────────

const Explore: NextPage<Props> = ({ entries, insiderEvents, caseEvents, mapCases, mapEvents }) => {
  // Hero state
  const [heroView, setHeroView]           = useState<HeroView>('network');
  const [claimsEverShown, setClaimsEverShown] = useState(false);

  // Secondary tab state
  const [activeTab, setActiveTab]         = useState<TabView>('timeline');
  const [mountedTabs, setMountedTabs]     = useState<Set<TabView>>(new Set<TabView>(['timeline']));

  // Programs sub-view
  const [programView, setProgramView]     = useState<'lineage' | 'hierarchy' | 'disclosure'>('lineage');

  // Timeline era focus
  const [focusEra, setFocusEra]           = useState<FocusEra | null>(null);

  // Nav chrome
  const [navScrolled, setNavScrolled]     = useState(false);
  const [scrollZone, setScrollZone]       = useState<'hero' | 'tabs'>('hero');

  // Refs
  const heroRef    = useRef<HTMLElement>(null);
  const tabsRef    = useRef<HTMLElement>(null);
  const overlayRef = useRef<HTMLElement>(null);

  // ── Mount claims graph on first visit ────────────────────────
  useEffect(() => {
    if (heroView === 'claims' && !claimsEverShown) setClaimsEverShown(true);
  }, [heroView, claimsEverShown]);

  // ── Restore ?programs query param deep link ───────────────────
  useEffect(() => {
    const programs = new URLSearchParams(window.location.search).get('programs');
    if (programs === 'hierarchy' || programs === 'lineage' || programs === 'disclosure') {
      setProgramView(programs);
      setActiveTab('program-lineage');
      setMountedTabs(prev => new Set<TabView>(Array.from(prev).concat('program-lineage')));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Scroll shadow ─────────────────────────────────────────────
  useEffect(() => {
    const onScroll = () => setNavScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── IntersectionObserver: hero vs tabs zone ───────────────────
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const observe = (el: HTMLElement | null, zone: 'hero' | 'tabs') => {
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setScrollZone(zone); },
        { rootMargin: '-20% 0px -55% 0px', threshold: 0 }
      );
      obs.observe(el);
      observers.push(obs);
    };

    observe(heroRef.current, 'hero');
    observe(tabsRef.current, 'tabs');

    return () => observers.forEach(o => o.disconnect());
  }, []);

  // ── Tab activation helper ─────────────────────────────────────
  const activateTab = useCallback((tab: TabView) => {
    setActiveTab(tab);
    setMountedTabs(prev => new Set<TabView>(Array.from(prev).concat(tab)));
  }, []);

  // ── Nav click handler ─────────────────────────────────────────
  const handleNavClick = useCallback((id: NavId) => {
    if (id === 'networks') {
      heroRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      activateTab(id);
      tabsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activateTab]);

  // Active nav pill: hero zone always highlights "networks"; tabs zone highlights the active tab
  const activeNavId: NavId = scrollZone === 'hero' ? 'networks' : activeTab;

  // ── Scroll to timeline overlay when an era is selected ───────
  // useEffect is more reliable than setTimeout: it fires after the
  // state flush and commit, eliminating the race condition.
  useEffect(() => {
    if (!focusEra) return;
    overlayRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [focusEra]);

  // ── Era selection (Timeline tab) ──────────────────────────────
  function handleSelectEra(start: number, end: number) {
    const label = start === end - 9 ? `${start}s` : `${start}-${end}`;
    setFocusEra({ start, end, label });
  }

  // ── Pill class helper ─────────────────────────────────────────
  const pill = (id: NavId, size: 'sm' | 'md' = 'sm') =>
    `shrink-0 font-medium transition-colors duration-200 ${size === 'sm' ? 'text-xs px-3 py-1.5 rounded-full' : 'text-sm px-4 py-2 rounded-lg'} ${
      activeNavId === id
        ? 'bg-primary text-white'
        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800'
    }`;

  // ── Render ────────────────────────────────────────────────────
  return (
    <>
      <SeoHead
        title="Explore"
        description="Interactive visualizations across the DECUR dataset - relationship networks, claims corroboration, historical timeline, incident map, and program lineage."
        path="/explore"
      />

      {/* Full-width wrapper */}
      <div className="-mx-4 -mt-8">

        {/* Page header */}
        <div className="max-w-5xl mx-auto px-4 pt-8 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Explore</h1>
          <p className="text-gray-500 dark:text-gray-400 max-w-2xl">
            Interactive visualizations across the full DECUR dataset. Identify patterns,
            connections, and trends that span individual case files and historical records.
          </p>
        </div>

        {/* ── Sticky nav ─────────────────────────────────────────── */}
        <nav className={`sticky top-[64px] z-40 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 px-4 py-2 transition-shadow duration-200 ${navScrolled ? 'shadow-md' : ''}`}>
          <div className="max-w-5xl mx-auto flex items-center gap-1 overflow-x-auto">

            {/* Hero anchor */}
            <button onClick={() => handleNavClick('networks')} className={pill('networks')}>
              Networks
            </button>

            {/* Divider */}
            <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1 shrink-0" aria-hidden />

            {/* Tab group: secondary views */}
            {TAB_VIEWS.map(t => (
              <button key={t.id} onClick={() => handleNavClick(t.id)} className={pill(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        </nav>

        {/* ── Content ────────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4 space-y-8 py-8 pb-16">

          {/* ── Hero: Network Graphs (Featured) ─────────────────── */}
          <section ref={heroRef} id="hero-networks" className="scroll-mt-[108px]">
            <div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4 sm:p-6">

              {/* Hero toggle + badge */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {(['network', 'claims'] as const).map(v => (
                  <button
                    key={v}
                    onClick={() => setHeroView(v)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                      heroView === v
                        ? 'bg-primary text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                    }`}
                  >
                    {v === 'network' ? 'Relationship Network' : 'Claims Corroboration'}
                  </button>
                ))}
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 dark:bg-primary/20 text-primary font-semibold uppercase tracking-wide">
                  Featured
                </span>
              </div>

              {/* Description (changes with heroView) */}
              {heroView === 'network' ? (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Relationship Network</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mb-4">
                    Force-directed graph spanning all key figures, programs, cases, and events across the DECUR dataset.
                    Click any node to select it and explore its connections. Click again to navigate to its dedicated page.
                  </p>
                </>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Claims Corroboration</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl mb-4">
                    Bipartite network mapping witnesses to the types of claims they independently make.
                    Category node size reflects the number of independent witnesses - larger nodes indicate
                    higher corroboration across the testimony record. Click any node to explore connections.
                    Click a witness node twice to navigate to their profile.
                  </p>
                </>
              )}

              {/* Graphs: NetworkGraph always mounted; ClaimsCorroborationGraph mounts on first visit */}
              <div className={heroView === 'network' ? '' : 'hidden'}>
                <NetworkGraph />
              </div>
              {claimsEverShown && (
                <div className={heroView === 'claims' ? '' : 'hidden'}>
                  <ClaimsCorroborationGraph />
                </div>
              )}
            </div>
          </section>

          {/* ── Secondary: Tabbed views ──────────────────────────── */}
          <section ref={tabsRef} id="secondary-tabs" className="scroll-mt-[108px]">
            <div className="bg-gray-50 dark:bg-gray-900/60 rounded-xl border border-gray-200 dark:border-gray-700/50 p-4 sm:p-6">

              {/* ── Timeline tab ─────────────────────────────────── */}
              {mountedTabs.has('timeline') && (
                <div className={activeTab === 'timeline' ? '' : 'hidden'}>
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
                </div>
              )}

              {/* ── Map tab ──────────────────────────────────────── */}
              {mountedTabs.has('map') && (
                <div className={activeTab === 'map' ? '' : 'hidden'}>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Incident Map</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                      Geographic distribution of documented UAP cases and geocoded historical events.
                      Click any marker for location details and evidence summary.
                    </p>
                  </div>
                  <CaseMap cases={mapCases} events={mapEvents} />
                </div>
              )}

              {/* ── Programs tab ─────────────────────────────────── */}
              {mountedTabs.has('program-lineage') && (
                <div className={activeTab === 'program-lineage' ? '' : 'hidden'}>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Programs</h2>

                    {/* Programs sub-view toggle */}
                    <div className="flex gap-1 mb-3 flex-wrap">
                      {(['lineage', 'hierarchy', 'disclosure'] as const).map(v => (
                        <button
                          key={v}
                          onClick={() => setProgramView(v)}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium transition-colors ${
                            programView === v
                              ? 'bg-primary text-white'
                              : 'bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                          }`}
                        >
                          {v === 'lineage' ? 'Program Lineage' : v === 'hierarchy' ? 'Oversight Structure' : 'Congressional Disclosure'}
                        </button>
                      ))}
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
                </div>
              )}

              {/* ── Cases tab ────────────────────────────────────── */}
              {mountedTabs.has('evidence-tiers') && (
                <div className={activeTab === 'evidence-tiers' ? '' : 'hidden'}>
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">Cases by Evidence Tier</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 max-w-2xl">
                      All documented cases organized by evidence quality. Tier 1 cases carry the strongest
                      multi-source evidentiary record. Cases are sorted chronologically within each tier.
                      Click any case to view its summary, then navigate to the full case file.
                    </p>
                  </div>
                  <EvidenceTierFlow />
                </div>
              )}

            </div>
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
