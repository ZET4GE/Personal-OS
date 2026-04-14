import { z } from 'zod'
import { FOLDER_COLORS } from '@/types/notes'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const tagsField = z
  .string()
  .optional()
  .transform((v) =>
    v
      ? v.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean)
      : [],
  )

const optionalUuid = () =>
  z.string().uuid().optional().nullable().transform((v) => v ?? null)

// ─────────────────────────────────────────────────────────────
// Note schemas
// ─────────────────────────────────────────────────────────────

export const CreateNoteSchema = z.object({
  title:     z.string().max(255).optional().transform((v) => v?.trim() || 'Sin título'),
  content:   z.string().optional().transform((v) => v ?? ''),
  folder_id: optionalUuid(),
  tags:      tagsField,
})

export const UpdateNoteSchema = z.object({
  id:          z.string().uuid({ error: 'ID inválido' }),
  title:       z.string().max(255).optional().transform((v) => v?.trim() || 'Sin título'),
  content:     z.string().optional(),
  folder_id:   optionalUuid(),
  tags:        tagsField,
  is_pinned:   z.string().optional().transform((v) => v === 'true'),
  is_archived: z.string().optional().transform((v) => v === 'true'),
  is_public:   z.string().optional().transform((v) => v === 'true'),
  slug:        z.string().max(255).optional().transform((v) => v?.trim() || undefined),
})

export const DeleteNoteSchema = z.object({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export const ToggleNoteSchema = z.object({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export type CreateNoteData = z.output<typeof CreateNoteSchema>
export type UpdateNoteData = z.output<typeof UpdateNoteSchema>

// ─────────────────────────────────────────────────────────────
// Folder schemas
// ─────────────────────────────────────────────────────────────

export const CreateFolderSchema = z.object({
  name:      z.string().min(1, { error: 'Nombre requerido' }).max(100).trim(),
  color:     z.enum(FOLDER_COLORS).optional().default('default'),
  icon:      z.string().max(50).optional().nullable().transform((v) => v ?? null),
  parent_id: optionalUuid(),
})

export const UpdateFolderSchema = z.object({
  id:        z.string().uuid({ error: 'ID inválido' }),
  name:      z.string().min(1).max(100).trim().optional(),
  color:     z.enum(FOLDER_COLORS).optional(),
  icon:      z.string().max(50).optional().nullable().transform((v) => v ?? null),
  parent_id: optionalUuid(),
  position:  z.string().optional().transform((v) => (v ? parseInt(v, 10) : undefined)),
})

export const DeleteFolderSchema = z.object({
  id: z.string().uuid({ error: 'ID inválido' }),
})

export type CreateFolderData = z.output<typeof CreateFolderSchema>
export type UpdateFolderData = z.output<typeof UpdateFolderSchema>
