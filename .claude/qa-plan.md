# DECUR Data QA Plan

## Overview

This document is the master checklist for auditing every data point that has a dedicated page on the DECUR platform. The goal is to verify factual accuracy, source validity, schema compliance, and UI correctness for all 211 pages across five data categories.

**Total scope:**
| Category | Count | Batches | Batch Size |
|---|---|---|---|
| Key Figures - Tier 2 Bespoke | 15 | 2 | 7-8 |
| Key Figures - Generic | 96 | 9 | 10-11 |
| Cases | 34 | 6 | 5-6 |
| Documents | 33 | 6 | 5-6 |
| Programs | 25 | 5 | 5 |
| Contractors | 8 | 1 | 8 |
| **Total** | **211** | **29** | - |

---

## Batch Sizing Rationale

- **Bespoke profiles (8 per batch):** Each bespoke component has a unique tab structure. They're the most prominent pages, so they get their own dedicated phase. Smaller batches allow deeper per-profile review before committing.
- **Generic profiles (10 per batch):** GenericInsiderProfile renders them consistently. At 10 per batch a session stays focused without context overload.
- **Cases, Documents, Programs (5-6 per batch):** Structured data with known schemas. Slightly larger batches are fine since the checklist is predictable per item.
- **Contractors (all 8 at once):** Small category; simpler data structure. One batch is sufficient.
- **QA before push, always.** Each batch is implemented (corrections made), then reviewed by you before committing and pushing. Never push a batch you haven't QA'd.

---

## QA Checklist - Per Category

### Key Figures (all profiles)
For every figure, verify:
- [ ] Name, aliases, birth date/location are accurate
- [ ] Roles list is complete and correctly worded
- [ ] Organizations are accurate and not outdated
- [ ] Clearance level is correctly stated (and marked former if appropriate)
- [ ] Service period / career dates are correct
- [ ] Summary is factually accurate and current (2-3 sentences)
- [ ] `key_events` dates use `"YYYY"` or `"Mon YYYY"` format (no ISO strings like `1994-09-16`)
- [ ] No em dashes (`-`) used anywhere in text fields
- [ ] `associated_people` IDs all exist in the registry; relationship descriptions are accurate
- [ ] `disclosures` dates, types, titles, outlets are correct; no `description` field (use `notes`)
- [ ] `sources` URLs are valid/live; types and notes are accurate
- [ ] `career_connections` (if present): `event_index` values are in range, `node_type` and `connection_type` use allowed values
- [ ] `claims` (if present): claim text is accurate; `category` field is populated
- [ ] Sources page (`pages/sources.tsx`) has at least one `SourceCard` entry for this figure

**Additional checks for Tier 2 bespoke profiles:**
- [ ] All custom tabs render without errors
- [ ] No stale data that contradicts the JSON (bespoke components sometimes hardcode text)
- [ ] `RelatedCrossLinksSection` below the profile shows correct related cases/documents
- [ ] `SharedAssessmentTab` uses the `baseline` variant (not `compact`)

---

### Cases
For every case, verify:
- [ ] Case title and date are accurate
- [ ] Location is accurate (city, state/country)
- [ ] Evidence tier assignment is appropriate given the evidence described
- [ ] Summary is factually accurate
- [ ] `key_facts` are accurate and complete
- [ ] Witness names, ranks/roles are correctly stated
- [ ] `insider_connections` IDs all exist in the registry; `role` and `note` fields are accurate
- [ ] `documents_referenced` IDs all exist in documents.json
- [ ] `sources` URLs are valid/live; no ufotimeline.com URLs in `article_url`
- [ ] No em dashes in any text fields
- [ ] Sources page has a `SourceCard` entry for the primary source(s)

---

### Documents
For every document, verify:
- [ ] `name` field leads with the common/identifying name (not academic title first - see CLAUDE.md search rule)
- [ ] Document date is accurate
- [ ] `key_findings` are accurate and not misattributed
- [ ] `significance` section correctly describes the document's historical importance
- [ ] `insider_connections` IDs all exist in the registry; `role` fields are accurate
- [ ] `sources` URLs are valid/live
- [ ] No em dashes in any text fields
- [ ] Sources page has a `SourceCard` entry

