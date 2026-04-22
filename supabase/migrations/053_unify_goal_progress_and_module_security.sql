alter table public.goals
  add column if not exists target_time integer,
  add column if not exists "current_time" integer not null default 0;

create index if not exists idx_goals_user_status_priority
  on public.goals (user_id, status, priority, created_at);

create or replace function public.recalculate_goal_progress(
  p_goal_id uuid
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
  v_existing_progress integer := 0;
  v_target_time integer;
  v_current_time integer;
  v_time_progress numeric;
  v_milestone_progress numeric;
  v_habits_progress numeric;
  v_projects_progress numeric;
  v_routines_progress numeric;
  v_parts numeric[] := array[]::numeric[];
  v_result integer := 0;
begin
  if p_goal_id is null then
    return 0;
  end if;

  select user_id, coalesce(progress, 0), target_time, coalesce("current_time", 0)
  into v_owner, v_existing_progress, v_target_time, v_current_time
  from public.goals
  where id = p_goal_id;

  if v_owner is null then
    return 0;
  end if;

  if auth.uid() is not null and auth.uid() <> v_owner then
    raise exception 'not authorized';
  end if;

  if coalesce(v_target_time, 0) > 0 then
    v_time_progress := least(greatest(v_current_time::numeric / v_target_time::numeric, 0), 1);
    v_parts := array_append(v_parts, v_time_progress);
  end if;

  select avg(case when m.is_completed then 1 else 0 end)::numeric
  into v_milestone_progress
  from public.milestones m
  where m.goal_id = p_goal_id
    and m.user_id = v_owner;

  if v_milestone_progress is not null then
    v_parts := array_append(v_parts, least(greatest(v_milestone_progress, 0), 1));
  end if;

  select avg(
    case
      when exists (
        select 1
        from public.habit_logs hl
        where hl.habit_id = h.id
          and hl.user_id = v_owner
          and hl.completed_at = current_date
      ) then 1
      else 0
    end
  )::numeric
  into v_habits_progress
  from public.goal_links gl
  join public.habits h on h.id = gl.entity_id and h.user_id = v_owner
  where gl.goal_id = p_goal_id
    and gl.user_id = v_owner
    and gl.entity_type = 'habit';

  if v_habits_progress is not null then
    v_parts := array_append(v_parts, least(greatest(v_habits_progress, 0), 1));
  end if;

  select avg(case when p.status = 'completed' then 1 else 0 end)::numeric
  into v_projects_progress
  from public.goal_links gl
  join public.projects p on p.id = gl.entity_id and p.user_id = v_owner
  where gl.goal_id = p_goal_id
    and gl.user_id = v_owner
    and gl.entity_type = 'project';

  if v_projects_progress is not null then
    v_parts := array_append(v_parts, least(greatest(v_projects_progress, 0), 1));
  end if;

  select avg(
    case
      when exists (
        select 1
        from public.routine_logs rl
        where rl.routine_id = r.id
          and rl.user_id = v_owner
          and rl.completed_at = current_date
      ) then 1
      else 0
    end
  )::numeric
  into v_routines_progress
  from public.goal_links gl
  join public.routines r on r.id = gl.entity_id and r.user_id = v_owner
  where gl.goal_id = p_goal_id
    and gl.user_id = v_owner
    and gl.entity_type = 'routine';

  if v_routines_progress is not null then
    v_parts := array_append(v_parts, least(greatest(v_routines_progress, 0), 1));
  end if;

  if array_length(v_parts, 1) is null then
    v_result := least(greatest(v_existing_progress, 0), 100);
  else
    select round(avg(value) * 100)::integer
    into v_result
    from unnest(v_parts) as value;
  end if;

  update public.goals
  set
    progress = least(greatest(coalesce(v_result, 0), 0), 100),
    status = case
      when least(greatest(coalesce(v_result, 0), 0), 100) >= 100 and status = 'active' then 'completed'
      else status
    end,
    completed_at = case
      when least(greatest(coalesce(v_result, 0), 0), 100) >= 100 and completed_at is null then now()
      else completed_at
    end,
    updated_at = now()
  where id = p_goal_id;

  return least(greatest(coalesce(v_result, 0), 0), 100);
end;
$$;

revoke all on function public.recalculate_goal_progress(uuid) from public;
grant execute on function public.recalculate_goal_progress(uuid) to authenticated;

create or replace function public.calculate_goal_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_goal_id uuid;
begin
  if tg_op = 'DELETE' then
    v_goal_id := old.goal_id;
  else
    v_goal_id := new.goal_id;
  end if;

  perform public.recalculate_goal_progress(v_goal_id);

  if tg_op = 'DELETE' then
    return old;
  end if;

  return new;
end;
$$;

create or replace function public.apply_time_to_goal(
  p_goal_id uuid,
  p_duration integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner uuid;
begin
  if p_goal_id is null or coalesce(p_duration, 0) <= 0 then
    return;
  end if;

  select user_id
  into v_owner
  from public.goals
  where id = p_goal_id;

  if v_owner is null then
    return;
  end if;

  if auth.uid() is not null and auth.uid() <> v_owner then
    raise exception 'not authorized';
  end if;

  update public.goals
  set
    "current_time" = coalesce("current_time", 0) + p_duration,
    updated_at = now()
  where id = p_goal_id;

  perform public.recalculate_goal_progress(p_goal_id);
end;
$$;

create or replace function public.handle_time_entry_goal_progress()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_duration integer;
begin
  v_duration := coalesce(
    new.duration,
    case
      when new.ended_at is not null then greatest(0, extract(epoch from (new.ended_at - new.started_at))::integer)
      else 0
    end
  );

  if new.goal_id is not null and v_duration > 0 then
    perform public.apply_time_to_goal(new.goal_id, v_duration);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_time_entry_goal_progress on public.time_entries;
create trigger trg_time_entry_goal_progress
after insert on public.time_entries
for each row
execute function public.handle_time_entry_goal_progress();

create or replace function public.get_goal_progress(
  p_goal_id uuid
)
returns table (
  progress numeric,
  habits_progress numeric,
  projects_progress numeric,
  routines_progress numeric
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_habits_progress numeric := 0;
  v_projects_progress numeric := 0;
  v_routines_progress numeric := 0;
  v_goal_progress integer := 0;
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1
    from public.goals g
    where g.id = p_goal_id
      and g.user_id = v_user_id
  ) then
    raise exception 'goal not found or access denied';
  end if;

  select coalesce(avg(
    case
      when exists (
        select 1
        from public.habit_logs hl
        where hl.habit_id = h.id
          and hl.user_id = v_user_id
          and hl.completed_at = current_date
      ) then 1
      else 0
    end
  ), 0)::numeric
  into v_habits_progress
  from public.goal_links gl
  join public.habits h on h.id = gl.entity_id and h.user_id = v_user_id
  where gl.goal_id = p_goal_id
    and gl.user_id = v_user_id
    and gl.entity_type = 'habit';

  select coalesce(avg(case when p.status = 'completed' then 1 else 0 end), 0)::numeric
  into v_projects_progress
  from public.goal_links gl
  join public.projects p on p.id = gl.entity_id and p.user_id = v_user_id
  where gl.goal_id = p_goal_id
    and gl.user_id = v_user_id
    and gl.entity_type = 'project';

  select coalesce(avg(
    case
      when exists (
        select 1
        from public.routine_logs rl
        where rl.routine_id = r.id
          and rl.user_id = v_user_id
          and rl.completed_at = current_date
      ) then 1
      else 0
    end
  ), 0)::numeric
  into v_routines_progress
  from public.goal_links gl
  join public.routines r on r.id = gl.entity_id and r.user_id = v_user_id
  where gl.goal_id = p_goal_id
    and gl.user_id = v_user_id
    and gl.entity_type = 'routine';

  select coalesce(g.progress, 0)
  into v_goal_progress
  from public.goals g
  where g.id = p_goal_id
    and g.user_id = v_user_id;

  return query
  select
    (v_goal_progress::numeric / 100.0),
    coalesce(v_habits_progress, 0),
    coalesce(v_projects_progress, 0),
    coalesce(v_routines_progress, 0);
end;
$$;

revoke all on function public.apply_time_to_goal(uuid, integer) from public;
revoke all on function public.get_goal_progress(uuid) from public;
grant execute on function public.apply_time_to_goal(uuid, integer) to authenticated;
grant execute on function public.get_goal_progress(uuid) to authenticated;

do $$
declare
  v_goal record;
begin
  for v_goal in select id from public.goals loop
    perform public.recalculate_goal_progress(v_goal.id);
  end loop;
end;
$$;
