import { z } from 'zod'
import { PROJECT_STATUSES } from '@/types/projects'

// ─────────────────────────────────────────────────────────────
// Helpers compartidos
// ─────────────────────────────────────────────────────────────

const optionalUrl = () =>
  z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null))

const optionalText = (max = 2000) =>
  z
    .string()
    .max(max, { error: `Máximo ${max} caracteres` })
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null))

// tech_stack llega como string CSV desde FormData; se parsea a string[]
const techStackField = z
  .string()
  .optional()
  .transform((v) =>
    v
      ? v
          .split(',')
          .map((t) => t.trim().toLowerCase())
          .filter(Boolean)
      : [],
  )

// ─────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────

export const CreateProjectSchema = z.object({
  title:       z.string().min(1, { error: 'Título requerido' }).max(255).trim(),
  description: optionalText(2000),
  tech_stack:  techStackField,
  status:      z.enum(PROJECT_STATUSES, { error: 'Estado inválido' }).default('in_progress'),
  is_public:   z
    .string()
    .optional()
    .transform((v) => v === 'true'),
  github_url:  optionalUrl(),
  live_url:    optionalUrl(),
  image_url:   optionalUrl(),
})

export const UpdateProjectSchema = CreateProjectSchema.partial().extend({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export const TogglePublicSchema = z.object({
  id:        z.string().uuid({ error: 'ID inválido' }),
  is_public: z
    .string()
    .transform((v) => v === 'true'),
})

export type CreateProjectData = z.output<typeof CreateProjectSchema>
export type UpdateProjectData = z.output<typeof UpdateProjectSchema>
