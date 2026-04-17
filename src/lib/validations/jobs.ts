import { z } from 'zod'
import { JOB_INTERVIEW_OUTCOMES, JOB_INTERVIEW_STAGES, JOB_PRIORITIES, JOB_STATUSES } from '@/types/jobs'

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

const optionalDateTime = () =>
  z
    .string()
    .optional()
    .transform((v) => (v?.trim() ? new Date(v).toISOString() : null))

// ─────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────

export const CreateJobSchema = z.object({
  company:    z.string().min(1, { error: 'Empresa requerida' }).max(255).trim(),
  role:       z.string().min(1, { error: 'Rol requerido' }).max(255).trim(),
  status:     z.enum(JOB_STATUSES, { error: 'Estado inválido' }).default('applied'),
  priority:   z.enum(JOB_PRIORITIES, { error: 'Prioridad inválida' }).default('medium'),
  link:       optionalText(500),
  notes:      optionalText(2000),
  source:     optionalText(255),
  salary_range: optionalText(255),
  next_follow_up_at: optionalDateTime(),
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

export const CreateJobInterviewSchema = z.object({
  job_id:       z.string().uuid({ error: 'ID inválido' }),
  title:        z.string().max(255).optional().transform((v) => v?.trim() || 'Entrevista'),
  scheduled_at: z.string().min(1, { error: 'Fecha requerida' }).transform((v) => new Date(v).toISOString()),
  stage:        z.enum(JOB_INTERVIEW_STAGES, { error: 'Etapa inválida' }).default('screening'),
  outcome:      z.enum(JOB_INTERVIEW_OUTCOMES, { error: 'Resultado inválido' }).default('pending'),
  notes:        optionalText(1000),
  feedback:     optionalText(1000),
})

export type CreateJobData = z.output<typeof CreateJobSchema>
export type UpdateJobData = z.output<typeof UpdateJobSchema>
export type CreateJobInterviewData = z.output<typeof CreateJobInterviewSchema>
