alter table public.learning_nodes
  add column if not exists status text not null default 'pending',
  add column if not exists completed_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'learning_nodes_status_check'
  ) then
    alter table public.learning_nodes
      add constraint learning_nodes_status_check
      check (status in ('pending', 'in_progress', 'completed', 'blocked'));
  end if;
end;
$$;

create index if not exists idx_learning_nodes_status
  on public.learning_nodes (status);
