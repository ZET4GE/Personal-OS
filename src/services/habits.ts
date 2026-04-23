import type { SupabaseClient } from '@supabase/supabase-js'
import type { Habit, HabitLog, HabitWithLogs, HabitDay } from '@/types/habits'
import type { CreateHabitData, UpdateHabitData } from '@/lib/validations/habits'

type Ok<T>     = { data: T; error: null }
type Err       = { data: null; error: string }
type Result<T> = Ok<T> | Err
const ok  = <T>(data: T): Ok<T> => ({ data, error: null })
const err = (msg: string): Err  => ({ data: null, error: msg })

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

/** Returns 'YYYY-MM-DD' for a Date offset by N days from a reference */
function offsetDate(from: Date, days: number): string {
  const d = new Date(from)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

/** Whether a habit is expected on a given JS Date */
export function isHabitDueOn(habit: Habit, date: Date): boolean {
  const dow = date.getDay() // 0=Sun, 1=Mon, ..., 6=Sat
  if (habit.frequency === 'daily')    return true
  if (habit.frequency === 'weekdays') return dow >= 1 && dow <= 5
  // weekly: check target_days array
  return habit.target_days.includes(dow)
}

/** Calculate current streak from an ordered (desc) array of log date strings */
export function calculateStreak(
  logDates: string[],   // sorted desc, 'YYYY-MM-DD'
  habit: Habit,
  todayStr: string,
): number {
  const logSet = new Set(logDates)
  let streak   = 0
  const cursor = new Date(todayStr + 'T12:00:00')

  // Walk backwards from today
  for (let i = 0; i < 365; i++) {
    const dateStr = cursor.toISOString().slice(0, 10)
    const isDue   = isHabitDueOn(habit, cursor)

    if (!isDue) {
      // Non-due day: skip (doesn't break streak)
      cursor.setDate(cursor.getDate() - 1)
      continue
    }

    if (logSet.has(dateStr)) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  return streak
}

// ─────────────────────────────────────────────────────────────
// CRUD
// ─────────────────────────────────────────────────────────────

export async function getHabits(supabase: SupabaseClient): Promise<Result<Habit[]>> {
  const { data, error } = await supabase
    .from('habits')
    .select('*')
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })

  if (error) return err(error.message)
  return ok(data as Habit[])
}

export async function createHabit(
  supabase: SupabaseClient,
  userId: string,
  input: CreateHabitData,
): Promise<Result<Habit>> {
  const { data, error } = await supabase
    .from('habits')
    .insert({ ...input, user_id: userId })
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Habit)
}

export async function updateHabit(
  supabase: SupabaseClient,
  userId: string,
  input: UpdateHabitData,
): Promise<Result<Habit>> {
  const { id, ...patch } = input
  const { data, error } = await supabase
    .from('habits')
    .update(patch)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) return err(error.message)
  return ok(data as Habit)
}

export async function setHabitActive(
  supabase: SupabaseClient,
  userId: string,
  id: string,
  is_active: boolean,
): Promise<Result<true>> {
  const { error } = await supabase.from('habits').update({ is_active }).eq('id', id).eq('user_id', userId)
  if (error) return err(error.message)
  return ok(true as const)
}

export async function deleteHabit(
  supabase: SupabaseClient,
  userId: string,
  id: string,
): Promise<Result<true>> {
  const { error } = await supabase.from('habits').delete().eq('id', id).eq('user_id', userId)
  if (error) return err(error.message)
  return ok(true as const)
}

// ─────────────────────────────────────────────────────────────
// Logs
// ─────────────────────────────────────────────────────────────

/**
 * Toggles a habit log for a given date.
 * If it exists → delete. If it doesn't → insert.
 * Returns whether the habit is now completed.
 */
export async function toggleHabitLog(
  supabase: SupabaseClient,
  userId: string,
  habitId: string,
  date: string,   // 'YYYY-MM-DD'
): Promise<Result<{ completed: boolean; logId: string | null }>> {
  const { data: habit } = await supabase
    .from('habits')
    .select('id')
    .eq('id', habitId)
    .eq('user_id', userId)
    .maybeSingle()

  if (!habit) return err('Habito no encontrado')

  // Check if log exists
  const { data: existing } = await supabase
    .from('habit_logs')
    .select('id')
    .eq('habit_id', habitId)
    .eq('user_id', userId)
    .eq('completed_at', date)
    .maybeSingle()

  if (existing) {
    // Delete
    const { error } = await supabase.from('habit_logs').delete().eq('id', existing.id).eq('user_id', userId)
    if (error) return err(error.message)
    return ok({ completed: false, logId: null })
  }

  // Insert
  const { data, error } = await supabase
    .from('habit_logs')
    .insert({ habit_id: habitId, user_id: userId, completed_at: date })
    .select('id')
    .single()

  if (error) return err(error.message)
  return ok({ completed: true, logId: data.id })
}

// ─────────────────────────────────────────────────────────────
// Rich queries
// ─────────────────────────────────────────────────────────────

/**
 * Returns all ACTIVE habits with:
 * - whether they are completed on `dateStr`
 * - last 7 days mini-calendar data
 * - current streak
 */
export async function getHabitsWithLogs(
  supabase: SupabaseClient,
  userId: string,
  dateStr: string,   // 'YYYY-MM-DD' — the day being viewed
): Promise<Result<HabitWithLogs[]>> {
  // 1. Fetch all active habits
  const { data: habits, error: habitsErr } = await supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('order_index', { ascending: true })
    .order('created_at', { ascending: true })

  if (habitsErr) return err(habitsErr.message)
  if (!habits?.length) return ok([])

  // 2. Fetch logs for last 90 days (for streak) from today backwards
  const today     = new Date(dateStr + 'T12:00:00')
  const since90   = offsetDate(today, -89)

  const { data: logs, error: logsErr } = await supabase
    .from('habit_logs')
    .select('habit_id, completed_at')
    .eq('user_id', userId)
    .gte('completed_at', since90)
    .lte('completed_at', dateStr)
    .order('completed_at', { ascending: false })

  if (logsErr) return err(logsErr.message)

  // Group logs by habit_id
  const logsByHabit = new Map<string, string[]>()
  for (const log of (logs as HabitLog[])) {
    const arr = logsByHabit.get(log.habit_id) ?? []
    arr.push(log.completed_at)
    logsByHabit.set(log.habit_id, arr)
  }

  // Build mini-calendar (last 7 days including today)
  const last7: Date[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    last7.push(d)
  }

  // Build 30-day range for stats view
  const last30: Date[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    last30.push(d)
  }

  const result: HabitWithLogs[] = (habits as Habit[]).map((habit) => {
    const habitLogs = logsByHabit.get(habit.id) ?? []
    const logSet    = new Set(habitLogs)

    const todayCompleted = logSet.has(dateStr)

    const recentDays: HabitDay[] = last7.map((d) => {
      const dStr = d.toISOString().slice(0, 10)
      return {
        date:      dStr,
        completed: logSet.has(dStr),
        isDue:     isHabitDueOn(habit, d),
      }
    })

    const last30days: HabitDay[] = last30.map((d) => {
      const dStr = d.toISOString().slice(0, 10)
      return {
        date:      dStr,
        completed: logSet.has(dStr),
        isDue:     isHabitDueOn(habit, d),
      }
    })

    const streak = calculateStreak(habitLogs, habit, dateStr)

    return { habit, todayCompleted, recentDays, last30days, streak }
  })

  return ok(result)
}
