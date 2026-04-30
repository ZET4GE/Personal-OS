import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getTechStack } from '@/services/tech-stack'
import { TechStackManager } from '@/components/cv/TechStackManager'

export const metadata: Metadata = { title: 'Stack Tecnológico' }

export default async function TechStackPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: items } = await getTechStack(supabase, user.id)

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">Stack Tecnológico</h2>
        <p className="text-sm text-muted">
          Agregá las tecnologías que dominás. Se mostrarán en tu CV público con íconos.
        </p>
      </div>

      <TechStackManager items={items ?? []} />
    </div>
  )
}
