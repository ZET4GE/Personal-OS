export type GlobalSearchResultType = 'goal' | 'project' | 'note' | 'habit' | 'routine' | 'tag'

export interface GlobalSearchResult {
  type: GlobalSearchResultType
  id: string
  title: string
  description: string | null
}
