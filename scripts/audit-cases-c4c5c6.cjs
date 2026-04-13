#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const casesPath = path.join(__dirname, '../data/cases.json');
const docsPath = path.join(__dirname, '../data/documents.json');
const indexPath = path.join(__dirname, '../data/key-figures/index.json');

const cases = JSON.parse(fs.readFileSync(casesPath, 'utf8'));
const docs = JSON.parse(fs.readFileSync(docsPath, 'utf8'));
const figureIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));

const figureIds = new Set(figureIndex.map(f => f.id));
const docIds = new Set(docs.map(d => d.id));

const TARGET_IDS = [
  'aguadilla-2013','fukushima-2011','varginha-1996','levelland-1957',
  'coyne-helicopter-1973','rb47-1957',
  'falcon-lake-1967','minot-afb-1968','exeter-1965','loch-raven-dam-1958',
  'kenneth-arnold-1947','betty-barney-hill-1961',
  'walton-abduction-1975','cash-landrum-1980','trans-en-provence-1981',
  'foo-fighters-wwii'
];

function findEmDashes(obj, path) {
  const results = [];
  const str = JSON.stringify(obj);
  if (str.includes('\u2014')) {
    // Find specific fields
    function walk(o, p) {
      if (typeof o === 'string') {
        if (o.includes('\u2014')) results.push({ path: p, value: o });
      } else if (Array.isArray(o)) {
        o.forEach((v, i) => walk(v, p + '[' + i + ']'));
      } else if (o && typeof o === 'object') {
        Object.keys(o).forEach(k => walk(o[k], p + '.' + k));
      }
    }
    walk(obj, path);
  }
  return results;
}

TARGET_IDS.forEach(id => {
  const c = cases.find(x => x.id === id);
  if (!c) {
    console.log(id + ': NOT FOUND IN cases.json');
    return;
  }

  const issues = [];

  // 1. evidence_tier
  if (!c.evidence_tier) issues.push('MISSING evidence_tier');
  else if (!['tier-1','tier-2','tier-3'].includes(c.evidence_tier)) issues.push('INVALID evidence_tier: ' + c.evidence_tier);

  // 2. insider_connections
  if (c.insider_connections && c.insider_connections.length > 0) {
    c.insider_connections.forEach((conn, i) => {
      if (typeof conn === 'string') {
        issues.push('insider_connections[' + i + ']: bare string "' + conn + '"');
      } else if (typeof conn === 'object') {
        if (!conn.id) issues.push('insider_connections[' + i + ']: missing id');
        else if (!figureIds.has(conn.id)) issues.push('insider_connections[' + i + ']: invalid id "' + conn.id + '"');
        if (!conn.role) issues.push('insider_connections[' + i + ']: missing role (id: ' + conn.id + ')');
      }
    });
  }

  // 3. documents_referenced
  if (c.documents_referenced && c.documents_referenced.length > 0) {
    c.documents_referenced.forEach((docId, i) => {
      if (typeof docId !== 'string') {
        issues.push('documents_referenced[' + i + ']: not a string');
      } else if (!docIds.has(docId)) {
        issues.push('documents_referenced[' + i + ']: invalid id "' + docId + '"');
      }
    });
  }

  // 4. em dashes
  const emDashes = findEmDashes(c, id);
  emDashes.forEach(e => {
    issues.push('EM DASH in ' + e.path + ': ' + e.value.substring(0, 80));
  });

  // 5. ufotimeline URLs
  if (c.sources) {
    c.sources.forEach((s, i) => {
      if (s.article_url && s.article_url.includes('ufotimeline')) {
        issues.push('FLAG_UFOTIMELINE sources[' + i + '].article_url: ' + s.article_url);
      }
    });
  }

  // Print result
  if (issues.length === 0) {
    console.log(id + ': CLEAN');
  } else {
    console.log(id + ':');
    issues.forEach(iss => console.log('  - ' + iss));
  }

  // Also print first source for sources.tsx reference
  if (c.sources && c.sources.length > 0) {
    const s = c.sources[0];
    console.log('  [primary_source] title="' + s.title + '" url="' + (s.url || s.article_url || '') + '" type="' + (s.type || '') + '"');
  }
  console.log('  [title] ' + c.title);
  console.log('');
});
