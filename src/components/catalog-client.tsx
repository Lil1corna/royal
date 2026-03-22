'use client'
import Image from 'next/image'
import Link from 'next/link'
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion'
import { useMemo, useRef, useState } from 'react'
import { useLang, translations } from '@/context/lang'
import CatalogHero from '@/components/catalog-hero'

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

function ParallaxProductCard({
  p,
  index,
  lang,
  tr,
}: {
  p: Product
  index: number
  lang: 'az' | 'ru' | 'en'
  tr: typeof translations
}) {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  /* фото двигается меньше → «глубже»; текст — сильнее */
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [14, -14])
  const textY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-22, 22])

  const name = lang === 'az' ? p.name_az : lang === 'ru' ? p.name_ru : p.name_en
  const cat = tr.categories[p.category]?.[lang] || p.category
  const discountedPrice =
    p.discount_pct > 0 ? (p.price * (1 - p.discount_pct / 100)).toFixed(0) : null

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.45, delay: index * 0.04, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link
        href={'/product/' + p.id}
        className={[
          'group block border border-neutral-300 rounded-2xl overflow-hidden bg-white shadow-md hover:shadow-xl hover:border-amber-300/80 transition-shadow duration-500 dark:border-gray-700 dark:bg-gray-950',
          !p.in_stock ? 'opacity-60' : '',
        ].join(' ')}
      >
        <motion.div
          className="relative aspect-video bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-gray-900 dark:to-gray-950 overflow-hidden"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.35 }}
        >
          <motion.div className="absolute inset-0" style={{ y: imgY }}>
            {p.image_urls && p.image_urls.length > 0 ? (
              <Image
                src={p.image_urls[0]}
                alt={name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover scale-110 group-hover:scale-[1.18] transition-transform duration-700 ease-out"
                unoptimized
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
                🛏
              </div>
            )}
          </motion.div>
          {!p.in_stock && (
            <div className="absolute top-3 right-3 bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full z-10">
              {tr.outOfStock[lang]}
            </div>
          )}
          {p.discount_pct > 0 && p.in_stock && (
            <div className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md z-10">
              -{p.discount_pct}%
            </div>
          )}
        </motion.div>
        <motion.div
          className="border-t border-neutral-100 bg-neutral-50/80 p-4 dark:border-gray-800 dark:bg-gray-950"
          style={{ y: textY }}
        >
          <p className="text-xs text-amber-800 dark:text-amber-400/90 mb-1 font-medium tracking-wide">
            {cat}
          </p>
          <h2 className="text-lg font-semibold mb-2 text-neutral-900 dark:text-white group-hover:text-amber-800 dark:group-hover:text-amber-300 transition-colors">
            {name}
          </h2>
          <div className="flex items-center gap-2">
            {discountedPrice ? (
              <>
                <span className="text-xl font-bold text-neutral-900 dark:text-white">
                  {discountedPrice} AZN
                </span>
                <span className="text-gray-400 text-sm line-through">{p.price} AZN</span>
              </>
            ) : (
              <span className="text-xl font-bold text-neutral-900 dark:text-white">
                {p.price} AZN
              </span>
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
  const paginatedProducts = useMemo(() => {
    return filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE)
  }, [filteredProducts, page])

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <CatalogHero />

      <div id="catalog-grid" className="scroll-mt-28">
        <h1 className="text-3xl font-bold mb-6 text-neutral-900 dark:text-white tracking-tight">
          {tr.catalog[lang]}
        </h1>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <input
            type="search"
            placeholder={tr.searchPlaceholder[lang]}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value)
              setPage(1)
            }}
            className="flex-1 border border-neutral-200 rounded-xl px-4 py-2.5 shadow-sm focus:ring-2 focus:ring-amber-400/40 focus:border-amber-300 outline-none transition-shadow dark:bg-gray-950 dark:border-gray-800"
          />
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value)
              setPage(1)
            }}
            className="min-w-[160px] rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 shadow-sm focus:border-amber-500 focus:ring-2 focus:ring-amber-400/50 focus:outline-none dark:bg-gray-950 dark:border-gray-700 dark:text-neutral-100"
          >
            <option value="">{tr.allCategories[lang]}</option>
            {CATEGORY_KEYS.map((key) => (
              <option key={key} value={key}>
                {tr.categories[key]?.[lang] || key}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginatedProducts.map((p, index) => (
            <ParallaxProductCard key={p.id} p={p} index={index} lang={lang} tr={tr} />
          ))}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2 font-medium text-neutral-900 transition-colors hover:bg-amber-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-neutral-100 dark:hover:bg-gray-800"
          >
            {tr.prevPage[lang]}
          </button>
          <span className="flex items-center px-4 font-medium text-neutral-800 dark:text-neutral-200">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="rounded-xl border border-neutral-300 bg-white px-4 py-2 font-medium text-neutral-900 transition-colors hover:bg-amber-50 disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:text-neutral-100 dark:hover:bg-gray-800"
          >
            {tr.nextPage[lang]}
          </button>
        </div>
      )}
    </main>
  )
}
