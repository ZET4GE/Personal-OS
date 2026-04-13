import type { SupabaseClient } from '@supabase/supabase-js'
import type { Profile } from '@/types/profile'
import type { Project } from '@/types/projects'
import type { UpdateProfileData } from '@/lib/validations/profiles'

// ─────────────────────────────────────────────────────────────
// Result helpers
// ─────────────────────────────────────────────────────────────

type Ok<T>     = { data: T; error: null }
type Err       = { data: null; error: string }
type Result<T> = Ok<T> | Err

function ok<T>(data: T): Ok<T> { return { data, error: null } }
function err(msg: string): Err  { return { data: null, error: msg } }

// ─────────────────────────────────────────────────────────────
// Read
// ─────────────────────────────────────────────────────────────

/** Perfil público por username — para la ruta /:username */
export async function getProfileByUsername(
  supabase: SupabaseClient,
  username: string,
): Promise<Result<Profile>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !data) return err('Perfil no encontrado')
  // La RLS ya filtra: sólo devuelve el perfil si es_public o es el owner.
  // Si llegó aquí, el perfil existe y es accesible.
  return ok(data as Profile)
}

/** Perfil propio (dashboard/settings) — sin filtro de is_public */
export async function getMyProfile(
  supabase: SupabaseClient,
): Promise<Result<Profile | null>> {
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return ok(null)

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (error) {
    // PGRST116 = "no rows returned" → perfil no creado todavía
    if (error.code === 'PGRST116') return ok(null)
    return err(error.message)
  }

  return ok(data as Profile)
}

/** Proyecto público por id — verifica que pertenece al usuario y es público. */
export async function getPublicProjectById(
  supabase: SupabaseClient,
  projectId: string,
  userId: string,
): Promise<Result<Project>> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .eq('user_id', userId)
    .eq('is_public', true)
    .single()

  if (error || !data) return err('Proyecto no encontrado')
  return ok(data as Project)
}

/** Proyectos públicos de un usuario para la vista pública. */
export async function getPublicProjectsByUsername(
  supabase: SupabaseClient,
  userId: string,           // profile.id === auth.users.id
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

// ─────────────────────────────────────────────────────────────
// Write
// ─────────────────────────────────────────────────────────────

export async function updateProfile(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateProfileData,
): Promise<Result<Profile>> {
  // Intentar UPDATE primero (caso normal: el perfil ya existe).
  // Si no hay fila (perfil nunca creado), caer a INSERT.
  const { data: updated, error: updateErr } = await supabase
    .from('profiles')
    .update(input)
    .eq('id', userId)
    .select()
    .single()

  if (!updateErr) return ok(updated as Profile)

  // PGRST116 = "no rows returned" → perfil no existe, crear
  if (updateErr.code !== 'PGRST116') {
    if (updateErr.code === '23505') return err('Ese username ya está en uso')
    return err(updateErr.message)
  }

  const { data: inserted, error: insertErr } = await supabase
    .from('profiles')
    .insert({ id: userId, ...input })
    .select()
    .single()

  if (insertErr) {
    if (insertErr.code === '23505') return err('Ese username ya está en uso')
    return err(insertErr.message)
  }

  return ok(inserted as Profile)
}
