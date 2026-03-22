'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { useLang, translations } from '@/context/lang'

export default function CatalogHero() {
  const { lang } = useLang()
  const tr = translations
  const reduce = useReducedMotion()

  return (
    <section className="relative overflow-hidden rounded-3xl mb-10 px-6 py-14 sm:py-16 border border-amber-200/40 bg-gradient-to-br from-[#0b0f17] via-[#141a26] to-[#1a1510]">
      {/* Морфинг «живые» пятна */}
      {!reduce && (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <motion.div
            className="absolute -top-20 -left-16 w-[280px] h-[280px] rounded-[40%_60%_70%_30%] bg-amber-500/25 blur-3xl"
            animate={{
              borderRadius: [
                '40% 60% 70% 30%',
                '60% 40% 30% 70%',
                '30% 70% 60% 40%',
                '40% 60% 70% 30%',
              ],
              scale: [1, 1.08, 0.95, 1],
              rotate: [0, 12, -8, 0],
            }}
            transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-24 right-0 w-[320px] h-[320px] rounded-[60%_40%_30%_70%] bg-amber-400/20 blur-3xl"
            animate={{
              borderRadius: [
                '60% 40% 30% 70%',
                '45% 55% 65% 35%',
                '70% 30% 45% 55%',
                '60% 40% 30% 70%',
              ],
              scale: [1, 1.12, 1.05, 1],
              x: [0, -20, 10, 0],
            }}
            transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-amber-300/10 blur-2xl"
            animate={{ scale: [1, 1.4, 1], opacity: [0.15, 0.35, 0.15] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}

      <div className="relative z-10 max-w-2xl mx-auto text-center">
        <motion.p
          className="text-amber-400/90 text-sm font-semibold tracking-[0.2em] uppercase mb-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          RoyalAz
        </motion.p>
        <motion.h2
          className="text-3xl sm:text-4xl font-bold text-white mb-4 leading-tight"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.08 }}
        >
          {lang === 'ru'
            ? 'Ортопедические матрасы и здоровый сон'
            : lang === 'en'
              ? 'Orthopedic mattresses for better sleep'
              : 'Ortopedik dosekler — saglam yuxu'}
        </motion.h2>
        <motion.p
          className="text-neutral-400 text-sm sm:text-base max-w-lg mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {lang === 'ru'
            ? 'Качество, доставка по Баку и забота о каждом заказе.'
            : lang === 'en'
              ? 'Quality you feel — delivery across Baku.'
              : 'Keyfiyyət və Bakı üzrə catdırılma.'}
        </motion.p>
        <motion.a
          href="#catalog-grid"
          className="inline-flex mt-8 px-6 py-3 rounded-xl font-semibold text-[#0b0f17] bg-gradient-to-r from-amber-300 to-amber-500 shadow-lg shadow-amber-900/30 hover:from-amber-200 hover:to-amber-400 transition-all"
          whileHover={{ scale: 1.03, y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          {tr.catalog[lang]}
        </motion.a>
      </div>
    </section>
  )
}
