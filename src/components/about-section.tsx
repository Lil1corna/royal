'use client'

import { motion } from 'framer-motion'
import { useLang } from '@/context/lang'
import Link from 'next/link'

export default function AboutSection() {
  const { lang } = useLang()

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
    <section className="relative w-full py-12 sm:py-16 md:py-20 px-4 sm:px-6 md:px-8 bg-[#050d1a] overflow-hidden">
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
        <div className="grid grid-cols-1 gap-12 lg:gap-16">
          {/* Content */}
          <motion.div
            className="about-content flex flex-col justify-center gap-6 lg:gap-7 order-1 max-w-3xl mx-auto"
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
              className="font-serif text-white text-2xl sm:text-3xl md:text-[36px] lg:text-[44px] leading-[1.1]"
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
