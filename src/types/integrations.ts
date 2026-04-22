// ─────────────────────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────────────────────

export const PROVIDERS = ['google', 'github'] as const
export type Provider = (typeof PROVIDERS)[number]

// ─────────────────────────────────────────────────────────────
// DB entity
// ─────────────────────────────────────────────────────────────

export interface Integration {
  id:               string
  user_id:          string
  provider:         Provider
  access_token:     string | null
  refresh_token:    string | null
  token_expires_at: string | null   // ISO 8601
  scope:            string | null
  provider_user_id: string | null
  provider_email:   string | null
  metadata:         Record<string, unknown>
  is_active:        boolean
  connected_at:     string
  updated_at:       string
}

export type IntegrationPublic = Pick<
  Integration,
  'id' | 'user_id' | 'provider' | 'provider_email' | 'metadata' | 'is_active' | 'connected_at' | 'updated_at'
>

// ─────────────────────────────────────────────────────────────
// Google Calendar
// ─────────────────────────────────────────────────────────────

export interface GoogleCalendarEvent {
  id:        string
  summary:   string
  start:     string   // ISO 8601
  end:       string   // ISO 8601
  allDay:    boolean
  htmlLink:  string
  colorId?:  string
  location?: string | null
}

// ─────────────────────────────────────────────────────────────
// GitHub
// ─────────────────────────────────────────────────────────────

export interface GitHubRepo {
  id:          number
  name:        string
  full_name:   string
  description: string | null
  html_url:    string
  language:    string | null
  stargazers_count: number
  updated_at:  string
}

export interface GitHubCommit {
  sha:      string
  message:  string
  repo:     string
  html_url: string
  date:     string   // ISO 8601
}

export interface GitHubUser {
  login:      string
  name:       string | null
  avatar_url: string
  html_url:   string
}

// ─────────────────────────────────────────────────────────────
// Save input
// ─────────────────────────────────────────────────────────────

export interface SaveIntegrationInput {
  provider:         Provider
  access_token:     string
  refresh_token?:   string | null
  token_expires_at?: string | null
  scope?:           string | null
  provider_user_id?: string | null
  provider_email?:  string | null
  metadata?:        Record<string, unknown>
}
