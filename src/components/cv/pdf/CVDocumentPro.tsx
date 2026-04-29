import { Document, Page, Text, View, Link, Image } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { styles } from './PDFStylesPro'
import { SKILL_CATEGORY_LABELS_BY_LANGUAGE, SKILL_LEVEL_QUALITATIVE_LABELS } from '@/types/cv'
import type { WorkExperience, Education, Skill, SkillCategory, CVCourse, CVProject, CVLanguage } from '@/types/cv'
import type { Profile } from '@/types/profile'

export interface CVDocumentProps {
  profile: Profile
  experience: WorkExperience[]
  education: Education[]
  skills: Skill[]
  courses: CVCourse[]
  projects: CVProject[]
  language?: CVLanguage
}

const LABELS = {
  es: {
    contact:    'Contacto',
    skills:     'Skills',
    courses:    'Cursos y Certificaciones',
    experience: 'Experiencia',
    projects:   'Proyectos',
    education:  'Educación',
    present:    'Presente',
    featured:   'Destacado',
    credential: 'Credencial',
    demo:       'Demo',
    repository: 'Repositorio',
    empty:      'Este CV está vacío por el momento.',
    topSkills:  'Destacadas',
    techs:      'Tecnologías',
  },
  en: {
    contact:    'Contact',
    skills:     'Skills',
    courses:    'Courses & Certifications',
    experience: 'Experience',
    projects:   'Projects',
    education:  'Education',
    present:    'Present',
    featured:   'Featured',
    credential: 'Credential',
    demo:       'Demo',
    repository: 'Repository',
    empty:      'This CV is empty for now.',
    topSkills:  'Top skills',
    techs:      'Technologies',
  },
} as const

function fmt(dateStr: string, language: CVLanguage = 'es'): string {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-ES', {
    year: 'numeric', month: 'short',
  }).format(new Date(dateStr + 'T00:00:00'))
}


function expDateRange(exp: WorkExperience, language: CVLanguage): string {
  const start = fmt(exp.start_date, language)
  const end   = exp.is_current ? LABELS[language].present : exp.end_date ? fmt(exp.end_date, language) : ''
  return end ? `${start} – ${end}` : start
}

function eduDateRange(edu: Education, language: CVLanguage): string {
  const start = edu.start_date ? fmt(edu.start_date, language) : null
  const end   = edu.end_date   ? fmt(edu.end_date, language) : null
  if (start && end) return `${start} – ${end}`
  return start ?? end ?? ''
}

// ─── Shared components ────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: string }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionTitle}>{children}</Text>
    </View>
  )
}

function SidebarSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.sidebarSection}>
      <Text style={styles.sidebarTitle}>{title}</Text>
      {children}
    </View>
  )
}

// ─── Sidebar: Contact ─────────────────────────────────────────────────────────

