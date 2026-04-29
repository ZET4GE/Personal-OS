import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getCVHighlights } from '@/services/cv'
import { CVHighlightsClient } from '@/components/cv/CVHighlightsClient'

export const metadata: Metadata = { title: 'Destacados CV' }

export default async function CVHighlightsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: items } = await getCVHighlights(supabase, user.id)

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
        <h2 className="text-lg font-semibold">Destacados</h2>
      </div>

      <p className="text-sm text-muted">
        Hasta 6 tarjetas de logros o métricas que aparecen en la parte superior de tu CV público.
        Usá emojis y frases cortas para impactar al reclutador de entrada.
      </p>

      <CVHighlightsClient items={items ?? []} />
    </div>
  )
}
