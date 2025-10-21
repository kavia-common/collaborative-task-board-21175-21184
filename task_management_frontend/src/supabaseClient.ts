import { createClient } from "@supabase/supabase-js";

const url = process.env.REACT_APP_SUPABASE_URL as string | undefined;
const key = process.env.REACT_APP_SUPABASE_KEY as string | undefined;

if (!url || !key) {
  // eslint-disable-next-line no-console
  console.warn(
    "[Supabase] Missing REACT_APP_SUPABASE_URL or REACT_APP_SUPABASE_KEY. Auth and data will be disabled until configured."
  );
}

/**
 * Supabase JS client instance. Uses REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY
 * provided via environment. Do not hardcode credentials.
 */
export const supabase = url && key ? createClient(url, key) : (null as any);

// PUBLIC_INTERFACE
export function isSupabaseConfigured(): boolean {
  /** Returns true if Supabase URL and KEY are present and client is instantiated. */
  return Boolean(url && key && supabase);
}
