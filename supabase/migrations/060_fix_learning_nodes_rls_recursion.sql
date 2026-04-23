-- 060_fix_learning_nodes_rls_recursion.sql
-- The WITH CHECK on learning_nodes queried learning_nodes itself, causing
-- "infinite recursion detected in policy". Fix: use a security definer
-- function that bypasses RLS for the parent validation.

create or replace function public.node_parent_in_roadmap(
  p_parent_id uuid,
  p_roadmap_id uuid
)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.learning_nodes
    where id = p_parent_id
      and roadmap_id = p_roadmap_id
  );
$$;

revoke all on function public.node_parent_in_roadmap(uuid, uuid) from public;
grant execute on function public.node_parent_in_roadmap(uuid, uuid) to authenticated;

drop policy if exists "Users manage own learning nodes" on public.learning_nodes;

create policy "Users manage own learning nodes"
  on public.learning_nodes
  for all
  to authenticated
  using (
    exists (
      select 1 from public.learning_roadmaps r
      where r.id = learning_nodes.roadmap_id
        and r.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.learning_roadmaps r
      where r.id = learning_nodes.roadmap_id
        and r.user_id = auth.uid()
    )
    and (
      learning_nodes.parent_id is null
      or public.node_parent_in_roadmap(
        learning_nodes.parent_id,
        learning_nodes.roadmap_id
      )
    )
  );
