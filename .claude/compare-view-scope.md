# Comparative Profile View — Design Scope

## Problem
No side-by-side comparison of figures exists. Natural research questions — "How do Elizondo and Grusch differ in their claims?", "What do Puthoff and Davis have in common?", "What's the credibility spread between Lacatski and Bigelow?" — require the user to hold information from two separate browser tabs simultaneously.

---

## Solution

A `/compare` page with URL query params (`?a=[id]&b=[id]`) that renders two profiles side-by-side with automatic detection of shared connections and organizations.

### URL Structure
```
/compare?a=luis-elizondo&b=david-grusch
```
Fully shareable and bookmarkable. Both params are required; missing either shows a figure-picker state.

---

## Entry Points

### 1. Profile page "Compare" button
Each figure profile page gets a **"Compare with..."** button in the header alongside the existing BookmarkButton. Clicking it opens a modal/popover with a searchable figure list. Selecting a figure navigates to `/compare?a=[current-id]&b=[selected-id]`.

### 2. Direct `/compare` page
When neither `?a` nor `?b` param is present, the page shows two side-by-side figure picker panels. Each panel is a searchable dropdown backed by `index.json`. A "Compare" CTA button activates once both are selected.

### 3. Nav link
Add `{ title: 'Compare Figures', path: '/compare' }` to the Data dropdown in Header.tsx.

---

## Data Loading Strategy

Use `getServerSideProps` to read both profile JSONs by ID at request time via the registry (`data/key-figures/registry.ts`). This avoids client-side loading flicker and works for both Tier 1 (generic JSON) and Tier 2 (bespoke) figures — all profiles share the same top-level keys (`profile`, `associated_people`, `disclosures`, `credibility`).

```ts
export async function getServerSideProps({ query }) {
  const { a, b } = query;
  const profileA = a ? registry[a] : null;
  const profileB = b ? registry[b] : null;
  return { props: { profileA: profileA ?? null, profileB: profileB ?? null } };
}
```

---

## Page Layout

### State: Both figures selected
Two-column layout (50/50 on desktop, stacked on mobile) with a sticky header row showing each figure's name, primary role, and organization badges. Sections flow vertically:

| Section | What's shown |
|---|---|
| **Identity** | Name, summary (first 2 sentences), born, service period, clearance |
| **Roles** | Bulleted role list side-by-side |
| **Organizations** | Org badges — shared orgs highlighted in a distinct color |
| **Timeline** | Merged chronological list; each event is tagged A, B, or both (if overlapping years) |
| **Shared Connections** | `associated_people[].id` intersection — figures both profiles reference |
| **Disclosures** | Count by type (congressional, interview, article, etc.) as a small bar comparison |
| **Credibility Signals** | Supporting/contradicting counts side-by-side; no full text to keep it scannable |

### Shared Connection Detection
- **Organizations**: case-insensitive string match against `profile.organizations[]`
- **People**: `associated_people[].id` set intersection between the two profiles
- Shared items render with a `ring-2 ring-primary` highlight or a small "shared" badge

### State: One or zero figures selected
Clean picker UI with two panels. Each panel has:
- A text input (Fuse.js filter against `index.json`)
- A scrollable dropdown list showing name + role
- Selected state shows the figure name with a clear/swap button

---

## What Is NOT Compared

Some fields don't translate well to a side-by-side format and are intentionally excluded:

- Full credibility argument text (too long — use counts instead)
- Feature tabs (AATIP, AAWSAP, five_observables — too figure-specific)
- Full source lists
- Career connection graph (too complex — link to individual profiles instead)

Each section ends with a "View full profile →" link back to the detail page.

---

## Component File

`pages/compare.tsx` — single page with inline helper components:
- `FigurePicker` — searchable select backed by index.json
- `CompareColumn` — renders one figure's data in a single column
- `SharedBadge` — small pill shown on items both figures share
- `DisclosureBar` — mini horizontal bar chart showing disclosure type breakdown

No new shared components needed; uses existing `ps.*` style constants throughout.

---

## Suggested Highlight Pairs (for testing/marketing)

| Pair | Why it's interesting |
|---|---|
| `luis-elizondo` / `david-grusch` | Both whistleblowers from different eras of the disclosure arc |
| `hal-puthoff` / `eric-davis` | SRI/DIA scientists; Davis is a direct professional successor to Puthoff |
| `james-lacatski` / `robert-bigelow` | AAWSAP government lead vs. private funder |
| `karl-nell` / `jay-stratton` | Both active-duty military involved in modern UAP task force lineage |
| `jake-barber` / `david-grusch` | Both 2023+ whistleblowers with overlapping claims |

---

## Files Changed

| File | Change |
|---|---|
| `pages/compare.tsx` | New page (primary work) |
| `components/Header.tsx` | Add "Compare Figures" to Data dropdown |
| `pages/figures/[id].tsx` | Add "Compare with..." button to profile header |

No new data files required. No changes to existing JSON schemas.

---

## Open Questions Before Implementation

1. **Swap button** — should `/compare?a=X&b=Y` show a swap icon that swaps columns? (low cost, nice UX)
2. **Mobile layout** — two stacked columns is readable but long; could offer a tab toggle (Figure A / Figure B) on mobile with a "Compare" combined-view toggle. Worth considering but not blocking.
3. **Figure picker on profile page** — modal vs. inline popover? Modal is simpler to build, popover is slicker.
