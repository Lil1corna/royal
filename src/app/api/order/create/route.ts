import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { verifyCsrf, csrfForbiddenResponse } from '@/lib/csrf'
import { isUpstashRedisConfigured, rateLimitFromRequest } from '@/lib/rate-limit'

const itemSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().min(1).max(99),
  size: z.string().nullable().optional(),
})

const bodySchema = z.object({
  items: z.array(itemSchema).min(1).max(50),
  total: z.number().positive(),
  address: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
  lat: z.number().min(-90).max(90).optional(),
  lng: z.number().min(-180).max(180).optional(),
  paymentMethod: z.enum(['cash', 'online']).default('cash'),
  lang: z.enum(['az', 'ru', 'en']).default('az'),
})

function mergeNotesWithCoords(
  notes: string | undefined,
  lat: number | undefined,
  lng: number | undefined
): string {
  const trimmed = notes?.trim() ?? ''
  const lines = trimmed.length > 0 ? trimmed.split('\n').filter((l) => l.length > 0) : []
  const hasCoordLine = lines.some((l) => /^Koordinat:\s*[\d.-]+,\s*[\d.-]+/.test(l))
  if (
    lat != null &&
    lng != null &&
    Number.isFinite(lat) &&
    Number.isFinite(lng) &&
    !hasCoordLine
  ) {
    lines.push(`Koordinat: ${lat},${lng}`)
  }
  return lines.join('\n')
}

type ProductRow = {
  id: string
  price: number
  discount_pct: number | null
  in_stock: boolean
}

type SizeRow = {
  product_id: string
  size: string
  price: number
  in_stock: boolean
}

function unitPriceFromOriginal(original: number, discountPct: number): number {
  return discountPct > 0
    ? parseFloat((original * (1 - discountPct / 100)).toFixed(0))
    : original
}

export async function POST(request: NextRequest) {
  try {
    const allowed = await rateLimitFromRequest(request, 'order-create')
    if (!allowed) {
      if (!isUpstashRedisConfigured()) {
        return NextResponse.json(
          {
            error:
              'Checkout rate limiting is unavailable. Set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.',
            code: 'RATE_LIMIT_BACKEND',
          },
          { status: 503 }
        )
      }
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    if (!(await verifyCsrf(request))) {
      return csrfForbiddenResponse()
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const parsed = bodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
    }

    const { items, total, address, notes, lat, lng, paymentMethod } = parsed.data
    const notesForDb = mergeNotesWithCoords(notes, lat, lng)

    if (paymentMethod === 'online') {
      const meta = user.user_metadata as Record<string, unknown> | undefined
      const userPhone = typeof meta?.phone === 'string' ? meta.phone.trim() : ''
      const notesHasTel = Boolean(notesForDb?.includes('Tel:'))
      if (!userPhone && !notesHasTel) {
        return NextResponse.json(
          { error: 'Phone number required to place an order' },
          { status: 400 }
        )
      }
    }

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const productIds = [...new Set(items.map((i) => i.productId))]

    const { data: products, error: prodError } = await admin
      .from('products')
      .select('id, price, discount_pct, in_stock')
      .in('id', productIds)

    if (prodError || !products?.length) {
      return NextResponse.json({ error: 'Failed to verify products' }, { status: 500 })
    }

    const productMap = new Map((products as ProductRow[]).map((p) => [p.id, p]))

    const { data: sizeRows, error: sizesError } = await admin
      .from('product_sizes')
      .select('product_id, size, price, in_stock')
      .in('product_id', productIds)

    if (sizesError) {
      return NextResponse.json({ error: 'Failed to verify product sizes' }, { status: 500 })
    }

    const sizesByProduct = new Map<string, SizeRow[]>()
    for (const row of (sizeRows ?? []) as SizeRow[]) {
      const list = sizesByProduct.get(row.product_id) ?? []
      list.push(row)
      sizesByProduct.set(row.product_id, list)
    }

    let serverTotal = 0
    const verifiedItems: Array<{
      productId: string
      quantity: number
      priceAtPurchase: number
    }> = []

    for (const item of items) {
      const product = productMap.get(item.productId)
      if (!product) {
        return NextResponse.json({ error: 'Product not found' }, { status: 400 })
      }
      if (!product.in_stock) {
        return NextResponse.json({ error: 'One or more products are out of stock' }, { status: 400 })
      }

      const discountPct = product.discount_pct ?? 0
      const sizeLabel = item.size?.trim() ? item.size.trim() : null

      let original: number
      if (sizeLabel) {
        const candidates = sizesByProduct.get(item.productId) ?? []
        const sizeRow = candidates.find((s) => s.size.trim() === sizeLabel)
        if (!sizeRow) {
          return NextResponse.json({ error: 'Invalid product size' }, { status: 400 })
        }
        if (!sizeRow.in_stock) {
          return NextResponse.json({ error: 'One or more products are out of stock' }, { status: 400 })
        }
        original = Number(sizeRow.price)
      } else {
        original = Number(product.price)
      }

      const unitPrice = unitPriceFromOriginal(original, discountPct)
      serverTotal += unitPrice * item.quantity
      verifiedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        priceAtPurchase: unitPrice,
      })
    }

    const serverTotalRounded = Math.round(serverTotal * 100) / 100
    const clientTotalRounded = Math.round(total * 100) / 100
    if (Math.abs(serverTotalRounded - clientTotalRounded) > 0.01) {
      return NextResponse.json(
        { error: 'Price mismatch — please refresh and try again' },
        { status: 400 }
      )
    }

    const { data: newOrder, error: orderError } = await admin
      .from('orders')
      .insert({
        user_id: user.id,
        total_price: serverTotal,
        subtotal: serverTotal,
        shipping_fee: 0,
        delivery_mode: 'courier',
        status: 'new',
        payment_method: paymentMethod,
        payment_status: 'pending',
        address: address?.trim() ?? '',
        notes: notesForDb,
      })
      .select('id')
      .single()

    if (orderError || !newOrder) {
      console.error('[order/create] insert order error:', orderError)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    const orderItems = verifiedItems.map((row) => ({
      order_id: newOrder.id,
      product_id: row.productId,
      quantity: row.quantity,
      price_at_purchase: row.priceAtPurchase,
    }))

    const { error: itemsError } = await admin.from('order_items').insert(orderItems)
    if (itemsError) {
      console.error('[order/create] insert items error:', itemsError)
      await admin.from('orders').delete().eq('id', newOrder.id)
      return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
    }

    return NextResponse.json({ orderId: newOrder.id, total: serverTotal })
  } catch (e) {
    console.error('[order/create] unexpected error:', e)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
