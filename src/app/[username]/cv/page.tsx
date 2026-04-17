import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { BookOpen, Calendar, Clock, FolderGit2, MapPin, GitBranch, ExternalLink, Briefcase, GraduationCap, Phone, Zap, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername } from '@/services/profiles'
import { getWorkExperience, getEducation, getSkills, getCVCourses, getCVProjects } from '@/services/cv'
import { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS, SKILL_LEVEL_LABELS } from '@/types/cv'
import type { WorkExperience, Education, Skill, SkillCategory, CVCourse, CVProject } from '@/types/cv'
import { CV_AVAILABILITY_LABELS } from '@/types/profile'
import { CVDownloadSection } from '@/components/cv/pdf/CVDownloadSection'
import { TrackingPixel } from '@/components/analytics/TrackingPixel'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ username: string }>
}

// ─────────────────────────────────────────────────────────────
// Metadata
// ─────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params
  const supabase = await createClient()
  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) return { title: 'CV no encontrado' }

  const displayName = profile.full_name ?? `@${username}`
  return {
    title: `CV · ${displayName}`,
    description: profile.bio ?? `Currículum de ${displayName}`,
    openGraph: {
      title: `CV · ${displayName}`,
      description: profile.bio ?? undefined,
      type: 'profile',
    },
  }
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatMonthYear(dateStr: string): string {
  return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'short' }).format(
    new Date(dateStr + 'T00:00:00'),
  )
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, label }: { icon: React.FC<{ size?: number; className?: string }>; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      <Icon size={16} className="text-muted" />
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</h2>
    </div>
  )
}

