drop policy if exists "analytics: insert any" on public.page_views;

drop policy if exists "analytics: no direct client insert" on public.page_views;
create policy "analytics: no direct client insert"
  on public.page_views
  for insert
  with check (false);
