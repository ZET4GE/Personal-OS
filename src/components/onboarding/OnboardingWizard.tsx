'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check, Clock3, GitBranch, Globe2, Target } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { createGoalAction } from '@/app/(dashboard)/goals/actions'
import { DEFAULT_DASHBOARD_WIDGETS, ONBOARDING_WIDGET_OPTIONS } from '@/lib/dashboard/default-widgets'
import { getPersonaDefaults, MODULE_OPTIONS, PERSONA_OPTIONS } from '@/lib/navigation/modules'
import type { EnabledModule, UserPersona } from '@/types/onboarding'

function getGoalCategory(persona: UserPersona) {
  if (persona === 'student') return 'learning'
  if (persona === 'freelancer' || persona === 'employee') return 'career'
  return 'personal'
}

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [persona, setPersona] = useState<UserPersona>('freelancer')
  const [enabledModules, setEnabledModules] = useState<EnabledModule[]>(getPersonaDefaults('freelancer'))
  const [goalTitle, setGoalTitle] = useState('')
  const [goalDescription, setGoalDescription] = useState('')
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(
    ONBOARDING_WIDGET_OPTIONS.slice(0, 6).map((item) => item.id),
  )
  const [isPending, startTransition] = useTransition()
  const currentPersona = PERSONA_OPTIONS.find((option) => option.id === persona) ?? PERSONA_OPTIONS[0]

  function selectPersona(nextPersona: UserPersona) {
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

  function toggleWidget(widgetId: string) {
    setSelectedWidgets((current) =>
      current.includes(widgetId)
        ? current.filter((id) => id !== widgetId)
        : [...current, widgetId],
    )
  }

  function handleFinish() {
    if (!goalTitle.trim()) {
      toast.error('Crea tu primera meta')
      setStep(2)
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.set('title', goalTitle.trim())
      formData.set('description', goalDescription.trim())
      formData.set('category', getGoalCategory(persona))
      formData.set('priority', 'medium')
      formData.set('color', 'blue')

      const goalResult = await createGoalAction(formData)
      if (!goalResult.success) {
        toast.error(goalResult.error)
        return
      }

      const supabase = createClient()
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        toast.error('Sesion no valida')
        return
      }

      const layout = DEFAULT_DASHBOARD_WIDGETS.map((item, index) => ({
        ...item,
        visible: selectedWidgets.includes(item.id),
        position: index,
      }))

      const { error: configError } = await supabase
        .from('user_dashboard_config')
        .upsert(
          {
            user_id: user.id,
            layout,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )

      if (configError) {
        toast.error(configError.message)
        return
      }

      const { error: onboardingError } = await supabase
        .from('user_onboarding')
        .upsert(
          {
            user_id: user.id,
            focus: persona,
            persona,
            primary_goal_id: goalResult.goal.id,
            enabled_modules: enabledModules,
            completed: true,
            completed_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' },
        )

      if (onboardingError) {
        toast.error(onboardingError.message)
        return
      }

      router.push('/dashboard')
      router.refresh()
    })
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
      <div className="space-y-2 text-center">
        {step > 0 && (
          <p className="text-sm font-medium text-accent-600">Paso {step} de 3</p>
        )}
        <h1 className="text-3xl font-semibold tracking-tight text-text">
          {step === 0 ? 'Bienvenido a WINF' : 'Configura WINF para tu meta'}
        </h1>
        <p className="text-sm text-muted">
          {step === 0
            ? 'Tu sistema personal para pasar de idea a resultado real.'
            : 'Primero elegimos perfil, meta activa y módulos necesarios.'}
        </p>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        {step === 0 && (
          <div className="space-y-6">
            <p className="text-sm leading-7 text-muted">
              WINF conecta cuatro cosas que ya usás por separado en un solo flujo que avanza con vos:
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { icon: Target,   color: 'text-cyan-400',   bg: 'bg-cyan-500/10',   border: 'border-cyan-500/20',   step: '01', title: 'Meta',           desc: 'Definís qué querés lograr. Todo lo demás gira alrededor de eso.' },
                { icon: GitBranch, color: 'text-violet-400', bg: 'bg-violet-500/10', border: 'border-violet-500/20', step: '02', title: 'Roadmap',         desc: 'Partís la meta en etapas. Cada paso es concreto y tachable.' },
                { icon: Clock3,   color: 'text-accent-400', bg: 'bg-accent-500/10', border: 'border-accent-500/20', step: '03', title: 'Tiempo y acción', desc: 'Timer, hábitos y proyectos miden cuánto avanzás en la vida real.' },
                { icon: Globe2,   color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', step: '04', title: 'Perfil público',  desc: 'CV, proyectos y roadmaps visibles para quien quieras.' },
              ].map((item) => (
                <div key={item.step} className={`flex items-start gap-3 rounded-2xl border ${item.border} ${item.bg} p-4`}>
                  <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.bg} border ${item.border}`}>
                    <item.icon size={17} className={item.color} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="rounded-xl border border-border bg-surface-elevated px-4 py-3 text-sm text-muted">
              En los próximos pasos configuramos WINF para tu perfil en menos de 2 minutos.
            </p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text">Como vas a usar WINF?</h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
              {PERSONA_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => selectPersona(option.id)}
                  className={[
                    'rounded-2xl border px-4 py-5 text-left transition-all',
                    persona === option.id
                      ? 'border-accent-600 bg-accent-600/10 shadow-sm'
                      : 'border-border bg-surface-elevated hover:border-border-bright',
                  ].join(' ')}
                >
                  <p className="text-sm font-semibold text-text">{option.title}</p>
                  <p className="mt-2 text-xs leading-5 text-muted">{option.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text">Crea tu meta activa</h2>
            <p className="text-sm text-muted">
              Esta meta va a ordenar dashboard, roadmap, acciones de hoy y progreso.
            </p>
            <input
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder={currentPersona.goalPlaceholder}
              className="w-full rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm outline-none transition-colors focus:border-accent-600"
            />
            <textarea
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              placeholder="Describe en una linea que quieres lograr y por que importa."
              rows={4}
              className="w-full resize-none rounded-2xl border border-border bg-surface-elevated px-4 py-3 text-sm outline-none transition-colors focus:border-accent-600"
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold text-text">Elige que modulos necesitas</h2>
              <p className="mt-1 text-sm text-muted">Puedes cambiarlos despues desde configuracion.</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {MODULE_OPTIONS.map((module) => {
                const selected = enabledModules.includes(module.id)

                return (
                  <button
                    key={module.id}
                    type="button"
                    onClick={() => toggleModule(module.id)}
                    className={[
                      'flex min-h-24 items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-left transition-all',
                      selected
                        ? 'border-accent-600 bg-accent-600/10'
                        : 'border-border bg-surface-elevated hover:border-border-bright',
                    ].join(' ')}
                  >
                    <span>
                      <span className="block text-sm font-medium text-text">{module.label}</span>
                      <span className="mt-1 block text-xs leading-5 text-muted">{module.description}</span>
                    </span>
                    {selected && <Check size={16} className="shrink-0 text-accent-600" />}
                  </button>
                )
              })}
            </div>

            <div className="border-t border-border pt-5">
              <h3 className="text-sm font-semibold text-text">Widgets iniciales</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {ONBOARDING_WIDGET_OPTIONS.map((widget) => {
                  const selected = selectedWidgets.includes(widget.id)

                  return (
                    <button
                      key={widget.id}
                      type="button"
                      onClick={() => toggleWidget(widget.id)}
                      className={[
                        'flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition-all',
                        selected
                          ? 'border-accent-600 bg-accent-600/10'
                          : 'border-border bg-surface-elevated hover:border-border-bright',
                      ].join(' ')}
                    >
                      <span className="text-sm font-medium text-text">{widget.label}</span>
                      {selected && <Check size={16} className="text-accent-600" />}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(0, current - 1))}
          disabled={step === 0 || isPending}
          className="inline-flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted transition-colors hover:border-border-bright hover:text-foreground disabled:opacity-50"
        >
          <ArrowLeft size={14} />
          Atrás
        </button>

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((current) => Math.min(3, current + 1))}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            {step === 0 ? 'Empezar' : 'Siguiente'}
            <ArrowRight size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinish}
            disabled={isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {isPending ? 'Guardando...' : 'Ir al dashboard'}
            <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}

