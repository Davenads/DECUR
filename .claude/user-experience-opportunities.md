# DECUR — End-User Functionality Opportunities

**Prepared:** 2026-04-10
**Scope:** Non-redundant improvements to end-user functionality, grounded in the platform's current state and vision.

This document catalogs specific gaps and expansion opportunities across DECUR's user-facing surface. Each entry describes what currently exists, where the gap is, why it matters, and a direction for implementation. Ordered roughly by user-impact potential.

---

## 1. Collections — Complete the Loop

### What exists
The backend infrastructure for user collections is fully built:
- Supabase tables: `collections`, `collection_items`, `bookmarks`
- Public collection view page (`/collections/[id]`) renders a shareable, named list of bookmarked figures, cases, documents, and programs with user notes
- Auth system (register/login/profile) is live

### The gap
The UI entry points are entirely missing:
- No "Bookmark" button anywhere on figure, case, document, or program detail pages
- No "My Collections" section in the user profile page
- No "Create Collection" flow
- No way to discover public collections (no index or browse page)
- No way for a logged-in user to manage their bookmarks outside of direct database access

The infrastructure exists at the data layer but is invisible to every user on the platform.

### Why it matters
Collections are the primary mechanism for users to build their own research packages - grouping a set of figures, cases, and documents around a theme they care about (e.g., "crash retrieval claims", "congressional disclosure arc 2020-2024"). Without the UI hooks, this is dead functionality. Completing it would make the platform sticky for returning researchers rather than just a one-time reference.

### Implementation direction
- Add a "Bookmark" button to the header/sidebar of every detail page (figure, case, document, program) - saves to the user's default collection or opens a "add to collection" modal
- Profile page: "My Collections" tab showing all collections with item counts, public/private toggle, and a "Create New Collection" button
- Collection management page: reorder items, add notes per item, rename/delete collection
- A browsable "Public Collections" index (either a dedicated page or a section in `/data`) - shows community-curated research bundles

---

## 2. Faceted / Compound Search Filtering

### What exists
Full-text search via Fuse.js (`/search`) indexes all 8 content types with configurable weighting. Results are grouped by type with filter pills to narrow by content category.

### The gap
Search is keyword-driven and single-dimensional. There is no way to combine criteria:
- "Show me Tier-1 cases from 1970-1999 with linked declassified documents"
- "Show me figures who gave congressional testimony AND held TS/SCI clearance"
- "Show me programs that are active AND connected to David Grusch"
- "Show me timeline events tagged with 'nuclear' between 1960-1980"

Users researching a specific angle - say, crash retrieval programs connected to intelligence figures - must manually navigate multiple pages and build the cross-reference in their head.

### Why it matters
DECUR's value proposition is being the most structured, interconnected UAP archive available. Structured data without structured query capability leaves most of that value locked. Researchers don't want to browse - they want to interrogate.

### Implementation direction
A dedicated **Advanced Search / Filter** view (or an expanded search page) with:
- **For Cases:** Evidence tier (Tier 1/2/3), date range, location/country, witness type (military/government/civilian/aviation), linked documents toggle
- **For Figures:** Role type (insider/pilot/official/scientist/journalist), disclosure type (congressional-testimony/academic-paper/television), organizational affiliation, service period range
- **For Programs:** Status (Active/Defunct/Classified/Unknown), parent agency, connected figure
- **For Documents:** Issuing authority, document type, date range, classification status
- **For Timeline:** Date range slider, category multi-select (Government Action, Sighting, Legislation, etc.)
- Results should be rendered in the same card format as the main data page
- Filters should be URL-encoded so filtered views are shareable/bookmarkable

---

## 3. Shareable / Deep-Linked Visualization States

### What exists
The Explore page (`/explore`) has five powerful interactive visualizations:
- Relationship Network (force-directed graph)
- Claims Corroboration Graph (bipartite)
- Timeline Overlay (swimlane by figure/case)
- EventFrequencyChart + era-based timeline filtering
- Incident Map with tier-based filtering
- Program Lineage, Oversight Hierarchy, Congressional Disclosure (flow diagrams)
- Evidence Tier Flow (kanban)

### The gap
None of these visualization states are persisted in the URL. When a user:
- Filters the Claims graph to "Verified" status and the "crash-retrieval" category
- Focuses the network on a specific cluster of nodes
- Selects a specific era on the frequency chart to filter the timeline

...there is no way to share that configuration with another person or bookmark it to return to later. Each visit to `/explore` resets to defaults. This makes the most powerful part of the platform ephemeral.

### Why it matters
Visualizations are the differentiator that makes DECUR more than a static wiki. If researchers can share a specific network view that makes an argument - say, showing the web of connections between AATIP personnel and crash retrieval programs - that becomes a first-class research output, not just an interactive toy.

