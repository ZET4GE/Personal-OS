import { z } from 'zod'
import { JOB_STATUSES } from '@/types/jobs'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

// Convierte campo opcional en null si está vacío
const optionalText = (max = 2000) =>
  z
    .string()
    .max(max, { error: `Máximo ${max} caracteres` })
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null))

// ─────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────

export const CreateJobSchema = z.object({
  company:    z.string().min(1, { error: 'Empresa requerida' }).max(255).trim(),
  role:       z.string().min(1, { error: 'Rol requerido' }).max(255).trim(),
  status:     z.enum(JOB_STATUSES, { error: 'Estado inválido' }).default('applied'),
  link:       optionalText(500),
  notes:      optionalText(2000),
  applied_at: z
    .string()
    .optional()
    .transform((v) => v || new Date().toISOString()),
})

export const UpdateJobSchema = CreateJobSchema.partial().extend({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export const UpdateStatusSchema = z.object({
  id:     z.string().uuid({ error: 'ID inválido' }),
  status: z.enum(JOB_STATUSES, { error: 'Estado inválido' }),
})

export type CreateJobData = z.output<typeof CreateJobSchema>
export type UpdateJobData = z.output<typeof UpdateJobSchema>