function ContactSection({ profile, language }: { profile: Profile; language: CVLanguage }) {
  return (
    <SidebarSection title={LABELS[language].contact}>
      {profile.location    && <Text style={styles.sidebarText}>{profile.location}</Text>}
      {profile.nationality && <Text style={styles.sidebarText}>{profile.nationality}</Text>}
      {profile.phone       && <Text style={styles.sidebarText}>{profile.phone}</Text>}
      {profile.website     && (
        <Link src={profile.website} style={styles.sidebarLink}>
          {profile.website.replace(/^https?:\/\//, '')}
        </Link>
      )}
      {profile.github_url    && <Link src={profile.github_url}    style={styles.sidebarLink}>GitHub</Link>}
      {profile.linkedin_url  && <Link src={profile.linkedin_url}  style={styles.sidebarLink}>LinkedIn</Link>}
      {profile.twitter_url   && <Link src={profile.twitter_url}   style={styles.sidebarLink}>Twitter / X</Link>}
    </SidebarSection>
  )
}

// ─── Sidebar: Skills (with subcategory + level badge) ────────────────────────

function SidebarSkills({ items, language }: { items: Skill[]; language: CVLanguage }) {
  if (items.length === 0) return null

  const categoryLabels = SKILL_CATEGORY_LABELS_BY_LANGUAGE[language]
  const topSkills = items.filter((s) => s.is_top)

  // Build groups by (category + subcategory)
  const groupMap = new Map<string, { label: string; skills: Skill[] }>()
  for (const skill of items) {
    const key = `${skill.category}::${skill.subcategory ?? ''}`
    if (!groupMap.has(key)) {
      const catLabel = categoryLabels[skill.category as SkillCategory] ?? skill.category
      const label    = skill.subcategory ? `${catLabel} · ${skill.subcategory}` : catLabel
      groupMap.set(key, { label, skills: [] })
    }
    groupMap.get(key)!.skills.push(skill)
  }

  return (
    <SidebarSection title={LABELS[language].skills}>
      {/* Top skills row */}
      {topSkills.length > 0 && (
        <View style={{ marginBottom: 8 }}>
          <Text style={styles.skillCategoryLabel}>{LABELS[language].topSkills}</Text>
          <View style={styles.skillBadgesRow}>
            {topSkills.map((s) => (
              <View key={s.id} style={styles.skillBadge}>
                <Text>★ {s.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Groups */}
      {[...groupMap.values()].map(({ label, skills }) => (
        <View key={label} style={styles.skillGroup}>
          <Text style={styles.skillCategoryLabel}>{label}</Text>
          {skills.map((skill) => (
            <View key={skill.id} style={styles.skillRow}>
              <Text style={styles.skillName}>{skill.name}</Text>
              {skill.skill_level && (
                <Text style={[styles.skillName, { fontSize: 7, color: '#888' }]}>
                  {SKILL_LEVEL_QUALITATIVE_LABELS[skill.skill_level]}
                </Text>
              )}
            </View>
          ))}
        </View>
      ))}
    </SidebarSection>
  )
}

// ─── Sidebar: Courses ─────────────────────────────────────────────────────────

function SidebarCourses({ items, language }: { items: CVCourse[]; language: CVLanguage }) {
  if (items.length === 0) return null

  return (
    <SidebarSection title={LABELS[language].courses}>
      {items.map((course) => (
        <View key={course.id} style={styles.sidebarItem}>
          <Text style={styles.sidebarItemTitle}>{course.title}</Text>
          {course.provider    && <Text style={styles.sidebarItemMeta}>{course.provider}</Text>}
          {course.completed_at && <Text style={styles.sidebarItemMeta}>{fmt(course.completed_at, language)}</Text>}
          {course.credential_url && (
            <Link src={course.credential_url} style={styles.sidebarLink}>
              {LABELS[language].credential}
            </Link>
          )}
        </View>
      ))}
    </SidebarSection>
  )
}

// ─── Main: individual item card ───────────────────────────────────────────────
// Each item is its OWN independently-wrappable View so react-pdf can break
// between items instead of treating the whole section as an atomic block.

function ItemCard({ children }: { children: ReactNode }) {
  return <View style={styles.itemCard}>{children}</View>
}

function ExperienceSection({ items, language }: { items: WorkExperience[]; language: CVLanguage }) {
  if (items.length === 0) return null

  return (
    <View style={styles.sectionBlock}>
      <SectionHeading>{LABELS[language].experience}</SectionHeading>
      {items.map((exp) => (
        <ItemCard key={exp.id}>
          <View style={styles.itemHeaderRow}>
            <Text style={styles.itemTitle}>{exp.role}</Text>
            <Text style={styles.itemDate}>{expDateRange(exp, language)}</Text>
          </View>
          <Text style={styles.itemSubtitle}>{exp.company}</Text>
          {exp.location    && <Text style={styles.itemMeta}>{exp.location}</Text>}
          {exp.description && <Text style={styles.itemDesc}>{exp.description}</Text>}
        </ItemCard>
      ))}
    </View>
  )
}

function ProjectsSection({ items, language }: { items: CVProject[]; language: CVLanguage }) {
  if (items.length === 0) return null

  return (
    <View style={styles.sectionBlock}>
      <SectionHeading>{LABELS[language].projects}</SectionHeading>
      {items.map((project) => (
        <ItemCard key={project.id}>
          <View style={styles.itemHeaderRow}>
            <Text style={styles.itemTitle}>{project.title}</Text>
            {project.is_featured && (
              <Text style={styles.itemDate}>{LABELS[language].featured}</Text>
            )}
          </View>
          {project.description && <Text style={styles.itemDesc}>{project.description}</Text>}
          {project.tech_stack.length > 0 && (
            <View style={styles.techRow}>
              {project.tech_stack.map((tech) => (
                <Text key={tech} style={styles.techPill}>{tech}</Text>
              ))}
            </View>
          )}
          <View style={styles.linksRow}>
            {project.url      && <Link src={project.url}      style={styles.itemLink}>{LABELS[language].demo}</Link>}
            {project.repo_url && <Link src={project.repo_url} style={styles.itemLink}>{LABELS[language].repository}</Link>}
          </View>
        </ItemCard>
      ))}
    </View>
  )
}

function EducationSection({ items, language }: { items: Education[]; language: CVLanguage }) {
  if (items.length === 0) return null

  return (
    <View style={styles.sectionBlock}>
      <SectionHeading>{LABELS[language].education}</SectionHeading>
      {items.map((edu) => {
        const title = edu.field ? `${edu.degree} / ${edu.field}` : edu.degree
        const range = eduDateRange(edu, language)
        return (
          <ItemCard key={edu.id}>
            <View style={styles.itemHeaderRow}>
              <Text style={styles.itemTitle}>{title}</Text>
              {range && <Text style={styles.itemDate}>{range}</Text>}
            </View>
            <Text style={styles.itemSubtitle}>{edu.institution}</Text>
            {edu.description && <Text style={styles.itemDesc}>{edu.description}</Text>}
          </ItemCard>
        )
      })}
    </View>
  )
}

// ─── Document root ────────────────────────────────────────────────────────────

export function CVDocument({
  profile,
  experience,
  education,
  skills,
  courses,
  projects,
  language = 'es',
}: CVDocumentProps) {
  const displayName  = profile.full_name ?? `@${profile.username}`
  const hasMainContent = experience.length > 0 || projects.length > 0 || education.length > 0

  return (
    <Document
      title={`CV - ${displayName}`}
      author={displayName}
      creator="WINF"
      producer="WINF - @react-pdf/renderer"
    >
      <Page size="A4" style={styles.page}>
        {/* Hero */}
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <View style={styles.heroText}>
              <Text style={styles.name}>{displayName}</Text>
              {profile.headline && <Text style={styles.headline}>{profile.headline}</Text>}
              {profile.bio      && <Text style={styles.bio}>{profile.bio}</Text>}
            </View>
            {profile.avatar_url && (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={profile.avatar_url} style={styles.avatar} />
            )}
          </View>
        </View>

        {/*
          Body: sidebar (fixed width) + main column (flex 1).
          Each section in `main` is a standalone sectionBlock View
          (no shared background container), so react-pdf can break
          between individual items rather than treating the whole
          section as one atomic block.
        */}
        <View style={styles.body}>
          {/* Sidebar */}
          <View style={styles.sidebar}>
            <ContactSection profile={profile} language={language} />
            <SidebarSkills  items={skills}    language={language} />
            <SidebarCourses items={courses}   language={language} />
          </View>

          {/* Main — each section is independently breakable */}
          <View style={styles.main}>
            {hasMainContent ? (
              <>
                <ExperienceSection items={experience} language={language} />
                <ProjectsSection   items={projects}   language={language} />
                <EducationSection  items={education}  language={language} />
              </>
            ) : (
              <View style={styles.sectionBlock}>
                <Text style={styles.emptyText}>{LABELS[language].empty}</Text>
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  )
}
