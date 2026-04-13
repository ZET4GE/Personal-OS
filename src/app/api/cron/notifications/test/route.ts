import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Manual trigger for development only.
 * Runs all notification functions without requiring CRON_SECRET.
 * Returns a detailed response for debugging.
 */
export async function GET(): Promise<NextResponse> {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'This endpoint is only available in development.' },
      { status: 403 },
    )
  }

  const supabase = createAdminClient()
  const timestamp = new Date().toISOString()

  const results: Record<string, 'ok' | string> = {}

  const fns = [
    { key: 'check_upcoming_deadlines', rpc: 'check_upcoming_deadlines' },
    { key: 'check_pending_payments',   rpc: 'check_pending_payments'   },
    { key: 'notify_habit_streak',      rpc: 'notify_habit_streak'      },
  ] as const

  for (const { key, rpc } of fns) {
    const { error } = await supabase.rpc(rpc)
    results[key] = error ? `error: ${error.message}` : 'ok'
  }

  const success = Object.values(results).every((v) => v === 'ok')

  return NextResponse.json({ success, timestamp, results })
}
