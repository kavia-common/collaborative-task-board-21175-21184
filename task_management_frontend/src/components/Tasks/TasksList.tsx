import React, { useEffect, useMemo, useState } from "react";
import { isSupabaseConfigured } from "../../supabaseClient";
import {
  AppTask,
  createMyTask,
  deleteMyTask,
  fetchMyTasks,
  updateMyTaskStatus,
  TaskStatus,
} from "../../services/tasksService";

/* eslint-disable no-useless-escape */
// PUBLIC_INTERFACE
export default function TasksList(): JSX.Element {
  /** Renders the signed-in user's tasks from the app.tasks table with quick add, status update, and delete. */
  const configured = isSupabaseConfigured();
  const [tasks, setTasks] = useState<AppTask[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState<string>("");
  const [adding, setAdding] = useState<boolean>(false);

  const load = async () => {
    if (!configured) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchMyTasks();
      setTasks(data);
    } catch (e: any) {
      const msg = e?.message ?? "Failed to load tasks";
      setError(
        msg.includes("public.app.tasks") || msg.includes("relation \"public.tasks\" does not exist")
          ? `${msg} — Hint: Currently using schema 'app'. Ensure queries use fromApp('tasks') or supabase.schema('app').from('tasks').`
          : msg
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []); // load on mount

  const canAdd = useMemo(() => configured && newTitle.trim().length > 0 && !adding, [configured, newTitle, adding]);

  const onAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canAdd) return;
    setAdding(true);
    setError(null);
    try {
      const created = await createMyTask(newTitle.trim());
      if (created) {
        setNewTitle("");
        // Prepend for immediate feedback
        setTasks((prev) => [created, ...prev]);
      }
    } catch (e: any) {
      {
        const msg = e?.message ?? "Failed to create task";
        setError(
          msg.includes("public.app.tasks") || msg.includes("relation \"public.tasks\" does not exist")
            ? `${msg} — Hint: Using schema 'app'. Ensure create uses fromApp('tasks') with user_id = auth.uid().`
            : msg
        );
      }
    } finally {
      setAdding(false);
    }
  };

  const onUpdateStatus = async (task: AppTask, status: TaskStatus) => {
    try {
      // Optimistic update
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status } : t)));
      await updateMyTaskStatus(task.id, status);
    } catch (e: any) {
      {
        const msg = e?.message ?? "Failed to update status";
        setError(
          msg.includes("public.app.tasks") || msg.includes("relation \"public.tasks\" does not exist")
            ? `${msg} — Hint: Using schema 'app'. Ensure updates use fromApp('tasks').`
            : msg
        );
      }
      // Revert by reload for safety
      load();
    }
  };

  const onDelete = async (task: AppTask) => {
    const prev = tasks;
    try {
      // Optimistic remove
      setTasks((p) => p.filter((t) => t.id !== task.id));
      await deleteMyTask(task.id);
    } catch (e: any) {
      {
        const msg = e?.message ?? "Failed to delete task";
        setError(
          msg.includes("public.app.tasks") || msg.includes("relation \"public.tasks\" does not exist")
            ? `${msg} — Hint: Using schema 'app'. Ensure deletions use fromApp('tasks').`
            : msg
        );
      }
      setTasks(prev);
    }
  };

  if (!configured) {
    return <div className="state">Supabase is not configured. Tasks are disabled.</div>;
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ fontWeight: 700, color: "var(--color-primary)" }}>My Tasks</div>
        <button className="btn" onClick={load} disabled={loading}>
          {loading ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      <form onSubmit={onAdd} style={{ display: "flex", gap: 8 }}>
        <input
          className="input"
          placeholder="Quick add a task..."
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          aria-label="Task title"
        />
        <button className="btn primary" type="submit" disabled={!canAdd} aria-busy={adding}>
          {adding ? "Adding..." : "Add"}
        </button>
      </form>

      {error && (
        <div className="helper" style={{ color: "var(--color-error)" }} role="alert">
          {error}
        </div>
      )}

      {loading ? (
        <div className="state">Loading tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="state">No tasks yet. Create your first task.</div>
      ) : (
        <div
          role="list"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            background: "var(--color-surface)",
            border: "1px solid #E5E7EB",
            borderRadius: 12,
            padding: 8,
          }}
        >
          {tasks.map((t) => (
            <div
              key={t.id}
              role="listitem"
              className="task-card"
              style={{ display: "grid", gridTemplateColumns: "1fr auto auto", alignItems: "center", gap: 8 }}
            >
              <div style={{ display: "flex", flexDirection: "column" }}>
                <div className="task-title" style={{ margin: 0 }}>
                  {t.title}
                </div>
                <div className="task-meta">
                  <span className="pill">{t.priority}</span>
                  <span className="pill">{t.status}</span>
                </div>
              </div>

              <select
                aria-label="Status"
                className="select"
                value={t.status}
                onChange={(e) => onUpdateStatus(t, e.target.value as TaskStatus)}
              >
                <option value="todo">todo</option>
                <option value="in_progress">in_progress</option>
                <option value="done">done</option>
              </select>

              <button className="btn" onClick={() => onDelete(t)} title="Delete task" aria-label="Delete task">
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
