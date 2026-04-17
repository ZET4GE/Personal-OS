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
  v_target_time integer;
  v_current_time integer;
  v_progress integer;
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
  where id = p_goal_id
  returning target_time, "current_time"
  into v_target_time, v_current_time;

  if v_target_time is not null and v_target_time > 0 then
    v_progress := least(100, greatest(0, floor((v_current_time::numeric / v_target_time::numeric) * 100)::integer));

    update public.goals
    set
      progress = v_progress,
      status = case
        when v_progress >= 100 and status = 'active' then 'completed'
        else status
      end,
      completed_at = case
        when v_progress >= 100 and completed_at is null then now()
        else completed_at
      end,
      updated_at = now()
    where id = p_goal_id;
  end if;
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
  v_has_due_habits_today boolean := false;
  v_has_habits_today boolean := false;
  v_goal record;
  v_last_time_entry timestamptz;
  v_has_goal_activity_today boolean;
  v_progress numeric;
begin
  if auth.uid() is not null and auth.uid() <> p_user_id then
    raise exception 'not authorized';
  end if;

  select exists (
    select 1
    from public.habits h
    where h.user_id = p_user_id
      and h.is_active = true
      and (
        h.frequency = 'daily'
        or extract(dow from v_today)::integer = any(h.target_days)
        or (h.frequency = 'weekdays' and extract(isodow from v_today)::integer between 1 and 5)
      )
  )
  into v_has_due_habits_today;

  select exists (
    select 1
    from public.habit_logs hl
    where hl.user_id = p_user_id
      and hl.completed_at = v_today
  )
  into v_has_habits_today;

  for v_goal in
    select g.id, g.title, g.progress, g.target_time, g."current_time", g.created_at
    from public.goals g
    where g.user_id = p_user_id
      and g.status = 'active'
    order by g.priority desc, g.created_at asc
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
      from public.goal_updates gu
      where gu.user_id = p_user_id
        and gu.goal_id = v_goal.id
        and gu.created_at::date = v_today

      union all

      select 1
      from public.milestones m
      where m.user_id = p_user_id
        and m.goal_id = v_goal.id
        and m.is_completed = true
        and m.completed_at::date = v_today

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

      union all

      select 1
      from public.goal_links gl
      join public.projects p
        on gl.entity_type = 'project'
       and gl.entity_id = p.id
      where gl.goal_id = v_goal.id
        and p.user_id = p_user_id
        and p.updated_at::date = v_today
    )
    into v_has_goal_activity_today;

    if v_has_goal_activity_today then
      continue;
    end if;

    v_progress := case
      when coalesce(v_goal.target_time, 0) > 0 then
        least(100, greatest(0, (coalesce(v_goal."current_time", 0)::numeric / v_goal.target_time::numeric) * 100))
      else
        coalesce(v_goal.progress, 0)
    end;

    if coalesce(v_last_time_entry, v_goal.created_at) < now() - interval '3 days' then
      type := 'warning';
      message := format('Hace dias no avanzas en %s', v_goal.title);
      v_alert_count := v_alert_count + 1;
      return next;
      continue;
    elsif v_progress < 20 then
      type := 'warning';
      message := format('Meta atrasada: %s', v_goal.title);
      v_alert_count := v_alert_count + 1;
      return next;
      continue;
    end if;
  end loop;

  if v_has_due_habits_today and not v_has_habits_today and v_alert_count < 3 then
    type := 'info';
    message := 'No registraste habitos hoy';
    return next;
  end if;

  return;
end;
$$;

grant execute on function public.apply_time_to_goal(uuid, integer) to authenticated;
grant execute on function public.get_smart_alerts(uuid) to authenticated;
