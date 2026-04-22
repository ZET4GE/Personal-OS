import { renderToBuffer } from '@react-pdf/renderer'
import { createClient } from '@/lib/supabase/server'
import { getProfileByUsername } from '@/services/profiles'
import { getWorkExperience, getEducation, getSkills, getCVCourses, getCVProjects } from '@/services/cv'
import { getBillingStatus } from '@/services/billing'
import { CVDocument } from '@/components/cv/pdf/CVDocumentPro'
import { CVDocumentATS } from '@/components/cv/pdf/CVDocumentATS'
import type { CVLanguage } from '@/types/cv'

// ─────────────────────────────────────────────────────────────
// Route — GET /api/cv/:username/pdf
// Genera el CV en PDF en el servidor y lo devuelve como descarga.
// ─────────────────────────────────────────────────────────────

export async function GET(
  req: Request,
  { params }: { params: Promise<{ username: string }> },
) {
  const { username } = await params
  const supabase = await createClient()
  const url = new URL(req.url)
  const format = url.searchParams.get('format') === 'ats' ? 'ats' : 'visual'
  const language: CVLanguage = url.searchParams.get('lang') === 'en' ? 'en' : 'es'

  // ── Fetch data ──────────────────────────────────────────────
  const { data: profile } = await getProfileByUsername(supabase, username)

  if (!profile) {
    return new Response('Perfil no encontrado', { status: 404 })
  }

  const [expResult, eduResult, skillsResult, coursesResult, projectsResult] = await Promise.all([
    getWorkExperience(supabase, profile.id),
    getEducation(supabase, profile.id),
    getSkills(supabase, profile.id),
    getCVCourses(supabase, profile.id),
    getCVProjects(supabase, profile.id),
  ])

  const experience = expResult.data   ?? []
  const education  = eduResult.data   ?? []
  const skills     = skillsResult.data ?? []
  const courses    = coursesResult.data ?? []
  const projects   = projectsResult.data ?? []

  if (format === 'ats') {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== profile.id) {
      return new Response('ATS CV disponible solo para el propietario del CV', { status: 403 })
    }

    const billing = await getBillingStatus(supabase, user.id)
    const canUseAts =
      billing.data &&
      billing.data.plan !== 'free' &&
      ['active', 'trialing'].includes(billing.data.status)

    if (!canUseAts) {
      return new Response('ATS CV requiere plan Pro o Team', { status: 402 })
    }
  }

  // ── Render to buffer ────────────────────────────────────────
  const document =
    format === 'ats' ? (
      <CVDocumentATS
        profile={profile}
        experience={experience}
        education={education}
        skills={skills}
        courses={courses}
        projects={projects}
        language={language}
      />
    ) : (
      <CVDocument
        profile={profile}
        experience={experience}
        education={education}
        skills={skills}
        courses={courses}
        projects={projects}
        language={language}
      />
    )

  const buffer = await renderToBuffer(document)

  // ── Return PDF ──────────────────────────────────────────────
  const filename = `${username}-cv-${format}-${language}.pdf`

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
