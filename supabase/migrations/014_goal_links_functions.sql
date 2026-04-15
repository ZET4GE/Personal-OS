-- Goal links + helper functions

create table if not exists public.goal_links (
  id uuid primary key default gen_random_uuid(),
  goal_id uuid not null references public.goals(id) on delete cascade,
  entity_type text not null check (entity_type in ('project', 'habit', 'routine', 'note', 'task', 'skill')),
  entity_id uuid not null,
  user_id uuid references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.goal_links
  add constraint goal_links_goal_entity_unique
  unique (goal_id, entity_type, entity_id);

create index if not exists idx_goal_links_goal_id
  on public.goal_links (goal_id);

create index if not exists idx_goal_links_entity_type_entity_id
  on public.goal_links (entity_type, entity_id);

create index if not exists idx_goal_links_user_id
  on public.goal_links (user_id);

alter table public.goal_links enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'goal_links'
      and policyname = 'Users manage own goal links'
  ) then
    create policy "Users manage own goal links"
      on public.goal_links
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end
$$;

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
  order by gl.created_at asc, gl.id asc;
end;
$$;

revoke all on function public.link_entity_to_goal(uuid, text, uuid, uuid) from public;
revoke all on function public.unlink_entity_from_goal(uuid, text, uuid) from public;
revoke all on function public.get_goal_entities(uuid) from public;

grant execute on function public.link_entity_to_goal(uuid, text, uuid, uuid) to authenticated;
grant execute on function public.unlink_entity_from_goal(uuid, text, uuid) to authenticated;
grant execute on function public.get_goal_entities(uuid) to authenticated;
