-- Migration 009: Unified search index for server-side FTS
-- Replaces client-side Fuse.js corpus in pages/search.tsx.
-- Populated by scripts/populate-search-index.mjs from JSON source files.
-- Covers: key figures, cases, documents, programs, timeline, glossary,
--         contractors, resources.

CREATE TABLE IF NOT EXISTS search_index (
  id          TEXT PRIMARY KEY,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  subtitle    TEXT,
  description TEXT,
  full_text   TEXT,
  href        TEXT NOT NULL,
  badge       TEXT,
  aliases     TEXT[],
  meta        JSONB,
  search_vec  TSVECTOR,
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function: recomputes search_vec on every insert/update
-- Uses the 'english' dictionary and weighted sections matching Fuse.js key weights:
--   title / aliases  → weight A  (Fuse 0.5 / 0.4)
--   subtitle         → weight B  (Fuse 0.2)
--   description      → weight C  (Fuse 0.2)
--   full_text        → weight D  (Fuse 0.05)
CREATE OR REPLACE FUNCTION search_index_update_vec()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.search_vec :=
    setweight(to_tsvector('english', coalesce(NEW.title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(array_to_string(NEW.aliases, ' '), '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.subtitle, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.full_text, '')), 'D');
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER search_index_vec_trigger
  BEFORE INSERT OR UPDATE ON search_index
  FOR EACH ROW EXECUTE FUNCTION search_index_update_vec();

-- Indexes
CREATE INDEX IF NOT EXISTS search_index_vec_idx  ON search_index USING GIN (search_vec);
CREATE INDEX IF NOT EXISTS search_index_type_idx ON search_index (type);
CREATE INDEX IF NOT EXISTS search_index_meta_idx ON search_index USING GIN (meta);

-- Row Level Security: public read, no anon writes
ALTER TABLE search_index ENABLE ROW LEVEL SECURITY;

CREATE POLICY "search_index_public_read"
  ON search_index FOR SELECT
  TO anon, authenticated
  USING (true);
