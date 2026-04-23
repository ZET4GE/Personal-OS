'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import { assignPlan } from '@/app/admin/users/actions'

type Plan = 'free' | 'pro' | 'team'

type UserRow = {
  id: string
  email: string
  plan: Plan
  subscriptionCreatedAt: string | null
}

type Props = {
  users: UserRow[]
}

const PLAN_LABELS: Record<Plan, string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
}

const PLAN_BADGE: Record<Plan, string> = {
  free: 'bg-surface-2 text-muted',
  pro: 'bg-amber-500/10 text-amber-500',
  team: 'bg-blue-500/10 text-blue-500',
}

const PLANS: Plan[] = ['free', 'pro', 'team']

function PlanBadge({ plan }: { plan: Plan }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${PLAN_BADGE[plan]}`}
    >
      {PLAN_LABELS[plan]}
    </span>
  )
}

function PlanActions({
  userId,
  currentPlan,
}: {
  userId: string
  currentPlan: Plan
}) {
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
              : 'hover:bg-surface-2 text-muted hover:text-text',
            isPending && plan !== currentPlan ? 'opacity-50 cursor-wait' : '',
          ].join(' ')}
        >
          {PLAN_LABELS[plan]}
        </button>
      ))}
    </div>
  )
}

export function UserPlanTable({ users }: Props) {
  if (users.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]">
        <p className="text-center text-sm text-muted">No hay usuarios registrados.</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-surface shadow-[var(--shadow-card)] overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-2">
            <th className="px-5 py-3 text-left font-medium text-muted">Email</th>
            <th className="px-5 py-3 text-left font-medium text-muted">Plan actual</th>
            <th className="px-5 py-3 text-left font-medium text-muted">Fecha de suscripción</th>
            <th className="px-5 py-3 text-left font-medium text-muted">Acciones</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-surface-2/50 transition-colors">
              <td className="px-5 py-3 text-text">{user.email}</td>
              <td className="px-5 py-3">
                <PlanBadge plan={user.plan} />
              </td>
              <td className="px-5 py-3 text-muted">
                {user.subscriptionCreatedAt
                  ? new Date(user.subscriptionCreatedAt).toLocaleDateString('es-AR', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })
                  : '—'}
              </td>
              <td className="px-5 py-3">
                <PlanActions userId={user.id} currentPlan={user.plan} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
