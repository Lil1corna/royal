'use client'

import { motion } from 'framer-motion'
import { useIsMobile } from '@/hooks/useIsMobile'

export default function RoyalMatrasHero() {
  const isMobile = useIsMobile()

  return (
    <section className="w-full py-12 px-6">
      <motion.div
        className="relative mx-auto w-full max-w-[1024px]"
        initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
        whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
        viewport={isMobile ? undefined : { once: true, amount: 0.2 }}
        transition={isMobile ? { duration: 0.15, ease: 'easeOut' } : { duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center">
          <h2 className="font-serif text-white text-4xl lg:text-5xl mb-4">Royal Matras</h2>
          <p className="text-white/70 text-lg">Haqqımızda</p>
        </div>
      </motion.div>
    </section>
  )
}
