-- Migration 010: Timeline events table for server-side filtering and FTS
-- Replaces the 1 MB client-side timeline.json payload in pages/timeline.tsx.
-- Populated by scripts/populate-timeline.mjs from data/timeline.json.
-- Enables: year-range filtering, category filtering, paginated results,
--          and Postgres FTS replacing the current JS includes() text search.

CREATE TABLE IF NOT EXISTS timeline_events (
  id          INTEGER PRIMARY KEY,
  date        TEXT NOT NULL,
  year        INTEGER NOT NULL,
  title       TEXT NOT NULL,
  excerpt     TEXT,
  categories  TEXT[] NOT NULL DEFAULT '{}',
  source_url  TEXT,
  article_url TEXT,
  search_vec  TSVECTOR,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger: recomputes search_vec on insert/update
CREATE OR REPLACE FUNCTION timeline_events_update_vec()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vec :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.excerpt, '')), 'B');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER timeline_events_vec_trigger
  BEFORE INSERT OR UPDATE ON timeline_events
  FOR EACH ROW EXECUTE FUNCTION timeline_events_update_vec();

-- Indexes
CREATE INDEX IF NOT EXISTS timeline_year_idx        ON timeline_events (year);
CREATE INDEX IF NOT EXISTS timeline_categories_idx  ON timeline_events USING GIN (categories);
CREATE INDEX IF NOT EXISTS timeline_search_vec_idx  ON timeline_events USING GIN (search_vec);

-- Row Level Security: public read only
ALTER TABLE timeline_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "timeline_events_public_read"
  ON timeline_events FOR SELECT
  TO anon, authenticated
  USING (true);
