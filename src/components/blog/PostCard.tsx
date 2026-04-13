'use client'

import Link from 'next/link'
import { useTransition } from 'react'
import { Clock, Calendar, Star } from 'lucide-react'
import { toast } from 'sonner'
import { PostStatusBadge } from './PostStatusBadge'
import { TagsList } from './TagsList'
import { deletePostAction, publishPostAction, unpublishPostAction } from '@/app/(dashboard)/blog/actions'
import type { Post } from '@/types/posts'

interface PostCardProps {
  post: Post
}

function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })
    .format(new Date(iso))
}

export function PostCard({ post }: PostCardProps) {
  const [pending, startTransition] = useTransition()

  function handleDelete() {
    if (!confirm('¿Eliminar este post? Esta acción no se puede deshacer.')) return
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', post.id)
      const r = await deletePostAction(fd)
      if ('error' in r) toast.error(r.error)
      else toast.success('Post eliminado')
    })
  }

  function handlePublishToggle() {
    const action = post.status === 'published' ? unpublishPostAction : publishPostAction
    startTransition(async () => {
      const fd = new FormData()
      fd.set('id', post.id)
      const r = await action(fd)
      if ('error' in r) toast.error(r.error)
      else toast.success(post.status === 'published' ? 'Vuelto a borrador' : '¡Post publicado!')
    })
  }

  const date = post.published_at ?? post.updated_at

  return (
    <article className={`group flex flex-col gap-3 rounded-xl border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-border-bright hover:shadow-sm ${pending ? 'opacity-60 pointer-events-none' : ''}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <PostStatusBadge status={post.status} />
          {post.is_featured && (
            <span title="Destacado">
              <Star size={13} className="text-amber-500 fill-amber-500" />
            </span>
          )}
        </div>
        {post.reading_time && (
          <span className="flex shrink-0 items-center gap-1 text-xs text-muted">
            <Clock size={11} /> {post.reading_time} min
          </span>
        )}
      </div>

      {/* Title + excerpt */}
      <div className="min-w-0">
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-1 line-clamp-2 text-xs text-muted leading-relaxed">{post.excerpt}</p>
        )}
      </div>

      {/* Tags */}
      <TagsList tags={post.tags} />

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 border-t border-border pt-3">
        <span className="flex items-center gap-1 text-xs text-muted">
          <Calendar size={11} />
          {formatDate(date)}
        </span>

        <div className="flex items-center gap-1">
          <button
            onClick={handlePublishToggle}
            className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            {post.status === 'published' ? 'Despublicar' : 'Publicar'}
          </button>
          <Link
            href={`/blog/${post.id}/edit`}
            className="rounded-md px-2 py-1 text-xs text-muted transition-colors hover:bg-surface-hover hover:text-foreground"
          >
            Editar
          </Link>
          <button
            onClick={handleDelete}
            className="rounded-md px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            Eliminar
          </button>
        </div>
      </div>
    </article>
  )
}
