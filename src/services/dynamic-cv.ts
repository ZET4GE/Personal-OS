import { createClient } from '@/lib/supabase/client'
import type { DynamicCV, DynamicCVExperience, DynamicCVProject, Skill, SkillCategory } from '@/types/cv'
import type { Note } from '@/types/notes'
import type { Project } from '@/types/projects'

type GoalRow = {
  id: string
  title: string
  description: string | null
  category: string
  status: string
  completed_at: string | null
  updated_at: string
}

type GoalLinkRow = {
  goal_id: string
  entity_type: 'project' | 'skill' | 'note'
  entity_id: string
}

type DynamicCVResult =
  | { data: DynamicCV; error: null }
  | { data: null; error: string }

function inferSkillCategory(name: string): SkillCategory {
  const value = name.toLowerCase()
  if (['english', 'spanish', 'portuguese', 'idioma'].some((token) => value.includes(token))) return 'language'
  if (['leadership', 'communication', 'teamwork', 'management', 'negoci', 'speaking'].some((token) => value.includes(token))) return 'soft'
  if (['figma', 'notion', 'jira', 'slack', 'github', 'gitlab', 'trello'].some((token) => value.includes(token))) return 'tool'
  return 'technical'
}

export async function getDynamicCV(userId: string): Promise<DynamicCVResult> {
  const supabase = createClient()

  const { data: goals, error: goalsError } = await supabase
    .from('goals')
    .select('id, title, description, category, status, completed_at, updated_at')
    .eq('user_id', userId)
    .in('category', ['career', 'learning'])
    .order('updated_at', { ascending: false })

  if (goalsError) return { data: null, error: goalsError.message }

  const filteredGoals = (goals ?? []) as GoalRow[]
  if (filteredGoals.length === 0) return { data: { experience: [], projects: [], skills: [] }, error: null }

  const goalIds = filteredGoals.map((goal) => goal.id)
  const { data: links, error: linksError } = await supabase
    .from('goal_links')
    .select('goal_id, entity_type, entity_id')
    .in('goal_id', goalIds)
    .in('entity_type', ['project', 'skill', 'note'])

  if (linksError) return { data: null, error: linksError.message }

  const goalLinks = (links ?? []) as GoalLinkRow[]
  const projectIds = [...new Set(goalLinks.filter((link) => link.entity_type === 'project').map((link) => link.entity_id))]
  const skillIds = [...new Set(goalLinks.filter((link) => link.entity_type === 'skill').map((link) => link.entity_id))]
  const noteIds = [...new Set(goalLinks.filter((link) => link.entity_type === 'note').map((link) => link.entity_id))]

  const [projectsRes, skillsRes, notesRes] = await Promise.all([
    projectIds.length === 0
      ? Promise.resolve({ data: [] as Project[], error: null })
      : supabase.from('projects').select('*').eq('user_id', userId).in('id', projectIds),
    skillIds.length === 0
      ? Promise.resolve({ data: [] as Skill[], error: null })
      : supabase.from('skills').select('*').eq('user_id', userId).in('id', skillIds),
    noteIds.length === 0
      ? Promise.resolve({ data: [] as Note[], error: null })
      : supabase.from('notes').select('*').eq('user_id', userId).in('id', noteIds),
  ])

  if (projectsRes.error) return { data: null, error: projectsRes.error.message }
  if (skillsRes.error) return { data: null, error: skillsRes.error.message }
  if (notesRes.error) return { data: null, error: notesRes.error.message }

  const projects = (projectsRes.data ?? []) as Project[]
  const skills = (skillsRes.data ?? []) as Skill[]
  const notes = (notesRes.data ?? []) as Note[]

  const projectMap = new Map(projects.map((project) => [project.id, project]))
  const skillMap = new Map(skills.map((skill) => [skill.id, skill]))
  const noteMap = new Map(notes.map((note) => [note.id, note]))

  const dynamicProjects: DynamicCVProject[] = projectIds
    .map((projectId) => projectMap.get(projectId))
    .filter((project): project is Project => Boolean(project))
    .map((project) => ({
      id: project.id,
      title: project.title,
      description: project.description,
      is_completed: project.status === 'completed',
    }))

  const uniqueSkills = new Map<string, Skill>()

  for (const skill of skillIds.map((skillId) => skillMap.get(skillId)).filter((skill): skill is Skill => Boolean(skill))) {
    uniqueSkills.set(skill.name.trim().toLowerCase(), skill)
  }

  for (const note of noteIds.map((noteId) => noteMap.get(noteId)).filter((note): note is Note => Boolean(note))) {
    for (const tag of note.tags ?? []) {
      const normalized = tag.trim().toLowerCase()
      if (!normalized || uniqueSkills.has(normalized)) continue

      uniqueSkills.set(normalized, {
        id: `tag-${normalized}`,
        user_id: userId,
        name: tag,
        category: inferSkillCategory(tag),
        level: null,
        order_index: 999,
      })
    }
  }

  const dynamicExperience: DynamicCVExperience[] = filteredGoals
    .filter((goal) => goal.status === 'completed')
    .map((goal) => {
      const linkedNote = goalLinks
        .filter((link) => link.goal_id === goal.id && link.entity_type === 'note')
        .map((link) => noteMap.get(link.entity_id))
        .find(Boolean)

      return {
        id: goal.id,
        title: goal.title,
        description: linkedNote?.excerpt ?? linkedNote?.content ?? goal.description,
        completed_at: goal.completed_at ?? goal.updated_at,
      }
    })

  return {
    data: {
      experience: dynamicExperience,
      projects: dynamicProjects,
      skills: [...uniqueSkills.values()],
    },
    error: null,
  }
}
