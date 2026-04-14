# DECUR Project Guidelines

## Project Overview
DECUR (Data Exceeding Current Understanding of Reality) is a Next.js application for exploring UAP/NHI phenomena data with a component-based architecture using Tailwind CSS. The platform focuses on cataloging and analyzing insider testimony, documented cases, and associated research while maintaining scientific rigor and methodological transparency.

## Development Commands
```bash
npm run dev        # Start development server
npm run build      # Build production version
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
npm run check      # Run both lint and typecheck
```

## UFOSINT Phase 3 - Self-Hosting Checklist

Phase 3 moves the UFOSINT sightings database off the external `ufosint.com` API into our own Supabase table (`ufosint_sightings`).

**Status (as of 2026-04):** Tested on `decur-dev`. Not yet applied to production.

### When merging Phase 3 to production, do the following:

1. **Apply migrations to prod Supabase** (`iyvngosoyzptliytlcov`):
   ```bash
   npx supabase link --project-ref iyvngosoyzptliytlcov
   echo "Y" | npx supabase db push
   # Applies 004_ufosint_sightings.sql + 005_widen_sightings_state_country.sql
   ```

2. **Run the import against prod** via env vars (never hardcode keys in the script):
   ```bash
   rm data/ufosint/import-checkpoint.json
   IMPORT_SUPABASE_URL=https://iyvngosoyzptliytlcov.supabase.co \
   IMPORT_SERVICE_KEY=<prod-service-role-key> \
   node scripts/import-ufosint-to-supabase.mjs
   # Resume as needed (same env vars):
   IMPORT_SUPABASE_URL=https://iyvngosoyzptliytlcov.supabase.co \
   IMPORT_SERVICE_KEY=<prod-service-role-key> \
   node scripts/import-ufosint-to-supabase.mjs --resume
   ```
   Get the prod service role key from: Supabase dashboard → `iyvngosoyzptliytlcov` → Settings → API

3. **Activate in prod env** (Vercel dashboard → Environment Variables):
   ```
   UFOSINT_USE_SUPABASE=true
   ```

4. **Re-link CLI back to decur-dev after**:
   ```bash
   npx supabase link --project-ref bosszjlkhglatuashtbd
   ```

### To activate locally (after import completes on decur-dev):
Uncomment in `.env.local`:
```
UFOSINT_USE_SUPABASE=true
```

## Data Audit Script
**Before any gap analysis or "what do we have?" research, always run the audit script first** to get a deterministic, exact inventory. Never rely on agent summarization of large JSON files for counts - it will produce inaccurate numbers.

```bash
node scripts/audit-data.js              # Summary table + counts for all categories
node scripts/audit-data.js --ids        # Same + full ID list for every category
node scripts/audit-data.js --category figures   # Single category only
node scripts/audit-data.js --ids --category cases
```

The script reads directly from the source JSON files and prints exact counts. Use the output as the ground-truth baseline when determining what is missing.

## Project Structure
```
components/
  data/
    key-figures/         - Generic + bespoke profile components
      GenericInsiderProfile.tsx  - Renders all standard JSON-schema profiles
      burisch/           - Bespoke tabs for Dan Burisch (unique schema)
    shared/
      profileStyles.ts   - Centralized Tailwind class constants (ps.*)
      ProfileShell.tsx   - Shared tab-nav shell for all profiles
      CredibilityBalance.tsx, ArgumentsSection.tsx, etc.
    DocumentsList.tsx, InsidersList.tsx, CasesList.tsx ...
  explore/
    NetworkGraph.tsx             - Force-directed relationship graph (react-force-graph-2d)
    ClaimsCorroborationGraph.tsx - Bipartite claims/figures graph (react-force-graph-2d)
    TimelineOverlay.tsx          - Swimlane timeline overlay (Recharts)
    EventFrequencyChart.tsx      - Event frequency by decade (Recharts)
    ProgramLineageFlow.tsx       - Program succession DAG (@xyflow/react)
    OversightHierarchyFlow.tsx   - Org authority hierarchy (@xyflow/react)
    EvidenceTierFlow.tsx         - Cases by evidence tier (@xyflow/react)
    CongressionalDisclosureFlow.tsx - Congressional disclosure timeline (@xyflow/react)
    CaseMap.tsx                  - Geographic case map
  resources/
pages/
  data.tsx, figures/[id].tsx, cases/[id].tsx, explore.tsx ...
  timeline.tsx, search.tsx, blue-book.tsx, sources.tsx ...
data/
  key-figures/
    index.json           - Searchable index of all figures
    registry.ts          - Maps id -> JSON data for GenericInsiderProfile
    [id].json            - One file per profile (~60 profiles)
  cases.json, timeline.json, programs.json, glossary.json
  network-graph.ts       - Relationship network nodes and edges
  claims-network.ts      - Bipartite claims graph data (aggregated from profile JSONs)
  org-hierarchy.json     - Oversight hierarchy nodes and edges
  contractors.json       - Private defense contractor profiles
  documents.json, resources.json
public/                  - Static assets
styles/                  - Global CSS
.claude/                 - Claude AI context files
ytdl/                    - YouTube transcript processing utilities
```

