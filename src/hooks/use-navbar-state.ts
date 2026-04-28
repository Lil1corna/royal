'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import type { ScrollDirection, ScrollVelocity } from '@/hooks/use-scroll-direction'

export type NavbarVisualState = 'top' | 'scrolled' | 'hidden' | 'visible'

type UseNavbarStateInput = {
  y: number
  direction: ScrollDirection
  velocity: ScrollVelocity
  menuOpen: boolean
}

type UseNavbarStateOutput = {
  state: NavbarVisualState
  revealDuration: number
  hideDuration: number
  topProgress: number
}

const TOP_RANGE = 80
const SCROLL_HIDE_OFFSET = 110
const SCROLL_REVEAL_OFFSET = 22

const VELOCITY_DURATIONS: Record<ScrollVelocity, { hide: number; reveal: number }> = {
  slow: { hide: 0.44, reveal: 0.52 },
  medium: { hide: 0.34, reveal: 0.42 },
  fast: { hide: 0.24, reveal: 0.32 },
}

export function useNavbarState({
  y,
  direction,
  velocity,
  menuOpen,
}: UseNavbarStateInput): UseNavbarStateOutput {
  const [state, setState] = useState<NavbarVisualState>('top')
  const [durations, setDurations] = useState(VELOCITY_DURATIONS.slow)
  const inertiaTimerRef = useRef<number | null>(null)
  const lastStateRef = useRef<NavbarVisualState>('top')
  const revealAnchorRef = useRef(0)

  useEffect(() => {
    setDurations(VELOCITY_DURATIONS[velocity])
  }, [velocity])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (menuOpen) {
      if (inertiaTimerRef.current !== null) {
        window.clearTimeout(inertiaTimerRef.current)
        inertiaTimerRef.current = null
      }
      setState('visible')
      lastStateRef.current = 'visible'
      revealAnchorRef.current = y
      return
    }

    if (y <= 8) {
      if (inertiaTimerRef.current !== null) {
        window.clearTimeout(inertiaTimerRef.current)
        inertiaTimerRef.current = null
      }
      setState('top')
      lastStateRef.current = 'top'
      revealAnchorRef.current = 0
      return
    }

    if (direction === 'up') {
      if (inertiaTimerRef.current !== null) {
        window.clearTimeout(inertiaTimerRef.current)
        inertiaTimerRef.current = null
      }

      const upwardDelta = Math.max(0, revealAnchorRef.current - y)
      const nextState = upwardDelta > SCROLL_REVEAL_OFFSET ? 'visible' : 'scrolled'
      setState(nextState)
      lastStateRef.current = nextState
      return
    }

    revealAnchorRef.current = y

    if (y < SCROLL_HIDE_OFFSET) {
      setState('scrolled')
      lastStateRef.current = 'scrolled'
      return
    }

    if (inertiaTimerRef.current !== null) {
      window.clearTimeout(inertiaTimerRef.current)
    }

    const delay = velocity === 'fast' ? 70 : velocity === 'medium' ? 100 : 130
    inertiaTimerRef.current = window.setTimeout(() => {
      setState((current) => {
        if (current === 'top' || current === 'visible') return 'scrolled'
        return 'hidden'
      })
      lastStateRef.current = 'hidden'
      inertiaTimerRef.current = null
    }, delay)

    return () => {
      if (inertiaTimerRef.current !== null) {
        window.clearTimeout(inertiaTimerRef.current)
      }
    }
  }, [direction, menuOpen, velocity, y])

  const topProgress = useMemo(() => {
    const ratio = Math.min(1, Math.max(0, y / TOP_RANGE))
    return ratio
  }, [y])

  return {
    state,
    revealDuration: durations.reveal,
    hideDuration: durations.hide,
    topProgress,
  }
}
