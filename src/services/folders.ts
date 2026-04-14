import type { SupabaseClient } from '@supabase/supabase-js'
import type { NoteFolder } from '@/types/notes'
import type { CreateFolderData, UpdateFolderData } from '@/lib/validations/notes'

// ─────────────────────────────────────────────────────────────
// Result helpers
// ─────────────────────────────────────────────────────────────

type Ok<T>     = { data: T; error: null }
type Err       = { data: null; error: string }
type Result<T> = Ok<T> | Err

const ok  = <T>(data: T): Ok<T> => ({ data, error: null })
const err = (msg: string): Err  => ({ data: null, error: msg })

// ─────────────────────────────────────────────────────────────
// Queries
// ─────────────────────────────────────────────────────────────

export async function getFolders(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<NoteFolder[]>> {
  const { data, error } = await supabase
    .from('note_folders')
    .select('*')
    .eq('user_id', userId)
    .order('position', { ascending: true })
    .order('name', { ascending: true })

  if (error) return err(error.message)
  return ok(data as NoteFolder[])
}

// ─────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────

export async function createFolder(
  supabase: SupabaseClient,
  userId: string,
  input: CreateFolderData,
): Promise<Result<NoteFolder>> {
  const { data, error } = await supabase
    .from('note_folders')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as NoteFolder)
}

export async function updateFolder(
  supabase: SupabaseClient,
  input: UpdateFolderData,
): Promise<Result<NoteFolder>> {
  const { id, ...patch } = input
  const { data, error } = await supabase
    .from('note_folders')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as NoteFolder)
}

export async function deleteFolder(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<true>> {
  const { error } = await supabase
    .from('note_folders')
    .delete()
    .eq('id', id)

  if (error) return err(error.message)
  return ok(true as const)
}
