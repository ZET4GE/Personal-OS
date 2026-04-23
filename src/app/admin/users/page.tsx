import { createAdminClient } from '@/lib/supabase/admin'
import { UserPlanTable } from '@/components/admin/UserPlanTable'

type Plan = 'free' | 'pro' | 'team'

type SubscriptionRow = {
  user_id: string
  plan: Plan
  created_at: string
}

export default async function AdminUsersPage() {
  const admin = createAdminClient()

  const {
    data: { users },
    error: usersError,
  } = await admin.auth.admin.listUsers({ perPage: 1000 })

  if (usersError) {
    return (
      <div>
        <h1 className="mb-6 text-xl font-semibold text-text">Gestión de usuarios</h1>
        <p className="text-sm text-red-500">Error al cargar usuarios: {usersError.message}</p>
      </div>
    )
  }

  const { data: subscriptions } = await admin
    .from('user_subscriptions')
    .select('user_id, plan, created_at')

  const subscriptionMap = new Map<string, SubscriptionRow>(
    (subscriptions ?? []).map((s) => [s.user_id, s as SubscriptionRow]),
  )

  const tableUsers = users.map((u) => {
    const sub = subscriptionMap.get(u.id)
    return {
      id: u.id,
      email: u.email ?? '(sin email)',
      plan: (sub?.plan ?? 'free') as Plan,
      subscriptionCreatedAt: sub?.created_at ?? null,
    }
  })

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-text">Gestión de usuarios</h1>
        <span className="text-sm text-muted">{tableUsers.length} usuarios</span>
      </div>
      <UserPlanTable users={tableUsers} />
    </div>
  )
}
