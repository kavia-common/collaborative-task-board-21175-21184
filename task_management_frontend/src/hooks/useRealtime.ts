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
   * Subscribes to 'columns' (public) and 'tasks' (public view) for INSERT/UPDATE/DELETE.
   * Note: Postgres Realtime on views may not emit events. If your project doesn't emit on public.tasks view,
   * consider switching to a channel on the underlying base table or RPC NOTIFY in the DB layer.
   */
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

    // eslint-disable-next-line no-console
    console.info("[Realtime] Subscribing to Postgres changes on public.columns and public.tasks (view)");
    const channel = supabase
      .channel("board-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "columns" },
        (payload: any) => onChange({ kind: "columns", payload }),
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload: any) => onChange({ kind: "tasks", payload }),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [onChange]);
}
