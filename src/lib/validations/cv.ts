import { z } from 'zod'
import { SKILL_CATEGORIES, SKILL_LEVELS } from '@/types/cv'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const optionalText = (max = 2000) =>
  z
    .string()
    .max(max, { error: `Máximo ${max} caracteres` })
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null))

const optionalDate = z
  .string()
  .optional()
  .transform((v) => (v?.trim() ? v.trim() : null))

const optionalUrl = z
  .string()
  .max(500)
  .optional()
  .transform((v) => (v?.trim() ? v.trim() : null))

const techStackInput = z
  .string()
  .optional()
  .transform((v) =>
    (v ?? '')
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  )

// ─────────────────────────────────────────────────────────────
// Work Experience
// ─────────────────────────────────────────────────────────────

export const CreateWorkExperienceSchema = z.object({
  company:     z.string().min(1, { error: 'Empresa requerida' }).max(255).trim(),
  role:        z.string().min(1, { error: 'Rol requerido' }).max(255).trim(),
  description: optionalText(3000),
  start_date:  z.string().min(1, { error: 'Fecha de inicio requerida' }),
  end_date:    optionalDate,
  is_current:  z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  location:    optionalText(100),
  order_index: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 0)),
})

export const UpdateWorkExperienceSchema = CreateWorkExperienceSchema.extend({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export type CreateWorkExperienceData = z.output<typeof CreateWorkExperienceSchema>
export type UpdateWorkExperienceData = z.output<typeof UpdateWorkExperienceSchema>

// ─────────────────────────────────────────────────────────────
// Education
// ─────────────────────────────────────────────────────────────

export const CreateEducationSchema = z.object({
  institution: z.string().min(1, { error: 'Institución requerida' }).max(255).trim(),
  degree:      z.string().min(1, { error: 'Título requerido' }).max(255).trim(),
  field:       optionalText(255),
  start_date:  optionalDate,
  end_date:    optionalDate,
  description: optionalText(3000),
  order_index: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 0)),
})

export const UpdateEducationSchema = CreateEducationSchema.extend({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export type CreateEducationData = z.output<typeof CreateEducationSchema>
export type UpdateEducationData = z.output<typeof UpdateEducationSchema>

// ─────────────────────────────────────────────────────────────
// Skills
// ─────────────────────────────────────────────────────────────

export const CreateSkillSchema = z.object({
  name:        z.string().min(1, { error: 'Nombre requerido' }).max(100).trim(),
  category:    z.enum(SKILL_CATEGORIES, { error: 'Categoría inválida' }).default('technical'),
  level:       z
    .enum(SKILL_LEVELS)
    .optional()
    .transform((v) => v ?? null),
  order_index: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 0)),
})

export const UpdateSkillSchema = CreateSkillSchema.extend({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export type CreateSkillData = z.output<typeof CreateSkillSchema>
export type UpdateSkillData = z.output<typeof UpdateSkillSchema>

// Courses

export const CreateCVCourseSchema = z.object({
  title:          z.string().min(1, { error: 'Curso requerido' }).max(255).trim(),
  provider:       optionalText(255),
  credential_url: optionalUrl,
  completed_at:   optionalDate,
  description:    optionalText(3000),
  order_index: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 0)),
})

export const UpdateCVCourseSchema = CreateCVCourseSchema.extend({
  id: z.string().uuid({ error: 'ID invalido' }),
})

export type CreateCVCourseData = z.output<typeof CreateCVCourseSchema>
export type UpdateCVCourseData = z.output<typeof UpdateCVCourseSchema>

// CV Projects

export const CreateCVProjectSchema = z.object({
  title:       z.string().min(1, { error: 'Proyecto requerido' }).max(255).trim(),
  description: optionalText(3000),
  url:         optionalUrl,
  repo_url:    optionalUrl,
  tech_stack:  techStackInput,
  is_featured: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  order_index: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : 0)),
})

export const UpdateCVProjectSchema = CreateCVProjectSchema.extend({
  id: z.string().uuid({ error: 'ID invalido' }),
})

export type CreateCVProjectData = z.output<typeof CreateCVProjectSchema>
export type UpdateCVProjectData = z.output<typeof UpdateCVProjectSchema>
