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

export const JOB_PRIORITIES = ['low', 'medium', 'high'] as const
export type JobPriority = (typeof JOB_PRIORITIES)[number]

export const JOB_PRIORITY_LABELS: Record<JobPriority, string> = {
  low:    'Baja',
  medium: 'Media',
  high:   'Alta',
}

export const JOB_PRIORITY_STYLES: Record<JobPriority, string> = {
  low:    'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  medium: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  high:   'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

export const JOB_INTERVIEW_STAGES = ['screening', 'technical', 'culture', 'offer', 'other'] as const
export type JobInterviewStage = (typeof JOB_INTERVIEW_STAGES)[number]

export const JOB_INTERVIEW_STAGE_LABELS: Record<JobInterviewStage, string> = {
  screening: 'Screening',
  technical: 'Tecnica',
  culture:   'Cultura',
  offer:     'Oferta',
  other:     'Otra',
}

export const JOB_INTERVIEW_OUTCOMES = ['pending', 'passed', 'failed', 'cancelled'] as const
export type JobInterviewOutcome = (typeof JOB_INTERVIEW_OUTCOMES)[number]

// ─────────────────────────────────────────────────────────────
// Core entity (espejo de la tabla SQL)
// ─────────────────────────────────────────────────────────────

export interface JobApplication {
  id:         string
  user_id:    string
  company:    string
  role:       string
  status:     JobStatus
  priority:   JobPriority
  link:       string | null
  notes:      string | null
  source:     string | null
  salary_range: string | null
  next_follow_up_at: string | null
  applied_at: string      // ISO 8601
  created_at: string
  updated_at: string
  interviews?: JobInterview[]
}

export interface JobInterview {
  id: string
  user_id: string
  job_id: string
  title: string
  scheduled_at: string
  stage: JobInterviewStage
  notes: string | null
  feedback: string | null
  outcome: JobInterviewOutcome | null
  created_at: string
  updated_at: string
}

export interface JobTrackerStats {
  total_jobs: number
  active_applications: number
  interviews: number
  offers: number
  rejected: number
  upcoming_interviews: number
  overdue_followups: number
  response_rate: number
}

// ─────────────────────────────────────────────────────────────
// Input types (usados por las Server Actions)
// ─────────────────────────────────────────────────────────────

export type CreateJobInput = {
  company:    string
  role:       string
  status:     JobStatus
  priority?:  JobPriority
  link?:      string | null
  notes?:     string | null
  source?:    string | null
  salary_range?: string | null
  next_follow_up_at?: string | null
  applied_at: string
}

export type UpdateJobInput = Partial<Omit<CreateJobInput, never>>

// ─────────────────────────────────────────────────────────────
// Action result (misma forma que AuthActionResult)
// ─────────────────────────────────────────────────────────────

export type JobActionResult =
  | { error: string; job?: never }
  | { job: JobApplication; error?: never }
  | { interview: JobInterview; error?: never }
  | { ok: true; error?: never }
