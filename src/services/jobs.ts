import type { SupabaseClient } from '@supabase/supabase-js'
import type { JobApplication, JobStatus } from '@/types/jobs'
import type { CreateJobData, UpdateJobData } from '@/lib/validations/jobs'

// ─────────────────────────────────────────────────────────────
// Result type
// ─────────────────────────────────────────────────────────────

type Ok<T>  = { data: T; error: null }
type Err    = { data: null; error: string }
type Result<T> = Ok<T> | Err

function ok<T>(data: T): Ok<T> { return { data, error: null } }
function err(msg: string): Err  { return { data: null, error: msg } }

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
    .select('*')
    .order('applied_at', { ascending: false })

  if (statusFilter) {
    query = query.eq('status', statusFilter)
  }

  const { data, error } = await query
  if (error) return err(error.message)
  return ok(data as JobApplication[])
}

export async function createJob(
  supabase: SupabaseClient,
  userId: string,
  input: CreateJobData,
): Promise<Result<JobApplication>> {
  const { data, error } = await supabase
    .from('job_applications')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as JobApplication)
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
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as JobApplication)
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
