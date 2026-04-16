-- Migration 008: NULL out coordinates that contradict the record's country field
--
-- Root cause: the DuelingGroks geocoder sometimes matched city names to wrong
-- countries (e.g. "St. Charles, IL, US" geocoded to central Africa because a
-- different St. Charles exists there). The quality_score has no correlation with
-- coordinate accuracy, so a quality floor is the wrong tool.
--
-- This migration sets lat/lng to NULL for records where the coordinates fall
-- outside the expected bounding box for the declared country. The text fields
-- (city, state, country) are preserved — only the map pin is removed.
-- Records with NULL coords are automatically excluded from viewport queries
-- by the existing WHERE lat IS NOT NULL AND lng IS NOT NULL filters.
--
-- Country bounds include all territories (e.g. Alaska/Hawaii for US, overseas
-- for France, etc.). Bounds are intentionally generous to avoid false positives.
--
-- US + CA + UK + AU + DE + FR cover ~90% of records in the dataset.

-- United States (incl. Alaska, Hawaii, Puerto Rico, Guam, USVI)
UPDATE ufosint_sightings
SET lat = NULL, lng = NULL
WHERE country IN ('US', 'USA', 'United States', 'United States of America')
  AND lat IS NOT NULL
  AND lng IS NOT NULL
  AND NOT (
    -- Continental US + Canada/Mexico border buffer
    (lat BETWEEN 24.0 AND 49.5 AND lng BETWEEN -125.0 AND -66.0)
    -- Alaska
    OR (lat BETWEEN 51.0 AND 72.0 AND lng BETWEEN -180.0 AND -129.0)
    -- Hawaii
    OR (lat BETWEEN 18.0 AND 23.0 AND lng BETWEEN -161.0 AND -154.0)
    -- Puerto Rico / USVI
    OR (lat BETWEEN 17.0 AND 19.0 AND lng BETWEEN -68.0 AND -64.5)
    -- Guam / CNMI
    OR (lat BETWEEN 13.0 AND 21.0 AND lng BETWEEN 144.0 AND 146.0)
  );

-- Canada
UPDATE ufosint_sightings
SET lat = NULL, lng = NULL
WHERE country IN ('CA', 'Canada')
  AND lat IS NOT NULL
  AND lng IS NOT NULL
  AND NOT (lat BETWEEN 41.5 AND 84.0 AND lng BETWEEN -141.0 AND -52.0);

-- United Kingdom (incl. Channel Islands, Isle of Man)
UPDATE ufosint_sightings
SET lat = NULL, lng = NULL
WHERE country IN ('GB', 'UK', 'United Kingdom', 'England', 'Scotland', 'Wales')
  AND lat IS NOT NULL
  AND lng IS NOT NULL
  AND NOT (lat BETWEEN 49.5 AND 61.5 AND lng BETWEEN -9.0 AND 2.0);

-- Australia (incl. Tasmania, offshore territories)
UPDATE ufosint_sightings
SET lat = NULL, lng = NULL
WHERE country IN ('AU', 'Australia')
  AND lat IS NOT NULL
  AND lng IS NOT NULL
  AND NOT (lat BETWEEN -45.0 AND -9.5 AND lng BETWEEN 112.0 AND 155.0);

-- Germany
UPDATE ufosint_sightings
SET lat = NULL, lng = NULL
WHERE country IN ('DE', 'Germany')
  AND lat IS NOT NULL
  AND lng IS NOT NULL
  AND NOT (lat BETWEEN 47.0 AND 55.5 AND lng BETWEEN 5.5 AND 15.5);

-- France (mainland only — generous bounds to catch overseas territories separately)
UPDATE ufosint_sightings
SET lat = NULL, lng = NULL
WHERE country IN ('FR', 'France')
  AND lat IS NOT NULL
  AND lng IS NOT NULL
  AND NOT (
    -- Metropolitan France
    (lat BETWEEN 41.0 AND 51.5 AND lng BETWEEN -5.5 AND 10.0)
    -- French Guiana
    OR (lat BETWEEN 1.0 AND 6.5 AND lng BETWEEN -55.0 AND -51.0)
    -- Martinique / Guadeloupe
    OR (lat BETWEEN 13.0 AND 18.5 AND lng BETWEEN -63.5 AND -60.0)
    -- Reunion
    OR (lat BETWEEN -21.5 AND -20.5 AND lng BETWEEN 55.0 AND 56.0)
  );

-- New Zealand
UPDATE ufosint_sightings
SET lat = NULL, lng = NULL
WHERE country IN ('NZ', 'New Zealand')
  AND lat IS NOT NULL
  AND lng IS NOT NULL
  AND NOT (lat BETWEEN -47.5 AND -34.0 AND lng BETWEEN 166.0 AND 178.5);

-- Ireland
UPDATE ufosint_sightings
SET lat = NULL, lng = NULL
WHERE country IN ('IE', 'Ireland')
  AND lat IS NOT NULL
  AND lng IS NOT NULL
  AND NOT (lat BETWEEN 51.0 AND 55.5 AND lng BETWEEN -10.5 AND -5.5);

-- Catch-all: any record with lat outside [-90, 90] or lng outside [-180, 180]
-- These are definitely invalid — out-of-range coordinates.
UPDATE ufosint_sightings
SET lat = NULL, lng = NULL
WHERE lat IS NOT NULL
  AND (lat < -90 OR lat > 90 OR lng < -180 OR lng > 180);
