import React from "react";

// PUBLIC_INTERFACE
export default function Header({ onSignOut }: { onSignOut: () => Promise<void> }) {
  /** App header with sign out button and branding. */
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 10, height: 10, borderRadius: 999, background: "var(--color-success)" }} />
        <div style={{ fontWeight: 700, color: "var(--color-primary)" }}>Kavia AI Task Management System</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <button className="btn" onClick={onSignOut}>Sign out</button>
      </div>
    </>
  );
}
