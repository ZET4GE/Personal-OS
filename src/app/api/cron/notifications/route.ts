import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

type FnResult = 'ok' | null
interface CronResults {
  deadlines: FnResult
  payments:  FnResult
  streaks:   FnResult
  errors:    Array<{ function: string; error: string }>
}

// ─────────────────────────────────────────────────────────────
// Runner
// ─────────────────────────────────────────────────────────────

async function runNotificationFunctions(): Promise<CronResults> {
  const supabase = createAdminClient()
  const results: CronResults = {
    deadlines: null,
    payments:  null,
    streaks:   null,
    errors:    [],
  }

  const fns: Array<{ key: keyof Omit<CronResults, 'errors'>; rpc: string }> = [
    { key: 'deadlines', rpc: 'check_upcoming_deadlines' },
    { key: 'payments',  rpc: 'check_pending_payments'   },
    { key: 'streaks',   rpc: 'notify_habit_streak'      },
  ]

  for (const { key, rpc } of fns) {
    const { error } = await supabase.rpc(rpc)
    if (error) {
      console.error(`[cron/notifications] ${rpc} failed:`, error.message)
      results.errors.push({ function: key, error: error.message })
    } else {
      results[key] = 'ok'
      console.log(`[cron/notifications] ${rpc} — ok`)
    }
  }

  return results
}

// ─────────────────────────────────────────────────────────────
// GET — called by Vercel Cron
// ─────────────────────────────────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  // Verify Vercel Cron authorization
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('[cron/notifications] Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const timestamp = new Date().toISOString()
  console.log(`[cron/notifications] Starting run at ${timestamp}`)

  const results = await runNotificationFunctions()

  const success = results.errors.length === 0
  console.log(`[cron/notifications] Finished — success=${success}`)

  return NextResponse.json(
    { success, timestamp, results },
    { status: success ? 200 : 207 },  // 207 Multi-Status when some fns failed
  )
}
