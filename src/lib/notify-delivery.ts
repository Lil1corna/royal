/**
 * При смене статуса на in_delivery вызывается вебхук (n8n, Make, Supabase Edge Function и т.д.).
 * Там можно подключить WhatsApp Business API, Twilio или просто отправить сообщение курьеру.
 */
export type OrderDeliveryPayload = {
  event: 'order_in_delivery'
  order_id: string
  address: string
  notes: string | null
  total_price: number
  /** Ссылка Google Maps, если в заметках есть координаты */
  maps_link: string | null
  customer_phone: string | null
}

export function parseMapsLinkFromNotes(notes: string | null): string | null {
  if (!notes) return null
  const m = notes.match(/Koordinat:\s*([\d.]+),\s*([\d.]+)/)
  if (!m) return null
  return `https://www.google.com/maps?q=${m[1]},${m[2]}`
}

/** Maps URL from order notes coords, else search by address text (for admin / courier links). */
export function mapsLinkForDelivery(address: string | null | undefined, notes: string | null): string | null {
  const fromNotes = parseMapsLinkFromNotes(notes)
  if (fromNotes) return fromNotes
  const a = address?.trim()
  if (!a) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(a)}`
}

export function parsePhoneFromNotes(notes: string | null): string | null {
  if (!notes) return null
  const m = notes.match(/Tel:\s*([+\d][\d\s\-]{8,22})/)
  return m ? m[1].replace(/[\s\-]/g, '') : null
}

/** Extra delivery line written as `Əlavə: ...` from cart checkout. */
export function parseExtraFromNotes(notes: string | null): string | null {
  if (!notes) return null
  const m = notes.match(/Əlavə:\s*(.+)/m)
  return m ? m[1].trim() : null
}

export async function notifyDeliveryWebhook(payload: OrderDeliveryPayload) {
  const url = process.env.DELIVERY_WEBHOOK_URL?.trim()
  if (!url) return

  const secret = process.env.DELIVERY_WEBHOOK_SECRET?.trim()
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (secret) headers['X-Webhook-Secret'] = secret

  try {
    await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) })
  } catch {
    // не ломаем смену статуса из-за вебхука
  }
}
