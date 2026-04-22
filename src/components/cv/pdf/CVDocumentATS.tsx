import { Document, Page, Text, View, Link, StyleSheet } from '@react-pdf/renderer'
import type { Profile } from '@/types/profile'
import type { CVCourse, CVLanguage, CVProject, Education, Skill, SkillCategory, WorkExperience } from '@/types/cv'
import { SKILL_CATEGORIES, SKILL_CATEGORY_LABELS_BY_LANGUAGE, SKILL_LEVEL_LABELS_BY_LANGUAGE } from '@/types/cv'

export interface CVDocumentATSProps {
  profile: Profile
  experience: WorkExperience[]
  education: Education[]
  skills: Skill[]
  courses: CVCourse[]
  projects: CVProject[]
  language?: CVLanguage
}

const styles = StyleSheet.create({
  page: {
    padding: 38,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#111827',
    lineHeight: 1.45,
    backgroundColor: '#ffffff',
  },
  header: {
    borderBottomWidth: 1,
    borderBottomColor: '#111827',
    paddingBottom: 10,
    marginBottom: 14,
  },
  name: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headline: {
    fontSize: 11,
    color: '#374151',
    marginBottom: 6,
  },
  contact: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    color: '#374151',
    fontSize: 9,
  },
  link: {
    color: '#111827',
    textDecoration: 'none',
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    borderBottomWidth: 0.6,
    borderBottomColor: '#d1d5db',
    paddingBottom: 3,
    marginBottom: 7,
    letterSpacing: 0.7,
  },
  item: {
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  itemTitle: {
    fontSize: 10.5,
    fontWeight: 'bold',
  },
  itemMeta: {
    color: '#4b5563',
    fontSize: 9,
  },
  date: {
    color: '#4b5563',
    fontSize: 9,
    flexShrink: 0,
  },
  bodyText: {
    color: '#374151',
    marginTop: 3,
  },
  bullet: {
    color: '#374151',
    marginTop: 2,
  },
  skillCategory: {
    marginBottom: 5,
  },
  skillLine: {
    color: '#374151',
  },
})

const LABELS = {
  es: {
    summary: 'Perfil',
    experience: 'Experiencia',
    education: 'Educacion',
    skills: 'Skills',
    topSkills: 'Top skills',
    courses: 'Cursos',
    projects: 'Proyectos',
    present: 'Presente',
    featured: 'Destacado',
    credential: 'Credencial',
    demo: 'Demo',
    repository: 'Repositorio',
    evidence: 'Evidencia',
    birth: 'Nacimiento',
  },
  en: {
    summary: 'Profile',
    experience: 'Experience',
    education: 'Education',
    skills: 'Skills',
    topSkills: 'Top skills',
    courses: 'Courses',
    projects: 'Projects',
    present: 'Present',
    featured: 'Featured',
    credential: 'Credential',
    demo: 'Demo',
    repository: 'Repository',
    evidence: 'Evidence',
    birth: 'Birth date',
  },
} as const

function formatMonthYear(dateStr: string, language: CVLanguage): string {
  return new Intl.DateTimeFormat(language === 'en' ? 'en-US' : 'es-ES', {
    year: 'numeric',
    month: 'short',
  }).format(new Date(dateStr + 'T00:00:00'))
}

function expRange(exp: WorkExperience, language: CVLanguage): string {
  const labels = LABELS[language]
  const start = formatMonthYear(exp.start_date, language)
  const end = exp.is_current ? labels.present : exp.end_date ? formatMonthYear(exp.end_date, language) : ''
  return end ? `${start} - ${end}` : start
}

function eduRange(edu: Education, language: CVLanguage): string {
  const start = edu.start_date ? formatMonthYear(edu.start_date, language) : null
  const end = edu.end_date ? formatMonthYear(edu.end_date, language) : null
  if (start && end) return `${start} - ${end}`
  return start ?? end ?? ''
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  )
}

function TextBlock({ value }: { value: string | null }) {
  if (!value) return null

  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)

  if (lines.length <= 1) return <Text style={styles.bodyText}>{value}</Text>

  return (
    <View style={{ marginTop: 3 }}>
      {lines.map((line) => (
        <Text key={line} style={styles.bullet}>- {line.replace(/^[-•]\s*/, '')}</Text>
      ))}
    </View>
  )
}

