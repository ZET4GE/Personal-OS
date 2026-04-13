import { Globe, GitBranch, Link, MapPin, AtSign } from 'lucide-react'
import type { Profile } from '@/types/profile'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function SocialLink({
  href,
  label,
  icon: Icon,
  display,
}: {
  href: string
  label: string
  icon: React.FC<{ size?: number; className?: string }>
  display: string
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
    >
      <Icon size={15} className="shrink-0" />
      <span className="truncate">{display}</span>
    </a>
  )
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

interface SocialLinksProps {
  profile: Pick<
    Profile,
    'location' | 'website' | 'github_url' | 'linkedin_url' | 'twitter_url'
  >
}

export function SocialLinks({ profile }: SocialLinksProps) {
  const { location, website, github_url, linkedin_url, twitter_url } = profile

  type SocialItem = { href: string; label: string; icon: typeof Globe; display: string }

  const links: SocialItem[] = [
    website && {
      href: website,
      label: 'Sitio web',
      icon: Globe,
      display: website.replace(/^https?:\/\//, ''),
    },
    github_url && {
      href: github_url,
      label: 'GitHub',
      icon: GitBranch,
      display: github_url.replace(/^https?:\/\/(www\.)?github\.com\//, '@'),
    },
    linkedin_url && {
      href: linkedin_url,
      label: 'LinkedIn',
      icon: Link,
      display: 'LinkedIn',
    },
    twitter_url && {
      href: twitter_url,
      label: 'Twitter / X',
      icon: AtSign,
      display: twitter_url.replace(/^https?:\/\/(www\.)?(twitter|x)\.com\//, '@'),
    },
  ].filter(Boolean) as SocialItem[]

  if (!location && links.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
      {location && (
        <span className="flex items-center gap-1.5 text-sm text-muted">
          <MapPin size={15} className="shrink-0" />
          {location}
        </span>
      )}
      {links.map((link) => (
        <SocialLink key={link.href} {...link} />
      ))}
    </div>
  )
}
