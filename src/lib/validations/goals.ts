import { z } from 'zod'
import { GOAL_CATEGORIES, GOAL_STATUSES, GOAL_PRIORITIES, GOAL_MOODS, GOAL_COLORS } from '@/types/goals'

// ─────────────────────────────────────────────────────────────
// Goal schemas
// ─────────────────────────────────────────────────────────────

export const CreateGoalSchema = z.object({
  title:       z.string().min(1, { error: 'Título requerido' }).max(255).trim(),
  description: z.string().max(2000).optional().nullable().transform((v) => v?.trim() || null),
  category:    z.enum(GOAL_CATEGORIES).optional().default('personal'),
  priority:    z.enum(GOAL_PRIORITIES).optional().default('medium'),
  color:       z.enum(GOAL_COLORS).optional().default('blue'),
  icon:        z.string().max(50).optional().nullable().transform((v) => v?.trim() || null),
  target_date: z.string().optional().nullable().transform((v) => v?.trim() || null),
  is_public:   z.string().optional().transform((v) => v === 'true'),
})

export const UpdateGoalSchema = z.object({
  id:          z.string().uuid({ error: 'ID inválido' }),
  title:       z.string().min(1).max(255).trim().optional(),
  description: z.string().max(2000).optional().nullable().transform((v) => v?.trim() || null),
  category:    z.enum(GOAL_CATEGORIES).optional(),
  priority:    z.enum(GOAL_PRIORITIES).optional(),
  color:       z.enum(GOAL_COLORS).optional(),
  icon:        z.string().max(50).optional().nullable().transform((v) => v?.trim() || null),
  target_date: z.string().optional().nullable().transform((v) => v?.trim() || null),
  status:      z.enum(GOAL_STATUSES).optional(),
  is_public:   z.string().optional().transform((v) => v === 'true'),
  order_index: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
})

export const DeleteGoalSchema = z.object({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export const ToggleGoalStatusSchema = z.object({
  id:     z.string().uuid({ error: 'ID inválido' }),
  status: z.enum(GOAL_STATUSES),
})

export type CreateGoalData = z.output<typeof CreateGoalSchema>
export type UpdateGoalData = z.output<typeof UpdateGoalSchema>

// ─────────────────────────────────────────────────────────────
// Milestone schemas
// ─────────────────────────────────────────────────────────────

export const CreateMilestoneSchema = z.object({
  goal_id:     z.string().uuid({ error: 'ID de meta inválido' }),
  title:       z.string().min(1, { error: 'Título requerido' }).max(255).trim(),
  description: z.string().max(1000).optional().nullable().transform((v) => v?.trim() || null),
  target_date: z.string().optional().nullable().transform((v) => v?.trim() || null),
  order_index: z.string().optional().transform((v) => (v ? parseInt(v, 10) : 0)),
})

export const UpdateMilestoneSchema = z.object({
  id:          z.string().uuid({ error: 'ID inválido' }),
  title:       z.string().min(1).max(255).trim().optional(),
  description: z.string().max(1000).optional().nullable().transform((v) => v?.trim() || null),
  target_date: z.string().optional().nullable().transform((v) => v?.trim() || null),
  order_index: z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
})

export const DeleteMilestoneSchema = z.object({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export const ToggleMilestoneSchema = z.object({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export type CreateMilestoneData = z.output<typeof CreateMilestoneSchema>
export type UpdateMilestoneData = z.output<typeof UpdateMilestoneSchema>

// ─────────────────────────────────────────────────────────────
// Goal update schemas
// ─────────────────────────────────────────────────────────────

export const CreateGoalUpdateSchema = z.object({
  goal_id: z.string().uuid({ error: 'ID de meta inválido' }),
  content: z.string().min(1, { error: 'Contenido requerido' }).max(2000).trim(),
  mood:    z.enum(GOAL_MOODS).optional().nullable().transform((v) => v ?? null),
})

export const DeleteGoalUpdateSchema = z.object({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export type CreateGoalUpdateData = z.output<typeof CreateGoalUpdateSchema>
