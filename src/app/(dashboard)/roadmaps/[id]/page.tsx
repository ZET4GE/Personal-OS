import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getLearningRoadmapDetail } from '@/services/learning-roadmaps'
import { LearningRoadmapBoard } from '@/components/roadmaps/LearningRoadmapBoard'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return { title: 'Roadmap' }

  const result = await getLearningRoadmapDetail(supabase, id, user.id)
  return { title: result.data?.roadmap.title ?? 'Roadmap' }
}

export default async function LearningRoadmapPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const result = await getLearningRoadmapDetail(supabase, id, user.id)
  if (!result.data) notFound()

  return (
    <div className="mx-auto max-w-6xl animate-fade-in space-y-6 pb-8">
      <LearningRoadmapBoard
        roadmap={result.data.roadmap}
        initialNodes={result.data.nodes}
        availableGoals={result.data.availableGoals}
      />
    </div>
  )
}
