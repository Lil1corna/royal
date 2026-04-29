import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { verifyCsrf, csrfForbiddenResponse } from '@/lib/csrf'
import { rateLimitFromRequest } from '@/lib/rate-limit'
import { getKapitalBankClient, KapitalBankError } from '@/lib/kapital-bank'

const bodySchema = z.object({
  orderId: z.string().uuid(),
})

export async function POST(request: NextRequest) {
  try {
    const allowed = await rateLimitFromRequest(request, 'payment-create')
    if (!allowed) {
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
          setAll: (cs) => cs.forEach(({ name, value, options }) => cookieStore.set(name, value, options)),
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

    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const { data: order, error: orderError } = await admin
      .from('orders')
      .select('id, total_price, user_id, payment_status, payment_method')
      .eq('id', parsed.data.orderId)
      .single()

    if (orderError || !order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (order.user_id && order.user_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    if (order.payment_status === 'paid') {
      return NextResponse.json({ error: 'Order already paid' }, { status: 400 })
    }

    const ps = String(order.payment_status ?? '')
    const retriable = ps === 'pending' || ps === 'failed' || ps === 'cancelled'
    if (!retriable) {
      return NextResponse.json({ error: 'Order cannot be paid' }, { status: 400 })
    }

    await admin
      .from('orders')
      .update({
        payment_method: 'online',
        payment_status: 'pending',
        kb_order_id: null,
        kb_session_id: null,
        kb_status: null,
      })
      .eq('id', order.id)

    const kb = getKapitalBankClient()
    if (!kb.isMockMode) {
      const merchantId = process.env.KAPITAL_MERCHANT_ID?.trim()
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()
      if (!merchantId || merchantId === 'MOCK_MERCHANT') {
        return NextResponse.json(
          {
            error:
              'Missing KAPITAL_MERCHANT_ID. Set it in the environment for live or test gateway calls.',
          },
          { status: 500 }
        )
      }
      if (!siteUrl) {
        return NextResponse.json(
          { error: 'Missing NEXT_PUBLIC_SITE_URL (required for payment redirect URLs).' },
          { status: 500 }
        )
      }
    }

    const result = await kb.createOrder(
      Number(order.total_price),
      `RoyalAz #${String(order.id).slice(0, 8)}`
    )

    await admin
      .from('orders')
      .update({
        kb_order_id: result.orderId,
        kb_session_id: result.sessionId,
      })
      .eq('id', order.id)

    return NextResponse.json({ paymentUrl: result.paymentUrl, isMock: result.isMock })
  } catch (e) {
    if (e instanceof KapitalBankError) {
      console.error('[payment/create] KapitalBankError:', e.statusCode, e.raw)
      return NextResponse.json({ error: 'Bank connection failed' }, { status: 502 })
    }
    console.error('[payment/create] unexpected:', e)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
