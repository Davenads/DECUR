-- null_out_of_bounds_coords_v2.sql
--
-- Null out lat/lng for records where coordinates contradict the stated country
-- or (for US records) the stated state.
--
-- Preserves all text data — only the bad map pin is removed so the record
-- remains searchable but is not plotted in the wrong location.
--
-- Tested against ufosint_sightings (614,503 records, Supabase/PostgreSQL).
-- Safe to re-run — already-nulled records (lat IS NULL) are skipped.
--
-- What this catches:
--   1. Out-of-range  — lat outside ±90 or lng outside ±180 (corrupt source data)
--   2. Null Island   — (0, 0) is a geocoding default, not a real location
--   3. Country bbox  — coordinates fall outside the stated country's bounding box
--   4. US state bbox — coordinates fall outside the stated US state's bounding box
--                      (catches homonymous city geocoding: "Windham OH" geocoded
--                       to Windham CT, "Strasburg VA" geocoded to Strasbourg FR, etc.)
--
-- Results on our 614k corpus:
--   Pass 1 (original 8-country):        419 nulled
--   Pass 2 (expanded 124-country):      158 nulled
--   Pass 3 (US state-level):         22,118 nulled
--   Total:                            22,695 nulled  (5.85% of geocoded records)
--
-- Country codes in the source data are typically 2-letter ISO codes (US, GB, etc.).
-- The UPPER() / ILIKE pattern handles mixed-case variants.
-- ─────────────────────────────────────────────────────────────────────────────


-- ── 1. Out-of-range coordinates ───────────────────────────────────────────────
-- Physically impossible values — corrupt source data.

UPDATE ufosint_sightings
SET lat = NULL, lng = NULL
WHERE lat IS NOT NULL
  AND (lat < -90 OR lat > 90 OR lng < -180 OR lng > 180);


-- ── 2. Null Island ────────────────────────────────────────────────────────────
-- (0, 0) in the Gulf of Guinea — the default when a geocoder fails silently.

UPDATE ufosint_sightings
SET lat = NULL, lng = NULL
WHERE lat = 0 AND lng = 0;


-- ── 3. Country bounding-box validation ───────────────────────────────────────
-- Each UPDATE removes records whose coordinates fall outside the stated
-- country's bounding box.  Countries not listed pass through unchecked
-- (safe default — don't reject what we can't verify).

-- ── North America ─────────────────────────────────────────────────────────────

-- United States (CONUS + Alaska + Hawaii + Puerto Rico)
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('US', 'USA', 'UNITED STATES', 'UNITED STATES OF AMERICA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 18.9 AND 72.0 AND lng BETWEEN -180.0 AND -66.0);

-- Canada
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('CA', 'CANADA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 41.7 AND 83.1 AND lng BETWEEN -141.0 AND -52.6);

-- Mexico
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('MX', 'MEXICO')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 14.5 AND 32.7 AND lng BETWEEN -117.1 AND -86.7);

-- Puerto Rico
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('PR', 'PUERTO RICO')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 17.9 AND 18.5 AND lng BETWEEN -67.3 AND -65.6);

-- Guatemala
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('GT', 'GUATEMALA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 13.7 AND 17.8 AND lng BETWEEN -92.3 AND -88.2);

-- Honduras
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('HN', 'HONDURAS')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 13.0 AND 16.5 AND lng BETWEEN -89.4 AND -83.1);

-- Costa Rica
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('CR', 'COSTA RICA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 8.0 AND 11.2 AND lng BETWEEN -85.9 AND -82.6);

-- Panama
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('PA', 'PANAMA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 7.2 AND 9.6 AND lng BETWEEN -83.0 AND -77.1);

-- Dominican Republic
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('DO', 'DOMINICAN REPUBLIC')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 17.5 AND 20.0 AND lng BETWEEN -72.0 AND -68.3);

-- Cuba
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('CU', 'CUBA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 19.8 AND 23.2 AND lng BETWEEN -85.0 AND -74.2);

-- Jamaica
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('JM', 'JAMAICA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 17.7 AND 18.5 AND lng BETWEEN -78.4 AND -76.2);

-- ── Europe ─────────────────────────────────────────────────────────────────────

-- United Kingdom
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('GB', 'UK', 'UNITED KINGDOM', 'ENGLAND', 'SCOTLAND', 'WALES')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 49.9 AND 60.9 AND lng BETWEEN -8.2 AND 1.8);

-- Germany
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('DE', 'GERMANY', 'DEUTSCHLAND')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 47.3 AND 55.1 AND lng BETWEEN 5.9 AND 15.1);

-- France
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('FR', 'FRANCE')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 41.3 AND 51.1 AND lng BETWEEN -5.2 AND 9.6);

