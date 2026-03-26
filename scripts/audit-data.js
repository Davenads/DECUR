#!/usr/bin/env node
/**
 * audit-data.js
 *
 * Produces a deterministic, exact inventory of all DECUR data categories.
 * Run before any gap analysis or "what do we have?" research to establish
 * a verified baseline - never rely on agent summarization for counts.
 *
 * Usage:
 *   node scripts/audit-data.js
 *   node scripts/audit-data.js --ids        # include full ID lists
 *   node scripts/audit-data.js --category figures
 */

const path = require('path');
const fs = require('fs');

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const showIds = args.includes('--ids');
const filterCategory = args.find(a => a.startsWith('--category='))?.split('=')[1]
  || (args.includes('--category') && args[args.indexOf('--category') + 1]);

function load(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'));
}

function printSection(title, ids, extra) {
  if (filterCategory && !title.toLowerCase().includes(filterCategory.toLowerCase())) return;
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${title}  [${ids.length}]`);
  console.log('='.repeat(60));
  if (extra) console.log(extra);
  if (showIds) {
    ids.forEach(id => console.log('  -', id));
  }
}

// ── Key Figures ──────────────────────────────────────────────
const figures = load('data/key-figures/index.json');
const figuresByType = figures.reduce((acc, f) => {
  acc[f.type] = (acc[f.type] || []);
  acc[f.type].push(f.id);
  return acc;
}, {});
const figureTypeBreakdown = Object.entries(figuresByType)
  .map(([t, ids]) => `  ${t}: ${ids.length}`)
  .join('\n');
printSection('KEY FIGURES (data/key-figures/index.json)', figures.map(f => f.id),
  `Types:\n${figureTypeBreakdown}`);

// ── Cases ────────────────────────────────────────────────────
const cases = load('data/cases.json');
const casesByTier = cases.reduce((acc, c) => {
  const tier = c.evidence_tier ?? c.tier ?? 'unknown';
  acc[tier] = (acc[tier] || []);
  acc[tier].push(c.id);
  return acc;
}, {});
const caseTierBreakdown = Object.entries(casesByTier)
  .sort(([a], [b]) => String(a).localeCompare(String(b)))
  .map(([t, ids]) => `  tier ${t}: ${ids.length}`)
  .join('\n');
printSection('CASES (data/cases.json)', cases.map(c => c.id),
  `Evidence tiers:\n${caseTierBreakdown}`);

// ── Documents ────────────────────────────────────────────────
const documents = load('data/documents.json');
printSection('DOCUMENTS (data/documents.json)', documents.map(d => d.id));

// ── Programs ────────────────────────────────────────────────
const programs = load('data/programs.json');
printSection('PROGRAMS (data/programs.json)', programs.map(p => p.id));

// ── Contractors ──────────────────────────────────────────────
const contractors = load('data/contractors.json');
printSection('CONTRACTORS (data/contractors.json)', contractors.map(c => c.id));

// ── Resources ────────────────────────────────────────────────
const resources = load('data/resources.json');
const resourceSections = Object.entries(resources).map(([section, items]) => {
  const count = Array.isArray(items) ? items.length : Object.keys(items).length;
  const ids = Array.isArray(items) ? items.map(i => i.id || i.title || '?') : Object.keys(items);
  return { section, count, ids };
});
const totalResources = resourceSections.reduce((sum, s) => sum + s.count, 0);
const resourceBreakdown = resourceSections.map(s => `  ${s.section}: ${s.count}`).join('\n');
const allResourceIds = resourceSections.flatMap(s => s.ids);
printSection(`RESOURCES (data/resources.json) - ${totalResources} total`, allResourceIds,
  `Sections:\n${resourceBreakdown}`);

// ── Glossary ─────────────────────────────────────────────────
const glossary = load('data/glossary.json');
printSection('GLOSSARY (data/glossary.json)',
  glossary.map(g => g.term || g.id || g.acronym || '?'));

// ── Summary table ────────────────────────────────────────────
if (!filterCategory) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('SUMMARY');
  console.log('='.repeat(60));
  const rows = [
    ['Key Figures', figures.length],
    ['Cases',       cases.length],
    ['Documents',   documents.length],
    ['Programs',    programs.length],
    ['Contractors', contractors.length],
    ['Resources',   totalResources],
    ['Glossary',    glossary.length],
  ];
  rows.forEach(([label, count]) => {
    console.log(`  ${label.padEnd(14)} ${count}`);
  });
  console.log('');
}
