// ─────────────────────────────────────────────────────────────
export const CV_AVAILABILITY_OPTIONS = [
  'full_time',
  'part_time',
  'contract',
  'freelance',
  'internship',
  'not_available',
] as const

export type CVAvailability = (typeof CV_AVAILABILITY_OPTIONS)[number]

export const CV_AVAILABILITY_LABELS: Record<CVAvailability, string> = {
  full_time:     'Full-time',
  part_time:     'Part-time',
  contract:      'Contrato',
  freelance:     'Freelance',
  internship:    'Pasantia',
  not_available: 'No disponible',
}

// Core entity
// ─────────────────────────────────────────────────────────────

export interface Profile {
  id:           string
  username:     string
  full_name:    string | null
  headline:     string | null
  bio:          string | null
  phone:        string | null
  birth_date:   string | null
  availability: CVAvailability | null
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
  headline?:    string | null
  bio?:         string | null
  phone?:       string | null
  birth_date?:  string | null
  availability?: CVAvailability | null
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
