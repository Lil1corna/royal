'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { useLang, translations } from '@/context/lang'
import Link from 'next/link'

export default function AboutSection() {
  const { lang } = useLang()
  const tr = translations

  const storyParagraphs =
    lang === 'ru'
      ? [
          'С 1998 года Royal Matras работает в Азербайджане и входит в число ведущих брендов производства ортопедических матрасов, объединяя качество и комфорт.',
          'Благодаря многолетнему опыту и производственным процессам, оснащенным современными технологиями, мы предлагаем клиентам решения для сна высокого уровня.',
        ]
      : lang === 'en'
        ? [
            'Since 1998, Royal Matras has been operating in Azerbaijan as one of the leading brands in orthopedic mattress manufacturing, bringing together quality and comfort.',
            'With years of experience and production processes equipped with modern technologies, we deliver high-level sleep solutions to our customers.',
          ]
        : [
            '1998-ci ildən fəaliyyət göstərən Royal Matras, Azərbaycanda ortopedik matras istehsalının öncül brendlərindən biri olaraq keyfiyyət və rahatlığı bir araya gətirir.',
            'Uzun illərə dayanan təcrübəmiz və müasir texnologiyalarla təchiz olunmuş istehsal prosesimiz sayəsində müştərilərimizə yüksək səviyyəli yuxu həlləri təqdim edirik.',
          ]

  const miniStats = [
    { number: '25+', label: lang === 'az' ? 'il' : lang === 'ru' ? 'лет' : 'years', sublabel: lang === 'az' ? 'Təcrübə' : lang === 'ru' ? 'Опыт' : 'Experience' },
    { number: '50+', label: '', sublabel: lang === 'az' ? 'Model' : lang === 'ru' ? 'Моделей' : 'Models' },
    { number: '2', label: lang === 'az' ? 'il' : lang === 'ru' ? 'года' : 'years', sublabel: lang === 'az' ? 'Zəmanət' : lang === 'ru' ? 'Гарантия' : 'Warranty' },
  ]

  return (
    <section className="relative w-full py-20 px-6 bg-[#050d1a] overflow-hidden">
      {/* Subtle Aurora Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        <div
          className="absolute w-[500px] h-[500px] rounded-full blur-[100px] opacity-8"
          style={{
            background: 'rgba(45,155,181,0.08)',
            left: '-10%',
            top: '20%',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full blur-[80px] opacity-6"
          style={{
            background: 'rgba(201,168,76,0.06)',
            right: '-5%',
            top: '40%',
          }}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-12 lg:gap-16 items-center">
          {/* Left Column - Cinematic Image */}
          <motion.div
            className="about-image-container relative rounded-[20px] overflow-hidden order-1"
            initial={{ x: -40, opacity: 0 }}
            whileInView={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            viewport={{ once: true, margin: '-80px' }}
            style={{
              boxShadow: `
                0 0 0 1px rgba(201,168,76,0.15),
                0 40px 80px rgba(0,0,0,0.6),
                0 0 60px rgba(45,155,181,0.1)
              `,
            }}
          >
            {/* Gold Frame Accent */}
            <div
              className="absolute left-0 z-20 w-[2px]"
              style={{
                top: '10%',
                bottom: '10%',
                background: 'linear-gradient(to bottom, transparent, #c9a84c, transparent)',
              }}
            />

            {/* Year Badge */}
            <div
              className="about-year-badge absolute top-4 right-4 lg:top-6 lg:right-6 z-30 rounded-xl px-3 py-2 lg:px-4 lg:py-3 text-center"
              style={{
                background: 'rgba(5,13,26,0.8)',
                border: '1px solid rgba(201,168,76,0.3)',
                backdropFilter: 'blur(12px)',
              }}
            >
              <div className="font-serif text-[28px] lg:text-[32px] font-bold text-[#e8c97a] leading-none">
                1998
              </div>
              <div className="text-[8px] lg:text-[9px] tracking-[0.2em] text-white/50 uppercase mt-1">
                {lang === 'az' ? 'İldən' : lang === 'ru' ? 'Год' : 'Since'}
              </div>
            </div>

            {/* Main Image */}
            <div className="relative aspect-[3/4]">
              <Image
                src="/royal-matras/Accommodations-a7547b7e-d22f-45f8-be69-0f6b509bb46f.png"
                alt="Royal Matras Production"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="about-image object-cover"
                style={{
                  filter: 'brightness(0.9) contrast(1.1) saturate(0.85)',
                }}
              />

              {/* Inner Vignette */}
              <div
                className="about-image-overlay absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse 80% 70% at 50% 40%,
                    transparent 40%,
                    rgba(5,13,26,0.3) 80%,
                    rgba(5,13,26,0.7) 100%)`,
                }}
              />

              {/* Bottom Gradient */}
              <div
                className="about-image-bottom absolute bottom-0 left-0 right-0 flex items-end p-6"
                style={{
                  height: '40%',
                  background: 'linear-gradient(to top, rgba(5,13,26,0.9), transparent)',
                }}
              />
            </div>
          </motion.div>

          {/* Right Column - Text Content */}
          <motion.div
            className="about-content flex flex-col justify-center gap-6 lg:gap-7 lg:pl-10 order-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            transition={{ staggerChildren: 0.1 }}
          >
            {/* Section Label */}
            <motion.div
              className="text-[#c9a84c] text-[10px] tracking-[0.25em] uppercase font-semibold"
              variants={{
                hidden: { y: 30, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
            >
              {lang === 'az' ? 'HAQQIMIZDA' : lang === 'ru' ? 'О НАС' : 'ABOUT US'}
            </motion.div>

            {/* Main Title */}
            <motion.h2
              className="font-serif text-white text-[36px] lg:text-[44px] leading-[1.1]"
              variants={{
                hidden: { y: 30, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
            >
              {lang === 'az'
                ? '1998-ci ildən bəri sağlam yuxu həlləri'
                : lang === 'ru'
                  ? 'Решения для здорового сна с 1998 года'
                  : 'Healthy sleep solutions since 1998'}
            </motion.h2>

            {/* Gold Divider */}
            <motion.div
              className="w-[60px] h-[2px] bg-[#c9a84c]"
              variants={{
                hidden: { scaleX: 0, opacity: 0 },
                visible: { scaleX: 1, opacity: 1 },
              }}
              style={{ transformOrigin: 'left' }}
            />

            {/* Body Paragraphs */}
            {storyParagraphs.map((p, idx) => (
              <motion.p
                key={idx}
                className="text-white/72 text-[15px] leading-[1.9]"
                variants={{
                  hidden: { y: 30, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
              >
                {p}
              </motion.p>
            ))}

            {/* Mini Stats */}
            <motion.div
              className="flex flex-wrap gap-6 lg:gap-8 mt-2"
              variants={{
                hidden: { y: 30, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
            >
              {miniStats.map((stat, idx) => (
                <div key={idx} className="flex flex-col">
                  <div className="font-serif text-[#e8c97a] text-[24px] lg:text-[28px] font-bold leading-none">
                    {stat.number}
                    {stat.label && <span className="text-[16px] lg:text-[18px] ml-1">{stat.label}</span>}
                  </div>
                  <div className="text-[#c9a84c]/60 text-[9px] lg:text-[10px] tracking-[0.1em] uppercase mt-1">
                    {stat.sublabel}
                  </div>
                </div>
              ))}
            </motion.div>

            {/* CTA Button */}
            <motion.div
              variants={{
                hidden: { y: 30, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
            >
              <Link
                href="/about"
                className="inline-flex items-center gap-2 bg-[#c9a84c] text-[#050d1a] px-6 py-3 rounded-xl font-semibold hover:bg-[#e8c97a] transition-colors"
              >
                {lang === 'az' ? 'Ətraflı' : lang === 'ru' ? 'Подробнее' : 'Learn more'}
                <span>→</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
