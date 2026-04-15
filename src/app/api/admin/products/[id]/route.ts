import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { csrfForbiddenResponse, verifyCsrf } from '@/lib/csrf'
import { ensureAuthorized } from '@/lib/ensure-authorized'
import { rateLimitFromRequest } from '@/lib/rate-limit'

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

const idSchema = z.string().uuid()

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const allowed = await rateLimitFromRequest(request, 'admin-products-patch')
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    if (!(await verifyCsrf(request))) {
      return csrfForbiddenResponse()
    }

    const auth = await ensureAuthorized('manage_products')
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'Unauthorized' : auth.error || 'Forbidden' },
        { status: auth.status }
      )
    }

    const { id } = await context.params
    const idParsed = idSchema.safeParse(id)
    if (!idParsed.success) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const payload = productUpdateSchema.safeParse(await request.json())
    if (!payload.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const { error } = await auth.admin
      .from('products')
      .update(payload.data)
      .eq('id', idParsed.data)

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
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const allowed = await rateLimitFromRequest(request, 'admin-products-delete')
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    if (!(await verifyCsrf(request))) {
      return csrfForbiddenResponse()
    }

    const auth = await ensureAuthorized('delete_anything')
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'Unauthorized' : auth.error || 'Forbidden' },
        { status: auth.status }
      )
    }

    const { id } = await context.params
    const idParsed = idSchema.safeParse(id)
    if (!idParsed.success) {
      return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
    }

    const { error, count } = await auth.admin
      .from('products')
      .delete({ count: 'exact' })
      .eq('id', idParsed.data)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    if (count === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unexpected error' },
      { status: 500 }
    )
  }
}
