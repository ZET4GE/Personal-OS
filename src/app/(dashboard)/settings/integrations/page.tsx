import type { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getIntegrations } from '@/services/integrations'
import { IntegrationCard } from '@/components/integrations/IntegrationCard'
import { SettingsNav } from '@/components/settings/SettingsNav'
import type { Provider } from '@/types/integrations'

export const metadata: Metadata = { title: 'Integraciones' }

const INTEGRATION_PROVIDERS: Provider[] = ['google', 'github']

export default async function IntegrationsPage() {
  const t        = await getTranslations('integrations')
  const tS       = await getTranslations('settings')
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const integrations = user
    ? await getIntegrations(supabase, user.id)
    : []

  const byProvider = Object.fromEntries(
    integrations.map((i) => [i.provider, i]),
  )

  const descriptions: Record<Provider, string> = {
    google: t('google.desc'),
    github: t('github.desc'),
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-lg font-semibold">{tS('title')}</h2>
      </div>

      <SettingsNav />

      <p className="text-sm text-muted">{t('desc')}</p>

      <div className="flex flex-col gap-4">
        {INTEGRATION_PROVIDERS.map((provider) => (
          <IntegrationCard
            key={provider}
            provider={provider}
            integration={byProvider[provider] ?? null}
            description={descriptions[provider]}
          />
        ))}
      </div>
    </div>
  )
}