---

### Programs
For every program, verify:
- [ ] Program name and acronym are correct
- [ ] Active date range is accurate (start/end)
- [ ] Oversight agency/parent organization is correctly listed
- [ ] Key personnel are accurately named and their roles described
- [ ] Program summary is factually accurate
- [ ] `insider_connections` IDs (if present) are valid
- [ ] No em dashes in any text fields
- [ ] Sources page has a `SourceCard` entry

---

### Contractors
For every contractor, verify:
- [ ] Company name, founding date, headquarters are accurate
- [ ] UAP-relevant contracts/programs are correctly described
- [ ] Key personnel mentioned are accurately named
- [ ] No em dashes in any text fields
- [ ] Sources page has a `SourceCard` entry

---

## Phase 1 - Key Figures: Tier 2 Bespoke

These are the 15 highest-profile figures on the platform, each with a custom-built component. Audit these first.

### Batch KF-1 (8 bespoke profiles)
| # | ID | Component File | Status |
|---|---|---|---|
| 1 | `luis-elizondo` | `components/data/ElizondoProfile.tsx` | [x] |
| 2 | `dan-burisch` | `components/data/InsiderProfile.tsx` | [x] |
| 3 | `david-fravor` | `components/data/FravorProfile.tsx` | [x] |
| 4 | `karl-nell` | `components/data/NellProfile.tsx` | [x] |
| 5 | `david-grusch` | `components/data/GruschProfile.tsx` | [x] |
| 6 | `hal-puthoff` | `components/data/PuthoffProfile.tsx` | [x] |
| 7 | `garry-nolan` | `components/data/NolanProfile.tsx` | [x] |
| 8 | `robert-bigelow` | `components/data/BigelowProfile.tsx` | [x] |

### Batch KF-2 (7 bespoke profiles)
| # | ID | Component File | Status |
|---|---|---|---|
| 1 | `eric-davis` | `components/data/DavisProfile.tsx` | [ ] |
| 2 | `chris-mellon` | `components/data/MellonProfile.tsx` | [ ] |
| 3 | `bob-lazar` | `components/data/LazarProfile.tsx` | [ ] |
| 4 | `nick-pope` | `components/data/PopeProfile.tsx` | [ ] |
| 5 | `jake-barber` | `components/data/BarberProfile.tsx` | [ ] |
| 6 | `tim-gallaudet` | `components/data/GallaudetProfile.tsx` | [ ] |
| 7 | `jacques-vallee` | `components/data/ValleeProfile.tsx` | [ ] |

---

## Phase 2 - Key Figures: Generic Profiles

All remaining 96 profiles rendered by `GenericInsiderProfile.tsx`. Grouped loosely by prominence/type.

### Batch KF-3 (10 profiles)
| # | ID | Status |
|---|---|---|
| 1 | `harry-reid` | [ ] |
| 2 | `j-allen-hynek` | [ ] |
| 3 | `george-knapp` | [ ] |
| 4 | `leslie-kean` | [ ] |
| 5 | `ryan-graves` | [ ] |
| 6 | `ross-coulthart` | [ ] |
| 7 | `james-lacatski` | [ ] |
| 8 | `richard-dolan` | [ ] |
| 9 | `daniel-sheehan` | [ ] |
| 10 | `chuck-schumer` | [ ] |

### Batch KF-4 (10 profiles)
| # | ID | Status |
|---|---|---|
| 1 | `alex-dietrich` | [ ] |
| 2 | `kevin-day` | [ ] |
| 3 | `john-mack` | [ ] |
| 4 | `jesse-michels` | [ ] |
| 5 | `harald-malmgren` | [ ] |
| 6 | `stanton-friedman` | [ ] |
| 7 | `avi-loeb` | [ ] |
| 8 | `donald-keyhoe` | [ ] |
| 9 | `philip-corso` | [ ] |
| 10 | `steven-greer` | [ ] |

