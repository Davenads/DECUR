#!/usr/bin/env python3
"""
Sparks Blue Book Unknowns Catalog Extractor
Downloads the Brad Sparks Comprehensive Catalog of ~2,200 Blue Book Unknowns from CUFOS
and extracts structured fields to enrich data/blue-book-index.json.

Required: pip install pdfplumber requests

Usage:
    python scripts/extract-sparks-catalog.py

Output:
    data/blue-book-index-enriched.json  (do not overwrite original until reviewed)
    scripts/output/sparks-extraction-report.txt  (extraction stats and unmatched cases)
"""

import json
import re
import os
import sys
import urllib.request
from pathlib import Path

# Try to import pdfplumber - provide helpful error if missing
try:
    import pdfplumber
except ImportError:
    print("ERROR: pdfplumber is required. Install with: pip install pdfplumber")
    sys.exit(1)

# ─── Configuration ────────────────────────────────────────────────────────────

PDF_URL = "https://cufos.org/PDFs/pdfs/BB_Unknowns.pdf"
PDF_LOCAL = Path("scripts/output/sparks-catalog.pdf")
INDEX_FILE = Path("data/blue-book-index.json")
OUTPUT_FILE = Path("data/blue-book-index-enriched.json")
REPORT_FILE = Path("scripts/output/sparks-extraction-report.txt")

# Month name to number mapping
MONTH_MAP = {
    "january": 1, "february": 2, "march": 3, "april": 4,
    "may": 5, "june": 6, "july": 7, "august": 8,
    "september": 9, "october": 10, "november": 11, "december": 12,
    "jan": 1, "feb": 2, "mar": 3, "apr": 4, "jun": 6,
    "jul": 7, "aug": 8, "sep": 9, "sept": 9, "oct": 10, "nov": 11, "dec": 12
}

# ─── Download PDF ─────────────────────────────────────────────────────────────

def download_pdf() -> Path:
    PDF_LOCAL.parent.mkdir(parents=True, exist_ok=True)
    if PDF_LOCAL.exists():
        print(f"Using cached PDF: {PDF_LOCAL}")
        return PDF_LOCAL
    print(f"Downloading Sparks catalog from {PDF_URL}...")
    try:
        urllib.request.urlretrieve(PDF_URL, PDF_LOCAL)
        size_mb = PDF_LOCAL.stat().st_size / (1024 * 1024)
        print(f"Downloaded: {size_mb:.1f} MB")
    except Exception as e:
        print(f"ERROR downloading PDF: {e}")
        print("Please manually download from:")
        print(f"  {PDF_URL}")
        print(f"and save to: {PDF_LOCAL}")
        sys.exit(1)
    return PDF_LOCAL

# ─── Parse entry number + BB case number ──────────────────────────────────────

# Pattern: entry starts with a catalog number like "1." or "123." at start of a text block
ENTRY_NUM_RE = re.compile(r'^(\d{1,4})\.\s+BB\s+#?\s*(\d+)', re.IGNORECASE)
BB_CASE_RE = re.compile(r'BB\s+#?\s*(\d{3,5})', re.IGNORECASE)

# ─── Coordinate extraction ────────────────────────────────────────────────────

# Matches: (32.3°N, 106.7°W) or (43.88N 116.48W) or similar
COORD_RE = re.compile(
    r'\(\s*(-?\d+\.?\d*)\s*[°]?\s*([NS])\s*[,\s]\s*(-?\d+\.?\d*)\s*[°]?\s*([EW])\s*\)',
    re.IGNORECASE
)

def parse_coords(text: str):
    m = COORD_RE.search(text)
    if not m:
        return None, None
    lat = float(m.group(1))
    if m.group(2).upper() == 'S':
        lat = -lat
    lon = float(m.group(3))
    if m.group(4).upper() == 'W':
        lon = -lon
    return round(lat, 4), round(lon, 4)

# ─── Duration extraction ──────────────────────────────────────────────────────

# Matches things like "3 mins", "45 secs", "1.5 hrs", "2 min", "30 sec"
DURATION_RE = re.compile(
    r'(\d+\.?\d*)\s*(hour|hr|min|minute|sec|second)s?',
    re.IGNORECASE
)

def parse_duration(text: str) -> str | None:
    m = DURATION_RE.search(text)
    if not m:
        return None
    val = m.group(1)
    unit = m.group(2).lower()
    if unit in ('hour', 'hr'):
        return f"{val} hr"
    elif unit in ('min', 'minute'):
        return f"{val} min"
    elif unit in ('sec', 'second'):
        return f"{val} sec"
    return None

# ─── Witness count extraction ──────────────────────────────────────────────────

WITNESSES_RE = re.compile(r'^(\d{1,3}|\?{1,2})$')

def parse_witnesses(text: str) -> int | None:
    text = text.strip()
    if WITNESSES_RE.match(text):
        try:
            return int(text)
        except ValueError:
            return None
    return None

# ─── Instrument flag ──────────────────────────────────────────────────────────

