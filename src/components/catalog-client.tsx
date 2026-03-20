'use client'
import { useLang, translations } from '@/context/lang'

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

export default function CatalogClient({ products }: { products: Product[] }) {
  const { lang } = useLang()
  const tr = translations

  return (
    <main className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">{tr.catalog[lang]}</h1>
      <div className="grid grid-cols-3 gap-6">
        {products.map((p) => {
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
    </main>
  )
}
