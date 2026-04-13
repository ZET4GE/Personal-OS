// ─────────────────────────────────────────────────────────────
// Enums
// ─────────────────────────────────────────────────────────────

export const PROJECT_STATUSES_CLIENT = [
  'proposal', 'active', 'paused', 'completed', 'cancelled',
] as const
export type ProjectStatusClient = (typeof PROJECT_STATUSES_CLIENT)[number]

export const PROJECT_STATUS_CLIENT_LABELS: Record<ProjectStatusClient, string> = {
  proposal:  'Propuesta',
  active:    'Activo',
  paused:    'Pausado',
  completed: 'Completado',
  cancelled: 'Cancelado',
}

export const PROJECT_STATUS_CLIENT_STYLES: Record<ProjectStatusClient, string> = {
  proposal:  'bg-slate-100  text-slate-600  dark:bg-slate-800  dark:text-slate-300',
  active:    'bg-blue-100   text-blue-700   dark:bg-blue-900/40  dark:text-blue-300',
  paused:    'bg-amber-100  text-amber-700  dark:bg-amber-900/40 dark:text-amber-300',
  completed: 'bg-green-100  text-green-700  dark:bg-green-900/40 dark:text-green-300',
  cancelled: 'bg-red-100    text-red-600    dark:bg-red-900/40   dark:text-red-300',
}

export const PRIORITIES = ['low', 'medium', 'high'] as const
export type Priority = (typeof PRIORITIES)[number]

export const PRIORITY_LABELS: Record<Priority, string> = {
  low:    'Baja',
  medium: 'Media',
  high:   'Alta',
}

export const PRIORITY_STYLES: Record<Priority, string> = {
  low:    'text-slate-400',
  medium: 'text-amber-500',
  high:   'text-red-500',
}

export const CURRENCIES = ['ARS', 'USD', 'EUR'] as const
export type Currency = (typeof CURRENCIES)[number]

export const PAYMENT_METHODS = ['transfer', 'cash', 'crypto', 'paypal', 'other'] as const
export type PaymentMethod = (typeof PAYMENT_METHODS)[number]

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  transfer: 'Transferencia',
  cash:     'Efectivo',
  crypto:   'Crypto',
  paypal:   'PayPal',
  other:    'Otro',
}

// ─────────────────────────────────────────────────────────────
// Core entities (espejo de tablas SQL)
// ─────────────────────────────────────────────────────────────

export interface Client {
  id:         string
  user_id:    string
  name:       string
  email:      string | null
  company:    string | null
  phone:      string | null
  notes:      string | null
  created_at: string
}

export interface ClientProject {
  id:           string
  user_id:      string
  client_id:    string | null
  title:        string
  description:  string | null
  status:       ProjectStatusClient
  priority:     Priority
  budget:       number | null
  currency:     Currency
  paid_amount:  number
  start_date:   string | null   // 'YYYY-MM-DD'
  due_date:     string | null
  completed_at: string | null
  created_at:   string
  updated_at:   string
  // joined
  client?:      Pick<Client, 'id' | 'name' | 'company'> | null
}

export interface ProjectPayment {
  id:           string
  project_id:   string
  user_id:      string
  amount:       number
  currency:     Currency
  payment_date: string   // 'YYYY-MM-DD'
  method:       PaymentMethod | null
  notes:        string | null
  created_at:   string
}

// ─────────────────────────────────────────────────────────────
// Action result
// ─────────────────────────────────────────────────────────────

export type ClientActionResult =
  | { error: string }
  | { ok: true }
  | { client: Client; error?: never }

export type ClientProjectActionResult =
  | { error: string }
  | { ok: true }
  | { project: ClientProject; error?: never }

export type PaymentActionResult =
  | { error: string }
  | { ok: true }
  | { payment: ProjectPayment; error?: never }

// ─────────────────────────────────────────────────────────────
// Stats
// ─────────────────────────────────────────────────────────────

export interface FreelanceStats {
  activeProjects:   number
  billedThisMonth:  number    // USD equivalent o suma por divisa
  pendingToCollect: number    // budget - paid_amount para proyectos activos
  currency:         Currency  // divisa dominante del usuario
}
