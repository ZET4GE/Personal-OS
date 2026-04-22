import type { SupabaseClient } from '@supabase/supabase-js'
import type { Notification, CreateNotificationInput } from '@/types/notifications'

// ─────────────────────────────────────────────────────────────
// List
// ─────────────────────────────────────────────────────────────

export async function getNotifications(
  supabase: SupabaseClient,
  userId: string,
  onlyUnread = false,
  limit = 50,
): Promise<Notification[]> {
  let query = supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)

  if (onlyUnread) {
    query = query.eq('is_read', false)
  }

  const { data, error } = await query
  if (error || !data) return []
  return data as Notification[]
}

// ─────────────────────────────────────────────────────────────
// Unread count
// ─────────────────────────────────────────────────────────────

export async function getUnreadCount(
  supabase: SupabaseClient,
  userId: string,
): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false)

  if (error) return 0
  return count ?? 0
}

// ─────────────────────────────────────────────────────────────
// Mark as read
// ─────────────────────────────────────────────────────────────

export async function markAsRead(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<void> {
  await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
}

export async function markAllAsRead(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  await supabase
    .from('notifications')
    .update({ is_read: true, read_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('is_read', false)
}

// ─────────────────────────────────────────────────────────────
// Delete
// ─────────────────────────────────────────────────────────────

export async function deleteNotification(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<void> {
  await supabase
    .from('notifications')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)
}

export async function deleteAllRead(
  supabase: SupabaseClient,
  userId: string,
): Promise<void> {
  await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId)
    .eq('is_read', true)
}

// ─────────────────────────────────────────────────────────────
// Create
// ─────────────────────────────────────────────────────────────

export async function createNotification(
  supabase: SupabaseClient,
  userId: string,
  input: CreateNotificationInput,
): Promise<Notification | null> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      user_id:      userId,
      type:         input.type,
      title:        input.title,
      message:      input.message      ?? null,
      link:         input.link         ?? null,
      related_id:   input.related_id   ?? null,
      related_type: input.related_type ?? null,
      priority:     input.priority     ?? 'normal',
    })
    .select()
    .single()

  if (error || !data) return null
  return data as Notification
}
