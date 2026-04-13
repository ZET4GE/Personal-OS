import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ─────────────────────────────────────────────────────────────
// Cleanup tasks
// ─────────────────────────────────────────────────────────────

async function deleteOldReadNotifications(supabase: ReturnType<typeof createAdminClient>) {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 30)

  const { error, count } = await supabase
    .from('notifications')
    .delete({ count: 'exact' })
    .eq('is_read', true)
    .lt('read_at', cutoff.toISOString())

  if (error) throw new Error(error.message)
  return count ?? 0
}

// ─────────────────────────────────────────────────────────────
// GET — called by Vercel Cron (Sundays 3 AM UTC)
// ─────────────────────────────────────────────────────────────

export async function GET(request: Request): Promise<NextResponse> {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn('[cron/cleanup] Unauthorized request')
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const timestamp = new Date().toISOString()
  console.log(`[cron/cleanup] Starting run at ${timestamp}`)

  const supabase = createAdminClient()
  const results: Record<string, number | string> = {}
  const errors: Array<{ task: string; error: string }> = []

  try {
    const deleted = await deleteOldReadNotifications(supabase)
    results.notifications_deleted = deleted
    console.log(`[cron/cleanup] Deleted ${deleted} old read notifications`)
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    console.error('[cron/cleanup] notifications cleanup failed:', msg)
    errors.push({ task: 'notifications_cleanup', error: msg })
  }

  const success = errors.length === 0
  console.log(`[cron/cleanup] Finished — success=${success}`)

  return NextResponse.json(
    { success, timestamp, results, errors },
    { status: success ? 200 : 207 },
  )
}
