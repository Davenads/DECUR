/**
 * /api/map-tiles/[z]/[x]/[y].png
 *
 * Tile proxy for CartoDB dark-matter-nolabels basemap.
 * Proxying through our own domain means no external tile host needs to appear
 * in the Content-Security-Policy — tiles are fetched server-side, served as
 * image/png, and cached by Vercel's CDN for 24 hours.
 *
 * Usage in MapLibre style:
 *   tiles: ['/api/map-tiles/{z}/{x}/{y}.png']
 */

import type { NextApiRequest, NextApiResponse } from 'next';

const CARTO_SERVERS = ['a', 'b', 'c', 'd'];
const CARTO_STYLE = 'dark_matter_nolabels';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.status(405).end();
    return;
  }

  const segments = Array.isArray(req.query.tile) ? req.query.tile : [];
  if (segments.length < 3) {
    res.status(400).json({ error: 'Expected /api/map-tiles/z/x/y.png' });
    return;
  }

  const z = segments[0];
  const x = segments[1];
  // Strip .png extension from y if present
  const y = segments[2].replace(/\.png$/, '');

  // Round-robin across CartoDB tile servers based on x coordinate
  const server = CARTO_SERVERS[parseInt(x, 10) % 4];
  const tileUrl = `https://${server}.basemaps.cartocdn.com/${CARTO_STYLE}/${z}/${x}/${y}.png`;

  try {
    const upstream = await fetch(tileUrl, {
      headers: {
        'User-Agent': 'DECUR/1.0 (decur.org)',
        // Pass through Accept so CartoDB returns the right content type
        'Accept': 'image/png,image/*,*/*',
      },
      // 5-second timeout — tiles should be fast; fail fast if CartoDB is slow
      signal: AbortSignal.timeout(5_000),
    });

    if (!upstream.ok) {
      res.status(upstream.status).end();
      return;
    }

    const data = await upstream.arrayBuffer();

    // Cache aggressively — map tiles are essentially static geographic data
    res.setHeader('Content-Type', 'image/png');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=43200');
    res.status(200).send(Buffer.from(data));
  } catch (err) {
    console.error('[map-tiles] Upstream error:', err);
    res.status(503).end();
  }
}
