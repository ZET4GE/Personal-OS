export type GlobalSearchResultType =
  | 'goal'
  | 'project'
  | 'note'
  | 'habit'
  | 'routine'
  | 'roadmap'
  | 'job'
  | 'client'
  | 'freelance'
  | 'tag'

export interface GlobalSearchResult {
  type: GlobalSearchResultType
  id: string
  title: string
  description: string | null
}

export interface AdvancedSearchResult extends GlobalSearchResult {
  status: string | null
  updated_at: string
  tags: string[]
}

export interface AdvancedSearchFilters {
  query: string
  type: GlobalSearchResultType | 'all'
  tagId: string | null
  status: string
}
