import React from "react";

// PUBLIC_INTERFACE
export default function Dashboard({
  email,
  onSignOut,
}: {
  email: string | null | undefined;
  onSignOut: () => Promise<void>;
}): JSX.Element {
  /** Minimal placeholder dashboard after successful authentication. */
  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ margin: "0 0 8px", color: "var(--color-primary)" }}>Welcome, {email ?? "user"}</h1>
      <p className="helper" style={{ marginBottom: 16 }}>
        You are now signed in. Use the navigation to access the board.
      </p>
      <button className="btn" onClick={onSignOut}>Sign Out</button>
    </div>
  );
}
