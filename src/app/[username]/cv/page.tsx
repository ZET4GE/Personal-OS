import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import {
  BookOpen, FolderGit2, Flag, MapPin, GitBranch, ExternalLink,
  Briefcase, GraduationCap, Phone, Star, Zap, ChevronRight,
  Car, Plane, User, Sparkles, Clock,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername } from '@/services/profiles'
import { getWorkExperience, getEducation, getSkills, getCVCourses, getCVProjects, getCVHighlights } from '@/services/cv'
import { SKILL_CATEGORY_LABELS, SKILL_LEVEL_QUALITATIVE_LABELS } from '@/types/cv'
import { WORK_TYPE_LABELS } from '@/types/profile'
import type { WorkExperience, Education, Skill, SkillCategory, CVCourse, CVProject, CVHighlight, SkillLevelQualitative } from '@/types/cv'
import type { Profile } from '@/types/profile'
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
      images: profile.avatar_url ? [{ url: profile.avatar_url }] : [],
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
// Shared UI
// ─────────────────────────────────────────────────────────────

function SectionTitle({ icon: Icon, label }: { icon: React.FC<{ size?: number; className?: string }>; label: string }) {
  return (
    <div className="mb-5 flex items-center gap-2">
      <Icon size={16} className="text-muted" />
      <h2 className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</h2>
    </div>
  )
}

