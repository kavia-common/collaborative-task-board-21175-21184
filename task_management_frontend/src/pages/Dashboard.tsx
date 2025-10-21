import React from "react";
import TasksList from "../components/Tasks/TasksList";

// PUBLIC_INTERFACE
export default function Dashboard({
  email,
  onSignOut,
}: {
  email: string | null | undefined;
  onSignOut: () => Promise<void>;
}): JSX.Element {
  /** Minimal dashboard with a tasks list for the signed-in user. */
  return (
    <div style={{ padding: 24, display: "grid", gridTemplateColumns: "1fr", gap: 16 }}>
      <div>
        <h1 style={{ margin: "0 0 8px", color: "var(--color-primary)" }}>Welcome, {email ?? "user"}</h1>
        <p className="helper" style={{ marginBottom: 16 }}>
          Your personal tasks are shown below. Manage them quickly or head to the board for advanced features.
        </p>
        <button className="btn" onClick={onSignOut}>Sign Out</button>
      </div>
      <TasksList />
    </div>
  );
}