### Implementation direction
- URL parameter serialization for all major visualization states:
  - `/explore?view=claims&status=verified&category=crash-retrieval`
  - `/explore?view=network&focus=luis-elizondo&depth=2`
  - `/explore?view=timeline&era=2000-2019&figures=grusch,elizondo`
  - `/explore?view=map&tier=1`
- "Copy Link" button on each visualization panel (copies the current state URL)
- "Share" button for social/clipboard sharing
- All parameters must be parsed on load and applied before first render

This is primarily a state management task - no new visualization components needed.

---

## 4. What's New / Recently Added Feed

### What exists
The platform has no mechanism for returning users to discover new content. The homepage stat widget shows total counts but not changes over time. The Sources page documents provenance but not recency.

### The gap
DECUR is an active, growing archive in a domain where new disclosures are ongoing. A researcher who visited two months ago has no efficient way to see what profiles were added, what cases were updated, what new documents were added to the archive, or what timeline events were added since their last visit.

### Why it matters
The UAP disclosure landscape is actively evolving (congressional hearings, new testimony, declassifications). DECUR's value is partly in tracking that evolution. Without a recency signal, the platform reads as a static snapshot rather than a living research resource - which undersells what it actually is.

### Implementation direction
- Add a `date_added` metadata field to the JSON schemas for figures, cases, documents, and programs (ISO date string, added at time of creation, not modified on QA edits)
- A **"Recently Added"** section on the homepage (below the Research Areas cards) showing the 4-6 most recently added items across all categories, with type badges and dates
- A `/what-is-new` or `/recent` page (linked from the nav or footer) showing a full chronological feed of added content with filtering by category
- Optional: an RSS/Atom feed for power users who use feed readers

---

## 5. Comparative Profile View

### What exists
Figure detail pages render comprehensive individual profiles. Cross-links at the bottom of each profile show related cases and documents. The `associated_people` tab on each profile lists connected figures with relationship descriptions.

### The gap
There is no way to view two or more figures side by side on the same dimensions. To compare, say, Luis Elizondo and David Grusch on their disclosure timelines, clearance history, organizational affiliations, and credibility assessments, a user must navigate between two separate pages and hold both in memory.

This is especially limiting for the 15+ figure pairs who share significant organizational history (Elizondo/Grusch, Lacatski/Bigelow, Hynek/Ruppelt, etc.) - pairs where comparison is the natural research question.

### Why it matters
Scientific rigor means being able to evaluate corroborating and diverging accounts. A comparison view doesn't just improve usability - it serves the platform's core analytical function by making it possible to visually assess where two witnesses agree, where their timelines overlap, and where their claims differ.

### Implementation direction
- A **Compare** page (`/compare?a=luis-elizondo&b=david-grusch`) that renders two figure summaries side by side in a fixed-column layout
- Shared schema fields rendered in parallel rows: name, roles, service period, organizations, clearance, key_events (aligned by year), disclosure types (compared as tag clouds or timelines), credibility assessment (two CredibilityBalance components side by side)
- Entry point: a "Compare with..." dropdown or button on individual figure profile pages
- Limit to 2 figures at a time for initial implementation; 3-4 could be a later expansion
- A "Share Comparison" button that copies the URL with both IDs encoded

---

## 6. Contribution Pipeline Visibility

### What exists
The Contribute section (`/contribute`) allows users to submit new figures, cases, timeline events, and corrections via a structured form. A confirmation page (`/contribute/submitted`) acknowledges receipt.

### The gap
After submission, contributions disappear entirely from the user's perspective. There is:
- No "My Submissions" view showing pending, accepted, or rejected contributions
- No status updates or feedback to the contributor
- No indication to the platform admin of the submission queue
- No mechanism for the contributor to supplement or clarify their submission after the fact

This creates a dead-end experience that discourages future contributions. Users have no reason to trust that their submission was acted on.

### Why it matters
DECUR's data quality depends on the community surfacing gaps and corrections. The contribute flow that exists suggests this was part of the original vision. Closing the feedback loop would make contributions feel meaningful rather than shouting into a void.

### Implementation direction
- For authenticated users: a **"My Contributions"** tab in the profile page showing all past submissions with a status badge (Pending Review / Accepted / Declined / Needs Clarification)
- Status field stored in Supabase against the submission record, updated by admin
- Email notification when a submission's status changes (leverages existing auth email setup)
- A brief review note from admin when declining or requesting clarification
- For anonymous submissions: a reference number shown on the confirmation page with a `/contribute/status/[ref]` lookup page

---

## 7. Timeline Custom Date Range + Multi-Criteria Overlay

### What exists
The Timeline page (`/timeline`) displays 1,800+ events. The Explore page shows an EventFrequencyChart where clicking a bar filters events to a selected era (five predefined eras: pre-1945, 1945-1969, 1970-1999, 2000-2019, 2020-Now). The TimelineOverlay in Explore shows swimlane views of figure and case events.

