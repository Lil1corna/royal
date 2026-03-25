'use client'

import { AnimatePresence, motion, animate, useInView, useMotionValue, useTransform } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useLang, translations } from '@/context/lang'
import Magnetic from '@/components/magnetic'
import styles from './about.module.css'
import { useIsMobile } from '@/hooks/useIsMobile'

type Stat = {
  id: string
  value: number
  numberSuffix?: string
  labelKey: string
}

function CountUpStat({
  value,
  numberSuffix,
  label,
  delayMs = 0,
  isMobile,
}: {
  value: number
  numberSuffix?: string
  label: string
  delayMs?: number
  isMobile: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-100px' })
  const count = useMotionValue(0)
  const rounded = useTransform(count, (latest) => Math.round(latest))
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    const unsub = rounded.on('change', (latest) => setDisplay(latest))
    return () => unsub()
  }, [rounded])

  useEffect(() => {
    if (!isInView && !isMobile) return
    const effectiveDelay = isMobile ? 0 : delayMs
    const effectiveDuration = isMobile ? 0.15 : 2
    const t = window.setTimeout(() => {
      animate(count, value, { duration: effectiveDuration, ease: 'easeOut' })
    }, effectiveDelay)
    return () => window.clearTimeout(t)
  }, [delayMs, isInView, value, count, isMobile])

  return (
    <div ref={ref} className="text-center">
      <div className={styles.statNumber}>
        {display}
        {numberSuffix ? <span className="align-top">{numberSuffix}</span> : null}
      </div>
      <div className={`${styles.statLabel} mt-3`}>{label}</div>
      <motion.div
        className={styles.statUnderline}
        initial={{ scaleX: 0 }}
        animate={{ scaleX: isMobile ? 1 : isInView ? 1 : 0 }}
        transition={{
          duration: isMobile ? 0.15 : 0.7,
          ease: 'easeOut',
          delay: isMobile ? 0 : delayMs / 1000,
        }}
      />
    </div>
  )
}

function IconGem() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <path
        d="M22 5L34.5 13.5L22 39L9.5 13.5L22 5Z"
        stroke="#c9a84c"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 13.5H34.5"
        stroke="#c9a84c"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconWave() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <path
        d="M7 26C12 19 16 19 22 26C28 33 32 33 37 26"
        stroke="#c9a84c"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M7 18C12 11 16 11 22 18C28 25 32 25 37 18"
        stroke="#c9a84c"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.9"
      />
    </svg>
  )
}

