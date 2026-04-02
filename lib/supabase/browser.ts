import { createBrowserClient } from '@supabase/ssr';

// Singleton pattern — reuse the same client across re-renders.
// Only used in browser (client components / hooks / event handlers).
let client: ReturnType<typeof createBrowserClient> | null = null;

export function getSupabaseBrowserClient() {
  if (!client) {
    client = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return client;
}
