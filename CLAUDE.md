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
    NetworkGraph.tsx, TimelineOverlay.tsx
  resources/
pages/
  data.tsx, figures/[id].tsx, cases/[id].tsx, explore.tsx ...
data/
  key-figures/
    index.json           - Searchable index of all figures
    registry.ts          - Maps id -> JSON data for GenericInsiderProfile
    [id].json            - One file per profile
  cases.json, timeline.json, programs.json, glossary.json, network-graph.ts ...
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
6. **.claude/** folder:
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
- An `if` check in `InsidersList.tsx` to route to the bespoke component

**Default to Tier 1.** Only create a Tier 2 component if a figure's data cannot be reasonably expressed in the standard schema.

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
- `disclosures[].type` - must be one of: `article`, `written`, `television`, `podcast`, `congressional-testimony`, `speech`, `film`, `formal-complaint`, `declassification`.
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
If `includeInExplore: true`, add an entry to `SOURCE_CONFIG` in `components/explore/TimelineOverlay.tsx`:
```ts
'jane-smith': { label: 'Dr. Jane Smith', color: '#hexcolor' },
```
If omitted, events will appear with a default gray color.

### That's all
No component file is needed. No `if` check in `InsidersList.tsx` is needed.

---

## Writing & Copy Rules
- **No em dashes** - do not use `—` (U+2014) anywhere in UI copy, component text, or documentation. Use a regular hyphen-minus `-` or rewrite the sentence.

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
