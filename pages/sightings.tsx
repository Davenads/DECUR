import type { NextPage } from 'next';
import { useEffect, useState } from 'react';
import SeoHead from '../components/SeoHead';
import SightingsMap from '../components/sightings/SightingsMap';
import staticStats from '../data/ufosint/stats.json';

/* ── Types ──────────────────────────────────────────────────────── */

interface UfosintStats {
  total_sightings: number;
  mapped_sightings: number;
  high_quality: number;
  by_source: Array<{ name: string; count: number; collection: string }>;
  date_range: { min: string; max: string };
}

/* ── Source chip config ─────────────────────────────────────────── */

const SOURCE_CHIPS = [
  {
    name: 'NUFORC',
    tooltip: 'National UFO Reporting Center - largest English-language UAP database (1905-present)',
  },
  {
    name: 'MUFON',
    tooltip: 'Mutual UFO Network - structured field investigator reports with standardized forms',
  },
  {
    name: 'UFOCAT',
    tooltip: "CUFOS/Hynek's catalog - academic cross-referenced database including historical cases",
  },
  {
    name: 'Vallee UPDB',
    tooltip: "Jacques Vallee's Unified Phenomena Database - curated high-signal subset from 60 years of research",
  },
  {
    name: 'UFO-search',
    tooltip: 'Majestic Documents / Geldreich archive - alternative source with documentary cross-references',
  },
];

/* ── Stats Bar ──────────────────────────────────────────────────── */

interface StatsBarProps {
  stats: UfosintStats;
  isLive: boolean;
}

const StatsBar: React.FC<StatsBarProps> = ({ stats, isLive }) => {
  const minYear = stats.date_range.min?.match(/(\d{4})/)?.[1] ?? '1900';
  const maxYear = stats.date_range.max?.match(/(\d{4})/)?.[1] ?? '2026';

  const items = [
    { value: stats.total_sightings.toLocaleString(), label: 'total reports' },
    { value: stats.mapped_sightings.toLocaleString(), label: 'geocoded' },
    { value: '5', label: 'source databases' },
    { value: `${minYear}-${maxYear}`, label: 'date range' },
    { value: stats.high_quality.toLocaleString(), label: 'high-confidence (≥60)' },
  ];

  return (
    <div className="bg-gray-50 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 rounded-xl px-6 py-4">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500">
          Database Overview
        </span>
        {!isLive && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800">
            cached
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {items.map((item) => (
          <div key={item.label} className="text-center">
            <p className="text-xl font-bold font-mono text-gray-900 dark:text-gray-100 tabular-nums">
              {item.value}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ── Source Chips ───────────────────────────────────────────────── */

const SourceChips: React.FC = () => (
  <div className="flex flex-wrap gap-2">
    {SOURCE_CHIPS.map((src) => (
      <span
        key={src.name}
        title={src.tooltip}
        className="inline-flex items-center text-xs px-2.5 py-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 cursor-default hover:border-primary hover:text-primary dark:hover:text-primary transition-colors"
      >
        {src.name}
      </span>
    ))}
  </div>
);

/* ── Page ───────────────────────────────────────────────────────── */

const SightingsPage: NextPage = () => {
  const [stats, setStats] = useState<UfosintStats>(staticStats as UfosintStats);
  const [isLive, setIsLive] = useState(false);

  // Hydrate with live stats after mount (no loading flicker - static data is initial state)
  useEffect(() => {
    fetch('/api/sightings/stats')
      .then(r => r.json())
      .then((data: UfosintStats) => {
        setStats(data);
        setIsLive(true);
      })
      .catch(() => {
        // Static fallback already in state - no action needed
      });
  }, []);

  return (
    <>
      <SeoHead
        title="UAP Sighting Reports Database"
        description="614,505 community-submitted UAP sighting reports from five major databases. Browse geographic and temporal patterns, cross-referenced with DECUR's 34 documented cases."
        path="/sightings"
      />

      <div className="container mx-auto px-4 py-8 space-y-8 max-w-7xl">

        {/* Page header */}
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold font-heading text-gray-900 dark:text-gray-100">
              UAP Sighting Reports Database
            </h1>
            <p className="text-gray-400 dark:text-gray-500 text-sm mt-1 font-mono">
              Data provided by UFOSINT - not editorially reviewed by DECUR
            </p>
          </div>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed max-w-3xl">
            614,505 community-submitted sighting reports from five major databases provide
            statistical context for DECUR&apos;s 34 documented cases. High-confidence records
            (quality score &ge;60) are shown by default. DECUR case locations are overlaid on
            the map - hover any pin to cross-reference the community reporting record for that
            incident.
          </p>

          <SourceChips />
        </div>

        {/* Stats bar */}
        <StatsBar stats={stats} isLive={isLive} />

        {/* Map (placeholder until Step 2.3) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Geographic Distribution
            </h2>
            <span className="text-xs text-gray-400 dark:text-gray-500">
              396,158 geocoded records
            </span>
          </div>
          <SightingsMap />
        </div>

        {/* Methodology / attribution */}
        <details className="border border-gray-200 dark:border-gray-700 rounded-xl">
          <summary className="px-5 py-4 cursor-pointer text-sm font-semibold text-gray-700 dark:text-gray-300 select-none flex items-center gap-2 hover:text-primary transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Data Sources and Methodology
          </summary>
          <div className="px-5 pb-5 pt-1 space-y-5 text-sm text-gray-600 dark:text-gray-400">

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Source</th>
                    <th className="text-right py-2 pr-4 font-semibold text-gray-700 dark:text-gray-300">Records</th>
                    <th className="text-left py-2 font-semibold text-gray-700 dark:text-gray-300">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {(staticStats as UfosintStats).by_source.map(src => (
                    <tr key={src.name}>
                      <td className="py-2 pr-4 font-medium text-gray-700 dark:text-gray-300">{src.name}</td>
                      <td className="py-2 pr-4 text-right tabular-nums">{src.count.toLocaleString()}</td>
                      <td className="py-2 text-gray-500 dark:text-gray-500">Collection: {src.collection}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide">Quality Scoring</h3>
              <p>
                Each record receives a quality score of 0-100 based on: description length,
                presence of structured fields (shape, duration, witnesses), geocoding confidence,
                and cross-source corroboration. The default filter of &ge;60 retains records
                with substantive descriptions and verifiable locations. Records below 60 remain
                accessible via the quality toggle.
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold text-gray-700 dark:text-gray-300 text-xs uppercase tracking-wide">Emotion Analysis</h3>
              <p>
                502,985 records include emotion classification powered by transformer models
                (GoEmotions 28-class and j-hartmann 7-class). Emotion data is available for
                research purposes but is not a primary filter in DECUR&apos;s interface.{' '}
                <a
                  href="https://ufosint.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  Explore sentiment patterns on ufosint.com
                </a>.
              </p>
            </div>

            <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Database compiled and maintained by{' '}
                <a href="https://ufosint.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  UFOSINT
                </a>.
                Deduplication pipeline removes 75%+ cross-source overlap from ~2.56M raw records.
                DECUR provides contextual cross-referencing only and does not editorially review
                individual community reports.
              </p>
            </div>
          </div>
        </details>

      </div>
    </>
  );
};

export default SightingsPage;
