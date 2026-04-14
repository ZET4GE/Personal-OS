import Link from 'next/link'
import { Code2, MessageCircle, ExternalLink } from 'lucide-react'

const LINKS = {
  producto: [
    { label: 'Features',   href: '#features' },
    { label: 'Pricing',    href: '#pricing'  },
    { label: 'Demo',       href: '/williams' },
    { label: 'Changelog',  href: '#'         },
  ],
  cuenta: [
    { label: 'Registrarse', href: '/signup' },
    { label: 'Iniciar sesión', href: '/login' },
    { label: 'Dashboard',   href: '/dashboard' },
  ],
  legal: [
    { label: 'Privacidad',  href: '#' },
    { label: 'Términos',    href: '#' },
  ],
}

const SOCIAL = [
  { icon: Code2,          href: 'https://github.com',    label: 'GitHub' },
  { icon: MessageCircle,  href: 'https://twitter.com',   label: 'Twitter / X' },
  { icon: ExternalLink,   href: 'https://linkedin.com',  label: 'LinkedIn' },
]

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent-600 text-xs font-bold text-white">
                P
              </div>
              <span className="text-sm font-semibold text-text">Personal OS</span>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-muted">
              Tu workspace personal y portafolio público.
              Organizado, todo en un lugar.
            </p>
            <div className="mt-4 flex gap-2">
              {SOCIAL.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted transition-colors hover:border-border-bright hover:text-text"
                >
                  <s.icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* Producto */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-text">
              Producto
            </p>
            <ul className="space-y-2.5">
              {LINKS.producto.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-muted transition-colors hover:text-text"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Cuenta */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-text">
              Cuenta
            </p>
            <ul className="space-y-2.5">
              {LINKS.cuenta.map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-sm text-muted transition-colors hover:text-text"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-text">
              Legal
            </p>
            <ul className="space-y-2.5">
              {LINKS.legal.map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    className="text-sm text-muted transition-colors hover:text-text"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <p className="text-xs text-muted">
            © {new Date().getFullYear()} Personal OS. Hecho con ❤️ en Argentina.
          </p>
          <p className="text-xs text-muted">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent-600 hover:underline dark:text-accent-400"
            >
              Open source
            </a>
            {' '}· Libre y gratuito
          </p>
        </div>
      </div>
    </footer>
  )
}
