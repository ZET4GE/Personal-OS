create table if not exists public.page_views (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  page_type text not null check (page_type in ('profile', 'project', 'cv', 'post')),
  page_id uuid,
  visitor_id text,
  referrer text,
  user_agent text,
  country text,
  city text,
  viewed_at timestamptz not null default now()
);

create index if not exists idx_page_views_user_id
  on public.page_views (user_id);

create index if not exists idx_page_views_viewed_at
  on public.page_views (viewed_at desc);

create index if not exists idx_page_views_page_type
  on public.page_views (user_id, page_type);

create index if not exists idx_page_views_page_id
  on public.page_views (page_id)
  where page_id is not null;

alter table public.page_views enable row level security;

drop policy if exists "analytics: select own" on public.page_views;
create policy "analytics: select own"
  on public.page_views
  for select
  using (auth.uid() = user_id);

drop policy if exists "analytics: insert any" on public.page_views;

drop policy if exists "analytics: no direct client insert" on public.page_views;
create policy "analytics: no direct client insert"
  on public.page_views
  for insert
  with check (false);
