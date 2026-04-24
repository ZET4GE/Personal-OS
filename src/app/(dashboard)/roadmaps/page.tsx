import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getLearningRoadmaps, getLearningRoadmapNodeSummary } from '@/services/learning-roadmaps'
import { getBillingStatus } from '@/services/billing'
import { RoadmapsClient } from '@/components/roadmaps/RoadmapsClient'

export const metadata: Metadata = { title: 'Roadmaps' }

export default async function RoadmapsPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [roadmapsResult, goalsResult, billingResult] = await Promise.all([
    getLearningRoadmaps(supabase, user.id),
    supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false }),
    getBillingStatus(supabase, user.id),
  ])

  const roadmaps = roadmapsResult.data ?? []
  const nodeSummaryResult = await getLearningRoadmapNodeSummary(
    supabase,
    roadmaps.map((r) => r.id),
  )

  return (
    <RoadmapsClient
      roadmaps={roadmaps}
      availableGoals={goalsResult.data ?? []}
      nodeSummary={nodeSummaryResult.data ?? {}}
      plan={billingResult.data?.plan ?? 'free'}
    />
  )
}
