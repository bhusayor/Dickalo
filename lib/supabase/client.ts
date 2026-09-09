import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

/**
 * Browser Supabase client.
 *
 * Uses the anon key, which under the RLS policies in `schema.sql` can insert
 * into the three public tables and read none of them. Nothing here can leak the
 * enquiry list even if the key is extracted from the bundle.
 *
 * The client is lazily created so a build without Supabase credentials does not
 * throw at import time.
 */

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const isSupabaseConfigured =
  supabaseUrl.startsWith('https://') && supabaseAnonKey.length > 20;

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Returns the singleton browser client, or `null` when Supabase is not
 * configured. Callers must handle null — forms fall back to the API route,
 * which handles persistence server-side anyway.
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> | null {
  if (!isSupabaseConfigured) return null;

  if (!browserClient) {
    browserClient = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        // The public site has no login, so there is no session to persist.
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: { 'x-application-name': 'dickalo-web' },
      },
    });
  }

  return browserClient;
}
