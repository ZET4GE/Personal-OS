revoke all on function public.check_upcoming_deadlines() from public, anon, authenticated;
revoke all on function public.check_pending_payments() from public, anon, authenticated;
revoke all on function public.notify_habit_streak() from public, anon, authenticated;

grant execute on function public.check_upcoming_deadlines() to service_role;
grant execute on function public.check_pending_payments() to service_role;
grant execute on function public.notify_habit_streak() to service_role;

delete from public.goal_links gl
where gl.entity_type = 'task'
  or (
    gl.entity_type = 'skill'
    and not exists (
      select 1
      from public.skills s
      where s.id = gl.entity_id
        and s.user_id = gl.user_id
    )
  );

alter table public.goal_links
  drop constraint if exists goal_links_entity_type_check;

alter table public.goal_links
  add constraint goal_links_entity_type_check
  check (entity_type in ('project', 'habit', 'routine', 'note', 'skill'));

create or replace function public.user_owns_goal_entity(
  p_entity_type text,
  p_entity_id uuid,
  p_user_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select case p_entity_type
    when 'project' then exists (
      select 1 from public.projects p
      where p.id = p_entity_id
        and p.user_id = p_user_id
    )
    when 'habit' then exists (
      select 1 from public.habits h
      where h.id = p_entity_id
        and h.user_id = p_user_id
    )
    when 'routine' then exists (
      select 1 from public.routines r
      where r.id = p_entity_id
        and r.user_id = p_user_id
    )
    when 'note' then exists (
      select 1 from public.notes n
      where n.id = p_entity_id
        and n.user_id = p_user_id
    )
    when 'skill' then exists (
      select 1 from public.skills s
      where s.id = p_entity_id
        and s.user_id = p_user_id
    )
    else false
  end;
$$;

revoke all on function public.user_owns_goal_entity(text, uuid, uuid) from public;
grant execute on function public.user_owns_goal_entity(text, uuid, uuid) to authenticated;

create or replace function public.link_entity_to_goal(
  p_goal_id uuid,
  p_entity_type text,
  p_entity_id uuid,
  p_user_id uuid
)
returns public.goal_links
language plpgsql
security definer
set search_path = public
as $$
declare
  v_link public.goal_links;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if auth.uid() <> p_user_id then
    raise exception 'invalid user';
  end if;

  if p_entity_type not in ('project', 'habit', 'routine', 'note', 'skill') then
    raise exception 'invalid entity_type';
  end if;

  if not exists (
    select 1
    from public.goals g
    where g.id = p_goal_id
      and g.user_id = p_user_id
  ) then
    raise exception 'goal not found or does not belong to user';
  end if;

  if not public.user_owns_goal_entity(p_entity_type, p_entity_id, p_user_id) then
    raise exception 'entity not found or does not belong to user';
  end if;

  insert into public.goal_links (
    goal_id,
    entity_type,
    entity_id,
    user_id
  )
  values (
    p_goal_id,
    p_entity_type,
    p_entity_id,
    p_user_id
  )
  on conflict (goal_id, entity_type, entity_id) do update
    set user_id = excluded.user_id
  returning *
  into v_link;

  return v_link;
end;
$$;

revoke all on function public.link_entity_to_goal(uuid, text, uuid, uuid) from public;
grant execute on function public.link_entity_to_goal(uuid, text, uuid, uuid) to authenticated;

create or replace function public.unlink_entity_from_goal(
  p_goal_id uuid,
  p_entity_type text,
  p_entity_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1
    from public.goals g
    where g.id = p_goal_id
      and g.user_id = auth.uid()
  ) then
    raise exception 'goal not found or access denied';
  end if;

  if p_entity_type not in ('project', 'habit', 'routine', 'note', 'skill') then
    raise exception 'invalid entity_type';
  end if;

  delete from public.goal_links gl
  where gl.goal_id = p_goal_id
    and gl.entity_type = p_entity_type
    and gl.entity_id = p_entity_id
    and gl.user_id = auth.uid();
end;
$$;

revoke all on function public.unlink_entity_from_goal(uuid, text, uuid) from public;
grant execute on function public.unlink_entity_from_goal(uuid, text, uuid) to authenticated;

update public.time_entries te
set project_id = null
where project_id is not null
  and not exists (
    select 1
    from public.projects p
    where p.id = te.project_id
      and p.user_id = te.user_id
  );

update public.time_entries te
set goal_id = null
where goal_id is not null
  and not exists (
    select 1
    from public.goals g
    where g.id = te.goal_id
      and g.user_id = te.user_id
  );

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'time_entries_project_id_fkey'
  ) then
    alter table public.time_entries
      add constraint time_entries_project_id_fkey
      foreign key (project_id)
      references public.projects(id)
      on delete set null;
  end if;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'time_entries_goal_id_fkey'
  ) then
    alter table public.time_entries
      add constraint time_entries_goal_id_fkey
      foreign key (goal_id)
      references public.goals(id)
      on delete set null;
  end if;
end;
$$;

create or replace function public.validate_time_entry_targets()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.project_id is not null and not exists (
    select 1
    from public.projects p
    where p.id = new.project_id
      and p.user_id = new.user_id
  ) then
    raise exception 'project_id does not belong to time entry owner';
  end if;

  if new.goal_id is not null and not exists (
    select 1
    from public.goals g
    where g.id = new.goal_id
      and g.user_id = new.user_id
  ) then
    raise exception 'goal_id does not belong to time entry owner';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_time_entry_targets() from public;

drop trigger if exists trg_validate_time_entry_targets on public.time_entries;
create trigger trg_validate_time_entry_targets
  before insert or update of user_id, project_id, goal_id
  on public.time_entries
  for each row
  execute function public.validate_time_entry_targets();
