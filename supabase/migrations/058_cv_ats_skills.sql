alter table public.skills
  add column if not exists is_top boolean not null default false,
  add column if not exists evidence text,
  add column if not exists evidence_url text,
  add column if not exists keywords text[] not null default array[]::text[];

create index if not exists idx_skills_user_top
  on public.skills (user_id, is_top desc, category, order_index);

create index if not exists idx_skills_keywords_gin
  on public.skills using gin (keywords);
