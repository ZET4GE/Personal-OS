import type { SupabaseClient } from '@supabase/supabase-js'
import type { Note, NoteWithFolder, NoteSearchResult } from '@/types/notes'
import type { CreateNoteData, UpdateNoteData } from '@/lib/validations/notes'

// ─────────────────────────────────────────────────────────────
// Result helpers
// ─────────────────────────────────────────────────────────────

type Ok<T>     = { data: T; error: null }
type Err       = { data: null; error: string }
type Result<T> = Ok<T> | Err

const ok  = <T>(data: T): Ok<T> => ({ data, error: null })
const err = (msg: string): Err  => ({ data: null, error: msg })

// ─────────────────────────────────────────────────────────────
// List queries
// ─────────────────────────────────────────────────────────────

export async function getNotes(
  supabase: SupabaseClient,
  userId: string,
  opts: {
    folderId?:  string | null   // null = sin carpeta, undefined = todas
    archived?:  boolean
    tag?:       string
    pinned?:    boolean
  } = {},
): Promise<Result<Note[]>> {
  let query = supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)

  if (opts.folderId !== undefined) {
    if (opts.folderId === null) {
      query = query.is('folder_id', null)
    } else {
      query = query.eq('folder_id', opts.folderId)
    }
  }

  if (opts.archived !== undefined) {
    query = query.eq('is_archived', opts.archived)
  } else {
    query = query.eq('is_archived', false)
  }

  if (opts.pinned !== undefined) {
    query = query.eq('is_pinned', opts.pinned)
  }

  if (opts.tag) {
    query = query.contains('tags', [opts.tag])
  }

  query = query
    .order('is_pinned', { ascending: false })
    .order('updated_at', { ascending: false })

  const { data, error } = await query
  if (error) return err(error.message)
  return ok(data as Note[])
}

export async function getNote(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<NoteWithFolder>> {
  const { data, error } = await supabase
    .from('notes')
    .select('*, folder:note_folders(*)')
    .eq('id', id)
    .single()

  if (error || !data) return err('Nota no encontrada')
  return ok(data as unknown as NoteWithFolder)
}

export async function getNoteBySlug(
  supabase: SupabaseClient,
  userId: string,
  slug: string,
): Promise<Result<Note>> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('slug', slug)
    .single()

  if (error || !data) return err('Nota no encontrada')
  return ok(data as Note)
}

// Recent notes for dashboard widget
export async function getRecentNotes(
  supabase: SupabaseClient,
  userId: string,
  limit = 5,
): Promise<Result<Note[]>> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) return err(error.message)
  return ok(data as Note[])
}

// ─────────────────────────────────────────────────────────────
// FTS search
// ─────────────────────────────────────────────────────────────

export async function searchNotes(
  supabase: SupabaseClient,
  userId: string,
  query: string,
): Promise<Result<NoteSearchResult[]>> {
  const { data, error } = await supabase.rpc('search_notes', {
    p_uid:   userId,
    p_query: query,
  })

  if (error) return err(error.message)
  return ok((data ?? []) as NoteSearchResult[])
}

// ─────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────

export async function createNote(
  supabase: SupabaseClient,
  userId: string,
  input: CreateNoteData,
): Promise<Result<Note>> {
  const { data, error } = await supabase
    .from('notes')
    .insert({ ...input, user_id: userId, slug: '' })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Note)
}

export async function updateNote(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateNoteData,
): Promise<Result<Note>> {
  const { id, ...patch } = input
  const { data, error } = await supabase
    .from('notes')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Note)
}

export async function deleteNote(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<Result<true>> {
  const { error } = await supabase
    .from('notes')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  if (error) return err(error.message)
  return ok(true as const)
}

export async function togglePin(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  value: boolean,
): Promise<Result<Note>> {
  const { data, error } = await supabase
    .from('notes')
    .update({ is_pinned: value })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Note)
}

export async function toggleArchive(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  value: boolean,
): Promise<Result<Note>> {
  const { data, error } = await supabase
    .from('notes')
    .update({ is_archived: value, is_pinned: value ? false : undefined })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Note)
}

export async function togglePublic(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  value: boolean,
): Promise<Result<Note>> {
  const { data, error } = await supabase
    .from('notes')
    .update({ is_public: value })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Note)
}

// ─────────────────────────────────────────────────────────────
// Backlinks (notes that link to a given note)
// ─────────────────────────────────────────────────────────────

export async function getBacklinks(
  supabase: SupabaseClient,
  noteId: string,
): Promise<Result<Note[]>> {
  const { data, error } = await supabase
    .from('note_links')
    .select('source_note:notes!source_note_id(*)')
    .eq('target_note_id', noteId)

  if (error) return err(error.message)
  const notes = (data ?? [])
    .map((row: unknown) => (row as { source_note: Note }).source_note)
    .filter(Boolean)
  return ok(notes as Note[])
}

// ─────────────────────────────────────────────────────────────
// Wiki-link sync: replace all links from a source note
// ─────────────────────────────────────────────────────────────

export async function syncNoteLinks(
  supabase: SupabaseClient,
  userId: string,
  sourceNoteId: string,
  targetNoteIds: string[],
): Promise<void> {
  const { data: sourceNote } = await supabase
    .from('notes')
    .select('id')
    .eq('id', sourceNoteId)
    .eq('user_id', userId)
    .maybeSingle()

  if (!sourceNote) return

  await supabase
    .from('note_links')
    .delete()
    .eq('source_note_id', sourceNoteId)

  if (targetNoteIds.length === 0) return

  const { data: validTargets } = await supabase
    .from('notes')
    .select('id')
    .eq('user_id', userId)
    .in('id', targetNoteIds)

  const validTargetIds = (validTargets ?? []).map((note) => String(note.id))
  if (validTargetIds.length === 0) return

  const rows = validTargetIds.map((target_note_id) => ({
    source_note_id: sourceNoteId,
    target_note_id,
  }))

  await supabase.from('note_links').insert(rows)
}

// ─────────────────────────────────────────────────────────────
// Public wiki helpers
// ─────────────────────────────────────────────────────────────

export async function getPublicNotes(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<Note[]>> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .eq('is_archived', false)
    .order('updated_at', { ascending: false })

  if (error) return err(error.message)
  return ok(data as Note[])
}

export async function getPublicNoteBySlug(
  supabase: SupabaseClient,
  userId: string,
  slug: string,
): Promise<Result<Note>> {
  const { data, error } = await supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .eq('slug', slug)
    .eq('is_public', true)
    .single()

  if (error || !data) return err('Wiki page no encontrada')
  return ok(data as Note)
}

// ─────────────────────────────────────────────────────────────
// Tags aggregation
// ─────────────────────────────────────────────────────────────

export async function getAllTags(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<string[]>> {
  const { data, error } = await supabase
    .from('notes')
    .select('tags')
    .eq('user_id', userId)
    .eq('is_archived', false)

  if (error) return err(error.message)
  const allTags = (data ?? []).flatMap((r: { tags: string[] }) => r.tags ?? [])
  const unique  = [...new Set(allTags)].sort()
  return ok(unique)
}
