'use client'

import { useState, useTransition } from 'react'
import { Check } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { getPersonaDefaults, MODULE_OPTIONS, PERSONA_OPTIONS } from '@/lib/navigation/modules'
import type { EnabledModule, UserOnboarding, UserPersona } from '@/types/onboarding'

interface ModulePreferencesFormProps {
  initialOnboarding: UserOnboarding | null
  goals: Array<{ id: string; title: string; status: string }>
}

export function ModulePreferencesForm({ initialOnboarding, goals }: ModulePreferencesFormProps) {
  const [persona, setPersona] = useState<UserPersona>(initialOnboarding?.persona ?? 'personal')
  const [primaryGoalId, setPrimaryGoalId] = useState(initialOnboarding?.primary_goal_id ?? '')
  const [enabledModules, setEnabledModules] = useState<EnabledModule[]>(
    initialOnboarding?.enabled_modules?.length
      ? initialOnboarding.enabled_modules
      : getPersonaDefaults(initialOnboarding?.persona ?? 'personal'),
  )
  const [isPending, startTransition] = useTransition()

  function handlePersonaChange(nextPersona: UserPersona) {
    setPersona(nextPersona)
    setEnabledModules(getPersonaDefaults(nextPersona))
  }

  function toggleModule(moduleId: EnabledModule) {
    setEnabledModules((current) =>
      current.includes(moduleId)
        ? current.filter((id) => id !== moduleId)
        : [...current, moduleId],
    )
  }

  function handleSave() {
    startTransition(async () => {
      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast.error('Sesion no valida')
        return
      }

      const { error } = await supabase
        .from('user_onboarding')
        .upsert(
          {
            user_id: user.id,
            focus: persona,
            persona,
            primary_goal_id: primaryGoalId || null,
            enabled_modules: enabledModules,
            completed: initialOnboarding?.completed ?? true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Preferencias guardadas')
      window.location.reload()
    })
  }

  return (
    <section className="space-y-5 rounded-xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
      <div>
        <h3 className="text-sm font-semibold text-text">Perfil y modulos</h3>
        <p className="mt-0.5 text-sm text-muted">Controla que secciones aparecen en la navegacion.</p>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Meta activa
        </label>
        <select
          value={primaryGoalId}
          onChange={(event) => setPrimaryGoalId(event.target.value)}
          className="w-full rounded-xl border border-border bg-surface-elevated px-3 py-2.5 text-sm text-text outline-none transition-colors focus:border-accent-600"
        >
          <option value="">Usar primera meta activa</option>
          {goals.map((goal) => (
            <option key={goal.id} value={goal.id}>
              {goal.title} {goal.status !== 'active' ? `(${goal.status})` : ''}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        {PERSONA_OPTIONS.map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => handlePersonaChange(option.id)}
            className={[
              'rounded-xl border px-3 py-3 text-left transition-colors',
              persona === option.id
                ? 'border-accent-600 bg-accent-600/10'
                : 'border-border bg-surface-elevated hover:border-border-bright',
            ].join(' ')}
          >
            <p className="text-xs font-semibold text-text">{option.title}</p>
            <p className="mt-1 text-[11px] leading-4 text-muted">{option.description}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-2 sm:grid-cols-2">
        {MODULE_OPTIONS.map((module) => {
          const selected = enabledModules.includes(module.id)

          return (
            <button
              key={module.id}
              type="button"
              onClick={() => toggleModule(module.id)}
              className={[
                'flex items-center justify-between gap-3 rounded-xl border px-3 py-3 text-left transition-colors',
                selected
                  ? 'border-accent-600 bg-accent-600/10'
                  : 'border-border bg-surface-elevated hover:border-border-bright',
              ].join(' ')}
            >
              <span>
                <span className="block text-sm font-medium text-text">{module.label}</span>
                <span className="block text-xs text-muted">{module.description}</span>
              </span>
              {selected && <Check size={15} className="shrink-0 text-accent-600" />}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={handleSave}
        disabled={isPending}
        className="inline-flex items-center justify-center rounded-xl bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {isPending ? 'Guardando...' : 'Guardar preferencias'}
      </button>
    </section>
  )
}
