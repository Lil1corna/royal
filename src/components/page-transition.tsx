'use client'

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export function PageTransition({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  const pathname = usePathname()
  const reduce = useReducedMotion()

  return (
    <div className={`relative min-w-0 ${className}`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={pathname}
          initial={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
          animate={reduce ? { opacity: 1, y: 0 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
          transition={reduce ? { duration: 0.01 } : { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
