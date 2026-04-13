'use server'

import { redirect } from 'next/navigation'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { AuthActionResult } from '@/types/auth'

// ── Schemas de validación ──────────────────────────────────────────────────

const LoginSchema = z.object({
  email: z.email({ error: 'Email inválido' }),
  password: z.string().min(6, { error: 'Mínimo 6 caracteres' }),
})

const SignupSchema = z.object({
  fullName: z.string().min(2, { error: 'Mínimo 2 caracteres' }).trim(),
  email: z.email({ error: 'Email inválido' }),
  password: z
    .string()
    .min(8, { error: 'Mínimo 8 caracteres' })
    .regex(/[A-Z]/, { error: 'Al menos una mayúscula' })
    .regex(/[0-9]/, { error: 'Al menos un número' }),
})

// ── Actions ────────────────────────────────────────────────────────────────

export async function loginAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const raw = {
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = LoginSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos'
    return { error: firstError }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword(parsed.data)

  if (error) return { error: error.message }

  redirect('/dashboard')
}

export async function signupAction(
  _prevState: AuthActionResult | null,
  formData: FormData,
): Promise<AuthActionResult> {
  const raw = {
    fullName: formData.get('fullName'),
    email: formData.get('email'),
    password: formData.get('password'),
  }

  const parsed = SignupSchema.safeParse(raw)
  if (!parsed.success) {
    const firstError = parsed.error.issues[0]?.message ?? 'Datos inválidos'
    return { error: firstError }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.fullName },
    },
  })

  if (error) return { error: error.message }

  // Supabase envía un email de verificación por defecto
  return { success: true }
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
