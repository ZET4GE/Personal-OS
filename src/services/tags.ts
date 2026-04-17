import { createClient } from '@/lib/supabase/client'
import type { GlobalSearchResult } from '@/types/search'

export type TagEntityType =
  | 'project'
  | 'habit'
  | 'routine'
  | 'note'
  | 'goal'
  | 'roadmap'
  | 'job'
  | 'client'
  | 'freelance'

export interface Tag {
  id: string
  user_id: string
  name: string
  created_at: string
}

type TagResult<T> =
  | { data: T; error: null }
  | { data: null; error: string }

export async function getUserTags(): Promise<TagResult<Tag[]>> {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { data: null, error: 'Sesion no valida' }
  }

  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) return { data: null, error: error.message }
  return { data: (data ?? []) as Tag[], error: null }
}

export async function createTag(name: string): Promise<TagResult<Tag>> {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { data: null, error: 'Sesion no valida' }
  }

  const normalizedName = name.trim()
  if (!normalizedName) {
    return { data: null, error: 'Nombre invalido' }
  }

  const { data: existingTag, error: existingError } = await supabase
    .from('tags')
    .select('*')
    .eq('user_id', user.id)
    .ilike('name', normalizedName)
    .limit(1)
    .maybeSingle()

  if (existingError) return { data: null, error: existingError.message }
  if (existingTag) return { data: existingTag as Tag, error: null }

  const { data, error } = await supabase
    .from('tags')
    .insert({
      user_id: user.id,
      name: normalizedName,
    })
    .select()
    .single()

  if (error) return { data: null, error: error.message }
  return { data: data as Tag, error: null }
}

export async function getEntityTagIds(
  entityType: TagEntityType,
  entityId: string,
): Promise<TagResult<string[]>> {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { data: null, error: 'Sesion no valida' }
  }

  const { data, error } = await supabase
    .from('tag_links')
    .select('tag_id')
    .eq('user_id', user.id)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)

  if (error) return { data: null, error: error.message }
  return {
    data: (data ?? []).map((item) => String(item.tag_id)),
    error: null,
  }
}

export async function linkTagToEntity(
  tagId: string,
  entityType: TagEntityType,
  entityId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'Sesion no valida' }
  }

  const { error } = await supabase
    .from('tag_links')
    .upsert(
      {
        tag_id: tagId,
        entity_type: entityType,
        entity_id: entityId,
        user_id: user.id,
      },
      { onConflict: 'tag_id,entity_type,entity_id' },
    )

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function unlinkTagFromEntity(
  tagId: string,
  entityType: TagEntityType,
  entityId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'Sesion no valida' }
  }

  const { error } = await supabase
    .from('tag_links')
    .delete()
    .eq('tag_id', tagId)
    .eq('entity_type', entityType)
    .eq('entity_id', entityId)
    .eq('user_id', user.id)

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function getTaggedEntities(
  tagId: string,
  query?: string,
): Promise<TagResult<GlobalSearchResult[]>> {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { data: null, error: 'Sesion no valida' }
  }

  const { data, error } = await supabase.rpc('get_tagged_entities', {
    p_tag_id: tagId,
    p_query: query?.trim() || null,
  })

  if (error) return { data: null, error: error.message }
  return { data: (data ?? []) as GlobalSearchResult[], error: null }
}
