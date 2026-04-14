import Link from 'next/link'
import { Calendar, ExternalLink, Clock } from 'lucide-react'
import { getTranslations, getLocale } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getIntegration } from '@/services/integrations'
import { getUpcomingEvents } from '@/services/google-calendar'

// ─────────────────────────────────────────────────────────────
// Calendar color map (Google colorId → Tailwind)
// ─────────────────────────────────────────────────────────────

const COLOR_MAP: Record<string, string> = {
  '1': 'bg-blue-400',   '2': 'bg-green-400',  '3': 'bg-purple-400',
  '4': 'bg-red-400',    '5': 'bg-yellow-400', '6': 'bg-orange-400',
  '7': 'bg-teal-400',   '8': 'bg-slate-400',  '9': 'bg-blue-600',
  '10': 'bg-green-600', '11': 'bg-red-600',
}

export async function GoogleCalendarWidget({ userId }: { userId: string }) {
  const t      = await getTranslations('integrations')
  const locale = await getLocale()
  const supabase = await createClient()

  const integration = await getIntegration(supabase, userId, 'google')
  if (!integration) return null

  const events = await getUpcomingEvents(supabase, integration, 6).catch(() => [])

  const formatEventTime = (start: string, allDay: boolean) => {
    const d = new Date(start)
    if (allDay) {
      return new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short' }).format(d)
    }
    return new Intl.DateTimeFormat(locale, {
      weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    }).format(d)
  }

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-blue-500" />
          <h3 className="text-sm font-semibold text-text">{t('calendarWidget')}</h3>
        </div>
        <a
          href="https://calendar.google.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-text"
        >
          <ExternalLink size={12} />
        </a>
      </div>

      {events.length === 0 ? (
        <p className="py-4 text-center text-sm text-muted">{t('noEvents')}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {events.map((event) => (
            <a
              key={event.id}
              href={event.htmlLink}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-start gap-3 rounded-lg border border-border bg-surface-elevated px-3 py-2.5 transition-colors hover:border-border-bright"
            >
              <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${COLOR_MAP[event.colorId ?? ''] ?? 'bg-blue-400'}`} />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-text group-hover:text-accent-500 transition-colors">
                  {event.summary}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-xs text-muted">
                  <Clock size={10} />
                  <span className="capitalize">{formatEventTime(event.start, event.allDay)}</span>
                </p>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
