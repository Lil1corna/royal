// This function polls pending online orders and verifies their payment
// status with Kapital Bank. It handles the case where the user closes
// their browser before /payment/success loads and calls /api/payment/verify.
// Schedule: every 5 minutes via Supabase cron (Dashboard Jobs or pg_cron + pg_net).
//
// Required secrets: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto), CRON_SECRET,
// NEXT_PUBLIC_SITE_URL (your deployed Next.js origin, no trailing slash).

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

type VerifyInternalBody = {
  orderId?: string
  payment_status?: string
  kb_status?: string
  cached?: boolean
  error?: string
}

Deno.serve(async (req) => {
  if (req.method !== 'POST' && req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')?.trim()
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')?.trim()
  const cronSecret = Deno.env.get('CRON_SECRET')?.trim()
  const siteUrlRaw = Deno.env.get('NEXT_PUBLIC_SITE_URL')?.trim()

  if (!supabaseUrl || !serviceKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase env' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (!cronSecret) {
    return new Response(JSON.stringify({ error: 'Missing CRON_SECRET' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  if (!siteUrlRaw) {
    return new Response(JSON.stringify({ error: 'Missing NEXT_PUBLIC_SITE_URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const siteUrl = siteUrlRaw.replace(/\/$/, '')
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
  const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

  const { data: pendingRows, error: listError } = await supabase
    .from('orders')
    .select('id, kb_order_id')
    .eq('payment_method', 'online')
    .eq('payment_status', 'pending')
    .not('kb_order_id', 'is', null)
    .lt('created_at', fiveMinAgo)
    .gt('created_at', twentyFourHoursAgo)

  if (listError) {
    console.error('[verify-pending-payments] list error:', listError)
    return new Response(JSON.stringify({ error: listError.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const rows = pendingRows ?? []
  let checked = 0
  let updated = 0
  let errors = 0

  for (const row of rows) {
    const kbOrderId = row.kb_order_id as string | null
    if (!kbOrderId) continue
    checked += 1
    try {
      const res = await fetch(`${siteUrl}/api/payment/verify-internal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Cron-Secret': cronSecret,
        },
        body: JSON.stringify({ kbOrderId }),
      })
      const body = (await res.json().catch(() => ({}))) as VerifyInternalBody
      if (!res.ok) {
        errors += 1
        console.error('[verify-pending-payments]', row.id, kbOrderId, res.status, body.error ?? body)
        continue
      }
      if (!body.cached) {
        updated += 1
      }
      console.log(
        '[verify-pending-payments]',
        'order_id=',
        row.id,
        'kb_status=',
        body.kb_status ?? '',
        'payment_status=',
        body.payment_status ?? '',
        'cached=',
        Boolean(body.cached)
      )
    } catch (e) {
      errors += 1
      console.error('[verify-pending-payments] fetch error', row.id, kbOrderId, e)
    }
  }

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  const { data: abandoned, error: abandonError } = await supabase
    .from('orders')
    .update({ payment_status: 'cancelled', status: 'cancelled' })
    .eq('payment_method', 'online')
    .eq('payment_status', 'pending')
    .is('kb_order_id', null)
    .lt('created_at', twoHoursAgo)
    .select('id')

  if (abandonError) {
    console.error('[verify-pending-payments] abandon update error:', abandonError)
  }

  const cancelledCount = abandoned?.length ?? 0
  if (cancelledCount > 0) {
    console.log('[verify-pending-payments] cancelled abandoned orders:', cancelledCount)
  }

  return new Response(
    JSON.stringify({
      checked,
      updated,
      errors,
      cancelledCount,
    }),
    { headers: { 'Content-Type': 'application/json' } }
  )
})
