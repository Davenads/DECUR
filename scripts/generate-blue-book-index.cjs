#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const inputPath = path.join(__dirname, '..', 'bluelist_parsed.json');
const outputPath = path.join(__dirname, '..', 'data', 'blue-book-index.json');

const raw = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

// Country derivation logic
function deriveCountry(location) {
  const loc = location || '';

  // Japan/Pacific keywords
  const japanPacific = ['Japan', 'Okinawa', 'Tokyo', 'Kyushu', 'Honshu', 'Misawa', 'Kadena', 'Haneda'];
  for (const kw of japanPacific) {
    if (loc.includes(kw)) return 'Japan/Pacific';
  }

  // International Waters
  const intlWaters = ['North Atlantic', 'Pacific Ocean', 'Atlantic Ocean', "41'N"];
  for (const kw of intlWaters) {
    if (loc.includes(kw)) return 'International Waters';
  }
  if (/\d+['°]\s*N/.test(loc) && !loc.includes(',')) return 'International Waters';

  // Specific countries
  const countryMap = [
    ['Korea', 'Korea'],
    ['Germany', 'Germany'],
    ['England', 'England'],
    ['France', 'France'],
    ['Morocco', 'Morocco'],
    ['Iceland', 'Iceland'],
    ['Sweden', 'Sweden'],
    ['Philippines', 'Philippines'],
    ['Greenland', 'Greenland'],
    ['Azores', 'Azores'],
    ['Chile', 'Chile'],
    ['Cyprus', 'Cyprus'],
    ['India', 'India'],
    ['New Zealand', 'New Zealand'],
    ['Scotland', 'Scotland'],
    ['Switzerland', 'Switzerland'],
    ['Canada', 'Canada'],
    ['Mexico', 'Mexico'],
    ['Guatemala', 'Guatemala'],
    ['Africa', 'Africa'],
    ['Atlantic', 'International Waters'],
    ['Pacific', 'International Waters'],
    ['Bermuda', 'International Waters'],
  ];

  for (const [kw, country] of countryMap) {
    if (loc.includes(kw)) return country;
  }

  return 'USA';
}

function parseYear(dateStr) {
  if (!dateStr) return null;
  // Try to find a 4-digit year
  const match = dateStr.match(/\b(194[0-9]|195[0-9]|196[0-9])\b/);
  if (match) return parseInt(match[1], 10);
  return null;
}

function getDecade(year) {
  if (!year) return 'Unknown';
  return `${Math.floor(year / 10) * 10}s`;
}

const cases = raw.map((entry) => {
  const year = parseYear(entry.date);
  return {
    id: `bb-${entry.caseNo}`,
    case_no: entry.caseNo,
    date: entry.date,
    year: year,
    decade: getDecade(year),
    location: entry.location,
    country: deriveCountry(entry.location),
    status: 'unidentified',
  };
});

const output = {
  metadata: {
    total: cases.length,
    source: 'NICAP Blue Book Unknowns Compilation',
    source_url: 'https://www.nicap.org/bluebook/bluelist.htm',
    program: 'project-blue-book',
    program_period: '1947-1969',
    note: "558 cases verified as 'Unidentified' by NICAP independent review. Official USAF count: 701. Discrepancy reflects NICAP's more conservative verification standard.",
  },
  cases,
};

fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf-8');
console.log(`Written ${cases.length} cases to ${outputPath}`);

// Print country distribution for verification
const countryCounts = {};
for (const c of cases) {
  countryCounts[c.country] = (countryCounts[c.country] || 0) + 1;
}
console.log('\nCountry distribution:');
Object.entries(countryCounts).sort((a, b) => b[1] - a[1]).forEach(([k, v]) => {
  console.log(`  ${k}: ${v}`);
});
