import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

interface ProfileData {
  display_name: string | null;
  bio: string | null;
  created_at: string;
  role: string;
}

interface ProfileResponse {
  profile: ProfileData | null;
  error?: string;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ProfileResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ profile: null });
  }

  const supabase = getSupabaseServerClient(req, res);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return res.status(200).json({ profile: null });
  }

  const { data, error } = await supabase
    .from('profiles')
    .select('display_name, bio, created_at, role')
    .eq('id', user.id)
    .single();

  if (error) {
    return res.status(200).json({ profile: null, error: error.message });
  }

  return res.status(200).json({ profile: data });
}
