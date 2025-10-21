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
  /** A single column with droppable task list. */
  return (
    <div className="column">
      <div className="column-header">
        <div className="column-title">{column.title}</div>
        <div className="pill">{tasks.length}</div>
      </div>
      <Droppable droppableId={column.id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="task-list"
            style={{
              background: snapshot.isDraggingOver ? "rgba(55,65,81,0.06)" : undefined,
              transition: "background .2s",
            }}
          >
            {tasks.map((t, i) => (
              <TaskCard key={t.id} task={t} index={i} onOpen={() => onOpenTask(t)} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
