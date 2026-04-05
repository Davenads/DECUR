-- ============================================================
-- DECUR: Indexes + Security Fixes
-- Adds missing FK indexes (performance) and tightens RLS
-- policies flagged by Supabase Advisor (security).
-- ============================================================

-- ── bookmarks indexes ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS bookmarks_user_id_idx
  ON public.bookmarks(user_id);

-- Composite index for the UNIQUE constraint query pattern
CREATE INDEX IF NOT EXISTS bookmarks_user_content_idx
  ON public.bookmarks(user_id, content_type, content_id);

-- ── collections indexes ───────────────────────────────────────
CREATE INDEX IF NOT EXISTS collections_user_id_idx
  ON public.collections(user_id);

CREATE INDEX IF NOT EXISTS collections_is_public_idx
  ON public.collections(is_public)
  WHERE is_public = TRUE;   -- partial index — only indexes public rows

-- ── collection_items indexes ──────────────────────────────────
CREATE INDEX IF NOT EXISTS collection_items_collection_id_idx
  ON public.collection_items(collection_id);

CREATE INDEX IF NOT EXISTS collection_items_bookmark_id_idx
  ON public.collection_items(bookmark_id);

-- ── contributions indexes ─────────────────────────────────────
CREATE INDEX IF NOT EXISTS contributions_user_id_idx
  ON public.contributions(user_id);

CREATE INDEX IF NOT EXISTS contributions_status_idx
  ON public.contributions(status);

CREATE INDEX IF NOT EXISTS contributions_content_type_idx
  ON public.contributions(content_type);

CREATE INDEX IF NOT EXISTS contributions_reviewed_by_idx
  ON public.contributions(reviewed_by);

-- Composite index for the moderation queue (status + created_at sort)
CREATE INDEX IF NOT EXISTS contributions_status_created_idx
  ON public.contributions(status, created_at DESC);

-- ── contribution_events indexes ───────────────────────────────
CREATE INDEX IF NOT EXISTS contribution_events_contribution_id_idx
  ON public.contribution_events(contribution_id);

CREATE INDEX IF NOT EXISTS contribution_events_actor_id_idx
  ON public.contribution_events(actor_id);

-- ── security: tighten profiles UPDATE policy ─────────────────
-- Add WITH CHECK to prevent users updating other users' rows via id spoofing.
DROP POLICY IF EXISTS "Users update own profile" ON public.profiles;

CREATE POLICY "Users update own profile"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── security: restrict contribution_events INSERT ─────────────
-- Replace overly permissive WITH CHECK (TRUE) with a scoped policy:
-- Only allow inserts where actor_id is the calling user OR is NULL (system).
DROP POLICY IF EXISTS "System inserts contribution events" ON public.contribution_events;

CREATE POLICY "Users insert own contribution events"
  ON public.contribution_events
  FOR INSERT
  WITH CHECK (
    actor_id IS NULL OR actor_id = auth.uid()
  );
