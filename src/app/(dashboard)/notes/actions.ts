'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  CreateNoteSchema, UpdateNoteSchema, DeleteNoteSchema, ToggleNoteSchema,
  CreateFolderSchema, UpdateFolderSchema, DeleteFolderSchema,
} from '@/lib/validations/notes'
import {
  createNote, updateNote, deleteNote,
  togglePin, toggleArchive, togglePublic,
  syncNoteLinks,
} from '@/services/notes'
import {
  createFolder, updateFolder, deleteFolder,
} from '@/services/folders'
import type { NoteActionResult, FolderActionResult } from '@/types/notes'

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

async function getAuthed() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return { supabase, user }
}

function revalidateNotes(id?: string) {
  revalidatePath('/notes')
  if (id) revalidatePath(`/notes/${id}`)
}

// ─────────────────────────────────────────────────────────────
// Extraer wiki-links [[title]] del contenido
// ─────────────────────────────────────────────────────────────

function extractWikiLinks(content: string): string[] {
  const matches = content.matchAll(/\[\[([^\]]+)\]\]/g)
  return [...matches].map((m) => m[1].trim())
}

// ─────────────────────────────────────────────────────────────
// Note actions
// ─────────────────────────────────────────────────────────────

export async function createNoteAction(formData: FormData): Promise<NoteActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = CreateNoteSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await createNote(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidateNotes()
  return { note: result.data! }
}

export async function updateNoteAction(formData: FormData): Promise<NoteActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = UpdateNoteSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await updateNote(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  // Sync wiki-links if content was updated
  if (parsed.data.content !== undefined) {
    const titles = extractWikiLinks(parsed.data.content)
    if (titles.length > 0) {
      // Resolve titles to note IDs
      const { data: linked } = await supabase
        .from('notes')
        .select('id')
        .eq('user_id', user.id)
        .in('title', titles)

      const ids = (linked ?? []).map((n: { id: string }) => n.id)
      await syncNoteLinks(supabase, user.id, parsed.data.id, ids)
    } else {
      await syncNoteLinks(supabase, user.id, parsed.data.id, [])
    }
  }

  revalidateNotes(parsed.data.id)
  return { note: result.data! }
}

export async function deleteNoteAction(formData: FormData): Promise<{ ok?: true; error?: string }> {
  const { supabase, user } = await getAuthed()

  const parsed = DeleteNoteSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'ID inválido' }

  const result = await deleteNote(supabase, user.id, parsed.data.id)
  if (result.error) return { error: result.error }

  revalidateNotes()
  return { ok: true }
}

export async function togglePinAction(formData: FormData): Promise<NoteActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = ToggleNoteSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'ID inválido' }

  const pinned = formData.get('value') === 'true'
  const result = await togglePin(supabase, user.id, parsed.data.id, pinned)
  if (result.error) return { error: result.error }

  revalidateNotes(parsed.data.id)
  return { note: result.data! }
}

export async function toggleArchiveAction(formData: FormData): Promise<NoteActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = ToggleNoteSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'ID inválido' }

  const archived = formData.get('value') === 'true'
  const result = await toggleArchive(supabase, user.id, parsed.data.id, archived)
  if (result.error) return { error: result.error }

  revalidateNotes(parsed.data.id)
  return { note: result.data! }
}

export async function togglePublicAction(formData: FormData): Promise<NoteActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = ToggleNoteSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'ID inválido' }

  const isPublic = formData.get('value') === 'true'
  const result = await togglePublic(supabase, user.id, parsed.data.id, isPublic)
  if (result.error) return { error: result.error }

  revalidateNotes(parsed.data.id)
  return { note: result.data! }
}

// ─────────────────────────────────────────────────────────────
// Folder actions
// ─────────────────────────────────────────────────────────────

export async function createFolderAction(formData: FormData): Promise<FolderActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = CreateFolderSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await createFolder(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidateNotes()
  return { folder: result.data! }
}

export async function updateFolderAction(formData: FormData): Promise<FolderActionResult> {
  const { supabase, user } = await getAuthed()

  const parsed = UpdateFolderSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Datos inválidos' }

  const result = await updateFolder(supabase, user.id, parsed.data)
  if (result.error) return { error: result.error }

  revalidateNotes()
  return { folder: result.data! }
}

export async function deleteFolderAction(formData: FormData): Promise<{ ok?: true; error?: string }> {
  const { supabase, user } = await getAuthed()

  const parsed = DeleteFolderSchema.safeParse(Object.fromEntries(formData))
  if (!parsed.success) return { error: 'ID inválido' }

  const result = await deleteFolder(supabase, user.id, parsed.data.id)
  if (result.error) return { error: result.error }

  revalidateNotes()
  return { ok: true }
}

// ─────────────────────────────────────────────────────────────
// Auto-save (called from NoteEditor debounce)
// ─────────────────────────────────────────────────────────────

export async function autoSaveNoteAction(
  id: string,
  title: string,
  content: string,
): Promise<{ ok?: true; error?: string }> {
  const { supabase, user } = await getAuthed()

  const { error } = await supabase
    .from('notes')
    .update({ title, content })
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  // Sync wiki-links
  const titles = extractWikiLinks(content)
  if (titles.length > 0) {
    const { data: linked } = await supabase
      .from('notes')
      .select('id')
      .eq('user_id', user.id)
      .in('title', titles)

    const ids = (linked ?? []).map((n: { id: string }) => n.id)
    await syncNoteLinks(supabase, user.id, id, ids)
  } else {
    await syncNoteLinks(supabase, user.id, id, [])
  }

  revalidatePath('/notes')
  return { ok: true }
}
