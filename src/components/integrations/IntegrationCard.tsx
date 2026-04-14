'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { CheckCircle2, Circle, ExternalLink, Loader2 } from 'lucide-react'
import { disconnectIntegrationAction } from '@/app/(dashboard)/settings/integrations/actions'
import type { Integration, Provider } from '@/types/integrations'

// ─────────────────────────────────────────────────────────────
// Provider visuals
// ─────────────────────────────────────────────────────────────

const PROVIDER_META: Record<Provider, {
  name:       string
  icon:       string   // emoji
  authUrl:    string
  color:      string
}> = {
  google: {
    name:    'Google Calendar',
    icon:    '📅',
    authUrl: '/api/integrations/google/auth',
    color:   'text-blue-500',
  },
  github: {
    name:    'GitHub',
    icon:    '🐙',
    authUrl: '/api/integrations/github/auth',
    color:   'text-slate-700 dark:text-slate-300',
  },
}

interface Props {
  provider:    Provider
  integration: Integration | null
  description: string
}

export function IntegrationCard({ provider, integration, description }: Props) {
  const t = useTranslations('integrations')
  const meta = PROVIDER_META[provider]
  const connected = integration !== null

  const [pending, start] = useTransition()

  function handleDisconnect() {
    start(async () => {
      await disconnectIntegrationAction(provider)
    })
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{meta.icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-text">{meta.name}</h3>
            <p className="text-xs text-muted">{description}</p>
          </div>
        </div>

        {/* Status badge */}
        <span className={`flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
          connected
            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
            : 'bg-surface-2 text-muted'
        }`}>
          {connected
            ? <><CheckCircle2 size={12} /> {t('connected')}</>
            : <><Circle size={12} /> {t('notConnected')}</>
          }
        </span>
      </div>

      {/* Connected info */}
      {connected && integration && (
        <div className="rounded-lg border border-border bg-surface-2 px-3 py-2 text-xs text-muted space-y-0.5">
          {integration.provider_email && (
            <p>{integration.provider_email}</p>
          )}
          {!integration.provider_email && typeof integration.metadata?.login === 'string' && (
            <p>@{integration.metadata.login}</p>
          )}
          <p>{t('connectedAt', { date: new Intl.DateTimeFormat('es', { dateStyle: 'medium' }).format(new Date(integration.connected_at)) })}</p>
        </div>
      )}

      {/* Action button */}
      <div className="flex gap-2">
        {connected ? (
          <button
            onClick={handleDisconnect}
            disabled={pending}
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:border-red-400 hover:text-red-500 disabled:opacity-50"
          >
            {pending ? <Loader2 size={12} className="animate-spin" /> : null}
            {t('disconnect')}
          </button>
        ) : (
          <a
            href={meta.authUrl}
            className={`flex items-center gap-1.5 rounded-lg bg-accent-600 px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90`}
          >
            <ExternalLink size={12} /> {t('connect')}
          </a>
        )}
      </div>
    </div>
  )
}
