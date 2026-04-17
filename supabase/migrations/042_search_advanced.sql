create or replace function public.search_advanced(
  p_user_id uuid,
  p_query text default null,
  p_type text default null,
  p_tag_id uuid default null,
  p_status text default null,
  p_limit integer default 50
)
returns table (
  type text,
  id uuid,
  title text,
  description text,
  status text,
  updated_at timestamptz,
  tags text[]
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_query text := nullif(trim(coalesce(p_query, '')), '');
  v_type text := nullif(p_type, 'all');
  v_status text := nullif(p_status, 'all');
  v_limit integer := greatest(1, least(coalesce(p_limit, 50), 100));
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'not authorized';
  end if;

  if v_type is not null and v_type not in (
    'goal',
    'project',
    'note',
    'habit',
    'routine',
    'roadmap',
    'job',
    'client',
    'freelance',
    'tag'
  ) then
    raise exception 'invalid type';
  end if;

  if p_tag_id is not null and not exists (
    select 1
    from public.tags t
    where t.id = p_tag_id
      and t.user_id = p_user_id
  ) then
    raise exception 'tag not found or access denied';
  end if;

  return query
  with unified as (
    select
      'goal'::text as item_type,
      g.id,
      g.title::text,
      g.description::text,
      g.status::text,
      g.updated_at::timestamptz,
      case
        when v_query is null then 4
        when g.title ilike v_query || '%' then 1
        when g.title ilike '%' || v_query || '%' then 2
        when coalesce(g.description, '') ilike '%' || v_query || '%' then 3
        else 4
      end as relevance
    from public.goals g
    where g.user_id = p_user_id
      and (
        v_query is null
        or g.title ilike '%' || v_query || '%'
        or coalesce(g.description, '') ilike '%' || v_query || '%'
      )
    union all
    select
      'project'::text,
      p.id,
      p.title::text,
      p.description::text,
      p.status::text,
      p.updated_at::timestamptz,
      case
        when v_query is null then 4
        when p.title ilike v_query || '%' then 1
        when p.title ilike '%' || v_query || '%' then 2
        when coalesce(p.description, '') ilike '%' || v_query || '%' then 3
        else 4
      end
    from public.projects p
    where p.user_id = p_user_id
      and (
        v_query is null
        or p.title ilike '%' || v_query || '%'
        or coalesce(p.description, '') ilike '%' || v_query || '%'
      )
    union all
    select
      'note'::text,
      n.id,
      n.title::text,
      left(coalesce(n.excerpt, n.content, ''), 240)::text,
      case when n.is_public then 'public' else 'private' end,
      n.updated_at::timestamptz,
      case
        when v_query is null then 4
        when n.title ilike v_query || '%' then 1
        when n.title ilike '%' || v_query || '%' then 2
        when coalesce(n.content, '') ilike '%' || v_query || '%' then 3
        else 4
      end
    from public.notes n
    where n.user_id = p_user_id
      and (
        v_query is null
        or n.title ilike '%' || v_query || '%'
        or coalesce(n.content, '') ilike '%' || v_query || '%'
      )
    union all
    select
      'habit'::text,
      h.id,
      h.name::text,
      h.description::text,
      case when h.is_active then 'active' else 'inactive' end,
      h.created_at::timestamptz,
      case
        when v_query is null then 4
        when h.name ilike v_query || '%' then 1
        when h.name ilike '%' || v_query || '%' then 2
        when coalesce(h.description, '') ilike '%' || v_query || '%' then 3
        else 4
      end
    from public.habits h
    where h.user_id = p_user_id
      and (
        v_query is null
        or h.name ilike '%' || v_query || '%'
        or coalesce(h.description, '') ilike '%' || v_query || '%'
      )
    union all
    select
      'routine'::text,
      r.id,
      r.name::text,
      r.description::text,
      case when r.is_active then 'active' else 'inactive' end,
      r.created_at::timestamptz,
      case
        when v_query is null then 4
        when r.name ilike v_query || '%' then 1
        when r.name ilike '%' || v_query || '%' then 2
        when coalesce(r.description, '') ilike '%' || v_query || '%' then 3
        else 4
      end
    from public.routines r
    where r.user_id = p_user_id
      and (
        v_query is null
        or r.name ilike '%' || v_query || '%'
        or coalesce(r.description, '') ilike '%' || v_query || '%'
      )
    union all
    select
      'roadmap'::text,
      lr.id,
      lr.title::text,
      lr.description::text,
      lr.type::text,
      lr.created_at::timestamptz,
      case
        when v_query is null then 4
        when lr.title ilike v_query || '%' then 1
        when lr.title ilike '%' || v_query || '%' then 2
        when coalesce(lr.description, '') ilike '%' || v_query || '%' then 3
        else 4
      end
    from public.learning_roadmaps lr
    where lr.user_id = p_user_id
      and (
        v_query is null
        or lr.title ilike '%' || v_query || '%'
        or coalesce(lr.description, '') ilike '%' || v_query || '%'
      )
    union all
    select
      'job'::text,
      j.id,
      (j.company || ' - ' || j.role)::text,
      j.notes::text,
      j.status::text,
      j.updated_at::timestamptz,
      case
        when v_query is null then 4
        when j.company ilike v_query || '%' or j.role ilike v_query || '%' then 1
        when j.company ilike '%' || v_query || '%' or j.role ilike '%' || v_query || '%' then 2
        when coalesce(j.notes, '') ilike '%' || v_query || '%' then 3
        else 4
      end
    from public.job_applications j
    where j.user_id = p_user_id
      and (
        v_query is null
        or j.company ilike '%' || v_query || '%'
        or j.role ilike '%' || v_query || '%'
        or coalesce(j.notes, '') ilike '%' || v_query || '%'
      )
    union all
    select
      'client'::text,
      c.id,
      c.name::text,
      concat_ws(' - ', nullif(c.company, ''), nullif(c.email, ''), nullif(c.notes, ''))::text,
      null::text,
      c.created_at::timestamptz,
      case
        when v_query is null then 4
        when c.name ilike v_query || '%' then 1
        when c.name ilike '%' || v_query || '%' then 2
        when coalesce(c.company, '') ilike '%' || v_query || '%' then 3
        else 4
      end
    from public.clients c
    where c.user_id = p_user_id
      and (
        v_query is null
        or c.name ilike '%' || v_query || '%'
        or coalesce(c.company, '') ilike '%' || v_query || '%'
        or coalesce(c.email, '') ilike '%' || v_query || '%'
        or coalesce(c.notes, '') ilike '%' || v_query || '%'
      )
    union all
    select
      'freelance'::text,
      cp.id,
      cp.title::text,
      cp.description::text,
      cp.status::text,
      cp.updated_at::timestamptz,
      case
        when v_query is null then 4
        when cp.title ilike v_query || '%' then 1
        when cp.title ilike '%' || v_query || '%' then 2
        when coalesce(cp.description, '') ilike '%' || v_query || '%' then 3
        else 4
      end
    from public.client_projects cp
    where cp.user_id = p_user_id
      and (
        v_query is null
        or cp.title ilike '%' || v_query || '%'
        or coalesce(cp.description, '') ilike '%' || v_query || '%'
      )
    union all
    select
      'tag'::text,
      t.id,
      t.name::text,
      null::text,
      null::text,
      t.created_at::timestamptz,
      case
        when v_query is null then 4
        when t.name ilike v_query || '%' then 1
        when t.name ilike '%' || v_query || '%' then 2
        else 4
      end
    from public.tags t
    where t.user_id = p_user_id
      and p_tag_id is null
      and (
        v_query is null
        or t.name ilike '%' || v_query || '%'
      )
  )
  select
    u.item_type,
    u.id,
    u.title,
    u.description,
    u.status,
    u.updated_at,
    coalesce((
      select array_agg(t.name order by t.name)
      from public.tag_links tl
      join public.tags t on t.id = tl.tag_id and t.user_id = p_user_id
      where tl.user_id = p_user_id
        and tl.entity_type = u.item_type
        and tl.entity_id = u.id
    ), array[]::text[]) as tags
  from unified u
  where (v_type is null or u.item_type = v_type)
    and (v_status is null or u.status = v_status)
    and (
      p_tag_id is null
      or exists (
        select 1
        from public.tag_links tl
        where tl.user_id = p_user_id
          and tl.tag_id = p_tag_id
          and tl.entity_type = u.item_type
          and tl.entity_id = u.id
      )
    )
  order by u.relevance asc, u.updated_at desc, u.title asc
  limit v_limit;
end;
$$;

revoke all on function public.search_advanced(uuid, text, text, uuid, text, integer) from public;
grant execute on function public.search_advanced(uuid, text, text, uuid, text, integer) to authenticated;
