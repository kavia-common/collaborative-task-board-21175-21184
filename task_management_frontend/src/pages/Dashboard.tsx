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
  /** Enhanced dashboard with branded header and polished task board UI. */
  return (
    <div className="dashboard-container">
      {/* Branded Header Section */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-brand">
            <div className="brand-icon" aria-hidden="true">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <rect width="32" height="32" rx="8" fill="var(--color-primary)" />
                <path
                  d="M9 16L14 21L23 11"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div>
              <h1 className="dashboard-title">Kavia AI Task Management System</h1>
              <p className="dashboard-subtitle">Organize, collaborate, and track your team's progress</p>
            </div>
          </div>
          <div className="dashboard-user-section">
            <div className="user-info">
              <div className="user-avatar">
                {(email ?? "U").charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <div className="user-email">{email ?? "user"}</div>
                <div className="user-status">
                  <span className="status-indicator" />
                  Active
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="dashboard-main">
        <TasksList />
      </div>
    </div>
  );
}
