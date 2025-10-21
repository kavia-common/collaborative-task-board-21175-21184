import React from "react";
import type { Profile } from "../types";

// PUBLIC_INTERFACE
export default function Sidebar({ members }: { members: Profile[] }) {
  /** Sidebar with team members list. */
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div style={{ fontWeight: 700, color: "var(--color-primary)" }}>Team</div>
      <div className="members">
        {members.length === 0 ? (
          <div className="state">No members</div>
        ) : (
          members.map((m) => (
            <div className="member" key={m.id}>
              <div className="avatar">{(m.full_name || m.email || "?").slice(0, 1).toUpperCase()}</div>
              <div style={{ display: "flex", flexDirection: "column" }}>
                <span style={{ fontWeight: 600 }}>{m.full_name || "Unnamed"}</span>
                <span className="helper">{m.email}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
