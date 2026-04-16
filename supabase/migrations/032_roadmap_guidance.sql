alter table public.learning_roadmaps
  add column if not exists primary_goal_id uuid references public.goals(id) on delete set null,
  add column if not exists template text not null default 'blank';

create index if not exists idx_learning_roadmaps_primary_goal_id
  on public.learning_roadmaps (primary_goal_id);

create index if not exists idx_learning_roadmaps_template
  on public.learning_roadmaps (template);
