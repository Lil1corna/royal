'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useWishlist } from '@/context/wishlist'
import { useLang, translations } from '@/context/lang'

type Product = {
  id: string
  name_az: string
  name_ru: string
  name_en: string
  price: number
  discount_pct: number
  image_urls: string[] | null
  in_stock: boolean
}

export default function WishlistPage() {
  const { lang } = useLang()
  const tr = translations
  const { ids, toggle } = useWishlist()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => {
    if (ids.length === 0) {
      setProducts([])
      setLoading(false)
      return
    }
    setLoading(true)
    void supabase
      .from('products')
      .select('id, name_az, name_ru, name_en, price, discount_pct, image_urls, in_stock')
      .in('id', ids)
      .then(({ data }) => {
        const order = new Map(ids.map((id, i) => [id, i]))
        const list = (data || []) as Product[]
        list.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99))
        setProducts(list)
        setLoading(false)
      })
  }, [ids, supabase])

  if (loading) {
    return (
      <main className="p-8 max-w-4xl mx-auto text-center text-gray-500">
        {tr.loading[lang]}…
      </main>
    )
  }

  if (ids.length === 0 || products.length === 0) {
    return (
      <main className="p-8 max-w-2xl mx-auto text-center">
        <div className="text-6xl mb-4">♡</div>
        <h1 className="text-2xl font-bold mb-2">{tr.wishlistEmpty[lang]}</h1>
        <Link href="/" className="text-amber-700 font-medium hover:underline">
          {tr.backToCatalog[lang]}
        </Link>
      </main>
    )
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/" className="text-gray-500 hover:text-black">
          {tr.back[lang]}
        </Link>
        <h1 className="text-3xl font-bold">{tr.wishlist[lang]}</h1>
      </div>
      <div className="flex flex-col gap-4">
        {products.map((p, i) => {
          const name =
            lang === 'az' ? p.name_az : lang === 'ru' ? p.name_ru : p.name_en
          const price =
            p.discount_pct > 0
              ? Math.round(p.price * (1 - p.discount_pct / 100))
              : p.price
          const img = p.image_urls?.[0]
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="flex gap-4 border rounded-xl p-4 card-soft items-center"
            >
              <Link href={`/product/${p.id}`} className="shrink-0 relative w-24 h-24 rounded-lg overflow-hidden bg-neutral-50">
                {img ? (
                  <Image src={img} alt={name} fill className="object-cover" sizes="96px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🛏</div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${p.id}`} className="font-semibold hover:text-amber-700 line-clamp-2">
                  {name}
                </Link>
                <div className="text-lg font-bold mt-1">{price} AZN</div>
                {!p.in_stock && (
                  <span className="text-xs text-red-600">{tr.outOfStock[lang]}</span>
                )}
              </div>
              <button
                type="button"
                onClick={() => toggle(p.id)}
                className="text-sm text-red-600 hover:underline shrink-0 px-2"
              >
                ✕
              </button>
            </motion.div>
          )
        })}
      </div>
    </main>
  )
}
