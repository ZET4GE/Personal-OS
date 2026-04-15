import { createClient } from '@/lib/supabase/client'
import type { GoalLinkEntityType } from '@/services/goal-links'

export interface LinkableGoalEntity {
  id: string
  title: string
  description: string | null
}

type GoalEntitiesResult =
  | { data: LinkableGoalEntity[]; error: null }
  | { data: null; error: string }

export async function getLinkableEntities(
  entityType: GoalLinkEntityType,
): Promise<GoalEntitiesResult> {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { data: null, error: 'Sesion no valida' }
  }

  switch (entityType) {
    case 'project': {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, description')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) return { data: null, error: error.message }
      return { data: (data ?? []) as LinkableGoalEntity[], error: null }
    }

    case 'habit': {
      const { data, error } = await supabase
        .from('habits')
        .select('id, name, description')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) return { data: null, error: error.message }
      return {
        data: (data ?? []).map((item) => ({
          id: String(item.id),
          title: String(item.name),
          description: item.description ? String(item.description) : null,
        })),
        error: null,
      }
    }

    case 'routine': {
      const { data, error } = await supabase
        .from('routines')
        .select('id, name, description')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) return { data: null, error: error.message }
      return {
        data: (data ?? []).map((item) => ({
          id: String(item.id),
          title: String(item.name),
          description: item.description ? String(item.description) : null,
        })),
        error: null,
      }
    }

    case 'note': {
      const { data, error } = await supabase
        .from('notes')
        .select('id, title, excerpt')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('updated_at', { ascending: false })

      if (error) return { data: null, error: error.message }
      return {
        data: (data ?? []).map((item) => ({
          id: String(item.id),
          title: String(item.title),
          description: item.excerpt ? String(item.excerpt) : null,
        })),
        error: null,
      }
    }
  }
}
