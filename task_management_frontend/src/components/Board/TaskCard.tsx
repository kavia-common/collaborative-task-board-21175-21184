import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import { format } from "date-fns";
import type { Task } from "../../types";

// PUBLIC_INTERFACE
export default function TaskCard({ task, index, onOpen }: { task: Task; index: number; onOpen: () => void }) {
  /** Polished draggable task card with refined styling and visual hierarchy. */
  
  const priorityConfig = {
    low: { color: "#6B7280", bg: "#F3F4F6", label: "Low" },
    medium: { color: "#F59E0B", bg: "#FEF3C7", label: "Medium" },
    high: { color: "#EF4444", bg: "#FEE2E2", label: "High" },
  };

  const config = priorityConfig[task.priority] || priorityConfig.medium;

  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          className="task-card-enhanced"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onOpen}
          style={{
            ...provided.draggableProps.style,
            transform: snapshot.isDragging
              ? `${provided.draggableProps.style?.transform} rotate(2deg)`
              : provided.draggableProps.style?.transform,
            boxShadow: snapshot.isDragging
              ? "0 8px 16px rgba(0,0,0,0.12), 0 0 0 2px var(--color-primary)"
              : undefined,
          }}
          role="button"
          tabIndex={0}
          aria-label={`Task: ${task.title}`}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onOpen();
            }
          }}
        >
          {/* Priority Indicator Bar */}
          <div
            className="task-priority-bar"
            style={{ background: config.color }}
            aria-hidden="true"
          />

          {/* Task Content */}
          <div className="task-card-content">
            <div className="task-card-header">
              <h3 className="task-card-title">{task.title}</h3>
              {snapshot.isDragging && (
                <div className="drag-indicator" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <circle cx="4" cy="4" r="1.5" />
                    <circle cx="12" cy="4" r="1.5" />
                    <circle cx="4" cy="8" r="1.5" />
                    <circle cx="12" cy="8" r="1.5" />
                    <circle cx="4" cy="12" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                  </svg>
                </div>
              )}
            </div>

            {task.description && (
              <p className="task-card-description">
                {task.description.length > 80
                  ? `${task.description.substring(0, 80)}...`
                  : task.description}
              </p>
            )}

            {/* Task Meta */}
            <div className="task-card-footer">
              <div className="task-card-badges">
                <span
                  className="priority-badge"
                  style={{
                    background: config.bg,
                    color: config.color,
                    borderColor: config.color,
                  }}
                >
                  {config.label}
                </span>
                {task.due_date && (
                  <span className="due-date-badge">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      style={{ marginRight: 4 }}
                    >
                      <rect
                        x="1"
                        y="2"
                        width="10"
                        height="9"
                        rx="1"
                        stroke="currentColor"
                        strokeWidth="1.2"
                      />
                      <path d="M1 4.5H11" stroke="currentColor" strokeWidth="1.2" />
                      <path d="M4 1V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                      <path d="M8 1V3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
                    </svg>
                    {format(new Date(task.due_date), "MMM d")}
                  </span>
                )}
              </div>
              {task.assignee_id && (
                <div className="task-assignee-avatar" title="Assigned">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="currentColor">
                    <circle cx="7" cy="5" r="2.5" />
                    <path d="M2 12c0-2.5 2.2-4 5-4s5 1.5 5 4" strokeWidth="1" fill="none" stroke="currentColor" />
                  </svg>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
}
