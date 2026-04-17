import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/dashboard/DashboardShell'
import { getUserOnboarding } from '@/services/onboarding'
import { getMyProfile } from '@/services/profiles'
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
  const [onboarding, profile] = await Promise.all([
    getUserOnboarding(supabase, user.id),
    getMyProfile(supabase),
  ])
  const enabledModules = getEnabledModules(onboarding.data)

  return (
    <DashboardShell
      userEmail={userEmail}
      userName={profile.data?.full_name ?? userName}
      userAvatarUrl={profile.data?.avatar_url ?? null}
      enabledModules={enabledModules}
    >
      {children}
    </DashboardShell>
  )
}
