export const BILLING_PLANS = ['free', 'pro', 'team'] as const
export type BillingPlan = (typeof BILLING_PLANS)[number]

export const BILLING_STATUSES = ['trialing', 'active', 'past_due', 'cancelled'] as const
export type BillingStatusValue = (typeof BILLING_STATUSES)[number]

export interface BillingStatus {
  plan: BillingPlan
  status: BillingStatusValue
  current_period_end: string | null
}

export interface BillingUsageLimit {
  resource: string
  used_count: number
  limit_count: number | null
  is_limited: boolean
}

export const BILLING_PLAN_LABELS: Record<BillingPlan, string> = {
  free: 'Free',
  pro: 'Pro',
  team: 'Team',
}

export const BILLING_STATUS_LABELS: Record<BillingStatusValue, string> = {
  trialing: 'Prueba',
  active: 'Activo',
  past_due: 'Pago pendiente',
  cancelled: 'Cancelado',
}

export const BILLING_RESOURCE_LABELS: Record<string, string> = {
  goals: 'Metas',
  projects: 'Proyectos',
  roadmaps: 'Roadmaps',
  notes: 'Notas',
  time_entries_month: 'Sesiones de tiempo / mes',
}
