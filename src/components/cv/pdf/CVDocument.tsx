import { Document, Page, Text, View, Link } from '@react-pdf/renderer'
import { styles } from './PDFStyles'
import { SKILL_CATEGORY_LABELS } from '@/types/cv'
import type { WorkExperience, Education, Skill, SkillCategory, CVCourse, CVProject } from '@/types/cv'
import { CV_AVAILABILITY_LABELS } from '@/types/profile'
import type { Profile } from '@/types/profile'

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

export interface CVDocumentProps {
  profile:    Profile
  experience: WorkExperience[]
  education:  Education[]
  skills:     Skill[]
  courses:    CVCourse[]
  projects:   CVProject[]
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function fmt(dateStr: string): string {
  return new Intl.DateTimeFormat('es-ES', { year: 'numeric', month: 'short' }).format(
    new Date(dateStr + 'T00:00:00'),
  )
}

function fmtBirthDate(dateStr: string): string {
  return new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(
    new Date(dateStr + 'T00:00:00'),
  )
}

function calcAge(birthDateStr: string): number {
  const today = new Date()
  const birth = new Date(birthDateStr + 'T00:00:00')
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function expDateRange(exp: WorkExperience): string {
  const start = fmt(exp.start_date)
  const end   = exp.is_current ? 'Presente' : exp.end_date ? fmt(exp.end_date) : ''
  return end ? `${start} – ${end}` : start
}

function eduDateRange(edu: Education): string {
  const start = edu.start_date ? fmt(edu.start_date) : null
  const end   = edu.end_date   ? fmt(edu.end_date)   : null
  if (start && end)   return `${start} – ${end}`
  if (start)          return start
  if (end)            return end
  return ''
}

function courseDate(course: CVCourse): string {
  return course.completed_at ? fmt(course.completed_at) : ''
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function Divider() {
  return <View style={styles.divider} />
}

function SectionTitle({ children }: { children: string }) {
  return <Text style={styles.sectionTitle}>{children}</Text>
}

function ExperienceSection({ items }: { items: WorkExperience[] }) {
  if (items.length === 0) return null
  return (
    <View style={styles.section}>
      <SectionTitle>Experiencia laboral</SectionTitle>
      {items.map((exp, i) => {
        const isLast = i === items.length - 1
        return (
          <View key={exp.id} style={styles.timelineItem}>
            {/* Timeline column */}
            <View style={styles.timelineLeft}>
              <View style={styles.dot} />
              {!isLast && <View style={styles.timelineLine} />}
            </View>

            {/* Content */}
            <View style={styles.timelineContent}>
              <View style={styles.itemHeaderRow}>
                <Text style={styles.itemTitle}>{exp.role}</Text>
                <Text style={styles.itemDate}>{expDateRange(exp)}</Text>
              </View>
              <Text style={styles.itemSubtitle}>{exp.company}</Text>
              {exp.location ? (
                <Text style={styles.itemLocation}>{exp.location}</Text>
              ) : null}
              {exp.description ? (
                <Text style={styles.itemDesc}>{exp.description}</Text>
              ) : null}
            </View>
          </View>
        )
      })}
    </View>
  )
}

function EducationSection({ items }: { items: Education[] }) {
  if (items.length === 0) return null
  return (
    <View style={styles.section}>
      <SectionTitle>Educación</SectionTitle>
      {items.map((edu, i) => {
        const isLast    = i === items.length - 1
        const dateRange = eduDateRange(edu)
        const titleText = edu.field ? `${edu.degree} · ${edu.field}` : edu.degree
        return (
          <View key={edu.id} style={styles.timelineItem}>
            <View style={styles.timelineLeft}>
              <View style={styles.dotGray} />
              {!isLast && <View style={styles.timelineLine} />}
            </View>
            <View style={styles.timelineContent}>
              <View style={styles.itemHeaderRow}>
                <Text style={styles.itemTitle}>{titleText}</Text>
                {dateRange ? <Text style={styles.itemDate}>{dateRange}</Text> : null}
              </View>
              <Text style={styles.itemSubtitle}>{edu.institution}</Text>
              {edu.description ? (
                <Text style={styles.itemDesc}>{edu.description}</Text>
              ) : null}
            </View>
          </View>
        )
      })}
    </View>
  )
}

function CoursesSection({ items }: { items: CVCourse[] }) {
  if (items.length === 0) return null
  return (
    <View style={styles.section}>
      <SectionTitle>Cursos y certificaciones</SectionTitle>
      {items.map((course) => (
        <View key={course.id} style={styles.simpleItem}>
          <View style={styles.itemHeaderRow}>
            <Text style={styles.itemTitle}>{course.title}</Text>
            {courseDate(course) ? <Text style={styles.itemDate}>{courseDate(course)}</Text> : null}
          </View>
          {course.provider ? <Text style={styles.itemSubtitle}>{course.provider}</Text> : null}
          {course.description ? <Text style={styles.itemDesc}>{course.description}</Text> : null}
          {course.credential_url ? (
            <Link src={course.credential_url} style={styles.itemLocation}>Credencial</Link>
          ) : null}
        </View>
      ))}
    </View>
  )
}

function ProjectsSection({ items }: { items: CVProject[] }) {
  if (items.length === 0) return null
  return (
    <View style={styles.section}>
      <SectionTitle>Proyectos</SectionTitle>
      {items.map((project) => (
        <View key={project.id} style={styles.simpleItem}>
          <Text style={styles.itemTitle}>{project.title}</Text>
          {project.description ? <Text style={styles.itemDesc}>{project.description}</Text> : null}
          {project.tech_stack.length > 0 ? (
            <Text style={styles.itemLocation}>{project.tech_stack.join(' · ')}</Text>
          ) : null}
          <View style={styles.contactRow}>
            {project.url ? <Link src={project.url} style={styles.contactItem}>Demo</Link> : null}
            {project.repo_url ? <Link src={project.repo_url} style={styles.contactItem}>Repositorio</Link> : null}
          </View>
        </View>
      ))}
    </View>
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
    <View style={styles.section}>
      <SectionTitle>Skills</SectionTitle>
      {topSkills.length > 0 && (
        <View style={styles.skillCategory}>
          <Text style={styles.skillCategoryLabel}>Destacadas</Text>
          <View style={styles.skillBadgesRow}>
            {topSkills.map((s) => (
              <View key={s.id} style={styles.skillBadge}>
                <Text>★ {s.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}
      <View style={styles.skillsGrid}>
        {[...groupMap.values()].map(({ label, skills }) => (
          <View key={label} style={styles.skillCategory}>
            <Text style={styles.skillCategoryLabel}>{label}</Text>
            <View style={styles.skillBadgesRow}>
              {skills.map((skill) => (
                <View key={skill.id} style={styles.skillBadge}>
                  <Text>{skill.name}</Text>
                </View>
              ))}
            </View>
          </View>
        ))}
      </View>
    </View>
  )
}

// ─────────────────────────────────────────────────────────────
// Document
// ─────────────────────────────────────────────────────────────

export function CVDocument({ profile, experience, education, skills, courses, projects }: CVDocumentProps) {
  const displayName = profile.full_name ?? `@${profile.username}`

  const hasContent =
    experience.length > 0 || education.length > 0 || skills.length > 0 || courses.length > 0 || projects.length > 0

  return (
    <Document
      title={`CV · ${displayName}`}
      author={displayName}
      creator="WINF"
      producer="WINF · @react-pdf/renderer"
    >
      <Page size="A4" style={styles.page}>

        {/* ── Header ────────────────────────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.name}>{displayName}</Text>

          {profile.headline ? (
            <Text style={styles.headline}>{profile.headline}</Text>
          ) : null}

          {profile.bio ? (
            <Text style={styles.bio}>{profile.bio}</Text>
          ) : null}

          <View style={styles.contactRow}>
            {profile.location ? (
              <Text style={styles.contactItem}>{profile.location}</Text>
            ) : null}
            {profile.nationality ? (
              <Text style={styles.contactItem}>{profile.nationality}</Text>
            ) : null}
            {profile.phone ? (
              <Text style={styles.contactItem}>{profile.phone}</Text>
            ) : null}
            {profile.birth_date ? (
              <Text style={styles.contactItem}>{fmtBirthDate(profile.birth_date)} · {calcAge(profile.birth_date)} años</Text>
            ) : null}
            {profile.availability ? (
              <Text style={styles.contactItem}>{CV_AVAILABILITY_LABELS[profile.availability]}</Text>
            ) : null}
            {profile.website ? (
              <Link src={profile.website} style={styles.contactItem}>
                {profile.website.replace(/^https?:\/\//, '')}
              </Link>
            ) : null}
            {profile.github_url ? (
              <Link src={profile.github_url} style={styles.contactItem}>
                GitHub
              </Link>
            ) : null}
            {profile.linkedin_url ? (
              <Link src={profile.linkedin_url} style={styles.contactItem}>
                LinkedIn
              </Link>
            ) : null}
            {profile.twitter_url ? (
              <Link src={profile.twitter_url} style={styles.contactItem}>
                Twitter / X
              </Link>
            ) : null}
          </View>
        </View>

        <Divider />

        {/* ── Content ───────────────────────────────────────── */}
        {hasContent ? (
          <>
            <ExperienceSection items={experience} />
            {experience.length > 0 && (education.length > 0 || courses.length > 0 || projects.length > 0 || skills.length > 0) && (
              <Divider />
            )}
            <EducationSection items={education} />
            {(education.length > 0 && (courses.length > 0 || projects.length > 0 || skills.length > 0)) && <Divider />}
            <CoursesSection items={courses} />
            {(courses.length > 0 && (projects.length > 0 || skills.length > 0)) && <Divider />}
            <ProjectsSection items={projects} />
            {(projects.length > 0 && skills.length > 0) && <Divider />}
            <SkillsSection items={skills} />
          </>
        ) : (
          <Text style={{ color: '#9ca3af', fontSize: 10 }}>
            Este CV está vacío por el momento.
          </Text>
        )}

      </Page>
    </Document>
  )
}
