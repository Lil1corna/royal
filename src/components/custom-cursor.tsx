'use client'

import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring, useReducedMotion } from 'framer-motion'

/**
 * Золотой кружок с лагом — только для мыши (fine pointer), не для тач.
 */
export default function CustomCursor() {
  const reduceMotion = useReducedMotion()
  const [enabled, setEnabled] = useState(false)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 280, damping: 28, mass: 0.35 })
  const sy = useSpring(y, { stiffness: 280, damping: 28, mass: 0.35 })

  useEffect(() => {
    if (reduceMotion) return
    const mq = window.matchMedia('(pointer: fine)')
    if (!mq.matches) return
    setEnabled(true)
    document.documentElement.classList.add('royal-custom-cursor')

    const move = (e: MouseEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
    }
    window.addEventListener('mousemove', move)
    return () => {
      window.removeEventListener('mousemove', move)
      document.documentElement.classList.remove('royal-custom-cursor')
    }
  }, [reduceMotion, x, y])

  if (!enabled || reduceMotion) return null

  return (
    <motion.div
      className="fixed top-0 left-0 z-[400] pointer-events-none"
      style={{
        x: sx,
        y: sy,
        translateX: '-50%',
        translateY: '-50%',
      }}
    >
      <div
        className="w-3 h-3 rounded-full border-2 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.7)] bg-amber-400/30"
        aria-hidden
      />
    </motion.div>
  )
}
