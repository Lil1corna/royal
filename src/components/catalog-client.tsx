'use client'
import { useState } from 'react'
import { useLang, translations } from '@/context/lang'

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

export default function CatalogClient({ products }: { products: Product[] }) {
  const { lang } = useLang()
  const tr = translations
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [page, setPage] = useState(1)

  const searchLower = search.trim().toLowerCase()
  const filteredProducts = products.filter((p) => {
    const matchesSearch = !searchLower || [p.name_az, p.name_ru, p.name_en].some(
      (n) => n?.toLowerCase().includes(searchLower)
    )
    const matchesCategory = !categoryFilter || p.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE)
  const paginatedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  )

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">{tr.catalog[lang]}</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <input
          type="search"
          placeholder={tr.searchPlaceholder[lang]}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          className="flex-1 border rounded-lg px-4 py-2"
        />
        <select
          value={categoryFilter}
          onChange={(e) => { setCategoryFilter(e.target.value); setPage(1) }}
          className="border rounded-lg px-4 py-2 min-w-[160px]"
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
        {paginatedProducts.map((p) => {
          const name = lang === 'az' ? p.name_az : lang === 'ru' ? p.name_ru : p.name_en
          const cat = tr.categories[p.category]?.[lang] || p.category
          const discountedPrice = p.discount_pct > 0
            ? (p.price * (1 - p.discount_pct / 100)).toFixed(0)
            : null

          return (
            <a key={p.id} href={'/product/' + p.id}
              className={['border rounded-xl overflow-hidden hover:shadow-lg transition-shadow dark:border-gray-800', !p.in_stock ? 'opacity-60' : ''].join(' ')}>
              <div className="relative aspect-video bg-gray-100 dark:bg-gray-900">
                {p.image_urls && p.image_urls.length > 0 ? (
                  <img src={p.image_urls[0]} alt={name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-5xl">
                    🛏
                  </div>
                )}
                {!p.in_stock && (
                  <div className="absolute top-3 right-3 bg-red-100 text-red-600 text-xs font-medium px-2 py-1 rounded-full">
                    {tr.outOfStock[lang]}
                  </div>
                )}
                {p.discount_pct > 0 && p.in_stock && (
                  <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    -{p.discount_pct}%
                  </div>
                )}
              </div>
              <div className="p-4 dark:bg-gray-950">
                <p className="text-xs text-gray-400 mb-1">{cat}</p>
                <h2 className="text-lg font-semibold mb-2 dark:text-white">{name}</h2>
                <div className="flex items-center gap-2">
                  {discountedPrice ? (
                    <>
                      <span className="text-xl font-bold dark:text-white">{discountedPrice} AZN</span>
                      <span className="text-gray-400 text-sm line-through">{p.price} AZN</span>
                    </>
                  ) : (
                    <span className="text-xl font-bold dark:text-white">{p.price} AZN</span>
                  )}
                </div>
              </div>
            </a>
          )
        })}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="border rounded-lg px-4 py-2 disabled:opacity-50 hover:bg-gray-50"
          >
            {tr.prevPage[lang]}
          </button>
          <span className="flex items-center px-4">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page >= totalPages}
            className="border rounded-lg px-4 py-2 disabled:opacity-50 hover:bg-gray-50"
          >
            {tr.nextPage[lang]}
          </button>
        </div>
      )}
    </main>
  )
}
