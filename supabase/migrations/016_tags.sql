create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.tag_links (
  id uuid primary key default gen_random_uuid(),
  tag_id uuid not null references public.tags(id) on delete cascade,
  entity_type text not null check (entity_type in ('project', 'habit', 'routine', 'note', 'goal')),
  entity_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint tag_links_tag_entity_unique unique (tag_id, entity_type, entity_id)
);

create index if not exists idx_tag_links_tag_id
  on public.tag_links (tag_id);

create index if not exists idx_tag_links_entity_type_entity_id
  on public.tag_links (entity_type, entity_id);

create index if not exists idx_tag_links_user_id
  on public.tag_links (user_id);
