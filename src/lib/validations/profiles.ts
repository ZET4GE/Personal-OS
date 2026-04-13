import { z } from 'zod'

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

// ─────────────────────────────────────────────────────────────
// Username rules
// ─────────────────────────────────────────────────────────────

const RESERVED_USERNAMES = new Set([
  'login', 'signup', 'dashboard', 'jobs', 'projects',
  'settings', 'auth', 'api', 'public', 'admin',
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
  bio:          optionalText(500),
  location:     optionalText(100),
  website:      optionalUrl(),
  github_url:   optionalUrl(),
  linkedin_url: optionalUrl(),
  twitter_url:  optionalUrl(),
  is_public: z
    .string()
    .optional()
    .transform((v) => v !== 'false'),   // todo excepto 'false' → true
})

export type UpdateProfileData = z.output<typeof UpdateProfileSchema>
