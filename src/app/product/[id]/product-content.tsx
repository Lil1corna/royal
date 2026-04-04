'use client'
import { useLang, translations } from '@/context/lang'
import Link from 'next/link'
import ProductGallery from './gallery'
import SizeSelector from './sizes'

type Product = {
  id: string
  name_az: string
  name_ru: string
  name_en: string
  category: string
  price: number
  discount_pct: number
  image_urls: string[] | null
  description?: string | null
}

type Size = {
  id: string
  size: string
  price: number
  in_stock: boolean
}

export default function ProductContent({
  product,
  sizes,
}: {
  product: Product
  sizes: Size[]
}) {
  const { lang } = useLang()
  const tr = translations

  const name = lang === 'az' ? product.name_az : lang === 'ru' ? product.name_ru : product.name_en
  const cat = tr.categories[product.category]?.[lang] || product.category

  return (
    <main className="mx-auto max-w-6xl p-4 sm:p-6 md:p-8 text-white overflow-x-hidden">
      <Link
        href="/"
        className="mb-6 inline-block font-medium text-[#c9a84c] underline-offset-4 hover:text-[#e8c97a] hover:underline"
      >
        ← {tr.backToCatalogBtn[lang]}
      </Link>
      <p className="text-sm text-white/60 mb-1">{cat}</p>
      <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 sm:mb-8 font-serif">{name}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
        <ProductGallery images={product.image_urls || []} productName={name} />
        <SizeSelector
          sizes={sizes}
          basePrice={product.price}
          discountPct={product.discount_pct}
          description={product.description}
          productId={product.id}
          productName={name}
          productImage={product.image_urls?.[0] || null}
        />
      </div>
    </main>
  )
}
