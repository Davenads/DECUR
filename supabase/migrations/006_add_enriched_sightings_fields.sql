-- Migration 006: Add enriched analytical fields to ufosint_sightings
-- Sourced from ufo_public.db (DuelingGroks export, April 2026).
-- These columns are derived/computed by ufo-dedup's analyze.py pipeline.
-- Also adds 94,063 records not reachable via the MCP API (200-record ceiling).
-- Run import-from-sqlite.mjs after applying this migration.

-- Must drop dependent views before altering table
DROP VIEW IF EXISTS ufosint_shape_counts;
DROP VIEW IF EXISTS ufosint_yearly_counts;
DROP VIEW IF EXISTS ufosint_country_counts;
DROP VIEW IF EXISTS ufosint_source_counts;

ALTER TABLE ufosint_sightings
  ADD COLUMN IF NOT EXISTS hynek              VARCHAR(20),
  ADD COLUMN IF NOT EXISTS vallee             VARCHAR(20),
  ADD COLUMN IF NOT EXISTS svp_rating         VARCHAR(10),
  ADD COLUMN IF NOT EXISTS hoax_likelihood    DECIMAL(4,3),
  ADD COLUMN IF NOT EXISTS standardized_shape VARCHAR(60),
  ADD COLUMN IF NOT EXISTS primary_color      VARCHAR(60),
  ADD COLUMN IF NOT EXISTS vader_compound     DECIMAL(5,4),
  ADD COLUMN IF NOT EXISTS has_description    BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_media          BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS direction          VARCHAR(60),
  ADD COLUMN IF NOT EXISTS duration_bucket    VARCHAR(30),
  ADD COLUMN IF NOT EXISTS movement_type      VARCHAR(30),
  ADD COLUMN IF NOT EXISTS richness_score     SMALLINT,
  ADD COLUMN IF NOT EXISTS event_type         VARCHAR(60);

-- Index for Hynek classification filter (most valuable new search facet)
CREATE INDEX IF NOT EXISTS idx_sightings_hynek
  ON ufosint_sightings (hynek)
  WHERE hynek IS NOT NULL;

-- Index for Vallee classification
CREATE INDEX IF NOT EXISTS idx_sightings_vallee
  ON ufosint_sightings (vallee)
  WHERE vallee IS NOT NULL;

-- Index for standardized shape (canonical form for better grouping)
CREATE INDEX IF NOT EXISTS idx_sightings_std_shape
  ON ufosint_sightings (standardized_shape)
  WHERE standardized_shape IS NOT NULL;

-- Index for hoax likelihood filter
CREATE INDEX IF NOT EXISTS idx_sightings_hoax
  ON ufosint_sightings (hoax_likelihood)
  WHERE hoax_likelihood IS NOT NULL;

-- Index for has_media flag
CREATE INDEX IF NOT EXISTS idx_sightings_has_media
  ON ufosint_sightings (has_media)
  WHERE has_media = TRUE;

-- Recreate views

CREATE OR REPLACE VIEW ufosint_yearly_counts AS
SELECT
  EXTRACT(YEAR FROM date)::INTEGER AS year,
  COUNT(*)::INTEGER                AS count
FROM ufosint_sightings
WHERE date IS NOT NULL
GROUP BY 1
ORDER BY 1;

CREATE OR REPLACE VIEW ufosint_shape_counts AS
SELECT
  COALESCE(standardized_shape, shape) AS value,
  COUNT(*)::INTEGER                   AS count
FROM ufosint_sightings
WHERE COALESCE(standardized_shape, shape) IS NOT NULL
GROUP BY 1
ORDER BY 2 DESC;

CREATE OR REPLACE VIEW ufosint_country_counts AS
SELECT
  country               AS value,
  COUNT(*)::INTEGER     AS count
FROM ufosint_sightings
WHERE country IS NOT NULL AND country != ''
GROUP BY 1
ORDER BY 2 DESC;

CREATE OR REPLACE VIEW ufosint_source_counts AS
SELECT
  source                AS name,
  collection,
  COUNT(*)::INTEGER     AS count
FROM ufosint_sightings
GROUP BY 1, 2
ORDER BY 3 DESC;

-- Helper view: Hynek class distribution
CREATE OR REPLACE VIEW ufosint_hynek_counts AS
SELECT
  hynek                 AS value,
  COUNT(*)::INTEGER     AS count
FROM ufosint_sightings
WHERE hynek IS NOT NULL
GROUP BY 1
ORDER BY 2 DESC;