-- Spain
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('ES', 'SPAIN', 'ESPANA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 27.6 AND 43.8 AND lng BETWEEN -18.2 AND 4.3);

-- Italy
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('IT', 'ITALY', 'ITALIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 35.5 AND 47.1 AND lng BETWEEN 6.6 AND 18.5);

-- Netherlands
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('NL', 'NETHERLANDS', 'HOLLAND')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 50.8 AND 53.6 AND lng BETWEEN 3.4 AND 7.2);

-- Belgium
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('BE', 'BELGIUM')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 49.5 AND 51.5 AND lng BETWEEN 2.5 AND 6.4);

-- Switzerland
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('CH', 'SWITZERLAND')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 45.8 AND 47.8 AND lng BETWEEN 5.9 AND 10.5);

-- Austria
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('AT', 'AUSTRIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 46.4 AND 49.0 AND lng BETWEEN 9.5 AND 17.2);

-- Sweden
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('SE', 'SWEDEN')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 55.3 AND 69.1 AND lng BETWEEN 11.1 AND 24.2);

-- Norway
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('NO', 'NORWAY')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 57.9 AND 71.2 AND lng BETWEEN 4.5 AND 31.2);

-- Finland
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('FI', 'FINLAND')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 59.8 AND 70.1 AND lng BETWEEN 20.6 AND 31.6);

-- Denmark
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('DK', 'DENMARK')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 54.6 AND 57.8 AND lng BETWEEN 8.1 AND 15.2);

-- Ireland
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('IE', 'IRELAND')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 51.4 AND 55.4 AND lng BETWEEN -10.5 AND -6.0);

-- Poland
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('PL', 'POLAND')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 49.0 AND 54.9 AND lng BETWEEN 14.1 AND 24.2);

-- Portugal
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('PT', 'PORTUGAL')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 32.6 AND 42.2 AND lng BETWEEN -31.3 AND -6.2);

-- Greece
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('GR', 'GREECE')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 34.8 AND 41.8 AND lng BETWEEN 19.4 AND 29.6);

-- Czech Republic
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('CZ', 'CZECH REPUBLIC', 'CZECHIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 48.6 AND 51.1 AND lng BETWEEN 12.1 AND 18.9);

-- Hungary
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('HU', 'HUNGARY')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 45.7 AND 48.6 AND lng BETWEEN 16.1 AND 22.9);

-- Romania
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('RO', 'ROMANIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 43.6 AND 48.3 AND lng BETWEEN 20.3 AND 29.7);

-- Ukraine
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('UA', 'UKRAINE')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 44.4 AND 52.4 AND lng BETWEEN 22.1 AND 40.2);

-- Russia (wraps antimeridian — lat-only check sufficient)
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('RU', 'RUSSIA', 'RUSSIAN FEDERATION')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 41.2 AND 77.7);