INSTRUMENT_KEYWORDS = ['radar', 'theodolite', 'camera', 'film', 'photo', 'telescope',
                        'binocular', 'instrument', 'scientist', 'engineer']

def parse_instruments(text: str) -> bool:
    t = text.lower()
    return any(kw in t for kw in INSTRUMENT_KEYWORDS)

# ─── Date parsing ─────────────────────────────────────────────────────────────

DATE_RE = re.compile(
    r'(Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|June?|July?|Aug(?:ust)?|'
    r'Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)'
    r'\.?\s+(\d{1,2}),?\s+(\d{4})',
    re.IGNORECASE
)

def parse_date(text: str):
    m = DATE_RE.search(text)
    if not m:
        return None, None, None
    month_str = m.group(1).lower().rstrip('.')
    month = MONTH_MAP.get(month_str[:3]) or MONTH_MAP.get(month_str)
    day = int(m.group(2))
    year = int(m.group(3))
    return year, month, day

# ─── PDF extraction ───────────────────────────────────────────────────────────

def extract_sparks_entries(pdf_path: Path) -> list[dict]:
    """
    Extract structured entries from the Sparks catalog PDF.
    The catalog has entries like:
      No.  |  [narrative with date, location, time, witnesses]  |  Duration  |  #Witnesses  |  Angular Size  |  Instruments
    """
    entries = []
    current_entry = None

    print("Extracting text from PDF...")

    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"Total pages: {total_pages}")

        for page_num, page in enumerate(pdf.pages):
            if page_num % 20 == 0:
                print(f"  Processing page {page_num + 1}/{total_pages}...")

            # Try table extraction first
            tables = page.extract_tables()

            if tables:
                for table in tables:
                    for row in table:
                        if not row or not row[0]:
                            continue

                        # Check if first cell looks like an entry number
                        cell0 = str(row[0]).strip()
                        entry_match = re.match(r'^(\d{1,4})$', cell0)

                        if entry_match and len(row) >= 2:
                            if current_entry:
                                entries.append(current_entry)

                            narrative = ' '.join(str(c) for c in row[1:3] if c).strip()
                            duration_col = str(row[3]).strip() if len(row) > 3 else ''
                            witnesses_col = str(row[4]).strip() if len(row) > 4 else ''
                            angular_col = str(row[5]).strip() if len(row) > 5 else ''
                            instruments_col = str(row[6]).strip() if len(row) > 6 else ''

                            # Extract BB case number from narrative
                            bb_match = BB_CASE_RE.search(narrative)
                            bb_case_no = bb_match.group(1) if bb_match else None

                            lat, lon = parse_coords(narrative)
                            year, month, day = parse_date(narrative)

                            current_entry = {
                                'catalog_no': int(entry_match.group(1)),
                                'bb_case_no': bb_case_no,
                                'narrative': narrative[:500],  # truncate for storage
                                'year': year,
                                'month': month,
                                'day': day,
                                'lat': lat,
                                'lon': lon,
                                'duration': parse_duration(duration_col) or parse_duration(narrative),
                                'num_witnesses': parse_witnesses(witnesses_col),
                                'angular_size': angular_col if angular_col and angular_col not in ('—', '??', '-', '') else None,
                                'instruments': parse_instruments(instruments_col) or parse_instruments(narrative),
                            }
            else:
                # Fall back to raw text extraction if no tables detected
                text = page.extract_text() or ''

                # Look for entry boundaries by catalog number pattern at line start
                for line in text.split('\n'):
                    line = line.strip()
                    if re.match(r'^\d{1,4}\s+', line):
                        if current_entry:
                            entries.append(current_entry)

                        bb_match = BB_CASE_RE.search(line)
                        lat, lon = parse_coords(line)
                        year, month, day = parse_date(line)

                        current_entry = {
                            'catalog_no': int(re.match(r'^(\d+)', line).group(1)),
                            'bb_case_no': bb_match.group(1) if bb_match else None,
                            'narrative': line[:500],
                            'year': year,
                            'month': month,
                            'day': day,
                            'lat': lat,
                            'lon': lon,
                            'duration': parse_duration(line),
                            'num_witnesses': None,
                            'angular_size': None,
                            'instruments': parse_instruments(line),
                        }

    if current_entry:
        entries.append(current_entry)

    print(f"Extracted {len(entries)} entries from PDF")
    return entries

# ─── Cross-reference with blue-book-index.json ────────────────────────────────

def normalize_location(loc: str) -> str:
    """Normalize location string for fuzzy matching."""
    return re.sub(r'[^a-z0-9 ]', '', loc.lower()).strip()

