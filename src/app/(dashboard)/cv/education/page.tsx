import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getEducation } from '@/services/cv'
import { EducationClient } from '@/components/cv/EducationClient'

export const metadata: Metadata = { title: 'Educación' }

export default async function EducationPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const { data: items } = await getEducation(supabase, user.id)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/cv"
          className="flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ArrowLeft size={15} />
          CV
        </Link>
        <span className="text-muted">/</span>
        <h2 className="text-lg font-semibold">Educación</h2>
      </div>
      <EducationClient items={items ?? []} />
    </div>
  )
}
