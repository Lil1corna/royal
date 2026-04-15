/** Aligned with admin API and catalog `select('*')` on `public.products`. */
export const PRODUCT_CATEGORY_VALUES = [
  'ortopedik',
  'berk',
  'yumshaq',
  'topper',
  'ushaq',
  'yastig',
] as const

export type ProductCategory = (typeof PRODUCT_CATEGORY_VALUES)[number]

export type Product = {
  id: string
  name_az: string
  name_ru: string
  name_en: string
  category: ProductCategory | string
  description?: string | null
  price: number
  discount_pct: number
  in_stock: boolean
  image_urls: string[] | null
  /** ISO timestamp from Postgres */
  created_at?: string
}
