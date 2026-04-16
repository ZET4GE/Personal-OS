alter table public.learning_roadmaps enable row level security;
alter table public.learning_nodes enable row level security;
alter table public.learning_node_goals enable row level security;
alter table public.roadmap_node_actions enable row level security;
alter table public.time_entries enable row level security;
alter table public.goal_links enable row level security;

drop policy if exists "Users manage own learning roadmaps" on public.learning_roadmaps;
create policy "Users manage own learning roadmaps"
  on public.learning_roadmaps
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own learning nodes" on public.learning_nodes;
create policy "Users manage own learning nodes"
  on public.learning_nodes
  for all
  using (
    exists (
      select 1
      from public.learning_roadmaps r
      where r.id = learning_nodes.roadmap_id
        and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.learning_roadmaps r
      where r.id = learning_nodes.roadmap_id
        and r.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own learning node goals" on public.learning_node_goals;
create policy "Users manage own learning node goals"
  on public.learning_node_goals
  for all
  using (
    exists (
      select 1
      from public.learning_nodes n
      join public.learning_roadmaps r on r.id = n.roadmap_id
      where n.id = learning_node_goals.node_id
        and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.learning_nodes n
      join public.learning_roadmaps r on r.id = n.roadmap_id
      where n.id = learning_node_goals.node_id
        and r.user_id = auth.uid()
    )
    and exists (
      select 1
      from public.goals g
      where g.id = learning_node_goals.goal_id
        and g.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own roadmap node actions" on public.roadmap_node_actions;
create policy "Users manage own roadmap node actions"
  on public.roadmap_node_actions
  for all
  using (
    exists (
      select 1
      from public.learning_nodes n
      join public.learning_roadmaps r on r.id = n.roadmap_id
      where n.id = roadmap_node_actions.node_id
        and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.learning_nodes n
      join public.learning_roadmaps r on r.id = n.roadmap_id
      where n.id = roadmap_node_actions.node_id
        and r.user_id = auth.uid()
    )
  );

drop policy if exists "Users manage own time entries" on public.time_entries;
create policy "Users manage own time entries"
  on public.time_entries
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "Users manage own goal links" on public.goal_links;
create policy "Users manage own goal links"
  on public.goal_links
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create or replace function public.get_roadmap_node_progress(p_node_id uuid)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_status text;
  v_goal_progress numeric;
  v_habit_progress numeric;
  v_routine_progress numeric;
  v_project_progress numeric;
  v_parts numeric[] := array[]::numeric[];
  v_result numeric := 0;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select n.status
  into v_status
  from public.learning_nodes n
  join public.learning_roadmaps r on r.id = n.roadmap_id
  where n.id = p_node_id
    and r.user_id = auth.uid();

  if v_status is null then
    raise exception 'roadmap node not found or access denied';
  end if;

  if v_status = 'completed' then
    return 1;
  end if;

  select avg(coalesce(g.progress, 0) / 100.0)
  into v_goal_progress
  from public.roadmap_node_actions a
  join public.goals g on g.id = a.entity_id and g.user_id = auth.uid()
  where a.node_id = p_node_id
    and a.entity_type = 'goal';

  if v_goal_progress is not null then
    v_parts := array_append(v_parts, least(greatest(v_goal_progress, 0), 1));
  end if;

  select avg(
    case
      when exists (
        select 1
        from public.habit_logs hl
        where hl.habit_id = h.id
          and hl.completed_at = current_date
      )
      then 1
      else 0
    end
  )
  into v_habit_progress
  from public.roadmap_node_actions a
  join public.habits h on h.id = a.entity_id and h.user_id = auth.uid()
  where a.node_id = p_node_id
    and a.entity_type = 'habit';

  if v_habit_progress is not null then
    v_parts := array_append(v_parts, least(greatest(v_habit_progress, 0), 1));
  end if;

  select avg(
    case
      when exists (
        select 1
        from public.routine_logs rl
        where rl.routine_id = r.id
          and rl.completed_at = current_date
      )
      then 1
      else 0
    end
  )
  into v_routine_progress
  from public.roadmap_node_actions a
  join public.routines r on r.id = a.entity_id and r.user_id = auth.uid()
  where a.node_id = p_node_id
    and a.entity_type = 'routine';

  if v_routine_progress is not null then
    v_parts := array_append(v_parts, least(greatest(v_routine_progress, 0), 1));
  end if;

  select avg(
    case
      when p.status = 'completed' then 1
      else 0
    end
  )
  into v_project_progress
  from public.roadmap_node_actions a
  join public.projects p on p.id = a.entity_id and p.user_id = auth.uid()
  where a.node_id = p_node_id
    and a.entity_type = 'project';

  if v_project_progress is not null then
    v_parts := array_append(v_parts, least(greatest(v_project_progress, 0), 1));
  end if;

  if array_length(v_parts, 1) is null then
    return 0;
  end if;

  select avg(value)
  into v_result
  from unnest(v_parts) as value;

  return least(greatest(coalesce(v_result, 0), 0), 1);
end;
$$;

revoke all on function public.get_roadmap_node_progress(uuid) from public;
grant execute on function public.get_roadmap_node_progress(uuid) to authenticated;

create or replace function public.get_roadmap_progress(p_roadmap_id uuid)
returns numeric
language plpgsql
security definer
set search_path = public
as $$
declare
  v_result numeric := 0;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1
    from public.learning_roadmaps r
    where r.id = p_roadmap_id
      and r.user_id = auth.uid()
  ) then
    raise exception 'roadmap not found or access denied';
  end if;

  select avg(public.get_roadmap_node_progress(n.id))
  into v_result
  from public.learning_nodes n
  where n.roadmap_id = p_roadmap_id;

  return least(greatest(coalesce(v_result, 0), 0), 1);
end;
$$;

revoke all on function public.get_roadmap_progress(uuid) from public;
grant execute on function public.get_roadmap_progress(uuid) to authenticated;
