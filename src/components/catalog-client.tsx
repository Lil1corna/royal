'use client'
import Image from 'next/image'
import Link from 'next/link'
import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform, type Variants } from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { useLang, translations } from '@/context/lang'
import { useWishlist } from '@/context/wishlist'
import CinematicHero from '@/components/cinematic-hero'
import AboutSection from '@/components/about-section'
import { useLowPowerMotion } from '@/hooks/use-low-power-motion'
import { useIsMobile } from '@/hooks/useIsMobile'

const ITEMS_PER_PAGE = 12

type Product = {
  id: string
  name_az: string
  name_ru: string
  name_en: string
  category: string
  price: number
  discount_pct: number
  in_stock: boolean
  image_urls: string[]
}

const CATEGORY_KEYS = ['ortopedik', 'berk', 'yumshaq', 'topper', 'ushaq', 'yastig'] as const

const catalogGridContainerHeavy = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.1,
    },
  },
}

const catalogGridItemHeavy = {
  hidden: { opacity: 0, y: 24, scale: 0.97 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

/** Тач: короче stagger, без scale — меньше подвисаний */
const catalogGridContainerLight = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.01,
    },
  },
}

const catalogGridItemLight = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.26, ease: [0.25, 0.46, 0.45, 0.94] as const },
  },
}

const catalogGridContainerMobile = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] as const, staggerChildren: 0 },
  },
}

const catalogGridItemMobile = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.15, ease: [0.22, 1, 0.36, 1] as const },
  },
}

function getRating(id: string) {
  const seed = id
    .split('')
    .reduce((sum, ch) => sum + ch.charCodeAt(0), 0)
  return 4 + (seed % 10) / 10
}

