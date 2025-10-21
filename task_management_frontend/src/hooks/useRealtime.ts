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
   * Subscribes to 'columns' and 'tasks' for INSERT/UPDATE/DELETE changes and emits payloads via onChange.
   */
  useEffect(() => {
    if (!isSupabaseConfigured()) return;

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
