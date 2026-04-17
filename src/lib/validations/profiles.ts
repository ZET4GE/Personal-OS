import { z } from 'zod'
import { CV_AVAILABILITY_OPTIONS } from '@/types/profile'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

const optionalText = (max: number) =>
  z
    .string()
    .max(max, { error: `Máximo ${max} caracteres` })
    .optional()
    .transform((v) => (v?.trim() || null))

const optionalUrl = () =>
  z
    .string()
    .max(500)
    .optional()
    .transform((v) => (v?.trim() || null))

const optionalDate = z
  .string()
  .optional()
  .transform((v) => (v?.trim() || null))

// ─────────────────────────────────────────────────────────────
// Username rules
// ─────────────────────────────────────────────────────────────

const RESERVED_USERNAMES = new Set([
  'login', 'signup', 'dashboard', 'jobs', 'projects',
  'finance', 'cv', 'settings', 'auth', 'api', 'public', 'admin',
])

export const UpdateProfileSchema = z.object({
  username: z
    .string()
    .min(3, { error: 'Mínimo 3 caracteres' })
    .max(50, { error: 'Máximo 50 caracteres' })
    .toLowerCase()
    .regex(/^[a-z0-9][a-z0-9-]*[a-z0-9]$/, {
      error: 'Solo letras, números y guiones; no puede empezar ni terminar en guión',
    })
    .refine((v) => !v.includes('--'), { error: 'No puede tener guiones consecutivos' })
    .refine((v) => !RESERVED_USERNAMES.has(v), { error: 'Ese username está reservado' }),

  full_name:    optionalText(255),
  headline:     optionalText(120),
  bio:          optionalText(500),
  avatar_url:   optionalUrl(),
  phone:        optionalText(50),
  birth_date:   optionalDate,
  availability: z
    .enum(CV_AVAILABILITY_OPTIONS)
    .or(z.literal(''))
    .optional()
    .transform((v) => (v ? v : null)),
  location:     optionalText(100),
  website:      optionalUrl(),
  github_url:   optionalUrl(),
  linkedin_url: optionalUrl(),
  twitter_url:  optionalUrl(),
  is_public: z
    .string()
    .optional()
    .transform((v) => v === 'true'),
})

export type UpdateProfileData = z.output<typeof UpdateProfileSchema>