function ParallaxProductCardDesktop({
  p,
  lang,
  tr,
  lowPower,
  gridItemVariants,
  priority = false,
}: {
  p: Product
  lang: 'az' | 'ru' | 'en'
  tr: typeof translations
  lowPower: boolean
  gridItemVariants: Variants
  priority?: boolean
}) {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  /* фото двигается меньше → «глубже»; текст — сильнее; на таче выкл. */
  const imgY = useTransform(scrollYProgress, [0, 1], lowPower ? [0, 0] : [14, -14])
  const textY = useTransform(scrollYProgress, [0, 1], lowPower ? [0, 0] : [-22, 22])

  const name = lang === 'az' ? p.name_az : lang === 'ru' ? p.name_ru : p.name_en
  const cat = tr.categories[p.category]?.[lang] || p.category
  const discountedPrice =
    p.discount_pct > 0 ? (p.price * (1 - p.discount_pct / 100)).toFixed(0) : null

  const [imgFailed, setImgFailed] = useState(false)
  const [hovered, setHovered] = useState(false)
  const { has, toggle } = useWishlist()
  const primaryImage = p.image_urls?.[0]?.trim()
  const showProductImage = Boolean(primaryImage) && !imgFailed
  const rating = getRating(p.id)
  const badgeText = p.discount_pct > 0 ? 'Скидка' : Number(p.id.replace(/\D/g, '').slice(-1) || '0') % 2 ? 'Новинка' : 'Хит'
  const badgeClass =
    p.discount_pct > 0
      ? 'bg-red-500/90 text-white'
      : badgeText === 'Новинка'
        ? 'bg-emerald-500/90 text-white'
        : 'bg-amber-500/90 text-neutral-900'
  const inWishlist = has(p.id)

  return (
    <motion.div
      ref={ref}
      variants={gridItemVariants}
      whileHover={
        lowPower
          ? undefined
          : {
              y: -6,
              transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
            }
      }
    >
      <Link
        href={'/product/' + p.id}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={[
          'group block ds-card-glass transform-gpu motion-safe:transition-transform motion-safe:transition-opacity',
          !p.in_stock ? 'opacity-60' : '',
        ].join(' ')}
      >
        <motion.div
          className="relative aspect-[4/3] overflow-hidden bg-[rgba(255,255,255,0.03)]"
          whileHover={lowPower ? undefined : { scale: 1.03 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div className="absolute inset-0" style={{ y: imgY }}>
            {showProductImage ? (
              <Image
                src={primaryImage!}
                alt={name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={`object-cover scale-110 transition-transform duration-300 ease-out ${
                  lowPower ? '' : 'group-hover:scale-[1.18]'
                }`}
                style={{
                  filter: 'brightness(0.95) contrast(1.05)',
                }}
                priority={priority}
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl text-neutral-300">
                🛏
              </div>
            )}
          </motion.div>
          {/* Product Image Vignette */}
          <div
            className="product-image-vignette absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 90% 90% at 50% 50%,
                transparent 50%,
                rgba(5,13,26,0.35) 100%)`,
            }}
          />
          {/* Небольшая "тонировка" как в референсе */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#061226]/80 via-transparent to-transparent pointer-events-none" />
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.22),transparent_55%),radial-gradient(circle_at_70%_10%,rgba(255,255,255,0.14),transparent_45%)]" />
          <div className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-bold ${badgeClass}`}>
            {badgeText}
          </div>
          <motion.button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              toggle(p.id)
            }}
            className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/40 text-sm text-white/90 backdrop-blur"
            animate={inWishlist ? { scale: [1, 1.3, 1], color: '#fb7185' } : { scale: 1, color: '#ffffff' }}
            transition={{ duration: 0.25 }}
            aria-label={`Toggle wishlist for ${name}`}
          >
            {inWishlist ? '❤' : '♡'}
          </motion.button>
          <AnimatePresence>
            {hovered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="pointer-events-none absolute inset-x-0 bottom-0 z-10 bg-gradient-to-t from-black/75 via-black/40 to-transparent p-4"
              >
                <span className="inline-flex rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  Быстрый просмотр
                </span>
              </motion.div>
            )}
          </AnimatePresence>
          {!p.in_stock && (
            <div className="absolute top-3 right-3 bg-[rgba(220,53,69,0.1)] border border-[rgba(220,53,69,0.2)] text-[rgba(255,100,100,0.8)] text-[10px] font-semibold px-2 py-1 rounded-full z-10">
              {tr.outOfStock[lang]}
            </div>
          )}
          {p.discount_pct > 0 && p.in_stock && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] text-[#050d1a] text-[10px] font-extrabold px-2 py-1 rounded-full z-10">
              -{p.discount_pct}%
            </div>
          )}
        </motion.div>
        <motion.div
          className="border-t border-[rgba(255,255,255,0.08)] bg-[rgba(5,13,26,0.6)] backdrop-blur-sm p-5"
          style={{ y: textY }}
        >
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[rgba(201,168,76,0.7)] mb-2">
            {cat}
          </p>
          <h2 className="font-serif text-[20px] font-semibold mb-2 text-white group-hover:text-[#e8c97a] transition-colors">
            {name}
          </h2>
          <div className="flex items-center gap-2">
            {discountedPrice ? (
              <>
                <span className="price-text font-serif text-[26px] font-bold text-red-300">
                  {discountedPrice} AZN
                </span>
                <span className="price-text text-white/40 text-sm line-through">{p.price} AZN</span>
              </>
            ) : (
              <span className="price-text font-serif text-[26px] font-bold text-[#e8c97a]">{p.price} AZN</span>
            )}
          </div>
          <p className="mt-2 text-xs text-amber-200/80">{'★'.repeat(4)}☆ {rating.toFixed(1)}</p>
        </motion.div>
      </Link>
    </motion.div>
  )
}

