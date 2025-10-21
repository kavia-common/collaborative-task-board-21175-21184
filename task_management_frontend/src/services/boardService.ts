import { supabase, isSupabaseConfigured, fromApp } from "../supabaseClient";
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
      // Explicitly use app schema for tasks
      fromApp<Task>("tasks").select("*").order("position", { ascending: true }),
      supabase.from("profiles").select("id, email, full_name, avatar_url"),
    ]);

  if (cErr) {
    cErr.message = `${cErr.message} (while selecting from public.columns)`;
    throw cErr;
  }
  if (tErr) {
    tErr.message = `${tErr.message} (while selecting from app.tasks)`;
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
  /** Creates a task with provided fields in app.tasks. Ensures user_id is set for RLS where applicable. */
  if (!isSupabaseConfigured()) return null;
  // Attach user_id if present in auth session and not provided in partial
  const { data: sessionData } = await (supabase as any).auth.getSession();
  const uid = sessionData?.session?.user?.id;
  const payload = { ...(partial as any) };
  if (uid && payload.user_id === undefined) {
    payload.user_id = uid;
  }
  const { data, error } = await fromApp<Task>("tasks").insert(payload).select("*").single();
  if (error) {
    error.message = `${error.message} (createTask on app.tasks)`;
    throw error;
  }
  return data as Task;
}

// PUBLIC_INTERFACE
export async function updateTask(id: UUID, updates: Partial<Task>): Promise<Task | null> {
  /** Updates a task by id in app.tasks. */
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await fromApp<Task>("tasks")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();
  if (error) {
    error.message = `${error.message} (updateTask on app.tasks)`;
    throw error;
  }
  return data as Task;
}

// PUBLIC_INTERFACE
export async function moveTask(taskId: UUID, toColumnId: UUID, toPosition: number): Promise<void> {
  /** Moves a task to a target column and position in app.tasks. */
  if (!isSupabaseConfigured()) return;
  const { error } = await fromApp<Task>("tasks")
    .update({ column_id: toColumnId, position: toPosition })
    .eq("id", taskId);
  if (error) {
    error.message = `${error.message} (moveTask on app.tasks)`;
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
