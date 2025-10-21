import { supabase, isSupabaseConfigured } from "../supabaseClient";
import type { BoardData, Column, Task, UUID } from "../types";

// PUBLIC_INTERFACE
export async function fetchBoard(): Promise<BoardData> {
  /**
   * Fetches board columns, tasks (from app.tasks), and team members.
   * Returns empty arrays if Supabase is not configured.
   */
  if (!isSupabaseConfigured()) {
    return { columns: [], tasks: [], members: [] };
  }

  const [{ data: columns, error: cErr }, { data: tasks, error: tErr }, { data: members, error: mErr }] =
    await Promise.all([
      supabase.from("columns").select("*").order("position", { ascending: true }),
      supabase.from("app.tasks").select("*").order("position", { ascending: true }),
      supabase.from("profiles").select("id, email, full_name, avatar_url"),
    ]);

  if (cErr) throw cErr;
  if (tErr) throw tErr;
  if (mErr) throw mErr;

  return {
    columns: (columns ?? []) as Column[],
    tasks: (tasks ?? []) as Task[],
    members: (members ?? []) as any,
  };
}

// PUBLIC_INTERFACE
export async function createTask(partial: Partial<Task>): Promise<Task | null> {
  /** Creates a task with provided fields in app.tasks. */
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("app.tasks").insert(partial).select("*").single();
  if (error) throw error;
  return data as Task;
}

// PUBLIC_INTERFACE
export async function updateTask(id: UUID, updates: Partial<Task>): Promise<Task | null> {
  /** Updates a task by id in app.tasks. */
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("app.tasks").update(updates).eq("id", id).select("*").single();
  if (error) throw error;
  return data as Task;
}

// PUBLIC_INTERFACE
export async function moveTask(taskId: UUID, toColumnId: UUID, toPosition: number): Promise<void> {
  /** Moves a task to a target column and position in app.tasks. */
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase
    .from("app.tasks")
    .update({ column_id: toColumnId, position: toPosition })
    .eq("id", taskId);
  if (error) throw error;
}

// PUBLIC_INTERFACE
export async function createColumn(title: string, position: number): Promise<Column | null> {
  /** Creates a new column at specified position. */
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("columns").insert({ title, position }).select("*").single();
  if (error) throw error;
  return data as Column;
}

// PUBLIC_INTERFACE
export async function updateColumn(id: UUID, updates: Partial<Column>): Promise<Column | null> {
  /** Updates a column by id. */
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("columns").update(updates).eq("id", id).select("*").single();
  if (error) throw error;
  return data as Column;
}
