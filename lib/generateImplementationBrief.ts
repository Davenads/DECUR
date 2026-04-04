/**
 * generateImplementationBrief.ts
 *
 * Generates a Markdown implementation brief from an approved contribution.
 * The output is formatted as a Claude prompt template - designed to be
 * pasted directly into an LLM session to guide implementation of the data
 * point following DECUR's canonical JSON schema.
 *
 * NO AI/inference is used here. The file only formats data that was
 * explicitly provided in the submission payload. Research-required fields
 * (career_connections, claims, credibility, associated_people) are stubbed
 * with TODO markers pointing to specific schema guidance.
 */

export interface BriefContribution {
  id: string;
  content_type: string;
  title: string;
  payload: Record<string, unknown>;
  submitter_note: string | null;
  reviewer_note: string | null;
  created_at: string;
  reviewed_at: string | null;
  submitter_display_name: string | null;
  reviewer_display_name: string | null;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function stringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter(v => typeof v === 'string') as string[];
}

function str(value: unknown, fallback = 'TODO: research'): string {
  if (typeof value === 'string' && value.trim()) return value.trim();
  return fallback;
}

function sourcesList(urls: string[]): string {
  if (urls.length === 0) return '(none provided)';
  return urls.map((u, i) => `${i + 1}. ${u}`).join('\n');
}

// ── Per-type schema skeletons ──────────────────────────────────────────────

function figureSkeleton(payload: Record<string, unknown>): string {
  const name = str(payload.name);
  const roles = stringArray(payload.roles);
  const summary = str(payload.summary);
  const orgs = stringArray(payload.organizations);
  const slug = slugify(name !== 'TODO: research' ? name : 'unknown-figure');

  const rolesJson = roles.length > 0
    ? roles.map(r => `    "${r}"`).join(',\n')
    : '    // TODO: research - at least 2-3 roles';

  const orgsJson = orgs.length > 0
    ? orgs.map(o => `    "${o}"`).join(',\n')
    : '    // TODO: research';

  return `\`\`\`json
{
  "profile": {
    "id": "${slug}",
    "name": "${name}",
    "aliases": [
      // TODO: research - common name variants
    ],
    "born": "TODO: research - Month Day, YYYY - City, State",
    "died": null,
    "roles": [
${rolesJson}
    ],
    "service_period": "TODO: research - YYYY-YYYY (org); YYYY-present (role)",
    "organizations": [
${orgsJson}
    ],
    "clearance": "TODO: research",
    "summary": "${summary.replace(/"/g, '\\"')}",
    "education": [
      // TODO: research - Degree, Institution, Year
    ],
    "early_career": [
      // TODO: research - brief early career bullet points
    ],
    "key_events": [
      // TODO: research - minimum 5 events in { "year": "YYYY", "event": "..." } format
      // year must be "YYYY" or "Mon YYYY" (e.g. "1994" or "Sep 1994") - never ISO strings
    ]
  },
  "associated_people": [
    // TODO: research - minimum 2-3 entries
    // Each entry: { "id": "registry-slug", "name": "...", "role": "one-line title", "relationship": "narrative sentence" }
    // id must match a key in data/key-figures/registry.ts if the person is already profiled
  ],
  "disclosures": [
    // TODO: research - known public disclosures (interviews, testimony, articles, etc.)
    // Each entry: { "date": "YYYY", "type": "interview|congressional-testimony|...", "title": "...", "outlet": "...", "notes": "..." }
    // Valid types: article, written, print, television, film, documentary, podcast, radio,
    //   interview, speech, congressional-testimony, congressional-briefing, formal-complaint,
    //   declassification, academic-paper, conference, symposium, preprint
  ],
  "sources": [
    // Fill in from source URLs provided by submitter (see below)
    // Each entry: { "title": "...", "url": "...", "type": "Book|Interview|...", "notes": "primary/secondary source note" }
  ],
  "career_connections": [
    // TODO: research - lateral nodes for Career Network graph
    // Each entry: { "event_index": 0, "node_type": "person|case|program", "node_id": "...", "node_label": "...", "relationship": "...", "connection_type": "professional|institutional|investigative" }
    // event_index is 0-based into key_events - aim for 2-3 nodes spread across different indices
  ],
  "claims": [
    // TODO: research - specific factual claims made by this figure
    // Each entry: { "claim": "...", "category": "...", "corroboration": "Unverified|Partially Verified|Corroborated|Disputed", "score": 0-3, "sources": ["url1"] }
  ]
}
\`\`\``;
}

