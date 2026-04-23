import { createAdminClient } from '@/lib/supabase/admin'
import { UserPlanTable } from '@/components/admin/UserPlanTable'

type Plan = 'free' | 'pro' | 'team'

export default async function AdminUsersPage() {
  const admin = createAdminClient()

  const [
    { data: { users }, error: usersError },
    { data: subscriptions },
    { data: profiles },
  ] = await Promise.all([
    admin.auth.admin.listUsers({ perPage: 1000 }),
    admin.from('user_subscriptions').select('user_id, plan, status, created_at'),
    admin.from('profiles').select('id, username, full_name, avatar_url'),
  ])

  if (usersError) {
    return (
      <div>
        <h1 className="mb-6 text-xl font-semibold text-text">Gestión de usuarios</h1>
        <p className="text-sm text-red-500">Error al cargar usuarios: {usersError.message}</p>
      </div>
    )
  }

  const subMap     = new Map((subscriptions ?? []).map((s) => [s.user_id, s]))
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]))

  const tableUsers = users.map((u) => {
    const sub     = subMap.get(u.id)
    const profile = profileMap.get(u.id)
    return {
      id:                   u.id,
      email:                u.email ?? '(sin email)',
      fullName:             profile?.full_name ?? null,
      username:             profile?.username ?? null,
      avatarUrl:            profile?.avatar_url ?? null,
      plan:                 (sub?.plan ?? 'free') as Plan,
      planStatus:           sub?.status ?? null,
      subscriptionCreatedAt: sub?.created_at ?? null,
      lastSignIn:           u.last_sign_in_at ?? null,
      isAdmin:              u.app_metadata?.role === 'admin',
    }
  })

  const proCount  = tableUsers.filter((u) => u.plan === 'pro').length
  const teamCount = tableUsers.filter((u) => u.plan === 'team').length

  return (
    <div>
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-semibold text-text">Gestión de usuarios</h1>
          <p className="mt-1 text-sm text-muted">
            {tableUsers.length} usuarios · {proCount} Pro · {teamCount} Team
          </p>
        </div>
      </div>
      <UserPlanTable users={tableUsers} />
    </div>
  )
}