function IconLeaf() {
  return (
    <svg width="44" height="44" viewBox="0 0 44 44" fill="none" aria-hidden>
      <path
        d="M10 28C10 16 18 9 30 9C30 21 23 33 11 33C10.3 33 10 32.5 10 31.8V28Z"
        stroke="#c9a84c"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M16 26C21 22 26 19 30 16"
        stroke="#c9a84c"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export default function AboutClient({ stats }: { stats: Stat[] }) {
  const { lang } = useLang()
  const tr = translations
  const isMobile = useIsMobile()
  const [tagIndex, setTagIndex] = useState(0)

  const taglines = useMemo(
    () => [
      'Sağlam yuxu — sağlam həyat',
      'Здоровый сон — здоровая жизнь',
      'Healthy sleep — healthy life',
    ],
    []
  )

  useEffect(() => {
    const id = window.setInterval(() => {
      setTagIndex((i) => (i + 1) % taglines.length)
    }, 3000)
    return () => window.clearInterval(id)
  }, [taglines.length])

  const sectionVariants = {
    hidden: { opacity: 0, y: 60 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as const },
    },
  }

  const values = [
    {
      title: 'Keyfiyyət',
      icon: <IconGem />,
      text:
        lang === 'ru'
          ? 'Мы используем только сертифицированные материалы. Производство соответствует стандартам ISO.'
          : lang === 'en'
            ? 'We use only certified materials. Production meets ISO standards.'
            : 'Yalnız sertifikatlı materiallardan istifadə edirik. ISO standartlarına uyğun istehsal.',
    },
    {
      title: 'Rahatlıq',
      icon: <IconWave />,
      text:
        lang === 'ru'
          ? 'Дизайн создан с учетом анатомии тела. Оптимальная поддержка в каждом размере.'
          : lang === 'en'
            ? 'Designed for body anatomy. Optimal support in every size.'
            : 'Bədən anatomiyasına uyğun dizayn. Hər ölçüdə optimal dəstək.',
    },
    {
      title: 'Sağlamlıq',
      icon: <IconLeaf />,
      text:
        lang === 'ru'
          ? 'Материалы без аллергенов. Безопасные сертификаты для детей.'
          : lang === 'en'
            ? 'Allergen-free materials. Safe certificates for children.'
            : 'Allergen-free materiallar. Uşaqlar üçün təhlükəsiz sertifikat.',
    },
  ]

  const storyParagraphs = useMemo(() => {
    if (lang === 'ru') {
      return [
        'С 1998 года Royal Matras работает в Азербайджане и входит в число ведущих брендов производства ортопедических матрасов, объединяя качество и комфорт.',
        'Благодаря многолетнему опыту и производственным процессам, оснащенным современными технологиями, мы предлагаем клиентам решения для сна высокого уровня.',
        'Каждый наш матрас создается с опорой на принципы комфорта, долговечности и эстетического дизайна.',
      ]
    }
    if (lang === 'en') {
      return [
        'Since 1998, Royal Matras has been operating in Azerbaijan as one of the leading brands in orthopedic mattress manufacturing, bringing together quality and comfort.',
        'With years of experience and production processes equipped with modern technologies, we deliver high-level sleep solutions to our customers.',
        'Every mattress is crafted to provide comfort, durability, and aesthetic design principles.',
      ]
    }
    return [
      '1998-ci ildən fəaliyyət göstərən Royal Matras, Azərbaycanda ortopedik matras istehsalının öncül brendlərindən biri olaraq keyfiyyət və rahatlığı bir araya gətirir.',
      'Uzun illərə dayanan təcrübəmiz və müasir texnologiyalarla təchiz olunmuş istehsal prosesimiz sayəsində müştərilərimizə yüksək səviyyəli yuxu həlləri təqdim edirik.',
      'Hər bir matrasımız rahatlıq, davamlılıq və estetik dizayn prinsiplərinə əsaslanaraq hazırlanır.',
    ]
  }, [lang])

  const process = useMemo(
    () => [
      {
        title: lang === 'az' ? 'Seçim' : lang === 'ru' ? 'Выбор' : 'Selection',
        desc:
          lang === 'az'
            ? 'Müştəri uyğun matrasa qərar verir'
            : lang === 'ru'
              ? 'Клиент выбирает подходящий матрас'
              : 'Customers choose the right mattress',
      },
      {
        title: lang === 'az' ? 'Sifariş' : lang === 'ru' ? 'Заказ' : 'Order',
        desc:
          lang === 'az'
            ? 'Sifariş verilir'
            : lang === 'ru'
              ? 'Оформляется заказ'
              : 'The order is placed',
      },
      {
        title: lang === 'az' ? 'İstehsal' : lang === 'ru' ? 'Производство' : 'Production',
        desc:
          lang === 'az'
            ? 'Hazırlıq və istehsal prosesi'
            : lang === 'ru'
              ? 'Подготовка и производство'
              : 'Preparation and manufacturing',
      },
      {
        title: lang === 'az' ? 'Çatdırılma' : lang === 'ru' ? 'Доставка' : 'Delivery',
        desc:
          lang === 'az'
            ? 'Bakı üzrə eyni gün çatdırılma'
            : lang === 'ru'
              ? 'Доставка по Баку в тот же день'
              : 'Same-day delivery in Baku',
      },
    ],
    [lang]
  )

  const processRef = useRef<HTMLDivElement>(null)
  const processInView = useInView(processRef, { once: true, margin: '-80px' })

  const heroTag = taglines[tagIndex]!

  return (
    <div className={styles.page}>
      {/* Вся страница живет на aurora фоне */}
      <div className={styles.aurora} aria-hidden>
        <div className="blob1" />
        <div className="blob2" />
        <div className="blob3" />
        <div className="blob4" />
        <div className="blob5" />
      </div>
      <div className={styles.grain} aria-hidden />
      <div className={styles.scanlines} aria-hidden />
      <div className={styles.vignette} aria-hidden />

      <motion.div
        className="relative z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
      >
        {/* HERO */}
        <motion.section
          className="min-h-[100vh] flex items-center justify-center px-4 sm:px-6 pt-[5rem] pb-10 relative"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: { duration: 1.2, staggerChildren: 0.12 },
            },
          }}
        >
          <div className="max-w-5xl w-full text-center">
            <motion.div
              className="mx-auto flex items-center justify-center"
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
              transition={{ duration: 0.8 }}
            >
              <motion.svg
                width="128"
                height="128"
                viewBox="0 0 128 128"
                className="drop-shadow-[0_0_25px_rgba(201,168,76,0.18)]"
                initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
              >
                <motion.circle
                  cx="64"
                  cy="64"
                  r="52"
                  fill="none"
                  stroke="#c9a84c"
                  strokeWidth="1.5"
                  strokeDasharray="327"
                  initial={{ strokeDashoffset: 327 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] as const, delay: 0.15 }}
                />
                <motion.path
                  d="M48 40V88H60V72H72C84 72 88 66 88 58C88 48 82 40 70 40H48Z"
                  fill="none"
                  stroke="#c9a84c"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="220"
                  initial={{ strokeDashoffset: 220 }}
                  animate={{ strokeDashoffset: 0 }}
                  transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] as const, delay: 0.25 }}
                />
              </motion.svg>
            </motion.div>

            <motion.h1
              className="mt-6 text-white font-serif tracking-[0.15em] leading-[0.95] text-[clamp(56px,7vw,96px)]"
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
            >
              Royal Matras
            </motion.h1>

            <motion.p
              className="mt-5 text-[#c9a84c] font-sans text-[13px] tracking-[0.22em] uppercase"
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
            >
              MATRAS · YASTIQ · YORĞAN
            </motion.p>

            <div className="mt-7 relative h-[2.2rem] flex items-center justify-center">
              {isMobile ? (
                <motion.div
                  initial={false}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15, ease: 'easeOut' }}
                  className="text-white/90 text-[18px] font-medium"
                >
                  {heroTag}
                </motion.div>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={tagIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
                    className="text-white/90 text-[18px] font-medium"
                  >
                    {heroTag}
                  </motion.div>
                </AnimatePresence>
              )}
            </div>

            <motion.div
              className="mt-10 flex items-center justify-center"
              variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}
            >
              <a href="#story" className="inline-flex items-center gap-3 text-white/85 hover:text-white transition-colors">
                <span className="text-[14px] tracking-[0.08em] uppercase">Scroll</span>
                <motion.span
                  className="relative w-7 h-7 flex items-center justify-center"
                  animate={isMobile ? { y: 0 } : { y: [0, 6, 0] }}
                  transition={
                    isMobile
                      ? { duration: 0.15, ease: 'easeOut' }
                      : { duration: 1.4, repeat: Infinity, ease: [0.22, 1, 0.36, 1] as const }
                  }
                  aria-hidden
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M5 7.5L10 12.5L15 7.5" stroke="#c9a84c" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </motion.span>
              </a>
            </motion.div>
          </div>
        </motion.section>

        {/* STORY */}
        <section id="story" className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 relative">
          <div className="mx-auto max-w-5xl">
            <motion.div
              className={styles.glassCard}
              initial={isMobile ? 'visible' : 'hidden'}
              whileInView={isMobile ? undefined : 'visible'}
              viewport={isMobile ? undefined : { once: true, margin: '-100px' }}
              variants={sectionVariants}
              transition={
                isMobile ? { duration: 0.15, ease: 'easeOut' } : { duration: 0.8 }
              }
            >
              <div className={styles.yearBadge} aria-hidden>
                1998
              </div>

              <div className="relative z-10">
                <div className="text-white text-[48px] font-serif mb-5">{tr.about?.[lang]}</div>
                {storyParagraphs.map((p, idx) => (
                  <p
                    key={idx}
                    className="text-white/75 text-[17px] leading-[1.9] mt-4"
                  >
                    {p}
                  </p>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* STATS */}
        <section className="px-4 sm:px-6 md:px-8 py-10 sm:py-14">
          <div className="mx-auto max-w-6xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
              {stats.map((s, i) => {
                const entry = (tr as Record<string, unknown>)[s.labelKey]
                const translated =
                  typeof entry === 'object' && entry !== null
                    ? (entry as { az?: string; ru?: string; en?: string })[lang]
                    : undefined
                const label: string =
                  s.labelKey === 'matrasModels'
                    ? lang === 'ru'
                      ? 'Моделей матрасов'
                      : lang === 'en'
                        ? 'Mattress models'
                        : 'Matras modeli'
                    : translated ?? s.labelKey

                return (
                  <CountUpStat
                    key={s.id}
                    value={s.value}
                    numberSuffix={s.numberSuffix}
                    label={label}
                    delayMs={i * 70}
                    isMobile={isMobile}
                  />
                )
              })}
            </div>
          </div>
        </section>

        {/* VALUES */}
        <section className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <motion.h2
              className="text-center text-white text-2xl sm:text-3xl md:text-[40px] font-serif"
              initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
              viewport={isMobile ? undefined : { once: true, margin: '-120px' }}
              transition={isMobile ? { duration: 0.15, ease: 'easeOut' } : { duration: 0.7 }}
            >
              {tr.ourValues?.[lang]}
            </motion.h2>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((v, idx) => (
                <motion.div
                  key={v.title}
                  className={styles.valueCard}
                  initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                  whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                  viewport={isMobile ? undefined : { once: true, margin: '-120px' }}
                  transition={
                    isMobile
                      ? { duration: 0.15, delay: 0, ease: 'easeOut' }
                      : { duration: 0.7, delay: idx * 0.15, ease: [0.22, 1, 0.36, 1] as const }
                  }
                  whileHover={
                    isMobile
                      ? undefined
                      : {
                          y: -8,
                          borderColor: 'rgba(201,168,76,0.4)',
                          boxShadow:
                            '0 0 0 1px rgba(201,168,76,0.25), 0 0 42px rgba(201,168,76,0.18)',
                        }
                  }
                >
                  <div className="flex items-center gap-4">
                    <div className={styles.textGold}>{v.icon}</div>
                    <div className="text-white text-[22px] font-serif">{v.title}</div>
                  </div>
                  <div className="mt-4 text-white/75 text-[15.5px] leading-[1.8]">{v.text}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* PROCESS */}
        <section className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20">
          <div className="mx-auto max-w-6xl">
            <motion.h2
              className="text-white text-[40px] font-serif text-center"
              initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
              viewport={isMobile ? undefined : { once: true, margin: '-120px' }}
              transition={isMobile ? { duration: 0.15, ease: 'easeOut' } : { duration: 0.7 }}
            >
              {lang === 'az' ? 'Necə işləyirik?' : lang === 'ru' ? 'Как мы работаем?' : 'How we work?'}
            </motion.h2>

            <div ref={processRef} className="relative mt-14">
              <motion.div
                className={styles.timelineLine}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: isMobile ? 1 : processInView ? 1 : 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />

              <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
                {process.map((step, idx) => (
                  <motion.div
                    key={idx}
                    className="text-white"
                    initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                    whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
                    viewport={isMobile ? undefined : { once: true, margin: '-120px' }}
                    transition={
                      isMobile
                        ? { duration: 0.15, delay: 0, ease: 'easeOut' }
                        : { duration: 0.65, delay: idx * 0.12, ease: [0.22, 1, 0.36, 1] as const }
                    }
                  >
                    <div className="flex items-center gap-4">
                      <div className={styles.stepCircle} aria-hidden>
                        {idx + 1}
                      </div>
                      <div className="font-serif text-[20px]">{step.title}</div>
                    </div>
                    <div className="mt-3 text-white/75 text-[15px] leading-[1.7] max-w-[18rem]">
                      {step.desc}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 relative">
          <div className={styles.ctaTone} aria-hidden />
          <div className="mx-auto max-w-6xl text-center relative z-10">
            <motion.h2
              className="text-white text-[44px] font-serif"
              initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
              whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
              viewport={isMobile ? undefined : { once: true, margin: '-120px' }}
              transition={isMobile ? { duration: 0.15, ease: 'easeOut' } : { duration: 0.7 }}
            >
              {tr.readyToChange?.[lang]}
            </motion.h2>

            <p className="mt-5 text-white/75 text-[16.5px] leading-[1.8]">
              {lang === 'az'
                ? 'Bakı üzrə pulsuz çatdırılma · 30 gün sınaq · 2 il zəmanət'
                : lang === 'ru'
                  ? 'Бесплатная доставка по Баку · 30 дней тест · 2 года гарантии'
                  : 'Free delivery across Baku · 30-day trial · 2-year warranty'}
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Magnetic strength={0.2} className="inline-flex">
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-2xl px-8 py-3.5 font-semibold text-[#061226] bg-[#c9a84c] shadow-[0_14px_50px_rgba(201,168,76,0.25)] transition-transform"
                >
                  {lang === 'az' ? 'Kataloqa bax' : lang === 'ru' ? 'Смотреть каталог' : 'View catalog'}
                </Link>
              </Magnetic>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  )
}

