alter table public.learning_roadmaps
  add column if not exists type text not null default 'free';

alter table public.learning_nodes
  add column if not exists level text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'learning_roadmaps_type_check'
  ) then
    alter table public.learning_roadmaps
      add constraint learning_roadmaps_type_check
      check (type in ('free', 'structured', 'goal_based'));
  end if;
end;
$$;

create index if not exists idx_learning_roadmaps_type
  on public.learning_roadmaps (type);

create index if not exists idx_learning_nodes_level
  on public.learning_nodes (level);
