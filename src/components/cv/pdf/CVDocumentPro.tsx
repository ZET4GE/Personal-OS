import { Document, Page, Text, View, Link, Image } from '@react-pdf/renderer'
import type { ReactNode } from 'react'
import { styles } from './PDFStylesPro'
import { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS_BY_LANGUAGE, SKILL_LEVEL_LABELS_BY_LANGUAGE } from '@/types/cv'
import type { WorkExperience, Education, Skill, SkillCategory, CVCourse, CVProject, CVLanguage } from '@/types/cv'
import { CV_AVAILABILITY_LABELS } from '@/types/profile'
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
    contact: 'Contacto',
    birth: 'Nacimiento',
    skills: 'Skills',
    courses: 'Cursos',
    experience: 'Experiencia',
    projects: 'Proyectos',
    education: 'Educacion',
    present: 'Presente',
    featured: 'Destacado',
    credential: 'Credencial',
    demo: 'Demo',
    repository: 'Repositorio',
    empty: 'Este CV esta vacio por el momento.',
  },
  en: {
    contact: 'Contact',
    birth: 'Birth date',
    skills: 'Skills',
    courses: 'Courses',
    experience: 'Experience',
    projects: 'Projects',
    education: 'Education',
    present: 'Present',
    featured: 'Featured',
    credential: 'Credential',
    demo: 'Demo',
    repository: 'Repository',
    empty: 'This CV is empty for now.',
  },
} as const

function fmt(dateStr: string, language: CVLanguage = 'es'): string {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-ES', { year: 'numeric', month: 'short' }).format(
    new Date(dateStr + 'T00:00:00'),
  )
}

function expDateRange(exp: WorkExperience, language: CVLanguage): string {
  const start = fmt(exp.start_date, language)
  const end = exp.is_current ? LABELS[language].present : exp.end_date ? fmt(exp.end_date, language) : ''
  return end ? `${start} - ${end}` : start
}

function eduDateRange(edu: Education, language: CVLanguage): string {
  const start = edu.start_date ? fmt(edu.start_date, language) : null
  const end = edu.end_date ? fmt(edu.end_date, language) : null
  if (start && end) return `${start} - ${end}`
  return start ?? end ?? ''
}

function SectionHeading({ children }: { children: string }) {
  return (
    <View style={styles.sectionHeading}>
      <View style={styles.sectionAccent} />
      <Text style={styles.sectionTitle}>{children}</Text>
    </View>
  )
}

function MainSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.mainSection}>
      <SectionHeading>{title}</SectionHeading>
      {children}
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