### Batch KF-5 (10 profiles)
| # | ID | Status |
|---|---|---|
| 1 | `jay-stratton` | [ ] |
| 2 | `robert-hastings` | [ ] |
| 3 | `sean-kirkpatrick` | [ ] |
| 4 | `dylan-borland` | [ ] |
| 5 | `matthew-brown` | [ ] |
| 6 | `kit-green` | [ ] |
| 7 | `colm-kelleher` | [ ] |
| 8 | `annie-jacobsen` | [ ] |
| 9 | `jim-semivan` | [ ] |
| 10 | `kirsten-gillibrand` | [ ] |

### Batch KF-6 (10 profiles)
| # | ID | Status |
|---|---|---|
| 1 | `tim-burchett` | [ ] |
| 2 | `john-burroughs` | [ ] |
| 3 | `edward-ruppelt` | [ ] |
| 4 | `james-mcdonald` | [ ] |
| 5 | `diana-pasulka` | [ ] |
| 6 | `townsend-brown` | [ ] |
| 7 | `thomas-wilson` | [ ] |
| 8 | `charles-halt` | [ ] |
| 9 | `marco-rubio` | [ ] |
| 10 | `mike-gallagher` | [ ] |

### Batch KF-7 (10 profiles)
| # | ID | Status |
|---|---|---|
| 1 | `peter-sturrock` | [ ] |
| 2 | `nathan-twining` | [ ] |
| 3 | `jesse-marcel` | [ ] |
| 4 | `james-fox` | [ ] |
| 5 | `fife-symington` | [ ] |
| 6 | `michael-herrera` | [ ] |
| 7 | `barry-goldwater` | [ ] |
| 8 | `robert-salas` | [ ] |
| 9 | `edgar-mitchell` | [ ] |
| 10 | `tom-delonge` | [ ] |

### Batch KF-8 (10 profiles)
| # | ID | Status |
|---|---|---|
| 1 | `john-alexander` | [ ] |
| 2 | `john-callahan` | [ ] |
| 3 | `richard-doty` | [ ] |
| 4 | `linda-moulton-howe` | [ ] |
| 5 | `jeremy-corbell` | [ ] |
| 6 | `whitley-strieber` | [ ] |
| 7 | `kenneth-arnold` | [ ] |
| 8 | `roscoe-hillenkoetter` | [ ] |
| 9 | `bruce-maccabee` | [ ] |
| 10 | `jesse-marcel-jr` | [ ] |

### Batch KF-9 (10 profiles)
| # | ID | Status |
|---|---|---|
| 1 | `charles-mccullough` | [ ] |
| 2 | `wilbert-smith` | [ ] |
| 3 | `anna-paulina-luna` | [ ] |
| 4 | `lynne-kitei` | [ ] |
| 5 | `neil-mccasland` | [ ] |
| 6 | `travis-walton` | [ ] |
| 7 | `budd-hopkins` | [ ] |
| 8 | `roger-leir` | [ ] |
| 9 | `betty-barney-hill` | [ ] |
| 10 | `john-lear` | [ ] |

### Batch KF-10 (10 profiles)
| # | ID | Status |
|---|---|---|
| 1 | `eric-burlison` | [ ] |
| 2 | `ingo-swann` | [ ] |
| 3 | `joe-mcmoneagle` | [ ] |
| 4 | `robert-monroe` | [ ] |
| 5 | `beatriz-villarroel` | [ ] |
| 6 | `kevin-knuth` | [ ] |
| 7 | `matt-szydagis` | [ ] |
| 8 | `david-spergel` | [ ] |
| 9 | `hakan-kayal` | [ ] |
| 10 | `jeffrey-kripal` | [ ] |

### Batch KF-11 (6 profiles)
| # | ID | Status |
|---|---|---|
| 1 | `robert-powell` | [ ] |
| 2 | `alexander-wendt` | [ ] |
| 3 | `gary-mckinnon` | [ ] |
| 4 | `mathew-bevan` | [ ] |
| 5 | `clifford-stone` | [ ] |
| 6 | `john-ramirez` | [ ] |

