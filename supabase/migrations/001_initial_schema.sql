-- ============================================================
-- DECUR: Initial Schema
-- Tables: profiles, bookmarks, collections, collection_items,
--         contributions, contribution_events
-- ============================================================

-- ── profiles ────────────────────────────────────────────────
-- Extends auth.users with application-level fields.
-- Auto-created via trigger on auth.users INSERT (see 002_triggers.sql).

CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE,
  display_name    TEXT,
  role            TEXT NOT NULL DEFAULT 'viewer'
                    CHECK (role IN ('viewer', 'contributor', 'moderator', 'admin')),
  bio             TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles are publicly readable"
  ON public.profiles FOR SELECT USING (TRUE);

CREATE POLICY "Users update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- ── bookmarks ────────────────────────────────────────────────
-- Individual saved items referencing any platform content type.

CREATE TABLE IF NOT EXISTS public.bookmarks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content_type    TEXT NOT NULL
                    CHECK (content_type IN ('figure', 'case', 'document', 'program', 'timeline')),
  content_id      TEXT NOT NULL,   -- platform slug (e.g. 'luis-elizondo', 'nimitz-tic-tac')
  content_name    TEXT NOT NULL,   -- denormalized display name for fast listing
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, content_type, content_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own bookmarks"
  ON public.bookmarks
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── collections ──────────────────────────────────────────────
-- Named groupings of bookmarks; optionally shareable via public URL.

CREATE TABLE IF NOT EXISTS public.collections (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  description     TEXT,
  slug            TEXT NOT NULL,   -- URL-safe identifier
  is_public       BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, slug)
);

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public collections viewable by all"
  ON public.collections FOR SELECT
  USING (is_public = TRUE OR auth.uid() = user_id);

CREATE POLICY "Users create own collections"
  ON public.collections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own collections"
  ON public.collections FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own collections"
  ON public.collections FOR DELETE
  USING (auth.uid() = user_id);

-- ── collection_items ─────────────────────────────────────────
-- Junction: which bookmarks belong to which collections.

CREATE TABLE IF NOT EXISTS public.collection_items (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id   UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  bookmark_id     UUID NOT NULL REFERENCES public.bookmarks(id) ON DELETE CASCADE,
  note            TEXT,          -- user annotation on this item within the collection
  position        INTEGER,       -- manual ordering
  added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (collection_id, bookmark_id)
);

ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Collection items visible via collection"
  ON public.collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id
        AND (c.is_public = TRUE OR c.user_id = auth.uid())
    )
  );

CREATE POLICY "Users manage own collection items"
  ON public.collection_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id AND c.user_id = auth.uid()
    )
  );

-- ── contributions ────────────────────────────────────────────
-- Community-submitted content awaiting moderation.

CREATE TABLE IF NOT EXISTS public.contributions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  content_type    TEXT NOT NULL
                    CHECK (content_type IN ('figure', 'case', 'timeline_event', 'source', 'correction')),
  title           TEXT NOT NULL,
  payload         JSONB NOT NULL,   -- structured submission data (varies by content_type)
  status          TEXT NOT NULL DEFAULT 'submitted'
                    CHECK (status IN ('draft', 'submitted', 'under_review', 'approved', 'rejected', 'needs_revision')),
  submitter_note  TEXT,
  reviewed_by     UUID REFERENCES public.profiles(id),
  reviewer_note   TEXT,
  revalidated     BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at     TIMESTAMPTZ
);

ALTER TABLE public.contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see own contributions"
  ON public.contributions FOR SELECT
  USING (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('moderator', 'admin')
    )
  );

CREATE POLICY "Authenticated users submit contributions"
  ON public.contributions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Moderators update contributions"
  ON public.contributions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid()
        AND p.role IN ('moderator', 'admin')
    )
  );

-- ── contribution_events ──────────────────────────────────────
-- Audit log: every status change on a contribution.

CREATE TABLE IF NOT EXISTS public.contribution_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contribution_id UUID NOT NULL REFERENCES public.contributions(id) ON DELETE CASCADE,
  actor_id        UUID REFERENCES public.profiles(id),
  event_type      TEXT NOT NULL
                    CHECK (event_type IN (
                      'submitted', 'review_started', 'approved',
                      'rejected', 'revision_requested', 'resubmitted', 'revalidated'
                    )),
  note            TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.contribution_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Contribution events visible with contribution"
  ON public.contribution_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.contributions c
      WHERE c.id = contribution_id
        AND (
          c.user_id = auth.uid() OR
          EXISTS (
            SELECT 1 FROM public.profiles p
            WHERE p.id = auth.uid()
              AND p.role IN ('moderator', 'admin')
          )
        )
    )
  );

CREATE POLICY "System inserts contribution events"
  ON public.contribution_events FOR INSERT
  WITH CHECK (TRUE);
