import { createBrowserClient } from '@supabase/ssr';

// Singleton pattern — reuse the same client across re-renders.
// Only used in browser (client components / hooks / event handlers).
let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!client) {
    // In development, derive the Supabase URL from the current page's origin
    // so the proxy route (/supabase-proxy/*) is always resolved relative to
    // wherever the dev server is actually reachable (localhost, Tailscale IP, etc.).
    // This prevents stale webpack-bundled URLs from breaking auth on remote devices.
    // In production, NEXT_PUBLIC_SUPABASE_URL points directly to supabase.co.
    const supabaseUrl =
      process.env.NODE_ENV === 'development' && typeof window !== 'undefined'
        ? `${window.location.origin}/supabase-proxy`
        : process.env.NEXT_PUBLIC_SUPABASE_URL!;

    client = createBrowserClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        // Fixed storage key ensures the browser and server always agree on the
        // cookie name, regardless of which Supabase URL each side resolves to.
        // @supabase/ssr derives the cookie name from the URL by default; since
        // browser.ts uses window.location.origin while server clients use
        // SUPABASE_INTERNAL_URL, they would hash to different names without this.
        auth: { storageKey: 'decur-auth-v1' },
      }
    );
  }
  return client;
}
