import type { SupabaseClient } from '@supabase/supabase-js'
import type { Routine, RoutineItem, RoutineLog, RoutineWithStatus } from '@/types/habits'
import type {
  CreateRoutineData,
  UpdateRoutineData,
  CreateRoutineItemData,
  UpdateRoutineItemData,
} from '@/lib/validations/habits'

type Ok<T>     = { data: T; error: null }
type Err       = { data: null; error: string }
type Result<T> = Ok<T> | Err
const ok  = <T>(data: T): Ok<T> => ({ data, error: null })
const err = (msg: string): Err  => ({ data: null, error: msg })

// ─────────────────────────────────────────────────────────────
// Routines CRUD
// ─────────────────────────────────────────────────────────────

export async function getRoutines(supabase: SupabaseClient): Promise<Result<Routine[]>> {
  const { data, error } = await supabase
    .from('routines')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return err(error.message)
  return ok(data as Routine[])
}

export async function createRoutine(
  supabase: SupabaseClient,
  userId: string,
  input: CreateRoutineData,
): Promise<Result<Routine>> {
  const { data, error } = await supabase
    .from('routines')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Routine)
}

export async function updateRoutine(
  supabase: SupabaseClient,
  input: UpdateRoutineData,
): Promise<Result<Routine>> {
  const { id, ...patch } = input
  const { data, error } = await supabase
    .from('routines')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Routine)
}

export async function deleteRoutine(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<true>> {
  const { error } = await supabase.from('routines').delete().eq('id', id)
  if (error) return err(error.message)
  return ok(true as const)
}

// ─────────────────────────────────────────────────────────────
// Routine items CRUD
// ─────────────────────────────────────────────────────────────

export async function getRoutineItems(
  supabase: SupabaseClient,
  routineId: string,
): Promise<Result<RoutineItem[]>> {
  const { data, error } = await supabase
    .from('routine_items')
    .select('*')
    .eq('routine_id', routineId)
    .order('order_index', { ascending: true })

  if (error) return err(error.message)
  return ok(data as RoutineItem[])
}

export async function createRoutineItem(
  supabase: SupabaseClient,
  userId: string,
  input: CreateRoutineItemData,
): Promise<Result<RoutineItem>> {
  // Calculate next order_index
  const { count } = await supabase
    .from('routine_items')
    .select('*', { count: 'exact', head: true })
    .eq('routine_id', input.routine_id)

  const { data, error } = await supabase
    .from('routine_items')
    .insert({ ...input, user_id: userId, order_index: (count ?? 0) })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as RoutineItem)
}

export async function updateRoutineItem(
  supabase: SupabaseClient,
  input: UpdateRoutineItemData,
): Promise<Result<RoutineItem>> {
  const { id } = input
  const patch: Partial<RoutineItem> = {
    title: input.title,
    duration_minutes: input.duration_minutes,
  }
  const { data, error } = await supabase
    .from('routine_items')
    .update(patch)
    .eq('id', id)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as RoutineItem)
}

export async function deleteRoutineItem(
  supabase: SupabaseClient,
  id: string,
): Promise<Result<true>> {
  const { error } = await supabase.from('routine_items').delete().eq('id', id)
  if (error) return err(error.message)
  return ok(true as const)
}

// ─────────────────────────────────────────────────────────────
// Routine logs
// ─────────────────────────────────────────────────────────────

/**
 * Upserts a routine_log, toggling an item in completed_items.
 * Returns the updated log.
 */
