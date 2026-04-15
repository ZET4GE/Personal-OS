import { createClient } from '@/lib/supabase/client'

export type GoalLinkEntityType = 'project' | 'habit' | 'routine' | 'note'

type GoalLinkResult =
  | { ok: true }
  | { ok: false; error: string }

export async function linkEntityToGoal(
  goalId: string,
  entityType: GoalLinkEntityType,
  entityId: string,
): Promise<GoalLinkResult> {
  const supabase = createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    return { ok: false, error: 'Sesion no valida' }
  }

  const { error } = await supabase.rpc('link_entity_to_goal', {
    p_goal_id: goalId,
    p_entity_type: entityType,
    p_entity_id: entityId,
    p_user_id: user.id,
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function unlinkEntityFromGoal(
  goalId: string,
  entityType: GoalLinkEntityType,
  entityId: string,
): Promise<GoalLinkResult> {
  const supabase = createClient()

  const { error } = await supabase.rpc('unlink_entity_from_goal', {
    p_goal_id: goalId,
    p_entity_type: entityType,
    p_entity_id: entityId,
  })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}
