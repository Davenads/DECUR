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

  // ── POST: add a bookmark to the collection ─────────────────────
  if (req.method === 'POST') {
    const { bookmark_id, note } = req.body as { bookmark_id: string; note?: string };

    if (!bookmark_id) {
      return res.status(400).json({ error: 'bookmark_id is required' });
    }

    // Verify the bookmark belongs to the authenticated user
    const { data: bm, error: bmError } = await supabase
      .from('bookmarks')
      .select('id')
      .eq('id', bookmark_id)
      .eq('user_id', user.id)
      .single();

    if (bmError || !bm) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    const { data, error } = await supabase
      .from('collection_items')
      .upsert(
        {
          collection_id: id,
          bookmark_id,
          note: note?.trim() ?? null,
        },
        { onConflict: 'collection_id,bookmark_id', ignoreDuplicates: false }
      )
      .select('id, bookmark_id, note, position, added_at')
      .single();

    if (error) return res.status(500).json({ error: error.message });

    // Bump collection updated_at
    await supabase
      .from('collections')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    return res.status(201).json({ item: data });
  }

  // ── DELETE: remove a bookmark from the collection ──────────────
  if (req.method === 'DELETE') {
    const { bookmark_id } = req.query as { bookmark_id?: string };

    if (!bookmark_id) {
      return res.status(400).json({ error: 'bookmark_id query param is required' });
    }

    const { error } = await supabase
      .from('collection_items')
      .delete()
      .eq('collection_id', id)
      .eq('bookmark_id', bookmark_id);

    if (error) return res.status(500).json({ error: error.message });

    // Bump collection updated_at
    await supabase
      .from('collections')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', id);

    return res.status(204).end();
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
