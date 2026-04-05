import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServerClient } from '../../../lib/supabase/server';

interface RoleResponse {
  role: string | null;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RoleResponse>
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ role: null });
  }

  const supabase = getSupabaseServerClient(req, res);
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return res.status(200).json({ role: null });
  }

  const { data } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return res.status(200).json({ role: data?.role ?? null });
}
