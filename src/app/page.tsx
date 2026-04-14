import { createServerSupabase } from '@/lib/supabase-server'
import CatalogClient from '@/components/catalog-client'
import type { Product } from '@/types/product'

export const dynamic = 'force-dynamic'

export default async function Home() {
  let products: Product[] = []
  let fetchError: string | null = null

  try {
    const supabase = await createServerSupabase()
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase products error:', error)
      fetchError = error.message
    } else {
      products = (data || []) as Product[]
    }
  } catch (e) {
    console.error('Failed to fetch products:', e)
    fetchError = e instanceof Error ? e.message : 'Failed to load products'
  }

  return <CatalogClient initialProducts={products} initialError={fetchError} />
}
