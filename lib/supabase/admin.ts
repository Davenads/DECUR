import { createClient } from '@supabase/supabase-js';

/**
 * Service-role Supabase client.
 * Bypasses Row Level Security — use only in trusted server-side contexts
 * (e.g., moderator review API routes, admin operations).
 *
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the client.
 */
export const supabaseAdmin = createClient(
  process.env.SUPABASE_INTERNAL_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
