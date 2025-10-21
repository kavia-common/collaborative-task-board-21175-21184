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

/**
 * Small runtime health log to ensure we always target the correct schema.
 * It logs once on import if configured.
 */
if (url && key) {
  // eslint-disable-next-line no-console
  console.info("[Supabase] Client initialized. Default schema is 'public'. Tasks will be accessed via schema 'app'.");
}

// PUBLIC_INTERFACE
export function fromApp<T = any>(table: string) {
  /**
   * Returns a query builder for the provided table in the 'app' schema.
   * Always prefer using this for app.* tables to avoid accidental 'public.app.table' lookup.
   */
  if (!isSupabaseConfigured()) {
    // eslint-disable-next-line no-console
    console.warn(`[Supabase] fromApp('${table}') called while Supabase is not configured.`);
  }
  // Keep it simple for TS and ESLint: return as any to allow chaining .select/.insert/etc.
  return (supabase as any).from(table, { schema: "app" }) as any;
}