function Contact({ profile, labels }: { profile: Profile; labels: typeof LABELS[CVLanguage] }) {
  const contactItems = [
    profile.location,
    profile.phone,
    profile.birth_date ? `${labels.birth}: ${profile.birth_date}` : null,
  ].filter(Boolean)

  return (
    <View style={styles.contact}>
      {contactItems.map((item) => <Text key={item}>{item}</Text>)}
      {profile.website ? <Link src={profile.website} style={styles.link}>{profile.website.replace(/^https?:\/\//, '')}</Link> : null}
      {profile.github_url ? <Link src={profile.github_url} style={styles.link}>GitHub</Link> : null}
      {profile.linkedin_url ? <Link src={profile.linkedin_url} style={styles.link}>LinkedIn</Link> : null}
    </View>
  )
}

function SkillsSection({ skills, language }: { skills: Skill[]; language: CVLanguage }) {
  if (skills.length === 0) return null

  const labels = LABELS[language]
  const categoryLabels = SKILL_CATEGORY_LABELS_BY_LANGUAGE[language]
  const levelLabels = SKILL_LEVEL_LABELS_BY_LANGUAGE[language]
  const topSkills = skills.filter((skill) => skill.is_top)
  const grouped = SKILL_CATEGORIES.reduce<Record<SkillCategory, Skill[]>>((acc, category) => {
    acc[category] = skills.filter((skill) => skill.category === category)
    return acc
  }, {} as Record<SkillCategory, Skill[]>)

  return (
    <Section title={labels.skills}>
      {topSkills.length > 0 ? (
        <View style={styles.skillCategory}>
          <Text style={styles.itemTitle}>{labels.topSkills}: {topSkills.map((skill) => skill.name).join(', ')}</Text>
        </View>
      ) : null}

      {SKILL_CATEGORIES.map((category) => {
        const items = grouped[category]
        if (items.length === 0) return null

        return (
          <View key={category} style={styles.skillCategory}>
            <Text style={styles.itemTitle}>{categoryLabels[category]}</Text>
            {items.map((skill) => {
              const level = skill.level ? ` (${levelLabels[skill.level]})` : ''
              const keywords = skill.keywords?.length ? ` - ${skill.keywords.join(', ')}` : ''
              return (
                <Text key={skill.id} style={styles.skillLine}>
                  {skill.name}{level}{keywords}
                  {skill.evidence ? ` - ${labels.evidence}: ${skill.evidence}` : ''}
                </Text>
              )
            })}
          </View>
        )
      })}
    </Section>
  )
}

export function CVDocumentATS({
  profile,
  experience,
  education,
  skills,
  courses,
  projects,
  language = 'es',
}: CVDocumentATSProps) {
  const labels = LABELS[language]
  const displayName = profile.full_name ?? `@${profile.username}`

  return (
    <Document
      title={`ATS CV - ${displayName}`}
      author={displayName}
      creator="WINF"
      producer="WINF - @react-pdf/renderer"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{displayName}</Text>
          {profile.headline ? <Text style={styles.headline}>{profile.headline}</Text> : null}
          <Contact profile={profile} labels={labels} />
        </View>

        {profile.bio ? (
          <Section title={labels.summary}>
            <Text style={styles.bodyText}>{profile.bio}</Text>
          </Section>
        ) : null}

        {experience.length > 0 ? (
          <Section title={labels.experience}>
            {experience.map((item) => (
              <View key={item.id} style={styles.item}>
                <View style={styles.row}>
                  <Text style={styles.itemTitle}>{item.role}</Text>
                  <Text style={styles.date}>{expRange(item, language)}</Text>
                </View>
                <Text style={styles.itemMeta}>{item.company}{item.location ? ` - ${item.location}` : ''}</Text>
                <TextBlock value={item.description} />
              </View>
            ))}
          </Section>
        ) : null}

        {projects.length > 0 ? (
          <Section title={labels.projects}>
            {projects.map((project) => (
              <View key={project.id} style={styles.item}>
                <Text style={styles.itemTitle}>{project.title}{project.is_featured ? ` - ${labels.featured}` : ''}</Text>
                <TextBlock value={project.description} />
                {project.tech_stack.length > 0 ? <Text style={styles.itemMeta}>{project.tech_stack.join(', ')}</Text> : null}
                {project.url ? <Link src={project.url} style={styles.link}>{labels.demo}</Link> : null}
                {project.repo_url ? <Link src={project.repo_url} style={styles.link}>{labels.repository}</Link> : null}
              </View>
            ))}
          </Section>
        ) : null}

        {education.length > 0 ? (
          <Section title={labels.education}>
            {education.map((item) => {
              const title = item.field ? `${item.degree} - ${item.field}` : item.degree
              const range = eduRange(item, language)
              return (
                <View key={item.id} style={styles.item}>
                  <View style={styles.row}>
                    <Text style={styles.itemTitle}>{title}</Text>
                    {range ? <Text style={styles.date}>{range}</Text> : null}
                  </View>
                  <Text style={styles.itemMeta}>{item.institution}</Text>
                  <TextBlock value={item.description} />
                </View>
              )
            })}
          </Section>
        ) : null}

        {courses.length > 0 ? (
          <Section title={labels.courses}>
            {courses.map((course) => (
              <View key={course.id} style={styles.item}>
                <Text style={styles.itemTitle}>{course.title}</Text>
                <Text style={styles.itemMeta}>
                  {[course.provider, course.completed_at ? formatMonthYear(course.completed_at, language) : null].filter(Boolean).join(' - ')}
                </Text>
                <TextBlock value={course.description} />
                {course.credential_url ? <Link src={course.credential_url} style={styles.link}>{labels.credential}</Link> : null}
              </View>
            ))}
          </Section>
        ) : null}

        <SkillsSection skills={skills} language={language} />
      </Page>
    </Document>
  )
}
