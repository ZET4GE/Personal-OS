import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import type { PendingPaymentItem } from '@/types/dashboard'

export async function PendingPayments({ payments }: { payments: PendingPaymentItem[] }) {
  const t = await getTranslations('dashboard')

  const totalPending = payments.reduce((acc, curr) => acc + curr.pending, 0)

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text">{t('pendingPayments')}</h3>
        {payments.length > 0 && (
          <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
            {t('total')}: ${totalPending.toLocaleString()}
          </span>
        )}
      </div>

      {payments.length > 0 ? (
        <div className="flex flex-col gap-3">
          {payments.map((item) => {
            const progress = (item.paidAmount / item.budget) * 100
            return (
              <Link
                key={item.id}
                href={`/freelance/${item.id}`}
                className="group flex flex-col gap-2 rounded-lg border border-border bg-surface-elevated p-3 transition-colors hover:border-border-bright"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-text group-hover:text-accent-500 transition-colors">
                      {item.title}
                    </span>
                    {item.clientName && (
                      <span className="text-xs text-muted">{item.clientName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 font-semibold text-text">
                    <span className="text-xs text-muted">{t('missing')}</span>
                    <span>${item.pending.toLocaleString()}</span>
                  </div>
                </div>

                <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-surface">
                  <div
                    className="h-full bg-emerald-500 transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </Link>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-1 flex-col items-center justify-center py-6 text-center">
          <p className="text-sm font-medium text-muted">{t('noPendingPayments')}</p>
        </div>
      )}
    </div>
  )
}
