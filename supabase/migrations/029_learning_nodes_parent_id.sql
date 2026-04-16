alter table public.learning_nodes
  add column if not exists parent_id uuid references public.learning_nodes(id) on delete set null;

create index if not exists idx_learning_nodes_parent_id
  on public.learning_nodes (parent_id);