function caseSkeleton(payload: Record<string, unknown>): string {
  const title = str(payload.title);
  const date = str(payload.date);
  const location = str(payload.location);
  const summary = str(payload.summary);
  const witnesses = stringArray(payload.witnesses);

  const witnessesJson = witnesses.length > 0
    ? witnesses.map(w => `      "${w}"`).join(',\n')
    : '      // TODO: research - witness names and roles';

  return `\`\`\`json
{
  "id": "${slugify(title)}",
  "title": "${title.replace(/"/g, '\\"')}",
  "date": "${date}",
  "location": "${location.replace(/"/g, '\\"')}",
  "summary": "${summary.replace(/"/g, '\\"')}",
  "evidence_tier": "TODO: choose - Tier 1 (Physical) / Tier 2 (Multiple Witnesses) / Tier 3 (Government Documentation) / Tier 4 (Single Witness)",
  "witnesses": [
${witnessesJson}
  ],
  "physical_evidence": [
    // TODO: research - radar tracks, photos, material samples, etc.
  ],
  "government_response": "TODO: research - official acknowledgment, investigation, or denial",
  "status": "TODO: Unexplained | Under Investigation | Explained | Disputed",
  "hypotheses": {
    "conventional": ["TODO: research - conventional explanations considered"],
    "anomalous": ["TODO: research - anomalous interpretations"]
  },
  "sources": [
    // Fill from source URLs below
    // { "title": "...", "url": "...", "type": "...", "notes": "..." }
  ],
  "insider_connections": [
    // TODO: research - { "id": "figure-slug", "role": "one sentence", "note": "optional context" }
  ]
}
\`\`\``;
}

function timelineEventSkeleton(payload: Record<string, unknown>): string {
  const year = str(payload.year);
  const event = str(payload.event);
  const category = str(payload.category);

  return `\`\`\`json
{
  "year": "${year}",
  "event": "${event.replace(/"/g, '\\"')}",
  "category": "${category}",
  "source_url": "TODO: replace with direct destination URL (not ufotimeline.com)",
  "article_url": "TODO: direct article/book/document URL",
  "tags": ["TODO: relevant tags"]
}
\`\`\`

> Note: timeline.json entries require article_url to point to the final destination
> (Amazon, YouTube, FBI Vault, archive.org, etc.) - never a ufotimeline.com URL.`;
}

function correctionSkeleton(payload: Record<string, unknown>): string {
  const targetType = str(payload.target_type);
  const targetId = str(payload.target_id);
  const targetName = str(payload.target_name);
  const fieldDesc = str(payload.field_description);
  const currentVal = str(payload.current_value, '(not provided)');
  const suggestedVal = str(payload.suggested_value);

  return `## Correction Details

| Field | Value |
|---|---|
| Target type | \`${targetType}\` |
| Target ID | \`${targetId}\` |
| Target name | ${targetName} |
| Field to correct | ${fieldDesc} |
| Current value | ${currentVal} |
| Suggested value | ${suggestedVal} |

## Implementation

1. Open \`data/${targetType === 'figure' ? 'key-figures/' + targetId + '.json' : targetType + 's.json'}\`
2. Find the field described above
3. Verify the suggested value against the source URLs below
4. Apply the correction following the canonical schema rules in CLAUDE.md`;
}

// ── Research checklist per type ────────────────────────────────────────────

function figureChecklist(): string {
  return `## Research Checklist

- [ ] Verify full name, aliases, date and place of birth
- [ ] Confirm all roles with precise dates (start/end years)
- [ ] Confirm clearance level and service period
- [ ] Research at least 5 key career events (year + event string)
- [ ] Add 2-3 associated_people with narrative relationship descriptions
- [ ] Document known public disclosures (interviews, testimony, articles) with dates
- [ ] Add career_connections lateral nodes branching from key_events
- [ ] Add claims array with corroboration scores (0 = Unverified, 3 = Corroborated)
- [ ] Verify all source URLs are accessible and point to primary sources
- [ ] Run \`node scripts/audit-data.js --ids\` after adding to confirm registration`;
}

function caseChecklist(): string {
  return `## Research Checklist

- [ ] Confirm date with primary sources (not secondary summaries)
- [ ] Verify location (city, state/country, GPS if known)
- [ ] Document all known witnesses with roles
- [ ] Identify physical evidence (radar, photographs, material samples)
- [ ] Find official government response (acknowledgment, denial, or investigation)
- [ ] Assign evidence tier based on available evidence types
- [ ] Add insider_connections to key figures already in DECUR
- [ ] Verify source URLs are direct primary or authoritative secondary sources`;
}

function timelineChecklist(): string {
  return `## Research Checklist

- [ ] Confirm event year/date from primary source
- [ ] Verify article_url points to direct destination (not ufotimeline.com)
- [ ] Confirm category is appropriate for the event
- [ ] Add relevant tags for searchability`;
}

