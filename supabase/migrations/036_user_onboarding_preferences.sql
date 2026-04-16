create table if not exists public.user_onboarding (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  focus text,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_onboarding_user_id_key'
  ) then
    alter table public.user_onboarding
      add constraint user_onboarding_user_id_key unique (user_id);
  end if;
end;
$$;

alter table public.user_onboarding
  add column if not exists persona text,
  add column if not exists primary_goal_id uuid references public.goals(id) on delete set null,
  add column if not exists enabled_modules text[] not null default array[]::text[];

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'user_onboarding_persona_check'
  ) then
    alter table public.user_onboarding
      add constraint user_onboarding_persona_check
      check (persona is null or persona in ('student', 'freelancer', 'employee', 'builder', 'personal'));
  end if;
end;
$$;

create index if not exists idx_user_onboarding_primary_goal_id
  on public.user_onboarding (primary_goal_id);

create index if not exists idx_user_onboarding_user_id
  on public.user_onboarding (user_id);

alter table public.user_onboarding enable row level security;

drop policy if exists "user_onboarding_select_own" on public.user_onboarding;
create policy "user_onboarding_select_own"
on public.user_onboarding
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "user_onboarding_insert_own" on public.user_onboarding;
create policy "user_onboarding_insert_own"
on public.user_onboarding
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "user_onboarding_update_own" on public.user_onboarding;
create policy "user_onboarding_update_own"
on public.user_onboarding
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);
