import type { SupabaseClient } from '@supabase/supabase-js'
import type { WorkExperience, Education, Skill, CVCourse, CVProject } from '@/types/cv'
import type {
  CreateWorkExperienceData,
  UpdateWorkExperienceData,
  CreateEducationData,
  UpdateEducationData,
  CreateSkillData,
  UpdateSkillData,
  CreateCVCourseData,
  UpdateCVCourseData,
  CreateCVProjectData,
  UpdateCVProjectData,
} from '@/lib/validations/cv'

// ─────────────────────────────────────────────────────────────
// Result helpers
// ─────────────────────────────────────────────────────────────

type Ok<T>     = { data: T; error: null }
type Err       = { data: null; error: string }
type Result<T> = Ok<T> | Err

function ok<T>(data: T): Ok<T> { return { data, error: null } }
function err(msg: string): Err  { return { data: null, error: msg } }

// ─────────────────────────────────────────────────────────────
// Work Experience
// ─────────────────────────────────────────────────────────────

export async function getWorkExperience(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<WorkExperience[]>> {
  const { data, error } = await supabase
    .from('work_experience')
    .select('*')
    .eq('user_id', userId)
    .order('order_index', { ascending: true })
    .order('start_date', { ascending: false })

  if (error) return err(error.message)
  return ok(data as WorkExperience[])
}

export async function createWorkExperience(
  supabase: SupabaseClient,
  userId: string,
  input: CreateWorkExperienceData,
): Promise<Result<WorkExperience>> {
  const { data, error } = await supabase
    .from('work_experience')
    .insert({ user_id: userId, ...input })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as WorkExperience)
}

export async function updateWorkExperience(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateWorkExperienceData,
): Promise<Result<WorkExperience>> {
  const { id, ...patch } = input
  const { data, error } = await supabase
    .from('work_experience')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as WorkExperience)
}

export async function deleteWorkExperience(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('work_experience')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  return { error: error?.message ?? null }
}

// ─────────────────────────────────────────────────────────────
// Education
// ─────────────────────────────────────────────────────────────

export async function getEducation(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<Education[]>> {
  const { data, error } = await supabase
    .from('education')
    .select('*')
    .eq('user_id', userId)
    .order('order_index', { ascending: true })
    .order('start_date', { ascending: false })

  if (error) return err(error.message)
  return ok(data as Education[])
}

export async function createEducation(
  supabase: SupabaseClient,
  userId: string,
  input: CreateEducationData,
): Promise<Result<Education>> {
  const { data, error } = await supabase
    .from('education')
    .insert({ user_id: userId, ...input })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Education)
}

export async function updateEducation(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateEducationData,
): Promise<Result<Education>> {
  const { id, ...patch } = input
  const { data, error } = await supabase
    .from('education')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Education)
}

export async function deleteEducation(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('education')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  return { error: error?.message ?? null }
}

// ─────────────────────────────────────────────────────────────
// Skills
// ─────────────────────────────────────────────────────────────

export async function getSkills(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<Skill[]>> {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', userId)
    .order('category', { ascending: true })
    .order('order_index', { ascending: true })

  if (error) return err(error.message)
  return ok(data as Skill[])
}

export async function createSkill(
  supabase: SupabaseClient,
  userId: string,
  input: CreateSkillData,
): Promise<Result<Skill>> {
  const { data, error } = await supabase
    .from('skills')
    .insert({ user_id: userId, ...input })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Skill)
}

export async function updateSkill(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateSkillData,
): Promise<Result<Skill>> {
  const { id, ...patch } = input
  const { data, error } = await supabase
    .from('skills')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Skill)
}

export async function deleteSkill(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  return { error: error?.message ?? null }
}

// Courses

export async function getCVCourses(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<CVCourse[]>> {
  const { data, error } = await supabase
    .from('cv_courses')
    .select('*')
    .eq('user_id', userId)
    .order('order_index', { ascending: true })
    .order('completed_at', { ascending: false })

  if (error) return err(error.message)
  return ok(data as CVCourse[])
}

export async function createCVCourse(
  supabase: SupabaseClient,
  userId: string,
  input: CreateCVCourseData,
): Promise<Result<CVCourse>> {
  const { data, error } = await supabase
    .from('cv_courses')
    .insert({ user_id: userId, ...input })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as CVCourse)
}

export async function updateCVCourse(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateCVCourseData,
): Promise<Result<CVCourse>> {
  const { id, ...patch } = input
  const { data, error } = await supabase
    .from('cv_courses')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as CVCourse)
}

export async function deleteCVCourse(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('cv_courses')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  return { error: error?.message ?? null }
}

// CV Projects

export async function getCVProjects(
  supabase: SupabaseClient,
  userId: string,
): Promise<Result<CVProject[]>> {
  const { data, error } = await supabase
    .from('cv_projects')
    .select('*')
    .eq('user_id', userId)
    .order('is_featured', { ascending: false })
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) return err(error.message)
  return ok(data as CVProject[])
}

export async function createCVProject(
  supabase: SupabaseClient,
  userId: string,
  input: CreateCVProjectData,
): Promise<Result<CVProject>> {
  const { data, error } = await supabase
    .from('cv_projects')
    .insert({ user_id: userId, ...input })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as CVProject)
}

export async function updateCVProject(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateCVProjectData,
): Promise<Result<CVProject>> {
  const { id, ...patch } = input
  const { data, error } = await supabase
    .from('cv_projects')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as CVProject)
}

export async function deleteCVProject(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('cv_projects')
    .delete()
    .eq('id', id)
    .eq('user_id', userId)

  return { error: error?.message ?? null }
}
