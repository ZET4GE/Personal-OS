'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { createGoalAction } from '@/app/(dashboard)/goals/actions'
import { DEFAULT_DASHBOARD_WIDGETS, ONBOARDING_WIDGET_OPTIONS } from '@/lib/dashboard/default-widgets'

const FOCUS_OPTIONS = [
  { id: 'builder', title: 'Constructor', description: 'Proyectos, entregas y progreso visible.' },
  { id: 'learner', title: 'Aprendiz', description: 'Metas de estudio, hábitos y notas.' },
  { id: 'operator', title: 'Operador', description: 'Rutinas, foco y control diario.' },
] as const

export function OnboardingWizard() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [focus, setFocus] = useState<string>(FOCUS_OPTIONS[0].id)
  const [goalTitle, setGoalTitle] = useState('')
  const [goalDescription, setGoalDescription] = useState('')
  const [selectedWidgets, setSelectedWidgets] = useState<string[]>(
    ONBOARDING_WIDGET_OPTIONS.slice(0, 6).map((item) => item.id),
  )
  const [isPending, startTransition] = useTransition()

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
      formData.set('category', focus === 'builder' ? 'career' : focus === 'learner' ? 'learning' : 'personal')
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
            focus,
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
        <p className="text-sm font-medium text-accent-600">Paso {step} de 3</p>
        <h1 className="text-3xl font-semibold tracking-tight text-text">Configura tu espacio personal</h1>
        <p className="text-sm text-muted">Un inicio corto para dejar tu dashboard listo.</p>
      </div>

      <div className="rounded-3xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]">
        {step === 1 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text">¿Cuál es tu foco principal?</h2>
            <div className="grid gap-3 md:grid-cols-3">
              {FOCUS_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setFocus(option.id)}
                  className={[
                    'rounded-2xl border px-4 py-5 text-left transition-all',
                    focus === option.id
                      ? 'border-accent-600 bg-accent-600/10 shadow-sm'
                      : 'border-border bg-surface-2 hover:border-border-bright',
                  ].join(' ')}
                >
                  <p className="text-sm font-semibold text-text">{option.title}</p>
                  <p className="mt-2 text-sm text-muted">{option.description}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text">Crea tu primera meta</h2>
            <input
              value={goalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="Ej: Conseguir mi primer cliente estable"
              className="w-full rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none transition-colors focus:border-accent-600"
            />
            <textarea
              value={goalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              placeholder="Describe en una línea qué quieres lograr."
              rows={4}
              className="w-full resize-none rounded-2xl border border-border bg-surface-2 px-4 py-3 text-sm outline-none transition-colors focus:border-accent-600"
            />
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text">Elige tus widgets iniciales</h2>
            <div className="grid gap-3 sm:grid-cols-2">
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
                        : 'border-border bg-surface-2 hover:border-border-bright',
                    ].join(' ')}
                  >
                    <span className="text-sm font-medium text-text">{widget.label}</span>
                    {selected && <Check size={16} className="text-accent-600" />}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((current) => Math.max(1, current - 1))}
          disabled={step === 1 || isPending}
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
            Siguiente
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
