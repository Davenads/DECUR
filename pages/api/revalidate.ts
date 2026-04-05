import type { NextApiRequest, NextApiResponse } from 'next';

/**
 * On-demand ISR revalidation endpoint.
 * Called internally by lib/revalidate.ts after contribution approvals.
 * Protected by a shared secret to prevent unauthorized revalidations.
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { secret, path } = req.body as { secret?: string; path?: string };

  if (!process.env.REVALIDATE_SECRET || secret !== process.env.REVALIDATE_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (!path || typeof path !== 'string') {
    return res.status(400).json({ error: 'path is required' });
  }

  try {
    await res.revalidate(path);
    return res.json({ revalidated: true, path });
  } catch (err) {
    console.error('[api/revalidate] error:', err);
    return res.status(500).json({ error: 'Revalidation failed', path });
  }
}
