alter table public.learning_nodes
  add column if not exists position_x integer,
  add column if not exists position_y integer;
