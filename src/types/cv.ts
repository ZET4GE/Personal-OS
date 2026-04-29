// ─────────────────────────────────────────────────────────────
// Skill categories & qualitative levels
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

export const SKILL_LEVELS_QUALITATIVE = ['solid', 'operative', 'learning'] as const
export type SkillLevelQualitative = (typeof SKILL_LEVELS_QUALITATIVE)[number]

export const SKILL_LEVEL_QUALITATIVE_LABELS: Record<SkillLevelQualitative, string> = {
  solid:     'Sólido',
  operative: 'Operativo',
  learning:  'En aprendizaje',
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
  start_date:  string
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
  id:           string
  user_id:      string
  name:         string
  category:     SkillCategory
  subcategory:  string | null
  skill_level:  SkillLevelQualitative | null
  is_top:       boolean
  evidence:     string | null
  evidence_url: string | null
  keywords:     string[]
  order_index:  number
}

export interface CVCourse {
  id:                       string
  user_id:                  string
  title:                    string
  provider:                 string | null
  credential_url:           string | null
  completed_at:             string | null
  description:              string | null
  is_in_progress:           boolean
  expected_completion_date: string | null
  order_index:              number
  created_at:               string
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

export interface CVHighlight {
  id:          string
  user_id:     string
  icon:        string | null
  title:       string
  body:        string | null
  order_index: number
  created_at:  string
}

export interface DynamicCVExperience {
  id:           string
  title:        string
  description:  string | null
  completed_at: string | null
}

export interface DynamicCVProject {
  id:           string
  title:        string
  description:  string | null
  is_completed: boolean
}

export interface DynamicCV {
  experience: DynamicCVExperience[]
  projects:   DynamicCVProject[]
  skills:     Skill[]
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

export type CVHighlightActionResult =
  | { error: string; item?: never }
  | { item: CVHighlight; error?: never }
  | { ok: true; error?: never }
