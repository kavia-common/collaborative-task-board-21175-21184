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
import SignIn from "./components/Auth/SignIn";
import Dashboard from "./pages/Dashboard";

// PUBLIC_INTERFACE
export default function App(): JSX.Element {
  /** Root application shell with enhanced UI and polished task board experience. */
  const { user, loading: authLoading, error: authError, signOut, configured } = useAuth();

  const [board, setBoard] = useState<BoardData>({ columns: [], tasks: [], members: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [showBoard, setShowBoard] = useState<boolean>(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchBoard();
      setBoard(data);
      // Auto-show board if we have columns
      if (data.columns.length > 0) {
        setShowBoard(true);
      }
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error("[App] Load board failed:", e);
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
      load();
    }, [load]),
  );

  const handleCreateDefaultColumns = async () => {
    if (!isSupabaseConfigured()) return;
    const exists = board.columns.length > 0;
    if (exists) return;
    const defaults = ["Backlog", "In Progress", "Done"];
    for (let i = 0; i < defaults.length; i += 1) {
      try {
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
          <div style={{ fontWeight: 700, color: "var(--color-primary)" }}>Kavia AI Task Management System</div>
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
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
        <div className="state">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <SignIn title="Kavia AI Task Management System" />;
  }

  // Show enhanced Dashboard UI
  if (!showBoard) {
    return (
      <div className="app-shell">
        <header className="app-header">
          <Header onSignOut={signOut} />
        </header>
        <aside className="app-sidebar">
          <Sidebar members={board.members} />
        </aside>
        <main className="app-main" style={{ padding: 0 }}>
          {loading ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
              <div className="state">Loading board...</div>
            </div>
          ) : (
            <Dashboard email={user?.email} onSignOut={signOut} />
          )}
          {!loading && board.columns.length > 0 && (
            <div style={{ padding: "0 40px 32px", textAlign: "center" }}>
              <button className="btn primary" onClick={() => setShowBoard(true)}>
                View Task Board
              </button>
            </div>
          )}
        </main>
      </div>
    );
  }

  // Show enhanced Board UI
  return (
    <div className="app-shell">
      <header className="app-header">
        <Header onSignOut={signOut} />
      </header>
      <aside className="app-sidebar">
        <Sidebar members={board.members} />
        <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid #E5E7EB" }}>
          <button className="btn" onClick={() => setShowBoard(false)} style={{ width: "100%" }}>
            ← Back to Dashboard
          </button>
        </div>
      </aside>
      <main className="app-main" style={{ padding: 0 }}>
        {loading ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "60vh" }}>
            <div className="state">Loading board...</div>
          </div>
        ) : emptyState ? (
          <div style={{ padding: 40 }}>
            <div className="state">{emptyState}</div>
          </div>
        ) : (
          <Board data={board} onOpenTask={onOpenTask} onReload={load} />
        )}
      </main>
      {modalTask && <TaskModal task={modalTask} members={board.members} onClose={onCloseModal} onSaved={load} />}
    </div>
  );
}
