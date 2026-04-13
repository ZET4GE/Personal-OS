import { z } from 'zod'
import { FREQUENCIES, TIMES_OF_DAY, HABIT_COLORS } from '@/types/habits'

// ─────────────────────────────────────────────────────────────
// Habit
// ─────────────────────────────────────────────────────────────

export const CreateHabitSchema = z.object({
  name:        z.string().min(1, { error: 'Nombre requerido' }).max(255).trim(),
  description: z.string().max(500).optional().transform((v) => v?.trim() || null),
  icon:        z.string().max(50).optional().transform((v) => v?.trim() || null),
  color:       z.enum(HABIT_COLORS).default('blue'),
  frequency:   z.enum(FREQUENCIES).default('daily'),
  // target_days comes as comma-separated string from form: "1,2,3,4,5"
  target_days: z
    .string()
    .optional()
    .transform((v) => {
      if (!v || v.trim() === '') return [1, 2, 3, 4, 5, 6, 0]
      return v.split(',').map(Number).filter((n) => n >= 0 && n <= 6)
    }),
  reminder_time: z
    .string()
    .optional()
    .transform((v) => v?.trim() || null),
})

export const UpdateHabitSchema = CreateHabitSchema.extend({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export const UpdateHabitActiveSchema = z.object({
  id:        z.string().uuid(),
  is_active: z.string().transform((v) => v === 'true'),
})

export type CreateHabitData = z.output<typeof CreateHabitSchema>
export type UpdateHabitData = z.output<typeof UpdateHabitSchema>

// ─────────────────────────────────────────────────────────────
// Routine
// ─────────────────────────────────────────────────────────────

export const CreateRoutineSchema = z.object({
  name:              z.string().min(1, { error: 'Nombre requerido' }).max(255).trim(),
  description:       z.string().max(500).optional().transform((v) => v?.trim() || null),
  time_of_day:       z.enum(TIMES_OF_DAY).default('morning'),
  estimated_minutes: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== '' ? parseInt(v, 10) : null))
    .pipe(z.number().int().positive().nullable()),
})

export const UpdateRoutineSchema = CreateRoutineSchema.extend({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export type CreateRoutineData = z.output<typeof CreateRoutineSchema>
export type UpdateRoutineData = z.output<typeof UpdateRoutineSchema>

// ─────────────────────────────────────────────────────────────
// Routine item
// ─────────────────────────────────────────────────────────────

export const CreateRoutineItemSchema = z.object({
  routine_id:        z.string().uuid(),
  title:             z.string().min(1, { error: 'Título requerido' }).max(255).trim(),
  duration_minutes:  z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== '' ? parseInt(v, 10) : null))
    .pipe(z.number().int().positive().nullable()),
})

export const UpdateRoutineItemSchema = CreateRoutineItemSchema.extend({
  id: z.string().uuid(),
})

export type CreateRoutineItemData = z.output<typeof CreateRoutineItemSchema>
export type UpdateRoutineItemData = z.output<typeof UpdateRoutineItemSchema>
