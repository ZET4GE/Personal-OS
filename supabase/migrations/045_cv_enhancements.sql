alter table public.profiles
  add column if not exists headline text,
  add column if not exists phone text,
  add column if not exists birth_date date,
  add column if not exists availability text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_availability_check'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_availability_check
      check (
        availability is null
        or availability in ('full_time', 'part_time', 'contract', 'freelance', 'internship', 'not_available')
      );
  end if;
end;
$$;

create table if not exists public.cv_courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  provider text,
  credential_url text,
  completed_at date,
  description text,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.cv_courses enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cv_courses'
      and policyname = 'owner_all_cv_courses'
  ) then
    create policy "owner_all_cv_courses" on public.cv_courses
      for all using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cv_courses'
      and policyname = 'public_read_cv_courses'
  ) then
    create policy "public_read_cv_courses" on public.cv_courses
      for select using (
        exists (
          select 1
          from public.profiles p
          where p.id = cv_courses.user_id
            and p.is_public = true
        )
      );
  end if;
end;
$$;

create index if not exists idx_cv_courses_user_id
  on public.cv_courses (user_id, order_index, completed_at desc);

create table if not exists public.cv_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  url text,
  repo_url text,
  tech_stack text[] not null default array[]::text[],
  is_featured boolean not null default false,
  order_index integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.cv_projects enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cv_projects'
      and policyname = 'owner_all_cv_projects'
  ) then
    create policy "owner_all_cv_projects" on public.cv_projects
      for all using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'cv_projects'
      and policyname = 'public_read_cv_projects'
  ) then
    create policy "public_read_cv_projects" on public.cv_projects
      for select using (
        exists (
          select 1
          from public.profiles p
          where p.id = cv_projects.user_id
            and p.is_public = true
        )
      );
  end if;
end;
$$;

create index if not exists idx_cv_projects_user_id
  on public.cv_projects (user_id, is_featured desc, order_index, created_at desc);
