interface TechBadgeProps {
  tag: string
}

export function TechBadge({ tag }: TechBadgeProps) {
  return (
    <span className="rounded-md bg-[var(--public-accent-soft)] px-2.5 py-1 font-mono text-xs text-[var(--public-accent)]">
      {tag}
    </span>
  )
}
