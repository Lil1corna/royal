'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'

const STORAGE_KEY = 'royalaz_preloader_seen'

export default function PagePreloader() {
  const reduceMotion = useReducedMotion()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (reduceMotion) return
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return
      sessionStorage.setItem(STORAGE_KEY, '1')
      setShow(true)
      const t = window.setTimeout(() => setShow(false), 2200)
      return () => clearTimeout(t)
    } catch {
      setShow(false)
    }
  }, [reduceMotion])

  if (reduceMotion) return null

  const royal = ['R', 'o', 'y', 'a', 'l']
  const az = ['A', 'z']

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-[500] flex flex-col items-center justify-center bg-[#0b0f17]"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } }}
        >
          <div className="flex items-baseline gap-0.5 mb-6">
            {royal.map((c, i) => (
              <motion.span
                key={`r-${i}`}
                className="text-4xl sm:text-5xl font-bold text-white inline-block"
                style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}
                initial={{ opacity: 0, y: 28, rotate: -8 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{
                  delay: 0.05 * i,
                  duration: 0.45,
                  type: 'spring',
                  stiffness: 260,
                  damping: 20,
                }}
              >
                {c}
              </motion.span>
            ))}
            {az.map((c, i) => (
              <motion.span
                key={`a-${i}`}
                className="text-4xl sm:text-5xl font-bold text-amber-400 inline-block"
                style={{ fontFamily: 'DM Sans, system-ui, sans-serif' }}
                initial={{ opacity: 0, y: 28, scale: 0.5 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.28 + 0.06 * i,
                  duration: 0.5,
                  type: 'spring',
                  stiffness: 220,
                  damping: 16,
                }}
              >
                {c}
              </motion.span>
            ))}
          </div>
          <svg width="200" height="12" viewBox="0 0 200 12" className="mb-8" aria-hidden>
            <motion.path
              d="M 4 8 Q 100 -2 196 8"
              fill="none"
              stroke="url(#preloaderGold)"
              strokeWidth="2.5"
              strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.35, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            />
            <defs>
              <linearGradient id="preloaderGold" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fcd34d" />
                <stop offset="100%" stopColor="#d97706" />
              </linearGradient>
            </defs>
          </svg>
          <motion.p
            className="text-sm text-neutral-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.4 }}
          >
            Premium yuxu · Bakı
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
