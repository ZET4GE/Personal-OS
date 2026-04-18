import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getBillingStatus, getBillingUsageLimits } from '@/services/billing'
import { SettingsNav } from '@/components/settings/SettingsNav'
import { BillingSettings } from '@/components/settings/BillingSettings'

export const metadata: Metadata = { title: 'Billing' }

export default async function BillingPage() {
  const t = await getTranslations('settings')
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [statusResult, usageResult] = await Promise.all([
    getBillingStatus(supabase, user.id),
    getBillingUsageLimits(supabase, user.id),
  ])
  const billingError = statusResult.error ?? usageResult.error
  const billingStatus = statusResult.data ?? {
    plan: 'free' as const,
    status: 'active' as const,
    current_period_end: null,
  }
  const usage = usageResult.data ?? []

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{t('title')}</h2>
      </div>

      <SettingsNav />

      <div>
        <h3 className="text-xl font-semibold text-text">Planes y limites</h3>
        <p className="mt-1 text-sm text-muted">
          Control de uso, plan actual y base para conectar pagos mas adelante.
        </p>
      </div>

      {billingError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
          No se pudo cargar billing. Ejecuta la migracion 051_monetization_foundation.sql.
        </div>
      ) : (
        <BillingSettings status={billingStatus} usage={usage} />
      )}
    </div>
  )
}
