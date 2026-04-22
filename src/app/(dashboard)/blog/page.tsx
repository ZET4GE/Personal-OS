import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Plus, PenLine } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getPosts } from '@/services/posts'
import { PostCard } from '@/components/blog/PostCard'
import { POST_STATUSES, POST_STATUS_LABELS } from '@/types/posts'
import type { PostStatus } from '@/types/posts'

export const metadata: Metadata = { title: 'Blog' }

interface PageProps {
  searchParams: Promise<{ status?: string }>
}

const TAB_ORDER: Array<PostStatus | 'all'> = ['all', 'draft', 'published', 'archived']

export default async function BlogPage({ searchParams }: PageProps) {
  const { status } = await searchParams

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const statusFilter = POST_STATUSES.includes(status as PostStatus)
    ? (status as PostStatus)
    : undefined

  const { data: allPosts } = await getPosts(supabase, user.id)
  const { data: filteredPosts } = statusFilter
    ? await getPosts(supabase, user.id, statusFilter)
    : { data: allPosts }

  const posts = filteredPosts ?? []
  const all   = allPosts ?? []

  const counts: Record<PostStatus | 'all', number> = {
    all:       all.length,
    draft:     all.filter((p) => p.status === 'draft').length,
    published: all.filter((p) => p.status === 'published').length,
    archived:  all.filter((p) => p.status === 'archived').length,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Blog</h2>
          <p className="text-sm text-muted">
            Tus posts públicos. Los publicados aparecen en tu perfil.
          </p>
        </div>
        <Link
          href="/blog/new"
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-accent-600 px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          <Plus size={14} /> Nuevo post
        </Link>
      </div>

      {/* Tabs */}
      <nav className="flex flex-wrap gap-1.5">
        {TAB_ORDER.map((tab) => {
          const isActive = tab === 'all' ? !statusFilter : statusFilter === tab
          const href     = tab === 'all' ? '/blog' : `/blog?status=${tab}`
          const label    = tab === 'all' ? 'Todos' : POST_STATUS_LABELS[tab]
          return (
            <Link
              key={tab}
              href={href}
              className={[
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-accent-600 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700',
              ].join(' ')}
            >
              {label} ({counts[tab]})
            </Link>
          )
        })}
      </nav>

      {/* Grid */}
      {posts.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-16 text-center">
          <PenLine size={28} className="text-muted" />
          <div>
            <p className="font-medium">
              {statusFilter ? `Sin posts ${POST_STATUS_LABELS[statusFilter].toLowerCase()}s` : 'Sin posts todavía'}
            </p>
            <p className="mt-1 text-sm text-muted">
              {!statusFilter && 'Crea tu primer post para compartir con el mundo.'}
            </p>
          </div>
          {!statusFilter && (
            <Link
              href="/blog/new"
              className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              Crear primer post
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
