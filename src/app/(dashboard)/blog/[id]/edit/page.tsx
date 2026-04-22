import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { getPostById } from '@/services/posts'
import { PostForm } from '@/components/blog/PostForm'
import { PostStatusBadge } from '@/components/blog/PostStatusBadge'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { title: 'Post no encontrado' }

  const { data: post } = await getPostById(supabase, id, user.id)
  if (!post) return { title: 'Post no encontrado' }
  return { title: `Editar: ${post.title}` }
}

export default async function EditPostPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) notFound()

  const { data: post } = await getPostById(supabase, id, user.id)

  if (!post) notFound()

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/blog"
          className="flex items-center gap-1 text-sm text-muted transition-colors hover:text-foreground"
        >
          <ChevronLeft size={14} /> Blog
        </Link>
        <span className="text-muted">/</span>
        <span className="text-sm font-medium truncate max-w-[200px]">{post.title}</span>
        <PostStatusBadge status={post.status} />
      </div>

      <PostForm post={post} />
    </div>
  )
}
