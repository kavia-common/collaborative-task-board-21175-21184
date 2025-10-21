import { supabase, isSupabaseConfigured } from "../supabaseClient";
import type { UUID } from "../types";

export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "normal" | "medium" | "high";

export interface AppTask {
  id: UUID;
  user_id: UUID;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null; // ISO date or null
  created_at: string;
  updated_at: string;
}

// PUBLIC_INTERFACE
export async function fetchMyTasks(): Promise<AppTask[]> {
  /**
   * Fetch tasks for the current authenticated user from public.tasks view.
   * RLS is enforced via the view and backend policies.
   */
  if (!isSupabaseConfigured()) return [];
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) return [];
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    error.message = `${error.message} (select from public.tasks view)`;
    throw error;
  }
  return (data || []) as AppTask[];
}

// PUBLIC_INTERFACE
export async function createMyTask(title: string): Promise<AppTask | null> {
  /**
   * Create a task via RPC tasks_insert.
   * Do NOT send user_id from client; server uses auth.uid().
   */
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.rpc("tasks_insert", {
    _title: title,
    _description: null,
    _status: "todo",
    _priority: "normal",
    _due_date: null,
  });

  if (error) {
    error.message = `${error.message} (rpc tasks_insert)`;
    throw error;
  }
  // Some Postgres functions return a single row or an array; normalize to object
  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? null) as AppTask | null;
}

// PUBLIC_INTERFACE
export async function updateMyTaskStatus(id: UUID, status: TaskStatus): Promise<AppTask | null> {
  /**
   * Update a task via RPC tasks_update.
   * Only status changed here; other fields passed as null to keep existing values server-side if function supports COALESCE.
   */
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.rpc("tasks_update", {
    _id: id,
    _title: null,
    _description: null,
    _status: status,
    _priority: null,
    _due_date: null,
  });

  if (error) {
    error.message = `${error.message} (rpc tasks_update)`;
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? null) as AppTask | null;
}

// PUBLIC_INTERFACE
export async function deleteMyTask(id: UUID): Promise<void> {
  /**
   * Delete a task via RPC tasks_delete.
   */
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.rpc("tasks_delete", { _id: id });
  if (error) {
    error.message = `${error.message} (rpc tasks_delete)`;
    throw error;
  }
}
