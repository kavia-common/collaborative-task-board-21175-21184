import React, { useCallback, useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import Board from "./components/Board/Board";
import TaskModal from "./components/TaskModal";
import { useAuth } from "./hooks/useAuth";
import { fetchBoard, createColumn } from "./services/boardService";
import { useRealtimeBoard } from "./hooks/useRealtime";
import type { BoardData, Task } from "./types";
import { isSupabaseConfigured } from "./supabaseClient";

// PUBLIC_INTERFACE
export default function App(): JSX.Element {
  /** Root application shell and state management for the Kanban board. */
  const { user, loading: authLoading, error: authError, signIn, signUp, signOut, configured } = useAuth();

  const [board, setBoard] = useState<BoardData>({ columns: [], tasks: [], members: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [modalTask, setModalTask] = useState<Task | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBoard();
      setBoard(data);
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (configured) {
      load();
    } else {
      setLoading(false);
    }
  }, [configured, load]);

  useRealtimeBoard(
    useCallback((_evt) => {
      // For simplicity, reload on any change.
      load();
    }, [load]),
  );

  const handleCreateDefaultColumns = async () => {
    if (!isSupabaseConfigured()) return;
    const exists = board.columns.length > 0;
    if (exists) return;
    const defaults = ["Backlog", "In Progress", "Done"];
    for (let i = 0; i < defaults.length; i += 1) {
      // ignore rejections to keep "seed safe"
      try {
        // 10 step to allow future insertions
        // eslint-disable-next-line no-await-in-loop
        await createColumn(defaults[i], i * 10);
      } catch {
        // no-op
      }
    }
  };

  useEffect(() => {
    if (configured) handleCreateDefaultColumns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [configured]);

  const onOpenTask = (task: Task) => setModalTask(task);
  const onCloseModal = () => setModalTask(null);

  const emptyState = useMemo(
    () =>
      !loading &&
      (board.columns.length === 0
        ? "No columns yet. Create your first column to get started."
        : board.tasks.length === 0
        ? "No tasks yet. Create a task to populate the board."
        : ""),
    [loading, board],
  );

  if (!configured) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <div style={{ fontWeight: 700, color: "var(--color-primary)" }}>Task Board</div>
        </header>
        <aside className="app-sidebar">
          <div className="state">Supabase is not configured. Set REACT_APP_SUPABASE_URL and REACT_APP_SUPABASE_KEY.</div>
        </aside>
        <main className="app-main">
          <div className="state">Provide environment variables to enable authentication and real-time data.</div>
        </main>
      </div>
    );
  }

  if (authLoading) {
    return <div className="state" style={{ margin: 24 }}>Loading...</div>;
  }

  if (!user) {
    return (
      <AuthScreen signIn={signIn} signUp={signUp} error={authError} />
    );
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <Header onSignOut={signOut} />
      </header>
      <aside className="app-sidebar">
        <Sidebar members={board.members} />
      </aside>
      <main className="app-main">
        {loading ? (
          <div className="state">Loading board...</div>
        ) : emptyState ? (
          <div className="state">{emptyState}</div>
        ) : (
          <Board data={board} onOpenTask={onOpenTask} onReload={load} />
        )}
      </main>
      {modalTask && <TaskModal task={modalTask} members={board.members} onClose={onCloseModal} onSaved={load} />}
    </div>
  );
}

function AuthScreen({
  signIn,
  signUp,
  error,
}: {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  error: string | null;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");

  return (
    <div style={{ display: "grid", placeItems: "center", height: "100vh", background: "var(--color-surface)" }}>
      <div className="modal" style={{ width: 420 }}>
        <div className="modal-header">
          <div className="modal-title">{mode === "in" ? "Sign In" : "Create account"}</div>
          <button className="btn ghost" onClick={() => setMode((m) => (m === "in" ? "up" : "in"))}>
            {mode === "in" ? "Need an account?" : "Have an account?"}
          </button>
        </div>
        <div className="form-grid">
          <div className="full">
            <label className="helper">Email</label>
            <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="full">
            <label className="helper">Password</label>
            <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
        </div>
        {error && <div className="helper" style={{ color: "var(--color-error)", marginTop: 8 }}>{error}</div>}
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          {mode === "in" ? (
            <button className="btn primary" onClick={() => signIn(email, password)}>Sign In</button>
          ) : (
            <button className="btn primary" onClick={() => signUp(email, password)}>Sign Up</button>
          )}
        </div>
      </div>
    </div>
  );
}
