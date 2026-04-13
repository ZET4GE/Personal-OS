import { z } from 'zod'
import { POST_STATUSES } from '@/types/posts'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const optionalText = (max = 500) =>
  z.string().max(max).optional().transform((v) => (v?.trim() ? v.trim() : null))

const optionalUrl = () =>
  z.string().max(500).optional().transform((v) => (v?.trim() ? v.trim() : null))

// tags llega como string CSV desde FormData → string[]
const tagsField = z
  .string()
  .optional()
  .transform((v) =>
    v
      ? v.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [],
  )

// ─────────────────────────────────────────────────────────────
// Schemas
// ─────────────────────────────────────────────────────────────

export const CreatePostSchema = z.object({
  title:       z.string().min(1, { error: 'Título requerido' }).max(255).trim(),
  content:     z.string().min(1, { error: 'Contenido requerido' }),
  excerpt:     optionalText(500),
  cover_image: optionalUrl(),
  tags:        tagsField,
  status:      z.enum(POST_STATUSES, { error: 'Estado inválido' }).default('draft'),
  is_featured: z.string().optional().transform((v) => v === 'true'),
  slug:        z
    .string()
    .max(255)
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : null)),
})

export const UpdatePostSchema = CreatePostSchema.partial().extend({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export const PublishPostSchema = z.object({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export type CreatePostData = z.output<typeof CreatePostSchema>
export type UpdatePostData = z.output<typeof UpdatePostSchema>
