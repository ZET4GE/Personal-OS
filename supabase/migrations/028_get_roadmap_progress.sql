create or replace function public.get_roadmap_progress(
  p_roadmap_id uuid
)
returns numeric
language sql
security definer
set search_path = public
as $$
  select coalesce(avg(g.progress)::numeric / 100, 0)
  from public.learning_nodes ln
  join public.learning_node_goals lng
    on lng.node_id = ln.id
  join public.goals g
    on g.id = lng.goal_id
  where ln.roadmap_id = p_roadmap_id;
$$;

grant execute on function public.get_roadmap_progress(uuid) to authenticated;
