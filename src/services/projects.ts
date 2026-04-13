import type { SupabaseClient } from '@supabase/supabase-js'
import type { Project } from '@/types/projects'
import type { CreateProjectData, UpdateProjectData } from '@/lib/validations/projects'

// ─────────────────────────────────────────────────────────────
// Result helpers (misma forma que jobs.ts)
// ─────────────────────────────────────────────────────────────

type Ok<T>  = { data: T; error: null }
type Err    = { data: null; error: string }
type Result<T> = Ok<T> | Err

function ok<T>(data: T): Ok<T> { return { data, error: null } }
function err(msg: string): Err  { return { data: null, error: msg } }

// ─────────────────────────────────────────────────────────────
// Service functions
// RLS filtra por auth.uid() automáticamente en SELECT/UPDATE/DELETE.
// ─────────────────────────────────────────────────────────────

/** Todos los proyectos del usuario autenticado (privados + públicos). */
export async function getProjects(
  supabase: SupabaseClient,
): Promise<Result<Project[]>> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) return err(error.message)
  return ok(data as Project[])
}

/** Sólo proyectos públicos de un usuario específico (para perfil público). */
export async function getPublicProjects(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<Project[]>> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', userId)
    .eq('is_public', true)
    .order('created_at', { ascending: false })

  if (error) return err(error.message)
  return ok(data as Project[])
}

export async function createProject(
  supabase: SupabaseClient,
  userId: string,
  input: CreateProjectData,
): Promise<Result<Project>> {
  const { data, error } = await supabase
    .from('projects')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Project)
}

export async function updateProject(
  supabase: SupabaseClient,
  input: UpdateProjectData,
): Promise<Result<Project>> {
  const { id, ...patch } = input

  const { data, error } = await supabase
    .from('projects')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Project)
}

export async function togglePublic(
  supabase: SupabaseClient,
  id: string,
  isPublic: boolean,
): Promise<Result<true>> {
  const { error } = await supabase
    .from('projects')
    .update({ is_public: isPublic })
    .eq('id', id)

  if (error) return err(error.message)
  return ok(true as const)
}

export async function deleteProject(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<true>> {
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', id)

  if (error) return err(error.message)
  return ok(true as const)
}
