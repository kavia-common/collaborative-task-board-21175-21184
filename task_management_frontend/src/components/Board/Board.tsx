import React, { useMemo } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import Column from "./Column";
import type { BoardData, Task } from "../../types";
import { moveTask } from "../../services/boardService";

// PUBLIC_INTERFACE
export default function Board({
  data,
  onOpenTask,
  onReload,
}: {
  data: BoardData;
  onOpenTask: (task: Task) => void;
  onReload: () => void;
}): JSX.Element {
  /** Renders the board with columns and tasks and handles drag-and-drop movement. */
  const tasksByColumn = useMemo(() => {
    const m: Record<string, Task[]> = {};
    data.columns.forEach((c) => (m[c.id] = []));
    data.tasks.forEach((t) => {
      if (!m[t.column_id]) m[t.column_id] = [];
      m[t.column_id].push(t);
    });
    Object.values(m).forEach((arr) => arr.sort((a, b) => a.position - b.position));
    return m;
  }, [data]);

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    const toColumn = destination.droppableId;
    const toIndex = destination.index;
    const fromColumn = source.droppableId;
    const fromIndex = source.index;

    if (toColumn === fromColumn && toIndex === fromIndex) return;

    try {
      await moveTask(draggableId, toColumn, toIndex * 10); // spacing to allow inserts
      await onReload();
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="board">
        {data.columns.map((c) => (
          <Column
            key={c.id}
            column={c}
            tasks={tasksByColumn[c.id] || []}
            onOpenTask={onOpenTask}
          />
        ))}
      </div>
    </DragDropContext>
  );
}
