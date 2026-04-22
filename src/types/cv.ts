// ─────────────────────────────────────────────────────────────
// Skill categories & levels
// ─────────────────────────────────────────────────────────────

export const SKILL_CATEGORIES = ['technical', 'soft', 'language', 'tool'] as const
export type SkillCategory = (typeof SKILL_CATEGORIES)[number]

export const CV_LANGUAGES = ['es', 'en'] as const
export type CVLanguage = (typeof CV_LANGUAGES)[number]

export const SKILL_CATEGORY_LABELS: Record<SkillCategory, string> = {
  technical: 'Técnico',
  soft:      'Habilidades blandas',
  language:  'Idiomas',
  tool:      'Herramientas',
}

export const SKILL_CATEGORY_LABELS_BY_LANGUAGE: Record<CVLanguage, Record<SkillCategory, string>> = {
  es: SKILL_CATEGORY_LABELS,
  en: {
    technical: 'Technical',
    soft:      'Soft skills',
    language:  'Languages',
    tool:      'Tools',
  },
}

export const SKILL_LEVELS = ['beginner', 'intermediate', 'advanced', 'expert'] as const
export type SkillLevel = (typeof SKILL_LEVELS)[number]

export const SKILL_LEVEL_LABELS: Record<SkillLevel, string> = {
  beginner:     'Principiante',
  intermediate: 'Intermedio',
  advanced:     'Avanzado',
  expert:       'Experto',
}

export const SKILL_LEVEL_LABELS_BY_LANGUAGE: Record<CVLanguage, Record<SkillLevel, string>> = {
  es: SKILL_LEVEL_LABELS,
  en: {
    beginner:     'Beginner',
    intermediate: 'Intermediate',
    advanced:     'Advanced',
    expert:       'Expert',
  },
}

// ─────────────────────────────────────────────────────────────
// Entities
// ─────────────────────────────────────────────────────────────

export interface WorkExperience {
  id:          string
  user_id:     string
  company:     string
  role:        string
  description: string | null
  start_date:  string   // ISO date string (YYYY-MM-DD)
  end_date:    string | null
  is_current:  boolean
  location:    string | null
  order_index: number
  created_at:  string
}

export interface Education {
  id:          string
  user_id:     string
  institution: string
  degree:      string
  field:       string | null
  start_date:  string | null
  end_date:    string | null
  description: string | null
  order_index: number
  created_at:  string
}

export interface Skill {
  id:          string
  user_id:     string
  name:        string
  category:    SkillCategory
  level:       SkillLevel | null
  is_top:      boolean
  evidence:    string | null
  evidence_url: string | null
  keywords:    string[]
  order_index: number
}

export interface CVCourse {
  id:             string
  user_id:        string
  title:          string
  provider:       string | null
  credential_url: string | null
  completed_at:   string | null
  description:    string | null
  order_index:    number
  created_at:     string
}

export interface CVProject {
  id:          string
  user_id:     string
  title:       string
  description: string | null
  url:         string | null
  repo_url:    string | null
  tech_stack:  string[]
  is_featured: boolean
  order_index: number
  created_at:  string
}

export interface DynamicCVExperience {
  id: string
  title: string
  description: string | null
  completed_at: string | null
}

export interface DynamicCVProject {
  id: string
  title: string
  description: string | null
  is_completed: boolean
}

export interface DynamicCV {
  experience: DynamicCVExperience[]
  projects: DynamicCVProject[]
  skills: Skill[]
}

// ─────────────────────────────────────────────────────────────
// Action results
// ─────────────────────────────────────────────────────────────

export type WorkExperienceActionResult =
  | { error: string; item?: never }
  | { item: WorkExperience; error?: never }
  | { ok: true; error?: never }

export type EducationActionResult =
  | { error: string; item?: never }
  | { item: Education; error?: never }
  | { ok: true; error?: never }

export type SkillActionResult =
  | { error: string; item?: never }
  | { item: Skill; error?: never }
  | { ok: true; error?: never }

export type CVCourseActionResult =
  | { error: string; item?: never }
  | { item: CVCourse; error?: never }
  | { ok: true; error?: never }

export type CVProjectActionResult =
  | { error: string; item?: never }
  | { item: CVProject; error?: never }
  | { ok: true; error?: never }
