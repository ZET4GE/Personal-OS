import Link from 'next/link'
import { ExternalLink, MessageCircle } from 'lucide-react'
import { WINFLogo } from '@/components/brand/WINFLogo'

const LINKS = {
  producto: [
    { label: 'Features', href: '#features' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Demo', href: '/demo' },
    { label: 'Changelog', href: '#' },
  ],
  cuenta: [
    { label: 'Registrarse', href: '/signup' },
    { label: 'Iniciar sesion', href: '/login' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
  legal: [
    { label: 'Privacidad', href: '#' },
    { label: 'Terminos', href: '#' },
  ],
}

const SOCIAL = [
  { icon: MessageCircle, href: 'https://twitter.com', label: 'Twitter / X' },
  { icon: ExternalLink, href: 'https://linkedin.com', label: 'LinkedIn' },
]

export function Footer() {
  return (
    <footer className="relative border-t border-slate-200/70 bg-white/20 dark:border-white/10 dark:bg-transparent">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.1),transparent_62%)] dark:bg-[radial-gradient(circle_at_50%_0%,rgba(59,130,246,0.14),transparent_62%)]"
      />

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12">
        <div className="rounded-[2rem] border border-slate-200/75 bg-white/52 p-6 shadow-[0_24px_70px_-44px_rgba(15,23,42,0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-surface/55 dark:shadow-none sm:p-8">
          <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr_0.85fr_0.85fr]">
            <div>
              <div className="inline-flex rounded-2xl border border-slate-200/80 bg-white/68 p-3 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.16)] dark:border-white/10 dark:bg-black/10 dark:shadow-none">
                <WINFLogo
                  showTagline
                  markClassName="h-8 w-8 text-text"
                  wordmarkClassName="text-sm font-semibold tracking-tight text-text"
                />
              </div>
              <p className="mt-4 max-w-sm text-sm leading-7 text-muted">
                Work in One Framework: metas, proyectos, tiempo y perfil publico en un solo lugar.
              </p>
              <div className="mt-5 flex gap-2">
                {SOCIAL.map((item) => (
                  <a
                    key={item.label}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={item.label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200/80 bg-white/68 text-slate-500 shadow-[0_14px_28px_-24px_rgba(15,23,42,0.16)] transition-all hover:-translate-y-0.5 hover:border-slate-300 hover:text-text dark:border-white/10 dark:bg-white/5 dark:text-muted dark:shadow-none dark:hover:border-border-bright dark:hover:text-text"
                  >
                    <item.icon size={15} />
                  </a>
                ))}
              </div>
            </div>

            <FooterColumn title="Producto">
              {LINKS.producto.map((item) => (
                <a key={item.label} href={item.href} className={linkClassName}>
                  {item.label}
                </a>
              ))}
            </FooterColumn>

            <FooterColumn title="Cuenta">
              {LINKS.cuenta.map((item) => (
                <Link key={item.label} href={item.href} className={linkClassName}>
                  {item.label}
                </Link>
              ))}
            </FooterColumn>

            <FooterColumn title="Legal">
              {LINKS.legal.map((item) => (
                <a key={item.label} href={item.href} className={linkClassName}>
                  {item.label}
                </a>
              ))}
            </FooterColumn>
          </div>

          <div className="mt-10 flex flex-col gap-3 border-t border-slate-200/75 pt-6 text-xs text-muted dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
            <p>&copy; {new Date().getFullYear()} WINF. Hecho en Argentina.</p>
            <p>Plan gratuito disponible - Proximamente planes Pro.</p>
          </div>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-text">{title}</p>
      <div className="space-y-2.5">{children}</div>
    </div>
  )
}

const linkClassName =
  'block text-sm text-muted transition-colors hover:text-text'
