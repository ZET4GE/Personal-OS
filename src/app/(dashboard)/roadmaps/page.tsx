import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getLearningRoadmaps } from '@/services/learning-roadmaps'
import { RoadmapsClient } from '@/components/roadmaps/RoadmapsClient'

export const metadata: Metadata = { title: 'Roadmaps' }

export default async function RoadmapsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [result, goalsResult] = await Promise.all([
    getLearningRoadmaps(supabase, user.id),
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
  ])

  return <RoadmapsClient roadmaps={result.data ?? []} availableGoals={goalsResult.data ?? []} />
}
