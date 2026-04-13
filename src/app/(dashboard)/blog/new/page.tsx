import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { PostForm } from '@/components/blog/PostForm'

export const metadata: Metadata = { title: 'Nuevo post' }

export default function NewPostPage() {
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
        <span className="text-sm font-medium">Nuevo post</span>
      </div>

      <PostForm />
    </div>
  )
}