-- Bulgaria
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('BG', 'BULGARIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 41.2 AND 44.2 AND lng BETWEEN 22.4 AND 28.6);

-- Croatia
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('HR', 'CROATIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 42.4 AND 46.6 AND lng BETWEEN 13.5 AND 19.5);

-- Serbia
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('RS', 'SERBIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 42.2 AND 46.2 AND lng BETWEEN 18.8 AND 23.0);

-- Slovakia
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('SK', 'SLOVAKIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 47.7 AND 49.6 AND lng BETWEEN 16.8 AND 22.6);

-- Latvia, Lithuania, Estonia
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('LV', 'LATVIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 55.7 AND 58.1 AND lng BETWEEN 20.9 AND 28.2);
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('LT', 'LITHUANIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 53.9 AND 56.5 AND lng BETWEEN 21.0 AND 26.8);
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('EE', 'ESTONIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 57.5 AND 59.7 AND lng BETWEEN 21.8 AND 28.2);

-- Belarus
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('BY', 'BELARUS')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 51.3 AND 56.2 AND lng BETWEEN 23.2 AND 32.8);

-- ── Oceania ────────────────────────────────────────────────────────────────────

-- Australia
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('AU', 'AUSTRALIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN -43.7 AND -10.7 AND lng BETWEEN 113.0 AND 153.8);

-- New Zealand
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('NZ', 'NEW ZEALAND')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN -47.3 AND -34.4 AND lng BETWEEN 166.4 AND 178.6);

-- ── Asia-Pacific ───────────────────────────────────────────────────────────────

-- Japan
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('JP', 'JAPAN')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 24.0 AND 45.7 AND lng BETWEEN 122.9 AND 153.6);

-- China
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('CN', 'CHINA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 18.2 AND 53.6 AND lng BETWEEN 73.4 AND 134.8);

-- India
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('IN', 'INDIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 8.1 AND 37.1 AND lng BETWEEN 68.2 AND 97.4);

-- South Korea
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('KR', 'SOUTH KOREA', 'KOREA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 33.1 AND 38.6 AND lng BETWEEN 125.1 AND 129.6);

-- Philippines
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('PH', 'PHILIPPINES')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 4.6 AND 21.1 AND lng BETWEEN 116.9 AND 126.6);

-- Thailand
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('TH', 'THAILAND')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 5.6 AND 20.5 AND lng BETWEEN 97.3 AND 105.7);

-- Indonesia
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('ID', 'INDONESIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN -8.8 AND 5.9 AND lng BETWEEN 95.0 AND 141.0);

-- Malaysia
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('MY', 'MALAYSIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 0.9 AND 7.4 AND lng BETWEEN 99.6 AND 119.3);

-- Vietnam
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('VN', 'VIETNAM')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 8.5 AND 23.4 AND lng BETWEEN 102.1 AND 109.5);

-- Taiwan
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('TW', 'TAIWAN')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 21.9 AND 25.3 AND lng BETWEEN 120.0 AND 122.0);

-- Singapore
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('SG', 'SINGAPORE')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 1.2 AND 1.5 AND lng BETWEEN 103.6 AND 104.1);

-- Pakistan
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('PK', 'PAKISTAN')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 23.7 AND 37.1 AND lng BETWEEN 60.9 AND 77.8);

-- ── Latin America ──────────────────────────────────────────────────────────────

-- Brazil
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('BR', 'BRAZIL', 'BRASIL')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN -33.8 AND 5.3 AND lng BETWEEN -73.9 AND -34.8);

-- Argentina
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('AR', 'ARGENTINA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN -55.1 AND -21.8 AND lng BETWEEN -73.6 AND -53.6);

-- Chile
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('CL', 'CHILE')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN -55.9 AND -17.5 AND lng BETWEEN -75.7 AND -66.4);

-- Colombia
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('CO', 'COLOMBIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN -4.2 AND 13.4 AND lng BETWEEN -79.0 AND -66.9);

-- Venezuela
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('VE', 'VENEZUELA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 0.7 AND 12.2 AND lng BETWEEN -73.4 AND -59.8);

-- Peru
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('PE', 'PERU')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN -18.4 AND -0.1 AND lng BETWEEN -81.4 AND -68.7);

-- Bolivia
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('BO', 'BOLIVIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN -22.9 AND -9.7 AND lng BETWEEN -69.7 AND -57.5);

-- Ecuador
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('EC', 'ECUADOR')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN -5.0 AND 1.5 AND lng BETWEEN -81.0 AND -75.2);

-- Uruguay
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('UY', 'URUGUAY')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN -34.9 AND -30.1 AND lng BETWEEN -58.5 AND -53.1);

-- ── Africa ─────────────────────────────────────────────────────────────────────

-- South Africa
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('ZA', 'SOUTH AFRICA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN -34.8 AND -22.1 AND lng BETWEEN 16.5 AND 32.9);

-- Egypt
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('EG', 'EGYPT')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 22.0 AND 31.7 AND lng BETWEEN 24.7 AND 37.1);

-- Nigeria
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('NG', 'NIGERIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 4.3 AND 13.9 AND lng BETWEEN 2.7 AND 14.7);

-- Kenya
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('KE', 'KENYA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN -4.7 AND 5.0 AND lng BETWEEN 33.9 AND 42.0);

-- Morocco
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('MA', 'MOROCCO')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 27.7 AND 35.9 AND lng BETWEEN -13.2 AND -1.0);

-- Algeria
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('DZ', 'ALGERIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 18.9 AND 37.1 AND lng BETWEEN -8.7 AND 9.0);

-- Tunisia
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('TN', 'TUNISIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 30.2 AND 37.5 AND lng BETWEEN 7.5 AND 11.6);

-- Ethiopia
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('ET', 'ETHIOPIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 3.4 AND 15.0 AND lng BETWEEN 33.0 AND 48.0);

-- ── Middle East ────────────────────────────────────────────────────────────────

-- Israel
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('IL', 'ISRAEL')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 29.5 AND 33.3 AND lng BETWEEN 34.3 AND 35.9);

-- Turkey
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('TR', 'TURKEY', 'TURKIYE')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 35.8 AND 42.1 AND lng BETWEEN 25.7 AND 44.8);

-- Saudi Arabia
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('SA', 'SAUDI ARABIA')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 16.4 AND 32.2 AND lng BETWEEN 34.6 AND 55.7);

-- United Arab Emirates
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('AE', 'UAE', 'UNITED ARAB EMIRATES')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 22.6 AND 26.1 AND lng BETWEEN 51.6 AND 56.4);

-- Iran
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('IR', 'IRAN')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 25.1 AND 39.8 AND lng BETWEEN 44.0 AND 63.3);

-- Iraq
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('IQ', 'IRAQ')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 29.1 AND 37.4 AND lng BETWEEN 38.8 AND 48.8);

-- ── Central Asia ───────────────────────────────────────────────────────────────

-- Kazakhstan
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('KZ', 'KAZAKHSTAN')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 41.0 AND 55.4 AND lng BETWEEN 51.0 AND 87.4);

