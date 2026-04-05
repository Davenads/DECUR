/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "frame-src https://challenges.cloudflare.com",
      "connect-src 'self' https://challenges.cloudflare.com https://*.supabase.co wss://*.supabase.co",
    ].join('; '),
  },
];

const staticAssetHeaders = [
  { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=43200' },
];

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  // In local dev, the browser cannot reach 127.0.0.1:54321 directly when
  // accessing via Tailscale from a remote device. This rewrite proxies
  // /supabase-proxy/* through the Next.js server (which CAN reach 127.0.0.1)
  // so all Supabase API calls flow: browser → Next.js → local Supabase.
  // In production NEXT_PUBLIC_SUPABASE_URL points directly to supabase.co,
  // so this rewrite is never exercised after deployment.
  async rewrites() {
    const supabaseProxyEnabled = process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('/supabase-proxy');
    if (!supabaseProxyEnabled) return [];
    return [
      {
        source: '/supabase-proxy/:path*',
        destination: 'http://127.0.0.1:54321/:path*',
      },
    ];
  },
  async headers() {
    return [
      // Security headers on all routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Public JSON assets (world-110m.json, manifest.json) - cache 24hrs
      {
        source: '/:file*.json',
        headers: staticAssetHeaders,
      },
      // Public images and icons - cache 24hrs
      {
        source: '/:file*.(png|jpg|jpeg|ico|svg|webp)',
        headers: staticAssetHeaders,
      },
    ];
  },
};

module.exports = nextConfig;