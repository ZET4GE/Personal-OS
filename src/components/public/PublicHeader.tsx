import { SocialLinks } from './SocialLinks'
import type { Profile } from '@/types/profile'

// ─────────────────────────────────────────────────────────────
// Avatar
// ─────────────────────────────────────────────────────────────

function Avatar({ profile }: { profile: Profile }) {
  if (profile.avatar_url) {
    return (
      <div className="relative shrink-0">
        <div
          className="absolute inset-0 rounded-full blur-md opacity-40"
          style={{ background: 'linear-gradient(135deg, var(--public-accent), color-mix(in srgb, var(--public-accent) 35%, white))' }}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={profile.avatar_url}
          alt={profile.full_name ?? profile.username}
          width={96}
          height={96}
          className="relative h-24 w-24 rounded-full object-cover ring-2 ring-accent-500/30"
        />
      </div>
    )
  }

  const initials = profile.full_name
    ? profile.full_name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : profile.username[0].toUpperCase()

  return (
    <div className="relative shrink-0">
      <div
        className="absolute inset-0 rounded-full blur-md opacity-40"
        style={{ background: 'linear-gradient(135deg, var(--public-accent), color-mix(in srgb, var(--public-accent) 35%, white))' }}
      />
      <div
        className="relative flex h-24 w-24 items-center justify-center rounded-full text-2xl font-bold text-white ring-2 ring-accent-500/30"
        style={{ background: 'linear-gradient(135deg, var(--public-accent), color-mix(in srgb, var(--public-accent) 35%, white))' }}
      >
        {initials}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Stat pill
// ─────────────────────────────────────────────────────────────

interface StatProps {
  value: number | string
  label: string
}

function Stat({ value, label }: StatProps) {
  return (
    <div className="flex flex-col items-center gap-0.5">
      <span className="text-lg font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

interface PublicHeaderProps {
  profile: Profile
  stats?: {
    projects: number
    roadmaps: number
    posts: number
    yearsExp: number | null
  }
}

export function PublicHeader({ profile, stats }: PublicHeaderProps) {
  const hasStats = stats && (stats.projects > 0 || stats.roadmaps > 0 || stats.posts > 0 || stats.yearsExp != null)

  return (
    <header className="public-card public-body relative overflow-hidden rounded-2xl border p-8">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent-600/[0.06] blur-3xl dark:bg-accent-600/[0.10]"
      />

      <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-center sm:text-left">
        <Avatar profile={profile} />

        <div className="flex-1 space-y-3 min-w-0">
          {/* Name + username */}
          <div>
            <h1 className="public-heading text-2xl font-bold tracking-tight sm:text-3xl">
              <span className="public-accent-text">
                {profile.full_name ?? profile.username}
              </span>
            </h1>
            <p className="mt-0.5 text-sm font-medium text-muted">@{profile.username}</p>
          </div>

          {/* Headline */}
          {profile.headline && (
            <p className="text-sm font-semibold text-foreground/80">{profile.headline}</p>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="max-w-xl text-sm leading-relaxed text-muted">{profile.bio}</p>
          )}

          {/* Social links + location */}
          <SocialLinks profile={profile} />
        </div>
      </div>

      {/* Stats bar */}
      {hasStats && (
        <div className="relative mt-6 flex flex-wrap justify-center gap-6 border-t pt-5 sm:justify-start" style={{ borderColor: 'var(--color-border)' }}>
          {stats.yearsExp != null && (
            <Stat value={`${stats.yearsExp}+`} label="años exp." />
          )}
          {stats.projects > 0 && (
            <Stat value={stats.projects} label={stats.projects === 1 ? 'proyecto' : 'proyectos'} />
          )}
          {stats.roadmaps > 0 && (
            <Stat value={stats.roadmaps} label={stats.roadmaps === 1 ? 'roadmap' : 'roadmaps'} />
          )}
          {stats.posts > 0 && (
            <Stat value={stats.posts} label={stats.posts === 1 ? 'post' : 'posts'} />
          )}
        </div>
      )}
    </header>
  )
}
