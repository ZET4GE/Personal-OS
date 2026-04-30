import Link from 'next/link'
import { Briefcase, FileText, FolderGit2, GitBranch, Mail, PenLine, Eye } from 'lucide-react'
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
  icon: React.FC<{ size?: number; className?: string }>
}

function Stat({ value, label, icon: Icon }: StatProps) {
  return (
    <div className="group flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 transition-colors hover:bg-white/5">
      <div className="flex items-center gap-1.5">
        <Icon size={13} className="text-muted group-hover:text-foreground transition-colors" />
        <span className="text-lg font-bold text-foreground tabular-nums group-hover:text-accent-500 transition-colors">
          {value}
        </span>
      </div>
      <span className="text-[11px] text-muted">{label}</span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function contactHref(profile: Profile): string | null {
  if (profile.linkedin_url) return profile.linkedin_url
  if (profile.twitter_url)  return profile.twitter_url
  if (profile.website)      return profile.website
  return null
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

interface PublicHeaderProps {
  profile:  Profile
  username: string
  isOwner?: boolean
  stats?: {
    projects: number
    roadmaps: number
    posts: number
    yearsExp: number | null
  }
}

export function PublicHeader({ profile, username, isOwner = false, stats }: PublicHeaderProps) {
  const hasStats = stats && (
    stats.projects > 0 || stats.roadmaps > 0 ||
    stats.posts    > 0 || stats.yearsExp != null
  )

  const contact = contactHref(profile)

  return (
    <header className="public-card public-body relative overflow-hidden rounded-2xl border p-8">
      {/* Ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent-600/[0.06] blur-3xl dark:bg-accent-600/[0.10]"
      />

      <div className="relative flex flex-col items-center gap-6 text-center sm:flex-row sm:items-start sm:text-left">
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

          {/* Current status chip */}
          {profile.current_status && (
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-sm font-medium text-emerald-600 dark:text-emerald-400">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              </span>
              {profile.current_status}
            </div>
          )}

          {/* Bio */}
          {profile.bio && (
            <p className="max-w-xl text-sm leading-relaxed text-muted">{profile.bio}</p>
          )}

          {/* Social links + location */}
          <SocialLinks profile={profile} />

          {/* Action buttons */}
          <div className="flex flex-wrap items-center justify-center gap-2 sm:justify-start">
            <Link
              href={`/${username}/cv`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[var(--public-accent)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <FileText size={14} />
              Ver CV
            </Link>

            {contact && (
              <a
                href={contact}
                target="_blank"
                rel="noopener noreferrer"
                className="public-button inline-flex items-center gap-1.5 rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
              >
                <Mail size={14} />
                Contactar
              </a>
            )}

            {/* Owner-only: recruiter preview link */}
            {isOwner && (
              <Link
                href={`/${username}/preview`}
                target="_blank"
                className="inline-flex items-center gap-1.5 rounded-lg border border-dashed px-3 py-1.5 text-xs font-medium text-muted transition-colors hover:text-foreground"
                style={{ borderColor: 'var(--color-border)' }}
              >
                <Eye size={13} />
                Vista reclutador
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      {hasStats && (
        <div className="relative mt-6 flex flex-wrap justify-center gap-1 border-t pt-5 sm:justify-start" style={{ borderColor: 'var(--color-border)' }}>
          {stats.yearsExp != null && (
            <Stat value={`${stats.yearsExp}+`} label="años exp." icon={Briefcase} />
          )}
          {stats.projects > 0 && (
            <Stat value={stats.projects} label={stats.projects === 1 ? 'proyecto' : 'proyectos'} icon={FolderGit2} />
          )}
          {stats.roadmaps > 0 && (
            <Stat value={stats.roadmaps} label={stats.roadmaps === 1 ? 'roadmap' : 'roadmaps'} icon={GitBranch} />
          )}
          {stats.posts > 0 && (
            <Stat value={stats.posts} label={stats.posts === 1 ? 'post' : 'posts'} icon={PenLine} />
          )}
        </div>
      )}
    </header>
  )
}
