import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { ORDER_STATUSES, isOrderStatus } from '@/lib/order-status'
import { rateLimitAllow } from '@/lib/rate-limit'
import { captureException } from '@/lib/monitoring'
import { ROLES, normalizeDbRoleToRoleKey } from '@/config/roles'
import {
  notifyDeliveryWebhook,
  parseMapsLinkFromNotes,
  parsePhoneFromNotes,
} from '@/lib/notify-delivery'

const ALLOWED_UPDATE_STATUSES = new Set<string>(ORDER_STATUSES)

export async function POST(request: NextRequest) {
  const redirectUrl = new URL('/admin/orders', request.url)

  try {
    const formData = await request.formData()
    const id = (formData.get('id') as string)?.trim()
    const status = formData.get('status') as string

    if (!id || !status || !isOrderStatus(status) || !ALLOWED_UPDATE_STATUSES.has(status)) {
      redirectUrl.searchParams.set('toast', 'error')
      return NextResponse.redirect(redirectUrl)
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

    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      redirectUrl.searchParams.set('toast', 'forbidden')
      return NextResponse.redirect(redirectUrl)
    }

    if (!rateLimitAllow(`order-update:${user.id}`)) {
      redirectUrl.searchParams.set('toast', 'forbidden')
      return NextResponse.redirect(redirectUrl)
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    const roleKey = normalizeDbRoleToRoleKey(profile?.role)
    const perms = ROLES[roleKey].permissions

    if (!profile || !perms.includes('manage_orders')) {
      redirectUrl.searchParams.set('toast', 'forbidden')
      return NextResponse.redirect(redirectUrl)
    }

    const { data: orderRow } = await supabase
      .from('orders')
      .select('id, address, notes, total_price')
      .eq('id', id)
      .single()

    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) {
      captureException(error, { route: 'admin/orders/update', orderId: id })
      redirectUrl.searchParams.set('toast', 'error')
    } else {
      redirectUrl.searchParams.set('toast', 'success')
      if (status === 'in_delivery' && orderRow) {
        void notifyDeliveryWebhook({
          event: 'order_in_delivery',
          order_id: orderRow.id,
          address: orderRow.address ?? '',
          notes: orderRow.notes,
          total_price: Number(orderRow.total_price),
          maps_link: parseMapsLinkFromNotes(orderRow.notes),
          customer_phone: parsePhoneFromNotes(orderRow.notes),
        })
      }
    }
    return NextResponse.redirect(redirectUrl)
  } catch (e) {
    captureException(e, { route: 'admin/orders/update' })
    redirectUrl.searchParams.set('toast', 'error')
    return NextResponse.redirect(redirectUrl)
  }
}
