-- Migration 011: Add fields from ufo_public_v2.db (DuelingGroks, April 2026)
--
-- New in v2:
--   - description         — full sighting narrative text (LLM-processed Reddit batch)
--   - has_photo/has_video — split from the old has_media boolean
--   - llm_*               — LLM analysis fields (strangeness, anomaly assessment, confidence)
--   - reddit_post_id/url  — Reddit source attribution for LLM-processed records
--   - distance/name       — proximity to nearest nuclear facility (67% coverage)
--
-- Run import-from-sqlite.mjs with SQLITE_DB_PATH pointing at ufo_public_v2.db
-- after applying this migration.

ALTER TABLE ufosint_sightings
  -- Full sighting narrative (only populated for LLM-processed records, ~3.8k records)
  ADD COLUMN IF NOT EXISTS description                    TEXT,

  -- Granular media flags (replaces has_media conceptually; has_media is retained for compat)
  ADD COLUMN IF NOT EXISTS has_photo                      BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS has_video                      BOOLEAN DEFAULT FALSE,

  -- Reddit source attribution
  ADD COLUMN IF NOT EXISTS reddit_post_id                 VARCHAR(20),
  ADD COLUMN IF NOT EXISTS reddit_url                     TEXT,

  -- LLM analysis (DuelingGroks pipeline; only on LLM-processed records)
  ADD COLUMN IF NOT EXISTS llm_strangeness_rating         SMALLINT,          -- 1-5 scale
  ADD COLUMN IF NOT EXISTS llm_anomaly_assessment         VARCHAR(30),       -- 'prosaic' | 'anomalous' | 'ambiguous'
  ADD COLUMN IF NOT EXISTS llm_confidence                 VARCHAR(20),       -- 'low' | 'medium' | 'high'
  ADD COLUMN IF NOT EXISTS llm_prosaic_candidate          TEXT,

  -- Nuclear proximity (enriched for ~418k records)
  ADD COLUMN IF NOT EXISTS distance_to_nearest_nuclear_site_km  NUMERIC(10,2),
  ADD COLUMN IF NOT EXISTS nearest_nuclear_site_name            VARCHAR(200);

-- Index: LLM strangeness rating (useful for quality-tier filtering on the map)
CREATE INDEX IF NOT EXISTS idx_sightings_llm_strangeness
  ON ufosint_sightings (llm_strangeness_rating)
  WHERE llm_strangeness_rating IS NOT NULL;

-- Index: LLM anomaly assessment
CREATE INDEX IF NOT EXISTS idx_sightings_llm_anomaly
  ON ufosint_sightings (llm_anomaly_assessment)
  WHERE llm_anomaly_assessment IS NOT NULL;

-- Index: nuclear proximity distance (for range queries)
CREATE INDEX IF NOT EXISTS idx_sightings_nuclear_dist
  ON ufosint_sightings (distance_to_nearest_nuclear_site_km)
  WHERE distance_to_nearest_nuclear_site_km IS NOT NULL;
