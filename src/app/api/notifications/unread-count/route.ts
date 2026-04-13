import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getUnreadCount } from '@/services/notifications'

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ count: 0 }, { status: 401 })
  }

  const count = await getUnreadCount(supabase, user.id)
  return NextResponse.json({ count })
}
