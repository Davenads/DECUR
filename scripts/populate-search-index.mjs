/**
 * scripts/populate-search-index.mjs
 *
 * Populates the Supabase `search_index` table from local JSON source files.
 * Mirrors the corpus-building logic from pages/search.tsx getStaticProps.
 * Idempotent — uses UPSERT so it's safe to re-run after any data change.
 *
 * Usage:
 *   node --env-file=.env.local scripts/populate-search-index.mjs
 *
 * Required env vars (in .env.local or environment):
 *   IMPORT_SUPABASE_URL  — Supabase project URL
 *   IMPORT_SERVICE_KEY   — Supabase service role key (sb_secret_...)
 *
 * Falls back to UFOSINT_SUPABASE_URL / UFOSINT_SERVICE_KEY if IMPORT_* not set.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync, readdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ── Supabase client ──────────────────────────────────────────────────────────

const url =
  process.env.IMPORT_SUPABASE_URL ??
  process.env.UFOSINT_SUPABASE_URL ??
  process.env.NEXT_PUBLIC_SUPABASE_URL;
const key =
  process.env.IMPORT_SERVICE_KEY ??
  process.env.UFOSINT_SERVICE_KEY ??
  process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing IMPORT_SUPABASE_URL / IMPORT_SERVICE_KEY env vars.');
  process.exit(1);
}

const sb = createClient(url, key, { auth: { persistSession: false } });

// ── Helpers ──────────────────────────────────────────────────────────────────

const MAX_FULL_TEXT = 3000; // chars — no need to cap aggressively server-side

function readJson(relPath) {
  return JSON.parse(readFileSync(resolve(ROOT, relPath), 'utf8'));
}

function truncate(str, max) {
  if (!str) return undefined;
  return str.length <= max ? str : str.slice(0, max);
}

// ── Corpus builders (one per data category) ──────────────────────────────────

function buildInsiders() {
  const indexData = readJson('data/key-figures/index.json');
  // Load registry via require (CommonJS-compatible JSON imports)
  const registryDir = resolve(ROOT, 'data/key-figures');
  const registryFiles = readdirSync(registryDir).filter(f => f.endsWith('.json') && f !== 'index.json');

  const profiles = {};
  for (const f of registryFiles) {
    const id = f.replace('.json', '');
    try {
      profiles[id] = readJson(`data/key-figures/${f}`);
    } catch { /* skip unreadable */ }
  }

  const items = [];
  for (const ins of indexData) {
    const profile = profiles[ins.id];

    const disclosureText = (profile?.disclosures ?? [])
      .map(d => [d.title, d.notes].filter(Boolean).join(' '))
      .join(' ');

    const keyEventText = (profile?.profile?.key_events ?? [])
      .map(e => e.event).join(' ');

    const claimsText = Array.isArray(profile?.claims)
      ? profile.claims.map(c => c.claim).join(' ')
      : '';

    const fullText = truncate(
      [disclosureText, keyEventText, claimsText].filter(Boolean).join(' '),
      MAX_FULL_TEXT
    );

    items.push({
      id: `insider-${ins.id}`,
      type: 'insider',
      title: ins.name,
      subtitle: ins.role ?? ins.affiliation ?? null,
      description: ins.summary ?? ins.tags?.join(', ') ?? '',
      full_text: fullText ?? null,
      href: `/figures/${ins.id}`,
      badge: 'Key Figure',
      aliases: ins.aliases ?? [],
      meta: { figureType: ins.type ?? null },
    });
  }
  return items;
}

function buildCases() {
  const data = readJson('data/cases.json');
  return data.map(c => {
    const keyFacts = (c.overview?.key_facts ?? []).join(' ');
    const witnessText = (c.witnesses ?? []).map(w => w.testimony).join(' ');
    const fullText = truncate([keyFacts, witnessText].filter(Boolean).join(' '), MAX_FULL_TEXT);
    return {
      id: `case-${c.id}`,
      type: 'case',
      title: c.name,
      subtitle: `${c.date} · ${c.location}`,
      description: c.summary,
      full_text: fullText ?? null,
      href: `/cases/${c.id}`,
      badge: 'Documented Case',
      aliases: [],
      meta: { tier: c.evidence_tier ?? null },
    };
  });
}

function buildDocuments() {
  const data = readJson('data/documents.json');
  return data.map(doc => {
    const findingsText = (doc.key_findings ?? []).join(' ');
    const fullText = truncate([findingsText, doc.significance].filter(Boolean).join(' '), MAX_FULL_TEXT);
    return {
      id: `document-${doc.id}`,
      type: 'document',
      title: doc.name,
      subtitle: `${doc.issuing_authority} · ${doc.date}`,
      description: doc.summary ?? doc.significance ?? '',
      full_text: fullText ?? null,
      href: `/documents/${doc.id}`,
      badge: doc.document_type ?? 'Document',
      aliases: [],
      meta: { docType: doc.document_type ?? null },
    };
  });
}

function buildTimeline() {
  const data = readJson('data/timeline.json');
  return data.map(entry => ({
    id: `timeline-${entry.id}`,
    type: 'timeline',
    title: entry.title,
    subtitle: String(entry.year),
    description: entry.excerpt ?? '',
    full_text: null,
    href: `/timeline?year=${entry.year}`,
    badge: (entry.categories?.[0] ?? 'event').replace(/-/g, ' '),
    aliases: [],
    meta: null,
  }));
}

