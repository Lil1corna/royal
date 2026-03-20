import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { ORDER_STATUSES, isOrderStatus } from '@/lib/order-status'
import { rateLimitAllow } from '@/lib/rate-limit'
import { captureException } from '@/lib/monitoring'

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

    if (!profile || !['super_admin', 'manager'].includes(profile.role)) {
      redirectUrl.searchParams.set('toast', 'forbidden')
      return NextResponse.redirect(redirectUrl)
    }

    const { error } = await supabase.from('orders').update({ status }).eq('id', id)
    if (error) {
      captureException(error, { route: 'admin/orders/update', orderId: id })
      redirectUrl.searchParams.set('toast', 'error')
    } else {
      redirectUrl.searchParams.set('toast', 'success')
    }
    return NextResponse.redirect(redirectUrl)
  } catch (e) {
    captureException(e, { route: 'admin/orders/update' })
    redirectUrl.searchParams.set('toast', 'error')
    return NextResponse.redirect(redirectUrl)
  }
}
