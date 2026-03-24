'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useLowPowerMotion } from '@/hooks/use-low-power-motion'

/**
 * Золотой «занавес» при переходе между страницами (поднимается вверх и открывает контент).
 * Первый заход на сайт без эффекта. На тач-устройствах отключён (лаги, артефакты viewport).
 */
function CurtainOverlay() {
  const pathname = usePathname()
  const reduce = useReducedMotion()
  const lowPower = useLowPowerMotion()
  const [hasNavigated, setHasNavigated] = useState(() => {
    if (typeof window === 'undefined') return false
    return sessionStorage.getItem('royalaz_has_navigated') === '1'
  })

  if (reduce || lowPower) return null

  return (
    <motion.div
      key={pathname}
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[350] min-h-[100dvh] min-h-[100svh]"
      style={{
        transformOrigin: 'top',
        background:
          'linear-gradient(168deg, #fde68a 0%, #fbbf24 22%, #d97706 55%, #92400e 92%, #451a03 100%)',
        boxShadow: 'inset 0 -80px 120px rgba(0,0,0,0.12)',
      }}
      initial={{ scaleY: hasNavigated ? 1 : 0 }}
      animate={{ scaleY: 0 }}
      transition={{
        duration: 0.62,
        ease: [0.22, 1, 0.36, 1],
      }}
      onAnimationComplete={() => {
        if (!hasNavigated) {
          setHasNavigated(true)
          if (typeof window !== 'undefined') {
            sessionStorage.setItem('royalaz_has_navigated', '1')
          }
        }
      }}
    />
  )
}

export function PageTransition({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={`relative min-w-0 ${className}`}>
      <CurtainOverlay />
      {children}
    </div>
  )
}
