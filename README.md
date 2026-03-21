# DECUR

**Data Exceeding Current Understanding of Reality**

A structured reference archive for UAP and NHI research. DECUR catalogs insider testimony, documented incidents, primary source documents, and historical records spanning eight decades - organized for analysis, not advocacy. Qualitative data catalogued for analysis, not advocacy.

Live at [decur.org](https://decur.org)

![DECUR Home](public/screenshots/home-dark.png)

---

## What DECUR Is

DECUR does not adjudicate the truth of any claim. Every entry is documented with its source, context, and known corroborating or contradicting evidence. The platform draws from congressional testimony, FOIA-released documents, on-record interviews, and firsthand accounts.

---

## Platform Sections

### Data

The core of the platform. Accessed via the `Data` nav dropdown or directly at `/data`.

![Data - Key Figures](public/screenshots/key-figures.png)

| Category | Description |
|---|---|
| Historical Events | Documented UAP cases and sightings |
| Spotlights | Notable milestones and disclosure events |
| Key Figures | Researchers, officials, and witnesses with full multi-tab profiles |
| Quotes | Notable statements on record |
| Media & Documents | Films, books, and official publications |
| News | Reports and ongoing developments |
| Cases | Tier-annotated documented incidents |
| Documents | Annotated primary source documents |
| Programs | Government programs, organizations, and private defense contractors |

#### Insider Profiles

Each insider has a dedicated multi-tab profile covering background, roles, key events timeline, credibility assessment, network connections, and public disclosures. Current profiles include:

Luis Elizondo, David Fravor, David Grusch, Jacques Vallee, Karl Nell, Hal Puthoff, Garry Nolan, Bob Bigelow, Eric Davis, Chris Mellon, Nick Pope, Bob Lazar, Philip Corso, Steven Greer, Dan Burisch, and more.

Profiles cross-reference documented cases and link into the Explore timeline overlay where applicable.

#### Cases

![Data - Cases](public/screenshots/cases.png)

Tier-annotated documented incidents with witness profiles, evidence inventory, official response tracking, and insider connections.

**Evidence Tiers:**
- Tier 1 - Official documentation (government acknowledgment, declassified records, or on-record military testimony)
- Tier 2 - Strong circumstantial (credible witnesses, partial corroboration)
- Tier 3 - Reported (witness accounts, limited corroboration)

Current cases: Nimitz Tic-Tac, Rendlesham Forest, USS Theodore Roosevelt, Belgian UFO Wave, Iranian F-4 Incident, JAL Flight 1628, Phoenix Lights, O'Hare Airport 2006, USS Omaha USO, Stephenville TX, Shag Harbour, and more.

#### Primary Documents

Annotated primary source documents with authenticity classification, provenance notes, key findings, and insider connections.

**Authenticity Classifications:** Official Publication, Declassified (FOIA), Confirmed Leaked, Leaked - Disputed, Declassified Authentic, Official Declassified.

#### Programs & Contractors

![Data - Programs](public/screenshots/programs.png)

Government and private-sector organizations with UAP research relevance. Program entries include key personnel, timeline events, significance assessments, and source citations.

A dedicated **Private Defense Contractors** section covers Lockheed Martin (Skunk Works), Northrop Grumman (incl. TRW), Raytheon Technologies, Battelle Memorial Institute, SAIC, and EG&G - each with documented contracts, UAP-relevant claims labeled by evidence status (testified under oath, documented, alleged, disputed), connected figures, and sources.

---

### Timeline

A chronological view of 1,800+ documented UAP/NHI events from the 1940s to the present. Filterable by era and event type. Case detail pages link directly into the timeline filtered to the relevant year.

---

### Explore

Interactive cross-dataset visualizations built with React Flow (@xyflow/react), Recharts, and react-force-graph-2d.

#### Relationship Network

![Explore - Relationship Network](public/screenshots/explore-network.png)

Force-directed graph of connections between insiders, organizations, programs, and technologies. Nodes are color-coded by type; clicking a node navigates to the associated profile or detail page.

#### Event Frequency & Timeline Overlay

Distribution of documented events by decade and historical era, plus a swimlane view of insider careers and key events plotted chronologically with per-source color coding.

#### Program Lineage Flow

![Explore - Program Lineage](public/screenshots/flow-lineage.png)

Left-to-right directed graph showing chronological succession and influence between 20 UAP investigation programs - from Project Sign (1947) through AARO (2022-present). Data-driven from `programs.json`. Click any node for a detail panel with program summary, key personnel, and a link to the full program profile.

#### Organizational Oversight Hierarchy

![Explore - Oversight Structure](public/screenshots/flow-oversight.png)

Top-down authority hierarchy spanning the Executive Branch, DoD, CIA, Congressional committees, and 14 UAP programs - with private defense contractors shown as contractual leaf nodes. Five edge types visualize distinct relationship classes: authority (solid), oversight (dashed green), contractual (dotted purple), alleged (dashed red), and influenced (dashed amber). Click any non-branch node for a detail panel.

#### Evidence Tier Swimlane

![Explore - Evidence Tiers](public/screenshots/flow-evidence-tiers.png)

Horizontal swimlane layout organizing all documented cases by evidence tier. Cases are sorted chronologically within each band and color-coded by incident category (military-aviation, military-ground, civilian, maritime, etc.). Click any case card for a summary panel and direct link to the full case profile.

---

### Resources

Curated reference materials organized into three tabs:

- **Primary Sources** - Books, films, academic papers, and official publications
- **Testimony & Interviews** - Processed transcripts from congressional hearings, podcasts, and on-record interviews
- **Glossary** - UAP/NHI terminology with definitions and context

---

### Search

Full-text search across all platform content: insider profiles, documented cases, primary documents, timeline events, glossary terms, and resources. Results grouped by content type with direct navigation.

---

## Project Structure

```
components/
  data/            # Data section components (profiles, cases, documents, lists)
  explore/         # Visualization components (network graph, xyflow, charts)
  resources/       # Resource list and glossary components
  layout/          # Header, footer, layout wrapper
data/
  *.json           # Static data files (insiders, cases, documents, events, etc.)
  key-figures/     # Per-figure JSON profiles
  network-graph.ts # Network graph node/link definitions
  org-hierarchy.json # Oversight hierarchy nodes and edges
  contractors.json # Private defense contractor profiles
pages/
  index.tsx        # Home
  data.tsx         # Data section with category routing
  explore.tsx      # Visualizations page
  timeline.tsx     # Timeline page
  resources.tsx    # Resources page
  about.tsx        # About page
public/            # Static assets and screenshots
types/
  data.ts          # TypeScript interfaces
```

---

## Tech Stack

- **Framework**: Next.js (Pages Router) with TypeScript
- **Styling**: Tailwind CSS
- **Flow Visualizations**: @xyflow/react with @dagrejs/dagre layout engine
- **Charts**: Recharts
- **Network Graph**: react-force-graph-2d
- **Data**: Static JSON with `getStaticProps` + ISR (`revalidate: 3600`)
- **Analytics**: Vercel Analytics
