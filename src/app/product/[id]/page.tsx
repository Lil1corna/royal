import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ProductContent from './product-content'

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

export default async function ProductPage(props: any) {
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
    .select('*')
    .eq('id', params.id)
    .single()

  if (!product) notFound()

  const { data: sizes } = await supabase
    .from('product_sizes')
    .select('*')
    .eq('product_id', params.id)

  return <ProductContent product={product} sizes={sizes || []} />
}
