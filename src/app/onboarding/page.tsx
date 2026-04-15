import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getGoals } from '@/services/goals'
import { getUserOnboarding } from '@/services/onboarding'
import { OnboardingWizard } from '@/components/onboarding/OnboardingWizard'

export default async function OnboardingPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [goalsResult, onboardingResult] = await Promise.all([
    getGoals(supabase, user.id),
    getUserOnboarding(supabase, user.id),
  ])

  if ((goalsResult.data?.length ?? 0) > 0 || onboardingResult.data?.completed) {
    redirect('/dashboard')
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <OnboardingWizard />
    </main>
  )
}
