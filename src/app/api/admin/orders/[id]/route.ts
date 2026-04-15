import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { csrfForbiddenResponse, verifyCsrf } from '@/lib/csrf'
import { ensureAuthorized } from '@/lib/ensure-authorized'
import { ORDER_STATUSES, type OrderStatus } from '@/lib/order-status'
import { parseMapsLinkFromNotes, parsePhoneFromNotes, notifyDeliveryWebhook } from '@/lib/notify-delivery'
import { rateLimitFromRequest } from '@/lib/rate-limit'

const STATUS_VALUES = ORDER_STATUSES as readonly [string, ...string[]]

const orderUpdateSchema = z.object({
  status: z.enum(STATUS_VALUES),
})

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const allowed = await rateLimitFromRequest(request, 'admin-order-update')
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    if (!(await verifyCsrf(request))) {
      return csrfForbiddenResponse()
    }

    const auth = await ensureAuthorized('manage_orders')
    if (!auth.ok) {
      return NextResponse.json(
        { error: auth.status === 401 ? 'Unauthorized' : auth.error || 'Forbidden' },
        { status: auth.status }
      )
    }

    const { id } = await context.params
    const body = orderUpdateSchema.safeParse(await request.json())
    if (!body.success) {
      return NextResponse.json({ error: 'Invalid payload', details: body.error.flatten() }, { status: 400 })
    }

    const { data: existingOrder, error: fetchError } = await auth.admin
      .from('orders')
      .select('id, status, address, notes, total_price')
      .eq('id', id)
      .single()

    if (fetchError || !existingOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const newStatus = body.data.status as OrderStatus

    const validTransitions: Record<string, OrderStatus[]> = {
      new: ['confirmed', 'cancelled'],
      confirmed: ['in_delivery', 'cancelled'],
      in_delivery: ['delivered'],
      delivered: [],
      cancelled: [],
    }

    const allowedTransitions = validTransitions[existingOrder.status] || []
    if (!allowedTransitions.includes(newStatus)) {
      return NextResponse.json(
        { error: `Cannot change status from "${existingOrder.status}" to "${newStatus}"` },
        { status: 409 }
      )
    }

    const { data: updatedOrder, error: updateError } = await auth.admin
      .from('orders')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single()

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 })
    }

    if (newStatus === 'in_delivery') {
      const mapsLink = parseMapsLinkFromNotes(existingOrder.notes)
      const customerPhone = parsePhoneFromNotes(existingOrder.notes)
      void notifyDeliveryWebhook({
        event: 'order_in_delivery',
        order_id: id,
        address: existingOrder.address,
        notes: existingOrder.notes,
        total_price: Number(existingOrder.total_price),
        maps_link: mapsLink,
        customer_phone: customerPhone,
      })
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : 'Unexpected error' },
      { status: 500 }
    )
  }
}
