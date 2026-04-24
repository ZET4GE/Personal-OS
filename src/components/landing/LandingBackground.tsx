'use client'

import { useEffect, useRef } from 'react'

export function LandingBackground() {
  const wrapRef  = useRef<HTMLDivElement>(null)
  const orbARef  = useRef<HTMLDivElement>(null)
  const orbBRef  = useRef<HTMLDivElement>(null)
  const orbCRef  = useRef<HTMLDivElement>(null)
  const glowRef  = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let rafId    = 0
    let running  = false
    let targetX  = 0.72
    let targetY  = 0.18
    let currentX = 0.72
    let currentY = 0.18
    let scrollY  = 0
    let prevScrollY = 0

    const LERP      = 0.06
    const THRESHOLD = 0.0008

    function lerp(a: number, b: number, t: number) { return a + (b - a) * t }

    function tick() {
      currentX = lerp(currentX, targetX, LERP)
      currentY = lerp(currentY, targetY, LERP)

      const dx = (currentX - 0.5)
      const dy = (currentY - 0.5)

      const node = wrapRef.current
      if (node) {
        node.style.setProperty('--px', `${(currentX * 100).toFixed(2)}%`)
        node.style.setProperty('--py', `${(currentY * 100).toFixed(2)}%`)
      }

      if (orbARef.current) {
        const sx = (dx *  55).toFixed(2)
        const sy = (dy *  38 - scrollY * 0.14).toFixed(2)
        orbARef.current.style.transform = `translate(${sx}px, ${sy}px)`
      }
      if (orbBRef.current) {
        const sx = (dx * -42).toFixed(2)
        const sy = (dy * -30 - scrollY * 0.09).toFixed(2)
        orbBRef.current.style.transform = `translate(${sx}px, ${sy}px)`
      }
      if (orbCRef.current) {
        const sx = (dx *  28).toFixed(2)
        const sy = (dy *  20 - scrollY * 0.06).toFixed(2)
        orbCRef.current.style.transform = `translate(${sx}px, ${sy}px)`
      }
      if (glowRef.current) {
        const sx = (dx * 70).toFixed(2)
        const sy = (dy * 50).toFixed(2)
        glowRef.current.style.transform = `translate(calc(-50% + ${sx}px), calc(-50% + ${sy}px))`
      }

      // Stop loop when fully converged and scroll settled — restarts on next input
      const converged =
        Math.abs(currentX - targetX) < THRESHOLD &&
        Math.abs(currentY - targetY) < THRESHOLD &&
        Math.abs(scrollY - prevScrollY) < 0.5

      prevScrollY = scrollY

      if (converged) {
        running = false
        return
      }

      rafId = requestAnimationFrame(tick)
    }

    function startRaf() {
      if (!running) {
        running = true
        rafId = requestAnimationFrame(tick)
      }
    }

    const onPointer = (e: PointerEvent) => {
      targetX = e.clientX / window.innerWidth
      targetY = e.clientY / window.innerHeight
      startRaf()
    }

    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0]
      if (!t) return
      targetX = t.clientX / window.innerWidth
      targetY = t.clientY / window.innerHeight
      startRaf()
    }

    const onScroll = () => {
      scrollY = window.scrollY
      startRaf()
    }

    window.addEventListener('pointermove', onPointer, { passive: true })
    window.addEventListener('touchmove',   onTouch,   { passive: true })
    window.addEventListener('scroll',      onScroll,  { passive: true })
    startRaf()

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('pointermove', onPointer)
      window.removeEventListener('touchmove',   onTouch)
      window.removeEventListener('scroll',      onScroll)
    }
  }, [])

  return (
    <div
      ref={wrapRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden [--px:72%] [--py:18%]"
    >
      {/* Base gradient */}
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(245,247,251,0.97)_0%,rgba(234,239,247,0.95)_48%,rgba(242,245,250,0.97)_100%)] dark:bg-[linear-gradient(180deg,rgba(5,8,22,0.96)_0%,rgba(9,9,11,0.97)_48%,rgba(7,11,20,0.98)_100%)]" />

      {/* Mouse-reactive radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--px)_var(--py),rgba(96,165,250,0.10)_0%,transparent_26%),radial-gradient(circle_at_14%_12%,rgba(129,140,248,0.07)_0%,transparent_22%),radial-gradient(circle_at_86%_74%,rgba(6,182,212,0.06)_0%,transparent_18%)] dark:bg-[radial-gradient(circle_at_var(--px)_var(--py),rgba(96,165,250,0.22)_0%,transparent_30%),radial-gradient(circle_at_14%_12%,rgba(129,140,248,0.18)_0%,transparent_26%),radial-gradient(circle_at_86%_74%,rgba(6,182,212,0.14)_0%,transparent_22%)]" />

      {/* Texture */}
      <div className="absolute inset-0 opacity-[0.10] dark:opacity-[0.20] landing-noise" />
      <div className="absolute inset-0 bg-grid opacity-[0.03] dark:opacity-[0.07]" />

      {/* Orb A — top-left, accent blue */}
      <div
        ref={orbARef}
        className="landing-orb landing-orb-a absolute left-[6%] top-[6%] h-[28rem] w-[28rem] rounded-full bg-accent-400/5 blur-2xl dark:bg-accent-400/12 will-change-transform"
      />

      {/* Orb B — top-right, violet */}
      <div
        ref={orbBRef}
        className="landing-orb landing-orb-b absolute right-[8%] top-[16%] h-[22rem] w-[22rem] rounded-full bg-violet-500/5 blur-2xl dark:bg-violet-500/13 will-change-transform"
      />

      {/* Orb C — bottom-center, cyan */}
      <div
        ref={orbCRef}
        className="landing-orb landing-orb-c absolute bottom-[6%] left-[28%] h-[24rem] w-[24rem] rounded-full bg-cyan-500/4 blur-2xl dark:bg-cyan-500/10 will-change-transform"
      />

      {/* Soft mouse-following glow — top-center */}
      <div
        ref={glowRef}
        className="absolute left-1/2 top-[28%] h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/14 blur-2xl dark:bg-accent-400/5 will-change-transform"
      />
    </div>
  )
}
