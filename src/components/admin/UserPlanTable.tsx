'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Shield } from 'lucide-react'
import { assignPlan } from '@/app/admin/users/actions'

type Plan = 'free' | 'pro' | 'team'

type UserRow = {
  id:                    string
  email:                 string
  fullName:              string | null
  username:              string | null
  avatarUrl:             string | null
  plan:                  Plan
  planStatus:            string | null
  subscriptionCreatedAt: string | null
  lastSignIn:            string | null
  isAdmin:               boolean
}

type Props = { users: UserRow[] }

const PLAN_LABELS: Record<Plan, string> = { free: 'Free', pro: 'Pro', team: 'Team' }
const PLAN_BADGE: Record<Plan, string> = {
  free: 'bg-surface-2 text-muted',
  pro:  'bg-amber-500/10 text-amber-500',
  team: 'bg-blue-500/10 text-blue-500',
}
const PLANS: Plan[] = ['free', 'pro', 'team']

function fmt(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
}

function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_BADGE[plan]}`}>
      {PLAN_LABELS[plan]}
    </span>
  )
}

function PlanActions({ userId, currentPlan }: { userId: string; currentPlan: Plan }) {
  const [isPending, startTransition] = useTransition()

  function handleAssign(plan: Plan) {
    if (plan === currentPlan) return
    startTransition(async () => {
      const result = await assignPlan(userId, plan)
      if (result.success) {
        toast.success(`Plan actualizado a ${PLAN_LABELS[plan]}`)
      } else {
        toast.error(result.error ?? 'Error al actualizar el plan')
      }
    })
  }

  return (
    <div className="flex items-center gap-1">
      {PLANS.map((plan) => (
        <button
          key={plan}
          onClick={() => handleAssign(plan)}
          disabled={isPending || plan === currentPlan}
          className={[
            'rounded-lg px-3 py-1 text-xs font-medium transition-colors',
            plan === currentPlan
              ? 'cursor-default opacity-40'
              : 'text-muted hover:bg-surface-2 hover:text-text',
            isPending && plan !== currentPlan ? 'cursor-wait opacity-50' : '',
          ].join(' ')}
        >
          {PLAN_LABELS[plan]}
        </button>
      ))}
    </div>
  )
}

export function UserPlanTable({ users }: Props) {
  const [query, setQuery] = useState('')

  const filtered = query.trim()
    ? users.filter((u) => {
        const q = query.toLowerCase()
        return (
          u.email.toLowerCase().includes(q) ||
          (u.fullName?.toLowerCase().includes(q) ?? false) ||
          (u.username?.toLowerCase().includes(q) ?? false)
        )
      })
    : users

  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5">
        <p className="text-center text-sm text-muted">No hay usuarios registrados.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar por email, nombre o username…"
        className="w-full max-w-sm rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-text outline-none transition-colors focus:border-accent-600 placeholder:text-muted"
      />

      <div className="overflow-hidden rounded-xl border border-border bg-surface">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              <th className="px-5 py-3 text-left font-medium text-muted">Usuario</th>
              <th className="px-5 py-3 text-left font-medium text-muted">Plan</th>
              <th className="px-5 py-3 text-left font-medium text-muted hidden md:table-cell">Suscripción</th>
              <th className="px-5 py-3 text-left font-medium text-muted hidden lg:table-cell">Último acceso</th>
              <th className="px-5 py-3 text-left font-medium text-muted">Cambiar plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filtered.map((user) => (
              <tr key={user.id} className="transition-colors hover:bg-surface-2/50">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.avatarUrl} alt="" className="h-7 w-7 rounded-full shrink-0 object-cover" />
                    ) : (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs font-medium text-muted">
                        {(user.fullName ?? user.email)[0].toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="truncate text-sm font-medium text-text">
                          {user.fullName ?? user.email}
                        </span>
                        {user.isAdmin && (
                          <span title="Admin">
                            <Shield size={11} className="shrink-0 text-accent-600" />
                          </span>
                        )}
                      </div>
                      <div className="truncate text-xs text-muted">
                        {user.fullName ? user.email : null}
                        {user.username ? ` · @${user.username}` : null}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <PlanBadge plan={user.plan} />
                </td>
                <td className="px-5 py-3 text-muted hidden md:table-cell">
                  {fmt(user.subscriptionCreatedAt)}
                </td>
                <td className="px-5 py-3 text-muted hidden lg:table-cell">
                  {fmt(user.lastSignIn)}
                </td>
                <td className="px-5 py-3">
                  <PlanActions userId={user.id} currentPlan={user.plan} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <p className="px-5 py-6 text-center text-sm text-muted">
            Sin resultados para &ldquo;{query}&rdquo;
          </p>
        )}
      </div>
    </div>
  )
}