### Batch KF-12 (10 profiles)
| # | ID | Status |
|---|---|---|
| 1 | `oscar-santa-maria-huerta` | [ ] |
| 2 | `parviz-jafari` | [ ] |
| 3 | `mark-mccandlish` | [ ] |
| 4 | `bob-jacobs` | [ ] |
| 5 | `jonathan-weygandt` | [ ] |
| 6 | `donna-hare` | [ ] |
| 7 | `salvatore-pais` | [ ] |
| 8 | `dan-sherman` | [ ] |
| 9 | `charles-hall` | [ ] |
| 10 | `nick-cook` | [ ] |

---

## Phase 3 - Cases

### Batch C-1 (6 cases)
| # | ID | Status |
|---|---|---|
| 1 | `nimitz-tic-tac` | [ ] |
| 2 | `rendlesham-forest` | [ ] |
| 3 | `uss-theodore-roosevelt` | [ ] |
| 4 | `belgian-ufo-wave` | [ ] |
| 5 | `iranian-f4-incident` | [ ] |
| 6 | `jal-1628` | [ ] |

### Batch C-2 (6 cases)
| # | ID | Status |
|---|---|---|
| 1 | `roswell-1947` | [ ] |
| 2 | `malmstrom-afb-1967` | [ ] |
| 3 | `kecksburg-1965` | [ ] |
| 4 | `phoenix-lights-1997` | [ ] |
| 5 | `ohare-airport-2006` | [ ] |
| 6 | `uss-omaha-2019` | [ ] |

### Batch C-3 (6 cases)
| # | ID | Status |
|---|---|---|
| 1 | `stephenville-tx-2008` | [ ] |
| 2 | `shag-harbour-1967` | [ ] |
| 3 | `westall-1966` | [ ] |
| 4 | `ariel-school-1994` | [ ] |
| 5 | `washington-dc-1952` | [ ] |
| 6 | `socorro-1964` | [ ] |

### Batch C-4 (6 cases)
| # | ID | Status |
|---|---|---|
| 1 | `aguadilla-2013` | [ ] |
| 2 | `fukushima-2011` | [ ] |
| 3 | `varginha-1996` | [ ] |
| 4 | `levelland-1957` | [ ] |
| 5 | `coyne-helicopter-1973` | [ ] |
| 6 | `rb47-1957` | [ ] |

### Batch C-5 (6 cases)
| # | ID | Status |
|---|---|---|
| 1 | `falcon-lake-1967` | [ ] |
| 2 | `minot-afb-1968` | [ ] |
| 3 | `exeter-1965` | [ ] |
| 4 | `loch-raven-dam-1958` | [ ] |
| 5 | `kenneth-arnold-1947` | [ ] |
| 6 | `betty-barney-hill-1961` | [ ] |

### Batch C-6 (4 cases)
| # | ID | Status |
|---|---|---|
| 1 | `walton-abduction-1975` | [ ] |
| 2 | `cash-landrum-1980` | [ ] |
| 3 | `trans-en-provence-1981` | [ ] |
| 4 | `foo-fighters-wwii` | [ ] |

---

## Phase 4 - Documents

### Batch D-1 (6 documents)
| # | ID | Status |
|---|---|---|
| 1 | `wilson-davis-memo` | [ ] |
| 2 | `uaptf-preliminary-assessment` | [ ] |
| 3 | `aaro-historical-record-vol1` | [ ] |
| 4 | `nasa-uap-study-2023` | [ ] |
| 5 | `halt-memo-1981` | [ ] |
| 6 | `dia-iran-f4-1976` | [ ] |

### Batch D-2 (6 documents)
| # | ID | Status |
|---|---|---|
| 1 | `ndaa-fy2023-uap-provisions` | [ ] |
| 2 | `robertson-panel-1953` | [ ] |
| 3 | `blue-book-special-report-14` | [ ] |
| 4 | `condon-report-1969` | [ ] |
| 5 | `elizondo-resignation-letter-2017` | [ ] |
| 6 | `twining-memo-1947` | [ ] |

### Batch D-3 (6 documents)
| # | ID | Status |
|---|---|---|
| 1 | `schulgen-memo-1947` | [ ] |
| 2 | `project-sign-estimate-1948` | [ ] |
| 3 | `aaro-historical-record-vol2-2024` | [ ] |
| 4 | `pentacle-memorandum` | [ ] |
| 5 | `hottel-memo` | [ ] |
| 6 | `ndaa-fy2024-uap-provisions` | [ ] |

