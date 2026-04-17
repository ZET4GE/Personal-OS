export type UserPersona = 'student' | 'freelancer' | 'employee' | 'builder' | 'personal'
export type EnabledModule =
  | 'projects'
  | 'habits'
  | 'routines'
  | 'time'
  | 'jobs'
  | 'clients'
  | 'freelance'
  | 'notes'
  | 'cv'
  | 'blog'
  | 'analytics'

export interface UserOnboarding {
  id: string
  user_id: string
  focus: string | null
  persona: UserPersona | null
  primary_goal_id: string | null
  enabled_modules: EnabledModule[]
  completed: boolean
  completed_at: string | null
  created_at: string
  updated_at: string
}