function ContactSection({ profile, language }: { profile: Profile; language: CVLanguage }) {
  const labels = LABELS[language]

  return (
    <SidebarSection title={labels.contact}>
      {profile.location ? <Text style={styles.sidebarText}>{profile.location}</Text> : null}
      {profile.phone ? <Text style={styles.sidebarText}>{profile.phone}</Text> : null}
      {profile.availability ? (
        <Text style={styles.sidebarText}>{CV_AVAILABILITY_LABELS[profile.availability]}</Text>
      ) : null}
      {profile.birth_date ? <Text style={styles.sidebarText}>{labels.birth}: {profile.birth_date}</Text> : null}
      {profile.website ? (
        <Link src={profile.website} style={styles.sidebarLink}>
          {profile.website.replace(/^https?:\/\//, '')}
        </Link>
      ) : null}
      {profile.github_url ? <Link src={profile.github_url} style={styles.sidebarLink}>GitHub</Link> : null}
      {profile.linkedin_url ? <Link src={profile.linkedin_url} style={styles.sidebarLink}>LinkedIn</Link> : null}
      {profile.twitter_url ? <Link src={profile.twitter_url} style={styles.sidebarLink}>Twitter / X</Link> : null}
    </SidebarSection>
  )
}

function SidebarSkills({ items, language }: { items: Skill[]; language: CVLanguage }) {
  if (items.length === 0) return null

  const categoryLabels = SKILL_CATEGORY_LABELS_BY_LANGUAGE[language]
  const levelLabels = SKILL_LEVEL_LABELS_BY_LANGUAGE[language]
  const grouped = SKILL_CATEGORIES.reduce<Record<SkillCategory, Skill[]>>(
    (acc, cat) => {
      acc[cat] = items.filter((skill) => skill.category === cat)
      return acc
    },
    {} as Record<SkillCategory, Skill[]>,
  )

  return (
    <SidebarSection title={LABELS[language].skills}>
      {SKILL_CATEGORIES.map((cat) => {
        const skills = grouped[cat]
        if (skills.length === 0) return null

        return (
          <View key={cat} style={styles.skillGroup}>
            <Text style={styles.skillCategoryLabel}>{categoryLabels[cat]}</Text>
            <View style={styles.skillBadgesRow}>
              {skills.map((skill) => (
                <View key={skill.id} style={styles.skillBadge}>
                  <Text>
                    {skill.name}
                    {skill.level ? <Text style={styles.skillBadgeLevel}> - {levelLabels[skill.level]}</Text> : null}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )
      })}
    </SidebarSection>
  )
}

function SidebarCourses({ items, language }: { items: CVCourse[]; language: CVLanguage }) {
  if (items.length === 0) return null

  return (
    <SidebarSection title={LABELS[language].courses}>
      {items.map((course) => (
        <View key={course.id} style={styles.sidebarItem}>
          <Text style={styles.sidebarItemTitle}>{course.title}</Text>
          {course.provider ? <Text style={styles.sidebarItemMeta}>{course.provider}</Text> : null}
          {course.completed_at ? <Text style={styles.sidebarItemMeta}>{fmt(course.completed_at, language)}</Text> : null}
          {course.credential_url ? <Link src={course.credential_url} style={styles.sidebarLink}>{LABELS[language].credential}</Link> : null}
        </View>
      ))}
    </SidebarSection>
  )
}

function ExperienceSection({ items, language }: { items: WorkExperience[]; language: CVLanguage }) {
  if (items.length === 0) return null

  return (
    <MainSection title={LABELS[language].experience}>
      {items.map((exp, index) => {
        const isLast = index === items.length - 1
        return (
          <View key={exp.id} style={isLast ? [styles.itemCard, styles.lastItemCard] : styles.itemCard}>
            <View style={styles.itemHeaderRow}>
              <Text style={styles.itemTitle}>{exp.role}</Text>
              <Text style={styles.itemDate}>{expDateRange(exp, language)}</Text>
            </View>
            <Text style={styles.itemSubtitle}>{exp.company}</Text>
            {exp.location ? <Text style={styles.itemMeta}>{exp.location}</Text> : null}
            {exp.description ? <Text style={styles.itemDesc}>{exp.description}</Text> : null}
          </View>
        )
      })}
    </MainSection>
  )
}

function ProjectsSection({ items, language }: { items: CVProject[]; language: CVLanguage }) {
  if (items.length === 0) return null

  return (
    <MainSection title={LABELS[language].projects}>
      {items.map((project, index) => {
        const isLast = index === items.length - 1
        return (
          <View key={project.id} style={isLast ? [styles.itemCard, styles.lastItemCard] : styles.itemCard}>
            <View style={styles.itemHeaderRow}>
              <Text style={styles.itemTitle}>{project.title}</Text>
              {project.is_featured ? <Text style={styles.itemDate}>{LABELS[language].featured}</Text> : null}
            </View>
            {project.description ? <Text style={styles.itemDesc}>{project.description}</Text> : null}
            {project.tech_stack.length > 0 ? (
              <View style={styles.techRow}>
                {project.tech_stack.map((tech) => (
                  <Text key={tech} style={styles.techPill}>{tech}</Text>
                ))}
              </View>
            ) : null}
            <View style={styles.linksRow}>
              {project.url ? <Link src={project.url} style={styles.itemLink}>{LABELS[language].demo}</Link> : null}
              {project.repo_url ? <Link src={project.repo_url} style={styles.itemLink}>{LABELS[language].repository}</Link> : null}
            </View>
          </View>
        )
      })}
    </MainSection>
  )
}

function EducationSection({ items, language }: { items: Education[]; language: CVLanguage }) {
  if (items.length === 0) return null

  return (
    <MainSection title={LABELS[language].education}>
      {items.map((edu, index) => {
        const isLast = index === items.length - 1
        const title = edu.field ? `${edu.degree} / ${edu.field}` : edu.degree
        const range = eduDateRange(edu, language)

        return (
          <View key={edu.id} style={isLast ? [styles.itemCard, styles.lastItemCard] : styles.itemCard}>
            <View style={styles.itemHeaderRow}>
              <Text style={styles.itemTitle}>{title}</Text>
              {range ? <Text style={styles.itemDate}>{range}</Text> : null}
            </View>
            <Text style={styles.itemSubtitle}>{edu.institution}</Text>
            {edu.description ? <Text style={styles.itemDesc}>{edu.description}</Text> : null}
          </View>
        )
      })}
    </MainSection>
  )
}

export function CVDocument({ profile, experience, education, skills, courses, projects, language = 'es' }: CVDocumentProps) {
  const displayName = profile.full_name ?? `@${profile.username}`
  const hasMainContent = experience.length > 0 || projects.length > 0 || education.length > 0

  return (
    <Document
      title={`CV - ${displayName}`}
      author={displayName}
      creator="WINF"
      producer="WINF - @react-pdf/renderer"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <View style={styles.heroText}>
              <Text style={styles.name}>{displayName}</Text>
              {profile.headline ? <Text style={styles.headline}>{profile.headline}</Text> : null}
              {profile.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}
            </View>
            {profile.avatar_url ? (
              // @react-pdf/renderer Image does not expose an alt prop.
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image src={profile.avatar_url} style={styles.avatar} />
            ) : null}
          </View>
        </View>

        <View style={styles.body}>
          <View style={styles.sidebar}>
            <ContactSection profile={profile} language={language} />
            <SidebarSkills items={skills} language={language} />
            <SidebarCourses items={courses} language={language} />
          </View>

          <View style={styles.main}>
            {hasMainContent ? (
              <>
                <ExperienceSection items={experience} language={language} />
                <ProjectsSection items={projects} language={language} />
                <EducationSection items={education} language={language} />
              </>
            ) : (
              <MainSection title="CV">
                <Text style={styles.emptyText}>{LABELS[language].empty}</Text>
              </MainSection>
            )}
          </View>
        </View>
      </Page>
    </Document>
  )
}
