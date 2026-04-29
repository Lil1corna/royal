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
    }

    return NextResponse.json(body)
  } catch (e) {
    console.error('[user/delivery-profile] error:', e)
    return NextResponse.json({ error: 'Unexpected server error' }, { status: 500 })
  }
}
