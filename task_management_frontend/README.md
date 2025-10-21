# Collaborative Task Board (Frontend)

A minimalist Ocean Professional themed Kanban board built with React + TypeScript, using Supabase for authentication, data, and real-time updates.

## Tech
- React 18 + TypeScript
- Supabase (Auth, Postgres, Realtime)
- @hello-pangea/dnd (drag-and-drop)
- Minimal custom CSS (no UI framework)

## Environment
Create `.env` at project root with:
```
REACT_APP_SUPABASE_URL=your_supabase_project_url
REACT_APP_SUPABASE_KEY=your_supabase_anon_key
```
These variables are required at runtime. They are not hard-coded.

## Install & Run
```
npm install
npm run start
```
Open http://localhost:3000

Troubleshooting:
- If npm install fails with a peer dependency error related to react-scripts and TypeScript, ensure TypeScript is pinned to ^4.9 (package.json already set to 4.9.5).
- Ensure you have a `.env` file based on `.env.example`. Without Supabase vars the app still starts but in a disabled state.

Optional: Type checks
```
npm run typecheck
```

## Database Schema (SQL)
Run in Supabase SQL editor:

```sql
-- profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);
alter table public.profiles enable row level security;
create policy "Profiles are readable by authenticated" on public.profiles
  for select using (auth.role() = 'authenticated');
create policy "Users can update own profile" on public.profiles
  for update using ( auth.uid() = id );

-- columns
create table if not exists public.columns (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  position int not null default 0,
  created_at timestamp with time zone default now()
);
alter table public.columns enable row level security;
create policy "Columns readable to authenticated" on public.columns
  for select using (auth.role() = 'authenticated');
create policy "Columns insert by authenticated" on public.columns
  for insert with check (auth.role() = 'authenticated');
create policy "Columns update by authenticated" on public.columns
  for update using (auth.role() = 'authenticated');

-- tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  assignee_id uuid references public.profiles(id),
  column_id uuid not null references public.columns(id) on delete cascade,
  due_date timestamptz,
  priority text not null default 'medium' check (priority in ('low','medium','high')),
  position int not null default 0,
  created_at timestamp with time zone default now()
);
alter table public.tasks enable row level security;
create policy "Tasks readable to authenticated" on public.tasks
  for select using (auth.role() = 'authenticated');
create policy "Tasks insert by authenticated" on public.tasks
  for insert with check (auth.role() = 'authenticated');
create policy "Tasks update by authenticated" on public.tasks
  for update using (auth.role() = 'authenticated');
```

## Realtime
This app subscribes to Postgres changes on `columns` and `tasks` and refreshes the board when inserts/updates/deletes happen.

## Feature Flags / Seed Safety
- If environment variables are missing, the app runs in a disabled state and shows a helpful message.
- On first load with an empty board, default columns (`Backlog`, `In Progress`, `Done`) are inserted (idempotent).

## Styling
Ocean Professional minimalist theme via CSS variables:
- primary #374151, secondary #9CA3AF
- success #10B981, error #EF4444
- background #FFFFFF, surface #F9FAFB, text #111827

## Notes
- Authentication uses email/password with Supabase session persistence.
- Update `emailRedirectTo` behavior by deploying with your final domain (we default to current origin).
- Ensure Realtime is enabled in your Supabase project.