### Batch D-4 (6 documents)
| # | ID | Status |
|---|---|---|
| 1 | `dni-annual-report-uap-2024` | [ ] |
| 2 | `grusch-ig-complaint-2023` | [ ] |
| 3 | `project-grudge-final-report-1949` | [ ] |
| 4 | `socorro-blue-book-investigation-1964` | [ ] |
| 5 | `baass-aawsap-contract-2008` | [ ] |
| 6 | `cometa-report-1999` | [ ] |

### Batch D-5 (6 documents)
| # | ID | Status |
|---|---|---|
| 1 | `crs-uap-report-2022` | [ ] |
| 2 | `rockefeller-briefing-document-1995` | [ ] |
| 3 | `uk-mod-ufo-files-2009` | [ ] |
| 4 | `pentagon-uap-video-release-2020` | [ ] |
| 5 | `grusch-icig-determination-2023` | [ ] |
| 6 | `sobeps-belgian-ufo-wave-1991` | [ ] |

### Batch D-6 (3 documents)
| # | ID | Status |
|---|---|---|
| 1 | `uap-disclosure-act-2023` | [ ] |
| 2 | `sturrock-panel-report-1998` | [ ] |
| 3 | `vallee-davis-incommensurability-2003` | [ ] |

---

## Phase 5 - Programs

### Batch P-1 (5 programs)
| # | ID | Status |
|---|---|---|
| 1 | `project-blue-book` | [ ] |
| 2 | `project-sign` | [ ] |
| 3 | `project-grudge` | [ ] |
| 4 | `aawsap` | [ ] |
| 5 | `aatip` | [ ] |

### Batch P-2 (5 programs)
| # | ID | Status |
|---|---|---|
| 1 | `aaro` | [ ] |
| 2 | `immaculate-constellation` | [ ] |
| 3 | `kona-blue` | [ ] |
| 4 | `ttsa` | [ ] |
| 5 | `sol-foundation` | [ ] |

### Batch P-3 (5 programs)
| # | ID | Status |
|---|---|---|
| 1 | `nids` | [ ] |
| 2 | `bigelow-aerospace` | [ ] |
| 3 | `nicap` | [ ] |
| 4 | `mufon` | [ ] |
| 5 | `jsoc` | [ ] |

### Batch P-4 (5 programs)
| # | ID | Status |
|---|---|---|
| 1 | `afosi` | [ ] |
| 2 | `ipu` | [ ] |
| 3 | `oga` | [ ] |
| 4 | `sdi` | [ ] |
| 5 | `seti` | [ ] |

### Batch P-5 (5 programs)
| # | ID | Status |
|---|---|---|
| 1 | `uap-task-force` | [ ] |
| 2 | `galileo-project` | [ ] |
| 3 | `project-moon-dust` | [ ] |
| 4 | `project-preserve-destiny` | [ ] |
| 5 | `condon-committee` | [ ] |

---

## Phase 6 - Contractors

### Batch CTR-1 (8 contractors)
| # | ID | Status |
|---|---|---|
| 1 | `lockheed-martin` | [ ] |
| 2 | `northrop-grumman` | [ ] |
| 3 | `raytheon` | [ ] |
| 4 | `battelle` | [ ] |
| 5 | `saic` | [ ] |
| 6 | `leidos` | [ ] |
| 7 | `boeing-defense` | [ ] |
| 8 | `egg` | [ ] |

---

## Process Per Batch

1. **Audit** - Review each item's JSON/data file and live page against the checklist
2. **Flag issues** - List all inaccuracies, schema violations, broken links, and missing sources page entries
3. **Correct** - Apply all fixes in the data files and components
4. **Review provided to you** - Summary of changes made per item
5. **You QA** - Visit each corrected page on the live dev server and confirm
6. **Commit + push** - Single commit per batch after your sign-off

---

## Progress Tracker

