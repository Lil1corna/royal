import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Online payment is not yet available' }, { status: 503 })
}

/* HIDDEN UNTIL BANK IS CONNECTED
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { rateLimitFromRequest } from '@/lib/rate-limit'

const bodySchema = z.object({
  orderId: z.string().uuid(),
  amount: z.number().positive(),
  currency: z.string().default('AZN'),
  lang: z.enum(['AZ', 'RU', 'EN']).default('AZ'),
})

type PayriffCreateResponse = {
  payload?: Record<string, unknown>
  data?: Record<string, unknown>
  message?: string
  error?: string
}

function pickString(source: Record<string, unknown> | undefined, keys: string[]): string | null {
  if (!source) return null
  for (const key of keys) {
    const value = source[key]
    if (typeof value === 'string' && value.trim()) return value
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const allowed = await rateLimitFromRequest(request, 'payment-create')
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const parsed = bodySchema.safeParse(await request.json())
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
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

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const payriffSecretKey = process.env.PAYRIFF_SECRET_KEY
    const payriffMerchantId = process.env.PAYRIFF_MERCHANT_ID
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Missing Supabase server environment variables' },
        { status: 500 }
      )
    }

    if (!payriffSecretKey || !payriffMerchantId || !siteUrl) {
      return NextResponse.json(
        { error: 'Missing PAYRIFF/website environment variables' },
        { status: 500 }
      )
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { orderId, amount, currency, lang } = parsed.data
    const normalizedCurrency = currency.toUpperCase()

    if (normalizedCurrency !== 'AZN') {
      return NextResponse.json({ error: 'Only AZN currency is supported' }, { status: 400 })
    }

    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, total_price, user_id')
      .eq('id', orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json(
        { error: orderError?.message || 'Order not found' },
        { status: 404 }
      )
    }

    if (order.user_id && order.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (Math.abs(Number(order.total_price) - amount) > 0.01) {
      return NextResponse.json(
        { error: 'Amount mismatch with stored order total' },
        { status: 400 }
      )
    }

    await admin
      .from('orders')
      .update({ payment_method: 'online', payment_status: 'pending' })
      .eq('id', orderId)

    const amountInQepik = Math.round(amount * 100)
    const cleanSiteUrl = siteUrl.replace(/\/$/, '')
    const approveURL = `${cleanSiteUrl}/payment/success?orderId=${orderId}`
    const cancelURL = `${cleanSiteUrl}/payment/cancel?orderId=${orderId}`
    const declineURL = `${cleanSiteUrl}/payment/failed?orderId=${orderId}`

    const payriffBody = {
      merchantId: payriffMerchantId,
      amount: amountInQepik,
      currency: 'AZN',
      language: lang,
      approveURL,
      cancelURL,
      declineURL,
      description: `RoyalAz order #${orderId}`,
    }

    const payriffResponse = await fetch('https://api.payriff.com/api/v2/orders/createOrder', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        secretKey: payriffSecretKey,
      },
      body: JSON.stringify(payriffBody),
      cache: 'no-store',
    })

    const payriffJson = (await payriffResponse.json()) as PayriffCreateResponse
    if (!payriffResponse.ok) {
      return NextResponse.json(
        {
          error:
            payriffJson?.message ||
            payriffJson?.error ||
            `Payriff error (${payriffResponse.status})`,
        },
        { status: 502 }
      )
    }

    const source = payriffJson.payload || payriffJson.data
    const paymentUrl = pickString(source, ['paymentUrl', 'payment_url', 'redirectUrl', 'redirect_url', 'url'])
    const payriffOrderId = pickString(source, ['orderId', 'order_id'])
    const payriffSessionId = pickString(source, ['sessionId', 'session_id'])

    if (!paymentUrl) {
      return NextResponse.json({ error: 'Payment URL missing in PAYRIFF response' }, { status: 502 })
    }

    await admin
      .from('orders')
      .update({
        payriff_order_id: payriffOrderId,
        payriff_session_id: payriffSessionId,
      })
      .eq('id', orderId)

    return NextResponse.json({ paymentUrl })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 }
    )
  }
}
HIDDEN UNTIL BANK IS CONNECTED */
