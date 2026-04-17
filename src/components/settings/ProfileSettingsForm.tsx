'use client'

import { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { Save, Eye, CheckCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { updateProfileAction } from '@/app/(dashboard)/settings/actions'
import { CV_AVAILABILITY_LABELS, CV_AVAILABILITY_OPTIONS } from '@/types/profile'
import type { Profile } from '@/types/profile'

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

interface ProfileSettingsFormProps {
  profile: Profile | null
}

export function ProfileSettingsForm({ profile }: ProfileSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null)

  // Toasts — disparan cuando el estado cambia tras un submit
  useEffect(() => {
    if (state?.ok)    toast.success('Perfil guardado')
    else if (state?.error) toast.error(state.error)
  }, [state])

  // Si el save fue exitoso, usar el perfil actualizado como fuente de verdad
  const current = state?.ok ? state.profile : profile

  return (
    <div className="space-y-8">
      {/* Preview link */}
      {current?.username && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Perfil público</p>
            <p className="text-xs text-muted">
              Así te ven los demás cuando visitan tu perfil.
            </p>
          </div>
          <Link
            href={`/${current.username}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Eye size={13} /> Ver perfil
          </Link>
        </div>
      )}

      {/* Form */}
      <form action={formAction} className="space-y-5">
        {/* Success message */}
        {state?.ok && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 size={16} />
            Perfil actualizado correctamente.
          </div>
        )}

        {/* Error message */}
        {state?.error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {state.error}
          </div>
        )}

        {/* ─── Sección: Identidad ─────────────────────── */}
        <Section title="Identidad">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Username *" htmlFor="username"
              hint="Letras minúsculas, números y guiones. URL: /tu-username">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-sm text-muted">
                  /
                </span>
                <input id="username" name="username" type="text" required
                  defaultValue={current?.username ?? ''}
                  placeholder="tu-username"
                  className={`${inputCls} pl-6`} />
              </div>
            </Field>

            <Field label="Nombre completo" htmlFor="full_name">
              <input id="full_name" name="full_name" type="text"
                defaultValue={current?.full_name ?? ''}
                placeholder="Tu nombre"
                className={inputCls} />
            </Field>
          </div>

          <Field label="Titulo profesional" htmlFor="headline">
            <input id="headline" name="headline" type="text"
              defaultValue={current?.headline ?? ''}
              placeholder="Frontend developer, Sysadmin, Estudiante DevOps..."
              className={inputCls} />
          </Field>

          <Field label="Bio" htmlFor="bio" hint="Máximo 500 caracteres.">
            <textarea id="bio" name="bio" rows={3}
              defaultValue={current?.bio ?? ''}
              placeholder="Cuéntanos sobre ti..."
              className={`${inputCls} resize-none`} />
          </Field>

          <Field label="Ubicación" htmlFor="location">
            <input id="location" name="location" type="text"
              defaultValue={current?.location ?? ''}
              placeholder="Ciudad, País"
              className={inputCls} />
          </Field>
        </Section>

        {/* ─── Sección: Links ─────────────────────────── */}
        <Section title="Datos para CV">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Telefono" htmlFor="phone">
              <input id="phone" name="phone" type="tel"
                defaultValue={current?.phone ?? ''}
                placeholder="+54 9 ..."
                className={inputCls} />
            </Field>

            <Field label="Fecha de nacimiento" htmlFor="birth_date">
              <input id="birth_date" name="birth_date" type="date"
                defaultValue={current?.birth_date?.slice(0, 10) ?? ''}
                className={inputCls} />
            </Field>

            <Field label="Disponibilidad" htmlFor="availability">
              <select id="availability" name="availability"
                defaultValue={current?.availability ?? ''}
                className={inputCls}>
                <option value="">Sin especificar</option>
                {CV_AVAILABILITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {CV_AVAILABILITY_LABELS[option]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Links">
          <Field label="Sitio web" htmlFor="website">
            <input id="website" name="website" type="url"
              defaultValue={current?.website ?? ''}
              placeholder="https://tu-sitio.com"
              className={inputCls} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="GitHub" htmlFor="github_url">
              <input id="github_url" name="github_url" type="url"
                defaultValue={current?.github_url ?? ''}
                placeholder="https://github.com/..."
                className={inputCls} />
            </Field>
            <Field label="LinkedIn" htmlFor="linkedin_url">
              <input id="linkedin_url" name="linkedin_url" type="url"
                defaultValue={current?.linkedin_url ?? ''}
                placeholder="https://linkedin.com/in/..."
                className={inputCls} />
            </Field>
            <Field label="Twitter / X" htmlFor="twitter_url">
              <input id="twitter_url" name="twitter_url" type="url"
                defaultValue={current?.twitter_url ?? ''}
                placeholder="https://x.com/..."
                className={inputCls} />
            </Field>
          </div>
        </Section>

        {/* ─── Sección: Visibilidad ───────────────────── */}
        <Section title="Visibilidad">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_public"
              value="true"
              defaultChecked={current?.is_public ?? true}
              className="mt-0.5 h-4 w-4 rounded accent-accent-600"
            />
            <div>
              <p className="text-sm font-medium">Perfil público</p>
              <p className="text-xs text-muted">
                Cualquiera podrá ver tu perfil en /{current?.username ?? 'tu-username'}.
                Si lo desmarcas, sólo tú podrás verlo.
              </p>
            </div>
          </label>
        </Section>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-accent-600 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Save size={15} />
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-xl border border-border p-5">
      <legend className="-ml-1 px-1 text-xs font-semibold uppercase tracking-widest text-muted">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface outline-none ' +
  'transition-colors focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 ' +
  'dark:bg-slate-900 placeholder:text-slate-400'
