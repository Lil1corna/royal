import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductContent from './product-content'

type ProductData = {
  id: string
  name_ru: string
  name_az: string
  name_en: string
  category: string
  price: number
  discount_pct: number
  image_urls: string[] | null
  description?: string | null
}

export async function generateMetadata(props: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const params = await props.params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )
  const { data: product } = await supabase
    .from('products')
    // description не нужен для metadata; убираем чтобы не ломать страницу при отсутствии колонки
    .select('name_ru, name_az, name_en, image_urls')
    .eq('id', params.id)
    .single()
  if (!product) return { title: 'RoyalAz' }
  const name = product.name_ru || product.name_az || product.name_en
  const image = product.image_urls?.[0]
  return {
    title: `${name} | RoyalAz`,
    description: `${name} — ortopedik dosek. RoyalAz-dan sifariş edin.`,
    openGraph: {
      title: `${name} | RoyalAz`,
      description: `${name} — ortopedik dosek.`,
      images: image ? [image] : undefined,
    },
  }
}

export default async function ProductPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  )

  const {
    data: product,
    error: productError,
  } = await supabase
    .from('products')
    .select('id, name_ru, name_az, name_en, category, price, discount_pct, image_urls, description')
    .eq('id', params.id)
    .single()

  // If `description` column doesn't exist yet, keep product page working.
  // We cast because the first query includes `description`, while the fallback query omits it.
  let resolvedProduct: ProductData | null = (product as ProductData | null) ?? null
  if (!resolvedProduct && productError && /description/i.test(productError.message)) {
    const { data: productWithoutDesc } = await supabase
      .from('products')
      .select('id, name_ru, name_az, name_en, category, price, discount_pct, image_urls')
      .eq('id', params.id)
      .single()
    resolvedProduct = (productWithoutDesc as ProductData | null) ?? null
  }

  if (!resolvedProduct) notFound()

  const { data: sizes } = await supabase
    .from('product_sizes')
    .select('*')
    .eq('product_id', params.id)

  return <ProductContent product={resolvedProduct} sizes={sizes || []} />
}
