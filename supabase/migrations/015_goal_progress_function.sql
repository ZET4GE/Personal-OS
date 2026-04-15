-- Goal progress from linked entities

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
  v_habits_total integer := 0;
  v_habits_done integer := 0;
  v_projects_total integer := 0;
  v_projects_done integer := 0;
  v_routines_total integer := 0;
  v_routines_done integer := 0;
  v_parts_count integer := 0;
  v_parts_sum numeric := 0;
  v_habits_progress numeric := 0;
  v_projects_progress numeric := 0;
  v_routines_progress numeric := 0;
  v_progress numeric := 0;
begin
  select count(*)
  into v_habits_total
  from public.goal_links gl
  where gl.goal_id = p_goal_id
    and gl.entity_type = 'habit';

  if v_habits_total > 0 then
    select count(distinct hl.habit_id)
    into v_habits_done
    from public.goal_links gl
    join public.habit_logs hl
      on hl.habit_id = gl.entity_id
    where gl.goal_id = p_goal_id
      and gl.entity_type = 'habit'
      and hl.completed_at = current_date;

    v_habits_progress := v_habits_done::numeric / v_habits_total::numeric;
    v_parts_sum := v_parts_sum + v_habits_progress;
    v_parts_count := v_parts_count + 1;
  end if;

  select count(*)
  into v_projects_total
  from public.goal_links gl
  where gl.goal_id = p_goal_id
    and gl.entity_type = 'project';

  if v_projects_total > 0 then
    select count(distinct p.id)
    into v_projects_done
    from public.goal_links gl
    join public.projects p
      on p.id = gl.entity_id
    where gl.goal_id = p_goal_id
      and gl.entity_type = 'project'
      and p.status = 'completed';

    v_projects_progress := v_projects_done::numeric / v_projects_total::numeric;
    v_parts_sum := v_parts_sum + v_projects_progress;
    v_parts_count := v_parts_count + 1;
  end if;

  select count(*)
  into v_routines_total
  from public.goal_links gl
  where gl.goal_id = p_goal_id
    and gl.entity_type = 'routine';

  if v_routines_total > 0 then
    select count(distinct rl.routine_id)
    into v_routines_done
    from public.goal_links gl
    join public.routine_logs rl
      on rl.routine_id = gl.entity_id
    where gl.goal_id = p_goal_id
      and gl.entity_type = 'routine'
      and rl.completed_at = current_date;

    v_routines_progress := v_routines_done::numeric / v_routines_total::numeric;
    v_parts_sum := v_parts_sum + v_routines_progress;
    v_parts_count := v_parts_count + 1;
  end if;

  if v_parts_count > 0 then
    v_progress := v_parts_sum / v_parts_count::numeric;
  end if;

  return query
  select
    coalesce(v_progress, 0),
    coalesce(v_habits_progress, 0),
    coalesce(v_projects_progress, 0),
    coalesce(v_routines_progress, 0);
end;
$$;

revoke all on function public.get_goal_progress(uuid) from public;
grant execute on function public.get_goal_progress(uuid) to authenticated;
