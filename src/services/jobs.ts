import type { SupabaseClient } from '@supabase/supabase-js'
import type { JobApplication, JobInterview, JobStatus, JobTrackerStats } from '@/types/jobs'
import type { CreateJobData, CreateJobInterviewData, UpdateJobData, UpdateJobInterviewOutcomeData } from '@/lib/validations/jobs'

// ─────────────────────────────────────────────────────────────
// Result type
// ─────────────────────────────────────────────────────────────

type Ok<T>  = { data: T; error: null }
type Err    = { data: null; error: string }
type Result<T> = Ok<T> | Err

function ok<T>(data: T): Ok<T> { return { data, error: null } }
function err(msg: string): Err  { return { data: null, error: msg } }

type JobApplicationRow = Omit<JobApplication, 'interviews'> & {
  job_interviews?: JobInterview[] | null
}

function normalizeJob(row: JobApplicationRow): JobApplication {
  const { job_interviews, ...job } = row

  return {
    ...job,
    priority: job.priority ?? 'medium',
    source: job.source ?? null,
    salary_range: job.salary_range ?? null,
    next_follow_up_at: job.next_follow_up_at ?? null,
    interviews: (job_interviews ?? []).sort(
      (a, b) => new Date(a.scheduled_at).getTime() - new Date(b.scheduled_at).getTime(),
    ),
  }
}

// ─────────────────────────────────────────────────────────────
// Service functions
// Con RLS activo Supabase filtra por auth.uid() automáticamente.
// user_id sólo es necesario para INSERT.
// ─────────────────────────────────────────────────────────────

export async function getJobs(
  supabase: SupabaseClient,
  statusFilter?: JobStatus,
): Promise<Result<JobApplication[]>> {
  let query = supabase
    .from('job_applications')
    .select('*, job_interviews(*)')
    .order('applied_at', { ascending: false })

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query
  if (error) return err(error.message)
  return ok(((data ?? []) as JobApplicationRow[]).map(normalizeJob))
}

export async function createJob(
  supabase: SupabaseClient,
  userId: string,
  input: CreateJobData,
): Promise<Result<JobApplication>> {
  const { data, error } = await supabase
    .from('job_applications')
    .insert({ ...input, user_id: userId })
    .select('*, job_interviews(*)')
    .single()

  if (error) return err(error.message)
  return ok(normalizeJob(data as JobApplicationRow))
}

export async function updateJob(
  supabase: SupabaseClient,
  input: UpdateJobData,
): Promise<Result<JobApplication>> {
  const { id, ...patch } = input

  const { data, error } = await supabase
    .from('job_applications')
    .update(patch)
    .eq('id', id)
    .select('*, job_interviews(*)')
    .single()

  if (error) return err(error.message)
  return ok(normalizeJob(data as JobApplicationRow))
}

export async function updateJobStatus(
  supabase: SupabaseClient,
  id: string,
  status: JobStatus,
): Promise<Result<true>> {
  const { error } = await supabase
    .from('job_applications')
    .update({ status })
    .eq('id', id)

  if (error) return err(error.message)
  return ok(true as const)
}

export async function createJobInterview(
  supabase: SupabaseClient,
  userId: string,
  input: CreateJobInterviewData,
): Promise<Result<JobInterview>> {
  const { data, error } = await supabase
    .from('job_interviews')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as JobInterview)
}

export async function deleteJobInterview(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<true>> {
  const { error } = await supabase
    .from('job_interviews')
    .delete()
    .eq('id', id)

  if (error) return err(error.message)
  return ok(true as const)
}

export async function updateJobInterviewOutcome(
  supabase: SupabaseClient,
  input: UpdateJobInterviewOutcomeData,
): Promise<Result<JobInterview>> {
  const { data, error } = await supabase
    .from('job_interviews')
    .update({ outcome: input.outcome })
    .eq('id', input.id)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as JobInterview)
}

export async function getJobTrackerStats(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<JobTrackerStats>> {
  const { data, error } = await supabase.rpc('get_job_tracker_stats', {
    p_user_id: userId,
  })

  if (error) return err(error.message)

  const row = Array.isArray(data) ? data[0] : data
  return ok({
    total_jobs: Number(row?.total_jobs ?? 0),
    active_applications: Number(row?.active_applications ?? 0),
    interviews: Number(row?.interviews ?? 0),
    offers: Number(row?.offers ?? 0),
    rejected: Number(row?.rejected ?? 0),
    upcoming_interviews: Number(row?.upcoming_interviews ?? 0),
    overdue_followups: Number(row?.overdue_followups ?? 0),
    response_rate: Number(row?.response_rate ?? 0),
  })
}

export async function deleteJob(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<true>> {
  const { error } = await supabase
    .from('job_applications')
    .delete()
    .eq('id', id)

  if (error) return err(error.message)
  return ok(true as const)
}
