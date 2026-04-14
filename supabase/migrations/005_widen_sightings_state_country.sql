-- Migration 005: Widen state and country columns in ufosint_sightings
-- The import discovered UFOSINT returns full state/country names (e.g. "PENNSYLVANIA"),
-- not just codes. VARCHAR(10) was too narrow.
-- Must drop dependent views before altering column types.

DROP VIEW IF EXISTS ufosint_country_counts;
DROP VIEW IF EXISTS ufosint_source_counts;

ALTER TABLE ufosint_sightings
  ALTER COLUMN state   TYPE VARCHAR(120),
  ALTER COLUMN country TYPE VARCHAR(120);

-- Recreate views

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
