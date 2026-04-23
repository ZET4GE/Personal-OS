import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { BookOpen, Briefcase, FolderGit2, GraduationCap, Zap, ChevronRight, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getWorkExperience, getEducation, getSkills, getCVCourses, getCVProjects } from '@/services/cv'
import { getMyProfile } from '@/services/profiles'
import { getBillingStatus } from '@/services/billing'
import { CVModeSection } from '@/components/cv/CVModeSection'
import { CVExportPanel } from '@/components/cv/CVExportPanel'

export const metadata: Metadata = { title: 'Mi CV' }

// ─────────────────────────────────────────────────────────────
// Section card — link a la sub-página de gestión
// ─────────────────────────────────────────────────────────────

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

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function CVPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch everything in parallel
  const [expResult, eduResult, skillsResult, coursesResult, projectsResult, profileResult, billingResult] = await Promise.all([
    getWorkExperience(supabase, user.id),
    getEducation(supabase, user.id),
    getSkills(supabase, user.id),
    getCVCourses(supabase, user.id),
    getCVProjects(supabase, user.id),
    getMyProfile(supabase),
    getBillingStatus(supabase, user.id),
  ])

  const expCount    = expResult.data?.length    ?? 0
  const eduCount    = eduResult.data?.length    ?? 0
  const skillsCount = skillsResult.data?.length ?? 0
  const coursesCount = coursesResult.data?.length ?? 0
  const projectsCount = projectsResult.data?.length ?? 0
  const profile     = profileResult.data
  const billing     = billingResult.data
  const canUseAts   = Boolean(billing && billing.plan !== 'free' && ['active', 'trialing'].includes(billing.status))

  const publicCvUrl = profile?.username ? `/${profile.username}/cv` : null

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-semibold">Mi CV</h2>
          <p className="text-sm text-muted">
            Gestiona tu experiencia, educación y skills para tu perfil público.
          </p>
        </div>
        {profile?.username && (
          <div className="flex shrink-0 items-center gap-2">
            {/* Descarga directa via API route — no requiere JS */}
            {profile.is_public && publicCvUrl && (
              <a
                href={publicCvUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                <ExternalLink size={13} />
                Ver público
              </a>
            )}
          </div>
        )}
      </div>

      {profile && profile.username && (
        <CVExportPanel
          username={profile.username}
          canUseAts={canUseAts}
          profile={profile}
          experience={expResult.data ?? []}
          education={eduResult.data ?? []}
          skills={skillsResult.data ?? []}
          courses={coursesResult.data ?? []}
          projects={projectsResult.data ?? []}
        />
      )}

      {/* Section cards */}
      <div className="space-y-3">
        <SectionCard
          href="/cv/experience"
          icon={Briefcase}
          label="Experiencia laboral"
          count={expCount}
          description={expCount === 0 ? 'Sin entradas todavía' : `${expCount} ${expCount === 1 ? 'entrada' : 'entradas'}`}
        />
        <SectionCard
          href="/cv/education"
          icon={GraduationCap}
          label="Educación"
          count={eduCount}
          description={eduCount === 0 ? 'Sin entradas todavía' : `${eduCount} ${eduCount === 1 ? 'entrada' : 'entradas'}`}
        />
        <SectionCard
          href="/cv/skills"
          icon={Zap}
          label="Skills"
          count={skillsCount}
          description={skillsCount === 0 ? 'Sin skills todavía' : `${skillsCount} ${skillsCount === 1 ? 'skill' : 'skills'}`}
        />
        <SectionCard
          href="/cv/courses"
          icon={BookOpen}
          label="Cursos"
          count={coursesCount}
          description={coursesCount === 0 ? 'Sin cursos todavia' : `${coursesCount} ${coursesCount === 1 ? 'curso' : 'cursos'}`}
        />
        <SectionCard
          href="/cv/projects"
          icon={FolderGit2}
          label="Proyectos"
          count={projectsCount}
          description={projectsCount === 0 ? 'Sin proyectos todavia' : `${projectsCount} ${projectsCount === 1 ? 'proyecto' : 'proyectos'}`}
        />
      </div>

      {/* Hint si perfil no es público */}
      <CVModeSection
        expCount={expCount}
        eduCount={eduCount}
        skillsCount={skillsCount}
        coursesCount={coursesCount}
        projectsCount={projectsCount}
      />

      {profile && !profile.is_public && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
          Tu perfil está configurado como privado. El CV público no será visible hasta que lo actives en{' '}
          <Link href="/settings" className="font-medium underline underline-offset-2">
            Configuración
          </Link>
          .
        </p>
      )}
    </div>
  )
}
