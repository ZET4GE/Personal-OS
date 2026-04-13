import type { Metadata } from 'next'
import { AuthForm } from '@/components/auth/AuthForm'
import { loginAction } from '../actions/auth.actions'

export const metadata: Metadata = { title: 'Iniciar sesión' }

export default function LoginPage() {
  return <AuthForm mode="login" action={loginAction} />
}
