import { NextResponse } from 'next/server'

export async function POST() {
  return NextResponse.json({ error: 'Online payment is not yet available' }, { status: 503 })
}

/* HIDDEN UNTIL BANK IS CONNECTED
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

type CallbackPayload = {
  orderId?: string
  order_id?: string
  sessionId?: string
  session_id?: string
  status?: string
  paymentStatus?: string
  payment_status?: string
}

function mapPayriffStatus(rawStatus: string): 'paid' | 'failed' | 'pending' {
  const status = rawStatus.toLowerCase()
  if (status === 'approved' || status === 'paid' || status === 'success') return 'paid'
  if (status === 'declined' || status === 'failed') return 'failed'
  if (status === 'cancelled' || status === 'canceled') return 'pending'
  return 'pending'
}

function getSecretFromHeaders(request: NextRequest): string {
  return (
    request.headers.get('secretkey') ||
    request.headers.get('x-payriff-secret') ||
    request.headers.get('x-secret-key') ||
    ''
  )
}

export async function POST(request: NextRequest) {
  try {
    const expectedSecret = process.env.PAYRIFF_SECRET_KEY
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!expectedSecret || !supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: 'Missing server environment variables' }, { status: 500 })
    }

    const incomingSecret = getSecretFromHeaders(request)
    if (incomingSecret !== expectedSecret) {
      return NextResponse.json({ error: 'Invalid callback signature' }, { status: 401 })
    }

    const payload = (await request.json()) as CallbackPayload
    const rawStatus = payload.status || payload.paymentStatus || payload.payment_status || 'pending'
    const paymentStatus = mapPayriffStatus(rawStatus)

    const payriffOrderId = payload.orderId || payload.order_id || null
    const payriffSessionId = payload.sessionId || payload.session_id || null

    if (!payriffOrderId && !payriffSessionId) {
      return NextResponse.json({ error: 'Missing payriff identifiers in callback' }, { status: 400 })
    }

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })

    let query = admin
      .from('orders')
      .update({ payment_status: paymentStatus })

    if (payriffOrderId) {
      query = query.eq('payriff_order_id', payriffOrderId)
    } else if (payriffSessionId) {
      query = query.eq('payriff_session_id', payriffSessionId)
    }

    const { error } = await query
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ ok: true }, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected server error' },
      { status: 500 }
    )
  }
}
HIDDEN UNTIL BANK IS CONNECTED */
