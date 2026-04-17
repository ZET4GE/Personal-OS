alter table public.tag_links
  drop constraint if exists tag_links_entity_type_check;

alter table public.tag_links
  add constraint tag_links_entity_type_check
  check (entity_type in (
    'project',
    'habit',
    'routine',
    'note',
    'goal',
    'roadmap',
    'job',
    'client',
    'freelance'
  ));

alter table public.tags enable row level security;
alter table public.tag_links enable row level security;

create or replace function public.user_owns_tag_entity(
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
    when 'project' then exists (select 1 from public.projects p where p.id = p_entity_id and p.user_id = p_user_id)
    when 'habit' then exists (select 1 from public.habits h where h.id = p_entity_id and h.user_id = p_user_id)
    when 'routine' then exists (select 1 from public.routines r where r.id = p_entity_id and r.user_id = p_user_id)
    when 'note' then exists (select 1 from public.notes n where n.id = p_entity_id and n.user_id = p_user_id)
    when 'goal' then exists (select 1 from public.goals g where g.id = p_entity_id and g.user_id = p_user_id)
    when 'roadmap' then exists (select 1 from public.learning_roadmaps lr where lr.id = p_entity_id and lr.user_id = p_user_id)
    when 'job' then exists (select 1 from public.job_applications j where j.id = p_entity_id and j.user_id = p_user_id)
    when 'client' then exists (select 1 from public.clients c where c.id = p_entity_id and c.user_id = p_user_id)
    when 'freelance' then exists (select 1 from public.client_projects cp where cp.id = p_entity_id and cp.user_id = p_user_id)
    else false
  end;
$$;

revoke all on function public.user_owns_tag_entity(text, uuid, uuid) from public;
grant execute on function public.user_owns_tag_entity(text, uuid, uuid) to authenticated;

drop policy if exists "tags_own" on public.tags;
create policy "tags_own"
  on public.tags
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "tag_links_own" on public.tag_links;
create policy "tag_links_own"
  on public.tag_links
  for all
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.tags t
      where t.id = tag_links.tag_id
        and t.user_id = auth.uid()
    )
    and public.user_owns_tag_entity(tag_links.entity_type, tag_links.entity_id, auth.uid())
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.tags t
      where t.id = tag_links.tag_id
        and t.user_id = auth.uid()
    )
    and public.user_owns_tag_entity(tag_links.entity_type, tag_links.entity_id, auth.uid())
  );

create index if not exists idx_tags_user_name
  on public.tags (user_id, name);

