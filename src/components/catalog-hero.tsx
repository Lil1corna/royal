'use client'

import { motion } from 'framer-motion'
import { useLang, translations } from '@/context/lang'
import Magnetic from '@/components/magnetic'
import { useLowPowerMotion } from '@/hooks/use-low-power-motion'

const PARTICLE_SEEDS = [12, 28, 44, 58, 71, 83, 91, 17, 65, 38, 52, 7]

export default function CatalogHero() {
  const { lang } = useLang()
  const tr = translations
  const lowPower = useLowPowerMotion()

  return (
    <section className="relative mb-10 overflow-hidden rounded-3xl border border-amber-200/40 bg-gradient-to-br from-[#0b0f17] via-[#141a26] to-[#1a1510] px-6 py-14 sm:py-16">
      {/* Десктоп: liquid + частицы. Тач / reduced motion: статичное мягкое свечение (без лагов). */}
      {lowPower ? (
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(ellipse_90%_70%_at_70%_90%,rgba(251,191,36,0.14),transparent_55%),radial-gradient(ellipse_60%_50%_at_15%_15%,rgba(245,158,11,0.1),transparent_50%)]"
          aria-hidden
        />
      ) : (
        <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-3xl">
          <motion.div
            className="absolute -top-20 -left-16 h-[280px] w-[280px] rounded-[40%_60%_70%_30%] bg-amber-500/25 blur-3xl"
            animate={{
              borderRadius: [
                '40% 60% 70% 30%',
                '55% 45% 35% 65%',
                '30% 70% 60% 40%',
                '45% 55% 50% 50%',
                '40% 60% 70% 30%',
              ],
              scale: [1, 1.12, 0.92, 1.06, 1],
              rotate: [0, 18, -12, 8, 0],
              skewX: [0, 6, -4, 0],
            }}
            transition={{ duration: 16, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute -bottom-24 right-0 h-[320px] w-[320px] rounded-[60%_40%_30%_70%] bg-amber-400/22 blur-3xl"
            animate={{
              borderRadius: [
                '60% 40% 30% 70%',
                '40% 60% 55% 45%',
                '70% 30% 40% 60%',
                '50% 50% 60% 40%',
                '60% 40% 30% 70%',
              ],
              scale: [1, 1.14, 1.02, 1.08, 1],
              x: [0, -28, 14, -8, 0],
              y: [0, 12, -6, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute left-1/2 top-1/2 h-[220px] w-[220px] -translate-x-1/2 -translate-y-1/2 rounded-[45%_55%_60%_40%] bg-amber-300/12 blur-2xl"
            animate={{
              borderRadius: [
                '45% 55% 60% 40%',
                '60% 40% 45% 55%',
                '35% 65% 55% 45%',
                '45% 55% 60% 40%',
              ],
              scale: [1, 1.35, 1.08, 1],
              opacity: [0.12, 0.38, 0.2, 0.12],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
          />
          {/* золотые частицы */}
          {PARTICLE_SEEDS.map((seed, i) => (
            <motion.span
              key={i}
              className="absolute rounded-full bg-amber-300/90 shadow-[0_0_12px_rgba(251,191,36,0.6)]"
              style={{
                width: 3 + (seed % 3),
                height: 3 + (seed % 3),
                left: `${(seed * 7) % 92}%`,
                top: `${(seed * 11) % 78}%`,
              }}
              animate={{
                y: [0, -18 - (seed % 12), 0],
                x: [0, (seed % 2 === 0 ? 1 : -1) * (8 + (seed % 6)), 0],
                opacity: [0.25, 0.85, 0.35, 0.25],
                scale: [1, 1.4, 1],
              }}
              transition={{
                duration: 4 + (seed % 5) * 0.5,
                repeat: Infinity,
                ease: 'easeInOut',
                delay: (seed % 10) * 0.15,
              }}
            />
          ))}
        </div>
      )}

      <div className="relative z-10 mx-auto max-w-2xl text-center">
        {lowPower ? (
          <>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-400/90">RoyalAz</p>
            <h2 className="mb-4 text-3xl font-bold leading-tight text-white sm:text-4xl">
              {lang === 'ru'
                ? 'Ортопедические матрасы и здоровый сон'
                : lang === 'en'
                  ? 'Orthopedic mattresses for better sleep'
                  : 'Ortopedik dosekler — saglam yuxu'}
            </h2>
            <p className="mx-auto max-w-lg text-sm text-neutral-400 sm:text-base">
              {lang === 'ru'
                ? 'Качество, доставка по Баку и забота о каждом заказе.'
                : lang === 'en'
                  ? 'Quality you feel — delivery across Baku.'
                  : 'Keyfiyyət və Bakı üzrə catdırılma.'}
            </p>
            <Magnetic className="mt-8 inline-flex" strength={0.28}>
              <a
                href="#catalog-grid"
                className="inline-flex rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 px-6 py-3 font-semibold text-[#0b0f17] shadow-lg shadow-amber-900/30 active:scale-[0.98]"
              >
                {tr.catalog[lang]}
              </a>
            </Magnetic>
          </>
        ) : (
          <>
            <motion.p
              className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-amber-400/90"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              RoyalAz
            </motion.p>
            <motion.h2
              className="mb-4 text-3xl font-bold leading-tight text-white sm:text-4xl"
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
              className="mx-auto max-w-lg text-sm text-neutral-400 sm:text-base"
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
            <Magnetic className="mt-8 inline-flex" strength={0.28}>
              <motion.a
                href="#catalog-grid"
                className="inline-flex rounded-xl bg-gradient-to-r from-amber-300 to-amber-500 px-6 py-3 font-semibold text-[#0b0f17] shadow-lg shadow-amber-900/30 transition-all hover:from-amber-200 hover:to-amber-400"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {tr.catalog[lang]}
              </motion.a>
            </Magnetic>
          </>
        )}
      </div>
    </section>
  )
}