| Batch | Items | Status | Commit | Corrections Summary |
|---|---|---|---|---|
| KF-1 | 8 bespoke figures | Complete | 27f086d | schema (ISO dates, date→year, career_connections), em-dash (all JSON + 2 TSX), cross-link (grusch lue-elizondo typo), bigelow disclosures rewritten, missing-source added |
| KF-2 | 7 bespoke figures | Complete | fc50f92 | schema (date→year in lazar/pope/barber), em-dash (all JSON + 4 TSX components), disclosure rewrites (pope), invalid associated_people ID removed (barber), missing-source added (pope/barber/gallaudet/vallee), types/data.ts hotfix |
| KF-3 | 10 generic figures | Complete | 1bf83f1 | ISO/malformed dates fixed, invalid associated_people IDs removed (reid/hynek/kean), em dashes, connection_type normalizations, 13 SourceCards added |
| KF-4 | 10 generic figures | Complete | 986bb28 | date fixes, connection_type normalizations, 2 invalid associated_people IDs removed (john-mack), SourceCards added for all 10 |
| KF-5 | 10 generic figures | Complete | 3602665 | date format fixes (matthew-brown), connection_type "oversight"→"institutional" (gillibrand), 6 SourceCards added |
| KF-6 | 10 generic figures | Complete | 7794682 | invalid IDs removed (burchett/townsend-brown/halt), node_type person→figure fixes (wilson/halt/rubio/gallagher), date format fixes (burroughs), connection_type normalizations, 7 SourceCards added |
| KF-7 | 10 generic figures | Complete | dbd6e2f | node_type person→figure across all 10, connection_type normalizations, 10 SourceCards added; JSON/disclosures all clean |
| KF-8 | 10 generic figures | Complete | 25b7a74 | node_type person→figure across all 10, invalid IDs removed (strieber: joe-semivan typo), 10 SourceCards added; JSON/disclosures clean |
| KF-9 | 10 generic figures | Complete | a28f2be | node_type person→figure across all 10, 11 SourceCards added; JSON/disclosures all clean |
| KF-10 | 10 generic figures | Complete | cacd5e6 | date format fixes (burlison: 9 events), em-dash fixes (mcmoneagle: 8), node_type person→figure across all 10; sources already present |
| KF-11 | 6 generic figures | Complete | e8e374e | node_type person→figure only (11 fixes); all JSON/disclosures/sources already clean |
| KF-12 | 10 generic figures | Complete | e8e374e | node_type person→figure only (28 fixes across both batches); all clean |
| C-1 | 6 cases | Complete | 6032577 | 137 em dashes fixed, 9 missing insider_connections roles added, 10 SourceCards added |
| C-2 | 6 cases | Complete | 6032577 | (same commit as C-1) |
| C-3 | 6 cases | Complete | 6032577 | (same commit as C-1/C-2) |
| C-4 | 6 cases | Complete | 04d83fe | 1 em dash (varginha), 2 SourceCards added |
| C-5 | 6 cases | Complete | 04d83fe | missing roles added to 3 cases (minot/exeter/loch-raven/kenneth-arnold/betty-barney-hill), 2 SourceCards added |
| C-6 | 4 cases | Complete | 04d83fe | missing roles added (walton), all others clean |
| D-1 | 6 documents | Complete | 8e8e45f | 104 em dashes replaced across D-1/D-2/D-3; 11 SourceCards added |
| D-2 | 6 documents | Complete | 8e8e45f | (same commit as D-1) |
| D-3 | 6 documents | Complete | 8e8e45f | (same commit as D-1/D-2) |
| D-4 | 6 documents | Complete | 088edc7 | rockefeller name field fixed, 12 missing insider_connections roles added across 4 documents |
| D-5 | 6 documents | Complete | 088edc7 | (same commit as D-4) |
| D-6 | 3 documents | Complete | 088edc7 | (same commit as D-4/D-5) |
| P-1 | 5 programs | Complete | a1717b6 | aatip christopher-mellon slug fixed, 2 SourceCards added |
| P-2 | 5 programs | Complete | f7fdc83 | aaro incorrect Gallaudet key_personnel entry removed |
| P-3 | 5 programs | Complete | f8a18a2 | nicap keyhoe figure_id fixed, MUFON/JSOC SourceCards added |
| P-4 | 5 programs | Complete | e593217 | sdi philip-corso added to connected_figures, 8 SourceCards added (afosi/ipu/oga/sdi/seti) |
| P-5 | 5 programs | Complete | 317f2e3 | uaptf jay-stratton figure_id fixed, 4 SourceCards added (preserve-destiny/condon-committee) |
| CTR-1 | 8 contractors | Complete | aaa86f5 | contractors.json all clean; 8 SourceCards added (lockheed/northrop/raytheon/battelle/saic/egg) |

