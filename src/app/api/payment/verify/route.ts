import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { verifyCsrf, csrfForbiddenResponse } from '@/lib/csrf'
import { rateLimitFromRequest } from '@/lib/rate-limit'
import { verifyKapitalPaymentOrder } from '@/lib/verify-kapital-payment'

const bodySchema = z.object({
  kbOrderId: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const allowed = await rateLimitFromRequest(request, 'payment-verify')
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

    const { kbOrderId } = parsed.data
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!serviceKey) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
    }

    const admin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    const result = await verifyKapitalPaymentOrder(admin, kbOrderId, { requireUserId: user.id })

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
    console.error('[payment/verify] error:', e)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
