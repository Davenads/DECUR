-- Migration 007: Add quality_score DESC index for fast viewport pin queries
--
-- The /api/sightings/viewport query orders by quality_score DESC and limits to
-- 500 rows from up to 396k geocoded sightings. Without a DESC index, PostgreSQL
-- must scan and sort all geocoded rows — at world zoom (full globe bbox) this
-- means processing the entire table on every request.
--
-- This index lets the planner do a backward index scan on quality_score, returning
-- the top 500 rows immediately. For zoomed-in views, the planner can use the
-- existing geo index (idx_sightings_geo) to filter by bbox, then sort in memory
-- on the much smaller result set.
--
-- Apply to both decur-dev and prod Supabase projects:
--   npx supabase link --project-ref iyvngosoyzptliytlcov
--   echo "Y" | npx supabase db push

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_sightings_quality_desc
  ON ufosint_sightings (quality_score DESC NULLS LAST)
  WHERE lat IS NOT NULL AND lng IS NOT NULL;
