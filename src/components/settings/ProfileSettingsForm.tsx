'use client'

import { useActionState, useEffect, useState } from 'react'
import Link from 'next/link'
import { Camera, CheckCircle2, Eye, Loader2, Palette, Save, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import { updateProfileAction } from '@/app/(dashboard)/settings/actions'
import { getPublicThemePreviewClasses, getPublicThemeStyle } from '@/lib/public-theme'
import { createClient } from '@/lib/supabase/client'
import {
  CV_AVAILABILITY_LABELS,
  CV_AVAILABILITY_OPTIONS,
  PORTFOLIO_ACCENT_STYLE_LABELS,
  PORTFOLIO_ACCENT_STYLE_OPTIONS,
  PORTFOLIO_BACKGROUND_STYLE_LABELS,
  PORTFOLIO_BACKGROUND_STYLE_OPTIONS,
  PORTFOLIO_CARD_STYLE_LABELS,
  PORTFOLIO_CARD_STYLE_OPTIONS,
  PORTFOLIO_FONT_STYLE_LABELS,
  PORTFOLIO_FONT_STYLE_OPTIONS,
} from '@/types/profile'
import type {
  PortfolioAccentStyle,
  PortfolioBackgroundStyle,
  PortfolioCardStyle,
  PortfolioFontStyle,
  Profile,
} from '@/types/profile'

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

interface ProfileSettingsFormProps {
  profile: Profile | null
  canCustomizePortfolio: boolean
}

export function ProfileSettingsForm({ profile, canCustomizePortfolio }: ProfileSettingsFormProps) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, null)
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? '')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)

  // Toasts — disparan cuando el estado cambia tras un submit
  useEffect(() => {
    if (state?.ok)    toast.success('Perfil guardado')
    else if (state?.error) toast.error(state.error)
  }, [state])

  // Si el save fue exitoso, usar el perfil actualizado como fuente de verdad
  const current = state?.ok ? state.profile : profile
  const [portfolioFontStyle, setPortfolioFontStyle] = useState<PortfolioFontStyle>(profile?.portfolio_font_style ?? 'sans')
  const [portfolioBackgroundStyle, setPortfolioBackgroundStyle] = useState<PortfolioBackgroundStyle>(profile?.portfolio_background_style ?? 'mist')
  const [portfolioCardStyle, setPortfolioCardStyle] = useState<PortfolioCardStyle>(profile?.portfolio_card_style ?? 'glass')
  const [portfolioAccentStyle, setPortfolioAccentStyle] = useState<PortfolioAccentStyle>(profile?.portfolio_accent_style ?? 'blue')

  useEffect(() => {
    setAvatarUrl(current?.avatar_url ?? '')
  }, [current?.avatar_url])

  useEffect(() => {
    setPortfolioFontStyle(current?.portfolio_font_style ?? 'sans')
    setPortfolioBackgroundStyle(current?.portfolio_background_style ?? 'mist')
    setPortfolioCardStyle(current?.portfolio_card_style ?? 'glass')
    setPortfolioAccentStyle(current?.portfolio_accent_style ?? 'blue')
  }, [
    current?.portfolio_accent_style,
    current?.portfolio_background_style,
    current?.portfolio_card_style,
    current?.portfolio_font_style,
  ])

  async function handleAvatarChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Subi una imagen valida')
      return
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('La imagen no puede superar 2 MB')
      return
    }

    setIsUploadingAvatar(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        toast.error('No autenticado')
        return
      }

      const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
      const path = `${user.id}/avatar-${Date.now()}.${extension}`
      const { error } = await supabase.storage
        .from('avatars')
        .upload(path, file, {
          cacheControl: '3600',
          contentType: file.type,
          upsert: false,
        })

      if (error) {
        toast.error(error.message)
        return
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setAvatarUrl(data.publicUrl)
      toast.success('Foto subida. Guarda los cambios para aplicarla.')
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Preview link */}
      {current?.username && (
        <div className="flex items-center justify-between rounded-lg border border-border bg-surface px-4 py-3">
          <div className="space-y-0.5">
            <p className="text-sm font-medium">Perfil público</p>
            <p className="text-xs text-muted">
              Así te ven los demás cuando visitan tu perfil.
            </p>
          </div>
          <Link
            href={`/${current.username}`}
            target="_blank"
            className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            <Eye size={13} /> Ver perfil
          </Link>
        </div>
      )}

      {/* Form */}
      <form action={formAction} className="space-y-5">
        <input type="hidden" name="avatar_url" value={avatarUrl} />
        <input type="hidden" name="portfolio_font_style" value={portfolioFontStyle} />
        <input type="hidden" name="portfolio_background_style" value={portfolioBackgroundStyle} />
        <input type="hidden" name="portfolio_card_style" value={portfolioCardStyle} />
        <input type="hidden" name="portfolio_accent_style" value={portfolioAccentStyle} />

        {/* Success message */}
        {state?.ok && (
          <div className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
            <CheckCircle2 size={16} />
            Perfil actualizado correctamente.
          </div>
        )}

        {/* Error message */}
        {state?.error && (
          <div className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
            {state.error}
          </div>
        )}

        {/* ─── Sección: Identidad ─────────────────────── */}
        <Section title="Foto de perfil">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-border bg-surface-hover">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={current?.full_name ?? current?.username ?? 'Avatar'}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent-500 to-violet-600 text-2xl font-bold text-white">
                  {getInitials(current)}
                </div>
              )}
              {isUploadingAvatar && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/45 text-white">
                  <Loader2 size={22} className="animate-spin" />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <p className="text-sm font-medium">Imagen para perfil, CV online y PDF</p>
              <p className="text-xs text-muted">Formato JPG, PNG, WebP o GIF. Maximo 2 MB.</p>
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-accent-600 px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90">
                  <Camera size={15} />
                  {isUploadingAvatar ? 'Subiendo...' : 'Subir foto'}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    className="sr-only"
                    disabled={isUploadingAvatar}
                    onChange={handleAvatarChange}
                  />
                </label>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface-hover"
                  >
                    <X size={15} /> Quitar
                  </button>
                )}
              </div>
            </div>
          </div>
        </Section>

        <Section title="Identidad">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Username *" htmlFor="username"
              hint="Letras minúsculas, números y guiones. URL: /tu-username">
              <div className="relative">
                <span className="absolute inset-y-0 left-3 flex items-center text-sm text-muted">
                  /
                </span>
                <input id="username" name="username" type="text" required
                  defaultValue={current?.username ?? ''}
                  placeholder="tu-username"
                  className={`${inputCls} pl-6`} />
              </div>
            </Field>

            <Field label="Nombre completo" htmlFor="full_name">
              <input id="full_name" name="full_name" type="text"
                defaultValue={current?.full_name ?? ''}
                placeholder="Tu nombre"
                className={inputCls} />
            </Field>
          </div>

          <Field label="Titulo profesional" htmlFor="headline">
            <input id="headline" name="headline" type="text"
              defaultValue={current?.headline ?? ''}
              placeholder="Frontend developer, Sysadmin, Estudiante DevOps..."
              className={inputCls} />
          </Field>

          <Field label="Bio" htmlFor="bio" hint="Máximo 500 caracteres.">
            <textarea id="bio" name="bio" rows={3}
              defaultValue={current?.bio ?? ''}
              placeholder="Cuéntanos sobre ti..."
              className={`${inputCls} resize-none`} />
          </Field>

          <Field label="Ubicación" htmlFor="location">
            <input id="location" name="location" type="text"
              defaultValue={current?.location ?? ''}
              placeholder="Ciudad, País"
              className={inputCls} />
          </Field>
        </Section>

        {/* ─── Sección: Links ─────────────────────────── */}
        <Section title="Datos para CV">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Telefono" htmlFor="phone">
              <input id="phone" name="phone" type="tel"
                defaultValue={current?.phone ?? ''}
                placeholder="+54 9 ..."
                className={inputCls} />
            </Field>

            <Field label="Fecha de nacimiento" htmlFor="birth_date">
              <input id="birth_date" name="birth_date" type="date"
                defaultValue={current?.birth_date?.slice(0, 10) ?? ''}
                className={inputCls} />
            </Field>

            <Field label="Disponibilidad" htmlFor="availability">
              <select id="availability" name="availability"
                defaultValue={current?.availability ?? ''}
                className={inputCls}>
                <option value="">Sin especificar</option>
                {CV_AVAILABILITY_OPTIONS.map((option) => (
                  <option key={option} value={option}>
                    {CV_AVAILABILITY_LABELS[option]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </Section>

        <Section title="Links">
          <Field label="Sitio web" htmlFor="website">
            <input id="website" name="website" type="url"
              defaultValue={current?.website ?? ''}
              placeholder="https://tu-sitio.com"
              className={inputCls} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="GitHub" htmlFor="github_url">
              <input id="github_url" name="github_url" type="url"
                defaultValue={current?.github_url ?? ''}
                placeholder="https://github.com/..."
                className={inputCls} />
            </Field>
            <Field label="LinkedIn" htmlFor="linkedin_url">
              <input id="linkedin_url" name="linkedin_url" type="url"
                defaultValue={current?.linkedin_url ?? ''}
                placeholder="https://linkedin.com/in/..."
                className={inputCls} />
            </Field>
            <Field label="Twitter / X" htmlFor="twitter_url">
              <input id="twitter_url" name="twitter_url" type="url"
                defaultValue={current?.twitter_url ?? ''}
                placeholder="https://x.com/..."
                className={inputCls} />
            </Field>
          </div>
        </Section>

        <Section title="Portfolio Pro">
          <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Palette size={15} className="text-accent-500" />
                <p className="text-sm font-medium">Customiza tu portfolio publico</p>
                {canCustomizePortfolio ? (
                  <span className="rounded-full bg-accent-500/12 px-2 py-0.5 text-[11px] font-semibold text-accent-500">
                    Pro activo
                  </span>
                ) : (
                  <span className="rounded-full bg-amber-500/12 px-2 py-0.5 text-[11px] font-semibold text-amber-500">
                    Solo Pro
                  </span>
                )}
              </div>
              <p className="text-xs text-muted">
                Cambia tipografia, fondo, tarjetas y color acento del portfolio publico.
              </p>
              {!canCustomizePortfolio && (
                <p className="text-xs text-amber-500">
                  Podes probar la vista previa aca, pero solo se guarda con Pro.
                </p>
              )}
            </div>

            {!canCustomizePortfolio && (
              <Link
                href="/settings/billing"
                className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors hover:bg-surface-hover"
              >
                <Sparkles size={13} />
                Ver plan Pro
              </Link>
            )}
          </div>

          <PortfolioLivePreview
            theme={{
              portfolio_font_style: portfolioFontStyle,
              portfolio_background_style: portfolioBackgroundStyle,
              portfolio_card_style: portfolioCardStyle,
              portfolio_accent_style: portfolioAccentStyle,
            }}
          />

          <div className="space-y-5">
            <ThemeOptionGroup
              label="Tipografias"
              hint="Elegi la voz visual del portfolio."
              options={PORTFOLIO_FONT_STYLE_OPTIONS}
              value={portfolioFontStyle}
              onChange={(value) => setPortfolioFontStyle(value as PortfolioFontStyle)}
              labels={PORTFOLIO_FONT_STYLE_LABELS}
              getTheme={(option) => ({
                portfolio_font_style: option as PortfolioFontStyle,
                portfolio_background_style: portfolioBackgroundStyle,
                portfolio_card_style: portfolioCardStyle,
                portfolio_accent_style: portfolioAccentStyle,
              })}
              previewType="font"
            />

            <ThemeOptionGroup
              label="Fondos"
              hint="Controla la atmosfera general del perfil."
              options={PORTFOLIO_BACKGROUND_STYLE_OPTIONS}
              value={portfolioBackgroundStyle}
              onChange={(value) => setPortfolioBackgroundStyle(value as PortfolioBackgroundStyle)}
              labels={PORTFOLIO_BACKGROUND_STYLE_LABELS}
              getTheme={(option) => ({
                portfolio_font_style: portfolioFontStyle,
                portfolio_background_style: option as PortfolioBackgroundStyle,
                portfolio_card_style: portfolioCardStyle,
                portfolio_accent_style: portfolioAccentStyle,
              })}
              previewType="background"
            />

            <ThemeOptionGroup
              label="Tarjetas"
              hint="Define profundidad, contraste y estilo de los bloques."
              options={PORTFOLIO_CARD_STYLE_OPTIONS}
              value={portfolioCardStyle}
              onChange={(value) => setPortfolioCardStyle(value as PortfolioCardStyle)}
              labels={PORTFOLIO_CARD_STYLE_LABELS}
              getTheme={(option) => ({
                portfolio_font_style: portfolioFontStyle,
                portfolio_background_style: portfolioBackgroundStyle,
                portfolio_card_style: option as PortfolioCardStyle,
                portfolio_accent_style: portfolioAccentStyle,
              })}
              previewType="card"
            />

            <ThemeOptionGroup
              label="Colores acento"
              hint="Marca botones, badges y detalles clave."
              options={PORTFOLIO_ACCENT_STYLE_OPTIONS}
              value={portfolioAccentStyle}
              onChange={(value) => setPortfolioAccentStyle(value as PortfolioAccentStyle)}
              labels={PORTFOLIO_ACCENT_STYLE_LABELS}
              getTheme={(option) => ({
                portfolio_font_style: portfolioFontStyle,
                portfolio_background_style: portfolioBackgroundStyle,
                portfolio_card_style: portfolioCardStyle,
                portfolio_accent_style: option as PortfolioAccentStyle,
              })}
              previewType="accent"
            />
          </div>
        </Section>

        {/* ─── Sección: Visibilidad ───────────────────── */}
        <Section title="Visibilidad">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              name="is_public"
              value="true"
              defaultChecked={current?.is_public ?? true}
              className="mt-0.5 h-4 w-4 rounded accent-accent-600"
            />
            <div>
              <p className="text-sm font-medium">Perfil público</p>
              <p className="text-xs text-muted">
                Cualquiera podrá ver tu perfil en /{current?.username ?? 'tu-username'}.
                Si lo desmarcas, sólo tú podrás verlo.
              </p>
            </div>
          </label>
        </Section>

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-2 rounded-lg bg-accent-600 px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            <Save size={15} />
            {isPending ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </form>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-xl border border-border p-5">
      <legend className="-ml-1 px-1 text-xs font-semibold uppercase tracking-widest text-muted">
        {title}
      </legend>
      {children}
    </fieldset>
  )
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-xs font-medium">
        {label}
      </label>
      {children}
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  )
}

type PortfolioThemePreview = Pick<
  Profile,
  'portfolio_font_style' | 'portfolio_background_style' | 'portfolio_card_style' | 'portfolio_accent_style'
>

type ThemePreviewType = 'font' | 'background' | 'card' | 'accent'

function ThemeOptionGroup({
  label,
  hint,
  options,
  value,
  onChange,
  labels,
  getTheme,
  previewType,
}: {
  label: string
  hint: string
  options: readonly string[]
  value: string
  onChange: (value: string) => void
  labels: Record<string, string>
  getTheme: (option: string) => PortfolioThemePreview
  previewType: ThemePreviewType
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium text-text">{label}</p>
        <p className="text-xs text-muted">{hint}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {options.map((option) => (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            className={[
              'overflow-hidden rounded-2xl border text-left transition-all',
              value === option
                ? 'border-accent-500 shadow-[0_0_0_1px_rgba(59,130,246,0.25)]'
                : 'border-border hover:border-border-bright hover:bg-surface-hover/40',
            ].join(' ')}
          >
            <PortfolioMiniPreview theme={getTheme(option)} type={previewType} />
            <div className="flex items-center justify-between border-t border-border px-3 py-2">
              <span className="text-sm font-medium text-text">{labels[option]}</span>
              {value === option && (
                <span className="rounded-full bg-accent-500/12 px-2 py-0.5 text-[11px] font-semibold text-accent-500">
                  Activo
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

function PortfolioLivePreview({ theme }: { theme: PortfolioThemePreview }) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-3">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-text">Vista previa del portfolio</p>
          <p className="text-xs text-muted">Asi se verian tu header, tarjetas y acentos publicos.</p>
        </div>
        <span className="rounded-full bg-accent-500/12 px-2.5 py-1 text-[11px] font-semibold text-accent-500">
          Live
        </span>
      </div>

      <div className="overflow-hidden rounded-[22px] border border-border">
        <PortfolioMiniPreview theme={theme} type="background" large />
      </div>
    </div>
  )
}

function PortfolioMiniPreview({
  theme,
  type,
  large = false,
}: {
  theme: PortfolioThemePreview
  type: ThemePreviewType
  large?: boolean
}) {
  const classes = getPublicThemePreviewClasses(theme as Profile)
  const style = getPublicThemeStyle(theme as Profile)

  return (
    <div
      className={[
        classes,
        large ? 'min-h-[200px] p-4 sm:min-h-[240px]' : 'min-h-[132px] p-3',
      ].join(' ')}
      style={style}
    >
      <div className="grid h-full gap-3 sm:grid-cols-[1.2fr_0.8fr]">
        <div className="public-card public-body flex min-h-[110px] flex-col justify-between rounded-2xl border p-3 sm:p-4">
          <div className="space-y-2">
            <span className="public-badge inline-flex w-fit rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em]">
              Meta activa
            </span>
            <div className="space-y-1">
              <p className="public-heading text-lg font-semibold text-slate-950 dark:text-white">
                Curso AWS + Portfolio
              </p>
              <p className="text-xs leading-5 text-slate-600 dark:text-slate-300">
                Roadmap, proyectos y progreso visibles con una identidad propia.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-900/8 dark:bg-white/10">
              <div
                className="h-full rounded-full"
                style={{ width: '68%', background: 'var(--public-accent)' }}
              />
            </div>
            <span className="text-[11px] font-semibold public-accent-text">68%</span>
          </div>
        </div>

        <div className="grid gap-3">
          <div className="public-card public-body rounded-2xl border p-3">
            {type === 'font' && (
              <>
                <p className="public-heading text-sm font-semibold text-slate-950 dark:text-white">Texto</p>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                  El estilo tipografico define el tono del portfolio.
                </p>
              </>
            )}

            {type === 'background' && (
              <>
                <p className="public-heading text-sm font-semibold text-slate-950 dark:text-white">Fondo</p>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                  Cambia el ambiente general sin tocar el contenido.
                </p>
              </>
            )}

            {type === 'card' && (
              <>
                <p className="public-heading text-sm font-semibold text-slate-950 dark:text-white">Tarjeta</p>
                <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-300">
                  Ajusta contraste, profundidad y presencia.
                </p>
              </>
            )}

            {type === 'accent' && (
              <>
                <p className="public-heading text-sm font-semibold text-slate-950 dark:text-white">Acento</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full" style={{ background: 'var(--public-accent)' }} />
                  <span className="text-xs text-slate-600 dark:text-slate-300">Botones y badges</span>
                </div>
              </>
            )}
          </div>

          <div className="rounded-2xl border border-dashed border-border/80 bg-white/35 px-3 py-2 dark:bg-slate-950/20">
            <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
              <span>Preview</span>
              <span className="public-accent-text">WINF</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function getInitials(profile: Profile | null): string {
  if (profile?.full_name) {
    return profile.full_name
      .split(' ')
      .map((word) => word[0])
      .slice(0, 2)
      .join('')
      .toUpperCase()
  }

  return profile?.username?.[0]?.toUpperCase() ?? 'W'
}

const inputCls =
  'w-full rounded-lg border border-border px-3 py-2 text-sm bg-surface outline-none ' +
  'transition-colors focus:ring-2 focus:ring-accent-500/30 focus:border-accent-500 ' +
  'dark:bg-slate-900 placeholder:text-slate-400'
