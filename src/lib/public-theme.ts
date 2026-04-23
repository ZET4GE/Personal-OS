import type { Profile } from '@/types/profile'

type ThemeStyle = Record<`--${string}`, string>

export function getPublicThemeClasses(profile: Profile | null | undefined) {
  const font = profile?.portfolio_font_style ?? 'sans'
  const background = profile?.portfolio_background_style ?? 'mist'
  const card = profile?.portfolio_card_style ?? 'glass'
  const accent = profile?.portfolio_accent_style ?? 'blue'

  return [
    'public-theme-shell',
    `public-font-${font}`,
    `public-bg-${background}`,
    `public-card-${card}`,
    `public-accent-${accent}`,
  ].join(' ')
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