function correctionChecklist(): string {
  return `## Research Checklist

- [ ] Verify the suggested value against the provided source URLs
- [ ] Check that the change doesn't break any referencing components
- [ ] Run \`npx tsc --noEmit\` after making the change`;
}

// ── Main export ───────────────────────────────────────────────────────────

export function generateImplementationBrief(c: BriefContribution): string {
  const approvedDate = c.reviewed_at ? formatDate(c.reviewed_at) : formatDate(c.created_at);
  const submittedDate = formatDate(c.created_at);
  const submitter = c.submitter_display_name ?? 'Unknown';
  const reviewer = c.reviewer_display_name ?? 'Admin';
  const typeLabel = c.content_type.replace(/_/g, ' ');

  const payload = c.payload;
  const sourceUrls = stringArray(payload.source_urls);

  let schemaSkeleton: string;
  let checklist: string;
  let promptInstructions: string;

  switch (c.content_type) {
    case 'figure':
      schemaSkeleton = figureSkeleton(payload);
      checklist = figureChecklist();
      promptInstructions = `Using the submission data below and the CLAUDE.md schema rules, build the complete
key figure JSON profile. Fill in all fields you can from the submission and your research.
Mark fields that require more research with "TODO: [what's needed]". Do NOT fabricate
data - only include what can be verified from the source URLs or your training knowledge.
Fields that always require research: career_connections, claims, credibility, associated_people.`;
      break;
    case 'case':
      schemaSkeleton = caseSkeleton(payload);
      checklist = caseChecklist();
      promptInstructions = `Using the submission data below, build the complete case entry JSON following DECUR's
schema. Research the case from the source URLs and your knowledge. Mark unresolved
fields with "TODO: [what's needed]". Do NOT fabricate witness names, evidence, or
government responses - only include what can be verified.`;
      break;
    case 'timeline_event':
      schemaSkeleton = timelineEventSkeleton(payload);
      checklist = timelineChecklist();
      promptInstructions = `Using the submission data below, build the timeline.json entry. Verify the event date
and description from the source URLs. Ensure article_url points to the direct
destination, not an aggregator.`;
      break;
    case 'correction':
      schemaSkeleton = correctionSkeleton(payload);
      checklist = correctionChecklist();
      promptInstructions = `This is a data correction submission. Review the suggested change against the provided
source URLs and apply it to the appropriate data file following DECUR's schema.`;
      break;
    default:
      schemaSkeleton = `\`\`\`json\n${JSON.stringify(payload, null, 2)}\n\`\`\``;
      checklist = '- [ ] Review payload and implement according to relevant schema';
      promptInstructions = 'Review the payload below and implement the data point following DECUR schema rules.';
  }

  return `# DECUR Implementation Brief: ${c.title}

**Type:** ${typeLabel}
**Contribution ID:** \`${c.id}\`
**Submitted by:** ${submitter} on ${submittedDate}
**Approved by:** ${reviewer} on ${approvedDate}

---

## Instructions for Claude

${promptInstructions}

**Reference files for this session:**
- \`CLAUDE.md\` - canonical schema rules, field constraints, registration steps
- \`data/key-figures/registry.ts\` - check before setting associated_people IDs
- \`data/network-graph.ts\` - add relationship edges after implementing the profile
- \`data/key-figures/index.json\` - add the index entry

---

## Submitted Data

${Object.entries(payload)
  .filter(([key]) => key !== 'submitter_note')
  .map(([key, value]) => {
    const label = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
    if (Array.isArray(value)) {
      const items = value.map(v => `  - ${String(v)}`).join('\n');
      return `**${label}:**\n${items}`;
    }
    return `**${label}:** ${String(value ?? '(none)')}`;
  })
  .join('\n\n')}

${c.submitter_note ? `**Submitter Note:**\n> ${c.submitter_note}` : ''}

${c.reviewer_note ? `**Reviewer Note:**\n> ${c.reviewer_note}` : ''}

---

## Source URLs to Research

${sourcesList(sourceUrls)}

---

${checklist}

---

## Target Schema (pre-filled where possible)

${schemaSkeleton}

---

## After Implementation

1. Register the profile in \`data/key-figures/registry.ts\` (figures only)
2. Add the index entry to \`data/key-figures/index.json\` (figures only)
3. Add relationship edges to \`data/network-graph.ts\`
4. Update \`pages/sources.tsx\` with source attribution
5. Run \`npm run check\` to verify no TypeScript errors
6. Run \`node scripts/audit-data.js\` to confirm registration
7. Commit and push

*Generated by DECUR Admin Panel - Contribution ID: ${c.id}*
`;
}