def match_sparks_to_index(sparks_entries: list[dict], index_cases: list[dict]) -> dict:
    """
    Match Sparks entries to our NICAP index by:
    1. BB Case No. exact match (primary)
    2. Year + normalized location fuzzy match (fallback)
    Returns a dict keyed by index case 'id' -> sparks enrichment data.
    """
    enrichment = {}

    # Build lookup by BB case no.
    sparks_by_bb = {}
    for e in sparks_entries:
        if e['bb_case_no']:
            sparks_by_bb[e['bb_case_no']] = e

    # Build lookup by year + location (normalized)
    sparks_by_year_loc = {}
    for e in sparks_entries:
        if e['year'] and e['narrative']:
            # Extract first 50 chars after date for location
            key = f"{e['year']}"
            if key not in sparks_by_year_loc:
                sparks_by_year_loc[key] = []
            sparks_by_year_loc[key].append(e)

    matched_by_bb = 0
    matched_by_location = 0
    unmatched = 0

    for case in index_cases:
        bb_no = case.get('case_no', '')
        case_year = case.get('year')
        case_loc = normalize_location(case.get('location', ''))

        # Strategy 1: exact BB case number match
        if bb_no and bb_no in sparks_by_bb:
            sparks_e = sparks_by_bb[bb_no]
            enrichment[case['id']] = _build_enrichment(sparks_e)
            matched_by_bb += 1
            continue

        # Strategy 2: year + location word overlap
        if case_year:
            candidates = sparks_by_year_loc.get(str(case_year), [])
            best_match = None
            best_score = 0

            for candidate in candidates:
                narrative_normalized = normalize_location(candidate.get('narrative', '')[:200])
                # Score by common words between location and narrative
                loc_words = set(case_loc.split())
                nar_words = set(narrative_normalized.split())
                common = loc_words & nar_words
                score = len(common)

                if score > best_score and score >= 2:  # require at least 2 matching words
                    best_score = score
                    best_match = candidate

            if best_match:
                enrichment[case['id']] = _build_enrichment(best_match)
                matched_by_location += 1
                continue

        unmatched += 1

    print(f"Matched by BB case no.: {matched_by_bb}")
    print(f"Matched by year+location: {matched_by_location}")
    print(f"Unmatched: {unmatched}")

    return enrichment

def _build_enrichment(sparks_e: dict) -> dict:
    """Extract only the fields we want to add to our index."""
    result = {}
    if sparks_e.get('lat') is not None:
        result['lat'] = sparks_e['lat']
        result['lon'] = sparks_e['lon']
    if sparks_e.get('duration'):
        result['duration'] = sparks_e['duration']
    if sparks_e.get('num_witnesses') is not None:
        result['num_witnesses'] = sparks_e['num_witnesses']
    if sparks_e.get('angular_size'):
        result['angular_size'] = sparks_e['angular_size']
    if sparks_e.get('instruments'):
        result['instruments_documented'] = True
    return result

# ─── Main ─────────────────────────────────────────────────────────────────────

def main():
    # Ensure output dir exists
    Path("scripts/output").mkdir(parents=True, exist_ok=True)

    # Load current index
    print(f"Loading {INDEX_FILE}...")
    with open(INDEX_FILE, 'r', encoding='utf-8') as f:
        index_data = json.load(f)

    index_cases = index_data['cases']
    print(f"Index has {len(index_cases)} cases")

    # Download and extract PDF
    pdf_path = download_pdf()
    sparks_entries = extract_sparks_entries(pdf_path)

    if not sparks_entries:
        print("ERROR: No entries extracted from PDF. Check the PDF format.")
        sys.exit(1)

    # Cross-reference
    print("Cross-referencing with index...")
    enrichment = match_sparks_to_index(sparks_entries, index_cases)

    # Apply enrichment to index cases
    enriched_count = 0
    coords_added = 0

    for case in index_cases:
        extra = enrichment.get(case['id'], {})
        if extra:
            case.update(extra)
            enriched_count += 1
            if 'lat' in extra:
                coords_added += 1

    # Update metadata
    index_data['metadata']['enrichment_source'] = 'Brad Sparks Comprehensive Catalog of Blue Book Unknowns (CUFOS, 2020)'
    index_data['metadata']['enrichment_url'] = 'https://cufos.org/PDFs/pdfs/BB_Unknowns.pdf'
    index_data['metadata']['enriched_cases'] = enriched_count
    index_data['metadata']['cases_with_coordinates'] = coords_added

    # Write enriched output (do NOT overwrite original)
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(index_data, f, indent=2, ensure_ascii=False)

    print(f"\nDone.")
    print(f"  Enriched: {enriched_count} / {len(index_cases)} cases")
    print(f"  Coordinates added: {coords_added}")
    print(f"  Output: {OUTPUT_FILE}")

    # Write report
    with open(REPORT_FILE, 'w', encoding='utf-8') as f:
        f.write(f"Sparks Extraction Report\n")
        f.write(f"========================\n")
        f.write(f"Sparks entries extracted: {len(sparks_entries)}\n")
        f.write(f"Index cases: {len(index_cases)}\n")
        f.write(f"Enriched: {enriched_count}\n")
        f.write(f"Coordinates added: {coords_added}\n")
        f.write(f"\nUnmatched index cases:\n")
        for case in index_cases:
            if case['id'] not in enrichment:
                f.write(f"  {case['id']} | {case.get('date', '')} | {case.get('location', '')}\n")

    print(f"  Report: {REPORT_FILE}")

if __name__ == '__main__':
    main()
