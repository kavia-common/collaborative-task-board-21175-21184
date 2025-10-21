import React from "react";
import { Draggable } from "@hello-pangea/dnd";
import type { Task } from "../../types";

// PUBLIC_INTERFACE
export default function TaskCard({ task, index, onOpen }: { task: Task; index: number; onOpen: () => void }) {
  /** Draggable task card with title and small meta. */
  return (
    <Draggable draggableId={task.id} index={index}>
      {(provided, snapshot) => (
        <div
          className="task-card"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={onOpen}
          style={{
            ...provided.draggableProps.style,
            borderColor: snapshot.isDragging ? "var(--color-primary)" : undefined,
          }}
        >
          <div className="task-title">{task.title}</div>
          <div className="task-meta">
            {task.priority && <span className="pill">{task.priority}</span>}
            {task.due_date && <span className="pill">{new Date(task.due_date).toLocaleDateString()}</span>}
          </div>
        </div>
      )}
    </Draggable>
  );
}
