import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { getUserOnboarding } from '@/services/onboarding'
import { getEnabledModules } from '@/lib/navigation/modules'

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
  const onboarding = await getUserOnboarding(supabase, user.id)
  const enabledModules = getEnabledModules(onboarding.data)

  return (
    <DashboardShell userEmail={userEmail} userName={userName} enabledModules={enabledModules}>
      {children}
    </DashboardShell>
  )
}
