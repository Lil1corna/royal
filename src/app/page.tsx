import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import CatalogClient from '@/components/catalog-client'

export default async function Home() {
  try {
    const cookieStore = await cookies()
    
    // В Netlify Functions переменные NEXT_PUBLIC_ могут быть недоступны
    // Используем fallback на обычные переменные
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
    
    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Missing Supabase environment variables')
      console.error('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
      console.error('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
      return <CatalogClient products={[]} />
    }

    const supabase = createServerClient(
      supabaseUrl,
      supabaseAnonKey,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    )

    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return <CatalogClient products={[]} />
    }

    return <CatalogClient products={products || []} />
  } catch (error) {
    console.error('Error in Home page:', error)
    return <CatalogClient products={[]} />
  }
}
