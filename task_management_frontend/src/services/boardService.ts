import { supabase, isSupabaseConfigured } from "../supabaseClient";
import type { BoardData, Column, Task, UUID } from "../types";

// PUBLIC_INTERFACE
export async function fetchBoard(): Promise<BoardData> {
  /**
   * Fetches board columns, tasks (from public.tasks view), and team members.
   * Returns empty arrays if Supabase is not configured.
   */
  if (!isSupabaseConfigured()) {
    return { columns: [], tasks: [], members: [] };
  }

  const [{ data: columns, error: cErr }, { data: tasks, error: tErr }, { data: members, error: mErr }] =
    await Promise.all([
      supabase.from("columns").select("*").order("position", { ascending: true }),
      supabase.from("tasks").select("*").order("position", { ascending: true }),
      supabase.from("profiles").select("id, email, full_name, avatar_url"),
    ]);

  if (cErr) {
    cErr.message = `${cErr.message} (while selecting from public.columns)`;
    throw cErr;
  }
  if (tErr) {
    tErr.message = `${tErr.message} (while selecting from public.tasks view)`;
    throw tErr;
  }
  if (mErr) {
    mErr.message = `${mErr.message} (while selecting from public.profiles)`;
    throw mErr;
  }

  return {
    columns: (columns ?? []) as Column[],
    tasks: (tasks ?? []) as Task[],
    members: (members ?? []) as any,
  };
}

// PUBLIC_INTERFACE
export async function createTask(partial: Partial<Task>): Promise<Task | null> {
  /**
   * Creates a task via RPC tasks_insert.
   * Do not set user_id in client; handled server-side via auth.uid().
   */
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.rpc("tasks_insert", {
    _title: partial.title ?? "",
    _description: partial.description ?? null,
    _status: (partial as any).status ?? "todo",
    _priority: (partial as any).priority ?? "medium",
    _due_date: partial.due_date ?? null,
  });
  if (error) {
    error.message = `${error.message} (rpc tasks_insert)`;
    throw error;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? null) as Task | null;
}

// PUBLIC_INTERFACE
export async function updateTask(id: UUID, updates: Partial<Task>): Promise<Task | null> {
  /**
   * Updates a task via RPC tasks_update.
   */
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.rpc("tasks_update", {
    _id: id,
    _title: updates.title ?? null,
    _description: updates.description ?? null,
    _status: (updates as any).status ?? null,
    _priority: (updates as any).priority ?? null,
    _due_date: updates.due_date ?? null,
  });
  if (error) {
    error.message = `${error.message} (rpc tasks_update)`;
    throw error;
  }
  const row = Array.isArray(data) ? data[0] : data;
  return (row ?? null) as Task | null;
}

// PUBLIC_INTERFACE
export async function moveTask(taskId: UUID, toColumnId: UUID, toPosition: number): Promise<void> {
  /**
   * Moves a task by updating its column and position using RPC tasks_update.
   * Only fields provided are updated; others remain unchanged server-side.
   */
  if (!isSupabaseConfigured()) return;
  const { error } = await supabase.rpc("tasks_update", {
    _id: taskId,
    _title: null,
    _description: null,
    _status: null,
    _priority: null,
    _due_date: null,
    // If your RPC supports column/position updates, include them here. If not, adjust SQL accordingly.
    // For compatibility, we leverage tasks_update to handle these fields as well.
    // @ts-ignore - extra keys passed intentionally to RPC; server will accept if defined.
    _column_id: toColumnId,
    // @ts-ignore
    _position: toPosition,
  });
  if (error) {
    error.message = `${error.message} (rpc tasks_update move)`;
    throw error;
  }
}

// PUBLIC_INTERFACE
export async function createColumn(title: string, position: number): Promise<Column | null> {
  /** Creates a new column at specified position. */
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("columns").insert({ title, position }).select("*").single();
  if (error) {
    (error as any).message = `${error.message} (while inserting into public.columns)`;
    throw error;
  }
  return data as Column;
}

// PUBLIC_INTERFACE
export async function updateColumn(id: UUID, updates: Partial<Column>): Promise<Column | null> {
  /** Updates a column by id. */
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase.from("columns").update(updates).eq("id", id).select("*").single();
  if (error) {
    (error as any).message = `${error.message} (while updating public.columns)`;
    throw error;
  }
  return data as Column;
}
