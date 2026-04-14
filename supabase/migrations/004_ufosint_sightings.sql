-- Migration 004: UFOSINT sightings table for Phase 3 self-hosting
-- Stores de-duplicated community UAP sighting reports from NUFORC, MUFON,
-- UFOCAT, Vallee UPDB, and UFO-search (614,505 records).
-- Schema matches UFOSINT's public API response format for drop-in proxy replacement.

CREATE TABLE IF NOT EXISTS ufosint_sightings (
  id            INTEGER PRIMARY KEY,
  date          DATE,
  shape         VARCHAR(60),
  source        VARCHAR(60)   NOT NULL,
  city          VARCHAR(120),
  state         VARCHAR(10),
  country       VARCHAR(10),
  lat           DECIMAL(9, 6),
  lng           DECIMAL(9, 6),
  quality_score SMALLINT      CHECK (quality_score BETWEEN 0 AND 100),
  description   TEXT,
  duration      VARCHAR(120),
  witnesses     SMALLINT,
  emotion_label VARCHAR(60),
  collection    VARCHAR(60),
  created_at    TIMESTAMPTZ   DEFAULT NOW()
);

-- Indexes for the query patterns used by /api/sightings/*

-- Geographic bbox queries (heatmap, case-proximity)
CREATE INDEX IF NOT EXISTS idx_sightings_geo
  ON ufosint_sightings (lat, lng)
  WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Quality score filter (default: >= 60)
CREATE INDEX IF NOT EXISTS idx_sightings_quality
  ON ufosint_sightings (quality_score);

-- Date range queries (temporal chart, yearly counts)
CREATE INDEX IF NOT EXISTS idx_sightings_date
  ON ufosint_sightings (date);

-- Source breakdown queries
CREATE INDEX IF NOT EXISTS idx_sightings_source
  ON ufosint_sightings (source);

-- Shape distribution queries
CREATE INDEX IF NOT EXISTS idx_sightings_shape
  ON ufosint_sightings (shape);

-- Combined geo + quality index for filtered heatmap queries
CREATE INDEX IF NOT EXISTS idx_sightings_geo_quality
  ON ufosint_sightings (lat, lng, quality_score)
  WHERE lat IS NOT NULL AND lng IS NOT NULL;

-- Row-level security: sightings are public read-only
ALTER TABLE ufosint_sightings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sightings_public_read"
  ON ufosint_sightings
  FOR SELECT
  TO public
  USING (true);

-- Prevent any writes from the anon key (data loaded via service role only)
CREATE POLICY "sightings_no_insert"
  ON ufosint_sightings
  FOR INSERT
  TO anon
  WITH CHECK (false);

-- Helper view: yearly sighting counts (replaces static yearly-counts.json)
CREATE OR REPLACE VIEW ufosint_yearly_counts AS
SELECT
  EXTRACT(YEAR FROM date)::INTEGER AS year,
  COUNT(*)::INTEGER                AS count
FROM ufosint_sightings
WHERE date IS NOT NULL
GROUP BY 1
ORDER BY 1;

-- Helper view: shape distribution (replaces static shape-counts.json)
CREATE OR REPLACE VIEW ufosint_shape_counts AS
SELECT
  shape                 AS value,
  COUNT(*)::INTEGER     AS count
FROM ufosint_sightings
WHERE shape IS NOT NULL
GROUP BY 1
ORDER BY 2 DESC;

-- Helper view: country distribution (replaces static top-countries.json)
CREATE OR REPLACE VIEW ufosint_country_counts AS
SELECT
  country               AS value,
  COUNT(*)::INTEGER     AS count
FROM ufosint_sightings
WHERE country IS NOT NULL AND country != ''
GROUP BY 1
ORDER BY 2 DESC;

-- Helper view: source counts (replaces stats.json by_source)
CREATE OR REPLACE VIEW ufosint_source_counts AS
SELECT
  source                AS name,
  collection,
  COUNT(*)::INTEGER     AS count
FROM ufosint_sightings
GROUP BY 1, 2
ORDER BY 3 DESC;
