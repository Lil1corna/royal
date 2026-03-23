import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import CatalogClient from '@/components/catalog-client'

export default async function Home() {
  try {
    const cookieStore = await cookies()
    
    // Проверяем наличие переменных окружения
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('Missing Supabase environment variables')
      return <CatalogClient products={[]} />
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
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
