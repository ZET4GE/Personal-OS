import { z } from 'zod'
import { TECH_CATEGORIES } from '@/types/tech-stack'

export const AddTechSchema = z.object({
  tech_name: z.string().min(1).max(80).transform((v) => v.trim()),
  tech_slug: z.string().min(1).max(80).transform((v) => v.trim().toLowerCase()),
  category:  z.enum(TECH_CATEGORIES),
})

export const RemoveTechSchema = z.object({
  id: z.string().uuid(),
})

export const ReorderTechSchema = z.object({
  // JSON-encoded ordered array of UUIDs
  ordered_ids: z
    .string()
    .transform((v) => JSON.parse(v) as string[])
    .pipe(z.array(z.string().uuid())),
})

export type AddTechData     = z.output<typeof AddTechSchema>
export type ReorderTechData = z.output<typeof ReorderTechSchema>