function buildGlossary() {
  const data = readJson('data/glossary.json');
  return data.map(term => ({
    id: `glossary-${term.term}`,
    type: 'glossary',
    title: term.term,
    subtitle: null,
    description: term.definition,
    full_text: null,
    href: '/resources?tab=glossary',
    badge: 'Glossary',
    aliases: [],
    meta: null,
  }));
}

function buildContractors() {
  const data = readJson('data/contractors.json');
  return data.map(c => ({
    id: `contractor-${c.id}`,
    type: 'contractor',
    title: c.name,
    subtitle: `Est. ${c.founded} · ${c.headquarters}`,
    description: c.summary ?? c.tags?.join(', ') ?? '',
    full_text: null,
    href: `/contractors/${c.id}`,
    badge: 'Contractor',
    aliases: [],
    meta: null,
  }));
}

function buildPrograms() {
  const data = readJson('data/programs.json');
  return data.map(p => ({
    id: `program-${p.id}`,
    type: 'program',
    title: p.name,
    subtitle: `${p.active_period} · ${p.parent_org}`,
    description: p.summary,
    full_text: null,
    href: `/programs/${p.id}`,
    badge: p.type ? p.type.charAt(0).toUpperCase() + p.type.slice(1) : 'Program',
    aliases: [],
    meta: { programStatus: p.status ?? null },
  }));
}

function buildResources() {
  const data = readJson('data/resources.json');
  const all = [...(data.sources ?? []), ...(data.testimony ?? [])];
  return all.map(r => ({
    id: `resource-${r.id}`,
    type: 'resource',
    title: r.title,
    subtitle: r.author ? `${r.author}${r.year ? ` (${r.year})` : ''}` : null,
    description: r.description ?? '',
    full_text: null,
    href: '/resources',
    badge: r.type ?? 'Resource',
    aliases: [],
    meta: null,
  }));
}

function buildResearchOrgs() {
  const data = readJson('data/research/organizations.json');
  return data.map(org => ({
    id: `research-org-${org.id}`,
    type: 'research-org',
    title: org.name,
    subtitle: [org.abbreviation, org.type, org.founded ? `Est. ${org.founded}` : null]
      .filter(Boolean).join(' · ') || null,
    description: org.description ?? org.focus_areas?.join(', ') ?? '',
    full_text: truncate(org.description ?? '', MAX_FULL_TEXT),
    href: org.decur_url ?? `/research/organizations/${org.id}`,
    badge: 'Research Org',
    aliases: org.abbreviation ? [org.abbreviation] : [],
    meta: null,
  }));
}

function buildResearchPapers() {
  const data = readJson('data/research/papers.json');
  return data.map(paper => {
    const authorStr = Array.isArray(paper.authors) ? paper.authors.join(', ') : '';
    const subtitle = [authorStr, paper.year ? String(paper.year) : null, paper.journal]
      .filter(Boolean).join(' · ');
    return {
      id: `research-paper-${paper.id}`,
      type: 'research-paper',
      title: paper.title,
      subtitle: subtitle || null,
      description: paper.summary ?? paper.tags?.join(', ') ?? '',
      full_text: truncate([paper.summary, paper.tags?.join(' ')].filter(Boolean).join(' '), MAX_FULL_TEXT),
      href: paper.decur_url ?? `/research/papers/${paper.id}`,
      badge: paper.source_type === 'peer-reviewed' ? 'Peer-Reviewed' : paper.source_type === 'preprint' ? 'Preprint' : 'Paper',
      aliases: [],
      meta: null,
    };
  });
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function upsertBatch(items, batchSize = 200) {
  let inserted = 0;
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const { error } = await sb
      .from('search_index')
      .upsert(batch, { onConflict: 'id' });
    if (error) {
      console.error(`  UPSERT error at offset ${i}:`, error.message);
      process.exit(1);
    }
    inserted += batch.length;
    process.stdout.write(`  ${inserted}/${items.length}\r`);
  }
  console.log(`  ${inserted}/${items.length} — done`);
}

async function main() {
  console.log('Populating search_index...\n');

  const builders = [
    ['Insiders',        buildInsiders],
    ['Cases',           buildCases],
    ['Documents',       buildDocuments],
    ['Timeline',        buildTimeline],
    ['Glossary',        buildGlossary],
    ['Contractors',     buildContractors],
    ['Programs',        buildPrograms],
    ['Resources',       buildResources],
    ['Research Orgs',   buildResearchOrgs],
    ['Research Papers', buildResearchPapers],
  ];

  let total = 0;
  for (const [label, build] of builders) {
    process.stdout.write(`${label}... `);
    const items = build();
    process.stdout.write(`${items.length} items\n`);
    await upsertBatch(items);
    total += items.length;
  }

  // Verify total row count
  const { count, error } = await sb
    .from('search_index')
    .select('*', { count: 'exact', head: true });
  if (error) {
    console.error('Count query failed:', error.message);
  } else {
    console.log(`\nTotal rows in search_index: ${count} (inserted ${total} this run)`);
  }
}

main().catch(err => { console.error(err); process.exit(1); });
