import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { rateLimitFromRequest } from '@/lib/rate-limit'

type LoggedOut = { loggedIn: false }

type LoggedIn = {
  loggedIn: true
  phone: string
  savedAddress: string
  savedAddressExtra: string
  name: string
  shipping_lat: number | null
  shipping_lng: number | null
}

export async function GET(request: NextRequest) {
  try {
    const allowed = await rateLimitFromRequest(request, 'user-delivery-profile')
    if (!allowed) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
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
      return NextResponse.json({ loggedIn: false } satisfies LoggedOut)
    }

    const meta = (user.user_metadata ?? {}) as {
      phone?: unknown
      shipping_address?: unknown
      shipping_address_extra?: unknown
      full_name?: unknown
      shipping_lat?: unknown
      shipping_lng?: unknown
    }

    function metaNumber(v: unknown): number | null {
      if (typeof v === 'number' && Number.isFinite(v)) return v
      if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v)
      return null
    }

    const { data: profile } = await supabase.from('users').select('name').eq('id', user.id).maybeSingle()

    const nameFromMeta =
      typeof meta.full_name === 'string' && meta.full_name.trim() ? meta.full_name.trim() : ''
    const nameFromProfile =
      profile && typeof profile === 'object' && 'name' in profile && typeof profile.name === 'string'
        ? profile.name.trim()
        : ''
    const displayName = nameFromMeta || nameFromProfile || user.email || ''

    const body: LoggedIn = {
      loggedIn: true,
      phone: typeof meta.phone === 'string' ? meta.phone : '',
      savedAddress: typeof meta.shipping_address === 'string' ? meta.shipping_address : '',
      savedAddressExtra:
        typeof meta.shipping_address_extra === 'string' ? meta.shipping_address_extra : '',
      name: displayName,
      shipping_lat: metaNumber(meta.shipping_lat),
      shipping_lng: metaNumber(meta.shipping_lng),
    }

    return NextResponse.json(body)
  } catch (e) {
    console.error('[user/delivery-profile] error:', e)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
