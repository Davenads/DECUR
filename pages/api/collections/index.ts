import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const supabase = getSupabaseServerClient(req, res);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // ── GET: list collections with item counts ──────────────────────
  // Optional: ?include_bookmark=<bookmark_id> adds a `has_bookmark` boolean
  // to each collection entry — used by CollectionPicker to show check states.
  if (req.method === 'GET') {
    const includeBookmark = req.query.include_bookmark as string | undefined;

    const { data, error } = await supabase
      .from('collections')
      .select('id, title, description, slug, is_public, created_at, updated_at, collection_items(count)')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false });

    if (error) return res.status(500).json({ error: error.message });

    // Annotate each collection with whether it already contains the given
    // bookmark — used by CollectionPicker to render correct checkbox states.
    if (includeBookmark && data && data.length > 0) {
      const { data: membership } = await supabase
        .from('collection_items')
        .select('collection_id')
        .in('collection_id', data.map(c => c.id))
        .eq('bookmark_id', includeBookmark);

      const memberSet = new Set((membership ?? []).map(m => m.collection_id));
      const annotated = data.map(c => ({ ...c, has_bookmark: memberSet.has(c.id) }));
      return res.status(200).json({ collections: annotated });
    }

    return res.status(200).json({ collections: data });
  }

  // ── POST: create collection ─────────────────────────────────────
  if (req.method === 'POST') {
    const { title, description, is_public } = req.body as {
      title: string;
      description?: string;
      is_public?: boolean;
    };

    if (!title?.trim()) {
      return res.status(400).json({ error: 'title is required' });
    }

    const baseSlug = slugify(title);
    // Ensure slug uniqueness by appending a short suffix if needed
    const { count } = await supabase
      .from('collections')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .like('slug', `${baseSlug}%`)
      .then(r => ({ count: r.count ?? 0 }));

    const slug = count > 0 ? `${baseSlug}-${count + 1}` : baseSlug;

    const { data, error } = await supabase
      .from('collections')
      .insert({
        user_id: user.id,
        title: title.trim(),
        description: description?.trim() ?? null,
        slug,
        is_public: is_public ?? false,
      })
      .select('id, title, description, slug, is_public, created_at, updated_at')
      .single();

    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json({ collection: data });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
