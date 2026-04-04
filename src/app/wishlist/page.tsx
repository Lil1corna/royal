'use client'

import { useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { getSupabaseClient } from '@/lib/supabase'
import { useWishlist } from '@/context/wishlist'
import { useLang, translations } from '@/context/lang'
import { useIsMobile } from '@/hooks/useIsMobile'
import ProductCardSkeleton from '@/components/product-card-skeleton'

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
  const [loadingProducts, setLoadingProducts] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const supabase = useMemo(() => getSupabaseClient(), [])
  const isMobile = useIsMobile()

  useEffect(() => {
    let cancelled = false
    let channel: ReturnType<typeof supabase.channel> | null = null

    if (ids.length === 0) {
      setProducts([])
      setLoadError(null)
      setLoadingProducts(false)
      return
    }

    setLoadingProducts(true)
    setLoadError(null)

    const fetchWishlistProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('id, name_az, name_ru, name_en, price, discount_pct, image_urls, in_stock')
          .in('id', ids)

        if (error) throw error

        const order = new Map(ids.map((id, i) => [id, i]))
        const list = (data || []) as Product[]
        list.sort((a, b) => (order.get(a.id) ?? 99) - (order.get(b.id) ?? 99))

        if (!cancelled) setProducts(list)
      } catch (e) {
        if (cancelled) return
        const msg = e instanceof Error ? e.message : String(e)
        setLoadError(msg)
      } finally {
        if (!cancelled) setLoadingProducts(false)
      }
    }

    void fetchWishlistProducts()

    channel = supabase
      .channel(`wishlist-products-${ids.join(',')}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload) => {
          const nextRow =
            payload.new && typeof payload.new === 'object' ? (payload.new as { id?: unknown }) : null
          const prevRow =
            payload.old && typeof payload.old === 'object' ? (payload.old as { id?: unknown }) : null
          const changedId = String(nextRow?.id ?? prevRow?.id ?? '')
          if (changedId && !ids.includes(changedId)) return
          void fetchWishlistProducts()
        }
      )
      .subscribe((status, err) => {
        if (err) console.warn('[Realtime] wishlist products:', err.message)
      })

    return () => {
      cancelled = true
      if (channel) void supabase.removeChannel(channel)
    }
  }, [ids, supabase])

  if (ids.length > 0 && loadingProducts) {
    return (
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, idx) => (
          <ProductCardSkeleton key={idx} />
        ))}
      </main>
    )
  }

  if (ids.length > 0 && loadError) {
    return (
      <main className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto text-center">
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">{tr.error[lang]}</h1>
        <p className="text-sm text-white/60 mb-4">{loadError}</p>
        <Link href="/" className="text-[#e8c97a] font-medium hover:underline">
          {tr.backToCatalog[lang]}
        </Link>
      </main>
    )
  }

  if (ids.length === 0 || products.length === 0) {
    return (
      <main className="p-4 sm:p-6 md:p-8 max-w-2xl mx-auto text-center">
        <motion.div
          animate={{ rotate: [-4, 4, -4] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          className="mb-4 text-6xl text-rose-300"
        >
          ♡
        </motion.div>
        <h1 className="text-xl sm:text-2xl font-bold mb-2">{tr.wishlistEmpty[lang]}</h1>
        <Link href="/" className="text-[#e8c97a] font-medium hover:underline">
          {tr.backToCatalog[lang]}
        </Link>
      </main>
    )
  }

  return (
    <main className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto overflow-x-hidden">
      <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
        <Link href="/" className="text-white/60 hover:text-white min-h-[44px] inline-flex items-center">
          {tr.back[lang]}
        </Link>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">{tr.wishlist[lang]}</h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
              transition={
                isMobile ? { duration: 0.15, ease: 'easeOut', delay: 0 } : { delay: i * 0.04 }
              }
              className="flex flex-col sm:flex-row gap-4 border rounded-xl p-4 card-soft items-stretch sm:items-center"
            >
              <Link
                href={`/product/${p.id}`}
                className="shrink-0 relative w-24 h-24 rounded-lg overflow-hidden bg-white/5 border border-white/10"
              >
                {img ? (
                  <Image
                    src={img}
                    alt={name}
                    fill
                    className="object-cover"
                    sizes="96px"
                    priority={i === 0}
                    loading={i === 0 ? undefined : 'lazy'}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-2xl">🛏</div>
                )}
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/product/${p.id}`} className="font-semibold text-white/80 hover:text-[#e8c97a] line-clamp-2">
                  {name}
                </Link>
                <div className="text-lg font-bold mt-1 text-[#e8c97a]">{price} AZN</div>
                {!p.in_stock && (
                  <span className="text-[10px] font-semibold bg-[rgba(220,53,69,0.1)] border border-[rgba(220,53,69,0.2)] text-[rgba(255,100,100,0.85)] px-2 py-1 rounded-full">
                    {tr.outOfStock[lang]}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => toggle(p.id)}
                className="text-sm text-[rgba(255,100,100,0.85)] hover:text-[#ff6b6b] shrink-0 min-h-[44px] min-w-[44px] p-3 flex items-center justify-center self-end sm:self-center"
                aria-label={lang === 'ru' ? 'Удалить из избранного' : lang === 'en' ? 'Remove from wishlist' : 'Seçilmişlərdən çıxar'}
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
