'use client'

import { useEffect, useRef, useState } from 'react'

export type ScrollDirection = 'up' | 'down'
export type ScrollVelocity = 'slow' | 'medium' | 'fast'

type ScrollDirectionOptions = {
  deadZone?: number
}

type ScrollDirectionState = {
  direction: ScrollDirection
  velocity: ScrollVelocity
  y: number
}

const VELOCITY_THRESHOLD_MEDIUM = 0.55
const VELOCITY_THRESHOLD_FAST = 1.1

function velocityBucket(value: number): ScrollVelocity {
  if (value >= VELOCITY_THRESHOLD_FAST) return 'fast'
  if (value >= VELOCITY_THRESHOLD_MEDIUM) return 'medium'
  return 'slow'
}

export function useScrollDirection(options: ScrollDirectionOptions = {}): ScrollDirectionState {
  const deadZone = options.deadZone ?? 8
  const [state, setState] = useState<ScrollDirectionState>({
    direction: 'up',
    velocity: 'slow',
    y: 0,
  })

  const previousYRef = useRef(0)
  const previousTimeRef = useRef(0)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const syncInitialState = () => {
      const now = performance.now()
      const initialY = window.scrollY
      previousYRef.current = initialY
      previousTimeRef.current = now
      setState((prev) => ({ ...prev, y: initialY }))
    }

    const readScroll = () => {
      frameRef.current = null

      const now = performance.now()
      const currentY = window.scrollY
      const delta = currentY - previousYRef.current
      const elapsed = Math.max(now - previousTimeRef.current, 16)
      const speed = Math.abs(delta) / elapsed

      if (Math.abs(delta) < deadZone) {
        setState((prev) => {
          const nextVelocity = velocityBucket(speed)
          if (prev.y === currentY && prev.velocity === nextVelocity) return prev
          return {
            ...prev,
            y: currentY,
            velocity: nextVelocity,
          }
        })
        previousTimeRef.current = now
        return
      }

      previousYRef.current = currentY
      previousTimeRef.current = now

      setState({
        direction: delta > 0 ? 'down' : 'up',
        velocity: velocityBucket(speed),
        y: currentY,
      })
    }

    const onScroll = () => {
      if (frameRef.current !== null) return
      frameRef.current = window.requestAnimationFrame(readScroll)
    }

    syncInitialState()
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [deadZone])

  return state
}
