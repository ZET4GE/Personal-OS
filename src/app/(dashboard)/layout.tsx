import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const userEmail = user.email ?? ''
  const userName = user.user_metadata?.full_name as string | undefined

  return (
    <DashboardShell userEmail={userEmail} userName={userName}>
      {children}
    </DashboardShell>
  )
}
