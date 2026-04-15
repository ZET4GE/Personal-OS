'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Briefcase, ChevronRight, GraduationCap, Sparkles, Zap } from 'lucide-react'
import { useDynamicCV } from '@/hooks/useDynamicCV'
import { Skeleton } from '@/components/ui/Skeleton'
import type { DynamicCVExperience, DynamicCVProject, Skill } from '@/types/cv'

interface CVModeSectionProps {
  expCount: number
  eduCount: number
  skillsCount: number
}

function SectionCard({
  href,
  icon: Icon,
  label,
  count,
  description,
}: {
  href: string
  icon: React.FC<{ size?: number; className?: string }>
  label: string
  count: number
  description: string
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border bg-surface p-5 transition-shadow hover:shadow-sm"
      style={{ borderColor: 'var(--color-border)' }}
    >
      <div className="flex items-center gap-4">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800">
          <Icon size={20} className="text-muted" />
        </span>
        <div>
          <p className="font-semibold">{label}</p>
          <p className="text-sm text-muted">{description}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {count > 0 && (
          <span className="rounded-full bg-accent-600/10 px-2.5 py-0.5 text-xs font-semibold text-accent-600">
            {count}
          </span>
        )}
        <ChevronRight size={16} className="text-muted transition-transform group-hover:translate-x-0.5" />
      </div>
    </Link>
  )
}

function DynamicCVPreview() {
  const { data, loading, error } = useDynamicCV()

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
        <Skeleton className="h-28 rounded-xl" />
      </div>
    )
  }

  if (error) return <div className="rounded-xl border border-dashed border-border px-4 py-6 text-sm text-red-500">{error}</div>

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <Briefcase size={16} className="text-muted" />
          <h3 className="font-semibold">Experiencia generada</h3>
        </div>
        {data.experience.length === 0 ? (
          <p className="text-sm text-muted">Sin experiencia derivada de metas completadas.</p>
        ) : (
          <div className="space-y-3">
            {data.experience.map((item: DynamicCVExperience) => (
              <div key={item.id} className="rounded-lg bg-surface-hover px-3 py-3">
                <p className="text-sm font-medium text-text">{item.title}</p>
                {item.description && <p className="mt-1 text-sm text-muted line-clamp-2">{item.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-muted" />
          <h3 className="font-semibold">Proyectos vinculados</h3>
        </div>
        {data.projects.length === 0 ? (
          <p className="text-sm text-muted">Sin proyectos vinculados a metas profesionales.</p>
        ) : (
          <div className="space-y-3">
            {data.projects.map((project: DynamicCVProject) => (
              <div key={project.id} className="rounded-lg bg-surface-hover px-3 py-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium text-text">{project.title}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${project.is_completed ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'}`}>
                    {project.is_completed ? 'Completado' : 'En progreso'}
                  </span>
                </div>
                {project.description && <p className="mt-1 text-sm text-muted line-clamp-2">{project.description}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="mb-3 flex items-center gap-2">
          <Zap size={16} className="text-muted" />
          <h3 className="font-semibold">Skills derivadas</h3>
        </div>
        {data.skills.length === 0 ? (
          <p className="text-sm text-muted">Sin skills derivadas de metas o notas.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {data.skills.map((skill: Skill) => (
              <span key={skill.id} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                {skill.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function CVModeSection({ expCount, eduCount, skillsCount }: CVModeSectionProps) {
  const [mode, setMode] = useState<'manual' | 'automatic'>('manual')

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-xl border border-border bg-surface p-1">
        <button type="button" onClick={() => setMode('manual')} className={['rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', mode === 'manual' ? 'bg-accent-600 text-white shadow-sm' : 'text-muted hover:bg-surface-hover hover:text-foreground'].join(' ')}>
          Modo manual
        </button>
        <button type="button" onClick={() => setMode('automatic')} className={['rounded-lg px-3 py-1.5 text-xs font-medium transition-colors', mode === 'automatic' ? 'bg-accent-600 text-white shadow-sm' : 'text-muted hover:bg-surface-hover hover:text-foreground'].join(' ')}>
          Modo automatico
        </button>
      </div>

      {mode === 'manual' ? (
        <div className="space-y-3">
          <SectionCard href="/cv/experience" icon={Briefcase} label="Experiencia laboral" count={expCount} description={expCount === 0 ? 'Sin entradas todavia' : `${expCount} ${expCount === 1 ? 'entrada' : 'entradas'}`} />
          <SectionCard href="/cv/education" icon={GraduationCap} label="Educacion" count={eduCount} description={eduCount === 0 ? 'Sin entradas todavia' : `${eduCount} ${eduCount === 1 ? 'entrada' : 'entradas'}`} />
          <SectionCard href="/cv/skills" icon={Zap} label="Skills" count={skillsCount} description={skillsCount === 0 ? 'Sin skills todavia' : `${skillsCount} ${skillsCount === 1 ? 'skill' : 'skills'}`} />
        </div>
      ) : (
        <DynamicCVPreview />
      )}
    </div>
  )
}
