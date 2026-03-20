'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { getRecentProductIds } from '@/lib/recently-viewed'
import { useLang, translations } from '@/context/lang'

type Product = {
  id: string
  name_az: string
  name_ru: string
  name_en: string
  price: number
  discount_pct: number
  image_urls: string[] | null
}

export default function RecentlyViewed() {
  const { lang } = useLang()
  const tr = translations
  const [products, setProducts] = useState<Product[]>([])
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const ids = getRecentProductIds()
    if (ids.length === 0) {
      setReady(true)
      return
    }
    const supabase = createClient()
    void supabase
      .from('products')
      .select('id, name_az, name_ru, name_en, price, discount_pct, image_urls')
      .in('id', ids)
      .then(({ data }) => {
        if (!data?.length) {
          setReady(true)
          return
        }
        const order = new Map(ids.map((id, i) => [id, i]))
        const sorted = [...data].sort(
          (a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99)
        )
        setProducts(sorted as Product[])
        setReady(true)
      })
  }, [])

  if (!ready || products.length === 0) return null

  return (
    <section className="mb-10">
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>👁</span>
        {tr.recentlyViewed[lang]}
      </h2>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
        {products.map((p, i) => {
          const name =
            lang === 'az' ? p.name_az : lang === 'ru' ? p.name_ru : p.name_en
          const img = p.image_urls?.[0]
          const price =
            p.discount_pct > 0
              ? Math.round(p.price * (1 - p.discount_pct / 100))
              : p.price
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className="shrink-0 w-36"
            >
              <Link href={`/product/${p.id}`} className="block group">
                <div className="relative aspect-square rounded-xl overflow-hidden border bg-neutral-50 mb-2">
                  {img ? (
                    <Image
                      src={img}
                      alt={name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="144px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-2xl">🛏</div>
                  )}
                </div>
                <p className="text-sm font-medium line-clamp-2 group-hover:text-amber-700 transition-colors">
                  {name}
                </p>
                <p className="text-sm font-bold mt-0.5">{price} AZN</p>
              </Link>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}
