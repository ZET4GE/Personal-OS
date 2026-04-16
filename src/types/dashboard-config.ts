export type DashboardWidgetSize = 'sm' | 'md' | 'lg' | 'xl'

export interface DashboardWidgetLayout {
  id: string
  type: string
  visible: boolean
  size: DashboardWidgetSize
  position: number
}
