import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ensureAuthorized } from '@/lib/ensure-authorized'

const CATEGORY_VALUES = ['ortopedik', 'berk', 'yumshaq', 'topper', 'ushaq', 'yastig'] as const

const productSizeSchema = z.object({
  size: z.string().trim().min(1),
  price: z.number().positive(),
  in_stock: z.boolean(),
})

const productCreateSchema = z.object({
  name_az: z.string().trim().min(1),
  name_ru: z.string().trim().min(1),
  name_en: z.string().trim().min(1),
  category: z.enum(CATEGORY_VALUES),
  description: z.string().max(2000).optional().default(''),
  price: z.number().positive(),
  discount_pct: z.number().min(0).max(100),
  in_stock: z.boolean(),
  image_urls: z.array(z.string().url()).optional().default([]),
  sizes: z.array(productSizeSchema).optional().default([]),
})

export async function POST(request: NextRequest) {
  try {
    const payload = productCreateSchema.safeParse(await request.json())
    if (!payload.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const auth = await ensureAuthorized('manage_products')
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'Unauthorized' : auth.error || 'Forbidden' },
        { status: auth.status }
      )
    }

    const { sizes, ...productPayload } = payload.data
    const { data: product, error: insertError } = await auth.admin
      .from('products')
      .insert([productPayload])
      .select()
      .single()

    if (insertError || !product) {
      return NextResponse.json(
        { error: insertError?.message || 'Insert failed' },
        { status: 400 }
      )
    }

    if (sizes.length > 0) {
      const { error: sizeError } = await auth.admin.from('product_sizes').insert(
        sizes.map((s) => ({
          product_id: product.id,
          size: s.size,
          price: s.price,
          in_stock: s.in_stock,
        }))
      )
      if (sizeError) {
        return NextResponse.json({ error: sizeError.message }, { status: 400 })
      }
    }

    return NextResponse.json({ ok: true, product })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unexpected error' },
      { status: 500 }
    )
  }
}
