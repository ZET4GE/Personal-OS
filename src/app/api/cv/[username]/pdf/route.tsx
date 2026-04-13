import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername } from '@/services/profiles'
import { getWorkExperience, getEducation, getSkills } from '@/services/cv'
import { CVDocument } from '@/components/cv/pdf/CVDocument'

// ─────────────────────────────────────────────────────────────
// Route — GET /api/cv/:username/pdf
// Genera el CV en PDF en el servidor y lo devuelve como descarga.
// ─────────────────────────────────────────────────────────────

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params
  const supabase = await createClient()

  // ── Fetch data ──────────────────────────────────────────────
  const { data: profile } = await getProfileByUsername(supabase, username)

  if (!profile) {
    return new Response('Perfil no encontrado', { status: 404 })
  }

  const [expResult, eduResult, skillsResult] = await Promise.all([
    getWorkExperience(supabase, profile.id),
    getEducation(supabase, profile.id),
    getSkills(supabase, profile.id),
  ])

  const experience = expResult.data   ?? []
  const education  = eduResult.data   ?? []
  const skills     = skillsResult.data ?? []

  // ── Render to buffer ────────────────────────────────────────
  const buffer = await renderToBuffer(
    <CVDocument
      profile={profile}
      experience={experience}
      education={education}
      skills={skills}
    />,
  )

  // ── Return PDF ──────────────────────────────────────────────
  const filename = `${username}-cv.pdf`

  // Buffer → Uint8Array para satisfacer el tipo BodyInit del Response
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type':        'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length':      String(buffer.byteLength),
      'Cache-Control':       'no-store',
    },
  })
}
