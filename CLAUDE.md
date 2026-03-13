# DECUR Project Guidelines

## Project Overview
DECUR (Data Exceeding Current Understanding of Reality) is a Next.js application for exploring UAP/NHI phenomena data with a component-based architecture using Tailwind CSS. The platform focuses on cataloging and analyzing unconventional scientific data, particularly Dan Burisch's research, while maintaining scientific rigor and methodological transparency.

## Development Commands
```bash
npm run dev        # Start development server
npm run build      # Build production version
npm run start      # Start production server
npm run lint       # Run ESLint
npm run typecheck  # Run TypeScript type checking
npm run check      # Run both lint and typecheck
```

## Key Files to Reference
When working with this project, prioritize these files for context:

1. **CLAUDE.md** - Essential development commands and code style guidelines
2. **.claude/** folder - Detailed documentation:
   - `code-structure.json` - Component relationships and data flows
   - `architecture-overview.md` - System design documentation
   - `component-registry.json` - Component details and usage examples
   - `context-query-examples.md` - Examples for querying context

## Efficient Search Strategies

### For Code Implementation Questions
- First search components in the relevant subdirectory (`components/data/` or `components/resources/`)
- Reference `component-registry.json` for component props and usage examples
- Check `code-structure.json` for component relationships

### For Architecture Questions
- Refer to `architecture-overview.md` for system design patterns
- Consult `code-structure.json` for data flow information

### For Style Questions
- Look at `tailwind.config.js` for theme configuration
- Follow style guidelines in CLAUDE.md

## Project Structure
```
components/         - React components
  data/            - Data visualization components
  resources/       - Resource and glossary components
pages/             - Next.js pages
public/            - Static assets
styles/            - CSS styles
.claude/           - Claude AI context files
ytdl/              - YouTube transcript processing utilities
```

## Domain-Specific Context
This platform organizes research into several key areas:
- **Extraterrestrial Entities**: P-45s, P-52s, and Orions documentation
- **Timeline Mechanics**: Timeline 1 vs Timeline 2 theory, Looking Glass technology
- **Project Lotus**: Ganesh particles, Shiva portals, cellular transformation research
- **Medical Research**: J-Rod neuropathology, genetic modifications, xenograft studies
- **Historical Incidents**: Majestic-12 involvement, key events and locations

## Writing & Copy Rules
- **No em dashes** -- do not use `—` (U+2014) anywhere in UI copy, component text, or documentation. Use a regular hyphen-minus `-` or rewrite the sentence instead.

## ufotimeline.json Data Rules
- **Never use a `ufotimeline.com` URL as `article_url`** in ufotimeline.json entries. `article_url` must point to the final destination (Amazon, YouTube, FBI Vault, archive.org, etc.).
- `source_url` may remain as the ufotimeline.com permalink for reference/attribution.
- When adding new entries that were sourced from ufotimeline, always populate `article_url` directly from the ufotimeline page's outbound CTA link ("On Amazon", "View More", "Read Article", etc.).
- If no outbound link exists, leave `article_url` as `null` -- the component falls back to `source_url`.
- To backfill missing `article_url` values for media entries, run: `node scripts/scrape-media-article-urls.js`

## Code Style Guidelines
- **Component Structure**: Functional components with TypeScript and hooks
- **Naming**: PascalCase for components, camelCase for functions/variables
- **Imports**: Group imports: React, Next.js, components, styles
- **Component Props**: Define TypeScript interfaces for all props
- **TypeScript**: Use strict type checking, avoid `any` type when possible
- **Styling**: Use Tailwind CSS with color variables from tailwind.config.js
- **Error Handling**: Try/catch for async operations, fallback UI for errors
- **File Organization**: Follow existing patterns in components directory
- **State Management**: React hooks for local state, page-level state for shared data

## TypeScript Guidelines
- Use interfaces for object shapes (props, state, etc.)
- Define explicit return types for functions
- Use React component types (FC, FunctionComponent) for components
- Use type aliases for union types and complex types
- Use generics for reusable components and functions
- Avoid using the `any` type when possible
- Make use of TypeScript's utility types (Partial, Omit, etc.)

## Important Project Patterns
- Pages use component state to manage which subcomponents to render
- Components are organized by domain/feature
- Styling is done with Tailwind CSS utility classes
- Use the existing pattern of functional components with hooks
- Focus on organizing well-documented research aspects with clear visualization
- Start with static diagrams before implementing interactive tools

## Adding a New Key Figure

To add a new profile to the Key Figures section (`?category=key-figures`):

### 1. Create the profile JSON
Create `data/insiders/[id].json` following the standard schema:
```json
{
  "profile": { "id", "name", "aliases", "born", "died", "roles", "service_period",
               "organizations", "clearance", "summary", "education", "early_career",
               "key_events": [{ "year": "YYYY", "event": "..." }] },
  "associated_people": [{ "id", "name", "role", "relationship" }],
  "disclosures": [{ "date", "type", "title", "outlet", "interviewer", "notes" }],
  "sources": [{ "title", "url", "type", "notes" }]
}
```
An optional feature section can be added at the top level (e.g., `"aawsap": {...}`, `"major_investigations": [...]`). The `GenericInsiderProfile` component auto-detects and renders it as a tab.

### 2. Register the profile
Add one line to `data/insiders/registry.ts`:
```ts
import [name]Data from './[id].json';
// ...
'[id]': [name]Data,
```

### 3. Add the index entry
Add an entry to `data/insiders/index.json`:
```json
{
  "id": "[id]",
  "name": "Full Name",
  "aliases": [],
  "role": "Primary role description",
  "period": "YYYY-YYYY",
  "affiliation": "Primary organization",
  "summary": "2-3 sentence summary",
  "status": "detailed",
  "tags": ["tag1", "tag2"],
  "data_file": "[id].json",
  "type": "insider | journalist | pilot | scientist | official | executive",
  "includeInExplore": true
}
```

### 4. Add Explore overlay color (optional)
If `includeInExplore: true`, add an entry to `SOURCE_CONFIG` in `components/explore/TimelineOverlay.tsx`:
```ts
'[id]': { label: 'Full Name', color: '#hexcolor' },
```
If omitted, the figure's events will appear in the overlay using a default gray color.

### That's all
No component file is needed. No `if` check in `InsidersList.tsx` is needed. The `GenericInsiderProfile` renderer handles all standard profiles automatically.

Bespoke components (only warranted for profiles with fundamentally different tab structures, like Dan Burisch) require the additional step of creating a dedicated component and adding an `if` check in `InsidersList.tsx`.

## Platform Architecture Priorities
1. **Home**: Clean landing page with mission statement and navigation
2. **Data**: Core focus with streamlined categories and visualization
3. **Resources**: Curated materials, transcripts, and glossary
4. **About/Contact**: Simple contact form and project information

When exploring code or creating new features, start by understanding related components using the `.claude` documentation to navigate the codebase efficiently.

## Playwright Integration for Component Testing

### Component Testing Strategy

**Layout & Navigation Components:**
- **Header.tsx**: Test dropdown menus (`data`, `resources`), mobile responsive behavior, active states for current page
- **DataNavigation.tsx**: Test expandable sections (`whistleblowers`, `entities`, `technologies`, `programs`), category selection state changes
- **SearchBar.tsx**: Test search functionality, input handling, and search callbacks
- **Layout.tsx**: Test consistent rendering across all pages, title prop handling

**Data Components:**
- **EntityProfiles.tsx**: Test entity data display, P-45/P-52/Orions profiles, large dataset performance
- **TimelineConcepts.tsx**: Test timeline visualization interactions, Looking Glass technology display
- **LotusFindings.tsx**: Test tabbed interface (`overview`, `ganesh`, `shiva`, `cellular`)

**Resource Components:**
- **ResourceList.tsx**: Test material vs transcript category switching, resource filtering
- **Glossary.tsx**: Test alphabetical indexing, term lookups, grouped terms display

### Page-Level Testing Patterns

**State-Driven Pages:**
- **data.tsx**: Test URL query parameter integration (`?category=entities`), activeCategory state management, renderContent() switching
- **resources.tsx**: Test activeTab state management between `materials`/`transcripts`/`glossary`

**Static Pages:**
- **index.tsx**: Test landing page elements, mission statement, navigation links
- **about.tsx**: Test static content rendering, contact information

### DECUR-Specific Test Scenarios

**Navigation Testing:**
```typescript
// Test hierarchical navigation in DataNavigation
await page.click('[data-testid="whistleblowers-section"]');
await page.click('[data-testid="dan-burisch-link"]');
expect(page.locator('[data-category="entities"]')).toBeVisible();

// Test Header dropdown navigation
await page.click('[data-testid="data-dropdown-trigger"]');
await page.click('[data-testid="nav-nhi-link"]');
expect(page.url()).toContain('/data?category=entities');
```

**Component State Testing:**
```typescript
// Test data category switching
await page.click('[data-testid="data-nav-entities"]');
expect(page.locator('[data-testid="entity-profiles"]')).toBeVisible();
await page.click('[data-testid="data-nav-lotus"]');  
expect(page.locator('[data-testid="lotus-findings"]')).toBeVisible();
expect(page.locator('[data-testid="entity-profiles"]')).not.toBeVisible();
```

**Responsive Design Testing:**
```typescript
// Test mobile navigation dropdown behavior
await page.setViewportSize({ width: 375, height: 667 });
await page.click('[data-testid="mobile-menu-toggle"]');
await page.click('[data-testid="mobile-data-dropdown"]');
expect(page.locator('[data-testid="mobile-nav-menu"]')).toBeVisible();
```

### Integration Points

**URL Query Parameter Testing:**
- Test `/data?category=entities` → EntityProfiles rendering
- Test `/data?category=timelines` → TimelineConcepts rendering  
- Test `/data?category=lotus` → LotusFindings rendering
- Test `/resources?tab=materials` → ResourceList with materials
- Test browser back/forward navigation with state preservation

**Component Communication Testing:**
- Test DataNavigation `setActiveCategory` → Data page component rendering
- Test Header dropdown clicks → Page navigation with correct query params
- Test responsive state changes (desktop ↔ mobile)

**TypeScript Interface Testing:**
- Test `CategoryType` constraints ('entities' | 'timelines' | 'lotus' | 'whistleblowers')
- Test component props match defined interfaces
- Test state type safety (activeCategory, expandedSections)

### Performance Testing Scenarios

**Large Dataset Components:**
- Test EntityProfiles with multiple entity types (P-45, P-52, Orions)
- Test Glossary with extensive UAP/NHI terminology
- Test TimelineConcepts rendering with complex timeline data

**State Management Testing:**
- Test useState updates in data.tsx don't cause unnecessary re-renders
- Test dropdown state management in Header.tsx with multiple concurrent dropdowns
- Test expandedSections state in DataNavigation.tsx with nested interactions

### Testing Data-Testid Conventions

**Consistent Naming Pattern:**
- Pages: `[page-name]-page` (e.g., `data-page`, `resources-page`)
- Navigation: `nav-[item-name]` (e.g., `nav-entities`, `nav-lotus`)
- Components: `[component-name]` (e.g., `entity-profiles`, `lotus-findings`)
- Interactive Elements: `[action]-[target]` (e.g., `toggle-dropdown`, `select-category`)

**Component-Specific Testids:**
- DataNavigation: `data-nav-[category]`, `expand-[section]`
- Header: `[dropdown-name]-dropdown`, `mobile-[element]`
- Data Components: `[component-name]`, `[component-name]-[tab/section]`