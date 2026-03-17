import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'
import ProductGallery from './gallery'
import SizeSelector from './sizes'

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

  return (
    <main className="p-8 max-w-6xl mx-auto">
      <a href="/" className="text-gray-500 hover:text-black mb-6 inline-block">Katalog</a>
      <p className="text-sm text-gray-400 mb-1">{product.category}</p>
      <h1 className="text-3xl font-bold mb-8">{product.name_ru}</h1>
      <div className="grid grid-cols-2 gap-12">
        <ProductGallery images={product.image_urls || []} />
        <SizeSelector
          sizes={sizes || []}
          basePrice={product.price}
          discountPct={product.discount_pct}
          productId={product.id}
          productName={product.name_ru}
          productImage={product.image_urls?.[0] || null}
        />
      </div>
    </main>
  )
}
