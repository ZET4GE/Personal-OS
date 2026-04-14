// ─────────────────────────────────────────────────────────────
// Note folders
// ─────────────────────────────────────────────────────────────

export const FOLDER_COLORS = [
  'default', 'red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink',
] as const

export type FolderColor = (typeof FOLDER_COLORS)[number]

export interface NoteFolder {
  id:         string
  user_id:    string
  name:       string
  color:      FolderColor
  icon:       string | null
  parent_id:  string | null
  position:   number
  created_at: string
  updated_at: string
}

// ─────────────────────────────────────────────────────────────
// Notes
// ─────────────────────────────────────────────────────────────

export interface Note {
  id:          string
  user_id:     string
  folder_id:   string | null
  title:       string
  slug:        string
  content:     string
  excerpt:     string | null
  tags:        string[]
  is_pinned:   boolean
  is_archived: boolean
  is_public:   boolean
  word_count:  number
  created_at:  string
  updated_at:  string
}

export interface NoteWithFolder extends Note {
  folder: NoteFolder | null
}

// ─────────────────────────────────────────────────────────────
// Note links (wiki-links [[note]])
// ─────────────────────────────────────────────────────────────

export interface NoteLink {
  id:             string
  source_note_id: string
  target_note_id: string
  created_at:     string
}

// ─────────────────────────────────────────────────────────────
// Search result (from search_notes RPC)
// ─────────────────────────────────────────────────────────────

export interface NoteSearchResult {
  id:          string
  title:       string
  slug:        string
  excerpt:     string | null
  tags:        string[]
  folder_id:   string | null
  is_pinned:   boolean
  is_archived: boolean
  is_public:   boolean
  updated_at:  string
  rank:        number
}

// ─────────────────────────────────────────────────────────────
// Action results
// ─────────────────────────────────────────────────────────────

export type NoteActionResult =
  | { note: Note; error?: undefined }
  | { error: string; note?: undefined }

export type FolderActionResult =
  | { folder: NoteFolder; error?: undefined }
  | { error: string; folder?: undefined }

// ─────────────────────────────────────────────────────────────
// CRUD inputs
// ─────────────────────────────────────────────────────────────

export interface CreateNoteInput {
  title:     string
  content?:  string
  folder_id?: string | null
  tags?:     string[]
}

export interface UpdateNoteInput {
  id:          string
  title?:      string
  content?:    string
  folder_id?:  string | null
  tags?:       string[]
  is_pinned?:  boolean
  is_archived?: boolean
  is_public?:  boolean
  slug?:       string
}

export interface CreateFolderInput {
  name:      string
  color?:    FolderColor
  icon?:     string | null
  parent_id?: string | null
}

export interface UpdateFolderInput {
  id:        string
  name?:     string
  color?:    FolderColor
  icon?:     string | null
  parent_id?: string | null
  position?: number
}

// ─────────────────────────────────────────────────────────────
// Folder color → Tailwind class
// ─────────────────────────────────────────────────────────────

export const FOLDER_COLOR_CLASS: Record<FolderColor, string> = {
  default: 'text-muted',
  red:     'text-red-500',
  orange:  'text-orange-500',
  yellow:  'text-yellow-500',
  green:   'text-emerald-500',
  blue:    'text-blue-500',
  purple:  'text-purple-500',
  pink:    'text-pink-500',
}
