import type { Profile } from '@/types/profile'

type ThemeStyle = Record<`--${string}`, string>

export function getPublicThemeClasses(profile: Profile | null | undefined) {
  const { font, background, card, accent } = getPublicThemeVariants(profile)

  return [
    'public-theme-shell',
    `public-font-${font}`,
    `public-bg-${background}`,
    `public-card-${card}`,
    `public-accent-${accent}`,
  ].join(' ')
}

export function getPublicThemePreviewClasses(profile: Profile | null | undefined) {
  const { font, background, card, accent } = getPublicThemeVariants(profile)

  return [
    'public-theme-preview',
    `public-font-${font}`,
    `public-bg-${background}`,
    `public-card-${card}`,
    `public-accent-${accent}`,
  ].join(' ')
}

function getPublicThemeVariants(profile: Profile | null | undefined) {
  const font = profile?.portfolio_font_style ?? 'sans'
  const background = profile?.portfolio_background_style ?? 'mist'
  const card = profile?.portfolio_card_style ?? 'glass'
  const accent = profile?.portfolio_accent_style ?? 'blue'

  return { font, background, card, accent }
}

export function getPublicThemeStyle(profile: Profile | null | undefined): ThemeStyle {
  const accent = profile?.portfolio_accent_style ?? 'blue'

  const palette: Record<string, ThemeStyle> = {
    blue: {
      '--public-accent': '#2563eb',
      '--public-accent-soft': 'rgba(37, 99, 235, 0.14)',
      '--public-accent-strong': '#1d4ed8',
      '--public-accent-contrast': '#eff6ff',
      '--public-glow': 'rgba(59, 130, 246, 0.18)',
    },
    emerald: {
      '--public-accent': '#059669',
      '--public-accent-soft': 'rgba(5, 150, 105, 0.14)',
      '--public-accent-strong': '#047857',
      '--public-accent-contrast': '#ecfdf5',
      '--public-glow': 'rgba(16, 185, 129, 0.18)',
    },
    sunset: {
      '--public-accent': '#ea580c',
      '--public-accent-soft': 'rgba(234, 88, 12, 0.15)',
      '--public-accent-strong': '#c2410c',
      '--public-accent-contrast': '#fff7ed',
      '--public-glow': 'rgba(249, 115, 22, 0.18)',
    },
    violet: {
      '--public-accent': '#7c3aed',
      '--public-accent-soft': 'rgba(124, 58, 237, 0.15)',
      '--public-accent-strong': '#6d28d9',
      '--public-accent-contrast': '#f5f3ff',
      '--public-glow': 'rgba(139, 92, 246, 0.2)',
    },
    rose: {
      '--public-accent': '#e11d48',
      '--public-accent-soft': 'rgba(225, 29, 72, 0.15)',
      '--public-accent-strong': '#be123c',
      '--public-accent-contrast': '#fff1f2',
      '--public-glow': 'rgba(244, 63, 94, 0.2)',
    },
    amber: {
      '--public-accent': '#d97706',
      '--public-accent-soft': 'rgba(217, 119, 6, 0.16)',
      '--public-accent-strong': '#b45309',
      '--public-accent-contrast': '#fffbeb',
      '--public-glow': 'rgba(245, 158, 11, 0.2)',
    },
    cyan: {
      '--public-accent': '#0891b2',
      '--public-accent-soft': 'rgba(8, 145, 178, 0.15)',
      '--public-accent-strong': '#0e7490',
      '--public-accent-contrast': '#ecfeff',
      '--public-glow': 'rgba(34, 211, 238, 0.2)',
    },
    mono: {
      '--public-accent': '#334155',
      '--public-accent-soft': 'rgba(51, 65, 85, 0.14)',
      '--public-accent-strong': '#0f172a',
      '--public-accent-contrast': '#f8fafc',
      '--public-glow': 'rgba(71, 85, 105, 0.18)',
    },
  }

  return palette[accent] ?? palette.blue
}
