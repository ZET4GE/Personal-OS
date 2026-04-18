create index if not exists idx_time_entries_user_started_at
  on public.time_entries (user_id, started_at desc);

create index if not exists idx_time_entries_user_project_started_at
  on public.time_entries (user_id, project_id, started_at desc)
  where project_id is not null;

create index if not exists idx_time_entries_user_goal_started_at
  on public.time_entries (user_id, goal_id, started_at desc)
  where goal_id is not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'time_entries_duration_non_negative'
  ) then
    alter table public.time_entries
      add constraint time_entries_duration_non_negative
      check (duration is null or duration >= 0);
  end if;
end;
$$;
