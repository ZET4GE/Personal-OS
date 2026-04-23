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
  const end = edu.end_date ? formatMonthYear(edu.end_date) : null
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
          <span className="shrink-0">-</span>
          <span>{line.replace(/^[-•]\s*/, '')}</span>
        </li>
      ))}
    </ul>
  )
}

function SkillsSection({ skills }: { skills: Skill[] }) {
  if (skills.length === 0) return null

  const topSkills = skills.filter((s) => s.is_top)

  const groupMap = new Map<string, { label: string; skills: Skill[] }>()
  for (const skill of skills) {
    const key = `${skill.category}::${skill.subcategory ?? ''}`
    if (!groupMap.has(key)) {
      const catLabel = SKILL_CATEGORY_LABELS[skill.category as SkillCategory] ?? skill.category
      const label    = skill.subcategory ? `${catLabel} · ${skill.subcategory}` : catLabel
      groupMap.set(key, { label, skills: [] })
    }
    groupMap.get(key)!.skills.push(skill)
  }

  return (
    <section className="mb-4">
      <SectionTitle>Skills</SectionTitle>

      {topSkills.length > 0 && (
        <div className="mb-2">
          <span className="text-[11px] font-semibold text-gray-900">Top skills: </span>
          <span className="text-[11px] text-gray-700">{topSkills.map((s) => s.name).join(', ')}</span>
        </div>
      )}

      {[...groupMap.values()].map(({ label, skills: groupSkills }) => (
        <div key={label} className="mb-2">
          <p className="text-[11px] font-semibold text-gray-900">{label}</p>
          {groupSkills.map((skill) => {
            const level    = skill.level_pct != null ? ` (${skill.level_pct}%)` : ''
            const keywords = skill.keywords?.length ? ` – ${skill.keywords.join(', ')}` : ''
            return (
              <p key={skill.id} className="text-[11px] leading-relaxed text-gray-700">
                {skill.name}{level}{keywords}
              </p>
            )
          })}
        </div>
      ))}
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
    profile.github_url ? 'GitHub' : null,
    profile.linkedin_url ? 'LinkedIn' : null,
  ].filter(Boolean) as string[]

  return (
    <div className="relative">
      <div className="mb-3 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-800 dark:bg-blue-900/20 dark:text-blue-300">
        Vista previa ATS — el formato real puede variar levemente respecto al PDF descargado.
      </div>

      <div
        className="mx-auto w-full max-w-[210mm] bg-white px-10 py-10 shadow-lg"
        style={{ fontFamily: 'Helvetica, Arial, sans-serif', minHeight: '297mm' }}
      >
        <header className="mb-4 border-b border-gray-900 pb-3">
          <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
          {profile.headline && (
            <p className="mt-1 text-[12px] text-gray-700">{profile.headline}</p>
          )}
          {contactItems.length > 0 && (
            <p className="mt-1.5 text-[10px] text-gray-600">
              {contactItems.join('  ·  ')}
            </p>
          )}
        </header>

        {profile.bio && (
          <section className="mb-4">
            <SectionTitle>Perfil</SectionTitle>
            <p className="text-[11px] leading-relaxed text-gray-700">{profile.bio}</p>
          </section>
        )}

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
                    <p className="mt-0.5 text-[10px] text-gray-600">{project.tech_stack.join(', ')}</p>
                  )}
                  {(project.url || project.repo_url) && (
                    <p className="mt-0.5 text-[10px] text-gray-600">
                      {project.url && <span>Demo: {project.url.replace(/^https?:\/\//, '')}</span>}
                      {project.url && project.repo_url && <span>  ·  </span>}
                      {project.repo_url && <span>Repositorio: {project.repo_url.replace(/^https?:\/\//, '')}</span>}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {education.length > 0 && (
          <section className="mb-4">
            <SectionTitle>Educacion</SectionTitle>
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

        {courses.length > 0 && (
          <section className="mb-4">
            <SectionTitle>Cursos</SectionTitle>
            <div className="space-y-3">
              {courses.map((course) => (
                <div key={course.id}>
                  <p className="text-[11px] font-bold text-gray-900">{course.title}</p>
                  <p className="text-[10px] text-gray-600">
                    {[course.provider, course.completed_at ? formatMonthYear(course.completed_at) : null]
                      .filter(Boolean)
                      .join(' – ')}
                  </p>
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

        <SkillsSection skills={skills} />
      </div>
    </div>
  )
}
