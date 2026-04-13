import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/AuthForm'
import { signupAction } from '../actions/auth.actions'

export const metadata: Metadata = { title: 'Crear cuenta' }

export default function SignupPage() {
  return <AuthForm mode="signup" action={signupAction} />
}
