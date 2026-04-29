// Defensive handler if Kapital Bank (or a proxy) POSTs payment notifications.
// Exact Hosted Payment Page (HPP) webhook body must be confirmed when merchant
// certificates and bank documentation are available — extend parsing then.

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as Record<string, unknown> | null

    const orderObj = body?.order
    const nestedId =
      orderObj && typeof orderObj === 'object' && orderObj !== null && 'id' in orderObj
        ? (orderObj as { id?: unknown }).id
        : undefined

    const kbOrderId =
      (typeof nestedId === 'string' || typeof nestedId === 'number' ? String(nestedId) : null) ??
      (typeof body?.orderId === 'string' ? body.orderId : null) ??
      (typeof body?.ORDERID === 'string' ? body.ORDERID : null)

    const secret = process.env.CRON_SECRET?.trim()
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')

    if (kbOrderId && secret && siteUrl) {
      void fetch(`${siteUrl}/api/payment/verify-internal`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Cron-Secret': secret,
        },
        body: JSON.stringify({ kbOrderId: String(kbOrderId) }),
      }).catch((err: unknown) => console.error('[callback] verify-internal error:', err))
    }
  } catch (err) {
    console.error('[callback] unexpected error:', err)
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}
