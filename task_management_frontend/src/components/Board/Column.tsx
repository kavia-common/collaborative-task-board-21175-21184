import React from "react";
import { Droppable } from "@hello-pangea/dnd";
import TaskCard from "./TaskCard";
import type { Column as ColumnT, Task } from "../../types";

// PUBLIC_INTERFACE
export default function Column({
  column,
  tasks,
  onOpenTask,
}: {
  column: ColumnT;
  tasks: Task[];
  onOpenTask: (task: Task) => void;
}) {
  /** Enhanced column with polished header, empty states, and refined styling. */
  
  const getColumnIcon = (title: string) => {
    const lower = title.toLowerCase();
    if (lower.includes("backlog") || lower.includes("todo")) {
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
          <path d="M9 6V10L11.5 11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    }
    if (lower.includes("progress") || lower.includes("doing")) {
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <path
            d="M9 2V9L13 13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.5" />
        </svg>
      );
    }
    if (lower.includes("done") || lower.includes("complete")) {
      return (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
          <circle cx="9" cy="9" r="7" stroke="var(--color-success)" strokeWidth="1.5" />
          <path
            d="M6 9L8 11L12 7"
            stroke="var(--color-success)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      );
    }
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <rect x="3" y="3" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  };

  return (
    <div className="column-enhanced">
      <div className="column-header-enhanced">
        <div className="column-header-left">
          <span className="column-icon" aria-hidden="true">
            {getColumnIcon(column.title)}
          </span>
          <h2 className="column-title-enhanced">{column.title}</h2>
        </div>
        <span className="column-count" aria-label={`${tasks.length} tasks`}>
          {tasks.length}
        </span>
      </div>

      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`task-list-enhanced ${snapshot.isDraggingOver ? "dragging-over" : ""}`}
          >
            {tasks.length === 0 ? (
              <div className="empty-column-state">
                <div className="empty-icon" aria-hidden="true">
                  <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                    <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" opacity="0.3" />
                    <path
                      d="M24 16V24M24 28V28.5"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      opacity="0.5"
                    />
                  </svg>
                </div>
                <p className="empty-text">No tasks yet</p>
                <p className="empty-hint">Drag tasks here or create new ones</p>
              </div>
            ) : (
              tasks.map((t, i) => (
                <TaskCard key={t.id} task={t} index={i} onOpen={() => onOpenTask(t)} />
              ))
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
