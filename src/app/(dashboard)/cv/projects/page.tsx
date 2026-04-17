import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCVProjects } from '@/services/cv'
import { CVProjectsClient } from '@/components/cv/CVProjectsClient'

export const metadata: Metadata = { title: 'Proyectos de CV' }

export default async function CVProjectsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data: items } = await getCVProjects(supabase, user!.id)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/cv" className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground">
          <ArrowLeft size={15} />
          CV
        </Link>
        <span className="text-muted">/</span>
        <h2 className="text-lg font-semibold">Proyectos</h2>
      </div>
      <CVProjectsClient items={items ?? []} />
    </div>
  )
}
