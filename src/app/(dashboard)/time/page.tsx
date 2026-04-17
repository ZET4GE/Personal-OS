import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { TimeStatsDashboard } from '@/components/time/TimeStatsDashboard'

export const metadata: Metadata = { title: 'Tiempo' }

export default async function TimePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return <TimeStatsDashboard userId={user.id} />
}
