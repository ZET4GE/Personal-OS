import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNotifications } from '@/services/notifications'

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json([], { status: 401 })
  }

  const notifications = await getNotifications(supabase, user.id, false, 20)
  return NextResponse.json(notifications)
}
