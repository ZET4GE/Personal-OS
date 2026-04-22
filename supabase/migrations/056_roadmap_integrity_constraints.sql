delete from public.learning_node_goals a
using public.learning_node_goals b
where a.ctid < b.ctid
  and a.node_id = b.node_id
  and a.goal_id = b.goal_id;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'learning_node_goals_node_goal_unique'
  ) then
    alter table public.learning_node_goals
      add constraint learning_node_goals_node_goal_unique unique (node_id, goal_id);
  end if;
end;
$$;

create or replace function public.validate_learning_roadmap_primary_goal()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.primary_goal_id is not null and not exists (
    select 1
    from public.goals g
    where g.id = new.primary_goal_id
      and g.user_id = new.user_id
  ) then
    raise exception 'primary_goal_id does not belong to roadmap owner';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_learning_roadmap_primary_goal() from public;

drop trigger if exists trg_validate_learning_roadmap_primary_goal on public.learning_roadmaps;
create trigger trg_validate_learning_roadmap_primary_goal
  before insert or update of user_id, primary_goal_id
  on public.learning_roadmaps
  for each row
  execute function public.validate_learning_roadmap_primary_goal();

create or replace function public.validate_learning_node_goal_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  select r.user_id
  into v_user_id
  from public.learning_nodes n
  join public.learning_roadmaps r on r.id = n.roadmap_id
  where n.id = new.node_id;

  if v_user_id is null then
    raise exception 'learning node not found';
  end if;

  if not exists (
    select 1
    from public.goals g
    where g.id = new.goal_id
      and g.user_id = v_user_id
  ) then
    raise exception 'goal does not belong to roadmap owner';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_learning_node_goal_owner() from public;

drop trigger if exists trg_validate_learning_node_goal_owner on public.learning_node_goals;
create trigger trg_validate_learning_node_goal_owner
  before insert or update of node_id, goal_id
  on public.learning_node_goals
  for each row
  execute function public.validate_learning_node_goal_owner();

create or replace function public.validate_roadmap_node_action_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid;
begin
  select r.user_id
  into v_user_id
  from public.learning_nodes n
  join public.learning_roadmaps r on r.id = n.roadmap_id
  where n.id = new.node_id;

  if v_user_id is null then
    raise exception 'learning node not found';
  end if;

  if not public.user_owns_roadmap_action_entity(new.entity_type, new.entity_id, v_user_id) then
    raise exception 'roadmap action entity does not belong to roadmap owner';
  end if;

  return new;
end;
$$;

revoke all on function public.validate_roadmap_node_action_owner() from public;

drop trigger if exists trg_validate_roadmap_node_action_owner on public.roadmap_node_actions;
create trigger trg_validate_roadmap_node_action_owner
  before insert or update of node_id, entity_type, entity_id
  on public.roadmap_node_actions
  for each row
  execute function public.validate_roadmap_node_action_owner();