-- Afghanistan
UPDATE ufosint_sightings SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('AF', 'AFGHANISTAN')
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (lat BETWEEN 29.4 AND 38.5 AND lng BETWEEN 60.5 AND 74.9);


-- ── 4. US state bounding-box validation ───────────────────────────────────────
--
-- For US records only: validate that coordinates fall within the stated state.
-- This is the highest-yield pass — catches homonymous city geocoding errors,
-- e.g. "Windham, OH" geocoded to Windham CT; "Strasburg, VA" to Strasbourg FR
-- (which was already caught above), "Webster, NY" to Webster MO.
--
-- Assumes the state column contains standard 2-letter USPS codes (AK, CA, etc.)
-- Mixed case is handled by UPPER(). Unrecognised codes pass through unchecked.
--
-- Wrapped in a single UPDATE with one OR branch per state for efficiency.

UPDATE ufosint_sightings
SET lat = NULL, lng = NULL
WHERE UPPER(country) IN ('US', 'USA', 'UNITED STATES')
  AND state IS NOT NULL
  AND lat IS NOT NULL AND lng IS NOT NULL
  AND NOT (
    -- Alaska
    (UPPER(state) = 'AK' AND lat BETWEEN 51.2 AND 71.4 AND lng BETWEEN -180.0 AND -130.0)
    -- Alabama
    OR (UPPER(state) = 'AL' AND lat BETWEEN 30.1 AND 35.1 AND lng BETWEEN -88.5 AND -84.9)
    -- Arkansas
    OR (UPPER(state) = 'AR' AND lat BETWEEN 33.0 AND 36.5 AND lng BETWEEN -94.7 AND -89.6)
    -- Arizona
    OR (UPPER(state) = 'AZ' AND lat BETWEEN 31.3 AND 37.0 AND lng BETWEEN -114.9 AND -109.0)
    -- California
    OR (UPPER(state) = 'CA' AND lat BETWEEN 32.5 AND 42.0 AND lng BETWEEN -124.5 AND -114.1)
    -- Colorado
    OR (UPPER(state) = 'CO' AND lat BETWEEN 36.9 AND 41.1 AND lng BETWEEN -109.1 AND -102.0)
    -- Connecticut
    OR (UPPER(state) = 'CT' AND lat BETWEEN 40.9 AND 42.1 AND lng BETWEEN -73.7 AND -71.8)
    -- Washington D.C.
    OR (UPPER(state) = 'DC' AND lat BETWEEN 38.8 AND 39.0 AND lng BETWEEN -77.1 AND -76.9)
    -- Delaware
    OR (UPPER(state) = 'DE' AND lat BETWEEN 38.4 AND 39.9 AND lng BETWEEN -75.8 AND -75.0)
    -- Florida
    OR (UPPER(state) = 'FL' AND lat BETWEEN 24.4 AND 31.1 AND lng BETWEEN -87.7 AND -80.0)
    -- Georgia
    OR (UPPER(state) = 'GA' AND lat BETWEEN 30.4 AND 35.0 AND lng BETWEEN -85.7 AND -80.8)
    -- Hawaii
    OR (UPPER(state) = 'HI' AND lat BETWEEN 18.9 AND 22.3 AND lng BETWEEN -160.3 AND -154.8)
    -- Iowa
    OR (UPPER(state) = 'IA' AND lat BETWEEN 40.4 AND 43.5 AND lng BETWEEN -96.6 AND -90.1)
    -- Idaho
    OR (UPPER(state) = 'ID' AND lat BETWEEN 41.9 AND 49.1 AND lng BETWEEN -117.2 AND -111.0)
    -- Illinois
    OR (UPPER(state) = 'IL' AND lat BETWEEN 36.9 AND 42.5 AND lng BETWEEN -91.5 AND -87.5)
    -- Indiana
    OR (UPPER(state) = 'IN' AND lat BETWEEN 37.8 AND 41.8 AND lng BETWEEN -88.1 AND -84.8)
    -- Kansas
    OR (UPPER(state) = 'KS' AND lat BETWEEN 37.0 AND 40.0 AND lng BETWEEN -102.1 AND -94.6)
    -- Kentucky
    OR (UPPER(state) = 'KY' AND lat BETWEEN 36.5 AND 39.2 AND lng BETWEEN -89.6 AND -81.9)
    -- Louisiana
    OR (UPPER(state) = 'LA' AND lat BETWEEN 28.9 AND 33.1 AND lng BETWEEN -94.2 AND -88.8)
    -- Massachusetts
    OR (UPPER(state) = 'MA' AND lat BETWEEN 41.2 AND 42.9 AND lng BETWEEN -73.5 AND -69.9)
    -- Maryland
    OR (UPPER(state) = 'MD' AND lat BETWEEN 37.9 AND 39.8 AND lng BETWEEN -79.5 AND -75.0)
    -- Maine
    OR (UPPER(state) = 'ME' AND lat BETWEEN 43.1 AND 47.5 AND lng BETWEEN -71.1 AND -66.9)
    -- Michigan (incl. Upper Peninsula)
    OR (UPPER(state) = 'MI' AND lat BETWEEN 41.7 AND 48.3 AND lng BETWEEN -90.4 AND -82.4)
    -- Minnesota
    OR (UPPER(state) = 'MN' AND lat BETWEEN 43.5 AND 49.4 AND lng BETWEEN -97.2 AND -89.5)
    -- Missouri
    OR (UPPER(state) = 'MO' AND lat BETWEEN 35.9 AND 40.6 AND lng BETWEEN -95.8 AND -89.1)
    -- Mississippi
    OR (UPPER(state) = 'MS' AND lat BETWEEN 30.2 AND 35.0 AND lng BETWEEN -91.7 AND -88.1)
    -- Montana
    OR (UPPER(state) = 'MT' AND lat BETWEEN 44.4 AND 49.1 AND lng BETWEEN -116.1 AND -104.0)
    -- North Carolina
    OR (UPPER(state) = 'NC' AND lat BETWEEN 33.8 AND 36.6 AND lng BETWEEN -84.4 AND -75.5)
    -- North Dakota
    OR (UPPER(state) = 'ND' AND lat BETWEEN 45.9 AND 49.1 AND lng BETWEEN -104.1 AND -96.6)
    -- Nebraska
    OR (UPPER(state) = 'NE' AND lat BETWEEN 40.0 AND 43.0 AND lng BETWEEN -104.1 AND -95.3)
    -- New Hampshire
    OR (UPPER(state) = 'NH' AND lat BETWEEN 42.7 AND 45.3 AND lng BETWEEN -72.6 AND -70.6)
    -- New Jersey
    OR (UPPER(state) = 'NJ' AND lat BETWEEN 38.9 AND 41.4 AND lng BETWEEN -75.6 AND -74.0)
    -- New Mexico
    OR (UPPER(state) = 'NM' AND lat BETWEEN 31.3 AND 37.0 AND lng BETWEEN -109.1 AND -103.0)
    -- Nevada
    OR (UPPER(state) = 'NV' AND lat BETWEEN 35.0 AND 42.1 AND lng BETWEEN -120.0 AND -114.0)
    -- New York
    OR (UPPER(state) = 'NY' AND lat BETWEEN 40.5 AND 45.0 AND lng BETWEEN -79.8 AND -71.9)
    -- Ohio
    OR (UPPER(state) = 'OH' AND lat BETWEEN 38.4 AND 42.3 AND lng BETWEEN -84.8 AND -80.5)
    -- Oklahoma
    OR (UPPER(state) = 'OK' AND lat BETWEEN 33.6 AND 37.0 AND lng BETWEEN -103.0 AND -94.4)
    -- Oregon
    OR (UPPER(state) = 'OR' AND lat BETWEEN 42.0 AND 46.2 AND lng BETWEEN -124.7 AND -116.5)
    -- Pennsylvania
    OR (UPPER(state) = 'PA' AND lat BETWEEN 39.7 AND 42.3 AND lng BETWEEN -80.5 AND -74.7)
    -- Rhode Island
    OR (UPPER(state) = 'RI' AND lat BETWEEN 41.1 AND 42.0 AND lng BETWEEN -71.9 AND -71.1)
    -- South Carolina
    OR (UPPER(state) = 'SC' AND lat BETWEEN 32.0 AND 35.2 AND lng BETWEEN -83.4 AND -78.5)
    -- South Dakota
    OR (UPPER(state) = 'SD' AND lat BETWEEN 42.5 AND 45.9 AND lng BETWEEN -104.1 AND -96.4)
    -- Tennessee
    OR (UPPER(state) = 'TN' AND lat BETWEEN 34.9 AND 36.7 AND lng BETWEEN -90.3 AND -81.6)
    -- Texas
    OR (UPPER(state) = 'TX' AND lat BETWEEN 25.8 AND 36.5 AND lng BETWEEN -106.7 AND -93.5)
    -- Utah
    OR (UPPER(state) = 'UT' AND lat BETWEEN 37.0 AND 42.0 AND lng BETWEEN -114.1 AND -109.0)
    -- Virginia
    OR (UPPER(state) = 'VA' AND lat BETWEEN 36.5 AND 39.5 AND lng BETWEEN -83.7 AND -75.2)
    -- Vermont
    OR (UPPER(state) = 'VT' AND lat BETWEEN 42.7 AND 45.0 AND lng BETWEEN -73.4 AND -71.5)
    -- Washington
    OR (UPPER(state) = 'WA' AND lat BETWEEN 45.5 AND 49.0 AND lng BETWEEN -124.8 AND -116.9)
    -- Wisconsin
    OR (UPPER(state) = 'WI' AND lat BETWEEN 42.5 AND 47.1 AND lng BETWEEN -92.9 AND -86.2)
    -- West Virginia
    OR (UPPER(state) = 'WV' AND lat BETWEEN 37.2 AND 40.6 AND lng BETWEEN -82.6 AND -77.7)
    -- Wyoming
    OR (UPPER(state) = 'WY' AND lat BETWEEN 41.0 AND 45.0 AND lng BETWEEN -111.1 AND -104.1)
  );