## Key Files to Reference
When working on this project, prioritize these files for context:

1. **CLAUDE.md** - Development commands, schema rules, and code style
2. **`components/data/shared/profileStyles.ts`** - Shared Tailwind constants (`ps.*`)
3. **`components/data/key-figures/GenericInsiderProfile.tsx`** - Standard profile renderer
4. **`data/key-figures/index.json`** - All registered figures
5. **`data/key-figures/registry.ts`** - id -> JSON mapping
6. **`data/network-graph.ts`** - Relationship network node/edge definitions
7. **`data/claims-network.ts`** - Claims corroboration graph data; aggregates `claims[]` from all profiles with `category` fields; defines `CATEGORY_MAP` and canonical category normalization
8. **.claude/** folder:
   - `code-structure.json` - Component relationships and data flows
   - `architecture-overview.md` - System design documentation

---

## Dark Mode & Shared Styles

### Always use `ps.*` constants for profile components

`components/data/shared/profileStyles.ts` exports a `ps` object with pre-built Tailwind strings that include both light and dark variants. **Never hardcode bare Tailwind classes in profile components when a `ps.*` constant exists** - this keeps dark mode consistent globally and ensures a single edit propagates everywhere.

```ts
import { ps } from '../shared/profileStyles';

// Correct - uses shared constant
<div className={ps.infoCard}>
<p className={ps.body}>
<span className={ps.label}>

// Wrong - hardcoded without dark variant
<div className="bg-gray-50 rounded-lg p-4">
<p className="text-sm text-gray-700">
```

**Available constants:**

| Constant | Purpose |
|---|---|
| `ps.infoCard` | Gray-tinted card (service, clearance, orgs) |
| `ps.infoCardSm` | Same, smaller padding |
| `ps.borderCard` | Outlined card, no tint |
| `ps.borderCardLg` | Outlined card, larger padding |
| `ps.borderCardNoP` | Outlined card, no padding (use for tables) |
| `ps.accentBox` | Primary-color tinted accent box |
| `ps.accentBoxLg` | Same, larger padding |
| `ps.h3` | Section heading (lg, semibold) |
| `ps.h4` | Sub-section label (uppercase, tracking) |
| `ps.h4Inline` | Inline label (same weight, no uppercase) |
| `ps.body` | Standard body text |
| `ps.bodyMuted` | Slightly muted body text |
| `ps.value` | Data value text (slightly brighter) |
| `ps.meta` | xs meta / secondary text |
| `ps.muted` | xs muted text (labels, dates) |
| `ps.label` | xs uppercase tracking label |
| `ps.listItem` | Flex list item row |
| `ps.divider` | Horizontal rule |
| `ps.timelineLine` | Timeline container with left border |
| `ps.timelineDot` | Filled circle dot on timeline |
| `ps.filterPill` | Inactive filter pill button |
| `ps.filterPillActive` | Active filter pill button |

**To extend:** Add new constants to `profileStyles.ts` before introducing new ad-hoc class strings in components.

---

## Two-Tier Profile System

Profiles use one of two rendering approaches:

### Tier 1 - Generic (standard schema, no TSX file needed)
Most profiles. `GenericInsiderProfile.tsx` reads from `data/key-figures/[id].json` and renders Overview, Timeline, optional Feature tab, People, Disclosures, and Sources tabs automatically.

### Tier 2 - Bespoke (custom TSX component)
Only for profiles with fundamentally different tab structures (e.g., Dan Burisch, which has 10 specialized tabs). These require:
- A dedicated component directory under `components/data/`
- An entry in `BESPOKE_REGISTRY` in `pages/figures/[id].tsx`

**Default to Tier 1.** Only create a Tier 2 component if a figure's data cannot be reasonably expressed in the standard schema.

**IMPORTANT - Before editing any key figure profile JSON:** Check `BESPOKE_REGISTRY` in `pages/figures/[id].tsx` to determine if the figure uses a bespoke component. If they do, the `GenericInsiderProfile.tsx` logic (auto-tabs for sources, disclosures, etc.) does NOT apply - you must inspect and potentially update the bespoke component directly.

**Current Tier 2 bespoke profiles (as of 2026-03):**

| Figure ID | Component file |
|---|---|
| `dan-burisch` | `components/data/InsiderProfile.tsx` (+ `key-figures/burisch/` dir) |
| `bob-lazar` | `components/data/LazarProfile.tsx` |
| `david-grusch` | `components/data/GruschProfile.tsx` |
| `luis-elizondo` | `components/data/ElizondoProfile.tsx` |
| `david-fravor` | `components/data/FravorProfile.tsx` |
| `hal-puthoff` | `components/data/PuthoffProfile.tsx` |
| `garry-nolan` | `components/data/NolanProfile.tsx` |
| `karl-nell` | `components/data/NellProfile.tsx` |
| `chris-mellon` | `components/data/MellonProfile.tsx` |
| `eric-davis` | `components/data/DavisProfile.tsx` |
| `robert-bigelow` | `components/data/BigelowProfile.tsx` |
| `jacques-vallee` | `components/data/ValleeProfile.tsx` |
| `nick-pope` | `components/data/PopeProfile.tsx` |
| `jake-barber` | `components/data/BarberProfile.tsx` |
| `tim-gallaudet` | `components/data/GallaudetProfile.tsx` |

Update this table when adding new Tier 2 components.

---

## Adding a New Key Figure

### 1. Create the profile JSON
Create `data/key-figures/[id].json` following the canonical schema:

```json
{
  "profile": {
    "id": "jane-smith",
    "name": "Dr. Jane Smith",
    "aliases": ["Jane Smith", "J. Smith"],
    "born": "January 1, 1960 - Washington D.C.",
    "died": null,
    "roles": [
      "Senior Intelligence Officer, DIA",
      "Author - The Phenomenon (2021)"
    ],
    "service_period": "1985-2010 (government); 2010-present (independent research)",
    "organizations": ["Defense Intelligence Agency", "AATIP"],
    "clearance": "TS/SCI (former)",
    "summary": "Two to three sentence summary of who this person is and why they matter.",
    "education": ["M.D., Johns Hopkins, 1984", "B.S., MIT, 1980"],
    "early_career": ["Brief career note 1", "Brief career note 2"],
    "key_events": [
      { "year": "1985", "event": "Joined the DIA as a senior analyst." },
      { "year": "Jan 2017", "event": "Resigned from AATIP and began public disclosure efforts." }
    ]
  },
  "associated_people": [
    {
      "id": "luis-elizondo",
      "name": "Luis Elizondo",
      "role": "Former AATIP director",
      "relationship": "Collaborated on AATIP research from 2008-2017; both resigned in the same period citing institutional resistance."
    }
  ],
  "disclosures": [
    {
      "date": "2021",
      "type": "written",
      "title": "The Phenomenon",
      "outlet": "Publisher Name (New York)",
      "notes": "Primary written disclosure describing 20 years of government UAP research."
    },
    {
      "date": "June 2023",
      "type": "congressional-testimony",
      "title": "UAP Disclosure Act Hearing",
      "outlet": "U.S. Senate Armed Services Committee",
      "interviewer": "Sen. Kirsten Gillibrand",
      "notes": "Testified under oath that non-human intelligence has been confirmed by multiple classified programs."
    }
  ],
  "sources": [
    {
      "title": "The Phenomenon (book)",
      "url": "https://www.amazon.com/...",
      "type": "Book",
      "notes": "Primary source - first published account (Publisher, 2021)"
    }
  ]
}
```

**Canonical field rules:**
- `key_events[].year` - use `"YYYY"` or `"Mon YYYY"` (e.g. `"1994"` or `"Sep 1994"`). Never use ISO date strings like `"1994-09-16"`.
- `associated_people[]` - must include `id` (slug), `name`, `role` (one-line title), and `relationship` (narrative sentence).
- `disclosures[].type` - must be one of: `article`, `written`, `print`, `television`, `film`, `documentary`, `podcast`, `radio`, `interview`, `speech`, `congressional-testimony`, `congressional-briefing`, `formal-complaint`, `declassification`, `academic-paper`, `conference`, `symposium`, `preprint`. Adding a new type requires a corresponding entry in `components/data/shared/disclosureTypes.ts`.
- `disclosures[].notes` - use `notes`, not `description`.
- `disclosures[].title` - required; give the disclosure a short name.

**Optional feature section:** Add a top-level key for specialized data (e.g., `"aawsap": {...}`, `"major_investigations": [...]`, `"claims": [...]`). `GenericInsiderProfile` auto-detects and renders it as an extra tab. Register the key in `detectFeature()` in `GenericInsiderProfile.tsx`.

### 2. Register the profile
Add one line to `data/key-figures/registry.ts`:
```ts
import janeSmithData from './jane-smith.json';
// ...
'jane-smith': janeSmithData,
```

### 3. Add the index entry
Add an entry to `data/key-figures/index.json`:
```json
{
  "id": "jane-smith",
  "name": "Dr. Jane Smith",
  "aliases": ["Jane Smith"],
  "role": "Senior Intelligence Officer, DIA",
  "period": "1985-2010",
  "affiliation": "Defense Intelligence Agency",
  "summary": "2-3 sentence summary shown in the listing card.",
  "status": "detailed",
  "tags": ["intelligence", "dod", "aatip"],
  "data_file": "jane-smith.json",
  "type": "insider",
  "includeInExplore": true
}
```

Valid `type` values: `insider`, `journalist`, `pilot`, `scientist`, `official`, `executive`.

### 4. Add Explore overlay color (optional)
If `includeInExplore: true`, you may add an entry to `SOURCE_CONFIG` in `components/explore/TimelineOverlay.tsx` to assign a custom display label and swimlane color:
```ts
'jane-smith': { label: 'Dr. Jane Smith', color: '#hexcolor' },
```
**If omitted:** the display name resolves automatically from `data/key-figures/index.json` (the figure's `name` field), and the swimlane color defaults to gray (`#6b7280`). You only need a SOURCE_CONFIG entry if you want a shortened label (e.g. `'Sen. Smith'`) or a distinct color.

> **Do not hardcode display names in SOURCE_CONFIG that already match the index.json `name` field exactly** - that's redundant. SOURCE_CONFIG entries are for abbreviated/role-prefixed labels only.

### 5. Add Relationship Network edges (required)
All profiled figures are **auto-derived** as nodes in the Relationship Network from `index.json` - no manual node entry needed. However, you **must** add link edges to `data/network-graph.ts` or the figure will appear as an isolated island with no connections.

Append a comment block with links to the `links: []` array at the bottom of `network-graph.ts`:
```ts
// Jane Smith connections
{ source: 'jane-smith', target: 'luis-elizondo', label: 'collaborated on AATIP research 2008-2017' },
{ source: 'jane-smith', target: 'aatip',         label: 'program director' },
```

- `source` and `target` must match node `id` values exactly (registry ids for profiled figures; explicit node ids for organizations/cases/documents)
- Every new figure should have **at least 2-3 edges** to existing nodes
- Use factual, specific relationship labels - not generic descriptions

### 6. Add career_connections for a non-linear Career Network tab (required)
Without `career_connections`, the Career Network tab renders as a pure linear chain of `key_events` - identical in content to the Timeline tab. Always add a `career_connections` array to give the graph lateral branching nodes.

Add a top-level `career_connections` key to the profile JSON:
```json
"career_connections": [
  {
    "event_index": 3,
    "node_type": "person",
    "node_id": "luis-elizondo",
    "node_label": "Luis Elizondo",
    "relationship": "Collaborated on AATIP research from 2008-2017.",
    "connection_type": "professional"
  },
  {
    "event_index": 5,
    "node_type": "program",
    "node_id": "aatip",
    "node_label": "AATIP",
    "relationship": "Served as program director.",
    "connection_type": "institutional"
  }
]
```

- `event_index` is 0-based into the `key_events` array - the node branches off that point in the timeline chain
- `node_type` must be one of: `person`, `case`, `program`
- `connection_type` must be one of: `investigative`, `professional`, `institutional`
- Aim for **at least 2-3 lateral nodes** across different `event_index` values so the graph has visible branching at multiple points
- Spread nodes across different timeline points rather than clustering them at one index

### 7. Update the Data Sources page (required)
Every new key figure must have its primary research sources added to `pages/sources.tsx`. This is a **mandatory step** - the sources page is the platform's research attribution record.

**Where to insert:** Find the `{/* Key Figure Profile Sources */}` section comment and add `<SourceCard>` entries inside it.

**Component interface:**
```tsx
<SourceCard
  name="Fire in the Sky: The Walton Experience (Walton, 1993)"
  url="https://www.amazon.com/dp/1569800855"
  type="Published Book"
  typeColor="bg-purple-100 text-purple-700"
  description="Travis Walton's first-person memoir of the 1975 Snowflake, Arizona abduction. Primary source for all biographical data and event sequence."
  notes="Used for: Travis Walton."
