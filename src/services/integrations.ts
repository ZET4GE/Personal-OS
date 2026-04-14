import type { SupabaseClient } from '@supabase/supabase-js'
import type { Integration, Provider, SaveIntegrationInput } from '@/types/integrations'

// ─────────────────────────────────────────────────────────────
// Read
// ─────────────────────────────────────────────────────────────

export async function getIntegrations(
  supabase: SupabaseClient,
  userId: string,
): Promise<Integration[]> {
  const { data } = await supabase
    .from('user_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
  return (data ?? []) as Integration[]
}

export async function getIntegration(
  supabase: SupabaseClient,
  userId: string,
  provider: Provider,
): Promise<Integration | null> {
  const { data } = await supabase
    .from('user_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', provider)
    .eq('is_active', true)
    .single()
  return (data ?? null) as Integration | null
}

/** Quick check — returns a map of which providers are connected */
export async function getActiveProviders(
  supabase: SupabaseClient,
  userId: string,
): Promise<Record<Provider, boolean>> {
  const { data } = await supabase
    .from('user_integrations')
    .select('provider')
    .eq('user_id', userId)
    .eq('is_active', true)

  const rows = (data ?? []) as Array<{ provider: string }>
  return {
    google: rows.some((r) => r.provider === 'google'),
    github: rows.some((r) => r.provider === 'github'),
  }
}

// ─────────────────────────────────────────────────────────────
// Write
// ─────────────────────────────────────────────────────────────

export async function saveIntegration(
  supabase: SupabaseClient,
  userId: string,
  input: SaveIntegrationInput,
): Promise<Integration | null> {
  const payload = {
    user_id:          userId,
    provider:         input.provider,
    access_token:     input.access_token,
    refresh_token:    input.refresh_token    ?? null,
    token_expires_at: input.token_expires_at ?? null,
    scope:            input.scope            ?? null,
    provider_user_id: input.provider_user_id ?? null,
    provider_email:   input.provider_email   ?? null,
    metadata:         input.metadata         ?? {},
    is_active:        true,
    connected_at:     new Date().toISOString(),
  }

  const { data, error } = await supabase
    .from('user_integrations')
    .upsert(payload, { onConflict: 'user_id,provider' })
    .select()
    .single()

  if (error) {
    console.error('[integrations] saveIntegration error:', error.message)
    return null
  }
  return data as Integration
}

export async function updateTokens(
  supabase: SupabaseClient,
  userId: string,
  provider: Provider,
  tokens: {
    access_token:     string
    refresh_token?:   string | null
    token_expires_at?: string | null
  },
): Promise<void> {
  const update: Record<string, string | null> = {
    access_token: tokens.access_token,
  }
  if (tokens.refresh_token   !== undefined) update.refresh_token    = tokens.refresh_token
  if (tokens.token_expires_at !== undefined) update.token_expires_at = tokens.token_expires_at ?? null

  await supabase
    .from('user_integrations')
    .update(update)
    .eq('user_id', userId)
    .eq('provider', provider)
}

export async function removeIntegration(
  supabase: SupabaseClient,
  userId: string,
  provider: Provider,
): Promise<void> {
  await supabase
    .from('user_integrations')
    .delete()
    .eq('user_id', userId)
    .eq('provider', provider)
}

// ─────────────────────────────────────────────────────────────
// Token helpers
// ─────────────────────────────────────────────────────────────

/** Returns true if the access token is expired (or within 5 min of expiry) */
export function isTokenExpired(integration: Integration): boolean {
  if (!integration.token_expires_at) return false
  const expiresAt = new Date(integration.token_expires_at).getTime()
  return Date.now() > expiresAt - 5 * 60 * 1000   // 5-min buffer
}
