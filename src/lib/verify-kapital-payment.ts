import type { SupabaseClient } from '@supabase/supabase-js'
import { getKapitalBankClient, mapKBStatus } from '@/lib/kapital-bank'
import type { OrderStatus } from '@/lib/order-status'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

const TERMINAL_STATUSES: readonly PaymentStatus[] = ['paid', 'failed', 'cancelled']

type OrderVerifyRow = {
  id: string
  user_id: string | null
  kb_session_id: string | null
  payment_status: string
  kb_status: string | null
  address: string | null
  notes: string | null
  total_price: number | string | null
}

export type VerifyKapitalPaymentResult =
  | { type: 'not_found' }
  | { type: 'forbidden' }
  | {
      type: 'success'
      orderId: string
      payment_status: PaymentStatus
      kb_status: string
      isMock: boolean
      cached: boolean
    }

function isPaymentStatus(s: string): s is PaymentStatus {
  return s === 'pending' || s === 'paid' || s === 'failed' || s === 'cancelled'
}

function kbStatusDisplay(row: OrderVerifyRow, payment: PaymentStatus): string {
  if (row.kb_status?.trim()) return row.kb_status
  return payment.toUpperCase()
}

/**
 * Core Kapital verification: load by kb_order_id, idempotent terminal skip,
 * bank status poll, DB update, optional post-paid webhook.
 * FUTURE: use event `order_paid` on OrderDeliveryPayload when added.
 */
export async function verifyKapitalPaymentOrder(
  admin: SupabaseClient,
  kbOrderId: string,
  options?: { requireUserId?: string }
): Promise<VerifyKapitalPaymentResult> {
  const { data: order, error: orderError } = await admin
    .from('orders')
    .select('id, user_id, kb_session_id, payment_status, kb_status, address, notes, total_price')
    .eq('kb_order_id', kbOrderId)
    .maybeSingle()

  if (orderError || !order) {
    return { type: 'not_found' }
  }

  const row = order as OrderVerifyRow

  const uid = options?.requireUserId
  if (uid && row.user_id && row.user_id !== uid) {
    return { type: 'forbidden' }
  }

  const prevStatus = isPaymentStatus(row.payment_status) ? row.payment_status : 'pending'

  if (TERMINAL_STATUSES.includes(prevStatus)) {
    return {
      type: 'success',
      orderId: row.id,
      payment_status: prevStatus,
      kb_status: kbStatusDisplay(row, prevStatus),
      isMock: false,
      cached: true,
    }
  }

  const kb = getKapitalBankClient()
  const statusResult = await kb.getOrderStatus(kbOrderId, row.kb_session_id ?? '')
  const paymentStatus: PaymentStatus = mapKBStatus(statusResult.orderStatus)

  const updatePayload: {
    payment_status: PaymentStatus
    kb_status: string
    status?: OrderStatus
  } = {
    payment_status: paymentStatus,
    kb_status: statusResult.orderStatus,
  }

  if (paymentStatus === 'paid') {
    updatePayload.status = 'confirmed'
  }

  const { error: updateError } = await admin.from('orders').update(updatePayload).eq('id', row.id)

  if (updateError) {
    console.error('[verifyKapitalPaymentOrder] update error:', updateError)
    throw new Error(updateError.message)
  }

  const becamePaid = prevStatus !== 'paid' && paymentStatus === 'paid'

  if (becamePaid) {
    const { notifyDeliveryWebhook, parseMapsLinkFromNotes, parsePhoneFromNotes } = await import(
      '@/lib/notify-delivery'
    )
    const notes = row.notes ?? null
    void notifyDeliveryWebhook({
      event: 'order_in_delivery',
      order_id: row.id,
      address: row.address ?? '',
      notes,
      total_price: Number(row.total_price ?? 0),
      maps_link: parseMapsLinkFromNotes(notes),
      customer_phone: parsePhoneFromNotes(notes),
    })
  }

  return {
    type: 'success',
    orderId: row.id,
    payment_status: paymentStatus,
    kb_status: statusResult.orderStatus,
    isMock: statusResult.isMock,
    cached: false,
  }
}
