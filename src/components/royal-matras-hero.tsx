'use client'

import { motion } from 'framer-motion'

export default function RoyalMatrasHero() {
  return (
    <section className="w-full py-12 px-6">
      <motion.div
        className="relative mx-auto w-full max-w-[1024px]"
        initial={{ opacity: 0, y: 14 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="text-center">
          <h2 className="font-serif text-white text-4xl lg:text-5xl mb-4">Royal Matras</h2>
          <p className="text-white/70 text-lg">Haqqımızda</p>
        </div>
      </motion.div>
    </section>
  )
}
