import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'

import { Navbar }         from '@/components/landing/Navbar'
import { Hero }           from '@/components/landing/Hero'
import { SocialProof }    from '@/components/landing/SocialProof'
import { FeaturesGrid }   from '@/components/landing/FeaturesGrid'
import { ProfilePreview } from '@/components/landing/ProfilePreview'
import { ProfileSearch }  from '@/components/landing/ProfileSearch'
import { PricingCard }    from '@/components/landing/PricingCard'
import { Footer }         from '@/components/landing/Footer'

// ─────────────────────────────────────────────────────────────
// SEO
// ─────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  title:       'Personal OS — Tu workspace personal y portafolio público',
  description: 'Organizá tu vida profesional, gestioná proyectos, trackeá hábitos y creá tu portafolio público. Gratis, para siempre.',
  keywords:    ['workspace personal', 'portfolio', 'job tracker', 'habitos', 'freelance', 'cv builder'],
  openGraph: {
    title:       'Personal OS — Tu workspace personal y portafolio público',
    description: 'Organizá tu vida profesional, gestioná proyectos, trackeá hábitos y creá tu portafolio público. Gratis.',
    type:        'website',
    siteName:    'Personal OS',
    locale:      'es_AR',
  },
  twitter: {
    card:        'summary_large_image',
    title:       'Personal OS',
    description: 'Tu workspace personal y portafolio público. Gratis.',
  },
}

// ─────────────────────────────────────────────────────────────
// Page — redirect if already logged in
// ─────────────────────────────────────────────────────────────

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ modal?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) redirect('/dashboard')

  const { modal } = await searchParams
  const initialModal = modal === 'login' || modal === 'signup' ? modal : undefined

  return (
    <div className="min-h-screen">
      <Navbar initialModal={initialModal} />

      <main>
        {/* 1. Hero */}
        <Hero />

        {/* 2. Social proof strip */}
        <SocialProof />

        {/* 3. Features grid */}
        <FeaturesGrid />

        {/* 4. Public profile preview */}
        <ProfilePreview />

        {/* 5. Profile search */}
        <ProfileSearch />

        {/* 6. Pricing */}
        <PricingCard />
      </main>

      <Footer />
    </div>
  )
}
