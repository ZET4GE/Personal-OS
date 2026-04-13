'use client'

import { createBrowserClient } from '@supabase/ssr'

// Instanciar una vez por render del lado del cliente.
// Úsalo en Client Components: const supabase = createClient()
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  )
}
