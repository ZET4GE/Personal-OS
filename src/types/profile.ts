// ─────────────────────────────────────────────────────────────
// Core entity
// ─────────────────────────────────────────────────────────────

export interface Profile {
  id:           string
  username:     string
  full_name:    string | null
  bio:          string | null
  avatar_url:   string | null
  location:     string | null
  website:      string | null
  github_url:   string | null
  linkedin_url: string | null
  twitter_url:  string | null
  is_public:    boolean
  created_at:   string
  updated_at:   string
}

// ─────────────────────────────────────────────────────────────
// Input types
// ─────────────────────────────────────────────────────────────

export type UpdateProfileInput = {
  username:     string
  full_name?:   string | null
  bio?:         string | null
  location?:    string | null
  website?:     string | null
  github_url?:  string | null
  linkedin_url?: string | null
  twitter_url?: string | null
  is_public?:   boolean
}

// ─────────────────────────────────────────────────────────────
// Action result
// ─────────────────────────────────────────────────────────────

export type ProfileActionResult =
  | { error: string; ok?: never; profile?: never }
  | { ok: true; profile: Profile; error?: never }
