import { createClient } from '@supabase/supabase-js'

/**
 * Admin client — bypasses RLS entirely.
 * ONLY use in server-side contexts: API routes, cron jobs.
 * NEVER expose SUPABASE_SERVICE_ROLE_KEY to the client bundle.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. ' +
      'Check your environment variables.',
    )
  }

  return createClient(url, key, {
    auth: {
      autoRefreshToken:  false,
      persistSession:    false,
      detectSessionInUrl: false,
    },
  })
}
