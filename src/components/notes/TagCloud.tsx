'use client'

import { Tag } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface Props {
  tags:        string[]
  selectedTag: string | null
  onSelect:    (tag: string | null) => void
}

export function TagCloud({ tags, selectedTag, onSelect }: Props) {
  const t = useTranslations('notes')

  if (tags.length === 0) return null

  return (
    <div className="flex flex-col gap-2">
      <p className="px-2.5 text-[10px] font-semibold uppercase tracking-widest text-muted/60 select-none">
        {t('tags')}
      </p>
      <div className="flex flex-wrap gap-1.5 px-1">
        {tags.map((tag) => (
          <button
            key={tag}
            onClick={() => onSelect(selectedTag === tag ? null : tag)}
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-colors ${
              selectedTag === tag
                ? 'bg-accent-600 text-white'
                : 'bg-surface-elevated text-muted hover:bg-surface-hover hover:text-text'
            }`}
          >
            <Tag size={10} />
            {tag}
          </button>
        ))}
      </div>
    </div>
  )
}
