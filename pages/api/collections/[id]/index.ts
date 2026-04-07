import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServerClient } from '../../../../lib/supabase/server';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = getSupabaseServerClient(req, res);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query as { id: string };

  // Verify the collection belongs to the authenticated user
  const { data: col, error: colError } = await supabase
    .from('collections')
    .select('id, user_id')
    .eq('id', id)
    .single();

  if (colError || !col) {
    return res.status(404).json({ error: 'Collection not found' });
  }
  if (col.user_id !== user.id) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  // ── GET: full collection with items ────────────────────────────
  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('collections')
      .select(`
        id, title, description, slug, is_public, created_at, updated_at,
        collection_items(
          id, bookmark_id, note, position, added_at,
          bookmarks(content_type, content_id, content_name)
        )
      `)
      .eq('id', id)
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ collection: data });
  }

  // ── PATCH: edit collection metadata ────────────────────────────
  if (req.method === 'PATCH') {
    const { title, description, is_public } = req.body as {
      title?: string;
      description?: string | null;
      is_public?: boolean;
    };

    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description?.trim() ?? null;
    if (is_public !== undefined) updates.is_public = is_public;

    const { data, error } = await supabase
      .from('collections')
      .update(updates)
      .eq('id', id)
      .select('id, title, description, slug, is_public, updated_at')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ collection: data });
  }

  // ── DELETE: delete collection (items cascade via FK) ───────────
  if (req.method === 'DELETE') {
    const { error } = await supabase
      .from('collections')
      .delete()
      .eq('id', id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
