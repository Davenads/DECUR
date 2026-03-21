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
}

interface BBIndexData {
  metadata: {
    total: number;
    source: string;
    source_url: string;
    program: string;
    program_period: string;
    note: string;
  };
  cases: BBCase[];
}

const DECADES = ['All', '1940s', '1950s', '1960s'];
const COUNTRIES = ['All', 'USA', 'Japan/Pacific', 'Europe', 'International Waters', 'Other'];

export default function BlueBookIndex() {
  const data = blueBookData as BBIndexData;
  const [search, setSearch] = useState('');
  const [decadeFilter, setDecadeFilter] = useState('All');
  const [countryFilter, setCountryFilter] = useState('All');
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
          ? !['USA', 'Japan/Pacific', 'International Waters'].includes(c.country) &&
            !['Germany', 'England', 'France', 'Morocco', 'Iceland', 'Sweden', 'Philippines',
              'Greenland', 'Azores', 'Scotland', 'Switzerland', 'New Zealand', 'Chile',
              'Cyprus', 'India', 'Africa', 'Canada', 'Mexico', 'Guatemala', 'Okinawa', 'Korea'].includes(c.country)
          : countryFilter === 'Europe'
          ? ['Germany', 'England', 'France', 'Morocco', 'Iceland', 'Sweden',
             'Scotland', 'Switzerland', 'Azores'].includes(c.country)
          : c.country === countryFilter);
      return matchSearch && matchDecade && matchCountry;
    });
  }, [data.cases, search, decadeFilter, countryFilter]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleFilterChange = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-lg p-4">
        <p className="text-sm text-amber-800 dark:text-amber-300">
          <span className="font-semibold">Project Blue Book Unidentified Cases</span>
          {' '}- {data.metadata.total} cases verified as &quot;Unidentified&quot; by NICAP independent review (1947-1969).{' '}
          {data.metadata.note}
        </p>
        <a
          href={data.metadata.source_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-amber-700 dark:text-amber-400 underline mt-1 inline-block"
        >
          Source: {data.metadata.source}
        </a>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <input
          type="text"
          placeholder="Search location, case number, or date..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="flex-1 min-w-48 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <div className="flex gap-2 flex-wrap">
          {DECADES.map((d) => (
            <button
              key={d}
              onClick={() => handleFilterChange(setDecadeFilter)(d)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                decadeFilter === d
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary/50'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap">
          {COUNTRIES.map((c) => (
            <button
              key={c}
              onClick={() => handleFilterChange(setCountryFilter)(c)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                countryFilter === c
                  ? 'bg-primary text-white border-primary'
                  : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-primary/50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Showing {filtered.length} of {data.cases.length} cases
        {(decadeFilter !== 'All' || countryFilter !== 'All' || search) && ' (filtered)'}
      </p>

      {/* Table */}
      <div className="overflow-x-auto border border-gray-200 dark:border-gray-700 rounded-lg">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700">
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-24">Case No.</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-36">Date</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Location</th>
              <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-32 hidden sm:table-cell">Country/Region</th>
              <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 w-28">Status</th>
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
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 text-xs">{c.date}</td>
                <td className="px-4 py-3 text-gray-900 dark:text-gray-100">{c.location}</td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400 text-xs hidden sm:table-cell">{c.country}</td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-700/50">
                    Unidentified
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