function ParallaxProductCardMobile({
  p,
  lang,
  tr,
  lowPower,
  gridItemVariants,
  priority = false,
}: {
  p: Product
  lang: 'az' | 'ru' | 'en'
  tr: typeof translations
  lowPower: boolean
  gridItemVariants: Variants
  priority?: boolean
}) {
  const name = lang === 'az' ? p.name_az : lang === 'ru' ? p.name_ru : p.name_en
  const cat = tr.categories[p.category]?.[lang] || p.category
  const discountedPrice =
    p.discount_pct > 0 ? (p.price * (1 - p.discount_pct / 100)).toFixed(0) : null

  const [imgFailed, setImgFailed] = useState(false)
  const primaryImage = p.image_urls?.[0]?.trim()
  const showProductImage = Boolean(primaryImage) && !imgFailed

  return (
    <motion.div
      variants={gridItemVariants}
      whileHover={
        lowPower
          ? undefined
          : {
              y: -6,
              transition: { duration: 0.2, ease: [0.22, 1, 0.36, 1] as const },
            }
      }
    >
      <Link
        href={'/product/' + p.id}
        className={[
          'group block ds-card-glass transform-gpu transition-shadow transition-transform duration-300',
          !p.in_stock ? 'opacity-60' : '',
        ].join(' ')}
      >
        <motion.div
          className="relative aspect-[4/3] overflow-hidden bg-[rgba(255,255,255,0.03)]"
          whileHover={lowPower ? undefined : { scale: 1.035 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div className="absolute inset-0" style={{ y: 0 }}>
            {showProductImage ? (
              <Image
                src={primaryImage!}
                alt={name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className={`object-cover scale-110 transition-transform duration-300 ease-out ${
                  lowPower ? '' : 'group-hover:scale-[1.18]'
                }`}
                style={{
                  filter: 'brightness(0.95) contrast(1.05)',
                }}
                priority={priority}
                onError={() => setImgFailed(true)}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-5xl text-neutral-300">
                🛏
              </div>
            )}
          </motion.div>

          <div
            className="product-image-vignette absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse 90% 90% at 50% 50%,
                transparent 50%,
                rgba(5,13,26,0.35) 100%)`,
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#061226]/80 via-transparent to-transparent pointer-events-none" />
          <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_30%_20%,rgba(245,158,11,0.22),transparent_55%),radial-gradient(circle_at_70%_10%,rgba(255,255,255,0.14),transparent_45%)]" />
          {!p.in_stock && (
            <div className="absolute top-3 right-3 bg-[rgba(220,53,69,0.1)] border border-[rgba(220,53,69,0.2)] text-[rgba(255,100,100,0.8)] text-[10px] font-semibold px-2 py-1 rounded-full z-10">
              {tr.outOfStock[lang]}
            </div>
          )}
          {p.discount_pct > 0 && p.in_stock && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-[#c9a84c] to-[#e8c97a] text-[#050d1a] text-[10px] font-extrabold px-2 py-1 rounded-full z-10">
              -{p.discount_pct}%
            </div>
          )}
        </motion.div>

        <motion.div
          className="border-t border-[rgba(255,255,255,0.08)] bg-[rgba(5,13,26,0.6)] backdrop-blur-sm p-5"
          style={{ y: 0 }}
        >
          <p className="text-[10px] font-semibold tracking-[0.15em] uppercase text-[rgba(201,168,76,0.7)] mb-2">
            {cat}
          </p>
          <h2 className="font-serif text-[20px] font-semibold mb-2 text-white group-hover:text-[#e8c97a] transition-colors">
            {name}
          </h2>
          <div className="flex items-center gap-2">
            {discountedPrice ? (
              <>
                <span className="font-serif text-[26px] font-bold text-[#e8c97a]">
                  {discountedPrice} AZN
                </span>
                <span className="text-white/40 text-sm line-through">{p.price} AZN</span>
              </>
            ) : (
              <span className="font-serif text-[26px] font-bold text-[#e8c97a]">{p.price} AZN</span>
            )}
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

export default function CatalogClient({ products }: { products: Product[] }) {
  const { lang } = useLang()
  const tr = translations
  const isMobile = useIsMobile()
  const reducedMotion = useReducedMotion()
  const lowPower = useLowPowerMotion() || isMobile || reducedMotion
  const gridContainerVariants = isMobile
    ? catalogGridContainerMobile
    : lowPower
      ? catalogGridContainerLight
      : catalogGridContainerHeavy
  const gridItemVariants = isMobile
    ? catalogGridItemMobile
    : lowPower
      ? catalogGridItemLight
      : catalogGridItemHeavy
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [page, setPage] = useState(1)

  const searchLower = search.trim().toLowerCase()
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !searchLower ||
        [p.name_az, p.name_ru, p.name_en].some((n) => n?.toLowerCase().includes(searchLower))
      const matchesCategory = !categoryFilter || p.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [products, searchLower, categoryFilter])

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const featuredRef = useRef<HTMLDivElement>(null)
  const featuredInView = useInView(featuredRef, { once: true, margin: '-80px' })
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  }, [filteredProducts, page])

  return (
    <main className="w-full">
      {/* Cinematic Hero Section */}
      <CinematicHero />

      {/* About Section */}
      <AboutSection />

      {/* Press/Quality Section - Removed screenshot */}
      <div className="w-full bg-[#061226] py-12 sm:py-16 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 md:px-8 lg:px-16 text-center">
          <motion.div
            initial={isMobile ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            whileInView={isMobile ? undefined : { opacity: 1, y: 0 }}
            viewport={isMobile ? undefined : { once: true, amount: 0.3 }}
            transition={
              isMobile ? { duration: 0.15, ease: 'easeOut' } : { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }
            }
          >
            <h2 className="font-serif text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-semibold text-white mb-4 sm:mb-6">
              {lang === 'az' ? 'Keyfiyyət və Rahatlıq' : lang === 'ru' ? 'Качество и Комфорт' : 'Quality & Comfort'}
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-white/70 max-w-2xl mx-auto px-2">
              {lang === 'az' 
                ? 'Hər bir məhsulumuz ən yüksək keyfiyyət standartlarına uyğun hazırlanır.' 
                : lang === 'ru'
                ? 'Каждый наш продукт изготовлен в соответствии с высочайшими стандартами качества.'
                : 'Every product is crafted to the highest quality standards.'}
            </p>
          </motion.div>
        </div>
      </div>

      <motion.section
        ref={featuredRef}
        initial={{ opacity: 0, y: 40 }}
        animate={featuredInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.38, ease: [0.25, 0.1, 0.25, 1] }}
        className="w-full bg-[#061226] py-8 sm:py-10"
      >
        <div id="catalog-grid" className="scroll-mt-28 max-w-6xl mx-auto px-4 sm:px-6 md:px-8 lg:px-16">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6 text-white tracking-tight">
            {tr.catalog[lang]}
          </h1>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
            <input
              type="search"
              placeholder={tr.searchPlaceholder[lang]}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="ds-input flex-1 min-h-[44px]"
              aria-label={tr.searchPlaceholder[lang]}
            />
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value)
                setPage(1)
              }}
              className="ds-input min-w-[160px] min-h-[44px]"
              aria-label={tr.allCategories[lang]}
            >
              <option value="">{tr.allCategories[lang]}</option>
              {CATEGORY_KEYS.map((key) => (
                <option key={key} value={key}>
                  {tr.categories[key]?.[lang] || key}
                </option>
              ))}
            </select>
          </div>

          {/* CATALOG PRODUCT LIST — do not remove even if appears empty statically.
              Products are loaded asynchronously from the API at runtime. */}
          {paginatedProducts.length === 0 ? (
            <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-12 text-center">
              <div className="mb-3 text-5xl">🔎</div>
              <p className="text-lg font-semibold text-white">
                Ничего не найдено по запросу «{search}»
              </p>
              <p className="mt-2 text-sm text-white/60">
                Попробуйте изменить фильтры или поисковый запрос
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearch('')
                  setCategoryFilter('')
                  setPage(1)
                }}
                className="mt-5 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/20"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <motion.div
            key={`${page}-${categoryFilter}-${searchLower}`}
            className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
            variants={gridContainerVariants}
            initial="hidden"
            animate="show"
          >
            {paginatedProducts.map((p, idx) =>
              isMobile ? (
                <ParallaxProductCardMobile
                  key={p.id}
                  p={p}
                  lang={lang}
                  tr={tr}
                  lowPower={lowPower}
                  gridItemVariants={gridItemVariants}
                  priority={idx < 4}
                />
              ) : (
                <ParallaxProductCardDesktop
                  key={p.id}
                  p={p}
                  lang={lang}
                  tr={tr}
                  lowPower={lowPower}
                  gridItemVariants={gridItemVariants}
                  priority={idx < 4}
                />
              )
            )}
            </motion.div>
          )}
        </div>
      </motion.section>

      {totalPages > 1 && (
        <div className="w-full bg-[#061226] pb-10">
          <div className="mt-8 flex justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 min-h-[44px] font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
              aria-label={tr.prevPage[lang]}
            >
              {tr.prevPage[lang]}
            </button>
            <span className="flex items-center px-4 font-medium text-white/90">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-3 min-h-[44px] font-medium text-white transition-colors hover:bg-white/10 disabled:opacity-50"
              aria-label={tr.nextPage[lang]}
            >
              {tr.nextPage[lang]}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
