'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { AuthModal } from '@/components/auth/AuthModal'
import { useAuthModal } from '@/stores/auth-modal.store'
import { WINFLogo } from '@/components/brand/WINFLogo'

interface NavbarProps {
  initialModal?: 'login' | 'signup'
}

export function Navbar({ initialModal }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled,  setScrolled] = useState(false)
  const { openModal } = useAuthModal()

  // Auto-open modal if landing was reached via /?modal=login|signup
  useEffect(() => {
    if (initialModal) openModal(initialModal)
  }, [initialModal, openModal])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const navLinks = [
    { label: 'Features',  href: '#features' },
    { label: 'Perfiles',  href: '#profiles'  },
    { label: 'Pricing',   href: '#pricing'   },
  ]

  return (
    <>
      <header
        className={[
          'fixed inset-x-0 top-0 z-40 transition-all duration-200 ease-out',
          scrolled
            ? 'border-b border-slate-200/80 bg-white/72 backdrop-blur-xl shadow-[0_20px_40px_-30px_rgba(15,23,42,0.16)] dark:border-border dark:bg-surface/90 dark:shadow-[var(--shadow-card)]'
            : 'bg-transparent',
        ].join(' ')}
      >
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5">
            <WINFLogo markClassName="h-7 w-7 text-text" wordmarkClassName="text-sm font-semibold tracking-tight text-text" />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-sm text-muted transition-colors duration-200 hover:text-text"
              >
                {l.label}
              </a>
            ))}
          </nav>

          {/* Desktop actions */}
          <div className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <button
              onClick={() => openModal('login')}
              className="rounded-lg px-3 py-1.5 text-sm text-muted transition-colors duration-200 hover:text-text"
            >
              Iniciar sesión
            </button>
            <button
              onClick={() => openModal('signup')}
              className="rounded-lg bg-accent-600 px-3.5 py-1.5 text-sm font-medium text-white transition-all duration-200 ease-out hover:-translate-y-0.5 hover:opacity-95"
            >
              Registrarse
            </button>
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="rounded-lg p-1.5 text-muted transition-colors duration-200 hover:bg-surface-hover hover:text-text"
              aria-label="Menú"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="border-t border-border bg-surface/95 backdrop-blur-md md:hidden">
            <nav className="flex flex-col px-4 py-3 gap-1">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-muted transition-colors hover:bg-surface-hover hover:text-text"
                >
                  {l.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 pt-3 border-t border-border">
                <button
                  onClick={() => { setMenuOpen(false); openModal('login') }}
                  className="rounded-lg border border-border px-3 py-2 text-center text-sm font-medium text-text hover:bg-surface-hover"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => { setMenuOpen(false); openModal('signup') }}
                  className="rounded-lg bg-accent-600 px-3 py-2 text-center text-sm font-medium text-white hover:opacity-90"
                >
                  Registrarse gratis
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Modal — rendered once here, accessible from anywhere via store */}
      <AuthModal />
    </>
  )
}
