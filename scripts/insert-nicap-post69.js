#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const candidates = JSON.parse(fs.readFileSync(path.join(__dirname, 'output/nicap-candidates.json'), 'utf8'));
const timeline = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/timeline.json'), 'utf8'));

const SKIP_TITLES = ['Map of U', 'location not given', 'Judith_Gap'];

const post69 = candidates.candidates.filter(e => {
  if (e.year < 1970) return false;
  if (!e._criteria.A) return false;
  if (!e.article_url) return false;
  for (const skip of SKIP_TITLES) {
    if (e.title.includes(skip)) return false;
  }
  return true;
});

const maxId = Math.max(...timeline.map(e => e.id || 0));
let nextId = maxId + 1;

const toAdd = post69.map(e => {
  const clean = { ...e };
  delete clean._staging_id;
  delete clean._criteria;
  return {
    id: nextId++,
    date: clean.date,
    year: clean.year,
    title: clean.title,
    excerpt: clean.excerpt,
    categories: ['sightings'],
    source_url: clean.source_url,
    source: 'nicap',
    article_url: clean.article_url,
    article_type: 'article',
  };
});

const updated = [...timeline, ...toAdd];
fs.writeFileSync(path.join(__dirname, '../data/timeline.json'), JSON.stringify(updated, null, 2));

console.log('Added', toAdd.length, 'post-1969 entries:');
toAdd.forEach(e => console.log(' ', e.year, e.title));
console.log('Timeline total:', updated.length);
