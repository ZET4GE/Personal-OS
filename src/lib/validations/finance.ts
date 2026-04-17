import { z } from 'zod'
import {
  FINANCE_CURRENCIES,
  FINANCE_PAYMENT_METHODS,
  FINANCE_TRANSACTION_TYPES,
} from '@/types/finance'

const optText = (max: number) =>
  z.string().max(max).optional().transform((v) => v?.trim() || null)

const optUuid = () =>
  z.string().optional().transform((v) => v?.trim() || null).pipe(z.string().uuid().nullable())

export const CreateFinanceTransactionSchema = z.object({
  type: z.enum(FINANCE_TRANSACTION_TYPES).default('expense'),
  amount: z
    .string()
    .min(1, { error: 'Monto requerido' })
    .transform((v) => Number(v))
    .pipe(z.number().positive({ error: 'El monto debe ser positivo' })),
  currency: z.enum(FINANCE_CURRENCIES).default('ARS'),
  category: optText(120),
  description: optText(1000),
  occurred_at: z.string().default(() => new Date().toISOString().slice(0, 10)),
  payment_method: z.enum(FINANCE_PAYMENT_METHODS).optional().nullable(),
  source_type: optText(50),
  source_id: optUuid(),
  is_recurring: z
    .union([z.literal('on'), z.literal('true'), z.literal('false')])
    .optional()
    .transform((v) => v === 'on' || v === 'true'),
})

export const UpdateFinanceTransactionSchema = CreateFinanceTransactionSchema.extend({
  id: z.string().uuid({ error: 'ID invalido' }),
})

export type CreateFinanceTransactionData = z.output<typeof CreateFinanceTransactionSchema>
export type UpdateFinanceTransactionData = z.output<typeof UpdateFinanceTransactionSchema>
