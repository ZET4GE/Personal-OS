import type { DashboardWidgetLayout } from '@/types/dashboard-config'

export const DEFAULT_DASHBOARD_WIDGETS: DashboardWidgetLayout[] = [
  { id: 'dashboard-goals', type: 'dashboard-goals', visible: true, size: 'lg', position: 0 },
  { id: 'stats-grid', type: 'stats-grid', visible: true, size: 'lg', position: 1 },
  { id: 'today-habits', type: 'today-habits', visible: true, size: 'md', position: 2 },
  { id: 'streak-widget', type: 'streak-widget', visible: true, size: 'sm', position: 3 },
  { id: 'upcoming-deadlines', type: 'upcoming-deadlines', visible: true, size: 'md', position: 4 },
  { id: 'pending-payments', type: 'pending-payments', visible: true, size: 'md', position: 5 },
  { id: 'google-calendar', type: 'google-calendar', visible: true, size: 'md', position: 6 },
  { id: 'github-activity', type: 'github-activity', visible: true, size: 'md', position: 7 },
  { id: 'goals-widget', type: 'goals-widget', visible: true, size: 'sm', position: 8 },
  { id: 'dashboard-insights', type: 'dashboard-insights', visible: true, size: 'sm', position: 9 },
  { id: 'recent-notes', type: 'recent-notes', visible: true, size: 'sm', position: 10 },
  { id: 'recent-activity', type: 'recent-activity', visible: true, size: 'lg', position: 11 },
]

export const ONBOARDING_WIDGET_OPTIONS = [
  { id: 'dashboard-goals', label: 'Metas' },
  { id: 'stats-grid', label: 'Estadísticas' },
  { id: 'today-habits', label: 'Hábitos de hoy' },
  { id: 'streak-widget', label: 'Racha' },
  { id: 'upcoming-deadlines', label: 'Deadlines' },
  { id: 'pending-payments', label: 'Pagos pendientes' },
  { id: 'goals-widget', label: 'Metas rápidas' },
  { id: 'dashboard-insights', label: 'Insights' },
  { id: 'recent-notes', label: 'Notas recientes' },
  { id: 'recent-activity', label: 'Actividad reciente' },
] as const
