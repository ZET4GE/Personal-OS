create table if not exists public.user_dashboard_config (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  layout jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now(),
  constraint user_dashboard_config_user_id_key unique (user_id)
);

alter table public.user_dashboard_config enable row level security;

create policy "user_dashboard_config_select_own"
on public.user_dashboard_config
for select
to authenticated
using (auth.uid() = user_id);

create policy "user_dashboard_config_insert_own"
on public.user_dashboard_config
for insert
to authenticated
with check (auth.uid() = user_id);

create policy "user_dashboard_config_update_own"
on public.user_dashboard_config
for update
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "user_dashboard_config_delete_own"
on public.user_dashboard_config
for delete
to authenticated
using (auth.uid() = user_id);

create index if not exists idx_user_dashboard_config_user_id
  on public.user_dashboard_config (user_id);