create or replace function public.search_all(
  p_user_id uuid,
  p_query text
)
returns table (
  type text,
  id uuid,
  title text,
  description text
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'not authorized';
  end if;

  return query
  with normalized_query as (
    select nullif(trim(p_query), '') as q
  ),
  goal_results as (
    select
      'goal'::text as item_type,
      g.id,
      g.title::text,
      g.description::text,
      case
        when g.title ilike nq.q || '%' then 1
        when g.title ilike '%' || nq.q || '%' then 2
        when coalesce(g.description, '') ilike '%' || nq.q || '%' then 3
        else 4
      end as relevance
    from public.goals g
    cross join normalized_query nq
    where nq.q is not null
      and g.user_id = p_user_id
      and (
        g.title ilike '%' || nq.q || '%'
        or coalesce(g.description, '') ilike '%' || nq.q || '%'
      )
    order by relevance, g.title
    limit 5
  ),
  project_results as (
    select
      'project'::text as item_type,
      p.id,
      p.title::text,
      p.description::text,
      case
        when p.title ilike nq.q || '%' then 1
        when p.title ilike '%' || nq.q || '%' then 2
        when coalesce(p.description, '') ilike '%' || nq.q || '%' then 3
        else 4
      end as relevance
    from public.projects p
    cross join normalized_query nq
    where nq.q is not null
      and p.user_id = p_user_id
      and (
        p.title ilike '%' || nq.q || '%'
        or coalesce(p.description, '') ilike '%' || nq.q || '%'
      )
    order by relevance, p.title
    limit 5
  ),
  note_results as (
    select
      'note'::text as item_type,
      n.id,
      n.title::text,
      left(coalesce(n.excerpt, n.content, ''), 240)::text as description,
      case
        when n.title ilike nq.q || '%' then 1
        when n.title ilike '%' || nq.q || '%' then 2
        when coalesce(n.content, '') ilike '%' || nq.q || '%' then 3
        else 4
      end as relevance
    from public.notes n
    cross join normalized_query nq
    where nq.q is not null
      and n.user_id = p_user_id
      and (
        n.title ilike '%' || nq.q || '%'
        or coalesce(n.content, '') ilike '%' || nq.q || '%'
      )
    order by relevance, n.title
    limit 5
  ),
  habit_results as (
    select
      'habit'::text as item_type,
      h.id,
      h.name::text as title,
      h.description::text,
      case
        when h.name ilike nq.q || '%' then 1
        when h.name ilike '%' || nq.q || '%' then 2
        else 4
      end as relevance
    from public.habits h
    cross join normalized_query nq
    where nq.q is not null
      and h.user_id = p_user_id
      and (
        h.name ilike '%' || nq.q || '%'
        or coalesce(h.description, '') ilike '%' || nq.q || '%'
      )
    order by relevance, h.name
    limit 5
  ),
  routine_results as (
    select
      'routine'::text as item_type,
      r.id,
      r.name::text as title,
      r.description::text,
      case
        when r.name ilike nq.q || '%' then 1
        when r.name ilike '%' || nq.q || '%' then 2
        else 4
      end as relevance
    from public.routines r
    cross join normalized_query nq
    where nq.q is not null
      and r.user_id = p_user_id
      and (
        r.name ilike '%' || nq.q || '%'
        or coalesce(r.description, '') ilike '%' || nq.q || '%'
      )
    order by relevance, r.name
    limit 5
  ),
  roadmap_results as (
    select
      'roadmap'::text as item_type,
      lr.id,
      lr.title::text,
      lr.description::text,
      case
        when lr.title ilike nq.q || '%' then 1
        when lr.title ilike '%' || nq.q || '%' then 2
        when coalesce(lr.description, '') ilike '%' || nq.q || '%' then 3
        else 4
      end as relevance
    from public.learning_roadmaps lr
    cross join normalized_query nq
    where nq.q is not null
      and lr.user_id = p_user_id
      and (
        lr.title ilike '%' || nq.q || '%'
        or coalesce(lr.description, '') ilike '%' || nq.q || '%'
      )
    order by relevance, lr.title
    limit 5
  ),
  job_results as (
    select
      'job'::text as item_type,
      j.id,
      (j.company || ' - ' || j.role)::text as title,
      j.notes::text as description,
      case
        when j.company ilike nq.q || '%' or j.role ilike nq.q || '%' then 1
        when j.company ilike '%' || nq.q || '%' or j.role ilike '%' || nq.q || '%' then 2
        when coalesce(j.notes, '') ilike '%' || nq.q || '%' then 3
        else 4
      end as relevance
    from public.job_applications j
    cross join normalized_query nq
    where nq.q is not null
      and j.user_id = p_user_id
      and (
        j.company ilike '%' || nq.q || '%'
        or j.role ilike '%' || nq.q || '%'
        or coalesce(j.notes, '') ilike '%' || nq.q || '%'
      )
    order by relevance, j.company
    limit 5
  ),
  client_results as (
    select
      'client'::text as item_type,
      c.id,
      c.name::text as title,
      concat_ws(' - ', nullif(c.company, ''), nullif(c.email, ''), nullif(c.notes, ''))::text as description,
      case
        when c.name ilike nq.q || '%' then 1
        when c.name ilike '%' || nq.q || '%' then 2
        when coalesce(c.company, '') ilike '%' || nq.q || '%' then 3
        else 4
      end as relevance
    from public.clients c
    cross join normalized_query nq
    where nq.q is not null
      and c.user_id = p_user_id
      and (
        c.name ilike '%' || nq.q || '%'
        or coalesce(c.company, '') ilike '%' || nq.q || '%'
        or coalesce(c.email, '') ilike '%' || nq.q || '%'
        or coalesce(c.notes, '') ilike '%' || nq.q || '%'
      )
    order by relevance, c.name
    limit 5
  ),
  freelance_results as (
    select
      'freelance'::text as item_type,
      cp.id,
      cp.title::text,
      cp.description::text,
      case
        when cp.title ilike nq.q || '%' then 1
        when cp.title ilike '%' || nq.q || '%' then 2
        when coalesce(cp.description, '') ilike '%' || nq.q || '%' then 3
        else 4
      end as relevance
    from public.client_projects cp
    cross join normalized_query nq
    where nq.q is not null
      and cp.user_id = p_user_id
      and (
        cp.title ilike '%' || nq.q || '%'
        or coalesce(cp.description, '') ilike '%' || nq.q || '%'
      )
    order by relevance, cp.title
    limit 5
  ),
  tag_results as (
    select
      'tag'::text as item_type,
      t.id,
      t.name::text as title,
      null::text as description,
      case
        when t.name ilike nq.q || '%' then 1
        when t.name ilike '%' || nq.q || '%' then 2
        else 4
      end as relevance
    from public.tags t
    cross join normalized_query nq
    where nq.q is not null
      and t.user_id = p_user_id
      and t.name ilike '%' || nq.q || '%'
    order by relevance, t.name
    limit 5
  )
  select unified.item_type, unified.id, unified.title, unified.description
  from (
    select * from goal_results
    union all select * from project_results
    union all select * from note_results
    union all select * from habit_results
    union all select * from routine_results
    union all select * from roadmap_results
    union all select * from job_results
    union all select * from client_results
    union all select * from freelance_results
    union all select * from tag_results
  ) as unified
  order by unified.relevance, unified.title;
end;
$$;

create or replace function public.get_tagged_entities(
  p_tag_id uuid,
  p_query text default null
)
returns table (
  type text,
  id uuid,
  title text,
  description text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then
    raise exception 'not authenticated';
  end if;

  if not exists (
    select 1
    from public.tags t
    where t.id = p_tag_id
      and t.user_id = v_user_id
  ) then
    raise exception 'tag not found or access denied';
  end if;

  return query
  with normalized_query as (
    select nullif(trim(p_query), '') as q
  ),
  linked as (
    select tl.entity_type, tl.entity_id
    from public.tag_links tl
    where tl.tag_id = p_tag_id
      and tl.user_id = v_user_id
  )
  select tagged.type, tagged.id, tagged.title, tagged.description
  from (
  select 'goal'::text, g.id, g.title::text, g.description::text
  from linked l
  join public.goals g on g.id = l.entity_id and g.user_id = v_user_id
  cross join normalized_query nq
  where l.entity_type = 'goal'
    and (
      nq.q is null
      or g.title ilike '%' || nq.q || '%'
      or coalesce(g.description, '') ilike '%' || nq.q || '%'
    )
  union all
  select 'project'::text, p.id, p.title::text, p.description::text
  from linked l
  join public.projects p on p.id = l.entity_id and p.user_id = v_user_id
  cross join normalized_query nq
  where l.entity_type = 'project'
    and (
      nq.q is null
      or p.title ilike '%' || nq.q || '%'
      or coalesce(p.description, '') ilike '%' || nq.q || '%'
    )
  union all
  select 'note'::text, n.id, n.title::text, left(coalesce(n.excerpt, n.content, ''), 240)::text
  from linked l
  join public.notes n on n.id = l.entity_id and n.user_id = v_user_id
  cross join normalized_query nq
  where l.entity_type = 'note'
    and (
      nq.q is null
      or n.title ilike '%' || nq.q || '%'
      or coalesce(n.content, '') ilike '%' || nq.q || '%'
    )
  union all
  select 'habit'::text, h.id, h.name::text, h.description::text
  from linked l
  join public.habits h on h.id = l.entity_id and h.user_id = v_user_id
  cross join normalized_query nq
  where l.entity_type = 'habit'
    and (
      nq.q is null
      or h.name ilike '%' || nq.q || '%'
      or coalesce(h.description, '') ilike '%' || nq.q || '%'
    )
  union all
  select 'routine'::text, r.id, r.name::text, r.description::text
  from linked l
  join public.routines r on r.id = l.entity_id and r.user_id = v_user_id
  cross join normalized_query nq
  where l.entity_type = 'routine'
    and (
      nq.q is null
      or r.name ilike '%' || nq.q || '%'
      or coalesce(r.description, '') ilike '%' || nq.q || '%'
    )
  union all
  select 'roadmap'::text, lr.id, lr.title::text, lr.description::text
  from linked l
  join public.learning_roadmaps lr on lr.id = l.entity_id and lr.user_id = v_user_id
  cross join normalized_query nq
  where l.entity_type = 'roadmap'
    and (
      nq.q is null
      or lr.title ilike '%' || nq.q || '%'
      or coalesce(lr.description, '') ilike '%' || nq.q || '%'
    )
  union all
  select 'job'::text, j.id, (j.company || ' - ' || j.role)::text, j.notes::text
  from linked l
  join public.job_applications j on j.id = l.entity_id and j.user_id = v_user_id
  cross join normalized_query nq
  where l.entity_type = 'job'
    and (
      nq.q is null
      or j.company ilike '%' || nq.q || '%'
      or j.role ilike '%' || nq.q || '%'
      or coalesce(j.notes, '') ilike '%' || nq.q || '%'
    )
  union all
  select 'client'::text, c.id, c.name::text, concat_ws(' - ', nullif(c.company, ''), nullif(c.email, ''), nullif(c.notes, ''))::text
  from linked l
  join public.clients c on c.id = l.entity_id and c.user_id = v_user_id
  cross join normalized_query nq
  where l.entity_type = 'client'
    and (
      nq.q is null
      or c.name ilike '%' || nq.q || '%'
      or coalesce(c.company, '') ilike '%' || nq.q || '%'
      or coalesce(c.email, '') ilike '%' || nq.q || '%'
      or coalesce(c.notes, '') ilike '%' || nq.q || '%'
    )
  union all
  select 'freelance'::text, cp.id, cp.title::text, cp.description::text
  from linked l
  join public.client_projects cp on cp.id = l.entity_id and cp.user_id = v_user_id
  cross join normalized_query nq
  where l.entity_type = 'freelance'
    and (
      nq.q is null
      or cp.title ilike '%' || nq.q || '%'
      or coalesce(cp.description, '') ilike '%' || nq.q || '%'
    )
  ) as tagged(type, id, title, description)
  order by tagged.type, tagged.title;
end;
$$;

revoke all on function public.search_all(uuid, text) from public;
grant execute on function public.search_all(uuid, text) to authenticated;
revoke all on function public.get_tagged_entities(uuid, text) from public;
grant execute on function public.get_tagged_entities(uuid, text) to authenticated;

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

  select count(*)
  into v_habits_total
  from public.goal_links gl
  join public.habits h on h.id = gl.entity_id and h.user_id = v_user_id
  where gl.goal_id = p_goal_id
    and gl.user_id = v_user_id
    and gl.entity_type = 'habit';

  if v_habits_total > 0 then
    select count(distinct hl.habit_id)
    into v_habits_done
    from public.goal_links gl
    join public.habit_logs hl
      on hl.habit_id = gl.entity_id
      and hl.user_id = v_user_id
    where gl.goal_id = p_goal_id
      and gl.user_id = v_user_id
      and gl.entity_type = 'habit'
      and hl.completed_at = current_date;

    v_habits_progress := v_habits_done::numeric / v_habits_total::numeric;
    v_parts_sum := v_parts_sum + v_habits_progress;
    v_parts_count := v_parts_count + 1;
  end if;

  select count(*)
  into v_projects_total
  from public.goal_links gl
  join public.projects p on p.id = gl.entity_id and p.user_id = v_user_id
  where gl.goal_id = p_goal_id
    and gl.user_id = v_user_id
    and gl.entity_type = 'project';

  if v_projects_total > 0 then
    select count(distinct p.id)
    into v_projects_done
    from public.goal_links gl
    join public.projects p
      on p.id = gl.entity_id
      and p.user_id = v_user_id
    where gl.goal_id = p_goal_id
      and gl.user_id = v_user_id
      and gl.entity_type = 'project'
      and p.status = 'completed';

    v_projects_progress := v_projects_done::numeric / v_projects_total::numeric;
    v_parts_sum := v_parts_sum + v_projects_progress;
    v_parts_count := v_parts_count + 1;
  end if;

  select count(*)
  into v_routines_total
  from public.goal_links gl
  join public.routines r on r.id = gl.entity_id and r.user_id = v_user_id
  where gl.goal_id = p_goal_id
    and gl.user_id = v_user_id
    and gl.entity_type = 'routine';

  if v_routines_total > 0 then
    select count(distinct rl.routine_id)
    into v_routines_done
    from public.goal_links gl
    join public.routine_logs rl
      on rl.routine_id = gl.entity_id
      and rl.user_id = v_user_id
    where gl.goal_id = p_goal_id
      and gl.user_id = v_user_id
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