### The gap
Three limitations:
1. **Era granularity is coarse.** Five predefined buckets are insufficient for researchers focused on a specific window (e.g., 1994-1998, or the six months around the August 2022 NDAA passage).
2. **No multi-criteria filtering on the main timeline.** Users cannot combine a date range with a category filter (e.g., "Government Actions between 1995-2005" or "Sightings involving military witnesses post-2017").
3. **The swimlane overlay in Explore and the main timeline are entirely disconnected.** The TimelineOverlay (with its figure swimlanes and case markers) is only accessible as one panel in the Explore visualizations - it cannot be opened from the main Timeline page as an enrichment layer.

### Why it matters
The 1,800-event timeline is one of DECUR's most impressive data assets. Its full analytical value is only accessible to users who manually scroll through thousands of entries or accept coarse predefined filters. More precise temporal querying - especially when combined with category filtering - would make the timeline a genuine research tool rather than a scrollable list.

### Implementation direction
- **Date range slider** on the Timeline page: two-handle slider spanning 1561-present, with year input fields for precision
- **Multi-select category filter pills** (replacing or augmenting the current era bar click): Government Action, Sighting, Legislation, Scientific Study, Disclosure, etc.
- **"Open in Swimlane View"** button on the Timeline page that opens the TimelineOverlay visualization pre-filtered to the current date range and selected categories
- Keep the existing EventFrequencyChart era-click behavior as a quick shortcut to the date range slider

---

## 8. Credentialed Witness / Evidence Tier Discovery Mode

### What exists
Each case has an evidence tier (Tier 1/2/3) assigned, witness lists with credential types, and an Assessment tab with supporting/contradicting arguments. The EvidenceTierFlow on the Explore page shows a kanban-style view of all cases organized by tier. The Incident Map filters by tier.

### The gap
There is no way to browse the archive from the perspective of a specific evidence type or witness credential. A researcher who specifically wants to understand the landscape of:
- Cases with radar corroboration + military eyewitness + official investigation (multiple simultaneous criteria)
- Cases where the key witness was a commercial airline pilot
- All Tier-1 cases in chronological order with their key witness type visible at a glance

...has no entry point for that inquiry. The EvidenceTierFlow shows tier but not witness types. The map shows tier but no witness details. The case list on `/data` is not filterable at all.

### Why it matters
Evidence tier and witness credential type are the two most analytically important attributes on each case - they directly determine how seriously to weight each incident in the broader evidentiary picture. Surfacing these as first-class filter dimensions would make the platform genuinely useful for building an evidence-based picture of the phenomenon.

### Implementation direction
- On the `/data` Cases panel: add filter pills for Tier (1/2/3), witness type (Military / Government Official / Commercial Aviation / Scientific / Civilian), and date range
- On the Explore Cases tab (EvidenceTierFlow): add witness-type breakdown within each tier column (color-coded dots or mini-badges per case card)
- A new **"Evidence Summary"** view (could live as a sub-tab on the Explore Cases section): a table view of all 34 cases with sortable columns: Tier, Date, Location, Primary Witness Type, Evidence Types Present, Linked Documents count, Linked Figures count. Clicking a row navigates to the case detail.

---

## Summary Table

| # | Feature | Current State | Effort | User Impact |
|---|---|---|---|---|
| 1 | Collections - complete the UI loop | Backend built, UI missing | Medium | High - makes the platform sticky |
| 2 | Faceted / compound search filtering | Keyword-only Fuse.js search | High | High - unlocks the structured data |
| 3 | Shareable visualization states | No URL state persistence | Medium | High - makes Explore outputs shareable |
| 4 | What's New / recently added feed | No recency signal anywhere | Low | Medium - improves returning user value |
| 5 | Comparative profile view | Navigation only, no side-by-side | Medium | Medium - serves analytical use cases |
| 6 | Contribution pipeline visibility | Dead-end after submit | Medium | Medium - closes community feedback loop |
| 7 | Timeline date range + multi-filter | Coarse 5-era click filter only | Medium | Medium - unlocks the timeline dataset |
| 8 | Evidence tier discovery mode | No case-level filter in /data | Low-Medium | Medium - improves case research UX |

---

## What's Not Included (and Why)

These were considered and excluded as redundant with existing features:
- **Mobile-first redesign** - the platform's complexity (force graphs, flow diagrams) makes desktop the appropriate primary target; mobile is a rendering challenge, not a functionality gap
- **AI-powered summarization** - would shift the platform's identity away from primary source fidelity, which is central to the mission
- **User ratings/voting on credibility** - the credibility assessments are editorially maintained by design; crowd-sourced voting would undermine methodological rigor
- **Social features (comments, follows)** - outside scope of a research archive; the Contribute flow is the appropriate community mechanism
