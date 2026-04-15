create table if not exists public.user_onboarding (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  focus text,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_onboarding_user_id_key unique (user_id)
);

alter table public.user_onboarding enable row level security;

create policy "user_onboarding_select_own"
on public.user_onboarding
for select
to authenticated
using (auth.uid() = user_id);

create policy "user_onboarding_insert_own"
on public.user_onboarding
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "user_onboarding_update_own"
on public.user_onboarding
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists idx_user_onboarding_user_id
  on public.user_onboarding (user_id);
