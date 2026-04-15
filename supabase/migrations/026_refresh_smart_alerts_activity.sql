create or replace function public.get_smart_alerts(
  p_user_id uuid
)
returns table (
  type text,
  message text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_today date := current_date;
  v_alert_count integer := 0;
  v_has_habits_today boolean := false;
  v_goal record;
  v_last_time_entry timestamptz;
  v_has_goal_activity_today boolean;
  v_progress numeric;
begin
  select exists (
    select 1
    from public.habit_logs hl
    where hl.user_id = p_user_id
      and hl.completed_at = v_today
  )
  into v_has_habits_today;

  for v_goal in
    select g.id, g.title, g.progress
    from public.goals g
    where g.user_id = p_user_id
    order by g.created_at asc
  loop
    exit when v_alert_count >= 3;

    select max(te.started_at)
    into v_last_time_entry
    from public.time_entries te
    where te.user_id = p_user_id
      and te.goal_id = v_goal.id;

    select exists (
      select 1
      from public.time_entries te
      where te.user_id = p_user_id
        and te.goal_id = v_goal.id
        and te.started_at::date = v_today

      union all

      select 1
      from public.goal_links gl
      join public.habit_logs hl
        on gl.entity_type = 'habit'
       and gl.entity_id = hl.habit_id
      where gl.goal_id = v_goal.id
        and hl.user_id = p_user_id
        and hl.completed_at = v_today

      union all

      select 1
      from public.goal_links gl
      join public.routine_logs rl
        on gl.entity_type = 'routine'
       and gl.entity_id = rl.routine_id
      where gl.goal_id = v_goal.id
        and rl.user_id = p_user_id
        and rl.completed_at = v_today
    )
    into v_has_goal_activity_today;

    if v_has_goal_activity_today then
      continue;
    end if;

    v_progress := coalesce(v_goal.progress, 0);

    if v_last_time_entry is null or v_last_time_entry < now() - interval '3 days' then
      type := 'warning';
      message := format('Hace dias no avanzas en %s', v_goal.title);
      v_alert_count := v_alert_count + 1;
      return next;
      continue;
    elsif v_progress < 0.2 then
      type := 'warning';
      message := format('Meta atrasada: %s', v_goal.title);
      v_alert_count := v_alert_count + 1;
      return next;
      continue;
    end if;
  end loop;

  if not v_has_habits_today and v_alert_count < 3 then
    type := 'info';
    message := 'No registraste habitos hoy';
    return next;
  end if;

  return;
end;
$$;

grant execute on function public.get_smart_alerts(uuid) to authenticated;