export async function toggleRoutineItem(
  supabase: SupabaseClient,
  userId: string,
  routineId: string,
  itemId: string,
  date: string,   // 'YYYY-MM-DD'
): Promise<Result<RoutineLog>> {
  // Get or create log for today
  const { data: existing } = await supabase
    .from('routine_logs')
    .select('*')
    .eq('routine_id', routineId)
    .eq('completed_at', date)
    .maybeSingle()

  let currentItems: string[] = (existing as RoutineLog | null)?.completed_items ?? []

  // Toggle
  if (currentItems.includes(itemId)) {
    currentItems = currentItems.filter((id) => id !== itemId)
  } else {
    currentItems = [...currentItems, itemId]
  }

  const upsertData = {
    routine_id:      routineId,
    user_id:         userId,
    completed_at:    date,
    completed_items: currentItems,
    started_at:      (existing as RoutineLog | null)?.started_at ?? new Date().toISOString(),
    finished_at:     null as string | null,
  }

  const { data, error } = await supabase
    .from('routine_logs')
    .upsert(upsertData, { onConflict: 'routine_id,completed_at' })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as RoutineLog)
}

/**
 * Marks a routine as fully completed for today.
 */
export async function completeRoutine(
  supabase: SupabaseClient,
  userId: string,
  routineId: string,
  date: string,
  completedItems: string[],
): Promise<Result<RoutineLog>> {
  const { data, error } = await supabase
    .from('routine_logs')
    .upsert(
      {
        routine_id:      routineId,
        user_id:         userId,
        completed_at:    date,
        completed_items: completedItems,
        finished_at:     new Date().toISOString(),
      },
      { onConflict: 'routine_id,completed_at' },
    )
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as RoutineLog)
}

// ─────────────────────────────────────────────────────────────
// Rich queries
// ─────────────────────────────────────────────────────────────

/**
 * Returns all active routines with their items and today's log status.
 */
export async function getRoutinesWithStatus(
  supabase: SupabaseClient,
  userId: string,
  date: string,   // 'YYYY-MM-DD'
): Promise<Result<RoutineWithStatus[]>> {
  const [routinesRes, itemsRes, logsRes] = await Promise.all([
    supabase
      .from('routines')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('order_index', { ascending: true })
      .order('time_of_day', { ascending: true }),
    supabase
      .from('routine_items')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true }),
    supabase
      .from('routine_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('completed_at', date),
  ])

  if (routinesRes.error) return err(routinesRes.error.message)

  const routines = (routinesRes.data ?? []) as Routine[]
  const items    = (itemsRes.data   ?? []) as RoutineItem[]
  const logs     = (logsRes.data    ?? []) as RoutineLog[]
  const logMap   = new Map(logs.map((l) => [l.routine_id, l]))

  const result: RoutineWithStatus[] = routines.map((routine) => {
    const routineItems   = items.filter((i) => i.routine_id === routine.id)
    const log            = logMap.get(routine.id) ?? null
    const completedCount = log ? log.completed_items.length : 0
    const isCompleted    = !!log?.finished_at

    return {
      routine,
      items:   routineItems,
      log,
      completedCount,
      totalItems: routineItems.length,
      isCompleted,
    }
  })

  return ok(result)
}

/**
 * Returns a single routine with items and today's log (for the runner page).
 */
export async function getRoutineWithLog(
  supabase: SupabaseClient,
  routineId: string,
  userId: string,
  date: string,
): Promise<Result<{ routine: Routine; items: RoutineItem[]; log: RoutineLog | null }>> {
  const [routineRes, itemsRes, logRes] = await Promise.all([
    supabase.from('routines').select('*').eq('id', routineId).single(),
    supabase
      .from('routine_items')
      .select('*')
      .eq('routine_id', routineId)
      .order('order_index', { ascending: true }),
    supabase
      .from('routine_logs')
      .select('*')
      .eq('routine_id', routineId)
      .eq('user_id', userId)
      .eq('completed_at', date)
      .maybeSingle(),
  ])

  if (routineRes.error || !routineRes.data) return err('Rutina no encontrada')

  return ok({
    routine: routineRes.data as Routine,
    items:   (itemsRes.data ?? []) as RoutineItem[],
    log:     (logRes.data ?? null) as RoutineLog | null,
  })
}
