'use client'

import { useEffect, useState } from 'react'
import { createTag, getUserTags, type Tag } from '@/services/tags'

interface UseTagsResult {
  tags: Tag[]
  loading: boolean
  error: string | null
  refresh: () => Promise<void>
  createUserTag: (name: string) => Promise<Tag | null>
}

export function useTags(): UseTagsResult {
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  async function refresh() {
    setLoading(true)
    setError(null)

    const result = await getUserTags()

    if (result.error) {
      setTags([])
      setError(result.error)
    } else {
      setTags(result.data ?? [])
    }

    setLoading(false)
  }

  async function createUserTag(name: string) {
    const result = await createTag(name)

    if (result.error) {
      setError(result.error)
      return null
    }

    const nextTag = result.data
    if (!nextTag) return null

    setTags((current) => {
      if (current.some((tag) => tag.id === nextTag.id)) return current
      return [nextTag, ...current]
    })

    return nextTag
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void refresh()
    }, 0)

    return () => window.clearTimeout(timer)
  }, [])

  return { tags, loading, error, refresh, createUserTag }
}
