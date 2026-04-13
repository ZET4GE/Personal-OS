import { z } from 'zod'
import {
  PROJECT_STATUSES_CLIENT,
  PRIORITIES,
  CURRENCIES,
  PAYMENT_METHODS,
} from '@/types/clients'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const optText = (max: number) =>
  z.string().max(max).optional().transform((v) => v?.trim() || null)

const optDate = () =>
  z.string().optional().transform((v) => v?.trim() || null)

const optDecimal = () =>
  z
    .string()
    .optional()
    .transform((v) => (v && v.trim() !== '' ? parseFloat(v) : null))
    .pipe(z.number().positive().nullable())

// ─────────────────────────────────────────────────────────────
// Client
// ─────────────────────────────────────────────────────────────

export const CreateClientSchema = z.object({
  name:    z.string().min(1, { error: 'Nombre requerido' }).max(255).trim(),
  email:   optText(255),
  company: optText(255),
  phone:   optText(50),
  notes:   optText(2000),
})

export const UpdateClientSchema = CreateClientSchema.extend({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export type CreateClientData = z.output<typeof CreateClientSchema>
export type UpdateClientData = z.output<typeof UpdateClientSchema>

// ─────────────────────────────────────────────────────────────
// Client Project
// ─────────────────────────────────────────────────────────────

export const CreateClientProjectSchema = z.object({
  client_id:   z.string().uuid().optional().nullable(),
  title:       z.string().min(1, { error: 'Título requerido' }).max(255).trim(),
  description: optText(2000),
  status:      z.enum(PROJECT_STATUSES_CLIENT).default('proposal'),
  priority:    z.enum(PRIORITIES).default('medium'),
  budget:      optDecimal(),
  currency:    z.enum(CURRENCIES).default('ARS'),
  start_date:  optDate(),
  due_date:    optDate(),
})

export const UpdateClientProjectSchema = CreateClientProjectSchema.extend({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export const UpdateProjectStatusSchema = z.object({
  id:     z.string().uuid(),
  status: z.enum(PROJECT_STATUSES_CLIENT),
})

export type CreateClientProjectData = z.output<typeof CreateClientProjectSchema>
export type UpdateClientProjectData = z.output<typeof UpdateClientProjectSchema>

// ─────────────────────────────────────────────────────────────
// Payment
// ─────────────────────────────────────────────────────────────

export const CreatePaymentSchema = z.object({
  project_id:   z.string().uuid({ error: 'Proyecto requerido' }),
  amount:       z
    .string()
    .min(1, { error: 'Monto requerido' })
    .transform((v) => parseFloat(v))
    .pipe(z.number().positive({ error: 'El monto debe ser positivo' })),
  currency:     z.enum(CURRENCIES).default('ARS'),
  payment_date: z.string().default(() => new Date().toISOString().slice(0, 10)),
  method:       z.enum(PAYMENT_METHODS).optional().nullable(),
  notes:        optText(1000),
})

export type CreatePaymentData = z.output<typeof CreatePaymentSchema>
