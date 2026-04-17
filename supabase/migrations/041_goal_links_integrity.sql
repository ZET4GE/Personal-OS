alter table public.goal_links
  drop constraint if exists goal_links_entity_type_check;

alter table public.goal_links
  add constraint goal_links_entity_type_check
  check (entity_type in ('project', 'habit', 'routine', 'note', 'task', 'skill'));

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
    when 'task' then true
    when 'skill' then true
    else false
  end;
$$;

revoke all on function public.user_owns_goal_entity(text, uuid, uuid) from public;
grant execute on function public.user_owns_goal_entity(text, uuid, uuid) to authenticated;

drop policy if exists "Users manage own goal links" on public.goal_links;
create policy "Users manage own goal links"
  on public.goal_links
  for all
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.goals g
      where g.id = goal_links.goal_id
        and g.user_id = auth.uid()
    )
    and public.user_owns_goal_entity(goal_links.entity_type, goal_links.entity_id, auth.uid())
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.goals g
      where g.id = goal_links.goal_id
        and g.user_id = auth.uid()
    )
    and public.user_owns_goal_entity(goal_links.entity_type, goal_links.entity_id, auth.uid())
  );

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

  if p_entity_type not in ('project', 'habit', 'routine', 'note', 'task', 'skill') then
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

  if p_entity_type not in ('project', 'habit', 'routine', 'note', 'task', 'skill') then
    raise exception 'invalid entity_type';
  end if;

  delete from public.goal_links gl
  where gl.goal_id = p_goal_id
    and gl.entity_type = p_entity_type
    and gl.entity_id = p_entity_id
    and gl.user_id = auth.uid();
end;
$$;

create or replace function public.get_goal_entities(
  p_goal_id uuid
)
returns table (
  entity_type text,
  entity_id uuid
)
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

  return query
  select
    gl.entity_type,
    gl.entity_id
  from public.goal_links gl
  where gl.goal_id = p_goal_id
    and gl.user_id = auth.uid()
    and public.user_owns_goal_entity(gl.entity_type, gl.entity_id, auth.uid())
  order by gl.created_at asc, gl.id asc;
end;
$$;

revoke all on function public.link_entity_to_goal(uuid, text, uuid, uuid) from public;
revoke all on function public.unlink_entity_from_goal(uuid, text, uuid) from public;
revoke all on function public.get_goal_entities(uuid) from public;

grant execute on function public.link_entity_to_goal(uuid, text, uuid, uuid) to authenticated;
grant execute on function public.unlink_entity_from_goal(uuid, text, uuid) to authenticated;
grant execute on function public.get_goal_entities(uuid) to authenticated;
