import { GitCommit, ExternalLink } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getIntegration } from '@/services/integrations'
import { getRecentCommits } from '@/services/github'

export async function GitHubActivityWidget({ userId }: { userId: string }) {
  const t      = await getTranslations('integrations')
  const locale = await getLocale()
  const supabase = await createClient()

  const integration = await getIntegration(supabase, userId, 'github')
  if (!integration) return null

  const commits = await getRecentCommits(integration, 8).catch(() => [])

  const login = integration.metadata?.login as string | undefined

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  function relTime(iso: string): string {
    const diffMs  = Date.now() - new Date(iso).getTime()
    const seconds = Math.floor(diffMs / 1000)
    if (seconds < 3600)  return rtf.format(-Math.floor(seconds / 60), 'minutes')
    if (seconds < 86400) return rtf.format(-Math.floor(seconds / 3600), 'hours')
    return rtf.format(-Math.floor(seconds / 86400), 'days')
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🐙</span>
          <h3 className="text-sm font-semibold text-text">{t('githubWidget')}</h3>
        </div>
        {login && (
          <a
            href={`https://github.com/${login}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-text"
          >
            @{login} <ExternalLink size={11} />
          </a>
        )}
      </div>

      {commits.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">{t('noCommits')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {commits.map((c) => (
            <a
              key={c.sha}
              href={c.html_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-lg border border-border bg-surface-elevated px-3 py-2.5 transition-colors hover:border-border-bright"
            >
              <GitCommit size={14} className="mt-0.5 shrink-0 text-muted" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text group-hover:text-accent-500 transition-colors">
                  {c.message}
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  <span className="font-mono">{c.sha}</span>
                  {' · '}
                  <span>{c.repo.split('/')[1] ?? c.repo}</span>
                  {' · '}
                  <span>{relTime(c.date)}</span>
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
