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

export const PORTFOLIO_FONT_STYLE_OPTIONS = ['sans', 'grotesk', 'humanist', 'editorial', 'display', 'mono'] as const
export type PortfolioFontStyle = (typeof PORTFOLIO_FONT_STYLE_OPTIONS)[number]

export const PORTFOLIO_BACKGROUND_STYLE_OPTIONS = ['mist', 'grid', 'stage', 'aurora', 'paper', 'spotlight'] as const
export type PortfolioBackgroundStyle = (typeof PORTFOLIO_BACKGROUND_STYLE_OPTIONS)[number]

export const PORTFOLIO_CARD_STYLE_OPTIONS = ['glass', 'solid', 'outline', 'soft', 'elevated', 'tint'] as const
export type PortfolioCardStyle = (typeof PORTFOLIO_CARD_STYLE_OPTIONS)[number]

export const PORTFOLIO_ACCENT_STYLE_OPTIONS = ['blue', 'emerald', 'sunset', 'violet', 'rose', 'amber', 'cyan', 'mono'] as const
export type PortfolioAccentStyle = (typeof PORTFOLIO_ACCENT_STYLE_OPTIONS)[number]

export const CV_AVAILABILITY_LABELS: Record<CVAvailability, string> = {
  full_time:     'Full-time',
  part_time:     'Part-time',
  contract:      'Contrato',
  freelance:     'Freelance',
  internship:    'Pasantia',
  not_available: 'No disponible',
}

export const PORTFOLIO_FONT_STYLE_LABELS: Record<PortfolioFontStyle, string> = {
  sans: 'Sans moderna',
  grotesk: 'Grotesk limpia',
  humanist: 'Humanist',
  editorial: 'Editorial serif',
  display: 'Display bold',
  mono: 'Mono tecnica',
}

export const PORTFOLIO_BACKGROUND_STYLE_LABELS: Record<PortfolioBackgroundStyle, string> = {
  mist: 'Neblina',
  grid: 'Grid',
  stage: 'Escenico',
  aurora: 'Aurora',
  paper: 'Paper',
  spotlight: 'Spotlight',
}

export const PORTFOLIO_CARD_STYLE_LABELS: Record<PortfolioCardStyle, string> = {
  glass: 'Glass',
  solid: 'Solid',
  outline: 'Outline',
  soft: 'Soft',
  elevated: 'Elevated',
  tint: 'Tint',
}

export const PORTFOLIO_ACCENT_STYLE_LABELS: Record<PortfolioAccentStyle, string> = {
  blue: 'Azul',
  emerald: 'Emerald',
  sunset: 'Sunset',
  violet: 'Violet',
  rose: 'Rose',
  amber: 'Amber',
  cyan: 'Cyan',
  mono: 'Mono',
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
  portfolio_font_style: PortfolioFontStyle
  portfolio_background_style: PortfolioBackgroundStyle
  portfolio_card_style: PortfolioCardStyle
  portfolio_accent_style: PortfolioAccentStyle
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
  avatar_url?:  string | null
  phone?:       string | null
  birth_date?:  string | null
  availability?: CVAvailability | null
  location?:    string | null
  website?:     string | null
  github_url?:  string | null
  linkedin_url?: string | null
  twitter_url?: string | null
  portfolio_font_style?: PortfolioFontStyle
  portfolio_background_style?: PortfolioBackgroundStyle
  portfolio_card_style?: PortfolioCardStyle
  portfolio_accent_style?: PortfolioAccentStyle
  is_public?:   boolean
}

// ─────────────────────────────────────────────────────────────
// Action result
// ─────────────────────────────────────────────────────────────

export type ProfileActionResult =
  | { error: string; ok?: never; profile?: never }
  | { ok: true; profile: Profile; error?: never }
