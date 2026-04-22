import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getNotificationsResult } from '@/services/notifications'

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json([], { status: 401 })
  }

  const result = await getNotificationsResult(supabase, user.id, false, 20)
  if (result.error) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json(result.data)
}
