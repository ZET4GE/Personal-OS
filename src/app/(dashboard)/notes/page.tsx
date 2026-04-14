import { redirect } from 'next/navigation'
import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getNotes, getAllTags } from '@/services/notes'
import { getFolders } from '@/services/folders'
import { NotesLayout } from '@/components/notes/NotesLayout'

export const metadata: Metadata = { title: 'Notas' }

// Notes page breaks out of the dashboard padding to fill the full viewport
export default async function NotesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [notesRes, archivedRes, foldersRes, tagsRes] = await Promise.all([
    getNotes(supabase, user.id),
    getNotes(supabase, user.id, { archived: true }),
    getFolders(supabase, user.id),
    getAllTags(supabase, user.id),
  ])

  const activeNotes   = notesRes.data   ?? []
  const archivedNotes = archivedRes.data ?? []
  const allNotes      = [...activeNotes, ...archivedNotes]

  return (
    // Negative margin to undo the p-6 shell padding so notes layout is edge-to-edge
    <div className="-m-6">
      <NotesLayout
        notes={allNotes}
        folders={foldersRes.data ?? []}
        tags={tagsRes.data ?? []}
      />
    </div>
  )
}
