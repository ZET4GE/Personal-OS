create table if not exists public.time_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid,
  goal_id uuid,
  description text,
  started_at timestamptz not null,
  ended_at timestamptz,
  duration integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_time_entries_user_id
  on public.time_entries (user_id);

create index if not exists idx_time_entries_project_id
  on public.time_entries (project_id);

create index if not exists idx_time_entries_goal_id
  on public.time_entries (goal_id);