---

## Corrections Log

A running record of every data change made during this QA process. Updated after each batch is committed. Use this as an audit trail to understand what the data looked like before vs. after the QA pass.

Format per entry:
```
### [Batch ID] - [Date]
- `[id]` — [field changed]: [what it was] → [what it is now]
- `[id]` — [issue type]: [description of fix]
```

Issue type shorthand:
- **factual** - incorrect data (wrong date, wrong role, wrong affiliation, etc.)
- **schema** - violated a schema rule (ISO date in key_events, wrong disclosure type, etc.)
- **dead-link** - source URL was broken or redirected incorrectly
- **missing-source** - sources.tsx entry was absent
- **em-dash** - em dash found and replaced
- **stale** - bespoke component had hardcoded text that no longer matched the JSON
- **cross-link** - associated_people ID or insider_connections ID was invalid
- **added** - new field, event, disclosure, or source added that was missing

### KF-1 - 2026-04-10

**elizondo.json**
- em-dash: replaced all instances with hyphens
- schema: 4 key_events ISO date strings fixed (2017-09-16 → Sep 2017, 2017-10-04 → Oct 2017, 2017-12-16 → Dec 2017, 2022-04-06 → Apr 2022)
- schema: career_connections node_type "figure" → "person" (5 nodes); non-spec connection_type values normalized

**burisch.json**
- em-dash: replaced all instances (9) with hyphens

**fravor.json**
- em-dash: replaced all instances (19) with hyphens
- schema: key_events field renamed from "date" to "year" across all 9 events
- schema: disclosures[3] type "media" fixed to "interview"; title added
- schema: career_connections node_type "figure" → "person"; connection_type values normalized

**FravorProfile.tsx**
- em-dash (stale): 7 hardcoded em dashes in EvidenceTab static strings replaced with hyphens

**nell.json**
- em-dash: replaced all instances (18) with hyphens
- schema: key_events field renamed from "date" to "year" across all 9 events
- schema: career_connections node_type "figure" → "person"; connection_type values normalized

**grusch.json**
- em-dash: replaced all instances (35) with hyphens
- schema: key_events field renamed from "date" to "year" across all 17 events
- cross-link: associated_people entry id "lue-elizondo" corrected to "luis-elizondo"
- schema: career_connections node_type "figure" → "person"; connection_type values normalized

**GruschProfile.tsx**
- schema (stale): key_events mapping changed from `e.date` to `e.year` to match corrected JSON field name

**puthoff.json**
- em-dash: replaced all instances (32) with hyphens
- schema: career_connections node_type "figure" → "person"; connection_type values normalized

**nolan.json**
- em-dash: replaced all instances (27) with hyphens
- schema: key_events field renamed from "date" to "year" across all 10 events
- schema: career_connections node_type "figure" → "person"; connection_type values normalized

**NolanProfile.tsx**
- em-dash (stale): 1 hardcoded em dash in "CIA Consultation — Brain Morphology Study" heading replaced with hyphen

**bigelow.json**
- em-dash: all instances replaced with hyphens
- schema: key_events field renamed from "date" to "year" across all 12 events
- schema: all 5 disclosures rewritten - "description" renamed to "notes", titles added to all, types fixed ("Published Research"→"written", "Media"→"television"/"interview", "Indirect"→"article", "FOIA Release"→"declassification")
- added: id and category fields added to all 4 claims (bigelow-et-exists, bigelow-usg-possession, bigelow-baass-anomalous, bigelow-near-earth-et)
- schema: career_connections node_type "figure" → "person"; connection_type values normalized

**pages/sources.tsx**
- missing-source: added 2 SourceCard entries for Robert Bigelow (Skinwalkers at the Pentagon book + CBS 60 Minutes interview)
