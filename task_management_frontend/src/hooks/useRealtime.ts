import { useEffect } from "react";
import { supabase, isSupabaseConfigured } from "../supabaseClient";

type Handler<T> = (payload: T) => void;

interface RealtimeOptions<T> {
  table: string;
  event: "*" | "INSERT" | "UPDATE" | "DELETE";
  onPayload: Handler<any>;
}

// PUBLIC_INTERFACE
export function useRealtimeBoard(onChange: Handler<any>): void {
  /**
   * Subscribes to 'columns' (public) and 'tasks' in 'app' schema for INSERT/UPDATE/DELETE changes and emits payloads via onChange.
   * Uses explicit schema-qualified filters to avoid 'public.tasks' cache/lookup errors.
   */
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // Log once when subscribing to help diagnose schema filters
    // eslint-disable-next-line no-console
    console.info("[Realtime] Subscribing to postgres_changes with filters: public.columns, app.tasks");
    const channel = supabase
      .channel("board-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "columns" },
        (payload: any) => onChange({ kind: "columns", payload }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "app", table: "tasks" },
        (payload: any) => onChange({ kind: "tasks", payload }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onChange]);
}
