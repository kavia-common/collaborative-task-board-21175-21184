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
  /** Fetch tasks for the currently authenticated user (RLS enforces user_id = auth.uid()). */
  if (!isSupabaseConfigured()) return [];
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) return [];
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", uid)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []) as AppTask[];
}

// PUBLIC_INTERFACE
export async function createMyTask(title: string): Promise<AppTask | null> {
  /** Create a task for the current user with a default status=todo and priority=normal. */
  if (!isSupabaseConfigured()) return null;
  const { data: sessionData } = await supabase.auth.getSession();
  const uid = sessionData.session?.user?.id;
  if (!uid) return null;
  const { data, error } = await supabase
    .from("tasks")
    .insert({ user_id: uid, title, status: "todo", priority: "normal" })
    .select("*")
    .single();
  if (error) throw error;
  return data as AppTask;
}

// PUBLIC_INTERFACE
export async function updateMyTaskStatus(id: UUID, status: TaskStatus): Promise<AppTask | null> {
  /** Update a task status (todo, in_progress, done) for the current user. */
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from("tasks")
    .update({ status })
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as AppTask;
}

// PUBLIC_INTERFACE
export async function deleteMyTask(id: UUID): Promise<void> {
  /** Delete a task for the current user. */
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.from("tasks").delete().eq("id", id);
  if (error) throw error;
}
