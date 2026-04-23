-- 059_security_note_links_rls.sql
-- Fix: note_links WITH CHECK must also verify target note ownership.
-- Without this, a user could link from their note to a private note of
-- another user, leaking that the note exists.

drop policy if exists "Users manage own note links" on public.note_links;

create policy "Users manage own note links"
  on public.note_links
  for all
  using (
    exists (
      select 1 from public.notes
      where notes.id = note_links.source_note_id
        and notes.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.notes
      where notes.id = note_links.source_note_id
        and notes.user_id = auth.uid()
    )
    and (
      exists (
        select 1 from public.notes
        where notes.id = note_links.target_note_id
          and notes.user_id = auth.uid()
      )
      or exists (
        select 1 from public.notes
        where notes.id = note_links.target_note_id
          and notes.is_public = true
      )
    )
  );
