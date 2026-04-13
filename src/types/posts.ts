// ─────────────────────────────────────────────────────────────
// Status
// ─────────────────────────────────────────────────────────────

export const POST_STATUSES = ['draft', 'published', 'archived'] as const
export type PostStatus = (typeof POST_STATUSES)[number]

export const POST_STATUS_LABELS: Record<PostStatus, string> = {
  draft:     'Borrador',
  published: 'Publicado',
  archived:  'Archivado',
}

export const POST_STATUS_STYLES: Record<PostStatus, string> = {
  draft:     'bg-slate-100   text-slate-600  dark:bg-slate-800   dark:text-slate-300',
  published: 'bg-green-100   text-green-700  dark:bg-green-900/40  dark:text-green-300',
  archived:  'bg-red-100     text-red-600    dark:bg-red-900/40    dark:text-red-300',
}

// ─────────────────────────────────────────────────────────────
// Core entity (espejo de la tabla SQL)
// ─────────────────────────────────────────────────────────────

export interface Post {
  id:           string
  user_id:      string
  title:        string
  slug:         string
  excerpt:      string | null
  content:      string
  cover_image:  string | null
  tags:         string[]
  status:       PostStatus
  is_featured:  boolean
  reading_time: number | null
  published_at: string | null   // ISO 8601
  created_at:   string
  updated_at:   string
}

// ─────────────────────────────────────────────────────────────
// Public view (joined with profile)
// ─────────────────────────────────────────────────────────────

export interface PostWithAuthor extends Post {
  author: {
    username:   string
    full_name:  string | null
    avatar_url: string | null
  }
}

// ─────────────────────────────────────────────────────────────
// Action result
// ─────────────────────────────────────────────────────────────

export type PostActionResult =
  | { error: string; post?: never }
  | { post: Post;   error?: never }
  | { ok: true;     error?: never }
