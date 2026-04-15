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
  v_target_time integer;
  v_current_time integer;
begin
  if p_goal_id is null or p_duration is null or p_duration <= 0 then
    return;
  end if;

  update public.goals
  set current_time = current_time + p_duration
  where id = p_goal_id
  returning target_time, current_time
  into v_target_time, v_current_time;

  if not found then
    return;
  end if;

  if v_target_time is not null and v_target_time > 0 then
    update public.goals
    set progress = least(1, v_current_time::numeric / v_target_time::numeric)
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
begin
  if new.goal_id is not null and new.duration is not null and new.duration > 0 then
    perform public.apply_time_to_goal(new.goal_id, new.duration);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_time_entry_goal_progress on public.time_entries;

create trigger trg_time_entry_goal_progress
after insert on public.time_entries
for each row
execute function public.handle_time_entry_goal_progress();

grant execute on function public.apply_time_to_goal(uuid, integer) to authenticated;
