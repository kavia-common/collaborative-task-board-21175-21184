import React, { useEffect, useState } from "react";
import type { Profile, Task, UUID } from "../types";
import { updateTask } from "../services/boardService";

// PUBLIC_INTERFACE
export default function TaskModal({
  task,
  members,
  onClose,
  onSaved,
}: {
  task: Task;
  members: Profile[];
  onClose: () => void;
  onSaved: () => void;
}) {
  /** Modal dialog to edit an existing task (mutations via RPC). */
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description ?? "");
  const [assignee, setAssignee] = useState<UUID | "">((task.assignee_id as UUID) ?? "");
  const [priority, setPriority] = useState(task.priority);
  const [due, setDue] = useState(task.due_date ? task.due_date.substring(0, 10) : "");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setTitle(task.title);
    setDescription(task.description ?? "");
    setAssignee((task.assignee_id as UUID) ?? "");
    setPriority(task.priority);
    setDue(task.due_date ? task.due_date.substring(0, 10) : "");
  }, [task]);

  const save = async () => {
    setSaving(true);
    try {
      await updateTask(task.id, {
        title,
        description,
        assignee_id: assignee || null,
        priority,
        due_date: due ? new Date(due).toISOString() : null,
      });
      onSaved();
      onClose();
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error("[TaskModal] Save failed via rpc tasks_update:", e?.message ?? e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal">
        <div className="modal-header">
          <div className="modal-title">Edit Task</div>
          <button className="btn" onClick={onClose}>Close</button>
        </div>
        <div className="form-grid">
          <div className="full">
            <label className="helper">Title</label>
            <input className="input" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="full">
            <label className="helper">Description</label>
            <textarea className="textarea" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
          <div>
            <label className="helper">Assignee</label>
            <select className="select" value={assignee} onChange={(e) => setAssignee(e.target.value as UUID | "")}>
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.full_name || m.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="helper">Priority</label>
            <select className="select" value={priority} onChange={(e) => setPriority(e.target.value as Task["priority"])}>
              <option value="low">low</option>
              <option value="medium">medium</option>
              <option value="high">high</option>
            </select>
          </div>
          <div>
            <label className="helper">Due date</label>
            <input className="input" type="date" value={due} onChange={(e) => setDue(e.target.value)} />
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          <button className="btn primary" onClick={save} disabled={saving}>{saving ? "Saving..." : "Save"}</button>
        </div>
      </div>
    </div>
  );
}