/>
```

**Props reference:**
| Prop | Required | Notes |
|---|---|---|
| `name` | Yes | Source title, author, and year - e.g. `"The Interrupted Journey - John Fuller (1966)"` |
| `url` | Yes | Direct URL (Amazon, YouTube, archive.org, official site). Never a ufotimeline.com link. |
| `type` | Yes | e.g. `"Published Book"`, `"Television Interview"`, `"Research Archive"`, `"Congressional Record"`, `"Academic Paper"` |
| `typeColor` | Yes | Tailwind badge classes. Use `"bg-purple-100 text-purple-700"` for books, `"bg-blue-100 text-blue-700"` for interviews/video, `"bg-green-100 text-green-700"` for archives/databases, `"bg-yellow-100 text-yellow-700"` for government/official |
| `description` | Yes | 1-2 sentences: what the source is and what it contributed to the profile |
| `notes` | No | Attribution string: `"Used for: [Figure Name]."` |

**Rule:** Add one `SourceCard` per distinct source used. If the same source was used for multiple figures, add it once with `notes="Used for: Figure A, Figure B."`.

### 8. Update the What's New changelog (required)
Add an entry to the **top** of `data/changelog.json`:

```json
{
  "date": "YYYY-MM-DD",
  "category": "figure",
  "id": "jane-smith",
  "name": "Dr. Jane Smith",
  "action": "added",
  "note": "One sentence describing what was added or what changed."
}
```

**Field rules:**
- `date` - today's date in `YYYY-MM-DD` format
- `category` - one of: `figure`, `case`, `document`, `program`, `timeline`, `quote`
- `id` - the registry slug (must match the profile/case/document/program ID exactly)
- `action` - `"added"` for new entries, `"updated"` for significant updates to existing ones
- `note` - one sentence; focus on what's distinctive about this person/event (not generic "profile added")

This feeds the `/whats-new` full feed page and the "Recently Added" widget on the homepage. Skipping this step means returning users get no signal that new content exists.

### That's all
No component file is needed. No `if` check in `InsidersList.tsx` is needed.

---

## Data Sources Page (`pages/sources.tsx`)

The sources page is the platform's research attribution record. It must be kept current whenever new data is added to any category.

### When to update
- **Key figures** - Add to the `{/* Key Figure Profile Sources */}` section
- **Cases** - Add to the `{/* Documented Cases */}` section
- **Programs** - Add to the `{/* Government Programs */}` section
- **Changelog** - Also add an entry to `data/changelog.json` (see "Adding a New Key Figure" Step 8 for schema)
- **Documents** - Add to the `{/* Primary Documents */}` section
- **Glossary** - Add to the `{/* Glossary Sources */}` section

### Section structure
Each section uses `<SourceCard>` components. Find the relevant section comment in `pages/sources.tsx` and append new cards inside it. Do not create new top-level sections unless the source genuinely belongs to a new category that doesn't exist yet.

### FeaturedSource vs SourceCard
- `<FeaturedSource>` - reserved for the most significant institutional sources (NICAP, Project Blue Book, Congressional records, etc.). Use `<SourceCard>` for all individual profile/case/program sources.

### typeColor conventions
| Source type | typeColor |
|---|---|
| Published books | `"bg-purple-100 text-purple-700"` |
| TV/video/interviews | `"bg-blue-100 text-blue-700"` |
| Archives/databases | `"bg-green-100 text-green-700"` |
| Government/official | `"bg-yellow-100 text-yellow-700"` |
| Academic papers | `"bg-indigo-100 text-indigo-700"` |
| News/journalism | `"bg-orange-100 text-orange-700"` |

---

## SharedAssessmentTab Usage

`SharedAssessmentTab` has two variants. **Always use the baseline variant** (the default) when wiring a new bespoke profile's Assessment tab.

```tsx
// Correct - baseline variant (CredibilityBalance bar + bordered green/red argument cards)
<SharedAssessmentTab credibility={data.credibility} />

