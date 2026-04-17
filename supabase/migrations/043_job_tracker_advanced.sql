alter table public.job_applications
  add column if not exists priority text not null default 'medium',
  add column if not exists source text,
  add column if not exists salary_range text,
  add column if not exists next_follow_up_at timestamptz;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'job_applications_priority_check'
  ) then
    alter table public.job_applications
      add constraint job_applications_priority_check
      check (priority in ('low', 'medium', 'high'));
  end if;
end;
$$;

create index if not exists idx_job_applications_priority
  on public.job_applications (user_id, priority);

create index if not exists idx_job_applications_next_follow_up_at
  on public.job_applications (user_id, next_follow_up_at)
  where next_follow_up_at is not null;

create table if not exists public.job_interviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  job_id uuid not null references public.job_applications(id) on delete cascade,
  title text not null default 'Entrevista',
  scheduled_at timestamptz not null,
  stage text not null default 'screening',
  notes text,
  feedback text,
  outcome text default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint job_interviews_stage_check
    check (stage in ('screening', 'technical', 'culture', 'offer', 'other')),
  constraint job_interviews_outcome_check
    check (outcome is null or outcome in ('pending', 'passed', 'failed', 'cancelled'))
);

create index if not exists idx_job_interviews_user_id
  on public.job_interviews (user_id);

create index if not exists idx_job_interviews_job_id
  on public.job_interviews (job_id);

create index if not exists idx_job_interviews_scheduled_at
  on public.job_interviews (user_id, scheduled_at);

alter table public.job_interviews enable row level security;

drop policy if exists "job_interviews_select_own" on public.job_interviews;
drop policy if exists "job_interviews_insert_own" on public.job_interviews;
drop policy if exists "job_interviews_update_own" on public.job_interviews;
drop policy if exists "job_interviews_delete_own" on public.job_interviews;

create policy "job_interviews_select_own"
  on public.job_interviews
  for select
  using (auth.uid() = user_id);

create policy "job_interviews_insert_own"
  on public.job_interviews
  for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.job_applications j
      where j.id = job_id
        and j.user_id = auth.uid()
    )
  );

create policy "job_interviews_update_own"
  on public.job_interviews
  for update
  using (auth.uid() = user_id)
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.job_applications j
      where j.id = job_id
        and j.user_id = auth.uid()
    )
  );

create policy "job_interviews_delete_own"
  on public.job_interviews
  for delete
  using (auth.uid() = user_id);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'job_interviews_updated_at'
  ) then
    execute 'create trigger job_interviews_updated_at
      before update on public.job_interviews
      for each row execute function public.set_updated_at()';
  end if;
end;
$$;

create or replace function public.get_job_tracker_stats(p_user_id uuid)
returns table (
  total_jobs integer,
  active_applications integer,
  interviews integer,
  offers integer,
  rejected integer,
  upcoming_interviews integer,
  overdue_followups integer,
  response_rate numeric
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
  with jobs as (
    select *
    from public.job_applications
    where user_id = p_user_id
  ),
  counts as (
    select
      count(*)::integer as total_jobs,
      count(*) filter (where status in ('applied', 'interview'))::integer as active_applications,
      count(*) filter (where status = 'interview')::integer as interviews,
      count(*) filter (where status = 'offer')::integer as offers,
      count(*) filter (where status = 'rejected')::integer as rejected,
      count(*) filter (
        where next_follow_up_at is not null
          and next_follow_up_at < now()
          and status in ('applied', 'interview')
      )::integer as overdue_followups,
      count(*) filter (where status <> 'applied')::numeric as responded
    from jobs
  ),
  upcoming as (
    select count(*)::integer as upcoming_interviews
    from public.job_interviews
    where user_id = p_user_id
      and scheduled_at >= now()
      and scheduled_at < now() + interval '14 days'
      and coalesce(outcome, 'pending') = 'pending'
  )
  select
    c.total_jobs,
    c.active_applications,
    c.interviews,
    c.offers,
    c.rejected,
    u.upcoming_interviews,
    c.overdue_followups,
    case
      when c.total_jobs = 0 then 0
      else round((c.responded / c.total_jobs) * 100, 2)
    end as response_rate
  from counts c
  cross join upcoming u;
end;
$$;

revoke all on function public.get_job_tracker_stats(uuid) from public;
grant execute on function public.get_job_tracker_stats(uuid) to authenticated;
