'use client'

import type { Profile } from '@/types/profile'
import type { CVCourse, CVProject, Education, Skill, SkillCategory, WorkExperience } from '@/types/cv'
import { SKILL_CATEGORY_LABELS } from '@/types/cv'

interface CVPreviewATSProps {
  profile: Profile
  experience: WorkExperience[]
  education: Education[]
  skills: Skill[]
  courses: CVCourse[]
  projects: CVProject[]
}

function formatMonthYear(dateStr: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
  }).format(new Date(dateStr + 'T00:00:00'))
}

function expRange(exp: WorkExperience): string {
  const start = formatMonthYear(exp.start_date)
  const end = exp.is_current ? 'Presente' : exp.end_date ? formatMonthYear(exp.end_date) : ''
  return end ? `${start} – ${end}` : start
}

function eduRange(edu: Education): string {
  const start = edu.start_date ? formatMonthYear(edu.start_date) : null
  const end   = edu.end_date   ? formatMonthYear(edu.end_date)   : null
  if (start && end) return `${start} – ${end}`
  return start ?? end ?? ''
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-2 border-b border-gray-300 pb-1 text-[11px] font-bold uppercase tracking-widest text-gray-900">
      {children}
    </h2>
  )
}

function TextBlock({ value }: { value: string | null }) {
  if (!value) return null

  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length <= 1) {
    return <p className="mt-1 text-[11px] leading-relaxed text-gray-700">{value}</p>
  }

  return (
    <ul className="mt-1 space-y-0.5">
      {lines.map((line) => (
        <li key={line} className="flex gap-1.5 text-[11px] leading-relaxed text-gray-700">
          <span className="shrink-0">–</span>
          <span>{line.replace(/^[-•]\s*/, '')}</span>
        </li>
      ))}
    </ul>
  )
}

// ATS skills: no visual elements, clean text grouped by category · subcategory
function SkillsSection({ skills }: { skills: Skill[] }) {
  if (skills.length === 0) return null

  const topSkills = skills.filter((s) => s.is_top)

  // Build ordered groups
  const groupMap = new Map<string, { label: string; names: string[] }>()
  for (const skill of skills) {
    const key = `${skill.category}::${skill.subcategory ?? ''}`
    if (!groupMap.has(key)) {
      const catLabel = SKILL_CATEGORY_LABELS[skill.category as SkillCategory] ?? skill.category
      const label    = skill.subcategory ? `${catLabel} – ${skill.subcategory}` : catLabel
      groupMap.set(key, { label, names: [] })
    }
    // Include ATS keywords inline after skill name if present
    const entry = skill.keywords?.length
      ? `${skill.name} (${skill.keywords.join(', ')})`
      : skill.name
    groupMap.get(key)!.names.push(entry)
  }

  return (
    <section className="mb-4">
      <SectionTitle>Skills</SectionTitle>

      {topSkills.length > 0 && (
        <p className="mb-2 text-[11px] text-gray-700">
          <span className="font-semibold text-gray-900">Destacadas: </span>
          {topSkills.map((s) => s.name).join(', ')}
        </p>
      )}

      <div className="space-y-1.5">
        {[...groupMap.values()].map(({ label, names }) => (
          <p key={label} className="text-[11px] leading-relaxed text-gray-700">
            <span className="font-semibold text-gray-900">{label}: </span>
            {names.join(', ')}
          </p>
        ))}
      </div>
    </section>
  )
}

