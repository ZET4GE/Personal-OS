'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import {
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  createNotification,
} from '@/services/notifications'
import type { CreateNotificationInput } from '@/types/notifications'

// ─────────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────────

async function getAuthed() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('No autenticado')
  return { supabase, user }
}

// ─────────────────────────────────────────────────────────────
// Actions
// ─────────────────────────────────────────────────────────────

export async function markAsReadAction(id: string): Promise<void> {
  const { supabase, user } = await getAuthed()
  await markAsRead(supabase, user.id, id)
  revalidatePath('/notifications')
}

export async function markAllAsReadAction(): Promise<void> {
  const { supabase, user } = await getAuthed()
  await markAllAsRead(supabase, user.id)
  revalidatePath('/notifications')
}

export async function deleteNotificationAction(id: string): Promise<void> {
  const { supabase, user } = await getAuthed()
  await deleteNotification(supabase, user.id, id)
  revalidatePath('/notifications')
}

export async function deleteAllReadAction(): Promise<void> {
  const { supabase, user } = await getAuthed()
  await deleteAllRead(supabase, user.id)
  revalidatePath('/notifications')
}

export async function createNotificationAction(
  input: CreateNotificationInput,
): Promise<void> {
  const { supabase, user } = await getAuthed()
  await createNotification(supabase, user.id, input)
  revalidatePath('/notifications')
}