// Wrong - compact variant renders a plain 2-column +/- list, no balance bar, no cards
<SharedAssessmentTab credibility={data.credibility} variant="compact" />
```

The `compact` variant exists but is visually inconsistent with the rest of the platform. Do not use it in new profiles. If an existing profile is using `variant="compact"`, remove it so it falls back to `baseline`.

**Optional props (baseline only):**
- `methodologyNote` - amber box shown above the arguments (e.g. Elizondo, Mellon)
- `sources` - source cards rendered below the arguments

---

## Dynamic Architecture Conventions

Several components derive display data dynamically from `data/key-figures/index.json` and the data JSON files. **Do not bypass these patterns by adding new hardcoded lookup tables.**

### insider_connections schema (documents.json and cases.json)
Both `data/documents.json` and `data/cases.json` use a typed `InsiderConnection[]` array - not bare string arrays. When adding or editing connections:

```json
"insider_connections": [
  {
    "id": "luis-elizondo",
    "role": "AATIP director whose advocacy led directly to the UAPTF assessment",
    "note": "The UAPTF assessment is the institutionalized result of Elizondo's disclosure work."
  }
]
```

- `id` - required; must match the key figures registry slug exactly
- `role` - required; one sentence describing the figure's relationship to this specific document or case
- `note` - optional; additional context or caveat

The component (`InsiderLinksTab`) reads `role`/`note` directly from the data. **Never add new hardcoded per-ID label dicts to the component** - put the content in the JSON.

### Figure display name resolution
`TimelineOverlay.tsx` and `DocumentDetail.tsx` both auto-resolve figure display names from `data/key-figures/index.json` as a fallback. When a new figure is added to the registry, their name appears automatically in these components without any code change. A SOURCE_CONFIG entry is only needed for a custom abbreviated label or non-default color.

### Disclosure type configuration
All disclosure type labels, badge colors, and timeline dot colors are centralized in:

```
components/data/shared/disclosureTypes.ts
```

Exports: `DISCLOSURE_TYPE_LABELS`, `DISCLOSURE_TYPE_COLORS`, `DISCLOSURE_TYPE_DOT`, `disclosureLabel(type)`.

**Never define local TYPE_COLORS, TYPE_DOT, or label maps in individual components.** Both `SharedDisclosuresTab.tsx` and `GenericInsiderProfile.tsx` import from this file. If a new disclosure type is needed, add it once to `disclosureTypes.ts` and it propagates everywhere automatically.

---

## Writing & Copy Rules
- **No em dashes** - do not use `—` (U+2014) anywhere in UI copy, component text, or documentation. Use a regular hyphen-minus `-` or rewrite the sentence.
- **Document `name` fields - common name first** - the site search (Fuse.js, `threshold: 0.35`, `ignoreLocation: false`) scores matches by position in the string. If a document's common/identifying name appears late in a long academic-style title, searches for that name will score above the threshold and return no results. Always lead with the identifying common name: `"Condon Report: Scientific Study of Unidentified Flying Objects (1969)"` not `"Scientific Study of Unidentified Flying Objects (Condon Report)"`. This applies to any string field used as a Fuse.js search key (`name`, `title`, `role`, etc.).

---

## timeline.json Data Rules
- **Never use a `ufotimeline.com` URL as `article_url`** in timeline.json entries. `article_url` must point to the final destination (Amazon, YouTube, FBI Vault, archive.org, etc.).
- `source_url` may remain as the ufotimeline.com permalink for reference/attribution.
- When adding new entries that were sourced from ufotimeline, always populate `article_url` directly from the ufotimeline page's outbound CTA link ("On Amazon", "View More", "Read Article", etc.).
- If no outbound link exists, leave `article_url` as `null` -- the component falls back to `source_url`.
- To backfill missing `article_url` values for media entries, run: `node scripts/scrape-media-article-urls.js`

---

## Code Style Guidelines
- **Component Structure**: Functional components with TypeScript and hooks
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Imports**: Group imports: React, Next.js, components, styles
- **Component Props**: Define TypeScript interfaces for all props
- **TypeScript**: Use strict type checking, avoid `any` type when possible
- **Styling**: Use Tailwind CSS with color variables from `tailwind.config.js`; prefer `ps.*` constants in profile components
- **Error Handling**: Try/catch for async operations, fallback UI for errors
- **File Organization**: Follow existing patterns in the `components/` directory
- **State Management**: React hooks for local state, page-level state for shared data
- **DRY**: Before hardcoding Tailwind strings in a new component, check `profileStyles.ts` and existing shared components in `components/data/shared/`

## TypeScript Guidelines
- Use interfaces for object shapes (props, state, etc.)
- Define explicit return types for functions
- Use React component types (`FC`, `FunctionComponent`) for components
- Use type aliases for union types and complex types
- Use generics for reusable components and functions
- Avoid `any`; use `unknown` with type guards or define a proper interface
- Make use of TypeScript utility types (`Partial`, `Omit`, etc.)

---

## Domain-Specific Context
This platform organizes research into several key areas:
- **Key Figures**: Firsthand testimony from government insiders, scientists, pilots, journalists, and officials
- **Documented Cases**: High-evidence UAP incidents with structured evidence tiers, witness accounts, and competing hypotheses
- **Government Programs**: Official and private programs involved in UAP investigation, research, and disclosure (Blue Book, AAWSAP, AARO, TTSA, NICAP, and others)
- **Primary Documents**: Declassified government reports, memos, and legislative records
- **Historical Timeline**: 1,800+ events spanning 1561 to present, sourced from NICAP, UFO Timeline, OpenMinds, and Papoose Lake Archive

Note: Dan Burisch has a bespoke Tier 2 profile component (`components/data/key-figures/burisch/`) due to his unique data schema. He is one figure among many and should not be treated as the platform's primary subject.

---

## Platform Architecture Priorities
1. **Home**: Clean landing page with mission statement and navigation
2. **Data**: Core focus - Key Figures, Cases, Documents, Programs, Timeline
3. **Explore**: Interactive network graph and timeline overlay visualizations
4. **Resources**: Curated materials, transcripts, and glossary
5. **About/Contact**: Simple contact form and project information

When exploring code or creating new features, start by understanding related components using the `.claude` documentation to navigate the codebase efficiently.