export function CVPreviewATS({
  profile,
  experience,
  education,
  skills,
  courses,
  projects,
}: CVPreviewATSProps) {
  const displayName = profile.full_name ?? `@${profile.username}`

  const contactItems = [
    profile.location,
    profile.phone,
    profile.website ? profile.website.replace(/^https?:\/\//, '') : null,
    profile.github_url  ? `github.com/${profile.github_url.split('/').pop()}` : null,
    profile.linkedin_url ? 'LinkedIn' : null,
  ].filter(Boolean) as string[]

  return (
    <div className="relative">
      <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
        Vista previa ATS — formato optimizado para parsers. El PDF descargado puede diferir levemente.
      </div>

      <div
        className="mx-auto w-full max-w-[210mm] bg-white px-10 py-10 shadow-lg"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif', minHeight: '297mm' }}
      >
        {/* Header */}
        <header className="mb-5 border-b-2 border-gray-900 pb-3">
          <h1 className="text-[22px] font-bold text-gray-900">{displayName}</h1>
          {profile.headline && (
            <p className="mt-0.5 text-[12px] font-medium text-gray-700">{profile.headline}</p>
          )}
          {contactItems.length > 0 && (
            <p className="mt-1.5 text-[10px] text-gray-600">
              {contactItems.join('  ·  ')}
            </p>
          )}
        </header>

        {/* 1. Perfil / Resumen */}
        {profile.bio && (
          <section className="mb-4">
            <SectionTitle>Perfil</SectionTitle>
            <p className="text-[11px] leading-relaxed text-gray-700">{profile.bio}</p>
          </section>
        )}

        {/* 2. Experiencia */}
        {experience.length > 0 && (
          <section className="mb-4">
            <SectionTitle>Experiencia</SectionTitle>
            <div className="space-y-3">
              {experience.map((item) => (
                <div key={item.id}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[11px] font-bold text-gray-900">{item.role}</span>
                    <span className="shrink-0 text-[10px] text-gray-600">{expRange(item)}</span>
                  </div>
                  <p className="text-[10px] text-gray-600">
                    {item.company}{item.location ? ` – ${item.location}` : ''}
                  </p>
                  <TextBlock value={item.description} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 3. Educación */}
        {education.length > 0 && (
          <section className="mb-4">
            <SectionTitle>Educación</SectionTitle>
            <div className="space-y-3">
              {education.map((item) => {
                const title = item.field ? `${item.degree} – ${item.field}` : item.degree
                const range = eduRange(item)
                return (
                  <div key={item.id}>
                    <div className="flex items-baseline justify-between gap-4">
                      <span className="text-[11px] font-bold text-gray-900">{title}</span>
                      {range && <span className="shrink-0 text-[10px] text-gray-600">{range}</span>}
                    </div>
                    <p className="text-[10px] text-gray-600">{item.institution}</p>
                    <TextBlock value={item.description} />
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* 4. Skills */}
        <SkillsSection skills={skills} />

        {/* 5. Proyectos */}
        {projects.length > 0 && (
          <section className="mb-4">
            <SectionTitle>Proyectos</SectionTitle>
            <div className="space-y-3">
              {projects.map((project) => (
                <div key={project.id}>
                  <p className="text-[11px] font-bold text-gray-900">
                    {project.title}{project.is_featured ? ' – Destacado' : ''}
                  </p>
                  <TextBlock value={project.description} />
                  {project.tech_stack.length > 0 && (
                    <p className="mt-0.5 text-[10px] text-gray-600">
                      Tecnologías: {project.tech_stack.join(', ')}
                    </p>
                  )}
                  {(project.url || project.repo_url) && (
                    <p className="mt-0.5 text-[10px] text-gray-600">
                      {project.url && `Demo: ${project.url.replace(/^https?:\/\//, '')}`}
                      {project.url && project.repo_url && '  ·  '}
                      {project.repo_url && `Repo: ${project.repo_url.replace(/^https?:\/\//, '')}`}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* 6. Cursos y Certificaciones */}
        {courses.length > 0 && (
          <section className="mb-4">
            <SectionTitle>Cursos y Certificaciones</SectionTitle>
            <div className="space-y-2.5">
              {courses.map((course) => (
                <div key={course.id}>
                  <div className="flex items-baseline justify-between gap-4">
                    <span className="text-[11px] font-bold text-gray-900">{course.title}</span>
                    {course.completed_at && (
                      <span className="shrink-0 text-[10px] text-gray-600">
                        {formatMonthYear(course.completed_at)}
                      </span>
                    )}
                  </div>
                  {course.provider && (
                    <p className="text-[10px] text-gray-600">{course.provider}</p>
                  )}
                  <TextBlock value={course.description} />
                  {course.credential_url && (
                    <p className="mt-0.5 text-[10px] text-gray-600">
                      Credencial: {course.credential_url.replace(/^https?:\/\//, '')}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  )
}
