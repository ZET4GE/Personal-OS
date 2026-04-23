'use client'

import { useEffect, useRef } from 'react'

export function LandingBackground() {
  const ref = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return

    let frame = 0

    const updatePointer = (clientX: number, clientY: number) => {
      if (frame) cancelAnimationFrame(frame)

      frame = window.requestAnimationFrame(() => {
        const x = (clientX / window.innerWidth) * 100
        const y = (clientY / window.innerHeight) * 100
        node.style.setProperty('--pointer-x', `${x}%`)
        node.style.setProperty('--pointer-y', `${y}%`)
        node.style.setProperty('--pointer-shift-x', `${(x - 50) * 0.12}px`)
        node.style.setProperty('--pointer-shift-y', `${(y - 50) * 0.12}px`)
      })
    }

    const handlePointerMove = (event: PointerEvent) => {
      updatePointer(event.clientX, event.clientY)
    }

    const handleTouchMove = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!touch) return
      updatePointer(touch.clientX, touch.clientY)
    }

    updatePointer(window.innerWidth * 0.72, window.innerHeight * 0.18)
    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('touchmove', handleTouchMove)
    }
  }, [])

  return (
    <div
      ref={ref}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden [--pointer-x:72%] [--pointer-y:18%] [--pointer-shift-x:0px] [--pointer-shift-y:0px]"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_var(--pointer-x)_var(--pointer-y),color-mix(in_srgb,var(--color-accent-500)_16%,transparent)_0%,transparent_26%),radial-gradient(circle_at_18%_14%,rgba(129,140,248,0.18)_0%,transparent_26%),radial-gradient(circle_at_84%_72%,rgba(14,165,233,0.14)_0%,transparent_22%)] dark:bg-[radial-gradient(circle_at_var(--pointer-x)_var(--pointer-y),color-mix(in_srgb,var(--color-accent-400)_22%,transparent)_0%,transparent_28%),radial-gradient(circle_at_18%_14%,rgba(129,140,248,0.22)_0%,transparent_28%),radial-gradient(circle_at_84%_72%,rgba(14,165,233,0.18)_0%,transparent_24%)]" />

      <div className="absolute inset-0 opacity-[0.22] dark:opacity-[0.3] landing-noise" />
      <div className="absolute inset-0 bg-grid opacity-[0.05] dark:opacity-[0.08]" />

      <div className="landing-orb landing-orb-a absolute left-[8%] top-[8%] h-[24rem] w-[24rem] rounded-full bg-accent-500/10 blur-3xl dark:bg-accent-500/12" />
      <div className="landing-orb landing-orb-b absolute right-[10%] top-[18%] h-[18rem] w-[18rem] rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/14" />
      <div className="landing-orb landing-orb-c absolute bottom-[8%] left-[30%] h-[20rem] w-[20rem] rounded-full bg-cyan-500/8 blur-3xl dark:bg-cyan-500/10" />

      <div
        className="absolute left-1/2 top-0 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-white/35 blur-3xl dark:bg-accent-400/6"
        style={{ transform: 'translate(calc(-50% + var(--pointer-shift-x)), var(--pointer-shift-y))' }}
      />
    </div>
  )
}
