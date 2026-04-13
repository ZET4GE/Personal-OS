import type { User, Session } from '@supabase/supabase-js'

export type { User, Session }

export type AuthProvider = 'email' | 'github' | 'google'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface SignupCredentials extends LoginCredentials {
  fullName: string
}

// Shape que devuelven las Server Actions de auth
export type AuthActionResult =
  | { error: string; success?: never }
  | { success: true; error?: never }
