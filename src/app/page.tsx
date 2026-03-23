'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'
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

  useEffect(() => {
    async function fetchProducts() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseAnonKey) {
          console.error('Missing Supabase credentials')
          setLoading(false)
          return
        }

        const supabase = createClient(supabaseUrl, supabaseAnonKey)
        
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Supabase error:', error)
        } else {
          setProducts(data || [])
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Yüklənir...</div>
      </div>
    )
  }

  return <CatalogClient products={products} />
}
