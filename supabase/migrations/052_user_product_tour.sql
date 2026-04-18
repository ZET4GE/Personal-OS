alter table public.user_onboarding
  add column if not exists tour_completed boolean not null default false,
  add column if not exists tour_completed_at timestamptz;

create index if not exists idx_user_onboarding_tour_completed
  on public.user_onboarding (user_id, tour_completed);
