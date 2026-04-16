create table if not exists public.roadmap_node_actions (
  id uuid primary key default gen_random_uuid(),
  node_id uuid not null references public.learning_nodes(id) on delete cascade,
  entity_type text not null check (entity_type in ('goal', 'habit', 'routine', 'project', 'task')),
  entity_id uuid not null,
  created_at timestamptz not null default now(),
  constraint roadmap_node_actions_unique unique (node_id, entity_type, entity_id)
);

create index if not exists idx_roadmap_node_actions_node_id
  on public.roadmap_node_actions (node_id);

create index if not exists idx_roadmap_node_actions_entity
  on public.roadmap_node_actions (entity_type, entity_id);
