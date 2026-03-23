'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'

export default function RoyalMatrasHero() {
  // Картинка содержит верстку/текст из дизайна — поэтому показываем её как hero-блок.
  return (
    <section className="w-full">
      <motion.div
        className="relative mx-auto w-full max-w-[1024px] overflow-hidden"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="relative w-full" style={{ aspectRatio: '910/1024' }}>
          <Image
            src="/royal-matras/Home-49042c46-32d3-4e70-8a88-f13eb9224dc9.png"
            alt="Royal Matras - Haqqimizda"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 1024px"
            className="object-cover"
          />
        </div>
      </motion.div>
    </section>
  )
}

