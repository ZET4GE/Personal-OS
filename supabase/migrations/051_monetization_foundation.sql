create table if not exists public.user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan text not null default 'free' check (plan in ('free', 'pro', 'team')),
  status text not null default 'active' check (status in ('trialing', 'active', 'past_due', 'cancelled')),
  billing_provider text,
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_subscriptions_user_unique unique (user_id)
);

create index if not exists idx_user_subscriptions_plan
  on public.user_subscriptions (plan);

create unique index if not exists idx_user_subscriptions_provider_subscription
  on public.user_subscriptions (provider_subscription_id)
  where provider_subscription_id is not null;

alter table public.user_subscriptions enable row level security;

drop policy if exists "user_subscriptions_select_own" on public.user_subscriptions;
drop policy if exists "user_subscriptions_no_client_insert" on public.user_subscriptions;
drop policy if exists "user_subscriptions_no_client_update" on public.user_subscriptions;
drop policy if exists "user_subscriptions_no_client_delete" on public.user_subscriptions;

create policy "user_subscriptions_select_own"
  on public.user_subscriptions
  for select
  using (auth.uid() = user_id);

create policy "user_subscriptions_no_client_insert"
  on public.user_subscriptions
  for insert
  with check (false);

create policy "user_subscriptions_no_client_update"
  on public.user_subscriptions
  for update
  using (false)
  with check (false);

create policy "user_subscriptions_no_client_delete"
  on public.user_subscriptions
  for delete
  using (false);

do $$
begin
  if exists (
    select 1
    from pg_proc
    where proname = 'set_updated_at'
      and pronamespace = 'public'::regnamespace
  ) and not exists (
    select 1
    from pg_trigger
    where tgname = 'user_subscriptions_updated_at'
  ) then
    execute 'create trigger user_subscriptions_updated_at
      before update on public.user_subscriptions
      for each row execute function public.set_updated_at()';
  end if;
end;
$$;

create or replace function public.get_user_billing_status(
  p_user_id uuid
)
returns table (
  plan text,
  status text,
  current_period_end timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'not authorized';
  end if;

  return query
  select
    coalesce(us.plan, 'free')::text as plan,
    coalesce(us.status, 'active')::text as status,
    us.current_period_end
  from (select p_user_id as user_id) u
  left join public.user_subscriptions us on us.user_id = u.user_id
  limit 1;
end;
$$;

revoke all on function public.get_user_billing_status(uuid) from public;
grant execute on function public.get_user_billing_status(uuid) to authenticated;

create or replace function public.get_user_usage_limits(
  p_user_id uuid
)
returns table (
  resource text,
  used_count integer,
  limit_count integer,
  is_limited boolean
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_plan text := 'free';
begin
  if auth.uid() is null or auth.uid() <> p_user_id then
    raise exception 'not authorized';
  end if;

  select coalesce(us.plan, 'free')
  into v_plan
  from public.user_subscriptions us
  where us.user_id = p_user_id
  limit 1;

  v_plan := coalesce(v_plan, 'free');

  return query
  with usage as (
    select 'goals'::text as resource, count(*)::integer as used_count
    from public.goals
    where user_id = p_user_id
    union all
    select 'projects'::text, count(*)::integer
    from public.projects
    where user_id = p_user_id
    union all
    select 'roadmaps'::text, count(*)::integer
    from public.learning_roadmaps
    where user_id = p_user_id
    union all
    select 'notes'::text, count(*)::integer
    from public.notes
    where user_id = p_user_id
    union all
    select 'time_entries_month'::text, count(*)::integer
    from public.time_entries
    where user_id = p_user_id
      and started_at >= date_trunc('month', now())
  ),
  limits as (
    select *
    from (values
      ('goals'::text, case when v_plan = 'free' then 5 else null end::integer),
      ('projects'::text, case when v_plan = 'free' then 10 else null end::integer),
      ('roadmaps'::text, case when v_plan = 'free' then 3 else null end::integer),
      ('notes'::text, case when v_plan = 'free' then 50 else null end::integer),
      ('time_entries_month'::text, case when v_plan = 'free' then 200 else null end::integer)
    ) as l(resource, limit_count)
  )
  select
    u.resource,
    u.used_count,
    l.limit_count,
    (l.limit_count is not null) as is_limited
  from usage u
  join limits l on l.resource = u.resource
  order by u.resource;
end;
$$;

revoke all on function public.get_user_usage_limits(uuid) from public;
grant execute on function public.get_user_usage_limits(uuid) to authenticated;
