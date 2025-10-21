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
 * Runtime check: log supabase-js version and whether schema() helper is available.
 * Also clarifies that all tasks are queried via schema 'app'.
 */
let schemaHelperAvailable = false;
let supabaseJsVersion = "unknown";
try {
  // @ts-ignore - access internal pkg metadata if bundled
  const maybeVersion = (require as any)?.("@supabase/supabase-js")?.version ?? (window as any)?.SUPABASE_JS_VERSION;
  if (typeof maybeVersion === "string") {
    supabaseJsVersion = maybeVersion;
  }
  schemaHelperAvailable = typeof (supabase as any)?.schema === "function";
} catch {
  schemaHelperAvailable = typeof (supabase as any)?.schema === "function";
}
if (url && key) {
  // eslint-disable-next-line no-console
  console.info(
    `[Supabase] Client initialized (supabase-js v${supabaseJsVersion}). schema() available: ${schemaHelperAvailable}. Tasks accessed in schema 'app'.`
  );
}

/**
 * Internal: get a schema-scoped table reference in a version-safe way.
 * - If supabase.schema('app') exists (v2+), use it.
 * - Else fallback to from('table', { schema: 'app' }) (v1 style).
 */
function fromAppInternal<T = any>(table: string) {
  const client: any = supabase as any;
  if (!isSupabaseConfigured()) {
    // eslint-disable-next-line no-console
    console.warn(`[Supabase] fromApp('${table}') called while Supabase is not configured.`);
  }
  if (typeof client?.schema === "function") {
    return client.schema("app").from(table) as any;
  }
  return client.from(table, { schema: "app" }) as any;
}

// PUBLIC_INTERFACE
export function fromApp<T = any>(table: string) {
  /**
   * Returns a query builder for the provided table in the 'app' schema.
   * Always prefer using this for app.* tables to avoid accidental 'public.app.table' lookup.
   */
  return fromAppInternal<T>(table);
}

// PUBLIC_INTERFACE
export function getSupabaseVersion(): string {
  /** Returns detected supabase-js version string (best-effort). */
  return supabaseJsVersion;
}
