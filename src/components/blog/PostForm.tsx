'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, Edit3, Loader2, Tag, X } from 'lucide-react'
import { toast } from 'sonner'
import { createPostAction, updatePostAction } from '@/app/(dashboard)/blog/actions'
import type { Post } from '@/types/posts'

// ── Simple Markdown preview (rendered server-safe via dangerouslySetInnerHTML)
// Full react-markdown rendering is in MarkdownRenderer; here we use a lightweight CSS preview.

interface PostFormProps {
  post?: Post   // undefined = create mode
}

export function PostForm({ post }: PostFormProps) {
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  const [title,      setTitle]      = useState(post?.title       ?? '')
  const [content,    setContent]    = useState(post?.content     ?? '')
  const [excerpt,    setExcerpt]    = useState(post?.excerpt      ?? '')
  const [coverImage, setCoverImage] = useState(post?.cover_image ?? '')
  const [tagInput,   setTagInput]   = useState('')
  const [tags,       setTags]       = useState<string[]>(post?.tags ?? [])
  const [isFeatured, setIsFeatured] = useState(post?.is_featured ?? false)
  const [tab,        setTab]        = useState<'write' | 'preview'>('write')

  // ── Tag handling ──
  function addTag(raw: string) {
    const t = raw.trim().toLowerCase()
    if (t && !tags.includes(t)) setTags((prev) => [...prev, t])
    setTagInput('')
  }

  function removeTag(t: string) {
    setTags((prev) => prev.filter((x) => x !== t))
  }

  function onTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(tagInput)
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  // ── Submit ──
  function buildFormData(status: 'draft' | 'published'): FormData {
    const fd = new FormData()
    if (post?.id) fd.set('id', post.id)
    fd.set('title',       title)
    fd.set('content',     content)
    fd.set('excerpt',     excerpt)
    fd.set('cover_image', coverImage)
    fd.set('tags',        tags.join(','))
    fd.set('status',      status)
    fd.set('is_featured', String(isFeatured))
    return fd
  }

  function submit(status: 'draft' | 'published') {
    if (!title.trim()) { toast.error('El título es obligatorio'); return }
    if (!content.trim()) { toast.error('El contenido es obligatorio'); return }

    const action = post?.id ? updatePostAction : createPostAction
    startTransition(async () => {
      const r = await action(buildFormData(status))
      if ('error' in r) {
        toast.error(r.error)
        return
      }
      toast.success(status === 'published' ? '¡Post publicado!' : 'Borrador guardado')
      router.push('/blog')
    })
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título del post..."
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-lg font-semibold placeholder:text-muted/50 focus:border-accent-500 focus:outline-none"
        />
      </div>

      {/* Write / Preview tabs */}
      <div className="flex flex-col gap-0 overflow-hidden rounded-xl border border-border">
        {/* Tab bar */}
        <div className="flex items-center border-b border-border bg-surface-elevated px-3 pt-2">
          <button
            onClick={() => setTab('write')}
            className={`flex items-center gap-1.5 rounded-t-md px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === 'write'
                ? 'border-b-2 border-accent-600 text-accent-600'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Edit3 size={12} /> Escribir
          </button>
          <button
            onClick={() => setTab('preview')}
            className={`flex items-center gap-1.5 rounded-t-md px-3 py-1.5 text-xs font-medium transition-colors ${
              tab === 'preview'
                ? 'border-b-2 border-accent-600 text-accent-600'
                : 'text-muted hover:text-foreground'
            }`}
          >
            <Eye size={12} /> Vista previa
          </button>
        </div>

        {/* Content */}
        {tab === 'write' ? (
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={'# Mi título\n\nEscribe tu contenido en **Markdown**...\n\n- Lista\n- de items\n\n```js\nconst code = "aquí"\n```'}
            rows={20}
            className="w-full resize-y bg-surface px-4 py-3 font-mono text-sm leading-relaxed placeholder:text-muted/40 focus:outline-none"
          />
        ) : (
          <div className="min-h-[400px] bg-surface px-4 py-3">
            {content ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-foreground">
                  {content}
                </pre>
                <p className="mt-4 text-xs text-muted italic">
                  Vista previa completa disponible en la página pública del post.
                </p>
              </div>
            ) : (
              <p className="text-sm text-muted">Escribe algo para ver la vista previa.</p>
            )}
          </div>
        )}
      </div>

      {/* Metadata row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

        {/* Excerpt */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-muted">Resumen (excerpt)</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value)}
            placeholder="Resumen corto que aparece en la lista de posts..."
            rows={3}
            maxLength={500}
            className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted/50 focus:border-accent-500 focus:outline-none"
          />
          <p className="text-right text-xs text-muted">{excerpt.length}/500</p>
        </div>

        {/* Cover image + featured */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted">Imagen de portada (URL)</label>
            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="https://..."
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-muted/50 focus:border-accent-500 focus:outline-none"
            />
          </div>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded border-border accent-accent-600"
            />
            <span className="text-sm">Destacar en perfil</span>
          </label>
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-medium text-muted">Tags</label>
        <div className="flex min-h-[40px] flex-wrap items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 focus-within:border-accent-500">
          {tags.map((t) => (
            <span
              key={t}
              className="flex items-center gap-1 rounded-full bg-accent-100 px-2 py-0.5 text-xs font-medium text-accent-700 dark:bg-accent-900/30 dark:text-accent-300"
            >
              <Tag size={10} />
              {t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="ml-0.5 rounded-full hover:text-accent-900"
              >
                <X size={10} />
              </button>
            </span>
          ))}
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={onTagKeyDown}
            onBlur={() => tagInput && addTag(tagInput)}
            placeholder={tags.length === 0 ? 'javascript, react, next.js… (Enter para agregar)' : ''}
            className="min-w-[120px] flex-1 bg-transparent text-sm outline-none placeholder:text-muted/50"
          />
        </div>
        <p className="text-xs text-muted">Presiona Enter o coma para agregar un tag</p>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between border-t border-border pt-4">
        <button
          type="button"
          onClick={() => router.push('/blog')}
          className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:bg-surface-hover"
        >
          Cancelar
        </button>

        <div className="flex gap-2">
          <button
            type="button"
            disabled={pending}
            onClick={() => submit('draft')}
            className="flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-hover disabled:opacity-60"
          >
            {pending && <Loader2 size={13} className="animate-spin" />}
            Guardar borrador
          </button>
          <button
            type="button"
            disabled={pending}
            onClick={() => submit('published')}
            className="flex items-center gap-1.5 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {pending && <Loader2 size={13} className="animate-spin" />}
            {post?.status === 'published' ? 'Guardar cambios' : 'Publicar'}
          </button>
        </div>
      </div>
    </div>
  )
}
