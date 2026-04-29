import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@supabase/supabase-js'
import { rateLimitFromRequest } from '@/lib/rate-limit'
import { verifyKapitalPaymentOrder } from '@/lib/verify-kapital-payment'

const bodySchema = z.object({
  kbOrderId: z.string().min(1),
})

function cronUnauthorized(): NextResponse {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}

/**
 * Server-to-server only: Supabase Edge cron and optional bank webhook proxy.
 * Auth: X-Cron-Secret === CRON_SECRET. No CSRF, no user session.
 */
export async function POST(request: NextRequest) {
  try {
    const allowed = await rateLimitFromRequest(request, 'payment-verify-internal')
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    const secret = process.env.CRON_SECRET?.trim()
    const header = request.headers.get('x-cron-secret')?.trim()
    if (!secret || header !== secret) {
      return cronUnauthorized()
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

    const result = await verifyKapitalPaymentOrder(admin, parsed.data.kbOrderId)

    if (result.type === 'not_found') {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }
    if (result.type === 'forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({
      orderId: result.orderId,
      payment_status: result.payment_status,
      kb_status: result.kb_status,
      isMock: result.isMock,
      cached: result.cached,
    })
  } catch (e) {
    console.error('[payment/verify-internal] error:', e)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