function ExperienceSection({ items }: { items: WorkExperience[] }) {
  if (items.length === 0) return null
  return (
    <section>
      <SectionTitle icon={Briefcase} label="Experiencia" />
      <div className="space-y-6">
        {items.map((exp) => {
          const start = formatMonthYear(exp.start_date)
          const end   = exp.is_current ? 'Presente' : exp.end_date ? formatMonthYear(exp.end_date) : ''
          const range = end ? `${start} — ${end}` : start

          return (
            <div key={exp.id} className="flex gap-4">
              {/* Timeline dot */}
              <div className="flex flex-col items-center">
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-accent-600 bg-surface" />
                <div className="mt-1 w-px flex-1 bg-border" />
              </div>

              <div className="pb-6">
                <p className="font-semibold">{exp.role}</p>
                <p className="text-sm text-muted">{exp.company}</p>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted">
                  <span>{range}</span>
                  {exp.location && (
                    <span className="flex items-center gap-1">
                      <MapPin size={11} /> {exp.location}
                    </span>
                  )}
                </div>
                {exp.description && (
                  <p className="mt-2 text-sm text-muted leading-relaxed whitespace-pre-line">
                    {exp.description}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function EducationSection({ items }: { items: Education[] }) {
  if (items.length === 0) return null
  return (
    <section>
      <SectionTitle icon={GraduationCap} label="Educación" />
      <div className="space-y-5">
        {items.map((edu) => {
          const start = edu.start_date ? formatMonthYear(edu.start_date) : null
          const end   = edu.end_date   ? formatMonthYear(edu.end_date)   : null
          const range = start && end ? `${start} — ${end}` : start ?? end ?? null

          return (
            <div key={edu.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full border-2 border-slate-400 bg-surface" />
                <div className="mt-1 w-px flex-1 bg-border" />
              </div>
              <div className="pb-5">
                <p className="font-semibold">
                  {edu.degree}
                  {edu.field && <span className="font-normal text-muted"> · {edu.field}</span>}
                </p>
                <p className="text-sm text-muted">{edu.institution}</p>
                {range && <p className="mt-0.5 text-xs text-muted">{range}</p>}
                {edu.description && (
                  <p className="mt-2 text-sm text-muted leading-relaxed">{edu.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function CoursesSection({ items }: { items: CVCourse[] }) {
  if (items.length === 0) return null
  return (
    <section>
      <SectionTitle icon={BookOpen} label="Cursos" />
      <div className="space-y-5">
        {items.map((course) => (
          <div key={course.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{course.title}</p>
                {course.provider && <p className="text-sm text-muted">{course.provider}</p>}
              </div>
              {course.completed_at && <span className="text-xs text-muted">{formatMonthYear(course.completed_at)}</span>}
            </div>
            {course.description && <p className="mt-2 text-sm leading-relaxed text-muted">{course.description}</p>}
            {course.credential_url && (
              <a href={course.credential_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent-600 hover:underline">
                Ver credencial <ExternalLink size={12} />
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function ProjectsSection({ items }: { items: CVProject[] }) {
  if (items.length === 0) return null
  return (
    <section>
      <SectionTitle icon={FolderGit2} label="Proyectos" />
      <div className="space-y-5">
        {items.map((project) => (
          <div key={project.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-semibold">{project.title}</p>
              {project.is_featured && (
                <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-500">
                  Destacado
                </span>
              )}
            </div>
            {project.description && <p className="mt-2 text-sm leading-relaxed text-muted">{project.description}</p>}
            {project.tech_stack.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tech_stack.map((tech) => (
                  <span key={tech} className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                    {tech}
                  </span>
                ))}
              </div>
            )}
            <div className="mt-3 flex flex-wrap gap-3 text-xs font-medium">
              {project.url && (
                <a href={project.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent-600 hover:underline">
                  Demo <ExternalLink size={12} />
                </a>
              )}
              {project.repo_url && (
                <a href={project.repo_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-accent-600 hover:underline">
                  Repo <GitBranch size={12} />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function SkillsSection({ items }: { items: Skill[] }) {
  if (items.length === 0) return null

  const grouped = SKILL_CATEGORIES.reduce<Record<SkillCategory, Skill[]>>(
    (acc, cat) => {
      acc[cat] = items.filter((s) => s.category === cat)
      return acc
    },
    {} as Record<SkillCategory, Skill[]>,
  )

  return (
    <section>
      <SectionTitle icon={Zap} label="Skills" />
      <div className="space-y-4">
        {SKILL_CATEGORIES.map((cat) => {
          const skills = grouped[cat]
          if (skills.length === 0) return null
          return (
            <div key={cat}>
              <p className="mb-2 text-xs font-medium text-muted">{SKILL_CATEGORY_LABELS[cat]}</p>
              <div className="flex flex-wrap gap-2">
                {skills.map((skill) => (
                  <span
                    key={skill.id}
                    className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    {skill.name}
                    {skill.level && (
                      <span className="ml-1.5 text-xs font-normal text-muted">
                        {SKILL_LEVEL_LABELS[skill.level]}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

// ─────────────────────────────────────────────────────────────
// Page
// ─────────────────────────────────────────────────────────────

export default async function PublicCVPage({ params }: PageProps) {
  const { username } = await params
  const supabase = await createClient()

  const { data: profile } = await getProfileByUsername(supabase, username)
  if (!profile) notFound()

  // Visitor actual (para skip self-tracking)
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch CV data in parallel — RLS filters non-public automatically
  const [expResult, eduResult, skillsResult, coursesResult, projectsResult] = await Promise.all([
    getWorkExperience(supabase, profile.id),
    getEducation(supabase, profile.id),
    getSkills(supabase, profile.id),
    getCVCourses(supabase, profile.id),
    getCVProjects(supabase, profile.id),
  ])

  const experience = expResult.data   ?? []
  const education  = eduResult.data   ?? []
  const skills     = skillsResult.data ?? []
  const courses    = coursesResult.data ?? []
  const projects   = projectsResult.data ?? []
  const displayName = profile.full_name ?? `@${username}`

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <TrackingPixel pageType="cv" ownerId={profile.id} currentUserId={user?.id ?? null} />
      {/* Breadcrumb + download */}
      <div className="mb-8 flex items-center justify-between">
        <nav className="flex items-center gap-1 text-xs text-muted">
          <Link href={`/${username}`} className="transition-colors hover:text-foreground">
            {displayName}
          </Link>
          <ChevronRight size={12} />
          <span className="text-foreground">CV</span>
        </nav>

        {/* Botón client-side + fallback al API route — CVDownloadSection es Client Component */}
        <CVDownloadSection
          username={username}
          profile={profile}
          experience={experience}
          education={education}
          skills={skills}
          courses={courses}
          projects={projects}
        />
      </div>

      {/* Header */}
      <header className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-start">
        {profile.avatar_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.avatar_url}
            alt={displayName}
            className="h-24 w-24 shrink-0 rounded-2xl object-cover ring-1 ring-border"
          />
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
          {profile.headline && (
            <p className="text-base font-medium text-foreground/80">{profile.headline}</p>
          )}
          {profile.bio && (
            <p className="max-w-xl text-muted leading-relaxed">{profile.bio}</p>
          )}

          {/* Contact info */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-sm text-muted">
          {profile.location && (
            <span className="flex items-center gap-1.5">
              <MapPin size={13} /> {profile.location}
            </span>
          )}
          {profile.phone && (
            <span className="flex items-center gap-1.5">
              <Phone size={13} /> {profile.phone}
            </span>
          )}
          {profile.availability && (
            <span className="flex items-center gap-1.5">
              <Clock size={13} /> {CV_AVAILABILITY_LABELS[profile.availability]}
            </span>
          )}
          {profile.birth_date && (
            <span className="flex items-center gap-1.5">
              <Calendar size={13} /> {profile.birth_date}
            </span>
          )}
          {profile.website && (
            <a href={profile.website} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <ExternalLink size={13} /> {profile.website.replace(/^https?:\/\//, '')}
            </a>
          )}
          {profile.github_url && (
            <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <GitBranch size={13} /> GitHub
            </a>
          )}
          {profile.linkedin_url && (
            <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
               className="flex items-center gap-1.5 hover:text-foreground transition-colors">
              <ExternalLink size={13} /> LinkedIn
            </a>
          )}
          </div>
        </div>
      </header>

      {/* Divider */}
      <div className="mb-10 border-t" style={{ borderColor: 'var(--color-border)' }} />

      {/* Sections */}
      {experience.length === 0 && education.length === 0 && skills.length === 0 && courses.length === 0 && projects.length === 0 ? (
        <p className="text-center text-muted">Este CV está vacío por el momento.</p>
      ) : (
        <div className="space-y-10">
          <ExperienceSection items={experience} />
          <EducationSection  items={education} />
          <CoursesSection    items={courses} />
          <ProjectsSection   items={projects} />
          <SkillsSection     items={skills} />
        </div>
      )}

      {/* Link back to profile */}
      <div className="mt-12 border-t pt-6" style={{ borderColor: 'var(--color-border)' }}>
        <Link
          href={`/${username}`}
          className="text-sm text-muted transition-colors hover:text-foreground"
        >
          ← Ver perfil completo de {displayName}
        </Link>
      </div>
    </main>
  )
}
