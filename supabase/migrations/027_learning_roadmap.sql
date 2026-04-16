create table if not exists public.learning_roadmaps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  is_public boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_nodes (
  id uuid primary key default gen_random_uuid(),
  roadmap_id uuid not null references public.learning_roadmaps(id) on delete cascade,
  title text not null,
  description text,
  type text not null check (type in ('skill', 'topic')),
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.learning_node_goals (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.learning_nodes(id) on delete cascade,
  goal_id uuid not null references public.goals(id) on delete cascade
);

create index if not exists idx_learning_roadmaps_user_id
  on public.learning_roadmaps (user_id);

create index if not exists idx_learning_nodes_roadmap_id
  on public.learning_nodes (roadmap_id);

create index if not exists idx_learning_nodes_position
  on public.learning_nodes (position);

create index if not exists idx_learning_node_goals_node_id
  on public.learning_node_goals (node_id);

create index if not exists idx_learning_node_goals_goal_id
  on public.learning_node_goals (goal_id);
