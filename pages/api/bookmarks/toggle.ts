import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

interface ToggleBody {
  content_type: string;
  content_id: string;
  content_name: string;
}

const VALID_TYPES = ['figure', 'case', 'document', 'program', 'timeline'] as const;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const supabase = getSupabaseServerClient(req, res);
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { content_type, content_id, content_name } = req.body as ToggleBody;

  if (!content_type || !content_id || !content_name) {
    return res.status(400).json({ error: 'content_type, content_id, and content_name are required' });
  }
  if (!VALID_TYPES.includes(content_type as typeof VALID_TYPES[number])) {
    return res.status(400).json({ error: `content_type must be one of: ${VALID_TYPES.join(', ')}` });
  }

  // Check if bookmark already exists
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_type', content_type)
    .eq('content_id', content_id)
    .maybeSingle();

  if (existing) {
    // Remove bookmark
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', existing.id);

    if (error) return res.status(500).json({ error: error.message });
    return res.status(200).json({ bookmarked: false, bookmark: null });
  }

  // Add bookmark
  const { data: created, error } = await supabase
    .from('bookmarks')
    .insert({ user_id: user.id, content_type, content_id, content_name })
    .select('id, content_type, content_id, content_name, created_at')
    .single();

  if (error) return res.status(500).json({ error: error.message });
  return res.status(200).json({ bookmarked: true, bookmark: created });
}
