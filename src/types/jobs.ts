// ─────────────────────────────────────────────────────────────
// Job status
// ─────────────────────────────────────────────────────────────

export const JOB_STATUSES = ['applied', 'interview', 'offer', 'rejected'] as const
export type JobStatus = (typeof JOB_STATUSES)[number]

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  applied:   'Postulado',
  interview: 'Entrevista',
  offer:     'Oferta',
  rejected:  'Rechazado',
}

export const JOB_STATUS_STYLES: Record<JobStatus, string> = {
  applied:   'bg-slate-100  text-slate-700  dark:bg-slate-800  dark:text-slate-300',
  interview: 'bg-blue-100   text-blue-700   dark:bg-blue-900/40  dark:text-blue-300',
  offer:     'bg-green-100  text-green-700  dark:bg-green-900/40 dark:text-green-300',
  rejected:  'bg-red-100    text-red-600    dark:bg-red-900/40   dark:text-red-300',
}

// ─────────────────────────────────────────────────────────────
// Core entity (espejo de la tabla SQL)
// ─────────────────────────────────────────────────────────────

export interface JobApplication {
  id:         string
  user_id:    string
  company:    string
  role:       string
  status:     JobStatus
  link:       string | null
  notes:      string | null
  applied_at: string      // ISO 8601
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────────────────────
// Input types (usados por las Server Actions)
// ─────────────────────────────────────────────────────────────

export type CreateJobInput = {
  company:    string
  role:       string
  status:     JobStatus
  link?:      string | null
  notes?:     string | null
  applied_at: string
}

export type UpdateJobInput = Partial<Omit<CreateJobInput, never>>

// ─────────────────────────────────────────────────────────────
// Action result (misma forma que AuthActionResult)
// ─────────────────────────────────────────────────────────────

export type JobActionResult =
  | { error: string; job?: never }
  | { job: JobApplication; error?: never }
  | { ok: true; error?: never }
