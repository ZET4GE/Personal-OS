interface TechBadgeProps {
  tag: string
}

export function TechBadge({ tag }: TechBadgeProps) {
  return (
    <span className="rounded-md bg-slate-100 px-2.5 py-1 font-mono text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      {tag}
    </span>
  )
}
