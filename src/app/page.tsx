'use client'
import { useEffect, useMemo, useState } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import CatalogClient from '@/components/catalog-client'

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
    async function fetchProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Supabase error:', error)
          setLoadError(error.message)
        } else {
          setProducts(data || [])
          setLoadError(null)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
        setLoadError(error instanceof Error ? error.message : 'Failed to load products')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [supabase])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Yüklənir...</div>
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