function SkillLevelBadge({ level }: { level: SkillLevelQualitative | null }) {
  if (!level) return null
  const styles: Record<SkillLevelQualitative, string> = {
    solid:     'bg-accent-500/10 text-accent-600 dark:text-accent-400',
    operative: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    learning:  'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
  }
  return (
    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${styles[level]}`}>
      {SKILL_LEVEL_QUALITATIVE_LABELS[level]}
    </span>
  )
}

// ─────────────────────────────────────────────────────────────
// Sections
// ─────────────────────────────────────────────────────────────

function AboutSection({ about }: { about: string | null }) {
  if (!about) return null
  return (
    <section>
      <SectionTitle icon={User} label="Sobre mí" />
      <p className="leading-relaxed text-muted whitespace-pre-line">{about}</p>
    </section>
  )
}

function HighlightsSection({ items }: { items: CVHighlight[] }) {
  if (items.length === 0) return null
  return (
    <section>
      <SectionTitle icon={Sparkles} label="Destacados" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {items.map((h) => (
          <div key={h.id} className="rounded-xl border border-border bg-surface p-4">
            {h.icon && <p className="mb-2 text-2xl">{h.icon}</p>}
            <p className="font-semibold text-sm">{h.title}</p>
            {h.body && <p className="mt-1 text-xs text-muted leading-relaxed">{h.body}</p>}
          </div>
        ))}
      </div>
    </section>
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
                  <p className="mt-2 text-sm leading-relaxed text-muted whitespace-pre-line">
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
                  <p className="mt-2 text-sm leading-relaxed text-muted">{edu.description}</p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}

function SkillsSection({ items }: { items: Skill[] }) {
  if (items.length === 0) return null

  const topSkills = items.filter((s) => s.is_top)

  const groupMap = new Map<string, { label: string; skills: Skill[] }>()
  for (const skill of items) {
    const key = `${skill.category}::${skill.subcategory ?? ''}`
    if (!groupMap.has(key)) {
      const catLabel = SKILL_CATEGORY_LABELS[skill.category as SkillCategory] ?? skill.category
      const label    = skill.subcategory ? `${catLabel} · ${skill.subcategory}` : catLabel
      groupMap.set(key, { label, skills: [] })
    }
    groupMap.get(key)!.skills.push(skill)
  }

  return (
    <section>
      <SectionTitle icon={Zap} label="Skills" />

      {topSkills.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {topSkills.map((s) => (
            <span
              key={s.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-accent-500/10 px-3 py-1 text-sm font-semibold text-accent-600 dark:text-accent-400"
            >
              <Star size={11} className="fill-current" />
              {s.name}
            </span>
          ))}
        </div>
      )}

      <div className="space-y-6">
        {[...groupMap.values()].map(({ label, skills }) => (
          <div key={label}>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-muted">
              {label}
            </p>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {skills.map((skill) => (
                <div key={skill.id} className="flex items-center justify-between gap-3">
                  <span className="min-w-0 flex-1 truncate text-sm font-medium text-text">
                    {skill.name}
                  </span>
                  <SkillLevelBadge level={skill.skill_level} />
                </div>
              ))}
            </div>
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
      <div className="space-y-4">
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
            {project.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted">{project.description}</p>
            )}
            {project.tech_stack.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {project.tech_stack.map((tech) => (
                  <span key={tech} className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
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

function OngoingCoursesSection({ items }: { items: CVCourse[] }) {
  if (items.length === 0) return null
  return (
    <section>
      <SectionTitle icon={Clock} label="Estudios en curso" />
      <div className="space-y-3">
        {items.map((course) => (
          <div key={course.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{course.title}</p>
                  <span className="rounded-full bg-accent-500/10 px-2 py-0.5 text-[10px] font-medium text-accent-600 dark:text-accent-400">
                    En curso
                  </span>
                </div>
                {course.provider && <p className="text-sm text-muted">{course.provider}</p>}
              </div>
              {course.expected_completion_date && (
                <span className="text-xs text-muted">
                  Fin estimado: {formatMonthYear(course.expected_completion_date)}
                </span>
              )}
            </div>
            {course.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted">{course.description}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function CoursesSection({ items }: { items: CVCourse[] }) {
  if (items.length === 0) return null
  return (
    <section>
      <SectionTitle icon={BookOpen} label="Cursos y Certificaciones" />
      <div className="space-y-4">
        {items.map((course) => (
          <div key={course.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{course.title}</p>
                {course.provider && <p className="text-sm text-muted">{course.provider}</p>}
              </div>
              {course.completed_at && (
                <span className="text-xs text-muted">{formatMonthYear(course.completed_at)}</span>
              )}
            </div>
            {course.description && (
              <p className="mt-2 text-sm leading-relaxed text-muted">{course.description}</p>
            )}
            {course.credential_url && (
              <a
                href={course.credential_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-accent-600 hover:underline"
              >
                Ver credencial <ExternalLink size={12} />
              </a>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

function DisponibilidadSection({ profile }: { profile: Profile }) {
  const workTypes    = profile.work_types ?? []
  const hasAny = workTypes.length > 0 || profile.location_detail || profile.open_to_travel || profile.has_vehicle
  if (!hasAny) return null

  return (
    <section>
      <SectionTitle icon={Briefcase} label="Disponibilidad" />
      <div className="flex flex-wrap gap-2">
        {workTypes.map((type) => (
          <span key={type} className="rounded-full border border-border bg-surface px-3 py-1 text-sm">
            {(WORK_TYPE_LABELS as Record<string, string>)[type] ?? type}
          </span>
        ))}
        {profile.location_detail && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-sm">
            <MapPin size={12} className="shrink-0" /> {profile.location_detail}
          </span>
        )}
        {profile.open_to_travel && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-sm">
            <Plane size={12} className="shrink-0" /> Abierto a viajes
          </span>
        )}
        {profile.has_vehicle && (
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-sm">
            <Car size={12} className="shrink-0" /> Vehículo propio
          </span>
        )}
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

  const { data: { user } } = await supabase.auth.getUser()

  const [expResult, eduResult, skillsResult, coursesResult, projectsResult, highlightsResult] = await Promise.all([
    getWorkExperience(supabase, profile.id),
    getEducation(supabase, profile.id),
    getSkills(supabase, profile.id),
    getCVCourses(supabase, profile.id),
    getCVProjects(supabase, profile.id),
    getCVHighlights(supabase, profile.id),
  ])

  const experience  = expResult.data       ?? []
  const education   = eduResult.data       ?? []
  const skills      = skillsResult.data    ?? []
  const allCourses  = coursesResult.data   ?? []
  const projects    = projectsResult.data  ?? []
  const highlights  = highlightsResult.data ?? []

  const ongoingCourses   = allCourses.filter((c) => c.is_in_progress)
  const completedCourses = allCourses.filter((c) => !c.is_in_progress)

  const displayName = profile.full_name ?? `@${username}`

  const isEmpty = experience.length === 0 && education.length === 0 && skills.length === 0 &&
                  allCourses.length === 0 && projects.length === 0

  return (
    <main className="public-body mx-auto max-w-3xl px-4 py-12 sm:px-6">
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
        <CVDownloadSection
          username={username}
          profile={profile}
          experience={experience}
          education={education}
          skills={skills}
          courses={allCourses}
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
            <p className="max-w-xl leading-relaxed text-muted">{profile.bio}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-1 text-sm text-muted">
            {profile.location && (
              <span className="flex items-center gap-1.5">
                <MapPin size={13} /> {profile.location}
              </span>
            )}
            {profile.nationality && (
              <span className="flex items-center gap-1.5">
                <Flag size={13} /> {profile.nationality}
              </span>
            )}
            {profile.phone && (
              <span className="flex items-center gap-1.5">
                <Phone size={13} /> {profile.phone}
              </span>
            )}
            {profile.website && (
              <a href={profile.website} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-1.5 transition-colors hover:text-foreground">
                <ExternalLink size={13} /> {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
            {profile.github_url && (
              <a href={profile.github_url} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-1.5 transition-colors hover:text-foreground">
                <GitBranch size={13} /> GitHub
              </a>
            )}
            {profile.linkedin_url && (
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer"
                 className="flex items-center gap-1.5 transition-colors hover:text-foreground">
                <ExternalLink size={13} /> LinkedIn
              </a>
            )}
          </div>
        </div>
      </header>

      <div className="mb-10 border-t" style={{ borderColor: 'var(--color-border)' }} />

      {isEmpty ? (
        <p className="text-center text-muted">Este CV está vacío por el momento.</p>
      ) : (
        <div className="space-y-10">
          <HighlightsSection    items={highlights}       />
          <AboutSection         about={profile.about}    />
          <ExperienceSection    items={experience}       />
          <EducationSection     items={education}        />
          <OngoingCoursesSection items={ongoingCourses}  />
          <SkillsSection        items={skills}           />
          <ProjectsSection      items={projects}         />
          <CoursesSection       items={completedCourses} />
          <DisponibilidadSection profile={profile}       />
        </div>
      )}

      <div className="mt-12 border-t pt-6" style={{ borderColor: 'var(--color-border)' }}>
        <Link href={`/${username}`} className="text-sm text-muted transition-colors hover:text-foreground">
          ← Ver perfil completo de {displayName}
        </Link>
      </div>
    </main>
  )
}
