// ─────────────────────────────────────────────────────────────
// Project status
// ─────────────────────────────────────────────────────────────

export const PROJECT_STATUSES = ['idea', 'in_progress', 'completed', 'archived'] as const
export type ProjectStatus = (typeof PROJECT_STATUSES)[number]

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  idea:        'Idea',
  in_progress: 'En progreso',
  completed:   'Completado',
  archived:    'Archivado',
}

export const PROJECT_STATUS_STYLES: Record<ProjectStatus, string> = {
  idea:        'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  in_progress: 'bg-blue-100   text-blue-700   dark:bg-blue-900/40   dark:text-blue-300',
  completed:   'bg-green-100  text-green-700  dark:bg-green-900/40  dark:text-green-300',
  archived:    'bg-slate-100  text-slate-500  dark:bg-slate-800     dark:text-slate-400',
}

// ─────────────────────────────────────────────────────────────
// Core entity (espejo de la tabla SQL)
// ─────────────────────────────────────────────────────────────

export interface Project {
  id:          string
  user_id:     string
  title:       string
  description: string | null
  tech_stack:  string[]
  status:      ProjectStatus
  is_public:   boolean
  github_url:  string | null
  live_url:    string | null
  image_url:   string | null
  created_at:  string
  updated_at:  string
}

// ─────────────────────────────────────────────────────────────
// Input types
// ─────────────────────────────────────────────────────────────

export type CreateProjectInput = {
  title:       string
  description: string | null
  tech_stack:  string[]
  status:      ProjectStatus
  is_public:   boolean
  github_url:  string | null
  live_url:    string | null
  image_url:   string | null
}

export type UpdateProjectInput = Partial<CreateProjectInput>

// ─────────────────────────────────────────────────────────────
// Action result
// ─────────────────────────────────────────────────────────────

export type ProjectActionResult =
  | { error: string; project?: never }
  | { project: Project; error?: never }
  | { ok: true; error?: never }
