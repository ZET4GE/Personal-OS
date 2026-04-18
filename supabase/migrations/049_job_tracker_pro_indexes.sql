create index if not exists idx_job_applications_user_status_applied_at
  on public.job_applications (user_id, status, applied_at desc);

create index if not exists idx_job_applications_user_next_follow_up_active
  on public.job_applications (user_id, next_follow_up_at)
  where next_follow_up_at is not null
    and status in ('applied', 'interview');

create index if not exists idx_job_interviews_user_outcome_scheduled_at
  on public.job_interviews (user_id, outcome, scheduled_at);
