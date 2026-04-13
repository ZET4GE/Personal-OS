import { SocialLinks } from './SocialLinks'
import type { Profile } from '@/types/profile'

// ─────────────────────────────────────────────────────────────
// Avatar — initials en círculo coloreado
// ─────────────────────────────────────────────────────────────

function Avatar({ profile }: { profile: Profile }) {
  if (profile.avatar_url) {
    return (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={profile.avatar_url}
        alt={profile.full_name ?? profile.username}
        width={96}
        height={96}
        className="h-24 w-24 rounded-full object-cover ring-4 ring-white dark:ring-slate-900"
      />
    )
  }

  const initials = profile.full_name
    ? profile.full_name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : profile.username[0].toUpperCase()

  return (
    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-accent-600 text-2xl font-bold text-white ring-4 ring-white dark:ring-slate-900">
      {initials}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

interface PublicHeaderProps {
  profile: Profile
}

export function PublicHeader({ profile }: PublicHeaderProps) {
  return (
    <header className="flex flex-col items-center gap-5 text-center sm:flex-row sm:items-end sm:text-left">
      <Avatar profile={profile} />

      <div className="flex-1 space-y-2">
        {/* Nombre + username */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {profile.full_name ?? profile.username}
          </h1>
          <p className="text-sm text-muted">@{profile.username}</p>
        </div>

        {/* Bio */}
        {profile.bio && (
          <p className="max-w-xl text-sm leading-relaxed text-muted">{profile.bio}</p>
        )}

        {/* Links sociales + location */}
        <SocialLinks profile={profile} />
      </div>
    </header>
  )
}
