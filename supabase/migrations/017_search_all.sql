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
language sql
security definer
set search_path = public
as $$
  with normalized_query as (
    select nullif(trim(p_query), '') as q
  ),
  goal_results as (
    select
      'goal'::text as type,
      g.id,
      g.title,
      g.description,
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
      'project'::text as type,
      p.id,
      p.title,
      p.description,
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
      'note'::text as type,
      n.id,
      n.title,
      left(coalesce(n.excerpt, n.content, ''), 240) as description,
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
      'habit'::text as type,
      h.id,
      h.name as title,
      null::text as description,
      case
        when h.name ilike nq.q || '%' then 1
        when h.name ilike '%' || nq.q || '%' then 2
        else 4
      end as relevance
    from public.habits h
    cross join normalized_query nq
    where nq.q is not null
      and h.user_id = p_user_id
      and h.name ilike '%' || nq.q || '%'
    order by relevance, h.name
    limit 5
  ),
  routine_results as (
    select
      'routine'::text as type,
      r.id,
      r.name as title,
      null::text as description,
      case
        when r.name ilike nq.q || '%' then 1
        when r.name ilike '%' || nq.q || '%' then 2
        else 4
      end as relevance
    from public.routines r
    cross join normalized_query nq
    where nq.q is not null
      and r.user_id = p_user_id
      and r.name ilike '%' || nq.q || '%'
    order by relevance, r.name
    limit 5
  ),
  tag_results as (
    select
      'tag'::text as type,
      t.id,
      t.name as title,
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
  select unified.type, unified.id, unified.title, unified.description
  from (
    select * from goal_results
    union all
    select * from project_results
    union all
    select * from note_results
    union all
    select * from habit_results
    union all
    select * from routine_results
    union all
    select * from tag_results
  ) as unified
  order by unified.relevance, unified.title;
$$;

grant execute on function public.search_all(uuid, text) to authenticated;
