'use client'
import { useEffect, useMemo, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import CatalogClient from '@/components/catalog-client'
import ProductCardSkeleton from '@/components/product-card-skeleton'

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

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const supabase = useMemo(() => getSupabaseClient(), [])

  useEffect(() => {
    let cancelled = false

    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Supabase error:', error)
          if (!cancelled) setLoadError(error.message)
        } else {
          if (!cancelled) {
            setProducts(data || [])
            setLoadError(null)
          }
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        if (!cancelled) setLoadError(error instanceof Error ? error.message : 'Failed to load products')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void fetchProducts()

    const channel = supabase
      .channel('home-products-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          void fetchProducts()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'product_sizes' },
        () => {
          void fetchProducts()
        }
      )
      .subscribe((status, err) => {
        if (err) console.warn('[Realtime] home products:', err.message)
      })

    return () => {
      cancelled = true
      void supabase.removeChannel(channel)
    }
  }, [supabase])

  if (loading) {
    return (
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-4 py-12 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <ProductCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-red-300 font-semibold mb-2">Məhsullar yüklənmədi</p>
          <p className="text-white/60 text-sm">{loadError}</p>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-white font-semibold mb-2">Məhsul tapılmadı</p>
          <p className="text-white/60 text-sm">Kataloq hazırda boşdur.</p>
        </div>
      </div>
    )
  }

  return <CatalogClient products={products} />
}
