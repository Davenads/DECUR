import React, { useState, useMemo } from 'react';
import blueBookData from '../../data/blue-book-index.json';

interface BBCase {
  id: string;
  case_no: string;
  date: string;
  year: number;
  decade: string;
  location: string;
  country: string;
  status: string;
  // Enriched fields from Sparks catalog
  lat?: number;
  lon?: number;
  duration?: string;
  instruments_documented?: boolean;
}

interface BBIndexData {
  metadata: {
    total: number;
    source: string;
    source_url: string;
    program: string;
    program_period: string;
    note: string;
    enrichment_source?: string;
    enrichment_url?: string;
    enriched_cases?: number;
    cases_with_coordinates?: number;
  };
  cases: BBCase[];
}

const DECADES = ['All', '1940s', '1950s', '1960s'];
const COUNTRIES = ['All', 'USA', 'Japan/Pacific', 'Europe', 'International Waters', 'Other'];
const EUROPE_COUNTRIES = ['Germany', 'England', 'France', 'Morocco', 'Iceland', 'Sweden',
  'Scotland', 'Switzerland', 'Azores'];
const NON_USA_COUNTRIES = ['Japan/Pacific', 'International Waters', 'Germany', 'England',
  'France', 'Morocco', 'Iceland', 'Sweden', 'Philippines', 'Greenland', 'Azores', 'Scotland',
  'Switzerland', 'New Zealand', 'Chile', 'Cyprus', 'India', 'Africa', 'Canada', 'Mexico',
  'Guatemala', 'Okinawa', 'Korea'];

export default function BlueBookIndex() {
  const data = blueBookData as BBIndexData;
  const [search, setSearch] = useState('');
  const [decadeFilter, setDecadeFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
  const [instrumentsOnly, setInstrumentsOnly] = useState(false);
  const [page, setPage] = useState(1);
  const PER_PAGE = 50;

  const filtered = useMemo(() => {
    return data.cases.filter((c) => {
      const matchSearch =
        !search ||
        c.location.toLowerCase().includes(search.toLowerCase()) ||
        c.case_no.includes(search) ||
        c.date.toLowerCase().includes(search.toLowerCase());

      const matchDecade = decadeFilter === 'All' || c.decade === decadeFilter;

      const matchCountry =
        countryFilter === 'All' ||
        (countryFilter === 'Other'
          ? !NON_USA_COUNTRIES.includes(c.country) && c.country !== 'USA'
          : countryFilter === 'Europe'
          ? EUROPE_COUNTRIES.includes(c.country)
          : c.country === countryFilter);

      const matchInstruments = !instrumentsOnly || !!c.instruments_documented;

      return matchSearch && matchDecade && matchCountry && matchInstruments;
    });
  }, [data.cases, search, decadeFilter, countryFilter, instrumentsOnly]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const resetPage = () => setPage(1);

  const pillClass = (active: boolean) =>
    `px-3 py-1.5 text-xs rounded-full border transition-colors ${
      active
        ? 'bg-primary text-white border-primary'
        : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary/50'
    }`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Project Blue Book Unidentified Cases</span>
          {' '}- {data.metadata.total} cases verified as &quot;Unidentified&quot; by NICAP independent review (1947-1969).{' '}
          {data.metadata.note}
        </p>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
          <a
            href={data.metadata.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-amber-700 dark:text-amber-400 underline"
          >
            Source: {data.metadata.source}
          </a>
          {data.metadata.enrichment_source && (
            <a
              href={data.metadata.enrichment_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-amber-700 dark:text-amber-400 underline"
            >
              Enriched: {data.metadata.enrichment_source}
            </a>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3">
        <input
          type="text"
          placeholder="Search location, case number, or date..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); resetPage(); }}
          className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Decade:</span>
          {DECADES.map((d) => (
            <button
              key={d}
              onClick={() => { setDecadeFilter(d); resetPage(); }}
              className={pillClass(decadeFilter === d)}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Region:</span>
          {COUNTRIES.map((c) => (
            <button
              key={c}
              onClick={() => { setCountryFilter(c); resetPage(); }}
              className={pillClass(countryFilter === c)}
            >
              {c}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">Filter:</span>
          <button
            onClick={() => { setInstrumentsOnly(!instrumentsOnly); resetPage(); }}
            className={pillClass(instrumentsOnly)}
          >
            Instrument-documented only
          </button>
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Showing {filtered.length} of {data.cases.length} cases
        {(decadeFilter !== 'All' || countryFilter !== 'All' || search || instrumentsOnly) && ' (filtered)'}
      </p>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-20">Case</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-32">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Location</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-24 hidden md:table-cell">Duration</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-28 hidden sm:table-cell">Region</th>
              <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-20">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {paginated.map((c, i) => (
              <tr
                key={c.id}
                className={`transition-colors ${
                  i % 2 === 0
                    ? 'bg-white dark:bg-gray-900'
                    : 'bg-gray-50/50 dark:bg-gray-800/20'
                } hover:bg-amber-50/50 dark:hover:bg-amber-950/20`}
              >
                <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-gray-400">
                  #{c.case_no}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs whitespace-nowrap">{c.date}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">
                  <span>{c.location}</span>
                  {c.instruments_documented && (
                    <span
                      className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700/50"
                      title="Radar, photographic, or scientific instrumentation documented"
                    >
                      instr.
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs hidden md:table-cell">
                  {c.duration || <span className="text-gray-300 dark:text-gray-600">-</span>}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs hidden sm:table-cell">{c.country}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                    Unkn.
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          >
            Previous
          </button>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Page {page} of {totalPages} ({filtered.length} cases)
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-40 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
