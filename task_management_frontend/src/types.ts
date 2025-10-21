export type UUID = string;

export type Priority = "low" | "medium" | "high";

export interface Profile {
  id: UUID;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
}

export interface Column {
  id: UUID;
  title: string;
  position: number; // ordering index
  created_at?: string;
}

export interface Task {
  id: UUID;
  title: string;
  description: string | null;
  assignee_id: UUID | null;
  column_id: UUID;
  due_date: string | null; // ISO string
  priority: Priority;
  position: number; // ordering within column
  created_at?: string;
}

export interface BoardData {
  columns: Column[];
  tasks: Task[];
  members: Profile[];
}
