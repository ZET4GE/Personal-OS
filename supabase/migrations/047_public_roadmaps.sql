alter table public.learning_roadmaps enable row level security;
alter table public.learning_nodes enable row level security;
alter table public.learning_node_goals enable row level security;

drop policy if exists "Public read published learning roadmaps" on public.learning_roadmaps;
create policy "Public read published learning roadmaps"
  on public.learning_roadmaps
  for select
  using (
    is_public = true
    and exists (
      select 1
      from public.profiles p
      where p.id = learning_roadmaps.user_id
        and p.is_public = true
    )
  );

drop policy if exists "Public read published learning nodes" on public.learning_nodes;
create policy "Public read published learning nodes"
  on public.learning_nodes
  for select
  using (
    exists (
      select 1
      from public.learning_roadmaps r
      join public.profiles p on p.id = r.user_id
      where r.id = learning_nodes.roadmap_id
        and r.is_public = true
        and p.is_public = true
    )
  );

drop policy if exists "Public read published learning node goals" on public.learning_node_goals;
create policy "Public read published learning node goals"
  on public.learning_node_goals
  for select
  using (
    exists (
      select 1
      from public.learning_nodes n
      join public.learning_roadmaps r on r.id = n.roadmap_id
      join public.profiles p on p.id = r.user_id
      join public.goals g on g.id = learning_node_goals.goal_id
      where n.id = learning_node_goals.node_id
        and r.is_public = true
        and p.is_public = true
        and g.is_public = true
        and g.user_id = r.user_id
    )
  );

create index if not exists idx_learning_roadmaps_public_user_id
  on public.learning_roadmaps (user_id, is_public, created_at desc);
