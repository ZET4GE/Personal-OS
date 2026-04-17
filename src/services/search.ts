import { createClient } from '@/lib/supabase/client'
import type { AdvancedSearchFilters, AdvancedSearchResult } from '@/types/search'

type SearchResult<T> =
  | { data: T; error: null }
  | { data: null; error: string }

export async function searchAdvanced(
  filters: AdvancedSearchFilters,
): Promise<SearchResult<AdvancedSearchResult[]>> {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { data: null, error: 'Sesion no valida' }
  }

  const { data, error } = await supabase.rpc('search_advanced', {
    p_user_id: user.id,
    p_query: filters.query.trim() || null,
    p_type: filters.type,
    p_tag_id: filters.tagId,
    p_status: filters.status,
    p_limit: 80,
  })

  if (error) return { data: null, error: error.message }
  return { data: (data ?? []) as AdvancedSearchResult[], error: null }
}
