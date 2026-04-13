import Link from 'next/link'

interface TagsListProps {
  tags:      string[]
  username?: string   // if provided, tags become filter links
  className?: string
}

export function TagsList({ tags, username, className = '' }: TagsListProps) {
  if (tags.length === 0) return null

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {tags.map((tag) =>
        username ? (
          <Link
            key={tag}
            href={`/${username}/blog?tag=${encodeURIComponent(tag)}`}
            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 transition-colors hover:bg-accent-100 hover:text-accent-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-accent-900/30 dark:hover:text-accent-300"
          >
            #{tag}
          </Link>
        ) : (
          <span
            key={tag}
            className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300"
          >
            #{tag}
          </span>
        ),
      )}
    </div>
  )
}
