import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { ensureAuthorized } from '@/lib/ensure-authorized'

const CATEGORY_VALUES = ['ortopedik', 'berk', 'yumshaq', 'topper', 'ushaq', 'yastig'] as const

const productUpdateSchema = z.object({
  name_az: z.string().trim().min(1),
  name_ru: z.string().trim().min(1),
  name_en: z.string().trim().min(1),
  category: z.enum(CATEGORY_VALUES),
  description: z.string().max(2000).optional().default(''),
  price: z.number().positive(),
  discount_pct: z.number().min(0).max(100),
  in_stock: z.boolean(),
  image_urls: z.array(z.string().url()).optional().default([]),
})

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const payload = productUpdateSchema.safeParse(await request.json())
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

    const { error } = await auth.admin
      .from('products')
      .update(payload.data)
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unexpected error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const auth = await ensureAuthorized('delete_anything')
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'Unauthorized' : auth.error || 'Forbidden' },
        { status: auth.status }
      )
    }

    const { error } = await auth.admin
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unexpected error' },
      { status: 500 }
    )
  }
}
