'use client'

import {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
  useCallback,
  type KeyboardEvent,
} from 'react'
import { X } from 'lucide-react'
import { PROJECT_STATUS_LABELS, PROJECT_STATUSES } from '@/types/projects'
import type { Project } from '@/types/projects'

// ─────────────────────────────────────────────────────────────
// Handle
// ─────────────────────────────────────────────────────────────

export interface ProjectFormHandle {
  open(initialData?: Project | null): void
  close(): void
}

// ─────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────

interface ProjectFormProps {
  onSubmitCreate: (formData: FormData) => void
  onSubmitUpdate: (formData: FormData) => void
}

// ─────────────────────────────────────────────────────────────
// TagInput — sub-component para tech_stack
// ─────────────────────────────────────────────────────────────

function TagInput({ initialTags = [] }: { initialTags?: string[] }) {
  const [tags, setTags] = useState<string[]>(initialTags)
  const [inputValue, setInputValue] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = useCallback((raw: string) => {
    const tag = raw.trim().toLowerCase()
    if (tag && !tags.includes(tag)) {
      setTags((prev) => [...prev, tag])
    }
    setInputValue('')
  }, [tags])

  function removeTag(tag: string) {
    setTags((prev) => prev.filter((t) => t !== tag))
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
      setTags((prev) => prev.slice(0, -1))
    }
  }

  return (
    <div
      className="flex flex-wrap gap-1.5 rounded-lg border p-2 cursor-text min-h-[42px]"
      style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface)' }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Hidden field con el valor serializado */}
      <input type="hidden" name="tech_stack" value={tags.join(',')} />

      {tags.map((tag) => (
        <span
          key={tag}
          className="flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-700 dark:bg-slate-700 dark:text-slate-200"
        >
          {tag}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); removeTag(tag) }}
            className="ml-0.5 text-slate-400 hover:text-slate-600"
            aria-label={`Quitar ${tag}`}
          >
            <X size={10} />
          </button>
        </span>
      ))}

      <input
        ref={inputRef}
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => inputValue && addTag(inputValue)}
        placeholder={tags.length === 0 ? 'React, TypeScript... (Enter para agregar)' : ''}
        className="min-w-[140px] flex-1 bg-transparent text-xs outline-none placeholder:text-slate-400"
        aria-label="Agregar tecnología"
      />
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ProjectForm
// ─────────────────────────────────────────────────────────────

export const ProjectForm = forwardRef<ProjectFormHandle, ProjectFormProps>(
  ({ onSubmitCreate, onSubmitUpdate }, ref) => {
    const dialogRef   = useRef<HTMLDialogElement>(null)
    const [editData, setEditData] = useState<Project | null>(null)
    // key fuerza re-mount de TagInput al cambiar de proyecto
    const [formKey, setFormKey]   = useState(0)

    const isEdit = editData !== null
    const title  = isEdit ? 'Editar proyecto' : 'Nuevo proyecto'

    useImperativeHandle(ref, () => ({
      open(data) {
        setEditData(data ?? null)
        setFormKey((k) => k + 1)
        dialogRef.current?.showModal()
      },
      close() {
        dialogRef.current?.close()
      },
    }))

    function handleClose() {
      dialogRef.current?.close()
    }

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
      e.preventDefault()
      const fd = new FormData(e.currentTarget)

      if (isEdit) {
        fd.set('id', editData.id)
        onSubmitUpdate(fd)
      } else {
        onSubmitCreate(fd)
      }
      handleClose()
    }

    return (
      <dialog
        ref={dialogRef}
        className="m-auto w-full max-w-lg rounded-2xl border bg-surface p-0 shadow-xl backdrop:bg-black/50 open:flex open:flex-col"
        style={{ borderColor: 'var(--color-border)' }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between border-b px-5 py-4"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-sm font-semibold">{title}</h2>
          <button
            type="button"
            onClick={handleClose}
            className="rounded p-1 text-muted hover:text-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form — key fuerza re-mount del TagInput al abrir diferente proyecto */}
        <form key={formKey} onSubmit={handleSubmit} className="flex flex-col gap-4 overflow-y-auto p-5">
          {/* Title */}
          <Field label="Título *" htmlFor="title">
            <input
              id="title"
              name="title"
              type="text"
              required
              defaultValue={editData?.title}
              placeholder="Mi proyecto"
              className={inputCls}
            />
          </Field>

          {/* Description */}
          <Field label="Descripción" htmlFor="description">
            <textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={editData?.description ?? ''}
              placeholder="¿Qué hace este proyecto?"
              className={`${inputCls} resize-none`}
            />
          </Field>

          {/* Status + is_public (fila) */}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Estado" htmlFor="status">
              <select
                id="status"
                name="status"
                defaultValue={editData?.status ?? 'in_progress'}
                className={inputCls}
              >
                {PROJECT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {PROJECT_STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Visibilidad" htmlFor="is_public">
              <select
                id="is_public"
                name="is_public"
                defaultValue={editData?.is_public ? 'true' : 'false'}
                className={inputCls}
              >
                <option value="false">Privado</option>
                <option value="true">Público</option>
              </select>
            </Field>
          </div>

          {/* Tech stack */}
          <Field label="Stack tecnológico" htmlFor="tech_stack_input">
            <TagInput
              initialTags={editData?.tech_stack ?? []}
            />
          </Field>

          {/* GitHub URL */}
          <Field label="GitHub" htmlFor="github_url">
            <input
              id="github_url"
              name="github_url"
              type="url"
              defaultValue={editData?.github_url ?? ''}
              placeholder="https://github.com/..."
              className={inputCls}
            />
          </Field>

          {/* Live URL */}
          <Field label="Demo en vivo" htmlFor="live_url">
            <input
              id="live_url"
              name="live_url"
              type="url"
              defaultValue={editData?.live_url ?? ''}
              placeholder="https://..."
              className={inputCls}
            />
          </Field>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
              style={{ borderColor: 'var(--color-border)' }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              {isEdit ? 'Guardar cambios' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </dialog>
    )
  },
)

ProjectForm.displayName = 'ProjectForm'

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium text-muted">
        {label}
      </label>
      {children}
    </div>
  )
}

const inputCls =
  'w-full rounded-lg border px-3 py-2 text-sm bg-surface outline-none transition-colors ' +
  'focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 ' +
  'dark:bg-slate-900 placeholder:text-slate-400'
