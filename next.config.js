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
      "connect-src 'self' https://challenges.cloudflare.com",
    ].join('; '),
  },
];

const staticAssetHeaders = [
  { key: 'Cache-Control', value: 'public, max-age=86400, stale-while-revalidate=43200' },
];

const immutableAssetHeaders = [
  { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
];

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: false,
  },
  async headers() {
    return [
      // Security headers on all routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Next.js build output - already immutable by filename hash, reinforce explicitly
      {
        source: '/_next/static/:path*',
        headers: immutableAssetHeaders,
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